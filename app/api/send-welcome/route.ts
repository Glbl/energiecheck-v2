import { Resend } from 'resend';
import { NextResponse } from 'next/server';

// Usamos la variable de entorno para mayor seguridad
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, fullName, username, password } = await req.json();

    const data = await resend.emails.send({
      from: 'EnergieCheck <j.lorusso@energiecheck-24.de>', 
      to: [email],
      bcc: ['j.lorusso@energiecheck-24.de'], // ✅ Copia oculta automática para José
      subject: 'Willkommen bei EnergieCheck!',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
          <h1 style="color: #d4e137; background: #000; padding: 20px; text-align: center;">EnergieCheck</h1>
          <h2>Hallo ${fullName},</h2>
          <p>Dein Mitarbeiter-Account wurde erfolgreich erstellt.</p>
          <div style="background: #f4f4f4; padding: 20px; border-radius: 10px;">
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Passwort:</strong> ${password}</p>
          </div>
          <p style="margin-top: 20px;">Du kannst dich hier einloggen: <a href="https://energiecheck-v2.vercel.app/login">Mitarbeiter Portal</a></p>
        </div>
      `
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}