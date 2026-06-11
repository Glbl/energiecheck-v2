import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET() {
  try {
    // 1. Traer todos los participantes que ya jugaron y completaron el proceso
    const { data: participants, error: pError } = await supabase
      .from('game_participants')
      .select('created_at, full_name, email, prize_won, assigned_coupon')
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (pError) throw pError;

    // 2. Traer el estado del inventario de cupones
    const { data: coupons, error: cError } = await supabase
      .from('prize_coupons')
      .select('prize_level, is_used');

    if (cError) throw cError;

    // 3. Procesamiento de métricas comerciales para José y Helen
    const totalPrizeAllocated = participants.reduce((sum, p) => sum + (p.prize_won || 0), 0);
    const totalWinners = participants.filter(p => p.prize_won > 0).length;
    const totalLosses = participants.filter(p => p.prize_won === 0).length;

    // Conteo de inventario disponible por nivel de premio
    const inventory = {
      prize30: { 
        used: coupons.filter(c => c.prize_level === 30 && c.is_used).length, 
        free: coupons.filter(c => c.prize_level === 30 && !c.is_used).length 
      },
      prize50: { 
        used: coupons.filter(c => c.prize_level === 50 && c.is_used).length, 
        free: coupons.filter(c => c.prize_level === 50 && !c.is_used).length 
      }
    };

    return NextResponse.json({
      summary: {
        totalPrizeAllocated,
        totalWinners,
        totalLosses,
        totalPlayers: participants.length
      },
      inventory,
      history: participants
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}