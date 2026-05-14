import React, {useState} from 'react';
import { X, Ambulance, UserCog, Stethoscope, BriefcaseMedical, FileText, Bot, Copy, CheckCircle2 } from 'lucide-react';

const AsignarUnidad = ({ isOpen, onClose, servicio, darkMode, onSave, listaAsignaciones, listaPersonal, listaExtra }) => {
  if (!isOpen || !servicio) return null;

  const inputClass = `px-3 py-2 text-xs rounded-lg border transition-all outline-none w-full
    ${darkMode 
      ? 'bg-gray-800 border-gray-700 text-gray-300 focus:border-blue-500' 
      : 'bg-white border-gray-100 text-gray-800 focus:border-blue-400'
    }`;

  const labelClass = `text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5
    ${darkMode ? 'text-gray-500' : 'text-gray-400'}`;

  const iconClass = `w-3.5 h-3.5 opacity-60`;

  const [unidadSeleccionada, setUnidadSeleccionada] = useState(null);
  const [medicoSeleccionado, setMedicoSeleccionado] = useState(null);
  const [equipoExtra, setEquipoExtra] = useState(null);
  const [catEquipoExtra, setCatEquipoExtra] = useState(null);
  const [NotasOp, setNotasOp] = useState('');

  const usuarioId = localStorage.getItem('user_id') || 'Desconocido';

  const handleUnidadChange = (e) => {
    const unidadClave = e.target.value;
    const infoAsignacion = listaAsignaciones.find(a => a.unidad_clave === unidadClave);
    setUnidadSeleccionada(infoAsignacion || null);
  };

  const handleMedicoChange = (e) => {
    const personalNombre = e.target.value;
    const infoMedico = listaPersonal.find(a => a.nombre_completo === personalNombre);
    setMedicoSeleccionado(infoMedico || null);
  }

  const handleEquipoExtraChange = (e) => {
    const infoEquipo = listaExtra.find(a => a.nombre_extra === nombreEquipo);
     if (infoEquipo){
      setCatEquipoExtra(infoEquipo.categoria_extra || ' ');
      setEquipoExtra(infoEquipo.nombre_extra || ' ');
      console.log("Equipo seleccionado:", infoEquipo); 
        
      } else {
          // Limpiamos si no hay selección
          setEquipoExtra('');
          setIdEquipoExtra('');
      }
  }
  
  const handleActualizar = async () => {
        const URL_API = "https://script.google.com/macros/s/AKfycbyvS9cxB5kjuZ3VO3EplAA3xTMJmZS2vj1O5GQzaS0seRKr4L7OiLEyRn14-y66A1CF/exec";
        
        const equipoConCategorias = equipoExtra ? equipoExtra.split(', ').map(nombre => {
        const item = listaExtra.find(ex => ex.nombre_extra === nombre);
        return item ? `${item.nombre_extra} (${item.categoria_extra})` : nombre;
        }).join(', ') : '';
        const idunicoBitacora = `BIT-${Math.random().toString(16).slice(2, 10).toUpperCase()}`;

      
        const datosUpdate = {
            targetSheet: "OPS_IMSS", // Indicamos a qué tabla va
            primaryKey: "folio_imss",
            "folio_imss": servicio?.folio_imss,

            "id_asignacion": unidadSeleccionada?.id_asignacion || '',
            "unidad_clave":unidadSeleccionada?.unidad_clave || '',
            "operador":unidadSeleccionada?.operador || '',
            "paramedico":unidadSeleccionada?.paramedico || '',
            "medico_traslado":medicoSeleccionado?.nombre_completo || '',
            "equipo_extra":equipoConCategorias,
            "observaciones_asignacion":NotasOp || '',
            "tripulacion_texto":`${unidadSeleccionada?.operador || '---'} / ${unidadSeleccionada?.paramedico || '---'} / ${medicoSeleccionado?.nombre_completo || '---'}`,
            "estatus_clave": "ASIGNADO",
            "estatus_nombre": "Asignado",
            "estatus_visual": "assigned"
        };

        const UpdateEstado = {
          targetSheet: "OPS_ASIGNACIONES", // Indicamos a qué tabla va
          primaryKey: "unidad_clave",
          "unidad_clave":unidadSeleccionada?.unidad_clave,
          "estatus_asignacion": "ASIGNADA",
        };

        const registrarBitacora={
          targetSheet: "OPS_IMSS_BITACORA", // Indicamos a qué tabla va
          "id_bitacora": idunicoBitacora,
          "id_imss": servicio?.id_imss,
          "fecha": new Date().toLocaleString(),
          "hora": new Date().toLocaleTimeString(),
          "accion": 'ASIGNACION DE  UNIDAD',
          "comentario": `${unidadSeleccionada?.unidad_clave || '---'}, Personal: ${unidadSeleccionada?.operador || '---'} / ${unidadSeleccionada?.paramedico || '---'} / ${medicoSeleccionado?.nombre_completo || '---'} / Equipo extra: ${equipoConCategorias}`,
          "estatus": servicio?.estatus_nombre || '---',
          "created_by_id": usuarioId 
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

            alert("Registro guardado");
            if (onSave) onSave();
            onClose();

        } catch (error) {
            console.error("Error de red:", error);
            alert("Error al intentar conectar con el servidor.");
        }
    };



  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      
      <div className={`w-full max-w-4xl h-[90vh] sm:h-auto rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden transform transition-all animate-in slide-in-from-bottom sm:zoom-in-95 duration-300
        ${darkMode ? 'bg-[#0f172a]' : 'bg-[#f4f6f8]'}`}>
        
        {/* HEADER: Colores invertidos (Oscuro con texto blanco) */}
        <div className={`flex justify-between items-center p-4 sm:p-6 border-b border-white/10 bg-[#1e293b]`}>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white">Asignar unidad</h2>
            <p className="text-[10px] sm:text-xs text-blue-400 font-bold uppercase tracking-widest">Folio IMSS: {servicio.folio_imss || '---'}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg transition-colors text-gray-400 hover:bg-white/10 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          
          {/* Información del Folio */}
          <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 p-4 rounded-xl mb-6
            ${darkMode 
              ? 'bg-gray-800/40 border border-gray-700' 
              : 'bg-white border border-gray-100 shadow-inner'}`}>
            <InfoItem label="FOLIO" value={servicio.folio_imss || '---'} darkMode={darkMode} />
            <InfoItem label="PACIENTE" value={servicio.paciente_nombre || '---'} darkMode={darkMode} />
            <InfoItem label="ORIGEN" value={servicio.hospital_origen || '---'} darkMode={darkMode} />
            <InfoItem label="DESTINO" value={servicio.hospital_destino || '---'} darkMode={darkMode} />
            <InfoItem label="TRASLADO" value={servicio.tipo_traslado || '---'} darkMode={darkMode} />
            <InfoItem label="PRIORIDAD" value={servicio.prioridad || '---'} darkMode={darkMode} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 sm:gap-y-5">
            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className={labelClass}><Ambulance className={iconClass} /> Unidad</label>
                <select className={`${inputClass} cursor-pointer`} onChange={handleUnidadChange} value={unidadSeleccionada?.unidad_clave || ""}>
                    <option value="">Seleccionar unidad</option>
                    {listaAsignaciones.map((asig, index) => (
                        <option key={index} value={asig.unidad_clave} disabled={asig.estatus_asignacion !== 'ACTIVA'}>
                          {asig.unidad_clave} {asig.estatus_asignacion}
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
              <div className="flex flex-col">
                <label className={labelClass}>
                  <BriefcaseMedical className={iconClass} /> Equipo adicional requerido
                </label>
                
                <div className={`grid grid-cols-2 gap-2 p-3 rounded-lg border overflow-y-auto max-h-[140px] ${
                  darkMode ? 'bg-gray-800/40 border-gray-700' : 'bg-white border-gray-100 shadow-inner'
                }`}>
                  {listaExtra && listaExtra.length > 0 ? (
                    listaExtra.map((item, index) => {
                      const nombreItem = item.nombre_extra;
                      const categoria = item.categoria_extra;
                      const isChecked = equipoExtra?.split(', ').includes(nombreItem);
                      
                      return (
                        <label 
                          key={index} 
                          className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all ${
                            isChecked 
                              ? (darkMode ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-blue-50 text-blue-700 border border-blue-100') 
                              : (darkMode ? 'hover:bg-gray-700 text-gray-400 border border-transparent' : 'hover:bg-gray-50 text-gray-600 border border-transparent')
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={isChecked || false}
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
                          {/* Renderizado con nombre y categoría */}
                          <span className="text-[9px] font-black uppercase tracking-tight truncate leading-none">
                            {nombreItem} 
                            {categoria && (
                              <span className="ml-1 opacity-80 font-semibold block sm:inline">
                                ({categoria})
                              </span>
                            )}
                          </span>
                        </label>
                      );
                    })
                  ) : (
                    <p className="col-span-2 text-[10px] text-gray-500 italic p-2 text-center">
                      No hay equipo extra disponible en el catálogo
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-5">
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
                    <option value="">Seleccionar Medico</option>
                    {listaPersonal.filter(per => per.roles_asociados === 'MEDICO').map((per, index) => (
                        <option key={index} value={per.nombre_completo}>{per.nombre_completo}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className={labelClass}><FileText className={iconClass} /> Observaciones de asignación</label>
                <textarea 
                  values={NotasOp || ''}
                  rows="3" 
                  className={`${inputClass} resize-none`} 
                  placeholder="Notas operativas..." 
                  value={NotasOp}
                  onChange={(e) => setNotasOp(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER: Botones con estilo de la imagen */}
        <div className={`flex flex-col sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t ${darkMode ? 'border-white/10 bg-[#0f172a]' : 'border-gray-950 bg-gray-50'}`}>
          <button 
            onClick={onClose} 
            className="order-3 sm:order-1 px-6 py-2 rounded-xl text-xs sm:text-sm font-bold text-gray-500 hover:text-white transition-colors cursor-pointer">
            Cerrar
          </button>

          <button 
            onClick={handleActualizar}
            className="order-1 sm:order-3 flex items-center justify-center gap-2 px-8 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-black shadow-lg shadow-blue-900/20 active:scale-95 transition-all hover:brightness-110 cursor-pointer">
            <CheckCircle2 className="w-4 h-4" />
            Guardar Asignación
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value, darkMode }) => (
  <div className="flex flex-col min-w-0">
    <span className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">{label}</span>
    <span className={`text-[11px] sm:text-[13px] font-bold leading-tight truncate 
      ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
        {value || '---'}
    </span>
  </div>
);

export default AsignarUnidad;