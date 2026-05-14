import React, { useState, useEffect, useMemo, useCallback} from 'react';
import { Ambulance, Activity, AlertTriangle, LogOut, ChartNoAxesCombined, Settings, 
  User, Moon, Sun, Clock, Siren, Hourglass, CalendarDays, CalendarClock, 
  Building,  Hospital, CircleDollarSign, HeartHandshake, TicketCheck,
  Menu, X, Clipboard, MoveRight, ChevronDown} from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import AgregarSolicitante from '../FoliosImss/Agregar_Sol';
import AgregarEstado from '../FoliosImss/Agrgar_Estado';
import CardSeguimiento from '../FoliosImss/CardSeguimiento';
import AsignarUnidad from '../FoliosImss/AsignarUnidad';
import Seguimiento from '../FoliosImss/Seguimiento';

const ESTADOS_MAPA = {
  'EN_SERVICIO': { label: 'Activo', color: 'text-green-400 dark:text-emerald-500', bg: 'bg-emerald-500', pulse: 'animate-pulse' },
  'EN_PROCESO': { label: 'Activo', color: 'text-green-400 dark:text-emerald-500', bg: 'bg-emerald-500', pulse: 'animate-pulse' },
  'FINALIZADO': { label: 'Finalizado', color: 'text-red-400 dark:text-red-600', bg: 'bg-red-500', pulse: '' },
  'NUEVO':  { label: 'Pendiente', color: 'text-amber-500', bg: 'bg-amber-500', pulse: '' },
}

