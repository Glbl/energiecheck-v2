import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Inicializamos Supabase usando la clave secreta del servidor (Service Role) 
// para saltar restricciones y poder escribir con seguridad
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { fullName, email, phone } = await request.json();

    if (!fullName || !email) {
      return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400 });
    }

    // Insertamos al jugador en la cola con estado por defecto 'waiting'
    const { data, error } = await supabase
      .from('game_participants')
      .insert([{ full_name: fullName, email: email, phone: phone, status: 'waiting' }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, participantId: data.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}