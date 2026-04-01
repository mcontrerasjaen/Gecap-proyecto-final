import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Asegúrate de que la ruta sea correcta

const RegistroPacientes = ({ centroActivo }) => {
  const [lista, setLista] = useState([]);
  const [cargando, setCargando] = useState(true);

  // --- 1. CARGAR PACIENTES DESDE POSTGRESQL ---
  const cargarPacientes = async () => {
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLista(data || []);
    } catch (error) {
      console.error("Error al cargar:", error.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPacientes();
  }, []);

  // --- 2. ALTA DE PACIENTE EN POSTGRESQL ---
  const altaPaciente = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const cpPaciente = fd.get('cp');
    const cpCentro = centroActivo.cp;

    // Lógica de distancia automática (mantenemos tu lógica pro)
    const calcularDistanciaKM = (cpP, cpC) => {
      if (!cpP || !cpC) return 5;
      if (cpP.substring(0, 2) !== cpC.substring(0, 2)) return 45; 
      const diff = Math.abs(parseInt(cpP) - parseInt(cpC));
      return diff === 0 ? 2 : (diff < 10 ? 7 : 20);
    };

    const dist = calcularDistanciaKM(cpPaciente, cpCentro);

    try {
      // Obtenemos el ID del médico logueado (JWT)
      const { data: { user } } = await supabase.auth.getUser();

      const nuevoPaciente = {
        id_medico: user.id, // Relación obligatoria para seguridad RLS
        nombre: fd.get('nombre'),
        dni: fd.get('dni'),
        edad: parseInt(fd.get('edad')),
        domicilio: fd.get('domicilio'),
        poblacion: fd.get('poblacion'),
        cp: cpPaciente,
        distancia: dist,
        gravedad: parseInt(fd.get('gravedad')),
        soporte_familiar: fd.get('soporte') === 'si'
      };

      const { error } = await supabase
        .from('pacientes')
        .insert([nuevoPaciente]);

      if (error) throw error;

      alert(`Expediente de ${nuevoPaciente.nombre} sincronizado en la nube.`);
      e.target.reset();
      cargarPacientes(); // Recarga la tabla con los datos de la nube

    } catch (error) {
      alert("Error de red: " + error.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* FORMULARIO DE ALTA */}
      <section className="bg-white p-10 rounded-[3rem] shadow-2xl border-t-[12px] border-green-600">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic underline decoration-green-400">Expediente Maestro Cloud</h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Sede activa: {centroActivo.nombre}</p>
          </div>
        </header>

        <form onSubmit={altaPaciente} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nombre y Apellidos</label>
            <input name="nombre" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-green-500 outline-none font-bold" required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">DNI / NIE</label>
            <input name="dni" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-mono" required />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Edad</label>
            <input name="edad" type="number" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Ciudad / Población</label>
            <input name="poblacion" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-slate-700" required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Código Postal</label>
            <input name="cp" className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl outline-none font-black text-blue-700" required />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Dirección de Residencia</label>
            <input name="domicilio" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Soporte Social</label>
            <select name="soporte" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold">
              <option value="si">Con Apoyo Familiar</option>
              <option value="no">Sin Apoyo (Riesgo)</option>
            </select>
          </div>

          <div className="md:col-span-3 space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Prioridad Clínica</label>
            <select name="gravedad" className="w-full p-4 bg-red-50 border-2 border-red-100 rounded-2xl outline-none text-red-700 font-black">
              <option value="1">Prioridad 1 - Leve</option>
              <option value="5">Prioridad 5 - Crónico</option>
              <option value="10">Prioridad 10 - Crítico</option>
            </select>
          </div>

          <button type="submit" className="md:col-span-3 bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-xl mt-4">
            💾 Sincronizar con Base de Datos Cloud
          </button>
        </form>
      </section>

      {/* TABLA DE PACIENTES CLOUD */}
      <section className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-slate-100">
        <div className="p-8 bg-slate-50 border-b flex justify-between items-center px-10">
          <h3 className="font-black text-slate-700 text-xs uppercase tracking-widest italic">Expedientes en PostgreSQL ({lista.length})</h3>
          {cargando && <span className="text-[10px] font-bold text-blue-600 animate-pulse">Sincronizando...</span>}
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-left text-sm border-separate border-spacing-y-3">
            <thead>
              <tr className="text-slate-400 uppercase text-[9px] font-black px-6">
                <th className="px-8 text-center">Paciente</th>
                <th>Ciudad</th>
                <th>Distancia</th>
                <th className="text-center">Riesgo</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(p => (
                <tr key={p.id} className="bg-slate-50 hover:bg-blue-50 transition-colors shadow-sm">
                  <td className="px-8 py-5 rounded-l-3xl">
                    <p className="font-black text-slate-800 uppercase italic tracking-tighter">{p.nombre}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{p.dni}</p>
                  </td>
                  <td className="py-5">
                    <p className="font-bold text-slate-600 text-[11px] uppercase">{p.poblacion}</p>
                  </td>
                  <td className="py-5 font-black text-blue-600 italic">{p.distancia} KM</td>
                  <td className="py-5 rounded-r-3xl text-center">
                    <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase ${p.soporte_familiar ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700 animate-pulse'}`}>
                      {p.soporte_familiar ? 'Seguro' : 'Riesgo Social'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default RegistroPacientes;