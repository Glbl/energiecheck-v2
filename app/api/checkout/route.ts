import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia', 
});

export async function POST(req: Request) {
  try {
    const { cartItems, tipoPago } = await req.json();

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 });
    }

    // 🚀 DETECCIÓN DINÁMICA DE LA URL (Evita el error de Invalid URL)
    const origin = req.headers.get('origin') || 'https://energiecheck-v2.vercel.app';

    const lineItems = [];
    const esFinanciado = tipoPago === '12_meses' || tipoPago === '24_meses';
    const numeroCuotas = tipoPago === '12_meses' ? 12 : 24;

    for (const item of cartItems) {
      let stripeProductoId;

      try {
        const buscarProducto = await stripe.products.search({
          query: `name:'${item.title.replace(/'/g, "\\'")}' AND active:'true'`,
        });

        if (buscarProducto.data && buscarProducto.data.length > 0) {
          stripeProductoId = buscarProducto.data[0].id;
        } else {
          const nuevoProducto = await stripe.products.create({
            name: item.title,
            images: item.image ? [item.image] : [],
          });
          stripeProductoId = nuevoProducto.id;
        }
      } catch (searchError) {
        console.log("Aviso: Usando plan de contingencia para la creación de producto.");
        const nuevoProducto = await stripe.products.create({
          name: item.title,
          images: item.image ? [item.image] : [],
        });
        stripeProductoId = nuevoProducto.id;
      }

      const montoTotalCentavos = Math.round(item.price * 100);
      let precioId;

      if (esFinanciado) {
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

    // CONFIGURACIÓN DE SESIÓN REPARADA
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      line_items: lineItems,
      mode: esFinanciado ? 'subscription' : 'payment',
      // Usamos la variable origin que detecta automáticamente el HTTPS y tu dominio real
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      allow_promotion_codes: true,
    };

    if (esFinanciado) {
      sessionConfig.subscription_data = {
        description: `Financiamiento de compra a ${numeroCuotas} meses`,
        metadata: {
          limite_cuotas: numeroCuotas.toString(),
          es_financiamiento: 'true'
        }
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error('❌ Error en el motor de Checkout:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}