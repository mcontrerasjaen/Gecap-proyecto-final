import React, { useState, useEffect } from 'react';
import FormularioHCE from './components/FormularioHCE';
import AgendaMedica from './components/AgendaMedica';
import ReservasOnline from './components/ReservasOnline';
import RegistroPacientes from './components/RegistroPacientes';
import { LISTA_CENTROS } from './config/centros';
import { supabase } from './lib/supabaseClient';

function App() {
  const [centroActivo, setCentroActivo] = useState(LISTA_CENTROS[0]);
  const [medico, setMedico] = useState(() => JSON.parse(localStorage.getItem('medico_activo')));
  const [isLogged, setIsLogged] = useState(() => sessionStorage.getItem('gecap_session_valid') === 'true');
  const [vistaActual, setVistaActual] = useState('agenda');
  const [pacienteActual, setPacienteActual] = useState(null);
  const [modoRegistro, setModoRegistro] = useState(false);
  const [enEsperaCount, setEnEsperaCount] = useState(0);

  useEffect(() => {
  // 1. Verificar si ya hay una sesión activa al cargar (para el email de confirmación)
  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log("Sesión detectada vía Email Confirmation");
      setIsLogged(true);
      sessionStorage.setItem('gecap_session_valid', 'true');
      
      // Guardamos los datos del médico para la firma
      const userData = {
        nombre: session.user.user_metadata.nombre,
        colegiado: session.user.user_metadata.colegiado,
        email: session.user.email
      };
      setMedico(userData);
      localStorage.setItem('medico_activo', JSON.stringify(userData));
    }
  };

  checkSession();

  // 2. Escuchar cambios de estado (Login/Logout/Email Confirm)
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      setIsLogged(true);
      sessionStorage.setItem('gecap_session_valid', 'true');
    }
    if (event === 'SIGNED_OUT') {
      setIsLogged(false);
      sessionStorage.removeItem('gecap_session_valid');
    }
  });

  return () => subscription.unsubscribe();
}, []);
  // 1. EFECTO: CONTADOR EN TIEMPO REAL
  useEffect(() => {
  if (!isLogged || !medico) return;
    const obtenerConteo = async () => {
      const { count } = await supabase
        .from('citas')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'En Espera');
      setEnEsperaCount(count || 0);
    };
    obtenerConteo();
    const channel = supabase.channel('cambios-citas').on('postgres_changes', 
      { event: '*', schema: 'public', table: 'citas' }, () => obtenerConteo()).subscribe();
    return () => supabase.removeChannel(channel);
  }, [isLogged, vistaActual]);

  // 2. LÓGICA DE AUTENTICACIÓN
  const handleAuth = async (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim();
    const password = e.target.password.value;
    const nombre = e.target.nombre?.value?.trim();
    const colegiado = e.target.colegiado?.value?.trim();

    try {
      if (!medico || modoRegistro) {
        const { error } = await supabase.auth.signUp({
          email, password, options: { data: { nombre, colegiado } }
        });
        if (error) throw error;
        alert("Registro completado. Confirma tu email para entrar.");
        setModoRegistro(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setIsLogged(true);
        sessionStorage.setItem('gecap_session_valid', 'true');
      }
    } catch (error) {
      alert(`Fallo: ${error.message}`);
    }
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem('gecap_session_valid');
    setIsLogged(false);
  };

  const cambiarDeCuenta = () => {
    if (window.confirm("¿Cambiar de cuenta médico?")) {
      localStorage.removeItem('medico_activo');
      setMedico(null);
      setModoRegistro(true);
    }
  };

  if (!isLogged) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans">
        <form onSubmit={handleAuth} className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-sm w-full space-y-6 border-t-8 border-blue-600 animate-in zoom-in duration-500">
          <div className="text-center">
            <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-white text-3xl font-black shadow-lg italic">✚</div>
            <h2 className="text-2xl font-black text-slate-800 mt-4 tracking-tighter italic uppercase">GECAP Pro</h2>
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mt-1">Acceso Profesional JWT</p>
          </div>

          <div className="space-y-4">
            {(!medico || modoRegistro) ? (
              <>
                <input name="nombre" type="text" placeholder="Nombre Completo" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" required />
                <input name="colegiado" type="text" placeholder="Nº Colegiado" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" required />
                <input name="email" type="email" placeholder="Email Real" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" required />
              </>
            ) : (
              <div className="p-5 bg-blue-50 rounded-2xl border-2 border-blue-100 text-center shadow-inner">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Cuenta Detectada</p>
                <p className="text-lg font-black text-slate-800 italic uppercase">Dr. {medico.nombre}</p>
                <p className="text-[10px] text-slate-500 font-mono mt-1">{medico.email}</p>
                <input name="email" type="hidden" value={medico.email} /> 
              </div>
            )}
            <input name="password" type="password" placeholder="Contraseña Alfanumérica" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-mono shadow-sm" required />
          </div>

          <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95 text-xs">
            {(!medico || modoRegistro) ? "Registrar e Iniciar" : "Verificar Identidad"}
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

  // --- RENDERIZADO B: DASHBOARD PROFESIONAL ---
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <aside className="w-72 bg-slate-900 text-slate-300 flex flex-col p-6 shadow-2xl z-20">
        <div className="mb-6 p-2 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white text-2xl shadow-lg font-black">✚</div>
          <h1 className="text-2xl font-black text-white tracking-tighter italic">GECAP</h1>
        </div>

        {/* SELECTOR DE SEDE */}
        <div className="mb-8 px-2">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Sede Operativa</label>
          <select value={centroActivo.id} onChange={(e) => setCentroActivo(LISTA_CENTROS.find(c => c.id === parseInt(e.target.value)))} className="w-full mt-1 bg-slate-800 border-none rounded-xl p-3 text-xs font-bold text-blue-400 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500">
            {LISTA_CENTROS.map(c => <option key={c.id} value={c.id}>📍 {c.nombre}</option>)}
          </select>
        </div>

        <nav className="flex-1 space-y-3">
          {/* BOTÓN AGENDA CON CONTADOR REALTIME */}
          <button onClick={() => setVistaActual('agenda')} className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold transition-all ${vistaActual === 'agenda' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}>
            <div className="flex items-center gap-4"><span>📅</span> Agenda Diaria</div>
            {enEsperaCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg animate-bounce shadow-lg border border-red-400">{enEsperaCount}</span>
            )}
          </button>
          
          <button onClick={() => setVistaActual('pacientes')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${vistaActual === 'pacientes' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}><span>👥</span> Alta Pacientes</button>
          <button onClick={() => setVistaActual('formulario')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${vistaActual === 'formulario' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}><span>📋</span> Consulta</button>
          <button onClick={() => setVistaActual('reservas')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${vistaActual === 'reservas' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}><span>🔗</span> Reservas Online</button>
        </nav>

        {/* PERFIL FACULTATIVO */}
        <div className="p-6 bg-slate-950/50 rounded-3xl mt-4 border border-slate-800/50">
          <div className="flex items-center gap-3 mb-4 overflow-hidden text-ellipsis">
            <div className="w-10 h-10 shrink-0 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black">{medico?.nombre?.charAt(0)}</div>
            <div className="truncate">
              <p className="text-xs font-black text-white truncate italic uppercase">Dr. {medico?.nombre?.split(' ')[0]}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Col: {medico?.colegiado}</p>
            </div>
          </div>
          <button onClick={cerrarSesion} className="w-full py-2 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-xl text-[9px] font-black uppercase transition-all tracking-widest">Cerrar Sesión</button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-10 bg-slate-50">
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          {vistaActual === 'agenda' && <AgendaMedica centroActivo={centroActivo} onLlamar={(p) => { setPacienteActual(p); setVistaActual('formulario'); }} />}
          {vistaActual === 'pacientes' && <RegistroPacientes centroActivo={centroActivo} />}
          {vistaActual === 'formulario' && <FormularioHCE nombrePacientePredefinido={pacienteActual} medicoActual={medico} centroActivo={centroActivo} />}
          {vistaActual === 'reservas' && <ReservasOnline />}
        </div>
      </main>
    </div>
  );
}

export default App;