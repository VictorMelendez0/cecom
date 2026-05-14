import React, { useState, useEffect, useMemo, useCallback} from 'react';
import { Ambulance, Activity, AlertTriangle, LogOut, ChartNoAxesCombined, Settings, 
  User, Moon, Sun, Clock, Siren, Hourglass, CalendarDays, CalendarClock, 
  Building,  Hospital, CircleDollarSign, HeartHandshake, TicketCheck,
  Menu, X, Clipboard, MoveRight, ChevronDown} from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import AgregarSolicitante from './Agregar_Sol';
import AgregarEstado from './Agrgar_Estado';
import CardSeguimiento from './CardSeguimiento';
import AsignarUnidad from './AsignarUnidad';
import Seguimiento from './Seguimiento';

const ESTADOS_MAPA = {
  'EN_SERVICIO': { label: 'Activo', color: 'text-green-400 dark:text-emerald-500', bg: 'bg-emerald-500', pulse: 'animate-pulse' },
  'EN_PROCESO': { label: 'Activo', color: 'text-green-400 dark:text-emerald-500', bg: 'bg-emerald-500', pulse: 'animate-pulse' },
  'FINALIZADO': { label: 'Finalizado', color: 'text-red-400 dark:text-red-600', bg: 'bg-red-500', pulse: '' },
  'NUEVO':  { label: 'Pendiente', color: 'text-amber-500', bg: 'bg-amber-500', pulse: '' },
}

const Traslados_Tipos = [
    "Sencillo",
    "Redondo"
];

const Prioridad = [
    "Urgente",
    "Inmediata",
    "Código Infarto",
    "Código mater",
    "Progrmado"
];

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


