import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const FormularioHCE = ({ nombrePacientePredefinido, medicoActual, centroActivo }) => {
  const [paciente, setPaciente] = useState({
    nombre: nombrePacientePredefinido || 'Seleccione un paciente',
    cipa: '1234567890', dni: '12345678Z', nacimiento: '1985-05-20',
    telefono: '600123456', domicilio: 'Calle Mayor 10, Madrid'
  });

  useEffect(() => {
    if (nombrePacientePredefinido) {
      setPaciente(prev => ({ ...prev, nombre: nombrePacientePredefinido }));
    }
  }, [nombrePacientePredefinido]);

  const [clinica, setClinica] = useState({
    tas: '', tad: '', fc: '', temp: '', sato2: '', peso: '', talla: '', imc: '--',
    motivo: '', exploracion: '', diagnostico: '', evolucion: '',
    pruebas: '', tratamiento: '', recomendaciones: ''
  });

  const [historial, setHistorial] = useState(() => {
    const guardado = localStorage.getItem('historial_consultas');
    return guardado ? JSON.parse(guardado) : [];
  });

  useEffect(() => {
    if (clinica.peso && clinica.talla) {
      const tallaM = clinica.talla / 100;
      const res = (clinica.peso / (tallaM * tallaM)).toFixed(1);
      setClinica(prev => ({ ...prev, imc: res }));
    }
  }, [clinica.peso, clinica.talla]);

  const finalizar = async () => {
    const codigoPaciente = `GC-${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      const { data: pData } = await supabase
        .from('pacientes')
        .select('id, dni')
        .eq('nombre', paciente.nombre)
        .single();

      if (!pData) throw new Error("Paciente no encontrado en la base de datos maestro");

      const { error } = await supabase
        .from('informes_pacientes')
        .insert([{
          id_paciente: pData.id,
          codigo_acceso: codigoPaciente,
          contenido_clinico: {
            evolucion: clinica.evolucion,
            diagnostico: clinica.diagnostico,
            tratamiento: clinica.tratamiento,
            constantes: { tas: clinica.tas, tad: clinica.tad, imc: clinica.imc }
          }
        }]);

      if (error) throw error;

      const nuevaConsulta = {
        fecha: new Date().toLocaleString(),
        paciente: paciente.nombre,
        diagnostico: clinica.diagnostico || 'Pendiente',
        tension: `${clinica.tas}/${clinica.tad}`,
        imc: clinica.imc
      };

      const nuevoHistorial = [nuevaConsulta, ...historial];
      setHistorial(nuevoHistorial);
      localStorage.setItem('historial_consultas', JSON.stringify(nuevoHistorial));

      alert(`✅ CONSULTA FIRMADA.\n\nCódigo para el Paciente: ${codigoPaciente}\nDNI: ${pData.dni}`);
      
      setClinica({ tas: '', tad: '', fc: '', temp: '', sato2: '', peso: '', talla: '', imc: '--', motivo: '', exploracion: '', diagnostico: '', evolucion: '', pruebas: '', tratamiento: '', recomendaciones: '' });

    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const limpiarHistorial = () => {
    if (window.confirm("¿Desea eliminar el historial?")) {
      setHistorial([]);
      localStorage.removeItem('historial_consultas');
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8 animate-in fade-in duration-700">
      <section className="bg-white rounded-3xl shadow-xl border-l-8 border-blue-600 overflow-hidden">
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center px-8">
          <h3 className="font-black uppercase tracking-tighter italic text-sm">Identificación del Paciente</h3>
          <span className="text-xs font-mono bg-blue-800 px-2 py-1 rounded">ID: {paciente.cipa}</span>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div className="md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase">Nombre y Apellidos</label>
            <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" value={paciente.nombre} readOnly />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase">DNI/NIE</label>
            <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono" value={paciente.dni} readOnly />
          </div>
          <div className="md:col-span-1">
             <label className="text-[10px] font-black text-slate-400 uppercase">Sede</label>
             <div className="p-3 bg-blue-50 text-blue-700 rounded-xl font-bold text-xs uppercase">{centroActivo?.nombre}</div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 space-y-4">
            <h3 className="font-black text-slate-800 uppercase text-xs italic tracking-widest border-b pb-2">Evolución Clínica</h3>
            <textarea className="w-full p-4 bg-slate-50 border rounded-2xl h-32 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Motivo de consulta..." value={clinica.motivo} onChange={(e) => setClinica({ ...clinica, motivo: e.target.value })} />
            <textarea className="w-full p-4 bg-slate-50 border rounded-2xl h-32 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Evolución..." value={clinica.evolucion} onChange={(e) => setClinica({ ...clinica, evolucion: e.target.value })} />
          </section>

          <section className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 space-y-4">
            <h3 className="font-black text-slate-800 uppercase text-xs italic tracking-widest border-b pb-2">Tratamiento</h3>
            <textarea className="w-full p-4 bg-green-50 border border-green-100 rounded-2xl h-24 outline-none" placeholder="Receta médica..." value={clinica.tratamiento} onChange={(e) => setClinica({ ...clinica, tratamiento: e.target.value })} />
          </section>
        </div>

        <aside className="space-y-8">
          <section className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl space-y-6">
            <h3 className="font-black text-center text-blue-400 uppercase tracking-widest text-xs">Biometría</h3>
            <div className="grid grid-cols-2 gap-4">
              <input type="number" className="p-3 bg-slate-800 rounded-xl text-center font-bold" placeholder="Peso" value={clinica.peso} onChange={(e) => setClinica({ ...clinica, peso: e.target.value })} />
              <input type="number" className="p-3 bg-slate-800 rounded-xl text-center font-bold" placeholder="Talla" value={clinica.talla} onChange={(e) => setClinica({ ...clinica, talla: e.target.value })} />
              <div className="col-span-2 bg-blue-600 p-4 rounded-2xl text-center">
                <span className="text-[10px] block font-bold uppercase opacity-50">IMC</span>
                <span className="text-3xl font-black">{clinica.imc}</span>
              </div>
            </div>
            <button onClick={finalizar} className="w-full bg-blue-500 hover:bg-blue-400 py-4 rounded-2xl font-black shadow-xl uppercase text-xs">Finalizar y Firmar</button>
          </section>
        </aside>
      </div>

      <section className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 p-6 flex justify-between items-center border-b">
          <h3 className="font-black text-slate-700 uppercase text-xs tracking-widest">Historial de Sesión</h3>
          <button onClick={limpiarHistorial} className="text-[10px] font-black text-red-500 uppercase hover:underline">🗑️ Limpiar</button>
        </div>
        <div className="p-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-400 uppercase text-[9px] font-black border-b">
                <th className="p-4">Fecha</th>
                <th className="p-4">Paciente</th>
                <th className="p-4 text-center">IMC</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((item, index) => (
                <tr key={index} className="border-b last:border-none hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-500 font-mono text-[10px]">{item.fecha}</td>
                  <td className="p-4 font-bold text-slate-800">{item.paciente}</td>
                  <td className="p-4 text-center font-black text-blue-600">{item.imc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default FormularioHCE;