import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const PortalPaciente = () => {
  const [auth, setAuth] = useState({ dni: '', codigo: '' });
  const [informe, setInforme] = useState(null);
  const [buscando, setBuscando] = useState(false);

  const accederInforme = async (e) => {
    e.preventDefault();
    setBuscando(true);
    try {
      // 1. Buscamos el informe que coincida con el código secreto
      const { data, error } = await supabase
        .from('informes_pacientes')
        .select(`
          *,
          pacientes (nombre, dni)
        `)
        .eq('codigo_acceso', auth.codigo.toUpperCase().trim())
        .single();

      if (error || !data) throw new Error("Código de acceso no válido.");

      // 2. Verificamos que el DNI introducido coincida con el del paciente del informe
      if (data.pacientes.dni.toUpperCase() !== auth.dni.toUpperCase().trim()) {
        throw new Error("El DNI no coincide con el código de informe proporcionado.");
      }

      setInforme(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setBuscando(false);
    }
  };

  // VISTA DEL INFORME (Modo lectura/impresión)
  if (informe) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-10 font-sans">
        <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-[2rem] overflow-hidden border border-slate-200">
          <header className="bg-slate-900 p-8 text-white flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black italic tracking-tighter">GECAP HEALTH</h1>
              <p className="text-[10px] uppercase opacity-60 font-bold tracking-widest">Copia Auténtica de Historia Clínica</p>
            </div>
            <button onClick={() => window.print()} className="bg-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg">Imprimir PDF</button>
          </header>

          <div className="p-10 space-y-8">
            <section className="grid grid-cols-2 gap-8 border-b pb-8">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">Paciente</label>
                <p className="font-black text-slate-800 text-lg uppercase italic">{informe.pacientes.nombre}</p>
              </div>
              <div className="text-right">
                <label className="text-[10px] font-black text-slate-400 uppercase">Fecha Consulta</label>
                <p className="font-bold text-slate-600">{new Date(informe.fecha_consulta).toLocaleDateString()}</p>
              </div>
            </section>

            <section className="space-y-6">
              <div>
                <h3 className="text-blue-600 font-black text-xs uppercase mb-2 italic tracking-widest">Evolución y Diagnóstico</h3>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-700 leading-relaxed italic">
                  {informe.contenido_clinico.evolucion}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                  <h3 className="text-green-700 font-black text-[10px] uppercase mb-2">Tratamiento Prescrito</h3>
                  <p className="text-sm text-green-900 font-medium">{informe.contenido_clinico.tratamiento}</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                  <h3 className="text-blue-700 font-black text-[10px] uppercase mb-2">Constantes Vitales</h3>
                  <p className="text-xs font-bold text-blue-900">IMC: {informe.contenido_clinico.constantes.imc}</p>
                  <p className="text-xs font-bold text-blue-900">Tensión: {informe.contenido_clinico.constantes.tas}/{informe.contenido_clinico.constantes.tad}</p>
                </div>
              </div>
            </section>

            <footer className="pt-10 text-center border-t border-dashed border-slate-200">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Firmado Digitalmente por:</p>
              <p className="text-lg font-black text-slate-800 italic uppercase">Dr. {informe.contenido_clinico.medico}</p>
              <p className="text-[9px] text-slate-400 mt-4">Este documento tiene validez legal como extracto clínico oficial del centro {informe.contenido_clinico.centro}.</p>
            </footer>
          </div>
        </div>
        <button onClick={() => setInforme(null)} className="block mx-auto mt-8 text-[10px] font-black text-slate-400 uppercase hover:text-blue-600 transition-colors">← Volver al acceso</button>
      </div>
    );
  }

  // PANTALLA DE ACCESO PARA EL PACIENTE
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans">
      <form onSubmit={accederInforme} className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-sm w-full space-y-6 border-t-8 border-blue-600 animate-in zoom-in duration-500">
        <div className="text-center">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-white text-3xl font-black shadow-lg italic">✚</div>
          <h2 className="text-2xl font-black text-slate-800 mt-4 tracking-tighter italic uppercase">Portal Paciente</h2>
          <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mt-1">Acceso Seguro a su Historial</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Documento Identidad</label>
            <input 
              type="text" 
              placeholder="DNI / NIE" 
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold uppercase"
              required 
              onChange={(e) => setAuth({...auth, dni: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Código de Informe</label>
            <input 
              type="text" 
              placeholder="GC-0000" 
              className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-mono font-black text-blue-600 uppercase"
              required 
              onChange={(e) => setAuth({...auth, codigo: e.target.value})}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={buscando}
          className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95 text-xs disabled:opacity-50"
        >
          {buscando ? "Verificando..." : "Descargar mi Informe"}
        </button>
        <p className="text-center text-[9px] text-slate-400 italic">Protección de Datos Médicos Nivel 3</p>
      </form>
    </div>
  );
};

export default PortalPaciente;