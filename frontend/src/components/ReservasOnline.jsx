import React from 'react';
import { InlineWidget } from "react-calendly";

const ReservasOnline = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-700">
      <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl">
        <h2 className="text-3xl font-black tracking-tighter italic">Portal de Reservas Externas</h2>
        <p className="opacity-80 font-medium italic">Autogestión de citas para pacientes vía Calendly API</p>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-white">
        {/* IMPORTANTE: Usa esta URL de prueba para verificar que carga correctamente */}
        <InlineWidget 
          url="https://calendly.com" 
          styles={{
            height: '700px',
            minWidth: '320px'
          }}
        />
      </div>

      <div className="mt-8 flex justify-center pb-10">
        <button 
          onClick={() => window.open("https://calendly.com", "_blank")}
          className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all flex items-center gap-3 uppercase text-[10px] tracking-widest shadow-indigo-200"
        >
          <span>⚙️</span> Gestionar mi Panel de Calendly
        </button>
      </div>
    </div>
  );
};

export default ReservasOnline;