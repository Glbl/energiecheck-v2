'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

interface CartItem {
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

function CheckoutExpressContent() {
  const searchParams = useSearchParams();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  // 1. Decodificar el carrito que Shopify envía en Base64 mediante la URL
  useEffect(() => {
    const cartParam = searchParams.get('cart');
    if (cartParam) {
      try {
        // Decodificamos el string Base64 de forma segura
        const decodedCart = JSON.parse(atob(cartParam));
        setCartItems(decodedCart);
      } catch (error) {
        console.error('Fehler beim Dekodieren der Shopify-Karte:', error);
      }
    }
  }, [searchParams]);

  // 2. Cálculo matemático de subtotales para la interfaz visual
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // 3. Procesamiento del envío hacia la API interna /api/checkout
  const handleCheckout = async (tipoPago: 'Stelle' | '12_Monate' | '24_Monate') => {
    setLoading(tipoPago);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItems,
          tipoPago,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Beim Vorgang wurde ein Fehler behobent');
      }

      // Si el backend nos devuelve la URL de Stripe Checkout de forma exitosa, redirigimos
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error('❌ Error en el flujo de Checkout:', err.message);
      alert('Error: Sie können die Pasarela de pagos nicht generieren.');
    } finally {
      setLoading(null);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <p className="text-gray-400 text-lg mb-4">Laden des Warenkorbs...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-zinc-900/50 backdrop-blur-md rounded-2xl p-6 border border-zinc-800 shadow-2xl">
        
        {/* Encabezado del Resumen */}
        <h2 className="text-xl font-bold text-center mb-6 border-b border-zinc-800 pb-4">
          Zusammenfassung
        </h2>

        {/* Listado dinámico de productos en el carrito */}
        <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-1">
          {cartItems.map((item, index) => (
            <div key={index} className="flex justify-between items-start text-sm border-b border-zinc-800/50 pb-3 last:border-0">
              <div>
                <p className="font-medium text-zinc-200">{item.title}</p>
                <p className="text-zinc-500 text-xs mt-0.5">
                  Menge (Cant): {item.quantity} x €{item.price.toFixed(2)}
                </p>
              </div>
              <p className="font-semibold text-zinc-300">
                €{(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* Bloque del Subtotal General */}
        <div className="flex justify-between items-center border-t border-zinc-800 pt-4 mb-8">
          <span className="text-base font-bold text-zinc-400">Gesamtsumme:</span>
          <span className="text-2xl font-black text-emerald-400">€{subtotal.toFixed(2)}</span>
        </div>

        {/* Panel de Control de Botones de Acción Bancaria */}
        <div className="space-y-3">
          
          {/* BOTÓN 1: PAGO AL CONTADO */}
          <button
            onClick={() => handleCheckout('Stelle')}
            disabled={loading !== null}
            className="w-full py-4 px-4 bg-white hover:bg-zinc-100 text-black font-bold rounded-xl transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm"
          >
            {loading === 'Stelle' ? 'Procesando...' : 'Mit Stripe / PayPal bezahlen'}
          </button>

          {/* BOTÓN 2: FINANCIAMIENTO 12 MESES */}
          <button
            onClick={() => handleCheckout('12_Monate')}
            disabled={loading !== null}
            className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md"
          >
            {loading === '12_Monate' 
              ? 'Ablauf...' 
              : `In 12 Teilzahlungen (€${(subtotal / 12).toFixed(2)}/Monat)`}
          </button>

          {/* BOTÓN 3: FINANCIAMIENTO 24 MESES */}
          <button
            onClick={() => handleCheckout('24_Monate')}
            disabled={loading !== null}
            className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md"
          >
            {loading === '24_meses' 
              ? 'Ablauf...' 
              : `In 24 Teilzahlungen (€${(subtotal / 24).toFixed(2)}/Monat)`}
          </button>

        </div>

      </div>
    </div>
  );
}

// Next.js requiere envolver en Suspense las páginas que consumen useSearchParams() en build de producción
export default function CheckoutExpressPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-zinc-400">Wird geladen...</p>
      </div>
    }>
      <CheckoutExpressContent />
    </Suspense>
  );
}