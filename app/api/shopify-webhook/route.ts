import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';

export async function POST(req: Request) {
  try {
    // 1. Recibir los datos que envía Shopify de la orden
    const body = await req.json();
    
    // Shopify envía el email del cliente y el total pagado
    const customerEmail = body.customer?.email;
    const totalOrder = Number(body.total_price || 0);

    console.log(`Webhook recibido para el cliente: ${customerEmail}, Total: ${totalOrder}`);

    if (!customerEmail) {
      return NextResponse.json({ error: 'No se encontró el email del cliente en la orden' }, { status: 400 });
    }

    // 2. Calcular la comisión (Por ejemplo, el 10% del valor de la orden)
    // Puedes cambiar el 0.10 por el porcentaje real que manejas con José
    const commission = totalOrder * 0.10;

    // 3. Buscar al cliente en tu Supabase por su email y actualizar la comisión
    const { data, error } = await supabase
      .from('customers')
      .update({
        commission_earned: commission,
        commission_status: 'Calculated' // O el estado inicial que prefieras (ej: 'Paid')
      })
      .eq('email', customerEmail);

    if (error) {
      console.error('Error actualizando Supabase:', error);
      throw error;
    }

    return NextResponse.json({ success: true, message: 'Comisión registrada con éxito', customer: customerEmail });
  } catch (err: any) {
    console.error('Error interno en el Webhook:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}