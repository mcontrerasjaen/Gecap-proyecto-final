import React, { useState, useEffect } from 'react';

const FormularioHCE = ({ nombrePacientePredefinido }) => {
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

  // Estado para almacenar el historial de consultas
  const [historial, setHistorial] = useState(() => {
    const guardado = localStorage.getItem('historial_consultas');
    return guardado ? JSON.parse(guardado) : [];
  });

  // Cálculo automático de IMC
  useEffect(() => {
    if (clinica.peso && clinica.talla) {
      const tallaM = clinica.talla / 100;
      const res = (clinica.peso / (tallaM * tallaM)).toFixed(1);
      setClinica(prev => ({ ...prev, imc: res }));
    }
  }, [clinica.peso, clinica.talla]);

  const finalizar = () => {
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

    alert("Historia Clínica Guardada y Firmada Digitalmente");

    // Limpiar campos para el siguiente paciente
    setClinica({ tas: '', tad: '', fc: '', temp: '', sato2: '', peso: '', talla: '', imc: '--', motivo: '', exploracion: '', diagnostico: '', evolucion: '', pruebas: '', tratamiento: '', recomendaciones: '' });
  };

  // FUNCIÓN 2: Borrar toda la tabla (Separada de la anterior)
  const limpiarHistorial = () => {
    if (window.confirm("¿Está seguro de que desea eliminar TODO el historial de consultas?")) {
      setHistorial([]);
      localStorage.removeItem('historial_consultas');
      alert("Historial borrado.");
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8 animate-in fade-in duration-700">

      {/* 1. IDENTIFICACIÓN DEL PACIENTE */}
      <section className="bg-white rounded-3xl shadow-xl border-l-8 border-blue-600 overflow-hidden">
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center px-8">
          <h3 className="font-black uppercase tracking-tighter italic text-sm">Identificación del Paciente</h3>
          <span className="text-xs font-mono bg-blue-800 px-2 py-1 rounded">ID: {paciente.cipa}</span>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div className="md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase">Nombre y Apellidos</label>
            <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" value={paciente.nombre} readOnly />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase">DNI/NIE</label>
            <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm" value={paciente.dni} readOnly />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase">Fecha Nacimiento</label>
            <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={paciente.nacimiento} readOnly />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase">CIPA / Tarjeta Sanitaria</label>
            <input type="text" className="w-full p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 font-bold" value={paciente.cipa} readOnly />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase">Teléfono</label>
            <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" value={paciente.telefono} onChange={(e) => setPaciente({ ...paciente, telefono: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase">Domicilio</label>
            <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" value={paciente.domicilio} onChange={(e) => setPaciente({ ...paciente, domicilio: e.target.value })} />
          </div>
        </div>
      </section>

      {/* 2. DATOS DE LA CONSULTA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest italic">Anamnesis y Evolución</h3>
              <span className="text-xs text-slate-400">{new Date().toLocaleString()}</span>
            </div>
            <div className="space-y-4">
              <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl h-24 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Motivo de consulta..."
                value={clinica.motivo} onChange={(e) => setClinica({ ...clinica, motivo: e.target.value })}></textarea>
              <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl h-24 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                placeholder="Evolución clínica..."
                value={clinica.evolucion} onChange={(e) => setClinica({ ...clinica, evolucion: e.target.value })}></textarea>
              <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl h-32 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Exploración física..."
                value={clinica.exploracion} onChange={(e) => setClinica({ ...clinica, exploracion: e.target.value })}></textarea>
            </div>
          </section>

          <section className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 space-y-6">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest italic border-b pb-2">Plan y Tratamientos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <textarea className="w-full p-3 bg-green-50 border border-green-100 rounded-xl h-32 text-sm outline-none" placeholder="Tratamiento..." value={clinica.tratamiento} onChange={(e) => setClinica({ ...clinica, tratamiento: e.target.value })}></textarea>
              <textarea className="w-full p-3 bg-orange-50 border border-orange-100 rounded-xl h-32 text-sm outline-none" placeholder="Pruebas..." value={clinica.pruebas} onChange={(e) => setClinica({ ...clinica, pruebas: e.target.value })}></textarea>
            </div>
          </section>
        </div>

        {/* 3. BARRA LATERAL (VITALES) */}
        <aside className="space-y-8">
          <section className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl space-y-6">
            <h3 className="font-black text-center text-blue-400 uppercase tracking-widest text-xs italic">Triaje y Biometría</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 flex justify-between bg-slate-800 p-3 rounded-2xl items-center border border-slate-700">
                <span className="text-[10px] font-bold opacity-50 uppercase">Tensión</span>
                <div className="flex items-center gap-1 font-black text-lg text-blue-300">
                  <input type="number" className="w-12 bg-transparent text-right outline-none" placeholder="120" value={clinica.tas} onChange={(e) => setClinica({ ...clinica, tas: e.target.value })} />
                  <span>/</span>
                  <input type="number" className="w-12 bg-transparent outline-none" placeholder="80" value={clinica.tad} onChange={(e) => setClinica({ ...clinica, tad: e.target.value })} />
                </div>
              </div>
              <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700">
                <label className="text-[8px] font-bold opacity-50 block uppercase">Peso (kg)</label>
                <input type="number" className="w-full bg-transparent text-xl font-black text-white outline-none" placeholder="70" value={clinica.peso} onChange={(e) => setClinica({ ...clinica, peso: e.target.value })} />
              </div>
              <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700">
                <label className="text-[8px] font-bold opacity-50 block uppercase">Talla (cm)</label>
                <input type="number" className="w-full bg-transparent text-xl font-black text-white outline-none" placeholder="175" value={clinica.talla} onChange={(e) => setClinica({ ...clinica, talla: e.target.value })} />
              </div>
              <div className="col-span-2 bg-blue-600 p-4 rounded-2xl text-center shadow-lg">
                <label className="text-[10px] font-black uppercase block mb-1 text-white">IMC CALCULADO</label>
                <span className="text-3xl font-black text-white">{clinica.imc}</span>
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 text-center space-y-4">
            <div className="border-b-2 border-dashed border-slate-200 pb-6 pt-4">
              <p className="text-xs italic text-slate-400 font-serif">Firma Digital del Profesional</p>
              <div className="mt-2 font-black text-blue-900 text-xl">DR. M. CONTRERAS</div>
              <p className="text-[10px] font-bold text-slate-500">Colegiado: 282845961</p>
            </div>
            <button onClick={finalizar} className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-all uppercase text-xs">
              Finalizar y Firmar
            </button>

          </section>
        </aside>
      </div>

      {/* 4. TABLA DE HISTORIAL (NUEVO) */}
      <section className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden mt-10">
        <div className="bg-slate-50 p-6 px-8 border-b flex justify-between items-center">
          <div>
            <h3 className="font-black text-slate-700 uppercase text-xs tracking-widest">Historial de Sesión</h3>
            <p className="text-[10px] text-slate-400 font-bold">REGISTROS GUARDADOS LOCALMENTE</p>
          </div>
          
          <button 
            onClick={limpiarHistorial}
            className="text-[10px] font-black text-red-500 hover:text-white hover:bg-red-500 border border-red-200 px-4 py-2 rounded-xl transition-all uppercase tracking-tighter"
          >
            🗑️ Vaciar Historial
          </button>
        </div>

        <div className="p-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-400 uppercase text-[9px] font-black border-b">
                <th className="p-4">Fecha</th>
                <th className="p-4">Paciente</th>
                <th className="p-4 text-center">Tensión</th>
                <th className="p-4 text-center">IMC</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((item, index) => (
                <tr key={index} className="border-b last:border-none hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-500 font-mono text-[10px]">{item.fecha}</td>
                  <td className="p-4 font-bold text-slate-800">{item.paciente}</td>
                  <td className="p-4 text-center font-black text-blue-600">{item.tension}</td>
                  <td className="p-4 text-center font-bold">{item.imc}</td>
                </tr>
              ))}
              {historial.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-slate-400 italic font-serif">
                    No hay registros guardados en esta sesión.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default FormularioHCE;