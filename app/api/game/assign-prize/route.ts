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
      return NextResponse.json({ error: 'Teilnehmer nicht gefunden.' }, { status: 404 });
    }

    // 🎯 CONTROL DE PREMIO CONSUELO: Si saca 0, su cupón asignado será de 10€, pero activamos bandera de consuelo
    const esConsuelo = prizeWon === 0;
    const nivelPremioBuscado = esConsuelo ? 10 : prizeWon;
    let couponCode = null;

    // 2. Secuestramos un cupón único disponible de la base de datos
    if (nivelPremioBuscado > 0) {
      const { data: coupon, error: cError } = await supabase
        .from('prize_coupons')
        .select('coupon_code')
        .eq('prize_level', nivelPremioBuscado)
        .eq('is_used', false)
        .limit(1)
        .maybeSingle();

      if (cError || !coupon) {
        return NextResponse.json({ 
          error: `⚠️ ACHTUNG: Bei Supabase sind keine einzigartigen Gutscheine mehr für die Stufe verfügbar. €${nivelPremioBuscado}.` 
        }, { status: 400 });
      }

      couponCode = coupon.coupon_code;

      // Quemamos el código único en Supabase vinculándolo al correo del ganador
      await supabase
        .from('prize_coupons')
        .update({ 
          is_used: true, 
          assigned_to_email: participant.email, 
          used_at: new Date().toISOString() 
        })
        .eq('coupon_code', couponCode);
    }

    // 3. Actualizamos al participante guardando el premio real recibido en su historial (0, 10, 30 o 50)
    await supabase
      .from('game_participants')
      .update({ 
        prize_won: prizeWon, 
        assigned_coupon: couponCode, 
        status: 'completed' 
      })
      .eq('id', participantId);

    // 4. Construcción del Email Dinámico con tus Textos Exactos y Literales
    let emailSubject = '';
    let cuerpoMensajeHtml = '';

    if (esConsuelo) {
      // 📝 TEXTO FIJO EXPLICITO: Participa y obtiene 0, pero gana 10€ de consuelo
      emailSubject = `🎉 Vielen Dank für Ihre Teilnahme!`;
      cuerpoMensajeHtml = `
        <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 800; color: #1a202c; text-align: center;">
          🎉 Vielen Dank für Ihre Teilnahme!
        </h1>
        <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #4a5568; text-align: left;">
          Auch wenn Sie heute keinen Hauptgewinn erzielt haben, erhalten Sie von uns einen 10 € Trostpreis-Gutschein für Ihren nächsten Einkauf bei Energiecheck-24.
        </p>
        <p style="margin: 0 0 10px 0; font-size: 15px; line-height: 1.6; color: #4a5568; font-weight: bold; text-align: left;">
          Zusätzlich profitieren Sie von folgenden Vorteilen:
        </p>
        <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #2d3748; font-weight: bold; text-align: left;">
          10 € Trostpreis-Gutschein für Ihre nächste Bestellung
        </p>
        
        <div style="background-color: #fff9e6; border: 2px dashed #ffd600; border-radius: 12px; padding: 25px 20px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 13px; color: #4a5568; display: block; margin-bottom: 8px;">Hier ist Ihr 10 € Gutscheincode:</span>
          <div style="background-color: #ffffff; border: 1px solid #e2e8f0; padding: 12px; font-family: monospace; font-size: 22px; font-weight: bold; color: #df4432; letter-spacing: 2px; border-radius: 8px; display: inline-block; min-width: 220px;">
            ${couponCode}
          </div>
        </div>

        <p style="margin: 0 0 10px 0; font-size: 15px; line-height: 1.6; color: #4a5568; text-align: left;">
          Nutzen Sie diesen Gutscheincode bei Ihrer Bestellung und sichern Sie sich zusätzlich:
        </p>
        <ul style="margin: 0 0 24px 0; padding-left: 20px; font-size: 15px; line-height: 1.6; color: #4a5568; text-align: left;">
          <li>-Automatische Teilnahme an unserem Gewinnspiel</li>
          <li>-Gewinnchance auf Fußballtickets</li>
          <li>-Gewinnchance auf ein Original-Fußballtrikot</li>
          <li>-Zusätzlich einen 50 € EDEKA-Gutschein bei erfolgreicher Bestellung</li>
        </ul>
        <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #4a5568; text-align: left;">
          Lösen Sie Ihren Gutscheincode einfach bei Ihrer nächsten Bestellung auf unserer Website ein.
        </p>
        <p style="margin: 20px 0 0 0; font-size: 15px; font-weight: bold; color: #1a202c; text-align: left;">
          🍀 Vielen Dank für Ihre Teilnahme 
        </p>
      `;
    } else {
      // 📝 TEXTO DINÁMICO REPETITIVO: Ganadores legítimos de 10€, 30€ o 50€
      emailSubject = `Herzlichen Glückwunsch!`;
      cuerpoMensajeHtml = `
        <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 800; color: #1a202c; text-align: center;">
          Herzlichen Glückwunsch!
        </h1>
        <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #4a5568; text-align: left;">
          Sie haben heute bei unserem Gewinnspiel einen ${nivelPremioBuscado} € Gutschein gewonnen.
        </p>
        <p style="margin: 0 0 10px 0; font-size: 15px; line-height: 1.6; color: #4a5568; text-align: left;">
          Ihr persönlicher Gutscheincode für Ihren Gewinn lautet:
        </p>

        <div style="background-color: #fff9e6; border: 2px dashed #ffd600; border-radius: 12px; padding: 25px 20px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 13px; color: #4a5568; display: block; margin-bottom: 8px;">🎁Ihr Gutscheincode:</span>
          <div style="background-color: #ffffff; border: 1px solid #e2e8f0; padding: 12px; font-family: monospace; font-size: 22px; font-weight: bold; color: #df4432; letter-spacing: 2px; border-radius: 8px; display: inline-block; min-width: 220px;">
            ${couponCode}
          </div>
        </div>

        <p style="margin: 0 0 10px 0; font-size: 15px; line-height: 1.6; color: #4a5568; text-align: left;">
          Nutzen Sie Ihren Gutscheincode bei Ihrer nächsten Bestellung und profitieren Sie zusätzlich von folgenden Vorteilen:
        </p>
        <ul style="margin: 0 0 24px 0; padding-left: 20px; font-size: 15px; line-height: 1.6; color: #4a5568; text-align: left;">
          <li>-Automatische Teilnahme an unserem Gewinnspiel</li>
          <li>-Gewinnchance auf exklusive Fußballtickets</li>
          <li>-Gewinnchance auf ein Original-Fußballtrikot</li>
          <li>-Zusätzlich einen 50 € EDEKA-Gutschein bei erfolgreicher Bestellung</li>
        </ul>
        <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #4a5568; text-align: left;">
          Lösen Sie Ihren Gutscheincode einfach bei Ihrer nächsten Bestellung auf unserer Website ein.
        </p>
        <p style="margin: 20px 0 0 0; font-size: 15px; font-weight: bold; color: #1a202c; text-align: left;">
          🍀 Vielen Dank für Ihren Besuch!
        </p>
      `;
    }

    // Estructura de plantilla HTML Premium Estetizada Global
    const emailHtmlFinal = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${emailSubject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f7f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #eef2f6;">
          <tr>
            <td align="center" style="padding: 30px 20px; background-color: #000000;">
              <img src="https://hoigzuytnzlkypkruyom.supabase.co/storage/v1/object/public/assets/energicheck.png" alt="Energiecheck-24" width="180" style="display: block; border: 0;">
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px;">
              
              ${cuerpoMensajeHtml}

              <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin-top: 25px; margin-bottom: 30px;">
                <tr>
                  <td align="center" style="border-radius: 8px;" bgcolor="#000000">
                    <a href="https://energiecheck-24.myshopify.com" target="_blank" style="font-size: 14px; font-weight: bold; color: #ffffff; text-decoration: none; padding: 14px 30px; display: inline-block; border-radius: 8px;">
                      Gutschein einlösen ➔
                    </a>
                  </td>
                </tr>
              </table>

              <hr style="border: 0; border-top: 1px solid #edf2f7; margin-bottom: 20px;">

              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #718096; text-align: center; font-style: italic; font-weight: 500;">
                Hinweis: Bei PayPal-Zahlung wird der Gutscheinrabatt später gutgeschrieben.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 24px; background-color: #f7f9fc; border-top: 1px solid #edf2f7; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: bold; color: #1a202c;">Ihr Energiecheck-24 Team</p>
              <p style="margin: 0; font-size: 11px; color: #a0aec0;">© 2026 Energiecheck-24. Alle Rechte vorbehalten.</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Envío del Email definitivo con remitente corporativo oficial anti-spam
    await resend.emails.send({
      from: 'Energiecheck-24 Gewinnspiel <tarif@energiecheck-24.de>',
      to: [participant.email],
      subject: emailSubject,
      html: emailHtmlFinal,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}