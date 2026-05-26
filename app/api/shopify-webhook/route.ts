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

    // 2. Calcular la comisión (10% del valor de la orden)
    const commission = totalOrder * 0.10;

    // 3. Buscar al cliente en tu Supabase por su email y actualizar montos y estado
    const { data, error } = await supabase
      .from('customers')
      .update({
        purchase_amount: totalOrder,      // ✅ CORREGIDO: Ahora sí guarda los 20€ (o el total de la compra)
        commission_earned: commission,    // Guarda los 2€ de comisión
        commission_status: 'pending'      // ✅ CORRECTO: 'pending' en minúsculas activa "Offen" y el botón de pago en el Admin
      })
      .eq('email', customerEmail);

    if (error) {
      console.error('Error actualizando Supabase:', error);
      throw error;
    }

    return NextResponse.json({ success: true, message: 'Compra y comisión registradas con éxito', customer: customerEmail });
  } catch (err: any) {
    console.error('Error interno en el Webhook:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}