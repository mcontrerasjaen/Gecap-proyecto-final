import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AgendaMedica = ({ onLlamar, centroActivo }) => {
  const [pacientesDb, setPacientesDb] = useState([]);
  const [citas, setCitas] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [cargando, setCargando] = useState(true);

  // --- 1. CARGA INICIAL DESDE POSTGRESQL ---
  const cargarDatosSincronizados = async () => {
    try {
      setCargando(true);
      // Obtenemos el médico actual para filtrar
      const { data: { user } } = await supabase.auth.getUser();

      // Cargar Pacientes para el selector
      const { data: pData } = await supabase.from('pacientes').select('*');
      setPacientesDb(pData || []);

      // Cargar Citas reales de la nube
      const { data: cData, error } = await supabase
        .from('citas')
        .select('*')
        .order('hora', { ascending: true });

      if (error) throw error;
      setCitas(cData || []);
    } catch (error) {
      console.error("Error de sincronización:", error.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosSincronizados();
  }, []);

  // --- 2. LÓGICA DE RIESGO BASADA EN DATOS REALES DE LA NUBE ---
  const calcularRiesgoNegocio = (pacienteNombre) => {
    const p = pacientesDb.find(item => item.nombre === pacienteNombre);
    if (!p) return { nivel: 'Bajo', color: 'bg-green-50 text-green-700' };
    
    let score = 0;
    if (p.distancia > 15) score += 35;
    if (p.edad > 75 || p.edad < 6) score += 20;
    if (p.soporte_familiar === false) score += 25;

    if (score >= 60) return { nivel: 'CRÍTICO', color: 'bg-red-600 text-white animate-pulse' };
    if (score >= 40) return { nivel: 'ALTO', color: 'bg-orange-100 text-orange-700' };
    return { nivel: 'BAJO', color: 'bg-green-100 text-green-700' };
  };

  // --- 3. AGENDAR CITA EN LA NUBE ---
  const agendarCita = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('citas').insert([{
        id_medico: user.id,
        paciente_nombre: fd.get('paciente'),
        hora: fd.get('hora'),
        motivo: fd.get('motivo'),
        estado: 'Pendiente'
      }]);

      if (error) throw error;
      setMostrarForm(false);
      cargarDatosSincronizados(); // Recarga desde PostgreSQL
    } catch (error) {
      alert("Error al agendar: " + error.message);
    }
  };

  // --- 4. ACTUALIZAR ESTADO (SEGUIMIENTO CLOUD) ---
  const actualizarEstado = async (id, nuevoEstado) => {
    const { error } = await supabase
      .from('citas')
      .update({ estado: nuevoEstado })
      .eq('id', id);
    
    if (!error) cargarDatosSincronizados();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10">
      
      {/* KPIs DE GESTIÓN OPERATIVA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-xl border-b-4 border-blue-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Citas Hoy</p>
          <h3 className="text-4xl font-black text-slate-800">{citas.length}</h3>
          <p className="text-[10px] text-blue-600 font-bold mt-1 uppercase italic">{centroActivo?.nombre}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-xl border-b-4 border-red-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado Sistema</p>
          <h3 className="text-xl font-black text-red-600 mt-1 italic">{cargando ? 'Sincronizando...' : 'Cloud Activo'}</h3>
        </div>
        <div className="md:col-span-2 bg-slate-900 p-6 rounded-[2rem] shadow-xl flex items-center justify-between">
          <div className="text-white">
            <p className="text-[10px] font-black opacity-40 uppercase tracking-widest font-mono">GECAP Pro Workflow</p>
            <p className="text-xs italic text-blue-300">Gestión de flujo en tiempo real.</p>
          </div>
          <button onClick={() => setMostrarForm(!mostrarForm)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase hover:bg-blue-500 transition-all shadow-lg active:scale-95">
            {mostrarForm ? 'Cerrar' : '✚ Nueva Cita Cloud'}
          </button>
        </div>
      </div>

      {/* FORMULARIO DE CITA */}
      {mostrarForm && (
        <form onSubmit={agendarCita} className="bg-white p-8 rounded-[2.5rem] shadow-2xl border-2 border-blue-100 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top duration-300">
          <select name="paciente" className="p-4 bg-slate-50 border rounded-2xl outline-none font-bold" required>
            <option value="">Seleccionar Paciente...</option>
            {pacientesDb.map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
          </select>
          <input name="hora" type="time" className="p-4 bg-slate-50 border rounded-2xl outline-none" required />
          <input name="motivo" placeholder="Motivo de consulta" className="p-4 bg-slate-50 border rounded-2xl outline-none" required />
          <button type="submit" className="md:col-span-3 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs">Guardar en PostgreSQL</button>
        </form>
      )}

      {/* LISTADO CON SEGUIMIENTO */}
      <div className="space-y-4">
        {citas.map((cita) => {
          const riesgo = calcularRiesgoNegocio(cita.paciente_nombre);
          const estado = cita.estado || 'Pendiente';

          return (
            <div key={cita.id} className={`group bg-white p-6 rounded-[2.5rem] shadow-md border-l-[12px] flex flex-col md:flex-row items-center gap-8 transition-all ${estado === 'Atendido' ? 'border-green-500 opacity-60' : 'border-blue-500'}`}>
              <div className="text-center border-r border-slate-100 pr-8">
                <span className="text-3xl font-black text-slate-800 tracking-tighter italic">{cita.hora.slice(0,5)}</span>
                <div className={`mt-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${estado === 'En Espera' ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
                  {estado}
                </div>
              </div>
              
              <div className="flex-1">
                <h4 className="font-black text-slate-800 text-xl tracking-tighter uppercase italic">{cita.paciente_nombre}</h4>
                <div className="flex gap-3 mt-1">
                   <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${riesgo.color}`}>Riesgo {riesgo.nivel}</span>
                   <span className="text-[10px] font-bold text-slate-400 italic">Motivo: {cita.motivo}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {estado === 'Pendiente' && (
                  <button onClick={() => actualizarEstado(cita.id, 'En Espera')} className="bg-amber-500 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase shadow-md hover:bg-amber-600 transition-all">🏁 Recepcionar</button>
                )}
                {estado === 'En Espera' && (
                  <button onClick={() => { actualizarEstado(cita.id, 'En Consulta'); onLlamar(cita.paciente_nombre); }} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-slate-900 transition-all">🔔 Llamar</button>
                )}
                {estado === 'En Consulta' && (
                  <button onClick={() => actualizarEstado(cita.id, 'Atendido')} className="bg-green-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase shadow-md hover:bg-green-700 transition-all">✅ Finalizar</button>
                )}
                {estado === 'Atendido' && <span className="text-green-500 font-black text-[10px] uppercase">Paciente Despachado</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgendaMedica;