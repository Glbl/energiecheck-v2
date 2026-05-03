"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { QRCodeSVG } from 'qrcode.react';

// SOLUCIÓN ULTRA-SEGURA: Inicialización dentro del componente para asegurar lectura de variables
export default function LandingPage() {
  const [workerCode, setWorkerCode] = useState("04091981P0001");
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    // 1. Inicializar Supabase AQUÍ ADENTRO para asegurar que las variables de Vercel existan
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Faltan variables de entorno");
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. Capturar código
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code') || "04091981P0001";
    setWorkerCode(code);

    // 3. Ejecutar el registro
    const trackVisit = async () => {
      try {
        const { error } = await supabase
          .from('leads_tracking')
          .insert([{ 
            worker_code: code, 
            user_agent: navigator.userAgent 
          }]);
        
        if (error) throw error;
        console.log("¡DATOS REGISTRADOS EN SUPABASE!");
      } catch (err) {
        console.error("Error real de Supabase:", err);
      }
    };

    trackVisit();
  }, []);

  // ... resto de tu código (JSX)