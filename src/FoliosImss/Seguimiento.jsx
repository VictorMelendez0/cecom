import React, { useState, useEffect} from 'react';
import { X, Clock, ClipboardList, Edit3, Save, AlertTriangle} from 'lucide-react';

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

const Seguimiento = ({ isOpen, onClose, servicio, darkMode, onSave, onFinalizar, listaAsignaciones, listaHospitales }) => {
  if (!isOpen || !servicio) return null;

const formatearParaInputTime = (valor) => {
  if (!valor || valor === 'N/A' || valor === ' ') return '';

  let str = String(valor).trim();

  // Si viene como ISO desde Google Sheets
  if (str.includes('T')) {
    const date = new Date(str);

    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
  }

  // Si ya viene HH:mm
  const formato24 = str.match(/^(\d{1,2}):(\d{2})$/);
  if (formato24) {
    return `${formato24[1].padStart(2, '0')}:${formato24[2]}`;
  }

  // Formato AM/PM
  const match = str.match(/(\d{1,2}):(\d{2})\s*([ap]\.?\s*m\.?)?/i);

  if (match) {
    let horas = parseInt(match[1], 10);
    const minutos = match[2];
    const meridiano = match[3]?.toLowerCase();

    if (meridiano) {
      if (meridiano.includes('p') && horas < 12) horas += 12;
      if (meridiano.includes('a') && horas === 12) horas = 0;
    }

    return `${horas.toString().padStart(2, '0')}:${minutos}`;
  }

  return '';
};

const limpiarHoraSheets = (hora) => {
  if (!hora || hora === ' ') return '';

  const str = String(hora).trim();

  // Hora ISO de Google Sheets
  if (str.includes('T')) {
    const date = new Date(str);

    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
  }

  return formatearParaInputTime(str);
};

  const [llegadaOrigen, setLlegadaOrigen] = useState(formatearParaInputTime(servicio.h_origen));
  const [inicioTraslado, setInicioTraslado] = useState(formatearParaInputTime(servicio.h_inicio));
  const [llegadaDestino, setLlegadaDestino] = useState(formatearParaInputTime(servicio.h_destino));
  const [finServicio, setFinServicio] = useState(formatearParaInputTime(servicio.h_final));
  const [llegadaBase, setLlegadaBase] = useState (formatearParaInputTime(servicio.h_llegada));
  const [nota, setNota] = useState(servicio.paciente_nota || '');
  const [confirmandoCancelacion, setConfirmandoCancelacion] = useState(false);
  const [confirmandoFinalizacion, setConfirmandoFinalizacion] = useState(false);
  const idUsuario = localStorage.getItem("user_id") || "Usuario Invitado";
  const [unidadSeleccionada, setUnidadSeleccionada] = useState(null);
  const [hospitalOrigenSeleccionado, setHospitalOrigenSeleccionado] = useState(null);
  const [hospitalDestinoSeleccionado, setHospitalDestinoSeleccionado] = useState(null);
  const [idOrigen, setIdOrigen] = useState(servicio.id_hospital_origen || '');
  const [idDestino, setIdDestino] = useState(servicio.id_hospital_destino || '');

  
  const [isModifying, setIsModifying] = useState(false);
  const [modForm, setModForm] = useState({
    prioridad: servicio.prioridad || '',
    tipo_traslado: servicio.tipo_traslado || '',
    unidad_clave: servicio.unidad_clave || '',
    hospital_origen: servicio.hospital_origen || '',
    hospital_destino: servicio.hospital_destino || '',
    motivo: ''
  });

  const handleUnidadChange = (e) => {
    const unidadClave = e.target.value;
  
    // 1. Actualizamos el formulario para que el select "reaccione"
    setModForm(prev => ({
      ...prev,
      unidad_clave: unidadClave
    }));

    // 2. Buscamos la info extra si la necesitas
    const infoAsignacion = listaAsignaciones.find(a => a.unidad_clave === unidadClave);
    setUnidadSeleccionada(infoAsignacion || null);
  };

  const handleHospitalChange = (e) => {
    const nombreSeleccionado = e.target.value;

    // Buscamos el objeto hospital que coincida con el nombre seleccionado
    const hospitalEncontrado = listaHospitales.find(h => 
        (h.nombre_hospital || h.Nombre || h) === nombreSeleccionado
    );

    // Aquí ya tienes acceso a todas las propiedades, incluido el ID
    const idSeleccionado = hospitalEncontrado?.id_hospital || hospitalEncontrado?.id;
    
    console.log("El ID seleccionado es:", idSeleccionado);

    // Actualizas el formulario
    setModForm(prev => ({
        ...prev,
        hospital_origen: nombreSeleccionado,
        // Opcional: puedes guardar el ID en otra variable del estado si lo necesitas
        hospital_origen_id: idSeleccionado
    }));
  };

  const handleHospitalDestinoChange = (e) => {
    const nombreHospital = e.target.value;

     const hospitalEncontrado = listaHospitales.find(h => 
        (h.nombre_hospital || h.Nombre || h) === nombreHospital
    );

    // Aquí ya tienes acceso a todas las propiedades, incluido el ID
    const idSeleccionado = hospitalEncontrado?.id_hospital || hospitalEncontrado?.id;
    
    console.log("El ID seleccionado es:", idSeleccionado);

    setModForm(prev => ({
      ...prev,
      hospital_destino: nombreHospital,
      hospital_destino_id: idSeleccionado
    }));
  };

 const formatearFechaBitacora = (fecha, hora) => {
  if (!fecha && !hora) return '---';

  const fechaLimpia = fecha || '';
  const horaLimpia = limpiarHoraSheets(hora);

  return `${fechaLimpia} ${horaLimpia}`.trim();
};

  const establecerHoraActual = (setEstado) => {
     const ahora = new Date();
    // Formato HH:mm (24 horas)
    const horas = ahora.getHours().toString().padStart(2, '0');
    const minutos = ahora.getMinutes().toString().padStart(2, '0');
    setEstado(`${horas}:${minutos}`);
  };

  const generarBitacora = () => {
  const eventos = [];

  if (servicio.folio_imss) {
    eventos.push({
      fecha: formatearFechaBitacora(servicio.fecha, servicio.h_creacion),
      usuario: idUsuario,
      evento: 'CREACIÓN DE FOLIO'
    });
  }

  if (servicio.unidad_clave) {
    eventos.push({
      fecha: formatearFechaBitacora(servicio.fecha, servicio.h_asignacion),
      usuario: idUsuario,
      evento: `ASIGNACIÓN DE UNIDAD (${servicio.unidad_clave})`
    });
  }

  if (servicio.h_origen && servicio.h_origen !== ' ') {
    eventos.push({
      fecha: formatearFechaBitacora(
        servicio.fecha,
        servicio.h_origen
      ),
      usuario: 'OPERADOR',
      evento: 'LLEGADA AL ORIGEN'
    });
  }

  if (servicio.h_inicio && servicio.h_inicio !== ' ') {
    eventos.push({
      fecha: formatearFechaBitacora(
        servicio.fecha,
        servicio.h_inicio
      ),
      usuario: 'OPERADOR',
      evento: 'INICIO DE TRASLADO'
    });
  }

  if (servicio.h_destino && servicio.h_destino !== ' ') {
    eventos.push({
      fecha: formatearFechaBitacora(
        servicio.fecha,
        servicio.h_destino
      ),
      usuario: 'OPERADOR',
      evento: 'LLEGADA A DESTINO'
    });
  }

  if (servicio.h_final && servicio.h_final !== ' ') {
    eventos.push({
      fecha: formatearFechaBitacora(
        servicio.fecha,
        servicio.h_final
      ),
      usuario: 'OPERADOR',
      evento: 'FINALIZACIÓN DE SERVICIO'
    });
  }

  if (modForm.motivo) {
    eventos.push({
      fecha:
        new Date().toLocaleDateString('es-MX') +
        ' ' +
        new Date().toLocaleTimeString('es-MX', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }),
      usuario: 'OPERADOR',
      evento: `MODIFICACIÓN: ${modForm.motivo}`
    });
  }

  return eventos.reverse();
};

  const bitacora = generarBitacora();

  // Ajuste de overlay para móviles (centrado o pegado abajo)
  const overlayClass = "fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300";
  
  // Modal: En móvil ocupa casi toda la pantalla y tiene scroll interno
  const modalClass = `w-full max-w-5xl h-full sm:h-auto max-h-[100vh] sm:max-h-[90vh] rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden transform transition-all animate-in zoom-in-95 duration-300 ${
    darkMode ? 'bg-[#0b1120] border-x-0 sm:border border-gray-800' : 'bg-white border-x-0 sm:border border-gray-100'
  }`;
  
  const headerLabelClass = "text-[10px] font-bold uppercase text-gray-500 tracking-wider";
  const sectionClass = `p-5 sm:p-6 ${darkMode ? 'border-b border-gray-800' : 'border-b border-gray-100'}`;
  const sectionTitleClass = "text-sm font-bold flex items-center gap-2 mb-5 uppercase tracking-widest text-gray-400";

  const bitacoraMock = [
    { fecha: '16/04/2026 19:40', usuario: 'SISTEMA', evento: 'CREACIÓN DE FOLIO' },
    { fecha: '04/05/2026 14:33', usuario: 'ADMIN', evento: 'ASIGNACIÓN DE UNIDAD (TM20)' },
  ];

  const handleActualizar = async () => {
        const URL_API = "https://script.google.com/macros/s/AKfycbyvS9cxB5kjuZ3VO3EplAA3xTMJmZS2vj1O5GQzaS0seRKr4L7OiLEyRn14-y66A1CF/exec";
        // Definimos variables por defecto
        let nuevoEstatusClave = "ASIGNADO";
        let nuevoEstatusNombre = "Asignado";
        let nuevoEstatusVisual = "assigned";
        let nuevoEstatusUnidad = "ASIGNADA";

        // Lógica de cascada: la hora más avanzada define el estado actual
        if (finServicio && finServicio !== ' ') {
            nuevoEstatusClave = "FINALIZADO";
            nuevoEstatusNombre = "Finalizado";
            nuevoEstatusVisual = "closed";
            nuevoEstatusUnidad = "EN_SERVICIO"; // La unidad se libera
        } else if (llegadaDestino && llegadaDestino !== ' ') {
            nuevoEstatusClave = "EN_DESTINO";
            nuevoEstatusNombre = "En Destino";
            nuevoEstatusVisual = "active";
            nuevoEstatusUnidad = "EN_SERVICIO";
        } else if (inicioTraslado && inicioTraslado !== ' ') {
            nuevoEstatusClave = "EN_TRASLADO";
            nuevoEstatusNombre = "En Traslado";
            nuevoEstatusVisual = "tracking";
            nuevoEstatusUnidad = "EN_SERVICIO";
        } else if (llegadaOrigen && llegadaOrigen !== ' ') {
            nuevoEstatusClave = "EN_SITIO";
            nuevoEstatusNombre = "En Sitio";
            nuevoEstatusVisual = "active";
            nuevoEstatusUnidad = "EN_SERVICIO";
        }
        const idunicoBitacora = `BIT-${Math.random().toString(16).slice(2, 10).toUpperCase()}`;
        
        const UpdateHoras = {
            targetSheet: "OPS_IMSS",
            primaryKey: "folio_imss",
            "folio_imss": servicio?.folio_imss,
            "id_hospital_origen": idOrigen || hospital_origen_id || '',
            "hospital_origen": modForm.hospital_origen || servicio.hospital_origen || ' ',
            "id_hospital_destino": idDestino || hospital_destino_id || '',
            "hospital_destino": modForm.hospital_destino || servicio.hospital_destino || ' ',
            "tipo_traslado": modForm.tipo_traslado || servicio.tipo_traslado || ' ',
            "unidad_clave": modForm.unidad_clave || servicio.unidad_clave || ' ',
            "prioridad": modForm.prioridad || servicio.prioridad || ' ',
            "h_origen": llegadaOrigen || ' ',
            "h_inicio": inicioTraslado || ' ',
            "h_destino": llegadaDestino || ' ',
            "h_llegada": llegadaBase || ' ',
            "h_final": finServicio || ' ',
            // Valores dinámicos calculados arriba
            "estatus_clave": nuevoEstatusClave,
            "estatus_nombre": nuevoEstatusNombre,
            "estatus_visual": nuevoEstatusVisual
        };

        const UpdateEstado = {
            targetSheet: "OPS_ASIGNACIONES",
            primaryKey: "unidad_clave",
            "unidad_clave": servicio?.unidad_clave, // Usamos la unidad del servicio actual
            "estatus_asignacion": nuevoEstatusUnidad,
        };

        let accionBitacora = "REGISTRO DE TIEMPOS";
        let comentarioBitacora = `Se actualizaron los tiempos del servicio: Origen(${llegadaOrigen}), Traslado(${inicioTraslado}), Destino(${llegadaDestino}), Fin(${finServicio}), Base(${llegadaBase})`;

        // Si el usuario está en el modo "Modificar", cambiamos el mensaje
        if (isModifying) {
            accionBitacora = "MODIFICACIÓN ADMINISTRATIVA";
            comentarioBitacora = modForm.motivo 
                ? `Cambio de datos del servicio. Motivo: ${modForm.motivo}` 
                : "Se modificaron datos del servicio (Prioridad/Unidad/Hospitales) sin motivo especificado";
        }

        const registrarBitacora={
          targetSheet: "OPS_IMSS_BITACORA", // Indicamos a qué tabla va
          "id_bitacora": idunicoBitacora,
          "id_imss": servicio?.id_imss,
          "fecha": new Date().toLocaleString( 'es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', }),
          "hora": new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          "accion": accionBitacora,
          "comentario": comentarioBitacora,
          "estatus": servicio?.estatus_clave || '---',
          "created_by_id": "OPERADOR" 
        };

        try {
            await fetch(URL_API, {
                method: 'POST',
                mode: 'no-cors', // Google Apps Script suele requerir esto si no hay proxy
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(UpdateHoras)
            });

            await fetch(URL_API, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(UpdateEstado)
            });

            await fetch(URL_API, {
              method: 'POST',
              mode: 'no-cors',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(registrarBitacora)
            });

            alert("Registro guardado");
            if (onSave) {
                onSave({
                    ...servicio, // Mantenemos los datos anteriores
                    h_origen: llegadaOrigen,
                    h_inicio: inicioTraslado,
                    h_destino: llegadaDestino,
                    h_final: finServicio,
                    h_llegada: llegadaBase,
                    estatus_clave: nuevoEstatusClave, // Esto detonará el cambio de color
                    estatus_nombre: nuevoEstatusNombre,
                    estatus_visual: nuevoEstatusVisual
                });
            }
            onClose();

        } catch (error) {
            console.error("Error de red:", error);
            alert("Error al intentar conectar con el servidor.");
        }
    };

  const iniciarCancelacion = () => {
    setConfirmandoCancelacion(true);
};
  
  const Cancelacion = async () => {
          const URL_API = "https://script.google.com/macros/s/AKfycbyvS9cxB5kjuZ3VO3EplAA3xTMJmZS2vj1O5GQzaS0seRKr4L7OiLEyRn14-y66A1CF/exec";
          
           const idunicoBitacora = `BIT-${Math.random().toString(16).slice(2, 10).toUpperCase()}`;

          const datosUpdate = {
              targetSheet: "OPS_IMSS", 
              primaryKey: "folio_imss",
              "folio_imss": servicio?.folio_imss,
              
              "estatus_clave": "CANCELADO",
              "estatus_nombre": "Cancelado",
              "estatus_visual": "cancelled",
              "activo": "FALSE",
              "finalizado": "TRUE"
          };
  
          const UpdateEstado = {
            targetSheet: "OPS_ASIGNACIONES", // Indicamos a qué tabla va
            primaryKey: "unidad_clave",
            "unidad_clave":servicio?.unidad_clave,
            "estatus_asignacion": "ACTIVA" // La unidad se libera,
          };
          
          const registrarBitacora={
          targetSheet: "OPS_IMSS_BITACORA", // Indicamos a qué tabla va
          "id_bitacora": idunicoBitacora,
          "id_imss": servicio?.id_imss,
          "fecha": new Date().toLocaleString( 'es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', }),
          "hora": new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          "accion": "CANCELACION DE SERVICIO",
          "comentario": "SE CANCELO EL SERVICIO DESDE EL SEGUIMIENTO POR EL OPERADOR",
          "estatus": servicio?.estatus_clave || '---',
          "created_by_id": "OPERADOR" 
        };
  
  
          try {
              await fetch(URL_API, {
                  method: 'POST',
                  mode: 'no-cors', // Google Apps Script suele requerir esto si no hay proxy
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(datosUpdate)
              });
  
              await fetch(URL_API, {
                  method: 'POST',
                  mode: 'no-cors',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(UpdateEstado)
              });

              await fetch(URL_API, {
              method: 'POST',
              mode: 'no-cors',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(registrarBitacora)
            });
  
              alert("Cancelación realizada con éxito.");
              if (onSave) {
                  onSave({
                      ...servicio,
                      estatus_clave: "CANCELADO",
                      estatus_nombre: "Cancelado",
                      estatus_visual: "cancelled",
                      finalizado: "TRUE",
                      activo: "FALSE"
                  });
              }
              onClose();
  
          } catch (error) {
              console.error("Error de red:", error);
              alert("Error al intentar conectar con el servidor.");
          }
  
    };
  const iniciarFinalizacion = () => {
    setConfirmandoFinalizacion(true);
  };

  const Finalizar = async () => {
          const URL_API = "https://script.google.com/macros/s/AKfycbyvS9cxB5kjuZ3VO3EplAA3xTMJmZS2vj1O5GQzaS0seRKr4L7OiLEyRn14-y66A1CF/exec";
                
          const datosUpdate = {
              targetSheet: "OPS_IMSS", 
              primaryKey: "folio_imss",
              "folio_imss": servicio?.folio_imss,
              
              "estatus_clave": "FINALIZADO",
              "estatus_nombre": "Finalizado",
              "estatus_visual": "closed",
              "activo": "TRUE",
              "finalizado": "TRUE"
          };
  
          const UpdateEstado = {
            targetSheet: "OPS_ASIGNACIONES", // Indicamos a qué tabla va
            primaryKey: "unidad_clave",
            "unidad_clave":servicio?.unidad_clave,
            "estatus_asignacion": "ACTIVA" // La unidad se libera,
          };
  
  
  
          try {
              await fetch(URL_API, {
                  method: 'POST',
                  mode: 'no-cors', // Google Apps Script suele requerir esto si no hay proxy
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(datosUpdate)
              });
  
              await fetch(URL_API, {
                  method: 'POST',
                  mode: 'no-cors',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(UpdateEstado)
              });
  
              alert("Finalización realizada con éxito.");
              if (onSave) {
                  onSave({
                      ...servicio,
                      estatus_clave: "FINALIZADO",
                      estatus_nombre: "Finalizado",
                      estatus_visual: "closed",
                      finalizado: "TRUE",
                      activo: "TRUE"
                  });
              }
              onClose();
  
          } catch (error) {
              console.error("Error de red:", error);
              alert("Error al intentar conectar con el servidor.");
          }
  
    };
  
