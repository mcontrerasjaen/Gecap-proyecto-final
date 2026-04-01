import React, { useState } from 'react';
import FormularioHCE from './components/FormularioHCE';
import AgendaMedica from './components/AgendaMedica';
import ReservasOnline from './components/ReservasOnline';
import RegistroPacientes from './components/RegistroPacientes';
import { LISTA_CENTROS } from './config/centros';


function App() {
   const [centroActivo, setCentroActivo] = useState(LISTA_CENTROS[0]); 
  // 1. Cargamos el perfil del médico desde la base de datos local (Permanente)
  const [medico, setMedico] = useState(() => JSON.parse(localStorage.getItem('medico_activo')));
  
  // 2. Estado de sesión (Temporal: se borra al cerrar la pestaña por seguridad LOPD)
  const [isLogged, setIsLogged] = useState(() => {
    return sessionStorage.getItem('gecap_session_valid') === 'true';
  });

  const [vistaActual, setVistaActual] = useState('agenda');
  const [pacienteActual, setPacienteActual] = useState(null);
  const [modoRegistro, setModoRegistro] = useState(false);

  const cambiarDeCuenta = () => {
  if (window.confirm("¿Deseas dar de alta un nuevo perfil médico? El perfil actual se borrará de este equipo.")) {
    localStorage.removeItem('medico_activo');
    setMedico(null);
    setModoRegistro(true); // Forzamos que aparezca el formulario de registro
  }
};

  // 3. Función de Autenticación Profesional
   const handleAuth = (e) => {
    e.preventDefault();
    const nombre = e.target.nombre?.value;
    const colegiado = e.target.colegiado?.value;
    const password = e.target.password.value;

    if (!medico || modoRegistro) {
      // REGISTRO DE NUEVO MÉDICO
      const datos = { nombre, colegiado, password };
      localStorage.setItem('medico_activo', JSON.stringify(datos));
      setMedico(datos);
      setModoRegistro(false);
      sessionStorage.setItem('gecap_session_valid', 'true');
      setIsLogged(true);
    } else {
      // LOGIN DE MÉDICO EXISTENTE
      if (password === medico.password) {
        sessionStorage.setItem('gecap_session_valid', 'true');
        setIsLogged(true);
      } else {
        alert("Contraseña incorrecta. Acceso denegado.");
      }
    }
  };

  const cerrarSesion = () => {
    sessionStorage.removeItem('gecap_session_valid');
    setIsLogged(false);
  };

  // A. PANTALLA DE LOGIN/REGISTRO
  if (!isLogged) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans">
        <form onSubmit={handleAuth} className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-sm w-full space-y-6 border-t-8 border-blue-600 animate-in zoom-in duration-500">
          <div className="text-center">
            <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-white text-3xl font-black shadow-lg italic">✚</div>
            <h2 className="text-2xl font-black text-slate-800 mt-4 tracking-tighter italic uppercase underline decoration-blue-500">GECAP Pro</h2>
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mt-1 italic">Software Médico de Gestión</p>
          </div>

          <div className="space-y-4">
            {(!medico || modoRegistro) ? (
              <>
                <input name="nombre" type="text" placeholder="Nombre Completo" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" required />
                <input name="colegiado" type="text" placeholder="Nº Colegiado" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" required />
              </>
            ) : (
              <div className="p-5 bg-blue-50 rounded-2xl border-2 border-blue-100 text-center shadow-inner">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Identidad Detectada</p>
                <p className="text-lg font-black text-slate-800 italic uppercase">Dr. {medico.nombre}</p>
              </div>
            )}
            <input name="password" type="password" placeholder="Contraseña Alfanumérica" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-mono shadow-sm" required />
          </div>

          <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95">
            {(!medico || modoRegistro) ? "Registrar Facultativo" : "Acceso Seguro"}
          </button>
          
          {medico && !modoRegistro && (
            <button type="button" onClick={cambiarDeCuenta} className="w-full text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors italic underline">
              ¿No eres tú? Cambiar de cuenta
            </button>
          )}
        </form>
      </div>
    );
  }

  // B. DASHBOARD PRINCIPAL
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <aside className="w-72 bg-slate-900 text-slate-300 flex flex-col p-6 shadow-2xl z-20">
        <div className="mb-6 p-2 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white text-2xl shadow-lg">✚</div>
          <h1 className="text-2xl font-black text-white tracking-tighter italic">GECAP</h1>
        </div>

        {/* --- SELECTOR DE SEDE (COMERCIALIZABLE) --- */}
        <div className="mb-8 px-2">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Sede Operativa</label>
          <select 
            value={centroActivo.id}
            onChange={(e) => setCentroActivo(LISTA_CENTROS.find(c => c.id === parseInt(e.target.value)))}
            className="w-full mt-1 bg-slate-800 border-none rounded-xl p-3 text-xs font-bold text-blue-400 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500 transition-all"
          >
            {LISTA_CENTROS.map(centro => (
              <option key={centro.id} value={centro.id}>📍 {centro.nombre}</option>
            ))}
          </select>
        </div>

        <nav className="flex-1 space-y-3">
          <button onClick={() => setVistaActual('agenda')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${vistaActual === 'agenda' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}>📅 Agenda</button>
          <button onClick={() => setVistaActual('pacientes')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${vistaActual === 'pacientes' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}>👥 Pacientes</button>
          <button onClick={() => setVistaActual('formulario')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${vistaActual === 'formulario' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}>📋 Consulta</button>
          <button onClick={() => setVistaActual('reservas')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${vistaActual === 'reservas' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}>🔗 Calendly</button>
        </nav>

        {/* INFO MÉDICO Y LOGOUT */}
        <div className="p-6 bg-slate-950/50 rounded-3xl border border-slate-800/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black">{medico?.nombre.charAt(0)}</div>
            <div className="overflow-hidden text-ellipsis">
              <p className="text-xs font-black text-white truncate italic uppercase">Dr. {medico?.nombre.split(' ')[0]}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Col: {medico?.colegiado}</p>
            </div>
          </div>
          <button onClick={cerrarSesion} className="w-full py-2 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-xl text-[9px] font-black uppercase transition-all tracking-widest">Cerrar Sesión</button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-10 bg-slate-50">
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* PASAMOS EL CENTRO ACTIVO A LOS COMPONENTES CLAVE */}
          {vistaActual === 'agenda' && (
            <AgendaMedica 
              centroActivo={centroActivo} 
              onLlamar={(p) => { setPacienteActual(p); setVistaActual('formulario'); }} 
            />
          )}
          
          {vistaActual === 'pacientes' && (
            <RegistroPacientes centroActivo={centroActivo} />
          )}
          
          {vistaActual === 'formulario' && (
            <FormularioHCE 
              nombrePacientePredefinido={pacienteActual} 
              medicoActual={medico} 
              centroActivo={centroActivo}
            />
          )}
          
          {vistaActual === 'reservas' && <ReservasOnline />}
        </div>
      </main>
    </div>
  );
}

export default App;