const Traslados_Tipos = [
    "Local",
    "Local-Foráneo",
    "Foráneo-Local",
    "Foráneo-Foráneo"
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


const MainPrivados = () => {
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
  const [SolicitanteNombre, setSolicitanteNombre] = useState('');
  const [contactoSolicitante, setContactoSolicitante] = useState('');
  const [PrecioBase, setPrecioBase] = useState('');
  const [tiempoEspera, setTiempoEspera] = useState('');
  const [costoHora, setCostoHora] = useState('');
  const [costoKm, setCostoKm] = useState('');
  const [puntoOrigen, setPuntoOrigen] = useState('');
  const [puntoDestino, setPuntoDestino] = useState('');
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [distancia, setDistancia] = useState('');
  const [precioDistancia, setPrecioDistancia] = useState('');
  const [honorario, setHonorario] = useState('');
  const [costoHonorario, setCostoHonorario] = useState('');
  const [requisitosEspeciales, setRequisitosEspeciales] = useState('');
  const [datosInlcuye, setDatosIncluye] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [Cancelacion, setCancelacion] = useState('');

  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [edadPaciente, setEdadPaciente] = useState('');
  const [listaServicios, setListaServicios] = useState([]);
  const [tipoServicio, setTipoServicio] = useState('');
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

  const formatearMoneda = (valor) => {
        if (!valor) return '';
        // Quitamos cualquier caracter que no sea número o punto por seguridad
        const numero = parseFloat(valor.toString().replace(/[^\d.]/g, ''));
        if (isNaN(numero)) return '';
        
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0, // Cambia a 2 si quieres centavos ($1,200.00)
            maximumFractionDigits: 0,
        }).format(numero);
    };

  const calculadoraPrecios = () => {
    const km = parseFloat(distancia) || 0;
    const costo = parseFloat(costoKm.replace(/[^\d.]/g, '')) || 0; 
    if (costo<10){
        setPrecioDistancia("Traslado contemplado como local");
    }else{
        const total = km * costo;
        setPrecioDistancia(formatearMoneda(total));
    }
  };

  const limpiarCampos = () => {
        // Apartado Activación
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
        // 1. Actualizamos el estado 'db' que es la fuente de verdad
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
    if (!db || !db.privadosCot || !Array.isArray(db.privadosCot)){
        return "COT-2026-0001";
    }

    const numeros = db.privadosCot.map(item => {
        const valorFolio = item.folio_cotizacion ? String(item.folio_cotizacion) : "";
        const partes = valorFolio.split('-');
        const ultimoSegmento = partes[partes.length - 1];
        const numero = parseInt(ultimoSegmento, 10);
        
        return isNaN(numero) ? 0 : numero;
    });

    const maximoActual = numeros.length> 0 ? Math.max(...numeros): 0;
    const siguiente = (maximoActual + 1).toString().padStart(4, '0');
    return `COT-2026-${siguiente}`;
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
                    <h2 className={`text-xl md:text-3xl font-bold truncate ${darkMode ? 'text-white' : 'text-gray-950'}`}>Servicios Privados</h2>
                    <p className="text-gray-400 text-xs md:tex-sm hidden sm:block">Particulares y Convenios directos</p>
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
                        <p className="text-gray-400 text-sm">Módulo de Servicios Privados</p>
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
                                NUEVA SOLICITUD PRIVADA
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
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                                
                                <div className={`lg:col-span-2 rounded-xl border-2 transition-all duration-300 overflow-hidden w-full ${
                                    darkMode ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-100 shadow-sm'
                                }`}>
                                    {/* Cabecera más compacta (py-2 en lugar de py-4) */}
                                    <div className={`px-4 py-2 border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                                        <h1 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        Datos de Cotización
                                        </h1>
                                    </div>

                                    {/* Cuerpo con padding reducido (p-4) y texto más pequeño (text-xs) */}
                                    <div className="p-4 grid grid-cols-2 sm:grid-cols-2 gap-3">
                                        
                                        {/* Ejemplo de Input compactado */}
                                        <div className="flex flex-col gap-1">
                                        <label className={`text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                            Folio
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
                                            
                                            <input
                                            value={SolicitanteNombre || ''}
                                            onChange={(e) => setSolicitanteNombre(e.target.value)}
                                            placeholder="Nombre del solicitante"
                                            className={`px-2 py-1.5 text-xs rounded-md border outline-none ${
                                            darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                                            }`}
                                        />
                                        </div>
                                        {/*Telefono-Contacto*/}
                                        <div className="flex flex-col gap-1">
                                        <label className={`text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                            Telefono / Contacto
                                        </label>
                                           <input
                                            value={contactoSolicitante || ''}
                                            onChange={(e) => setContactoSolicitante(e.target.value)}
                                            placeholder="Telefono / Contacto"
                                            className={`px-2 py-1.5 text-xs rounded-md border outline-none ${
                                            darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                                            }`}
                                        />                               
                                        </div>
                                
                                        {/* Nota: Para el campo "Diagnóstico" o "Nota" que ocupan todo el ancho, usa col-span-2 */}
                                        <div className="flex flex-col gap-1 col-span-2">
                                        <label className={`text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                            Diagnostico
                                        </label>
                                        <textarea
                                            value={Diagnostico || ''}
                                            onChange={(e) => setDiagnostico(e.target.value)}
                                            placeholder="Diagnóstico principal"
                                            className={`px-2 py-1.5 text-xs rounded-md border outline-none ${
                                            darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                                            }`}
                                        />
                                        </div>
                                        
                                        <div className="flex flex-col gap-1">
                                        <label className={`text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                            Tipo traslado
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

                                        <div className="flex flex-col gap-1">
                                        <label className={`text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                            Tipo de servicio solicitado
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
                                                        const PrecBase = formatearMoneda(servicioEncontrado.costo_base_servicio || 0);
                                                        setPrecioBase(PrecBase); // Si el servicio tiene un precio base, lo asignamos
                                                        setTiempoEspera(servicioEncontrado.tiempo_espera_servicio || '');
                                                        const costoHora = formatearMoneda(servicioEncontrado.costo_tiempo_espera_servicio || 0);
                                                        setCostoHora(costoHora);
                                                        const costoKm = formatearMoneda(servicioEncontrado.costo_por_km_servicio || 0);
                                                        setCostoKm(costoKm);
                                                        setDatosIncluye(servicioEncontrado.que_incluye || '');

                                                    }
                                                }}
                                                className={`px-2 py-1.5 text-xs rounded-md border outline-none cursor-pointer transition-all ${
                                                darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'
                                            }`}>
                                                <option value="" className={darkMode ? 'bg-[#111827]' : 'bg-white text-gray-900'}>
                                                    {cargando ? 'Cargando...' : 'Seleccionar Servicio...'}
                                                </option>
                                                     {listaServicios.filter(item => (item.institucion_servicio === 'PRIVADO' &&
                                                     item.nombre_servicio.trim().toUpperCase() !== 'HONORARIOS MEDICO LOCAL' &&
                                                     item.nombre_servicio.trim().toUpperCase() !== 'HONORARIOS MEDICO FORANEO'))
                                                     .map((item, index) => (
                                                    <option key={index} value={item.nombre_servicio || item } className={darkMode ? 'bg-[#111827]' : 'bg-white text-gray-900'}>
                                                        {item.nombre_servicio}
                                                    </option>
                                                ))}
                                            </select>  
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className={`text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                Precio Base
                                            </label>
                                            <input
                                                value={PrecioBase || ''}
                                                onChange={(e) => setPrecioBase(e.target.value)}
                                                placeholder="$0.00"
                                                className={`px-2 py-1.5 text-xs rounded-md border outline-none ${
                                                    darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                                                }`}
                                            />    
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className={`text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                Tiempo de espera (cortesia)
                                            </label>
                                            
                                            <div className="relative flex items-center">
                                            {/* El prefijo visual */}
                                            <span className="absolute left-3 text-[10px] font-bold text-gray-500 uppercase">
                                                Min:
                                            </span>
                                            <input
                                                value={tiempoEspera || ''}
                                                onChange={(e) => setTiempoEspera(e.target.value)}
                                                placeholder="00:00"
                                                className={`w-full pl-10 pr-2 py-1.5 text-xs rounded-md border outline-none transition-all ${
                                                darkMode 
                                                    ? 'bg-[#1f2937]/50 border-gray-700 text-white focus:border-blue-500' 
                                                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-400'
                                                }`}
                                            />
                                            </div>  
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className={`text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                Costo por Hora/Fraccion
                                            </label>
                                            
                                            <input
                                                value={costoHora || ''}
                                                onChange={(e) => setCostoHora(e.target.value)}
                                                placeholder="$0.00"
                                                className={`px-2 py-1.5 text-xs rounded-md border outline-none ${
                                                    darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                                                }`}
                                            />    
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className={`text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                costo por Km 
                                            </label>
                                            
                                            <input
                                                value={costoKm || ''}
                                                onChange={(e) => {setCostoKm(e.target.value)
                                                    calculadoraPrecios();
                                                }}
                                                placeholder="$0.00"
                                                className={`px-2 py-1.5 text-xs rounded-md border outline-none ${
                                                    darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                                                }`}
                                            />    
                                        </div>
                                    </div>
                                </div>

                                {/*Tabla Adicionales*/}
                                <div className={`lg:row-span-2 h-full flex flex-col rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                                    darkMode ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-100 shadow-sm'
                                }`}>
                                    {/* Cabecera */}
                                    <div className={`px-4 py-2 border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                                        <h1 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        Adicionales
                                        </h1>
                                    </div>

                                    {/* Cuerpo */}
                                    <div className="p-4 grid grid-cols-2 sm:grid-cols-2 gap-3 flex-1">
                                        
                                        {/* Input Horarios */}
                                        <div className="flex flex-col gap-1 relative">
                                        <label className={`text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                            Honorarios medicos
                                        </label>
                                            <select
                                                value={honorario || ''}
                                                onChange={(e) => {
                                                    const honorarioSeleccionado = e.target.value;
                                                    setHonorario(honorarioSeleccionado);

                                                    
                                                    const tipoHonorario = listaServicios.find(item => item.nombre_servicio === honorarioSeleccionado);
                                                    if (tipoHonorario) {
                                                        setIdServicio(tipoHonorario.id_servicio); 
                                                        const precioH = formatearMoneda(tipoHonorario.costo_base_servicio || 0);
                                                        setCostoHonorario(precioH); 
                                                    }
                                                }}
                                                className={`px-2 py-1.5 text-xs rounded-md border outline-none cursor-pointer transition-all ${
                                                darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'
                                            }`}>
                                                <option value="" className={darkMode ? 'bg-[#111827]' : 'bg-white text-gray-900'}>
                                                    {cargando ? 'Cargando...' : 'Seleccione Honorario...'}
                                                </option>
                                                     {listaServicios.filter(item => (item.institucion_servicio === 'PRIVADO' && (
                                                     item.nombre_servicio.trim().toUpperCase() === 'HONORARIOS MEDICO LOCAL' ||
                                                     item.nombre_servicio.trim().toUpperCase() === 'HONORARIOS MEDICO FORANEO')))
                                                     .map((item, index) => (
                                                    <option key={index} value={item.nombre_servicio || item } className={darkMode ? 'bg-[#111827]' : 'bg-white text-gray-900'}>
                                                        {item.nombre_servicio}
                                                    </option>
                                                ))}
                                            </select> 
                                        </div>

                                        {/* Input Costo */}
                                        <div className="flex flex-col gap-1 relative">
                                        <label className={`text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                            Costo honorarios
                                        </label>
                                            <input
                                                value={costoHonorario || ''}
                                                onChange={(e) => setCostoHonorario(e.target.value)}
                                                placeholder="$0.00"
                                                className={`px-2 py-1.5 text-xs rounded-md border outline-none ${
                                                    darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                                                }`}
                                            />   
                                        </div>
                                        
                                        {/*Requisitos*/}
                                        <div className="flex flex-col gap1 col-span-2">
                                            <label className={`text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                Requisitos especiales
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={requisitosEspeciales || ''}
                                                onChange={(e) => setRequisitosEspeciales(e.target.value)}
                                                placeholder="Ej. Oxigeno, monitor, ventilador, camilla especial, personal adicional, etc."
                                                className={`px-2 py-2  text-xs rounded-md border outline-none ${
                                                    darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                                                }`}
                                            />                                
                                        </div>
                                        <div className="flex flex-col gap1 col-span-2">
                                            <label className={`text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                Que incluye el servicio
                                            </label>
                                                <textarea
                                                    rows={5}
                                                    value={datosInlcuye || ''}
                                                    onChange={(e) => setDatosIncluye(e.target.value)}
                                                    placeholder="Descripcion de lo que incluye el servicio"
                                                    className={`px-2 py-1 text-xs rounded-md border outline-none ${
                                                        darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                                                    }`}
                                                />                                
                                        </div>
                                        <div className="flex flex-col gap1 col-span-2">
                                            <label className={`text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                Observaciones
                                            </label>
                                            <textarea
                                                rows={5}
                                                value={observaciones || ''}
                                                onChange={(e) => setObservaciones(e.target.value)}
                                                placeholder="Observaciones generales del servicio"
                                                className={`px-2 py-1  text-xs rounded-md border outline-none ${
                                                    darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                                                }`}
                                            />                                
                                        </div>
                                        <div className="flex flex-col gap1 col-span-2">
                                            <label className={`text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                Politica de cancelación
                                            </label>
                                            <textarea
                                                rows={6}
                                                value={observaciones || ''}
                                                onChange={(e) => setObservaciones(e.target.value)}
                                                placeholder="Condicones de cancelacion de acuerdo a la distancia"
                                                className={`px-2 py-1  text-xs rounded-md border outline-none ${
                                                    darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                                                }`}
                                            />                                
                                        </div>
                                    </div>
                                </div>


                                {/*Tabla Mpa*/}
                                <div className={`lg:col-span-2 rounded-xl border-2 transition-all duration-300 overflow-hidden w-full ${
                                    darkMode ? 'bg-[#111827] border-gray-800' : 'bg-white border-gray-100 shadow-sm'
                                }`}>
                                    {/* Cabecera más compacta (py-2 en lugar de py-4) */}
                                    <div className={`px-4 py-2 border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                                        <h1 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        Localización y Ruta
                                        </h1>
                                    </div>

                                    {/* Cuerpo con padding reducido (p-4) y texto más pequeño (text-xs) */}
                                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        
                                        {/*Ubicación de Origen*/}
                                        <div className="flex flex-col gap-1 relative">
                                            <label className={`text-[10px] font-medium uppercase tracking-wider text-gray-500`}>
                                                Ubicación de origen
                                            </label>
                                            
                                            <input
                                            value={puntoOrigen || ''}
                                            onChange={(e) => setPuntoOrigen(e.target.value)}
                                            placeholder="Ej. Hospital X, Domicilio, etc"
                                            className={`px-2 py-1.5 text-xs rounded-md border outline-none ${
                                            darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                                            }`}
                                        />
                                        </div>
                                        {/*Ubicacion de Destino*/}
                                        <div className="flex flex-col gap-1 relative">
                                        <label className={`text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                            Destino
                                        </label>
                                           <input
                                            value={puntoDestino || ''}
                                            onChange={(e) => setPuntoDestino(e.target.value)}
                                            placeholder="Ej. Hospital General de Pachuca"
                                            className={`px-2 py-1.5 text-xs rounded-md border outline-none ${
                                            darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                                            }`}
                                        />                               
                                        </div>

                                        {/*Boton Ruta*/}
                                        <div className="py-5 flex flex-col gap-1 relative">
                                           <button
                                           onClick={() => setMostrarMapa(true)}
                                           disabled ={!puntoOrigen || !puntoDestino}
                                            className={`px-2 py-1.5 text-xs rounded-md border outline-none cursor-pointer ${
                                            !puntoDestino || !puntoOrigen
                                            ? 'bg-gray-100 border-gray-200 text-gray-900 hover:bg-gray-200' 
                                            : 'bg-[#004E85] border-[#004E85]/20 text-white hover:bg-[#004E85]/90 shadow-lg'
                                            }`}> Trazar Ruta </button>                               
                                        </div>

                                        {mostrarMapa && puntoOrigen && puntoDestino && (
                                          <>  
                                        
                                        <div className="flex flex-col gap-1 col-span-1 sm:col-span-2 md:col-span-3">
                                            <label className={`text-[10px] font-medium uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                Visualizacion de ruta en tiempo real
                                            </label>
                                            <div className={`w-full h-80 rounded-lg overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                                <iframe
                                                    width="100%"
                                                    height="100%"
                                                    frameBorder="0"
                                                    style={{ border: 0 }}
                                                    src={`https://maps.google.com/maps?saddr=${encodeURIComponent(puntoOrigen)}&daddr=${encodeURIComponent(puntoDestino)}&output=embed&dirflg=d`}
                                                    allowFullScreen
                                                ></iframe>                                                                                             
                                            </div>
                                        </div>    
                                        <div className="flex flex-col gap-1 relative animate-in fade-in slide-in-from-top-2 duration-300">
                                            <label className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                                                Km estimados
                                            </label>
                                            <input
                                                value={distancia || ''}
                                                onChange={(e) => setDistancia(e.target.value)}
                                                placeholder="Ej. 42 Km"
                                                className={`px-2 py-1.5 text-xs rounded-md border outline-none ${
                                                    darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                                                }`}
                                            />                               
                                        </div>
                                        <div className="flex flex-col gap-1 relative animate-in fade-in slide-in-from-top-2 duration-400">
                                            <label className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                                                Costo ($)/ Km 
                                            </label>
                                            <input
                                                value={costoKm || ''}
                                                onChange={(e) => setCostoKm(e.target.value)}
                                                placeholder="Ej. 10 $/Km"
                                                className={`px-2 py-1.5 text-xs rounded-md border outline-none ${
                                                    darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                                                }`}
                                            />                               
                                        </div>
                                        <div className="flex flex-col gap-1 relative animate-in fade-in slide-in-from-top-2 duration-500">
                                            <label className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                                                Cotización estimada
                                            </label>
                                            <input
                                                value={precioDistancia || ''}
                                                onChange={(e) => {
                                                    setPrecioDistancia(e.target.value)
                                                    calculadoraPrecios();}}
                                                onBlur={calculadoraPrecios}
                                                placeholder="$0.00"
                                                className={`px-2 py-1.5 text-xs rounded-md border outline-none ${
                                                    darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-white font-bold' : 'bg-gray-50 border-gray-200 text-gray-900 font-bold'
                                                }`}
                                            />                               
                                        </div>
                                        </>
                                        )}
                                        {!mostrarMapa && (
                                            <div className="col-span-1 sm:col-span-2 md:col-span-3 py-10 flex flex-col items-center justify-center bg-gray-500/5 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                                <p className="text-gray-500 italic text-[10px]">
                                                    Configure el origen y destino, luego presione "Trazar Ruta" para ver el mapa y costos.
                                                </p>
                                            </div>
                                        )}                          
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
    </div>
  );
};

export default MainPrivados;