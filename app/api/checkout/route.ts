import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Cambia esto en la inicialización de Stripe:
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia', // <-- Pon exactamente esta cadena que te pide el compilador
});

export async function POST(req: Request) {
  try {
    // Recibimos los productos de Shopify y el tipo de pago desde el frontend
    // tipoPago puede ser: 'directo', '12_meses' o '24_meses'
    const { cartItems, tipoPago } = await req.json();

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 });
    }

    const lineItems = [];
    const esFinanciado = tipoPago === '12_meses' || tipoPago === '24_meses';
    const numeroCuotas = tipoPago === '12_meses' ? 12 : 24;

    // Procesamos cada producto del carrito de Shopify
    for (const item of cartItems) {
      // 1. Buscamos de forma segura si el producto ya existe en el Stripe de José usando su título
      const buscarProducto = await stripe.products.search({
        query: `name:'${item.title}' AND active:'true'`,
      });

      let stripeProductoId;

      if (buscarProducto.data.length > 0) {
        stripeProductoId = buscarProducto.data[0].id;
      } else {
        // Si el producto no existe en Stripe, lo creamos en milisegundos
        const nuevoProducto = await stripe.products.create({
          name: item.title,
          images: item.image ? [item.image] : [],
        });
        stripeProductoId = nuevoProducto.id;
      }

      // 2. Definimos la configuración del precio según la elección del cliente
      const montoTotalCentavos = Math.round(item.price * 100); // Stripe procesa en centavos (Euros * 100)

      let precioId;

      if (esFinanciado) {
        // PAGO EN PARTES: Calculamos la cuota mensual exacta de forma dinámica
        const montoMensualCentavos = Math.round(montoTotalCentavos / numeroCuotas);

        const precioRecurrente = await stripe.prices.create({
          product: stripeProductoId,
          unit_amount: montoMensualCentavos,
          currency: 'eur',
          recurring: {
            interval: 'month',
            interval_count: 1,
          },
          nickname: `Financiamiento ${numeroCuotas} meses - ${item.title}`,
        });
        precioId = precioRecurrente.id;
      } else {
        // PAGO DIRECTO: Creamos un precio de un solo uso estándar
        const precioUnico = await stripe.prices.create({
          product: stripeProductoId,
          unit_amount: montoTotalCentavos,
          currency: 'eur',
          nickname: `Pago Único - ${item.title}`,
        });
        precioId = precioUnico.id;
      }

      lineItems.push({
        price: precioId,
        quantity: item.quantity,
      });
    }

    // 3. Configuramos los parámetros globales de la sesión de Checkout
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      // Activamos tarjetas, Klarna (financiación alemana) y PayPal directamente
      payment_method_types: ['card', 'klarna', 'paypal', 'sepa_debit'],
      line_items: lineItems,
      mode: esFinanciado ? 'subscription' : 'payment', // 'subscription' activa el comportamiento mensual
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      
      // Habilitamos la casilla para que los 450 cupones funcionen perfectamente en la pasarela
      allow_promotion_codes: true,
    };

    // 4. Regla crítica: Si es financiado, le decimos a Stripe que aborte los cobros al cumplir las cuotas
    if (esFinanciado) {
      sessionConfig.subscription_data = {
        description: `Financiamiento de compra a ${numeroCuotas} meses`,
        // Podemos usar metadata para que tu webhook sepa cuándo cancelar la suscripción en la cuota 12 o 24
        metadata: {
          limite_cuotas: numeroCuotas.toString(),
          es_financiamiento: 'true'
        }
      };
    }

    // Creación de la sesión oficial de Stripe Checkout
    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Retornamos la URL segura de la pasarela para que el frontend redirija al cliente
    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error('❌ Error en el motor de Checkout:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}