useEffect(() => {
  if (servicio && isOpen) {
    // Sincronizamos el estado local con los nuevos datos del servicio
    setLlegadaOrigen(formatearParaInputTime(servicio.h_origen));
    setInicioTraslado(formatearParaInputTime(servicio.h_inicio));
    setLlegadaDestino(formatearParaInputTime(servicio.h_destino));
    setFinServicio(formatearParaInputTime(servicio.h_final));
    setLlegadaBase(formatearParaInputTime(servicio.h_llegada));
    setNota(servicio.paciente_nota || '');

    setModForm({
      prioridad: servicio.prioridad || '',
      tipo_traslado: servicio.tipo_traslado || '',
      unidad_clave: servicio.unidad_clave || '',
      hospital_origen: servicio.hospital_origen || '',
      hospital_destino: servicio.hospital_destino || '',
      motivo: '' // Limpiamos el motivo para la nueva edición
    });
  }
}, [servicio, isOpen]); 

  return (
    <div className={overlayClass} onClick={onClose}>
      <div className={modalClass} onClick={(e) => e.stopPropagation()}>
        
        {/* === TOPBAR: Se mantiene intacto según tu petición === */}
        <div className={`p-4 sm:p-5 flex items-start justify-between border-b shrink-0 ${darkMode ? 'bg-[#1e293b] border-white/10' : 'bg-gray-100 border-gray-200'}`}>
          <div className="flex-1 grid grid-cols-2 md:grid-cols-6 gap-x-4 gap-y-3">
            <div className="flex flex-col min-w-0">
              <span className={headerLabelClass}>Folio</span>
              <span className="text-[11px] sm:text-sm font-extrabold text-blue-500 font-mono px-2 py-0.5 rounded bg-blue-500/10 self-start">
                {servicio.folio_imss || 'IMSS-0000-0000'}
              </span>
            </div>
            <HeaderItem label="UNIDAD" value={servicio.unidad_clave || 'Pendiente'} darkMode={darkMode} />
            <HeaderItem label="ORIGEN" value={servicio.hospital_origen || '---'} darkMode={darkMode} />
            <HeaderItem label="DESTINO" value={servicio.hospital_destino || '---'} darkMode={darkMode} />
            <HeaderItem label="TRASLADO" value={servicio.tipo_traslado || '---'} darkMode={darkMode} />
            <div className="flex flex-col min-w-0">
              <span className={headerLabelClass}>Prioridad</span>
              <span className={`text-xs font-bold leading-tight uppercase ${
                servicio.prioridad === 'Urgente' ? 'text-red-500' : 'text-emerald-500'
              }`}>{servicio.prioridad || 'Normal'}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 -mt-1 rounded-full text-gray-500 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* === BODY: Scroll independiente para móvil === */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
            
            <div className="xl:col-span-2 space-y-6 sm:space-y-8">
              {/* Tiempos: 1 col en móvil, 2 en tablet, 4 en desktop */}
              <section className="space-y-4">
                <h3 className={sectionTitleClass}><Clock className="w-4 h-4 text-blue-500" /> Tiempos del Servicio</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <TimeInput label="Llegada al origen" value={llegadaOrigen || ""} onChange={setLlegadaOrigen} onClick={() => establecerHoraActual(setLlegadaOrigen)} darkMode={darkMode} showClear={false}/>
                  <TimeInput label="Inicio de traslado" value={inicioTraslado || ""} onChange={setInicioTraslado} onClick={() => establecerHoraActual(setInicioTraslado)} darkMode={darkMode} showClear={false}/>
                  <TimeInput label="Llegada a destino" value={llegadaDestino || ""} onChange={setLlegadaDestino} onClick={() => establecerHoraActual(setLlegadaDestino)} darkMode={darkMode} showClear={false}/>
                  <TimeInput label="Fin de servicio" value={finServicio || ""} onChange={setFinServicio} onClick={() => establecerHoraActual(setFinServicio)} darkMode={darkMode} showClear={false}/>
                  <TimeInput label="Llegada a la base" value={llegadaBase || ""} onChange={setLlegadaBase} onClick={() => establecerHoraActual(setLlegadaBase)} darkMode={darkMode} showClear={false}/>  
                </div>
              </section>

              <section className="space-y-3">
                <label className={headerLabelClass}><Edit3 className="w-3.5 h-3.5 text-blue-500" /> Nota de seguimiento</label>
                <textarea 
                  rows="4" 
                  className={`w-full px-4 py-3 text-sm rounded-lg border resize-none transition-all outline-none
                    ${darkMode ? 'bg-gray-800/50 border-gray-700 text-white focus:border-blue-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-400'}`}
                  placeholder="Escribir actualización..."
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                />
              </section>
            </div>

            {/* Bitácora: Visible abajo en móvil */}
            <aside className={`p-5 rounded-2xl border ${darkMode ? 'bg-gray-900/40 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
              <h3 className={sectionTitleClass}><ClipboardList className="w-4 h-4 text-amber-500" /> Bitácora Operativa</h3>
              <div className="space-y-6 h-auto sm:max-h-[400px] overflow-y-auto font-mono text-[11px] pr-2 custom-scrollbar">
                {bitacora.length > 0 ? (
                  bitacora.map((entry, index) => (
                    <div key={index} className="flex gap-4 relative animate-in slide-in-from-left duration-300">
                      {index < bitacora.length - 1 && (
                        <div className={`absolute left-[5px] top-4 bottom-[-24px] w-[1px] ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} opacity-50`} />
                      )}
                      <div className="w-[11px] h-[11px] rounded-full bg-blue-500/30 border border-blue-500 mt-1 shrink-0 z-10" />
                      <div>
                        <p className="text-gray-500 text-[9px] mb-0.5 font-sans">{entry.fecha}</p>
                        <p className={`font-bold leading-tight ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          <span className="text-blue-400">{entry.usuario}</span>: {entry.evento}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic text-center py-10">No hay registros aún</p>
                )}
              </div>
            </aside>
          </div>
        </div>

        {/* === FOOTER: Botones apilados en móvil === */}
        <div className={`p-4 sm:p-6 flex flex-col sm:flex-row justify-end gap-3 border-t shrink-0 ${darkMode ? 'border-gray-800 bg-[#0b1120]' : 'border-gray-100 bg-gray-50'}`}>
          <button 
            onClick={handleActualizar} 
            className="order-1 sm:order-1 w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-black text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20 active:scale-95 transition-all cursor-pointer"
          >
            Guardar Cambios
          </button>
          <div className="order-2 sm:order-2 flex gap-3 w-full sm:w-auto">
            <button onClick={() => setIsModifying(true)} className="flex-1 sm:flex-none px-4 py-3 rounded-xl text-xs font-bold border border-[#708A8A]/20 text-[#708A8A] bg-[#708A8A]/5 hover:bg-[#708A8A]/10 transition-colors cursor-pointer">
              Modificar
            </button>
            <button onClick={iniciarFinalizacion} className="flex-1 sm:flex-none px-4 py-3 rounded-xl text-xs font-bold border border-amber-500/20 text-amber-500 bg-amber-500/5 hover:bg-amber-500/10 transition-colors cursor-pointer">
              Finalizar
            </button>
            <button onClick={iniciarCancelacion} className="flex-1 sm:flex-none px-4 py-3 rounded-xl text-xs font-bold border border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/10 transition-colors cursor-pointer">
              Cancelar
            </button>
          </div>
          <button onClick={onClose} className="order-4 sm:order-4 w-full sm:w-auto px-5 py-3 text-sm font-bold text-gray-500 hover:text-white transition-colors cursor-pointer">
            Cerrar
          </button>     
        </div>
      </div>
      {confirmandoCancelacion && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl ${darkMode ? 'bg-[#1e293b] border border-gray-700' : 'bg-white'}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4 text-amber-500">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold">CANCELAR SERVICIO</h3>
            </div>
            
            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              ¿Estás seguro de cancelar este folio? Esta acción es irreversible.
            </p>

            <div className="flex gap-3">
              <button 
                onClick={(e) =>{
                  e.stopPropagation();
                  setConfirmandoCancelacion(false);
                }}
                className={`flex-1 py-3 rounded-xl font-bold text-xs cursor-pointer hover:bg-gray-500 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
              >
                Regresar
              </button>
              <button 
                onClick={Cancelacion}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all cursor-pointer"
              >
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {confirmandoFinalizacion && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl ${darkMode ? 'bg-[#1e293b] border border-gray-700' : 'bg-white'}`} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4 text-amber-500">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold">FINALIZAR SERVICIO</h3>
            </div>
            
            <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              ¿Estás seguro de finalizar este folio? Esta acción es irreversible.
            </p>

            <div className="flex gap-3">
              <button 
                onClick={(e) =>{
                  e.stopPropagation();
                  setConfirmandoFinalizacion(false);
                }}
                className={`flex-1 py-3 rounded-xl font-bold text-xs cursor-pointer hover:bg-gray-500 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
              >
                Regresar
              </button>
              <button 
                onClick={Finalizar}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all cursor-pointer"
              >
                Sí, finalizar
              </button>
            </div>
          </div>
        </div>
      )}
      {isModifying && (
        <div 
          className="fixed inset-0 z-[130] flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className={`w-full max-w-4xl h-full sm:h-auto max-h-[100vh] sm:max-h-[90vh] rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 ${
              darkMode ? 'bg-[#1e293b] border-x-0 sm:border border-gray-700' : 'bg-white border-x-0 sm:border border-gray-100'
            }`}
            onClick={(e) => e.stopPropagation()}
          >

            {/* Header - Ajustado para ser más compacto en móvil */}
            <div className={`p-4 sm:p-5 flex items-center justify-between border-b shrink-0 ${darkMode ? 'border-gray-700 bg-gray-900/20' : 'border-gray-100 bg-gray-50/50'}`}>
              <h2 className={`text-base sm:text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Modificar servicio</h2>
              <button 
                onClick={() => setIsModifying(false)} 
                className="p-2 hover:bg-gray-500/10 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Body - Padding ajustable y scroll mejorado */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
              
              {/* Sección: Datos del Servicio */}
              <section className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-blue-500 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" /> Datos del Servicio
                </h3>
                {/* Grid: 1 columna en móvil, 3 en tablet/PC */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Prioridad</label>
                    <select 
                      value={modForm.prioridad}
                      onChange={(e) => setModForm({...modForm, prioridad: e.target.value})}
                      className={`w-full p-3 rounded-xl border text-sm outline-none appearance-none ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}
                    >
                      {Prioridad.map((opcion, index) => (
                          <option key={index} value={opcion} className={darkMode ? 'bg-[#111827]' : 'bg-white text-gray-900'}>
                              {opcion}
                          </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Tipo de traslado</label>
                    <select 
                      value={modForm.tipo_traslado}
                      onChange={(e) => setModForm({...modForm, tipo_traslado: e.target.value})}
                      className={`w-full p-3 rounded-xl border text-sm outline-none appearance-none ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}
                    >
                      {Traslados_Tipos.map((opcion, index) => (
                          <option key={index} value={opcion} className={darkMode ? 'bg-[#111827]' : 'bg-white text-gray-900'}>
                              {opcion}
                          </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Unidad</label>
                    <select 
                      value={modForm.unidad_clave}
                      onChange={handleUnidadChange}
                      className={`w-full p-3 rounded-xl border text-sm outline-none appearance-none ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <option value="">Seleccionar unidad</option>
                      {listaAsignaciones.map((asig, index) => (
                          <option key={index} value={asig.unidad_clave} disabled={asig.estatus_asignacion !== 'ACTIVA'}>
                            {asig.unidad_clave} {asig.estatus_asignacion}
                          </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Origen</label>
                    <select 
                      value={modForm.hospital_origen}
                      onChange={handleHospitalChange}
                      className={`w-full p-3 rounded-xl border text-sm outline-none appearance-none ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <option value="">Seleccionar hospital</option>
                      {listaHospitales && listaHospitales.map((hospital, index) => {
                       
                        const nombre = hospital.nombre_hospital || hospital.Nombre || hospital; 
                        return (
                          <option key={index} value={nombre}>
                            {nombre}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Destino</label>
                    <select 
                      value={modForm.hospital_destino}
                      onChange={handleHospitalDestinoChange}
                      className={`w-full p-3 rounded-xl border text-sm outline-none appearance-none ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <option value="">Seleccionar hospital</option>
                      {listaHospitales && listaHospitales.map((hospital, index) => {
                       
                        const nombre = hospital.nombre_hospital || hospital.Nombre || hospital; 
                        return (
                          <option key={index} value={nombre}>
                            {nombre}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </section>

              {/* Sección: Tiempos - Grid adaptable */}
              <section className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-blue-500 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Tiempos del Servicio
                </h3>
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4">
                  <TimeInput label="Origen" value={llegadaOrigen} onChange={setLlegadaOrigen} onClick={() => establecerHoraActual(setLlegadaOrigen)} darkMode={darkMode} showClear={true}/>
                  <TimeInput label="Inicio" value={inicioTraslado} onChange={setInicioTraslado} onClick={() => establecerHoraActual(setInicioTraslado)} darkMode={darkMode} showClear={true}/>
                  <TimeInput label="Destino" value={llegadaDestino} onChange={setLlegadaDestino} onClick={() => establecerHoraActual(setLlegadaDestino)} darkMode={darkMode} showClear={true}/>
                  <TimeInput label="Fin" value={finServicio} onChange={setFinServicio} onClick={() => establecerHoraActual(setFinServicio)} darkMode={darkMode} showClear={true}/>
                    <TimeInput label="Base" value={llegadaBase || ""} onChange={setLlegadaBase} onClick={() => establecerHoraActual(setLlegadaBase)} darkMode={darkMode} showClear={false}/>
                </div>
              </section>

              {/* Sección: Nota */}
              <section className="space-y-1.5 pb-4">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Nota de modificación</label>
                <textarea 
                  rows="3"
                  placeholder="Motivo de la modificación..."
                  value={modForm.motivo}
                  onChange={(e) => setModForm({...modForm, motivo: e.target.value})}
                  className={`w-full p-3 rounded-xl border text-sm outline-none resize-none transition-all ${
                    darkMode ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' : 'bg-gray-50 border-gray-200 focus:border-blue-400'
                  }`}
                />
              </section>
            </div>

            {/* Footer - Botones apilados en móvil, lado a lado en PC */}
            <div className={`p-4 sm:p-6 flex flex-col sm:flex-row justify-end gap-3 border-t shrink-0 ${darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
              <button 
                onClick={handleActualizar}
                className="w-full sm:w-auto order-1 sm:order-2 px-8 py-3.5 rounded-xl text-sm font-black text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20 active:scale-95 transition-all cursor-pointer"
              >
                Guardar cambios
              </button>
              <button 
                onClick={() => setIsModifying(false)}
                className={`w-full sm:w-auto order-2 sm:order-1 px-8 py-3.5 rounded-xl text-sm font-bold border transition-colors cursor-pointer ${
                  darkMode ? 'border-gray-700 text-gray-400 hover:bg-gray-800' : 'border-gray-200 text-gray-500 hover:bg-white'
                }`}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TimeInput = ({ label, value, onChange, onClick, darkMode, showClear }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <div className="flex justify-between items-center">
      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</label>
      {/* Solo muestra el botón si showClear es true y hay un valor */}
      {showClear && value && (
        <button 
          onClick={(e) => { 
            e.preventDefault();
            e.stopPropagation(); 
            onChange(""); 
          }}
          className="text-[9px] font-bold text-red-400 hover:text-red-500 uppercase cursor-pointer z-30"
        >
          Limpiar
        </button>
      )}
    </div>
    <div className="relative flex items-center">
      <input 
        type="time" 
        value={value || ""} 
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 text-sm rounded-xl border transition-all outline-none pr-12
          ${darkMode ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500 [color-scheme:dark]' 
                     : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-400 [color-scheme:light]'} 
          [&::-webkit-calendar-picker-indicator]:hidden`} 
      />
      <div 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (onClick) onClick();
        }} 
        onMouseDown={(e) => e.stopPropagation()}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 cursor-pointer text-gray-400 hover:text-blue-500 transition-colors z-[50]"
      >
        <Clock className="w-[18px] h-[18px]" strokeWidth={2.5} />
      </div>
    </div>
  </div>
);

const HeaderItem = ({ label, value, darkMode }) => (
  <div className="flex flex-col min-w-0">
    <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider mb-0.5">{label}</span>
    <span className={`text-[11px] sm:text-xs font-semibold leading-tight truncate ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{value}</span>
  </div>
);

export default Seguimiento;