"use client";
import React from 'react';
import { ArrowLeft, TrendingUp, Users, Award } from 'lucide-react';
import Link from 'next/link';

export default function BusinessPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12 font-sans">
      <Link href="/" className="inline-flex items-center text-orange-500 hover:text-orange-400 mb-8 transition-colors">
        <ArrowLeft className="mr-2" size={20} /> Zurück zur Promotion
      </Link>

      <header className="mb-12">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
          Vertriebspartner <span className="text-orange-500">Programm 2026</span>
        </h1>
        <p className="text-gray-400">Estructura de comisiones y bonos de equipo para socios oficiales.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Nivel 1 */}
        <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] hover:border-orange-500/50 transition-all">
          <div className="flex items-center mb-6">
            <Users className="text-orange-500 mr-3" />
            <h2 className="text-xl font-bold uppercase tracking-wider">Empfehlungsgeber</h2>
          </div>
          <p className="text-5xl font-black mb-8 italic">175€ <span className="text-sm font-normal text-gray-400 uppercase">Max. Prämie</span></p>
          <ul className="space-y-4">
            <li className="flex justify-between border-b border-white/5 pb-2"><span>Basis-Station</span> <span className="font-bold text-orange-500">100€</span></li>
            <li className="flex justify-between border-b border-white/5 pb-2"><span>Mini-Station</span> <span className="font-bold text-orange-500">50€</span></li>
            <li className="flex justify-between"><span>Tank-Station</span> <span className="font-bold text-orange-500">25€</span></li>
          </ul>
        </div>

        {/* Nivel 2 */}
        <div className="bg-gradient-to-br from-purple-900/20 to-transparent border border-purple-500/30 p-8 rounded-[2rem] hover:border-purple-500 transition-all">
          <div className="flex items-center mb-6">
            <TrendingUp className="text-purple-500 mr-3" />
            <h2 className="text-xl font-bold uppercase tracking-wider text-purple-400">Vertriebspartner</h2>
          </div>
          <p className="text-5xl font-black mb-8 italic text-purple-400">300€ <span className="text-sm font-normal text-gray-400 uppercase">Provision</span></p>
          <ul className="space-y-4">
            <li className="flex justify-between border-b border-purple-500/10 pb-2"><span>Basis-Station</span> <span className="font-bold">200€</span></li>
            <li className="flex justify-between border-b border-purple-500/10 pb-2"><span>Mini-Station</span> <span className="font-bold">50€</span></li>
            <li className="flex justify-between"><span>Tank-Station</span> <span className="font-bold">50€</span></li>
          </ul>
        </div>
      </div>

      {/* Bonos Especiales */}
      <section className="mt-12 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 text-center">
        <Award className="mx-auto mb-4 text-green-400" size={48} />
        <h3 className="text-2xl font-black mb-8 italic uppercase">Umsatz-Beteiligung (Team 4-6 Pers.)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-black/40 rounded-2xl border border-white/5">
            <p className="text-gray-500 text-xs uppercase mb-2">Ab 150/Monat</p>
            <p className="text-3xl font-black text-white">5.000€</p>
          </div>
          <div className="p-6 bg-black/40 rounded-2xl border border-white/5">
            <p className="text-gray-500 text-xs uppercase mb-2">Ab 300/Monat</p>
            <p className="text-3xl font-black text-white">12.000€</p>
          </div>
          <div className="p-6 bg-black/40 rounded-2xl border border-white/5 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
            <p className="text-gray-500 text-xs uppercase mb-2">Ab 500/Monat</p>
            <p className="text-3xl font-black text-green-400">15.000€</p>
          </div>
        </div>
      </section>
    </div>
  );
}