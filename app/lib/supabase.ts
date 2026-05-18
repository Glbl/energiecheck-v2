import { createClient } from '@supabase/supabase-js'

// ✅ CORREGIDO: Ahora Next.js expondrá correctamente las llaves al frontend en Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("🚨 Error crítico: ¡Las variables de entorno de Supabase no están llegando al frontend!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)