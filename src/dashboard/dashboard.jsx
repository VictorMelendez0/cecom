import React, { useState, useEffect } from 'react';
import { Ambulance, Activity, AlertTriangle, LogOut, ChartNoAxesCombined, Settings, 
  User, Moon, Sun, Clock, Siren, Hourglass, CalendarDays, CalendarClock, 
  Building,  Hospital, CircleDollarSign, HeartHandshake, TicketCheck,
  Menu, X, Clipboard} from 'lucide-react';
import DataBridge from '../DataBridge'; 
import { useNavigate } from 'react-router-dom';

const ESTADOS_MAPA = {
  'EN_SERVICIO': { label: 'Activo', color: 'text-green-400 dark:text-emerald-500', bg: 'bg-emerald-500', pulse: 'animate-pulse' },
  'EN_PROCESO': { label: 'Activo', color: 'text-green-400 dark:text-emerald-500', bg: 'bg-emerald-500', pulse: 'animate-pulse' },
  'FINALIZADO': { label: 'Finalizado', color: 'text-red-400 dark:text-red-600', bg: 'bg-red-500', pulse: '' },
  'NUEVO':  { label: 'Pendiente', color: 'text-amber-500', bg: 'bg-amber-500', pulse: '' },
}

const NavItem = ({ icon: Icon, label, color, darkMode, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 w-full p-2.5 rounded-xl transition-all duration-300 group cursor-pointer
        ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:bg-gray-50'}`}
      style={{ '--nav-color': color }}
    >
      <div className="p-1.5 rounded-lg transition-colors duration-300 group-hover:bg-[var(--nav-color)]/10">
        <Icon 
          className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110" 
          style={{ color: color }} 
        />
      </div>
      <span className="truncate whitespace-nowrap text-sm font-medium">
        {label}
      </span>
    </button>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme === 'dark') return true;
    if (savedTheme === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  const[hora, setHora] = useState(new Date().toLocaleTimeString());
  const[fecha, setFecha] =useState(new Date().toLocaleDateString('es-MX', {weekday:'long', year:'numeric', month:'long', day: 'numeric'}));
  const[db, setDb] = useState(null);
  const[cargando, setCargando] = useState(true);
  const[sidebarOpen, setSidebarOpen] = useState(false);
  const [serviciosHoy, setServiciosHoy] = useState([]);
  const setTheme = (isDark) => {
    localStorage.setItem('app-theme', isDark ? 'dark' : 'light');
    setDarkMode(isDark);
  };
  const toggleTheme = () => setTheme(!darkMode);
  const handleNavigation = (ruta) => {
    navigate(ruta); 
    setSidebarOpen(false);
  };
  const exportarCSV = () => {
      if(serviciosHoy.length === 0) return;

      const encabezados = ["Folio,Modulo,Paciente,Origen,Destino,Unidad,Hora_Inicio,Hora_Final,Estado\n"];
      const filas = serviciosHoy.map((servicio, index) => {
        return[
          `#${index +1}`,
          servicio.tipo,
          `"${servicio.paciente || servicio.paciente_nombre || ''}"`,
          `"${servicio.origen || servicio.hospital_origen || ''}"`,
          `"${servicio.destino || servicio.hospital_destino || ''}"`,
          servicio.unidad_clave || 'Asignar',
          servicio.h_inicio ? new Date(servicio.h_inicio).toLocaleTimeString('es-MX', {hour: '2-digit', minute: '2-digit', hour12: false}) : '--:--',
          servicio.h_final ? new Date(servicio.h_final).toLocaleTimeString('es-MX', {hour: '2-digit', minute: '2-digit', hour12: false}) : '--:--',
          ESTADOS_MAPA[servicio.estatus_clave]?.label || 'Desconocido'
        ].join(",");
      }).join("\n");
      const blob = new Blob([encabezados + filas], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `servicios_cecom_${new Date().toLocaleDateString()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

  useEffect(() => {
    const timer = setInterval(() => {
      setHora(new Date().toLocaleTimeString());
    }, 1000);

    const URL_API = "https://script.google.com/macros/s/AKfycbyvS9cxB5kjuZ3VO3EplAA3xTMJmZS2vj1O5GQzaS0seRKr4L7OiLEyRn14-y66A1CF/exec";
    fetch(URL_API)
      .then(res => res.json())
      .then(data => {
        setDb(data);
        const imss= data.servicios_imss || [];
        const privados = data.servicios_privados || [];
        const eventos = data.programados || [];
        const combinados = [
          ...imss.map(s => ({ ...s, tipo: 'IMSS'})),
          ...privados.map(s => ({ ...s, tipo: 'Privados'})),
          ...eventos.map(s => ({ ...s, tipo: 'Evento'}))
        ];
        setServiciosHoy(combinados);
        setCargando(false);
        console.log("Conexión exitosa:", data);        
      })
      .catch(err => {
        console.error("Error de conexion:", err);
        setCargando(false);
      });    

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className={`flex min-h-screen transition-colors duration-500 ${darkMode ? 'bg-[#050a18] text-white' : 'bg-white text-gray-900'}`}>
      
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
        onClick={() => setSidebarOpen(false)}/>
      )}

      {/* SIDEBAR - Responsivo: Se oculta en móvil, se muestra en PC (lg) */}
      <aside className={`w-64 fixed h-full shadow-xl border-r z-50 transition-transform duration-300 flex flex-col
        ${darkMode ? 'bg-[#0b1120] border-gray-800' : 'bg-white border-gray-100'}
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}> 

        <div className="p-6 pb-2">
          <div className="flex items-center justify-between mb-4">
            <h1 className={`text-xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>CECOM OS</h1>
            <button onClick={() => setSidebarOpen(false)} className='lg:hidden p-2 text-gray-500'>
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 py-2 space-y-1">
          <p className="text-[10px] uppercase tracking-widest font-bold opacity-60 mb-2">Principal</p>
          <button className={`flex items-center gap-3 w-full p-2.5 rounded-xl transition-all duration-300 group cursor-pointer
            ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => handleNavigation('/dashboard')}>
            <ChartNoAxesCombined className="w-5 h-5" color="#00D6C1" />
            <span className="text-sm">Panel de Control</span>
          </button>
          
          <p className="text-[10px] uppercase tracking-widest font-bold opacity-60 mt-4 mb-2">Operación</p>
          <NavItem icon={Hospital} label="Folios IMSS" color="#4CAE6B" darkMode={darkMode} onClick={() => handleNavigation('/folios-imss')} />
          <NavItem icon={CircleDollarSign} label="Servicios Privados" color="#EFB810" darkMode={darkMode} onClick={() => handleNavigation('/privados')} />
          <NavItem icon={Building} label="Servicios Aseguradoras" color="#C678ED" darkMode={darkMode} onClick={() => handleNavigation('/aseguradoras')} />
          <NavItem icon={TicketCheck} label="Cobertura de Eventos" color="#1B70C5" darkMode={darkMode} onClick={() => handleNavigation('/eventos')} />

          <p className="text-[10px] uppercase tracking-widest font-bold opacity-60 mt-4 mb-2">Gestión</p>
          <NavItem icon={Ambulance} label="Asignación de Unidades" color="#DB0000" darkMode={darkMode} onClick={() => handleNavigation('/asignacion')} />
          <NavItem icon={HeartHandshake} label="Apoyos Operativos" color="#F25FF2" darkMode={darkMode} onClick={() => handleNavigation('/apoyos')} />
          <NavItem icon={AlertTriangle} label="Reporte de Incidencias" color="#f23c4d" darkMode={darkMode} onClick={() => handleNavigation('/incidencias')} />
          <NavItem icon={Clipboard} label="Reporte de Novedades" color="#A67030" darkMode={darkMode} onClick={() => handleNavigation('/novedades')} />
          <NavItem icon={Settings} label="Configuración" color="#8F85BC" darkMode={darkMode} onClick={() => handleNavigation('/configuracion')} />
        </nav>

        {/* 3. PIE DE PÁGINA: Fijo abajo */}
        <div className={`p-4 border-t ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
          <div className={`flex items-center gap-3 px-3 py-3 mb-2 rounded-xl border ${
            darkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-100 border-gray-200'
          }`}>
            <Clock className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-[14px] font-mono font-bold leading-none">{hora}</p>
              <p className="text-[9px] opacity-70 uppercase mt-0.5">{fecha}</p>
            </div>
          </div>
          <button onClick={() => window.location.href = '/'} className="flex items-center gap-3 w-full p-2.5 rounded-xl text-gray-500 hover:text-[#EC6F7C] hover:bg-[#EC6F7C]/10 transition-all cursor-pointer">
            <LogOut className="w-4 h-4" /> 
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL - lg:ml-64 asegura que en PC no lo tape el sidebar */}
      <main className="flex-1 flex flex-col min-w-0 lg:ml-64 w-full">
        
        <header className={`sticky top-0 z-20 flex justify-between items-center p-4 md:p-6 transition-colors duration-500 border-b ${
          darkMode ? 'bg-[#050a18]/80 border-gray-800 backdrop-blur-md': 'bg-white/80 border-gray-100 backdrop-blur-md'
        }`}>
          <div className="flex items-center gap-4 min-w-0">
            <button onClick={() => setSidebarOpen(true)}
              className={`p-2 rounded-xl border-2 lg:hidden shrink-0  ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <Menu className="w-5 h-5 md:w-6 h-6" />
            </button>

            <div className="min-w-0">
              <h2 className={`text-xl md:text-3xl font-bold truncate ${darkMode ? 'text-white' : 'text-gray-950'}`}>Panel de Control</h2>
              <p className="text-gray-400 text-xs md:tex-sm hidden sm:block">Resumen operativo del sistema</p>
            </div>  
          </div>

          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <div className={`flex items-center gap-1.5 md:gap-2 px-2.5 py-2.5 md:px-4 md:py-2.5 rounded-xl border-2 font-bold transition-all ${
              darkMode ? 'bg-blue-900/20 border-blue-800 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600 shadow-lg shadow-blue-100'
            }`}>
              <Ambulance className="w-4 h-4 md:w-5 h-5" />
              <span className="text-xs md:text-base">
                {db?.asignaciones ? db.asignaciones.filter(a => a.estatus_asignacion === 'EN_SERVICIO' || a.estatus_asignacion === 'ASIGNADA' ).length : '0'} 
                <span className="hidden sm:inline"> Unidades en servicio </span>
              </span>
            </div>

            <button onClick={toggleTheme} className={`p-2 md:p-2.5 rounded-xl border-2 transition-all transform active:scale-95 cursor-pointer ${
              darkMode ? 'bg-gray-800 border-gray-700 text-yellow-400' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50 shadow-lg'
            }`}>
              {darkMode ? <Sun className="w-5 h-5 md:w-6 h-6" /> : <Moon className="w-5 h-5 md:w-6 h-6" />}
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8">
          <div className="mb-6">
            <h3 className={`text-xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Centro de Comunicaciones</h3>
            <p className="text-gray-500 text-sm">Panel de Control Principal</p>
          </div>
          
          {/* GRID DE MÉTRICAS - Responsivo: 1 col móvil, 2 col tablet, 3 col desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Unidades Activas */}
            <div className={`p-5 rounded-xl border-2 transition-all hover:scale-[1.02] flex items-center gap-4 ${
              darkMode ? 'bg-[#111827] border-gray-800 shadow-none' : 'bg-white border-gray-300 shadow-2xl shadow-gray-400/50'
            }`}>
              <div className={`p-3 rounded-2xl ${darkMode ? 'bg-red-900/20 text-red-500' : 'bg-[#f23c4d]/10 text-[#f23c4d]'}`}>
                <Ambulance className="w-8 h-8" />
              </div>
              <div>
                <p className="text-gray-500 font-medium mb-0 uppercase text-xs">Unidades Activas</p>
                <p className={`text-4xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {db?.asignaciones ? db.asignaciones.filter(a => a.estatus_asignacion === 'EN_SERVICIO' || a.estatus_asignacion === 'ACTIVA' ).length : '...'}
                </p>
                <p className="text-gray-400 text-[10px] mt-0.5 font-medium">En operación actualmente</p>
              </div>
            </div>

            {/* Unidades en Servicio */}
            <div className={`p-5 rounded-xl border-2 transition-all hover:scale-[1.02] flex items-center gap-4 ${
              darkMode ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-300 shadow-2xl shadow-gray-400/50'
            }`}>
              <div className={`p-3 rounded-2xl ${darkMode ? 'bg-[#E26C1D]/20 text-[#E26C1D]' : 'bg-[#E26C1D]/10 text-[#E26C1D]'}`}>
                <Siren className="w-8 h-8" />
              </div>
              <div>
                <p className="text-gray-500 font-medium mb-0 uppercase text-xs">Unidades en Servicio</p>
                <p className="text-4xl font-extrabold">
                  {db?.asignaciones ? db.asignaciones.filter(a => a.estatus_asignacion === 'EN_SERVICIO' || a.estatus_asignacion === 'ACTIVA' ).length : '...'}
                </p>
                <p className="text-gray-400 text-[10px] mt-0.5 font-medium">Realizando traslados</p>
              </div>
            </div>

            {/* Servicios Activos (Filtro IMSS + Privados) */}
            <div className={`p-5 rounded-xl border-2 transition-all hover:scale-[1.02] flex items-center gap-4 ${
              darkMode ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-300 shadow-2xl shadow-gray-400/50'
            }`}>
              <div className={`p-3 rounded-2xl ${darkMode ? 'bg-[#FFDB29]/20 text-[#FFDB29]' : 'bg-[#FFDB29]/10 text-[#FFDB29]'}`}>
                <Hourglass className="w-8 h-8" />
              </div>
              <div>
                <p className="text-gray-500 font-medium mb-0 uppercase text-xs">Servicios Activos</p>
                <p className="text-4xl font-extrabold">{db ? (
                  (db.servicios_imss.filter(p => p.estatus_clave === 'EN_SERVICIO' || p.estatus_clave === 'NUEVO' ).length || 0) +
                  (db.servicios_privados?.filter(q => q.estatus_clave === 'EN_PROCESO' ).length || 0)) : "..." }
                </p>
                <p className="text-gray-400 text-[10px] mt-0.5 font-medium">En curso ahora mismo</p>
              </div>
            </div>

            {/* Servicios del Dia */}
            <div className={`p-5 rounded-xl border-2 transition-all hover:scale-[1.02] flex items-center gap-4 ${
              darkMode ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-300 shadow-2xl shadow-gray-400/50'
            }`}>
              <div className={`p-3 rounded-2xl ${darkMode ? 'bg-[#79A3E2]/20 text-[#79A3E2]' : 'bg-[#79A3E2]/10 text-[#79A3E2]'}`}>
                <CalendarDays className="w-8 h-8" />
              </div>
              <div>
                <p className="text-gray-500 font-medium mb-0 uppercase text-xs">Servicios del Dia</p>
                <p className="text-4xl font-extrabold">{db ? (
                  (db.servicios_imss.filter(p => p.estatus_clave === 'EN_SERVICIO' || p.estatus_clave === 'NUEVO' ).length || 0) +
                  (db.servicios_privados?.filter(q => q.estatus_clave === 'EN_PROCESO' ).length || 0)) : "..." }
                </p>
                <p className="text-gray-400 text-[10px] mt-0.5 font-medium">Totales hoy</p>
              </div>
            </div>

            {/* Programados */}
            <div className={`p-5 rounded-xl border-2 transition-all hover:scale-[1.02] flex items-center gap-4 ${
              darkMode ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-300 shadow-2xl shadow-gray-400/50'
            }`}>
              <div className={`p-3 rounded-2xl ${darkMode ? 'bg-[#79A3E2]/20 text-[#79A3E2]' : 'bg-[#79A3E2]/10 text-[#79A3E2]'}`}>
                <CalendarClock className="w-8 h-8" />
              </div>
              <div>
                <p className="text-gray-500 font-medium mb-0 uppercase text-xs">Programados</p>
                <p className="text-4xl font-extrabold">{cargando ? '...' : (db?.programados ? db.programados.filter(s => s.estatus_clave === 'EN_SERVICIO' || s.estatus_clave === 'NUEVO' ).length : 0)}</p>
                <p className="text-gray-400 text-[10px] mt-0.5 font-medium">Servicios próximos</p>
              </div>
            </div>

            {/* Incidencias */}
            <div className={`p-5 rounded-xl border-2 transition-all hover:scale-[1.02] flex items-center gap-4 ${
              darkMode ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-300 shadow-2xl shadow-gray-400/50'
            }`}>
              <div className={`p-3 rounded-2xl ${darkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'}`}>
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <p className="text-gray-500 font-medium mb-0 uppercase text-xs">Incidencias Abiertas</p>
                <p className="text-4xl font-extrabold">{cargando ? '...' : (db?.incidencias ? db.incidencias.filter(s => s.estatus_clave === 'EN_SERVICIO' || s.estatus_clave === 'NUEVO' ).length : 0)}</p>
                <p className="text-gray-400 text-[10px] mt-0.5 font-medium">Requieren atención</p>
              </div>
            </div>
          </div>

          {/* Sección de Estado de Unidades */}
          <div className={`mt-8 p-6 rounded-xl border-2 transition-all ${
            darkMode ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-100 shadow-sm'
          }`}>
            <h4 className={`text-lg font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Estado de unidades</h4>
            <p className="text-gray-500 text-xs mb-4">Unidades con tripulación asignada en turno</p>
            <p className="text-gray-400 italic text-sm">Sin unidades activas en turno</p>
          </div>

          {/* Módulos Operativos - Grid Responsivo (1 col móvil a 4 col PC) */}
          <div className="mt-12 mb-6">
            <h3 className={`text-xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Módulos operativos</h3>
            <p className="text-gray-500 text-sm">Acceso rápido a las áreas principales</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {[
              { name: 'IMSS', icon: Hospital, count: db?.servicios_imss?.length || 0, color: '#297A3D' },
              { name: 'Privados', icon: CircleDollarSign, count: db?.servicios_privados?.length || 0, color: '#EFB810' },
              { name: 'Aseguradoras', icon: Building, count: 0, color: '#C678ED' },
              { name: 'Unidades', icon: Ambulance, count: db?.unidades?.length || 0, color: '#DB0000' },
              { name: 'Apoyos', icon: HeartHandshake, count: 0, color: '#F25FF2' },
              { name: 'Eventos', icon: TicketCheck, count: db?.programados?.length || 0, color: '#1B70C5' },
              { name: 'Incidencias', icon: AlertTriangle, count: db?.incidencias?.length || 0, color: '#f23c4d' },
            ].map((mod) => (
              <button key={mod.name} className={`w-full p-4 rounded-xl border-2 transition-all hover:scale-[1.01] flex items-center justify-between group ${
                darkMode ? 'bg-[#111827] border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900 shadow-sm'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-lg transition-colors ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`} 
                       style={{'--hover-bg': `${mod.color}20`}}>
                    <mod.icon className="w-6 h-6 text-gray-500 transition-colors duration-300" 
                             style={{ color: mod.color }}/>
                  </div>
                  <span className="text-lg font-bold tracking-tight">{mod.name}</span>
                </div>  
                <div className={`flex items-center justify-center font-bold rounded-full w-8 h-8 text-sm shrink-0 ${
                  darkMode ? 'bg-[#E2E8F0] text-[#111827]' : 'bg-gray-900 text-white' }`}>
                  {mod.count}
                </div>
              </button>
            ))}
          </div>

          {/*Seccion Serviciós del Dia*/}
          <div className={`mt-8 p-6 rounded-xl border-2 overflow-x-auto transition-all ${
            darkMode ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-100 shadow-sm'
          }`}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className={`text-lg font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Servicios del Día</h4>
                <p className="text-gray-500 text-xs">Resumen operativo de los servicios registrados</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-bold">Ver todos</button>
                <button onClick={exportarCSV} className="px-4 py-2 bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded-lg text-sm font-bold cursor-pointer">Exportar</button>
              </div>
            </div>

            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full text-left border-collapse min-w-[600px]"> 
                <thead>
                  <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-gray-800">
                    <th className="pb-4 font-bold px-2">Folio</th>
                    <th className="pb-4 font-bold px-2">Módulo</th>
                    <th className="pb-4 font-bold px-2">Paciente</th>
                    <th className="pb-4 font-bold px-2">Origen / Destino</th>
                    <th className="pb-4 font-bold px-2">Unidad</th>
                    <th className="pb-4 font-bold px-2">Hora I. | Hora F.</th>
                    <th className="pb-4 font-bold px-2">Estado</th>
                    <th className="pb-4 font-bold text-right px-2">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {serviciosHoy.length > 0 ? serviciosHoy.map((servicio, index) => (
                    <tr key={index} className="group hover:bg-gray-800/30 transition-colors">
                      <td className="py-4 px-2 text-[10px] font-mono text-gray-400">#{index + 1}</td>
                      <td className="py-4 px-2">
                        <span className={`px-2 py-1 rounded-md text-[9px] font-bold ${
                          servicio.tipo === 'IMSS' ? 'bg-green-500/10 text-green-500' : 
                          servicio.tipo === 'Privado' ? 'bg-[#EFB810]/10 text-[#EFB810]':
                          'bg-[#EFB810]/10 text-[#EFB810]'
                        }`}>
                          {servicio.tipo}
                        </span>
                      </td>
                      <td className="py-4 px-2 font-bold text-xs truncate max-w-[120px]">
                        {servicio.paciente || servicio.paciente_nombre}</td>

                      <td className="py-4 px-2 max-w-[250px]">
                        
                        <p className={`text-[11px] font-bold leading-tight ${ darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {servicio.origen || servicio.hospital_origen || '—'}</p>
                        <p className={`text-[10px] flex items-start gap-1.5 ${ darkMode ? 'text-gray-400' : 'text-slate-500'}`}>→ 
                          {servicio.destino || servicio.hospital_destino || '—'}</p>
                      </td>
                      
                      <td className="py-4 px-2">
                        <span className={`px-2 py-1 rounded md font-bold text-[10px] ${
                          darkMode ? 'bg-gary-800 text-gray-300' : 'b-slate-200 text-sslate-700 border border-slate-300'
                        }`}>
                          {servicio.unidad_clave || 'Asignar'}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-1 min-w-max">
                          <span className={`px-2 py-1 rounded-lg font-mono text-[11px] font-bold border transition-colors${
                            darkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm'
                          }`}>
                            {servicio.h_inicio ? new Date(servicio.h_inicio).toLocaleTimeString('es-MX', {hour: '2-digit', minute: '2-digit', hour12: false}) : '--:--'}
                          </span>
                          <span className="text-gray-500 font-bold text-xs">|</span>
                          <span className={`px-2 py-1 rounded-lg font-mono text-[11px] font-bold border transition-colors${
                            darkMode ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm'
                          }`}>
                            {servicio.h_final ? new Date(servicio.h_final).toLocaleTimeString('es-MX', {hour: '2-digit', minute: '2-digit', hour12: false}) : '--:--'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span className={`flex items-center gap-1.5 ${ESTADOS_MAPA[servicio.estatus_clave]?.color || 'text-gray-500'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${ESTADOS_MAPA[servicio.estatus_clave]?.bg || 'bg-gray-500'} ${ESTADOS_MAPA[servicio.estado]?.pulse || ''}`}  />
                          {ESTADOS_MAPA[servicio.estatus_clave]?.label || 'Desconocido'}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right whitespace-nowrap">
                        <button className="p-1.5 hover:bg-gray-700 rounded-lg text-gray-400 cursor-pointer"><Activity className="w-4 h-4" /></button>
                        <button className="p-1.5 hover:bg-gray-700 rounded-lg text-orange-400 cursor-pointer"><Settings className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-gray-500 italic text-sm">
                        No hay servicios registrados hoy
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;