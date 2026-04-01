import React, { useState } from 'react';

const RegistroPacientes = ({ centroActivo }) => {
  const [lista, setLista] = useState(() => JSON.parse(localStorage.getItem('db_pacientes')) || []);

  const altaPaciente = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const cpPaciente = fd.get('cp');
    const cpCentro = centroActivo.cp;

    // Lógica de distancia automática por CP
    const calcularDistanciaKM = (cpP, cpC) => {
      if (!cpP || !cpC) return 5;
      if (cpP.substring(0, 2) !== cpC.substring(0, 2)) return 45; 
      const diff = Math.abs(parseInt(cpP) - parseInt(cpC));
      return diff === 0 ? 2 : (diff < 10 ? 7 : 20);
    };

    const nuevo = {
      id: Date.now(),
      nombre: fd.get('nombre'),
      dni: fd.get('dni'),
      edad: parseInt(fd.get('edad')),
      domicilio: fd.get('domicilio'),
      poblacion: fd.get('poblacion'), // NUEVO CAMPO
      cp: cpPaciente,
      distancia: calcularDistanciaKM(cpPaciente, cpCentro),
      gravedad: parseInt(fd.get('gravedad')),
      soporteFamiliar: fd.get('soporte') === 'si',
      estadoRegistro: 'Activo'
    };

    const nuevaLista = [nuevo, ...lista];
    setLista(nuevaLista);
    localStorage.setItem('db_pacientes', JSON.stringify(nuevaLista));
    e.target.reset();
    alert(`Expediente de ${nuevo.nombre} creado con éxito en ${nuevo.poblacion}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* FORMULARIO DE ALTA PROFESIONAL */}
      <section className="bg-white p-10 rounded-[3rem] shadow-2xl border-t-[12px] border-green-600">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">Registro de Nuevo Expediente</h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Sede vinculada: {centroActivo.nombre}</p>
          </div>
          <div className="bg-green-50 text-green-700 px-4 py-2 rounded-2xl text-[10px] font-black uppercase border border-green-100">Alta Permanente</div>
        </header>

        <form onSubmit={altaPaciente} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nombre y Apellidos del Paciente</label>
            <input name="nombre" placeholder="Ej: Maria García López" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-green-500 outline-none font-bold" required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">DNI / NIE / Pasaporte</label>
            <input name="dni" placeholder="00000000X" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-mono" required />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Edad</label>
            <input name="edad" type="number" placeholder="Ej: 45" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" required />
          </div>
          <div className="md:col-span-2 space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Dirección (Calle, número, piso)</label>
            <input name="domicilio" placeholder="Calle Ejemplo, 12, 2ºB" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" required />
          </div>

          {/* LOCALIZACIÓN DETALLADA */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Ciudad / Población</label>
            <input name="poblacion" placeholder="Ej: Madrid o Getafe" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-slate-700" required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Código Postal</label>
            <input name="cp" placeholder="28000" className="w-full p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl outline-none font-black text-blue-700" required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Soporte Social</label>
            <select name="soporte" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold">
              <option value="si">Con Apoyo Familiar</option>
              <option value="no">Sin Apoyo (Vulnerable)</option>
            </select>
          </div>

          <div className="md:col-span-3 space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nivel de Gravedad Crónica</label>
            <select name="gravedad" className="w-full p-4 bg-red-50 border-2 border-red-100 rounded-2xl outline-none text-red-700 font-black">
              <option value="1">Prioridad 1: Seguimiento Leve</option>
              <option value="5">Prioridad 5: Paciente Crónico</option>
              <option value="10">Prioridad 10: Complejidad Extrema</option>
            </select>
          </div>

          <button type="submit" className="md:col-span-3 bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-green-600 transition-all shadow-xl active:scale-[0.98] mt-4 flex items-center justify-center gap-3">
            <span>💾</span> Confirmar Alta en Sistema Pro
          </button>
        </form>
      </section>

      {/* TABLA DE PACIENTES */}
      <section className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-slate-100">
        <div className="p-8 bg-slate-50 border-b flex justify-between items-center">
          <h3 className="font-black text-slate-700 text-xs uppercase tracking-widest italic">Base de Datos de Pacientes ({lista.length})</h3>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-left text-sm border-separate border-spacing-y-3">
            <thead>
              <tr className="text-slate-400 uppercase text-[9px] font-black px-6">
                <th className="px-8">Nombre y DNI</th>
                <th>Localización</th>
                <th>Distancia</th>
                <th className="text-center">Estatus</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(p => (
                <tr key={p.id} className="bg-slate-50 hover:bg-blue-50 transition-colors shadow-sm group">
                  <td className="px-8 py-5 rounded-l-3xl">
                    <p className="font-black text-slate-800 uppercase italic tracking-tighter">{p.nombre}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{p.dni}</p>
                  </td>
                  <td className="py-5">
                    <p className="font-bold text-slate-600 text-[11px]">{p.poblacion}</p>
                    <p className="text-[10px] text-slate-400 italic">{p.domicilio}</p>
                  </td>
                  <td className="py-5 font-black text-blue-600 italic">{p.distancia} KM</td>
                  <td className="py-5 rounded-r-3xl text-center">
                    <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase ${p.soporteFamiliar ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700 animate-pulse'}`}>
                      {p.soporteFamiliar ? 'Seguro' : 'Riesgo Social'}
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