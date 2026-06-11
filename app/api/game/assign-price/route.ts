import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { participantId, prizeWon } = await request.json();

    // 1. Obtener datos del participante en espera
    const { data: participant, error: pError } = await supabase
      .from('game_participants')
      .select('full_name, email')
      .eq('id', participantId)
      .single();

    if (pError || !participant) {
      return NextResponse.json({ error: 'Participante no encontrado.' }, { status: 404 });
    }

    let couponCode = null;

    // 2. Si ganó dinero, secuestramos un cupón disponible de la base de datos
    if (prizeWon > 0) {
      const { data: coupon, error: cError } = await supabase
        .from('prize_coupons')
        .select('coupon_code')
        .eq('prize_level', prizeWon)
        .eq('is_used', false)
        .limit(1)
        .maybeSingle();

      if (cError || !coupon) {
        return NextResponse.json({ error: `No quedan cupones libres para el nivel de €${prizeWon}` }, { status: 400 });
      }

      couponCode = coupon.coupon_code;

      // Marcamos el cupón como quemado inmediatamente
      await supabase
        .from('prize_coupons')
        .update({ is_used: true, assigned_to_email: participant.email, used_at: new Date().toISOString() })
        .eq('coupon_code', couponCode);
    }

    // 3. Actualizamos al participante para sacarlo de la cola activa
    await supabase
      .from('game_participants')
      .update({ prize_won: prizeWon, assigned_coupon: couponCode, status: 'completed' })
      .eq('id', participantId);

    // 4. Construcción del Email con Resend
    let emailSubject = prizeWon > 0 ? `Glückwunsch! Du hast einen €${prizeWon} Gutschein gewonnen!` : `Vielen Dank für deine Teilnahme!`;
    let emailHtml = prizeWon > 0 
      ? `<h2>Hallo ${participant.full_name},</h2><p>Du hast €${prizeWon} gewonnen! Dein Code lautet: <strong>${couponCode}</strong></p>`
      : `<h2>Hallo ${participant.full_name},</h2><p>Danke fürs Mitspielen! Schade, dieses Mal hast du nichts gewonnen.</p>`;

    await resend.emails.send({
      from: 'Energiecheck-24 Gewinnspiel <gewinnspiel@energiecheck-24.de>',
      to: [participant.email],
      subject: emailSubject,
      html: emailHtml,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}