import React, { useState, useMemo } from 'react';
import { X, Ambulance, UserCog, Stethoscope, BriefcaseMedical, FileText, 
  Bot, CheckCircle2, File, User, ShieldQuestionMark, ClockAlert} from 'lucide-react';

const Prioridad = [
    "Verde",
    "Amarilla",
    "Rojo",
    "Azul (rpogramado)"
];

const AsignarUnidadPriv = ({ 
  isOpen, 
  onClose, 
  darkMode, 
  folio,
  listaCotizaciones,
  listaPrivados = [],
  listaAsignaciones = [], 
  listaPersonal = [], 
  listaExtra = [],
  idServicio,
  refrescar,
  limpiar
}) => {
  
  if (!isOpen) return null;

  const inputClass = `px-3 py-2 text-xs rounded-lg border transition-all outline-none w-full
    ${darkMode 
      ? 'bg-gray-800 border-gray-700 text-gray-300 focus:border-blue-500' 
      : 'bg-white border border-gray-100 text-gray-800 focus:border-blue-400'
    }`;

  const labelClass = `text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5
    ${darkMode ? 'text-gray-300' : 'text-gray-500'}`;

  const iconClass = `w-3.5 h-3.5 opacity-60`;

  const fechaActual = new Date().toLocaleDateString('es-ES', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

  const usuarioLogueado = localStorage.getItem('user_name') || 'Usuario Invitado';
  const IdUsuario = localStorage.getItem('user_id') || 'Usuario Invitado';

  // Estados locales declarados correctamente
  const [nombre, setNombre] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [edadPaciente, setEdadPaciente] = useState('');
  const [camaHab, setCamaHab] = useState('');
  const [Indicaciones, setIndicaciones] = useState('');
  const [prioridadSeleccionada, setPrioridadSeleccionada] = useState('');
  const [tiempoRespuesta, setTiempoRespuesta] = useState('');
  
  const [unidadSeleccionada, setUnidadSeleccionada] = useState(null);
  const [medicoSeleccionado, setMedicoSeleccionado] = useState(null);
  const [equipoExtra, setEquipoExtra] = useState("");
  const [NotasOp, setNotasOp] = useState('');

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
  };

  const cotizacionActual = useMemo(() => {
    if (!listaCotizaciones || !Array.isArray(listaCotizaciones)) return null;
    return listaCotizaciones.find(c => c.folio_cotizacion === folio) || null;
  }, [listaCotizaciones, folio]);

  const handleUnidadChange = (e) => {
    const unidadClave = e.target.value;
    const infoAsignacion = listaAsignaciones.find(a => a.unidad_clave === unidadClave);
    setUnidadSeleccionada(infoAsignacion || null);
  };

  const handleMedicoChange = (e) => {
    const personalNombre = e.target.value;
    const infoMedico = listaPersonal.find(a => a.nombre_completo === personalNombre);
    setMedicoSeleccionado(infoMedico || null);
  };

  const folioSugerido = useMemo(() => {
      if (!listaPrivados || !Array.isArray(listaPrivados) || listaPrivados.length === 0){
          return "PRIV-2026-0001";
      }
      const numeros = listaPrivados.map(item => {
          const valorFolio = item.folio_privado ? String(item.folio_privado) : "";
          const partes = valorFolio.split('-');
          const ultimoSegmento = partes[partes.length - 1];
          const numero = parseInt(ultimoSegmento, 10);
          return isNaN(numero) ? 0 : numero;
      });
    const maximoActual = numeros.length > 0 ? Math.max(...numeros) : 0;
    const siguiente = (maximoActual + 1).toString().padStart(4, '0');
    return `PRIV-2026-${siguiente}`;
  }, [listaPrivados]);

  const GuardarDatos = async () => {
    const URL_API = "https://script.google.com/macros/s/AKfycbyvS9cxB5kjuZ3VO3EplAA3xTMJmZS2vj1O5GQzaS0seRKr4L7OiLEyRn14-y66A1CF/exec";
      // Generar un ID único simple para id_imss (similar al de tu imagen)
      const idUnico = `PRIV-${Math.random().toString(16).slice(2, 10).toUpperCase()}`;
      const idunicoBitacora = `BIT-${Math.random().toString(16).slice(2, 10).toUpperCase()}`;
      const ahora = new Date();
      const opcionesHora = { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit', 
      hour12: false 
      };

      const equipoConCategorias = equipoExtra ? equipoExtra.split(', ').map(nombre => {
        const item = listaExtra.find(ex => ex.nombre_extra === nombre);
        return item ? `${item.nombre_extra} (${item.categoria_extra})` : nombre;
        }).join(', ') : '';

          // Construimos la cadena: "16/4/2026 19:40:51"
          const fechaCorta = ahora.toLocaleDateString('es-MX'); // 16/4/2026
          const hora24 = ahora.toLocaleTimeString('es-MX', opcionesHora); // 19:40:51
  
          const fechaHoraUnificada = `${fechaCorta} ${hora24}`;

      const datosARegistrar = {
          targetSheet: "OPS_PRIVADOS", // Indicamos a qué tabla va
          "id_privado": idUnico,
          "folio_privado": folioSugerido,
          "fecha": new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          "h_activacion": new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          "solicitante_nombre": cotizacionActual?.solicitante_nombre || '',
          "contacto_numero": cotizacionActual?.contacto_numero || '',
          "paciente_nombre": nombre,
          "paciente_nacimiento": fechaNacimiento,
          "paciente_edad": edadPaciente,
          "paciente_habitacion": camaHab,
          "paciente_diagnostico": cotizacionActual?.paciente_diagnostico || '',
          "origen": cotizacionActual?.origen || '',
          "destino": cotizacionActual?.destino || '',
          "tipo_traslado": cotizacionActual?.tipo_traslado || '',
          "tipo_servicio": cotizacionActual?.tipo_servicio || '',
          "precio_base":  cotizacionActual?.precio_base || '',
          "tiempo_cortesia": cotizacionActual?.tiempo_cortesia || '',
          "costo_hora": cotizacionActual?.costo_hora || '',
          "km_totales": cotizacionActual?.km_totales || '',
          "costo_km": cotizacionActual?.costo_km || '',
          "total_km": cotizacionActual?.total_km || '',
          "honorarios": cotizacionActual?.honorarios || '',
          "costo_honorarios": cotizacionActual?.costo_honorarios || '0',
          "requisitos": cotizacionActual?.requisitos || '',
          "incluye": cotizacionActual?.incluye || '',
          "observaciones": cotizacionActual?.observaciones || '',
          "costo_original": cotizacionActual?.total_cotizado || '',
          "total_extras": "0",
          "total_final": cotizacionActual.total_cotizado || '',
          "estatus_clave": "ASIGNADO",
          "estatus_nombre": "Asignado",
          "estatus_visual": "assigned",
          "id_asignacion": unidadSeleccionada?.id_asignacion || '',
          "unidad_clave": unidadSeleccionada?.unidad_clave || '',
          "operador": unidadSeleccionada?.operador || '',
          "paramedico": unidadSeleccionada?.paramedico || '',
          "medico_traslado": medicoSeleccionado?.nombre_completo || '',
          "prioridad": prioridadSeleccionada,
          "tiempo_respuesta": tiempoRespuesta,
          "equipo_extra": equipoConCategorias,
          "tripulacion_texto": `${unidadSeleccionada?.operador || '---'} / ${unidadSeleccionada?.paramedico || '---'} / ${medicoSeleccionado?.nombre_completo || '---'}`,
          "created_at": fechaHoraUnificada,
          "activo": "TRUE",
          "finalizado": "FALSE",
          "created_at": fechaHoraUnificada,
          "created_by_id": IdUsuario,
          "created_by_nombre": usuarioLogueado,
          "updated_at": fechaHoraUnificada,
          "updated_by_id": IdUsuario,
          "updated_by_nombre": usuarioLogueado,     
      };

      const registrarBitacora={
        targetSheet: "OPS_PRIVADOS_BITACORA", // Indicamos a qué tabla va
        "id_bitacora": idunicoBitacora,
        "id_privado": idUnico,
        "fecha": new Date().toLocaleString(),
        "hora": new Date().toLocaleTimeString(),
        "accion": 'CREACIÓN DE FOLIO',
        "comentario": 'Solicitud de privado creada',
        "created_by_id": IdUsuario 
      };

      const ActualizarCot={
        targetSheet: "OPS_PRIVADOS_COTIZACIONES",
        primaryKey: "folio_cotizacion",
        "folio_cotizacion": cotizacionActual?.folio_cotizacion,
        "estatus_cotizacion": "DESPACHADA",
        "id_privado_rel": idUnico,
        "folio_priv_rel": folioSugerido
      };

      const ActualizarUnidad={
        targetSheet: "OPS_ASIGNACIONES", // Indicamos a qué tabla va
        primaryKey: "unidad_clave",
        "unidad_clave": unidadSeleccionada?.unidad_clave,
        "estatus_asignacion": "EN_SERVICIO"
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

          await fetch(URL_API, {
              method: 'POST',
              mode: 'no-cors', // Google Apps Script suele requerir esto si no hay proxy
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(ActualizarCot)
          });

          await fetch(URL_API, {
              method: 'POST',
              mode: 'no-cors', // Google Apps Script suele requerir esto si no hay proxy
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(ActualizarUnidad)
          });
          // Al usar no-cors, no podemos leer el JSON de respuesta, 
          // así que ejecutamos la limpieza inmediatamente después de que termine la petición.
          alert("Registro guardado y datos actualizados.");
          onClose();
          limpiar();
          setTimeout(() => {
          refrescar();
      }, 500);

      } catch (error) {
          console.error("Error de red:", error);
          alert("Error al intentar conectar con el servidor.");
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      
      {/* Contenedor Principal con Altura Delimitada para activar Scrollbar */}
      <div className={`w-full max-w-4xl h-[95vh] sm:h-[85vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden transform transition-all animate-in slide-in-from-bottom sm:zoom-in-95 duration-300
        ${darkMode ? 'bg-[#0f172a]' : 'bg-[#f4f6f8]'}`}>
        
        {/* ==================== 1. ENCABEZADO (FIJO) ==================== */}
        <div className="relative shrink-0">
          <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all cursor-pointer"
          >
              <X className="w-5 h-5" />
          </button>
          
          <div className={`p-4 md:p-6 border-b transition-all duration-500 ${
              darkMode ? 'bg-[#1e293b] border-gray-800/50' : 'bg-[#0f172a] border-gray-800/50'   
          }`}>
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 w-full">
                  <div className="flex flex-col gap-3 w-full lg:w-auto">                      
                      <div>
                          <p className="text-[9px] md:text-[10px] tracking-[0.2em] font-bold uppercase text-blue-400">
                              Asignación Unidad Privados
                          </p>
                          
                          <h1 className="text-xl md:text-2xl font-black mt-0.5 tracking-tight text-white">
                              Terapia Móvil
                          </h1>
                                                          
                          <div className="flex flex-wrap gap-x-4 md:gap-x-6 items-center text-[9px] font-mono mt-2">
                              <div className="flex flex-col">
                                  <span className="text-gray-500 font-bold uppercase text-[7px]">Folio Cotización</span>
                                  <span className="font-bold text-blue-400">
                                      {cotizacionActual?.folio_cotizacion || 'COT-0000'}
                                  </span>
                              </div>

                              <div className="self-stretch w-[1px] bg-gray-800 hidden md:block" />

                              <div className="flex flex-col">
                                  <span className="text-gray-500 font-bold uppercase text-[7px]">Tipo traslado</span>
                                  <span className="font-bold uppercase text-white">
                                      {cotizacionActual?.tipo_traslado || '---'}
                                  </span>
                              </div>

                              <div className="self-stretch w-[1px] bg-gray-800 hidden md:block" />

                              <div className="flex flex-col">
                                  <span className="text-gray-500 font-bold uppercase text-[7px]">Tipo servicio</span>
                                  <span className="font-bold uppercase text-white">
                                      {cotizacionActual?.tipo_servicio || '---'}
                                  </span>
                              </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 font-mono text-[9px] mt-3 pt-2.5 border-t border-gray-800/60">
                              <div className="flex items-center gap-1.5">
                                  <span className="text-gray-500 font-bold uppercase text-[7px] shrink-0">Origen:</span>
                                  <span className="font-bold uppercase text-yellow-400 truncate max-w-[280px] sm:max-w-[320px]">
                                      {cotizacionActual?.origen || '---'}
                                  </span>
                              </div>

                              <div className="hidden sm:block text-gray-600 font-bold">➔</div>

                              <div className="flex items-center gap-1.5">
                                  <span className="text-gray-500 font-bold uppercase text-[7px] shrink-0">Destino:</span>
                                  <span className="font-bold uppercase text-emerald-400 truncate max-w-[280px] sm:max-w-[320px]">
                                      {cotizacionActual?.destino || '---'}
                                  </span>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="w-full lg:w-auto mt-2 lg:mt-0 pt-2 lg:pt-0 border-t border-dashed lg:border-t-0 lg:border-l lg:pl-6 border-gray-800">
                      <div className="flex lg:flex-col justify-between items-center lg:items-end gap-1">
                          <p className="text-[7px] md:text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                              Fecha de Emisión
                          </p>
                          <p className="text-[10px] md:text-xs font-bold font-mono text-gray-300 whitespace-nowrap">
                              {fechaActual} - {new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                          </p>
                      </div>
                  </div>
              </div>
          </div>
        </div>

        {/* ==================== 2. CUERPO (SCROLEABLE) ==================== */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Bloque: Datos del Paciente (Alineación Corregida en Rejilla Plana) */}
          <div className={`p-4 rounded-xl border ${
              darkMode ? 'bg-gray-800/40 border-gray-700 shadow-xl' : 'bg-white border-gray-100 shadow-inner'
            }`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Folio Sugerido */}
                <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2">
                    <label className={labelClass}><File className={iconClass} /> Folio Sugerido Operativo</label>
                    <input disabled value={folioSugerido}
                        className={`px-3 py-2 text-xs rounded-lg border font-mono font-bold transition-all ${
                          darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-blue-400' : 'bg-gray-50 border-gray-200 text-blue-600'
                        }`}
                    />
                </div>

                {/* Fila 1 - Izquierda: Nombre */}
                <div className="flex flex-col gap-1.5">
                    <label className={labelClass}><User className={iconClass} /> Nombre del Paciente</label>
                    <input type="text" placeholder="Nombre Completo del Paciente" value={nombre || ''}
                        onChange={(e) => setNombre(e.target.value)} 
                        className={`px-3 py-2 text-xs rounded-lg border transition-all outline-none h-[38px] ${
                            darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-gray-300 focus:border-blue-500' : 'bg-gray-50 border-gray-200 text-gray-600 focus:border-blue-400'
                        }`}
                    />
                </div>

                {/* Fila 1 - Derecha: Fecha y Edad */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Fecha de Nacimiento</label>
                        <input type="date" value={fechaNacimiento} onChange={manejarCambiofecha}
                            className={`px-3 py-2 text-xs rounded-lg border transition-all outline-none w-full h-[38px] ${
                                darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-gray-300 [color-scheme:dark]' : 'bg-gray-50 border-gray-200 text-gray-600 [color-scheme:light]'
                            }`}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Edad del Paciente</label>
                        <input type="text" readOnly placeholder="Automático" value={edadPaciente ? `${edadPaciente} años` : ''}
                            className={`px-3 py-2 text-xs rounded-lg border transition-all outline-none w-full h-[38px] ${
                                darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'
                            }`}
                        />
                    </div>
                </div>

                {/* Fila 2 - Izquierda: Cama / Habitación */}
                <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>Habitación / Cama</label>
                    <input type="text" placeholder="Habitación / Cama" value={camaHab || ''} 
                        onChange={(e) => setCamaHab(e.target.value)}
                        className={`px-3 py-2 text-xs rounded-lg border transition-all outline-none w-full h-[38px] ${
                            darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-gray-300 focus:border-blue-500' : 'bg-gray-50 border-gray-200 text-gray-600 focus:border-blue-400'
                        }`}
                    />
                </div>

                {/* Fila 2 - Derecha: Indicaciones Especiales */}
                <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>Indicaciones especiales</label>
                    <textarea value={Indicaciones || ''} onChange={(e) => setIndicaciones(e.target.value)}
                        rows="1" placeholder="Observaciones adicionales"
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-all outline-none resize-none h-[38px] ${
                            darkMode ? 'bg-[#1f2937]/50 border-gray-700 text-gray-300 focus:border-blue-500' : 'bg-gray-50 border-gray-200 text-gray-600 focus:border-blue-400'
                        }`}
                    />
                </div>
            </div>
          </div>

          {/* Bloque: Asignación Operativa de Recursos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            
            {/* Columna Izquierda */}
            <div className="space-y-4">
              <div>
                <label className={labelClass}><Ambulance className={iconClass} /> Unidad</label>
                <select className={`${inputClass} cursor-pointer`} onChange={handleUnidadChange} value={unidadSeleccionada?.unidad_clave || ""}>
                    <option value="">Seleccionar unidad</option>
                    {listaAsignaciones.map((asig, index) => (
                        <option key={index} value={asig.unidad_clave} disabled={asig.estatus_asignacion !== 'ACTIVA'}>
                          {asig.unidad_clave} ({asig.estatus_asignacion})
                        </option>
                    ))}
                </select>
              </div>
              
              <div>
                <label className={labelClass}><UserCog className={iconClass} /> Paramédico</label>
                <div className="relative">
                    <input type="text" value={unidadSeleccionada?.paramedico || "Automático"} readOnly className={`${inputClass} pr-8 bg-gray-50 dark:bg-gray-800/30 text-gray-400`} />
                    <Bot className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 opacity-60" />
                </div>
              </div>

               <div>
                <label className={labelClass}><ShieldQuestionMark className={iconClass} /> Prioridad del Traslado</label>
                <select className={`${inputClass} cursor-pointer font-bold`} value={prioridadSeleccionada} onChange={(e) => setPrioridadSeleccionada(e.target.value)}>
                    <option value="">Seleccionar Prioridad</option>
                    {Prioridad.map((prio, index) => (
                        <option key={index} value={prio}>{prio}</option>
                    ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className={labelClass}><BriefcaseMedical className={iconClass} /> Equipo adicional requerido</label>
                <div className={`grid grid-cols-2 gap-2 p-3 rounded-lg border overflow-y-auto max-h-[140px] ${
                  darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-gray-100 shadow-inner'
                }`}>
                  {listaExtra && listaExtra.length > 0 ? (
                    listaExtra.map((item, index) => {
                      const nombreItem = item.nombre_extra;
                      const categoria = item.categoria_extra;
                      const isChecked = (equipoExtra || "").split(', ').includes(nombreItem);
                      
                      return (
                        <label key={index} className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all ${
                            isChecked 
                              ? (darkMode ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-blue-50 text-blue-700 border border-blue-100') 
                              : (darkMode ? 'hover:bg-gray-700 text-gray-400 border border-transparent' : 'hover:bg-gray-50 text-gray-600 border border-transparent')
                          }`}>
                          <input type="checkbox" className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked={isChecked || false}
                            onChange={() => {
                              let currentItems = equipoExtra ? equipoExtra.split(', ') : [];
                              if (currentItems.includes(nombreItem)) {
                                currentItems = currentItems.filter(i => i !== nombreItem);
                              } else {
                                currentItems.push(nombreItem);
                              }
                              setEquipoExtra(currentItems.join(', '));
                            }}
                          />
                          <span className="text-[9px] font-black uppercase tracking-tight truncate leading-none">
                            {nombreItem} {categoria && <span className="ml-1 opacity-80 font-semibold block sm:inline">({categoria})</span>}
                          </span>
                        </label>
                      );
                    })
                  ) : (
                    <p className="col-span-2 text-[10px] text-gray-500 italic p-2 text-center">No hay equipo extra disponible</p>
                  )}
                </div>
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-4">
              <div>
                <label className={labelClass}><UserCog className={iconClass} /> Operador</label>
                <div className="relative">
                    <input type="text" value={unidadSeleccionada?.operador || "Automático"} readOnly className={`${inputClass} pr-8 bg-gray-50 dark:bg-gray-800/30 text-gray-400`} />
                    <Bot className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 opacity-60" />
                </div>
              </div>

              <div>
                <label className={labelClass}><Stethoscope className={iconClass} /> Médico de traslado</label>
                <select className={`${inputClass} cursor-pointer`} onChange={handleMedicoChange} value={medicoSeleccionado?.nombre_completo || ""}>
                    <option value="">Seleccionar Médico</option>
                    {listaPersonal.filter(per => per.roles_asociados === 'MEDICO' || per.rol_asociado === 'MEDICO').map((per, index) => (
                        <option key={index} value={per.nombre_completo}>{per.nombre_completo}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className={labelClass}><ClockAlert className={iconClass} /> Tiempo de Respuesta</label>
                <div className="relative flex items-center w-full">
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={tiempoRespuesta || ''}
                    onChange={(e) => setTiempoRespuesta(e.target.value)}
                    className={`${inputClass} pr-16 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                  />
                  <span className={`absolute right-3 text-[10px] font-bold uppercase tracking-wider pointer-events-none ${
                    darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    minutos
                  </span>
                </div>
              </div>

              <div>
                <label className={labelClass}><FileText className={iconClass} /> Observaciones de asignación</label>
                <textarea rows="2" className={`${inputClass} resize-none`} placeholder="Notas operativas..." value={NotasOp} onChange={(e) => setNotasOp(e.target.value)} />
              </div>
            </div>

          </div>
        </div>

        {/* ==================== 3. PIE DE PÁGINA (FIJO) ==================== */}
        <div className={`flex flex-col sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t shrink-0 ${
          darkMode ? 'border-white/10 bg-[#0f172a]' : 'border-gray-200 bg-gray-50'
        }`}>
          <button onClick={onClose} className="order-3 sm:order-1 px-6 py-2 rounded-xl text-xs sm:text-sm font-bold text-gray-500 hover:text-gray-300 transition-colors cursor-pointer">
            Cerrar
          </button>
          <button onClick={GuardarDatos} className="order-1 sm:order-3 flex items-center justify-center gap-2 px-8 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-black shadow-lg shadow-blue-900/20 active:scale-95 transition-all hover:brightness-110 cursor-pointer">
            <CheckCircle2 className="w-4 h-4" />
            Guardar Asignación
          </button>
        </div>

      </div>
    </div>
  );
};

export default AsignarUnidadPriv;