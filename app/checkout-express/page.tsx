'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface CartItem {
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

// Sub-componente interno para envolver la lectura de parámetros de la URL de forma segura en Next.js
function CheckoutExpressContent() {
  const searchParams = useSearchParams();
  const [carritoProductos, setCarritoProductos] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1. Leemos el parámetro 'cart' de la URL (viene en formato string encriptado Base64 por seguridad)
    const datosCartBase64 = searchParams.get('cart');
    
    if (datosCartBase64) {
      try {
        // Decodificamos el string Base64 y lo convertimos de vuelta en un arreglo de objetos JSON
        const stringDecodificado = atob(datosCartBase64);
        const productosDecodificados: CartItem[] = JSON.parse(stringDecodificado);
        setCarritoProductos(productosDecodificados);
      } catch (error) {
        console.error("Error al decodificar el carrito de Shopify:", error);
      }
    }
  }, [searchParams]);

  const totalCarrito = carritoProductos.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  async function iniciarMultiCheckout(tipoPagoElegido: 'directo' | '12_meses' | '24_meses') {
    if (carritoProductos.length === 0) {
      alert("Der Warenkorb ist leer / El carrito está vacío");
      return;
    }

    setLoading(true);
    try {
      const respuesta = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems: carritoProductos,
          tipoPago: tipoPagoElegido
        })
      });

      const datos = await respuesta.json();

      if (datos.url) {
        window.location.href = datos.url;
      } else {
        alert('Error: No se pudo generar la pasarela de pagos.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error al conectar con Stripe API:', error);
      setLoading(false);
    }
  }

  return (
    <div className="bg-neutral-900 p-6 rounded-2xl max-w-md w-full shadow-2xl border border-neutral-800">
      <h2 className="text-xl font-bold mb-4 text-center">Zusammenfassung (Resumen de Compra)</h2>
      
      {carritoProductos.length === 0 ? (
        <p className="text-center text-neutral-400 py-4">Keine Produkte gefunden / No hay productos</p>
      ) : (
        <>
          <div className="divide-y divide-neutral-800 mb-6">
            {carritoProductos.map((item, index) => (
              <div key={index} className="py-3 flex justify-between items-center text-sm">
                <div>
                  <p className="font-semibold text-neutral-200">{item.title}</p>
                  <p className="text-neutral-400">Menge (Cant): {item.quantity} x €{item.price.toFixed(2)}</p>
                </div>
                <p className="font-bold text-neutral-100">€{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            
            <div className="pt-4 flex justify-between items-center font-black text-lg text-emerald-400">
              <span>Gesamtsumme (Total):</span>
              <span>€{totalCarrito.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <button
              disabled={loading}
              onClick={() => iniciarMultiCheckout('directo')}
              className="w-full bg-white text-black py-3 rounded-xl font-bold hover:bg-neutral-200 transition disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Mit Stripe / PayPal bezahlen'}
            </button>
            
            <button
              disabled={loading}
              onClick={() => iniciarMultiCheckout('12_meses')}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition disabled:opacity-50"
            >
              In 12 Teilzahlungen (€{(totalCarrito / 12).toFixed(2)}/Monat)
            </button>

            <button
              disabled={loading}
              onClick={() => iniciarMultiCheckout('24_meses')}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
            >
              In 24 Teilzahlungen (€{(totalCarrito / 24).toFixed(2)}/Monat)
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Componente principal que exporta la página protegida con una envoltura Suspense requerida por Next.js
export default function CheckoutExpressPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <Suspense fallback={<p className="text-white">Laden... / Cargando resumen...</p>}>
        <CheckoutExpressContent />
      </Suspense>
    </div>
  );
}