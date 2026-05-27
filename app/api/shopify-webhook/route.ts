import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';

export async function POST(req: Request) {
  try {
    // 1. Recibir los datos de la orden que envía Shopify
    const body = await req.json();
    
    const customerEmail = body.customer?.email;
    const totalOrder = Number(body.total_price || 0);

    console.log(`[Webhook Shopify] Orden recibida. Cliente: ${customerEmail}, Total: ${totalOrder} €`);

    if (!customerEmail) {
      return NextResponse.json({ error: 'No se encontró el email del cliente en la orden' }, { status: 400 });
    }

    // 2. Calcular la comisión (10% del valor total de la orden)
    const commission = totalOrder * 0.10;

    // 3. Buscar al cliente en Supabase para obtener el worker_id del trabajador asignado
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('worker_id')
      .eq('email', customerEmail)
      .maybeSingle();

    if (customerError) {
      console.error('Error al buscar el cliente en Supabase:', customerError);
      throw customerError;
    }

    if (!customerData) {
      console.warn(`[Webhook] El correo ${customerEmail} compró en Shopify pero no proviene de la landing de ningún trabajador.`);
      return NextResponse.json({ success: false, message: 'El cliente no está registrado en el sistema de afiliados.' });
    }

    // 4. Insertar una NUEVA fila independiente en la tabla 'orders' (Evita que se sobreescriba el historial)
    const { error: insertError } = await supabase
      .from('orders')
      .insert([{
        customer_email: customerEmail,
        worker_id: customerData.worker_id,
        purchase_amount: totalOrder,
        commission_earned: commission,
        commission_status: 'pending' // 'pending' equivale a "Offen" (Abierto/Pendiente)
      }]);

    if (insertError) {
      console.error('Error al insertar la nueva orden en Supabase:', insertError);
      throw insertError;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Orden e historial de comisión registrados con éxito en la tabla orders.',
      customer: customerEmail,
      worker: customerData.worker_id
    });

  } catch (err: any) {
    console.error('Error interno en el Webhook de Shopify:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}