const FoliosImss = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  const [hora, setHora] = useState(new Date().toLocaleTimeString());
  const[fecha, setFecha] =useState(new Date().toLocaleDateString('es-MX', {weekday:'long', year:'numeric', month:'long', day: 'numeric'}));
  const [db, setDb] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [serviciosHoy, setServiciosHoy] = useState([]);
  const toggleTheme = () => setDarkMode(!darkMode);
  const [mostrarRecursos, setMostrarRecursos] = useState(false);
  const [listaSolicitantes, setListaSolicitantes] = useState([]);
  const [datosSolicitante, setDatosSolicitante] = useState({ nombre: '', telefono: '', id: ''});
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [edadPaciente, setEdadPaciente] = useState('');
  const [listaServicios, setListaServicios] = useState([]);
  const [tipoServicio, setTipoServicio] = useState('');
  const [menuSolicitante, setMenuSolicitante] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEstadoOpen, setIsEstadoOpen] = useState(false);
  const [prioridadSelec, setPrioridadSelect] = useState('');
  const [nombre, setNombre] = useState('');
  const [numeross, setNumeroSs] =useState('');
  const [CamaHab, setCamaHab] = useState('');
  const [Diagnostico, setDiagnostico] = useState('');
  const [traslado, setTraslado] = useState('');
  const [aceptacion, setAceptacion] = useState('');
  const [lugarOrigen, setLugarOrigen] = useState('');
  const [lugarDestino, setLugarDestino] = useState('');
  const [catalogoHospital, setCatalogoHospital] = useState([]);
  const [SugerenciasOrig, setSugerenciasOrig] = useState(false);
  const [SugerenciasDest, setSugerenciasDest] = useState(false);
  const [NombreReceptor, setNombreReceptor] = useState('');
  const [ContactoRecept, setContactoRecept] = useState('');
  const [idOrigen, setIdOrigen] = useState('');
  const [idDestino, setIdDestino] = useState('');
  const [IdServicio, setIdServicio] =useState('');
  const [NotaPac, setNotaPac] = useState('');
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [tipoModalAbierto, setTipoModalAbierto] = useState(null);

  const fechaHoy = new Date().toLocaleDateString('es-MX', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
  });
  const handleNavigation = (ruta) => {
    navigate(ruta); 
    setSidebarOpen(false);
  };

  const abrirModalSeguimiento = (servicio, tipo) => {
    setServicioSeleccionado(servicio);
    setTipoModalAbierto(tipo);
  };

  const usuarioLogueado = localStorage.getItem('user_name') || 'Usuario Invitado';
  const IdUsuario = localStorage.getItem('user_id') || 'Usuario Invitado'

  const limpiarCampos = () => {
        // Apartado Activación
        setDatosSolicitante({ nombre: '', telefono: '' });
        setNombreReceptor("");
        setContactoRecept("");
        setAceptacion("");
        
        // Apartado Paciente
        setNombre("");
        setFechaNacimiento("");
        setEdadPaciente("");
        setNumeroSs("");
        setCamaHab("");
        setDiagnostico("");
        setNotaPac("");
        
        // Apartado Servicio
        setLugarOrigen("");
        setLugarDestino("");
        setTipoServicio("");
        setTraslado("");
        setPrioridadSelect("");
    };

   const handleEnviarRegistro = async () => {
        const URL_API = "https://script.google.com/macros/s/AKfycbyvS9cxB5kjuZ3VO3EplAA3xTMJmZS2vj1O5GQzaS0seRKr4L7OiLEyRn14-y66A1CF/exec";
        // Generar un ID único simple para id_imss (similar al de tu imagen)
        const idUnico = `IMSS-${Math.random().toString(16).slice(2, 10).toUpperCase()}`;
        const idunicoBitacora = `BIT-${Math.random().toString(16).slice(2, 10).toUpperCase()}`;
        const ahora = new Date();
        const opcionesHora = { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: false 
        };

            // Construimos la cadena: "16/4/2026 19:40:51"
            const fechaCorta = ahora.toLocaleDateString('es-MX'); // 16/4/2026
            const hora24 = ahora.toLocaleTimeString('es-MX', opcionesHora); // 19:40:51
    
            const fechaHoraUnificada = `${fechaCorta} ${hora24}`;

        const datosARegistrar = {
            targetSheet: "OPS_IMSS", // Indicamos a qué tabla va
            "id_imss": idUnico,
            "folio_imss": folioSugerido,
            "fecha": new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
            "h_activacion": new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            "id_solicitante": datosSolicitante.id,
            "solicitante_nombre": datosSolicitante.nombre,
            "contacto_numero": datosSolicitante.telefono,
            "nombre_receptor": NombreReceptor,
            "codigo_aceptacion": aceptacion,
            "paciente_nombre": nombre,
            "paciente_fecha_nacimiento": fechaNacimiento,
            "paciente_edad": edadPaciente,
            "paciente_nss": numeross,
            "paciente_habitacion": CamaHab,
            "paciente_diagnostico": Diagnostico,
            "paciente_nota": NotaPac,
            "id_hospital_origen": idOrigen,
            "hospital_origen": lugarOrigen,
            "id_hospital_destino": idDestino,
            "hospital_destino": lugarDestino,
            "id_tipo_servicio": IdServicio,
            "tipo_servicio": tipoServicio,
            "tipo_traslado": traslado,
            "estatus_clave": "NUEVO",
            "estatus_nombre": "Nuevo",
            "estatus_visual": "pending",
            "prioridad": prioridadSelec,
            "activo": "TRUE",
            "finalizado": "FALSE",
            "created_at": fechaHoraUnificada,
            "created_by_id": IdUsuario,
            "updated_at": fechaHoraUnificada,
            "updated_by_id": IdUsuario,
            "updated_by_nombre": usuarioLogueado            
        };

        const registrarBitacora={
          targetSheet: "OPS_IMSS_BITACORA", // Indicamos a qué tabla va
          "id_bitacora": idunicoBitacora,
          "id_imss": idUnico,
          "fecha": new Date().toLocaleString(),
          "hora": new Date().toLocaleTimeString(),
          "accion": 'CREACIÓN DE FOLIO',
          "comentario": 'Solicitud del Imss creada',
          "estatus": "NUEVO",
          "created_by_id": IdUsuario 
        };

        try {
            await fetch(URL_API, {
                method: 'POST',
                mode: 'no-cors', // Google Apps Script suele requerir esto si no hay proxy
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosARegistrar)
            });

            await fetch(URL_API, {
                method: 'POST',
                mode: 'no-cors', // Google Apps Script suele requerir esto si no hay proxy
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registrarBitacora)
            });

            // Al usar no-cors, no podemos leer el JSON de respuesta, 
            // así que ejecutamos la limpieza inmediatamente después de que termine la petición.
            alert("Registro guardado y formulario limpio.");
            setIsEstadoOpen(false);
            limpiarCampos();
            setTimeout(() => {
            refrescarDatos();
        }, 500);

        } catch (error) {
            console.error("Error de red:", error);
            alert("Error al intentar conectar con el servidor.");
        }
    };

    const handleSaveSeguimiento = (datosActualizados) => {
        setDb(prevDb => {
            if (!prevDb) return prevDb;
            return {
                ...prevDb,
                servicios_imss: prevDb.servicios_imss.map(s => 
                    s.folio_imss === datosActualizados.folio_imss ? { ...s, ...datosActualizados } : s
                )
            };
        });
    };

  
  const refrescarDatos = useCallback(async () => {
        const URL_API = "https://script.google.com/macros/s/AKfycbyvS9cxB5kjuZ3VO3EplAA3xTMJmZS2vj1O5GQzaS0seRKr4L7OiLEyRn14-y66A1CF/exec";
        try {
            const res = await fetch(URL_API);
            const data = await res.json();
            setDb(data); // Esto actualizará automáticamente el folioSugerido gracias al useMemo
            
            // Actualizar también las listas si es necesario
            setListaSolicitantes(data.solicitantes || []);
            setCatalogoHospital(data.hospitales_cat || []);
            console.log("Datos actualizados y folio recalculado");
        } catch (err) {
            console.error("Error al refrescar:", err);
        }
    }, []);  

    const asignacionActiva = useMemo(() => {
    if (!db?.asignaciones || !servicioSeleccionado) return null;
    
    // Buscamos en la tabla de asignaciones la que coincida con el folio o unidad
    return db.asignaciones.find(asig => 
        asig.id_asignacion === servicioSeleccionado.id_asignacion || 
        asig.unidad_clave === servicioSeleccionado.unidad_clave
    );
    }, [db?.asignaciones, servicioSeleccionado]);

    const serviciosImssHoy = useMemo(() => {
        if (!db || !db.servicios_imss) return [];

        // 1. Obtenemos la fecha de hoy en un formato estándar (DD/MM/YYYY)
        // Usamos 'en-GB' para asegurar el formato día/mes/año sin partes de texto
        const hoyCorta = new Date().toLocaleDateString('en-GB'); 

        return db.servicios_imss.filter(servicio => {
            if (!servicio.fecha) return false;

            let fechaServicioNormalizada;
            
            try {
                const d = new Date(servicio.fecha);
                
                fechaServicioNormalizada = !isNaN(d) ? d.toLocaleDateString('en-GB') : servicio.fecha;
            } catch {
                fechaServicioNormalizada = servicio.fecha;
            }

            const hoy = new Date();
            const opcionesLargas = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
            const hoyTextoLargo = hoy.toLocaleDateString('es-ES', opcionesLargas);

            return (
                fechaServicioNormalizada === hoyCorta || 
                servicio.fecha.toString().toLowerCase() === hoyTextoLargo.toLowerCase()
            );
        });
    }, [db]);
    
  const manejarCambioSolicitante = (e) => {
     const nombreSeleccionado = e.target.value;
     const encontrado = listaSolicitantes.find(s => s.nombre_solicitante === nombreSeleccionado);        
     if (encontrado) {
        setDatosSolicitante({
            nombre: encontrado.nombre_solicitante,
            telefono: encontrado.telefono, 
            id: encontrado.id_solicitante
        });
        } else {
            setDatosSolicitante({ nombre: '', telefono: '', id: '' });
        }
  }; 

  const manejarCambiofecha = (e) => {
    const fechaSeleccionada = e.target.value;
    setFechaNacimiento(fechaSeleccionada);
    if (fechaSeleccionada){
        const hoy = new Date();
        const cumple = new Date(fechaSeleccionada);
        let edad = hoy.getFullYear() - cumple.getFullYear();
        const m = hoy.getMonth() - cumple.getMonth();
        
        if (m < 0 || (m === 0 &&  hoy.getDate() < cumple.getDate())) {
            edad--;
        }
        setEdadPaciente(edad >= 0 ? edad : '');
    }else {
        setEdadPaciente('');
    }
  }

  const folioSugerido = useMemo(() => {
    if (!db || !db.servicios_imss || !Array.isArray(db.servicios_imss)){
        return "IMSS-2026-0001";
    }

    const numeros = db.servicios_imss.map(item => {
        const valorFolio = item.folio_imss ? String(item.folio_imss) : "";
        const partes = valorFolio.split('-');
        const ultimoSegmento = partes[partes.length - 1];
        const numero = parseInt(ultimoSegmento, 10);
        
        return isNaN(numero) ? 0 : numero;
    });

    const maximoActual = numeros.length> 0 ? Math.max(...numeros): 0;
    const siguiente = (maximoActual + 1).toString().padStart(4, '0');
    return `IMSS-2026-${siguiente}`;
  }, [db]);

  const sugerenciasFiltradas = useMemo(() => {
    if (!lugarOrigen || lugarOrigen.length < 2) return [];
    
    return catalogoHospital.filter(hosp => 
        hosp.nombre_hospital?.toLowerCase().includes(lugarOrigen.toLowerCase())
    ).slice(0, 6); // Solo mostramos las primeras 6 coincidencias
  }, [lugarOrigen, catalogoHospital]);

  const sugerenciasDestino = useMemo(() => {
    if (!lugarDestino || lugarDestino.length < 2) return [];
    return catalogoHospital.filter(hosp => 
        hosp?.nombre_hospital?.toLowerCase().includes(lugarDestino.toLowerCase())
    ).slice(0, 6);
}, [lugarDestino, catalogoHospital]);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');    
    const handleChange = (e) => setDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);

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
        const solicitantes = data.solicitantes ||[];
        setListaSolicitantes(solicitantes);
        const servicios = data.servicios_cat || [];
        setListaServicios (servicios);
        const hospitales = data.hospitales_cat ||[];
        setCatalogoHospital (hospitales);
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

    const intervalo = setInterval(() => {
        refrescarDatos();
    }, 20000); 

 
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      clearInterval(timer);
      clearInterval(intervalo);
    };

  }, [refrescarDatos]);

  return (
    <div className={`flex min-h-screen transition-colors duration-500 ${darkMode ? 'bg-[#050a18] text-white' : 'bg-white text-gray-900'}`}>
      
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
        onClick={() => setSidebarOpen(false)}/>
      )}

        {/* SIDEBAR */}
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

            {/* PIE DE PÁGINA: Fijo abajo */}
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

        {/* CONTENIDO PRINCIPAL*/}
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
                    <h2 className={`text-xl md:text-3xl font-bold truncate ${darkMode ? 'text-white' : 'text-gray-950'}`}>Folios Imss</h2>
                    <p className="text-gray-400 text-xs md:tex-sm hidden sm:block">Gestión de traslados institucionales</p>
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
            
            <div className="p-4 md:p-8 space-y-6">                    
                {/* Indicador de conexión */}
                <div className="flex items-center gap-2">  
                    <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    cargando ? 'bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]' 
                    : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`} 
                    />
                    <div className="min-w-0">
                        <p className="text-gray-400 text-sm">Módulo de Imss Operativo</p>
                    </div>
                </div>

                {/* Sección de Estado de Unidades (Fuera del flex anterior) */}
                <div className={`rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                    darkMode ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-100 shadow-sm'
                }`}>
                    {/* Encabezado Clickable */}
                    <div 
                        onClick={() => setMostrarRecursos(!mostrarRecursos)}
                        className="p-6 cursor-pointer flex justify-between items-center hover:bg-gray-500/5 transition-colors"
                    >
                        <div>
                            <h4 className={`text-lg font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                NUEVA SOLICITUD DE ESTADO
                            </h4>
                        </div>                        
                        {/* Icono de flecha que rota según el estado */}
                        <div className={`transform transition-transform duration-300 ${mostrarRecursos ? 'rotate-180' : ''}`}>
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {/* Contenido Desplegable */}
                    <div className={`transition-all duration-300 ease-in-out ${
                        mostrarRecursos ? 'max-h-[2000px] opacity-100 border-t border-gray-100 dark:border-gray-800' : 'max-h-0 opacity-0'
                    }`}>
                        <div className="p-6 space-y-4">
                            {/* AQUÍ VAN TUS NUEVOS RECURSOS (Formularios, Tablas, etc) */}                            
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className={`rounded-xl border-2 transition-all duration-300 overflow-hidden w-full ${
                                    darkMode ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-100 shadow-sm'
                                }`}>
                                    {/* Cabecera más compacta (py-2 en lugar de py-4) */}
                                    <div className={`px-4 py-2 border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                                        <h1 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        Activación
                                        </h1>
                                    </div>

                                    {/* Cuerpo con padding reducido (p-4) y texto más pequeño (text-xs) */}
                                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        
                                        {/* Ejemplo de Input compactado */}
                                        <div className="flex flex-col gap-1">
                                        <label className={`text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                            Folio sugerido
                                        </label>
                                        <input 
                                            disabled
                                            value={folioSugerido}
                                            className={`px-2 py-1.5 text-xs rounded-md border transition-all ${
                                            darkMode 
                                            ? 'bg-[#1f2937]/50 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'
                                            }`}
                                        />
                                        </div>

                                        {/* Fecha de solicitud */}
                                        <div className="flex flex-col gap-1">
                                        <label className={`text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'
                                        }`}>
                                            Fecha de solicitud
                                        </label>
                                        <input
                                            readOnly
                                            value={fechaHoy}
                                            className={`px-2 py-1.5 text-xs rounded-md border outline-nine ${
                                                darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'
                                            }`}                                
                                        />
                                        </div>
                                        
                                        {/*Solicitante Personalizado*/}
                                        <div className="flex flex-col gap-1 relative">
                                            <label className={`text-[10px] font-medium uppercase tracking-wider text-gray-500`}>
                                                Solicitante
                                            </label>
                                            
                                            {/* Botón que simula el Select */}
                                            <div 
                                                onClick={() => setMenuSolicitante(!menuSolicitante)}
                                                className={`px-2 py-1.5 text-xs rounded-md border cursor-pointer flex justify-between items-center transition-all ${
                                                    darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'
                                                }`}
                                            >
                                                <span className="truncate">{datosSolicitante.nombre || "Seleccionar solicitante"}</span>
                                                <Menu className={`w-3 h-3 transition-transform ${menuSolicitante ? 'rotate-180' : ''}`} />
                                            </div>

                                            {/* Menú Desplegable */}
                                            {menuSolicitante && (
                                                <>
                                                    {/* Capa invisible para cerrar al hacer clic fuera */}
                                                    <div className="fixed inset-0 z-40" onClick={() => setMenuSolicitante(false)} />
                                                    
                                                    <div className={`absolute top-full left-0 w-full mt-1 z-50 rounded-md border shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 ${
                                                        darkMode ? 'bg-[#111827] border-gray-700' : 'bg-white border-gray-200'
                                                    }`}>
                                                        {/* Lista de solicitantes existentes */}
                                                        <div className="max-h-40 overflow-y-auto">
                                                            {listaSolicitantes.map((item, index) => (
                                                                <div 
                                                                    key={index}
                                                                    onClick={() => {
                                                                        manejarCambioSolicitante({ target: { value: item.nombre_solicitante } });
                                                                        setMenuSolicitante(false);
                                                                    }}
                                                                    className={`px-3 py-2 text-xs cursor-pointer transition-colors ${
                                                                        darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-blue-50'
                                                                    }`}
                                                                >
                                                                    {item.nombre_solicitante}
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Botón de Agregar (Estilo de tu imagen) */}
                                                        <button 
                                                            onClick={() => {
                                                                setIsModalOpen(true);
                                                                setMenuSolicitante(false);
                                                            }}
                                                            className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-bold border-t transition-colors ${
                                                                darkMode 
                                                                ? 'border-gray-700 text-white hover:bg-gray-800' 
                                                                : 'border-gray-100 text-gray-800 hover:bg-gray-50 shadow-inner'
                                                            }`}
                                                        >
                                                            <span className="text-purple-500 text-lg leading-none">+</span>
                                                            Agregar solicitante...
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/*Telefono-Contacto*/}
                                        <div className="flex flex-col gap-1">
                                        <label className={`text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                            Telefono / Contacto
                                        </label>
                                            <input
                                            readOnly
                                            placeholder="Automatico"
                                            value={datosSolicitante.telefono}
                                            className={`px-2 py-1.5 text-xs rounded-md border outline-nine ${
                                                darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'
                                            }`}                                
                                            />                                 
                                        </div>
                                
                                        {/* Nota: Para el campo "Diagnóstico" o "Nota" que ocupan todo el ancho, usa col-span-2 */}
                                        <div className="flex flex-col gap-1">
                                        <label className={`text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                            Nombre del receptor
                                        </label>
                                        <input
                                            value={NombreReceptor || ''}
                                            onChange={(e) => setNombreReceptor(e.target.value)}
                                            placeholder="Nombre del receptor"
                                            className={`px-2 py-1.5 text-xs rounded-md border outline-none ${
                                            darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                                            }`}
                                        />
                                        </div>
                                        
                                        <div className="flex flex-col gap-1">
                                        <label className={`text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                            Contacto Receptor
                                        </label>
                                        <input
                                            value={ContactoRecept || ''}
                                            onChange={(e) => setContactoRecept(e.target.value)}
                                            placeholder="Contacto Receptor"
                                            className={`px-2 py-1.5 text-xs rounded-md border outline-none ${
                                            darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                                            }`}
                                        />
                                        </div>

                                        <div className="flex flex-col gap-1">
                                        <label className={`text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                            Código de Aceptación
                                        </label>
                                        <input 
                                            value={aceptacion || ''}
                                            onChange={(e) => setAceptacion(e.target.value)}
                                            placeholder="Codigo"
                                            className={`px-2 py-1.5 text-xs rounded-md border outline-none ${
                                            darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                                            }`}
                                        />
                                        </div>
                                    </div>
                                </div>

                                {/* Tabla Paciente */}
                                <div className={`rounded-xl border-2 transition-all duration-300 overflow-hidden w-full max-w-md mx-auto ${
                                    darkMode ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-100 shadow-sm'
                                }`}>
                                    {/* Cabecera */}
                                    <div className={`px-4 py-3 border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                                        <h1 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                            Paciente
                                        </h1>
                                    </div>

                                    {/* Cuerpo del Formulario */}
                                    <div className="p-4 grid grid-cols-1 gap-4">
                                        
                                        {/* Input Nombre - Ocupa todo el ancho siempre */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                                Nombre del Paciente
                                            </label>
                                            <input
                                                value={nombre || ''}
                                                onChange={(e) => setNombre(e.target.value)} 
                                                type="text"
                                                placeholder="Nombre Completo del Paciente"
                                                className={`px-3 py-2 text-xs rounded-md border transition-all outline-none ${
                                                    darkMode 
                                                    ? 'bg-[#1f2937]/50 border-gray-700 text-gray-300 focus:border-blue-500' 
                                                    : 'bg-gray-50 border-gray-200 text-gray-600 focus:border-blue-400'
                                                }`}
                                            />
                                        </div>

                                        {/* Fila de Fecha y Edad - En móviles uno abajo del otro, en SM a los lados */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                                    Fecha de Nacimiento
                                                </label>
                                                <input 
                                                    type="date"
                                                    value={fechaNacimiento}
                                                    onChange={manejarCambiofecha}
                                                    className={`px-3 py-2 text-xs rounded-md border transition-all outline-none w-full ${
                                                        darkMode 
                                                        ? 'bg-[#1f2937]/50 border-gray-700 text-gray-300 [color-scheme:dark]' 
                                                        : 'bg-gray-50 border-gray-200 text-gray-600 [color-scheme:light]'
                                                    }`}
                                                />
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                                    Edad del Paciente
                                                </label>
                                                <input 
                                                    type="text"
                                                    readOnly
                                                    value={edadPaciente ? `${edadPaciente} años` : ''}
                                                    onChange={(e) => setEdadPaciente(e.target.value)}
                                                    placeholder="Automático"
                                                    className={`px-3 py-2 text-xs rounded-md border transition-all outline-none w-full ${
                                                        darkMode 
                                                        ? 'bg-[#1f2937]/50 border-gray-700 text-gray-300' 
                                                        : 'bg-gray-50 border-gray-200 text-gray-600'
                                                    }`}
                                                />
                                            </div>
                                        </div>

                                        {/* Fila de NSS y Habitación */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                                    NSS
                                                </label>
                                                <input 
                                                    value={numeross || ''}
                                                    onChange={(e) => setNumeroSs(e.target.value)}
                                                    type="text"
                                                    placeholder="Número de Seguridad Social"
                                                    className={`px-3 py-2 text-xs rounded-md border transition-all outline-none w-full ${
                                                        darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'
                                                    }`}
                                                />
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                                    Habitación / Cama
                                                </label>
                                                <input
                                                    value={CamaHab || ''} 
                                                    onChange={(e) => setCamaHab(e.target.value)}
                                                    type="text"
                                                    placeholder="Habitación / Cama"
                                                    className={`px-3 py-2 text-xs rounded-md border transition-all outline-none w-full ${
                                                        darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'
                                                    }`}
                                                />
                                            </div>
                                        </div>

                                        {/* Diagnóstico */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                                Diagnóstico del Paciente
                                            </label>
                                            <input 
                                                value={Diagnostico || ''}
                                                onChange={(e) => setDiagnostico(e.target.value)}
                                                type="text"
                                                placeholder="Diagnóstico"
                                                className={`px-3 py-2 text-xs rounded-md border transition-all outline-none ${
                                                    darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'
                                                }`}
                                            />
                                        </div>

                                        {/* Notas - Cambiado a textarea para mejor UX */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                                Notas
                                            </label>
                                            <textarea
                                                value={NotaPac || ''}
                                                onChange={(e) => setNotaPac(e.target.value)}
                                                rows="3"
                                                placeholder="Observaciones adicionales"
                                                className={`px-3 py-2 text-xs rounded-md border transition-all outline-none resize-none ${
                                                    darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'
                                                }`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/*Tabla Servicio*/}
                                <div className={`rounded-xl border-2 transition-all duration-300 overflow-hidden max-w-sm ${
                                    darkMode ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-100 shadow-sm'
                                }`}>
                                    {/* Cabecera más compacta (py-2 en lugar de py-4) */}
                                    <div className={`px-4 py-2 border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                                        <h1 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        Servicio
                                        </h1>
                                    </div>

                                    {/* Cuerpo con padding reducido (p-4) y texto más pequeño (text-xs) */}
                                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        
                                        {/* Input Origen */}
                                        <div className="flex flex-col gap-1 relative">
                                        <label className={`text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                            Origen
                                        </label>
                                        <input
                                            value={lugarOrigen || ''}
                                            onChange={(e) => {
                                                setLugarOrigen(e.target.value);
                                                setSugerenciasOrig(true);
                                            }}
                                            onFocus={() => setSugerenciasOrig(true)}
                                            onBlur={() => setTimeout(() => setSugerenciasOrig(false), 200)}
                                            type="text"
                                            placeholder="Hospital de origen"
                                            className={`px-2 py-1.5 text-xs rounded-md border transition-all outline-none${
                                            darkMode 
                                            ? 'bg-[#1f2937]/50 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'
                                            }`}
                                        />
                                            {SugerenciasOrig && sugerenciasFiltradas.length > 0 && (
                                                <ul className={`absolute top-[100%] left-0 w-full mt-1 z-[100] rounded-md shadow-2xl border overflow-hidden ${
                                                    darkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-200'
                                                }`}>
                                                    {sugerenciasFiltradas.map((hosp, index) => (
                                                        <li 
                                                            key={index}
                                                            onClick={() =>{
                                                                setLugarOrigen(hosp.nombre_hospital);
                                                                setIdOrigen(hosp.id_hospital)
                                                                setSugerenciasOrig(false);
                                                            }}
                                                            className={`px-3 py-2 text-[11px] cursor-pointer transition-colors ${
                                                                    darkMode 
                                                                    ? 'hover:bg-blue-600 text-gray-200 border-b border-gray-700/40' 
                                                                    : 'hover:bg-blue-50 text-slate-700 border-b border-gray-100'
                                                                } last:border-none`}
                                                        >
                                                            <div className="font-bold">{hosp.nombre_hospital}</div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>

                                        {/* Input Destino */}
                                        <div className="flex flex-col gap-1 relative">
                                        <label className={`text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                            Destino
                                        </label>
                                        <input
                                            value={lugarDestino || ''}
                                            onChange={(e) => {
                                                setLugarDestino(e.target.value);
                                                setSugerenciasDest(true);
                                            }}
                                            onFocus={() => setSugerenciasDest(true)}
                                            onBlur={() => setTimeout(() => setSugerenciasDest(false), 200)}
                                            type="text"
                                            placeholder="Hospital de destino"
                                            className={`px-2 py-1.5 text-xs rounded-md border transition-all outline-none${
                                            darkMode 
                                            ? 'bg-[#1f2937]/50 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'
                                            }`}
                                        />
                                            {SugerenciasDest && sugerenciasDestino.length > 0 && (
                                                <ul className={`absolute top-[100%] right-0 w-full mt-1 z-[100] rounded-md shadow-2xl border overflow-hidden ${
                                                    darkMode ? 'bg-[#1e293b] border-gray-700' : 'bg-white border-gray-200'
                                                }`}>
                                                    {sugerenciasDestino.map((hosp, index) => (
                                                        <li 
                                                            key={index}
                                                            onClick={() =>{
                                                                setLugarDestino(hosp.nombre_hospital);
                                                                setIdDestino(hosp.id_hospital)
                                                                setSugerenciasDest(false);
                                                            }}
                                                            className={`px-3 py-2 text-[11px] cursor-pointer transition-colors ${
                                                                    darkMode 
                                                                    ? 'hover:bg-blue-600 text-gray-200 border-b border-gray-700/40' 
                                                                    : 'hover:bg-blue-50 text-slate-700 border-b border-gray-100'
                                                                } last:border-none`}
                                                        >
                                                            <div className="font-bold">{hosp.nombre_hospital}</div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                        
                                        {/*Tipo de Servicio IMSS*/}
                                        <div className="flex flex-col gap-1">
                                        <label className={`text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                            Tipo de Servicio
                                        </label>
                                            <select 
                                                value={tipoServicio || ''}
                                                onChange={(e) => {
                                                    const nombreSeleccionado = e.target.value;
                                                    setTipoServicio(nombreSeleccionado);
                                                    
                                                    // Buscamos el objeto completo en la lista original para extraer su ID
                                                    const servicioEncontrado = listaServicios.find(item => item.nombre_servicio === nombreSeleccionado);
                                                    if (servicioEncontrado) {
                                                        setIdServicio(servicioEncontrado.id_servicio); // Asegúrate de tener este estado definido
                                                    }
                                                }}
                                                className={`px-2 py-1.5 text-xs rounded-md border outline-none cursor-pointer transition-all ${
                                                darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'
                                            }`}>
                                                <option value="" className={darkMode ? 'bg-[#111827]' : 'bg-white text-gray-900'}>
                                                    {cargando ? 'Cargando...' : 'Seleccionar Servicio...'}</option> 

                                                     {listaServicios.filter(item => item.institucion_servicio === 'IMSS')
                                                     .map((item, index) => (
                                                    <option key={index} value={item.nombre_servicio || item } className={darkMode ? 'bg-[#111827]' : 'bg-white text-gray-900'}>
                                                        {item.nombre_servicio}
                                                    </option>
                                                ))}
                                            </select>                                 
                                        </div>

                                        {/*Lista de traslados*/}
                                        <div className="flex flex-col gap-1">
                                        <label className={`text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                            Tipo de Traslado
                                        </label>
                                            <select
                                                value={traslado}
                                                onChange={(e) => setTraslado(e.target.value)}
                                                className={`px-2 py-1.5 text-xs rounded-md border outline-none cursor-pointer transition-all ${
                                                darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'
                                            }`}>
                                                <option value="" className={darkMode ? 'bg-[#111827]' : 'bg-white text-gray-900'}>
                                                    {cargando ? 'Cargando...' : 'Seleccionar Traslado...'}</option>
                                                {Traslados_Tipos.map((opcion, index) => (
                                                    <option key={index} value={opcion} className={darkMode ? 'bg-[#111827]' : 'bg-white text-gray-900'}>
                                                        {opcion}
                                                    </option>
                                                ))}
                                            </select>                                 
                                        </div>   
                                                                     
                                        {/* Nota: Para el campo "Diagnóstico" o "Nota" que ocupan todo el ancho, usa col-span-2 */}

                                        {/*Lista de Prioridad*/}
                                        <div className="flex flex-col gap-1">
                                        <label className={`text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                            Prioridad
                                        </label>
                                            <select
                                                value={prioridadSelec || ''}
                                                onChange={(e) => setPrioridadSelect(e.target.value)}  
                                                className={`px-2 py-1.5 text-xs rounded-md border outline-none cursor-pointer transition-all ${
                                                darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'
                                            }`}>
                                                <option value="" className={darkMode ? 'bg-[#111827]' : 'bg-white text-gray-900'}>
                                                    {cargando ? 'Cargando...' : 'Seleccionar Prioridad...'}</option>
                                                {Prioridad.map((opcion, index) => (
                                                    <option key={index} value={opcion} className={darkMode ? 'bg-[#111827]' : 'bg-white text-gray-900'}>
                                                        {opcion}
                                                    </option>
                                                ))}
                                            </select>                                 
                                        </div>   
                                        {/*Boton Siguiente*/}
                                        <div className="flex flex-col gap-1">
                                            <button className={`flex items-center justify-center gap-3 w-full p-2.5 rounded-xl transition-all duration-300 group cursor-pointer
                                                ${darkMode ? 'text-black bg-white hover:opacity-80' : 'text-white bg-[#004E85] hover:opacity-80'}`}
                                                onClick={() => {
                                                                setIsEstadoOpen(true);
                                                                setMenuSolicitante(false);
                                                            }}>
                                                <span className="text-sm foun-bold">Siguiente</span>
                                                <MoveRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                            </button>                        
                                        </div>   
                                    </div>
                                </div>
                            </div>         
                        </div>
                    </div>
                </div>
                
                {/* Sección de Seguimiento*/}
                <div className={`mt-8 p-6 rounded-xl border-2 transition-all ${
                    darkMode ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-100 shadow-sm'
                }`}>
                    <h4 className={`text-lg font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Folios en Seguimiento</h4>
                    <div className="flex flex-wrap gap-4">
                    {db?.servicios_imss && db.servicios_imss.filter(s => String(s.finalizado).toUpperCase() !== 'TRUE').length > 0 ? (
                        db.servicios_imss
                            .filter(s => String(s.finalizado).toUpperCase() !== 'TRUE')
                            .map((servicio) => (
                                <CardSeguimiento 
                                    key={servicio.id_imss} 
                                    servicio={servicio} 
                                    darkMode={darkMode} 
                                    onPress={(s, tipo) => abrirModalSeguimiento(s,tipo)}
                                />
                            ))
                    ) : (
                        <p className="text-gray-400 italic text-sm p-4">
                            {cargando ? "Cargando servicios..." : "Sin unidades activas en turno"}
                        </p>
                    )}
                    </div>
                </div>

                <div className="mb-6">
                    <h5 className={`text-xl font-bold text-center ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Historial del dia</h5>
                </div> 

                {/* Sección de Historial de Folios */}
                <div className={`mt-8 p-6 rounded-xl border-2 overflow-x-auto transition-all ${
                    darkMode ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-100 shadow-sm'
                }`}>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h4 className={`text-lg font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Servicios del Día</h4>
                        <p className="text-gray-500 text-xs">Resumen operativo de los servicios registrados</p>
                      </div>
                    </div>
                
                    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                        <table className="w-full text-left border-collapse min-w-[600px]"> 
                        <thead>
                            <tr className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-gray-800">
                            <th className="pb-4 font-bold px-2">Folio</th>
                            <th className="pb-4 font-bold px-2">Paciente</th>
                            <th className="pb-4 font-bold px-2">Origen / Destino</th>
                            <th className="pb-4 font-bold px-2">Unidad</th>
                            <th className="pb-4 font-bold px-2">Estatus</th>
                            <th className="pb-4 font-bold text-right px-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {serviciosImssHoy.length > 0 ? (
                                serviciosImssHoy.map((item, index) => (
                                    <tr key={index} className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'} hover:bg-gray-500/5 transition-colors`}>
                                        <td className="py-4 px-2 font-mono font-bold text-blue-500">
                                            {item.folio_imss}
                                        </td>
                                        <td className="py-4 px-2">
                                            <div className="font-bold text-sm">{item.paciente_nombre}</div>
                                            <div className="opacity-60 text-[10px]">{item.paciente_nss}</div>
                                        </td>
                                        <td className="py-4 px-2">
                                            <div className="flex items-center gap-2">
                                                <span className="truncate max-w-[120px]">{item.hospital_origen}</span>
                                                <MoveRight className="w-3 h-3 text-gray-500" />
                                                <span className="truncate max-w-[120px]">{item.hospital_destino}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-2">
                                            {/* Aquí podrías mostrar la unidad asignada si la tienes en los datos */}
                                            <span className="px-2 py-1 rounded bg-gray-500/10 border border-gray-500/20">
                                                {item.unidad_clave || 'Pendiente'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-2">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                                item.estatus_clave === 'FINALIZADO' || item.estatus_clave === 'CANCELADO' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500 animate-pulse'
                                            }`}>
                                                {item.estatus_clave || 'ACTIVO'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-2 text-right">
                                            <button className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors">
                                                <ChevronDown className="w-4 h-4 text-blue-400" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-10 text-center text-gray-500 italic">
                                        No se han registrado servicios el día de hoy.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
        <AgregarSolicitante isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            darkMode={darkMode}
            setLista={setListaSolicitantes}
            datosCatalogo={listaServicios}
            datosSolicitantes={listaSolicitantes}/>

        <AgregarEstado isOpen={isEstadoOpen}
            onClose={() => setIsEstadoOpen(false)} 
            darkMode={darkMode}
            setLista={setListaSolicitantes}
            datosCatalogo={listaServicios}
            datosSolicitantes={listaSolicitantes}
            folioSugerido={folioSugerido}
            prioridadSeleccionada={prioridadSelec}
            nombrepaciente={nombre}
            edadasignada={edadPaciente}
            numeroSeguridad={numeross}
            CamaAsignada={CamaHab}
            DiagnosticoAsig={Diagnostico}
            SeleccionServicio={tipoServicio}
            seleccionTraslado={traslado}
            CodigoAcept={aceptacion}
            Origen={lugarOrigen}
            Destino={lugarDestino}
            Receptor={NombreReceptor}
            nombreSol={datosSolicitante.nombre}
            telsol={datosSolicitante.telefono}
            notaspac={NotaPac}
            Contactoreceptor={ContactoRecept}
            FechaPaciente={fechaNacimiento}
            Enviar={handleEnviarRegistro}/>    

            {tipoModalAbierto === 'MODAL_ASIGNAR' && (
                <AsignarUnidad
                    onClose={() => setIsEstadoOpen(false)} 
                    isOpen={true}
                    darkMode={darkMode}
                    servicio={servicioSeleccionado}
                    listaAsignaciones={db?.asignaciones || []}
                    listaPersonal={db?.personal || []}
                    listaExtra={db?.extra || []}
                    onClose={() => setTipoModalAbierto(null)}
                />
            )} 

            {tipoModalAbierto === 'MODAL_TIEMPOS' && (
                <Seguimiento
                    onClose={() => setIsEstadoOpen(false)} 
                    isOpen={true}
                    darkMode={darkMode}
                    servicio={servicioSeleccionado}
                    onSave={handleSaveSeguimiento}
                    listaAsignaciones={db?.asignaciones || []}
                    listaPersonal={db?.personal || []}
                    listaExtra={db?.extra || []}
                    listaHospitales={db?.hospitales_cat || []}
                    onClose={() => setTipoModalAbierto(null)}
                    
                />
            )}

    </div>
  );
};

export default FoliosImss;