import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Forzamos una inicialización segura usando la variable de entorno de Vercel.
// ! indica a TypeScript que estamos seguros de que la variable existirá en producción.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia', // Versión exacta requerida por tu SDK actual
});

export async function POST(req: Request) {
  try {
    // Recibimos los productos empaquetados desde el frontend y la modalidad de pago elegido
    // tipoPago puede ser: 'directo', '12_meses' o '24_meses'
    const { cartItems, tipoPago } = await req.json();

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 });
    }

    const lineItems = [];
    const esFinanciado = tipoPago === '12_meses' || tipoPago === '24_meses';
    const numeroCuotas = tipoPago === '12_meses' ? 12 : 24;

    // Procesamos dinámicamente cada producto enviado desde el carrito de Shopify
    for (const item of cartItems) {
      let stripeProductoId;

      try {
        // 1. Buscamos si el producto ya existe en la base de datos de Stripe usando su título
        const buscarProducto = await stripe.products.search({
          query: `name:'${item.title.replace(/'/g, "\\'")}' AND active:'true'`,
        });

        if (buscarProducto.data && buscarProducto.data.length > 0) {
          stripeProductoId = buscarProducto.data[0].id;
        } else {
          // Si el producto es nuevo, lo creamos de inmediato con los datos de Shopify
          const nuevoProducto = await stripe.products.create({
            name: item.title,
            images: item.image ? [item.image] : [],
          });
          stripeProductoId = nuevoProducto.id;
        }
      } catch (searchError) {
        console.log("Aviso: Falló la búsqueda indexada, usando plan de contingencia.");
        // Si la cuenta de Stripe no tiene habilitada la indexación de búsqueda rápida,
        // creamos el producto directamente para no detener la experiencia de compra del cliente.
        const nuevoProducto = await stripe.products.create({
          name: item.title,
          images: item.image ? [item.image] : [],
        });
        stripeProductoId = nuevoProducto.id;
      }

      // 2. Calculamos los montos matemáticos en centavos (Euros * 100)
      const montoTotalCentavos = Math.round(item.price * 100);
      let precioId;

      if (esFinanciado) {
        // MODALIDAD FRACCIONADA: Calculamos la cuota mensual exacta
        const montoMensualCentavos = Math.round(montoTotalCentavos / numeroCuotas);
        
        const precioRecurrente = await stripe.prices.create({
          product: stripeProductoId,
          unit_amount: montoMensualCentavos,
          currency: 'eur',
          recurring: { 
            interval: 'month', 
            interval_count: 1 
          },
          nickname: `Financiamiento ${numeroCuotas} meses - ${item.title}`,
        });
        precioId = precioRecurrente.id;
      } else {
        // MODALIDAD PAGO ÚNICO: Creamos un precio estándar
        const precioUnico = await stripe.prices.create({
          product: stripeProductoId,
          unit_amount: montoTotalCentavos,
          currency: 'eur',
          nickname: `Pago Único - ${item.title}`,
        });
        precioId = precioUnico.id;
      }

      // Empaquetamos el artículo en la lista global de la compra
      lineItems.push({
        price: precioId,
        quantity: item.quantity,
      });
    }

    // 3. Configuramos los parámetros globales de la sesión oficiales de Stripe Checkout
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      line_items: lineItems,
      mode: esFinanciado ? 'subscription' : 'payment', // 'subscription' activa el comportamiento recurrente
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      
      // Habilitamos la casilla para que los 450 cupones funcionen de forma nativa
      allow_promotion_codes: true,

      // NOTA CRÍTICA DE CORRECCIÓN: Eliminamos 'payment_method_types'.
      // Ahora Stripe administra los métodos de pago (Tarjetas, PayPal, Klarna, SEPA) 
      // de forma automática basándose en lo que José activó en su propio Dashboard.
    };

    // 4. Si el pago es financiado, le inyectamos los metadatos para controlar el límite de cuotas
    if (esFinanciado) {
      sessionConfig.subscription_data = {
        description: `Financiamiento de compra a ${numeroCuotas} meses`,
        metadata: {
          limite_cuotas: numeroCuotas.toString(),
          es_financiamiento: 'true'
        }
      };
    }

    // 5. Ordenamos a Stripe crear la pasarela web con los parámetros limpios
    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Retornamos la URL segura para que el Frontend redirija de inmediato al cliente alemán
    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    // Captura de errores avanzada para evitar que el servidor devuelva un 500 genérico vacío
    console.error('❌ Error en el motor de Checkout:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}