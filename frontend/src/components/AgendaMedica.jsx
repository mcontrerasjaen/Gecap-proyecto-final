import React, { useState } from 'react';

const AgendaMedica = ({ onLlamar, centroActivo }) => {
  const [pacientesDb] = useState(() => JSON.parse(localStorage.getItem('db_pacientes')) || []);
  const [citas, setCitas] = useState(() => JSON.parse(localStorage.getItem('citas_agenda')) || []);
  const [mostrarForm, setMostrarForm] = useState(false);

  // --- LÓGICA DE RIESGO (LA QUE YA TENÍAS) ---
  const calcularRiesgoNegocio = (paciente) => {
    if (!paciente.nombre) return { nivel: 'Bajo', color: 'bg-green-50 text-green-700', pct: '5%' };
    let score = 0;
    if (paciente.distancia > 15) score += 35;
    if (paciente.edad > 75 || paciente.edad < 6) score += 20;
    if (paciente.soporteFamiliar === false) score += 25;
    const faltasPrevias = Math.floor(Math.random() * 3);
    score += (faltasPrevias * 10);

    if (score >= 60) return { nivel: 'CRÍTICO', color: 'bg-red-600 text-white animate-pulse', pct: '85%' };
    if (score >= 40) return { nivel: 'ALTO', color: 'bg-orange-100 text-orange-700', pct: '60%' };
    if (score >= 20) return { nivel: 'MEDIO', color: 'bg-amber-50 text-amber-600', pct: '30%' };
    return { nivel: 'BAJO', color: 'bg-green-100 text-green-700', pct: '5%' };
  };

  // --- NUEVA FUNCIÓN DE SEGUIMIENTO ---
  const actualizarEstado = (id, nuevoEstado) => {
    const nuevasCitas = citas.map(c => 
      c.id === id ? { ...c, estado: nuevoEstado } : c
    );
    setCitas(nuevasCitas);
    localStorage.setItem('citas_agenda', JSON.stringify(nuevasCitas));
  };

  const agendarCita = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const nuevaCita = {
      id: Date.now(),
      hora: fd.get('hora'),
      paciente: fd.get('paciente'),
      motivo: fd.get('motivo'),
      estado: 'Pendiente' // Estado inicial
    };
    const nuevasCitas = [...citas, nuevaCita].sort((a, b) => a.hora.localeCompare(b.hora));
    setCitas(nuevasCitas);
    localStorage.setItem('citas_agenda', JSON.stringify(nuevasCitas));
    setMostrarForm(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10">
      
      {/* 1. KPIs DE GESTIÓN OPERATIVA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-xl border-b-4 border-blue-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Citas Hoy</p>
          <h3 className="text-4xl font-black text-slate-800">{citas.length}</h3>
          <p className="text-[10px] text-blue-600 font-bold mt-1 uppercase italic">{centroActivo?.nombre}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-xl border-b-4 border-red-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alerta No-Show</p>
          <h3 className="text-xl font-black text-red-600 mt-1 italic">Seguimiento Activo</h3>
        </div>
        <div className="md:col-span-2 bg-slate-900 p-6 rounded-[2rem] shadow-xl flex items-center justify-between">
          <div className="text-white">
            <p className="text-[10px] font-black opacity-40 uppercase tracking-widest font-mono">Workflow GECAP</p>
            <p className="text-xs italic text-blue-300">Gestione el flujo de pacientes en sala.</p>
          </div>
          <button 
            onClick={() => setMostrarForm(!mostrarForm)}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase hover:bg-blue-500 transition-all shadow-lg active:scale-95"
          >
            {mostrarForm ? 'Cerrar' : '✚ Nueva Cita'}
          </button>
        </div>
      </div>

      {/* 2. FORMULARIO DE CITA */}
      {mostrarForm && (
        <form onSubmit={agendarCita} className="bg-white p-8 rounded-[2.5rem] shadow-2xl border-2 border-blue-100 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top duration-300">
          <select name="paciente" className="p-4 bg-slate-50 border rounded-2xl outline-none" required>
            <option value="">Seleccionar Paciente...</option>
            {pacientesDb.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
          </select>
          <input name="hora" type="time" className="p-4 bg-slate-50 border rounded-2xl outline-none" required />
          <input name="motivo" placeholder="Motivo de consulta" className="p-4 bg-slate-50 border rounded-2xl outline-none" required />
          <button type="submit" className="md:col-span-3 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs">Confirmar Cita</button>
        </form>
      )}

      {/* 3. LISTADO CON SEGUIMIENTO (TIMELINE) */}
      <div className="space-y-4">
        {citas.map((cita) => {
          const pData = pacientesDb.find(p => p.nombre === cita.paciente) || {};
          const riesgo = calcularRiesgoNegocio(pData);
          const estado = cita.estado || 'Pendiente';

          return (
            <div key={cita.id} className={`group bg-white p-6 rounded-[2.5rem] shadow-md border-l-[12px] flex flex-col md:flex-row items-center gap-8 transition-all ${estado === 'Atendido' ? 'border-green-500 opacity-60' : 'border-blue-500'}`}>
              
              <div className="text-center border-r border-slate-100 pr-8">
                <span className="text-3xl font-black text-slate-800 tracking-tighter italic">{cita.hora}</span>
                <div className={`mt-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${estado === 'En Espera' ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
                  {estado}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-black text-slate-800 text-xl tracking-tighter uppercase italic">{cita.paciente}</h4>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${riesgo.color} shadow-sm`}>
                    Riesgo {riesgo.nivel}
                  </span>
                </div>
                <div className="flex gap-4 text-[10px] font-bold text-slate-400 italic">
                  <span>📍 {pData.distancia || '?'} km</span>
                  <span>⚕️ {cita.motivo}</span>
                </div>
              </div>

              {/* BOTONES DE ACCIÓN DINÁMICOS */}
              <div className="flex items-center gap-3">
                {estado === 'Pendiente' && (
                  <button onClick={() => actualizarEstado(cita.id, 'En Espera')} className="bg-amber-500 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase shadow-md hover:bg-amber-600 transition-all">
                    🏁 Recepcionar
                  </button>
                )}

                {estado === 'En Espera' && (
                  <button 
                    onClick={() => {
                      actualizarEstado(cita.id, 'En Consulta');
                      onLlamar(cita.paciente); // Abre el formulario HCE
                    }} 
                    className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-slate-900 transition-all"
                  >
                    🔔 Llamar
                  </button>
                )}

                {estado === 'En Consulta' && (
                  <button onClick={() => actualizarEstado(cita.id, 'Atendido')} className="bg-green-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase shadow-md hover:bg-green-700 transition-all">
                    ✅ Finalizar
                  </button>
                )}

                {estado === 'Atendido' && (
                  <span className="text-green-500 font-black text-[10px] uppercase">Completado</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgendaMedica;