import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY_2!);

const CAP = 100;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL!; // your email

export default async function handler(req: Request) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': 'https://energiecheck-24.myshopify.com',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  // GET — return current count
  if (req.method === 'GET') {
    const { count, error } = await supabase
      .from('mini_station_leads')
      .select('*', { count: 'exact', head: true });

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });

    return new Response(JSON.stringify({ count: count ?? 0 }), { status: 200, headers });
  }

  // POST — save lead
  if (req.method === 'POST') {
    const body = await req.json();
    const { name, email, preferred_time } = body;

    if (!name || !email || !preferred_time) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400, headers });
    }

    // Get current count
    const { count } = await supabase
      .from('mini_station_leads')
      .select('*', { count: 'exact', head: true });

    const isFreeOffer = (count ?? 0) < CAP;

    // Insert lead
    const { error: insertError } = await supabase
      .from('mini_station_leads')
      .insert({ name, email, preferred_time, is_free_offer: isFreeOffer });

    if (insertError) {
      // Handle duplicate email
      if (insertError.code === '23505') {
        return new Response(JSON.stringify({ error: 'Email already registered' }), { status: 409, headers });
      }
      return new Response(JSON.stringify({ error: insertError.message }), { status: 500, headers });
    }

    // Send email via Resend
    await resend.emails.send({
      from: 'Mini Station <tarif@energiecheck-24.de>', // replace with your verified domain
      to: NOTIFY_EMAIL,
      subject: `🚀 Neue Anfrage${isFreeOffer ? ' (Gratis-Angebot)' : ''} – ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #00C896;">Neue Mini Station Anfrage</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Name</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">E-Mail</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Kontaktzeit</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${preferred_time}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold;">Angebot</td>
              <td style="padding: 10px; color: ${isFreeOffer ? '#00C896' : '#888'};">
                ${isFreeOffer ? '✅ Gratis-Paket (€0 statt €3.899)' : '📩 Allgemeine Anfrage'}
              </td>
            </tr>
          </table>
          <p style="color: #888; font-size: 12px; margin-top: 20px;">
            Registrierung #${(count ?? 0) + 1} von ${CAP}
          </p>
        </div>
      `,
    });

    return new Response(JSON.stringify({ success: true, isFreeOffer }), { status: 200, headers });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
}