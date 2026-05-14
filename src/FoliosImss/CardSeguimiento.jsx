import React from 'react';

const CardSeguimiento = ({ servicio, onPress, darkMode }) => {
  const estatus = servicio.estatus_clave;

  // Definición de estilos por estado
  const estilosEstatus = {
    'NUEVO': {
      borde: 'border-l-red-600',
      texto: darkMode ? 'text-red-400' : 'text-red-700',
      fondo: darkMode ? 'bg-red-900/30' : 'bg-red-50'
    },
    'ASIGNADO': {
      borde: 'border-l-yellow-500',
      texto: darkMode ? 'text-yellow-400' : 'text-yellow-700',
      fondo: darkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'
    },
    'EN_SERVICIO': {
      borde: 'border-l-blue-500',
      texto: darkMode ? 'text-blue-400' : 'text-blue-700',
      fondo: darkMode ? 'bg-blue-900/30' : 'bg-blue-50'
    },
    'EN_SITIO': {
      borde: 'border-l-emerald-500',
      texto: darkMode ? 'text-emerald-400' : 'text-emerald-700',
      fondo: darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50'
    },
    'EN_TRASLADO': {
      borde: 'border-l-[#3DBD89]',
      texto: darkMode ? 'text-[#3DBD89]' : 'text-[#3DBD89]',
      fondo: darkMode ? 'bg-[#3DBD89]/30' : 'bg-[#3DBD89]/5'
    },
    'EN_DESTINO': {
      borde: 'border-l-emerald-500',
      texto: darkMode ? 'text-emerald-400' : 'text-emerald-700',
      fondo: darkMode ? 'bg-emerald-900/30' : 'bg-emerald-50'
    },   
    'FINALIZADO': {
      borde: 'border-l-[#6F27AA]',
      texto: darkMode ? 'text-[#AC6EDE]' : 'text-[#6F27AA]',
      fondo: darkMode ? 'bg-[#6F27AA]/15' : 'bg-[#6F27AA]/5'
    }    
  };

  // Estilo por defecto si el estado no coincide
  const estiloActual = estilosEstatus[estatus] || {
    borde: 'border-l-gray-400',
    texto: darkMode ? 'text-gray-400' : 'text-gray-700',
    fondo: darkMode ? 'bg-gray-800' : 'bg-gray-50'
  };

  const formatearHora = (fechaString) => {
    if (!fechaString || fechaString === 'N/A') return 'N/A';
    try {
      const fecha = new Date(fechaString);
      if (isNaN(fecha.getTime())) return fechaString; 
      return `${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`;
    } catch { return 'N/A'; }
  };

  const manejarClic = () => {
    if (estatus === 'NUEVO') {
      onPress(servicio, 'MODAL_ASIGNAR');
    } else {
      // Cualquier otro estado (ASIGNADO, EN_SERVICIO, EN_SITIO) abre tiempos
      onPress(servicio, 'MODAL_TIEMPOS');
    }
  }

  return (
    <div 
      onClick={manejarClic}
      className={`cursor-pointer transition-all duration-200 border-l-[6px] rounded-xl p-4 my-3 shadow-sm active:scale-[0.98]
        flex flex-col justify-between
        w-full md:w-[360px] h-auto 
        ${estiloActual.borde} 
        ${darkMode ? 'bg-[#1e2533] text-gray-100' : 'bg-white text-gray-800 border border-gray-100'}`}
    >
      <div>
        <div className="flex justify-between items-center mb-3 gap-2 flex-nowrap">
          <div className={`flex-shrink-0 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${estiloActual.fondo} ${estiloActual.texto}`}>
            ● {estatus}
          </div>
          <span className={`text-base sm:text-lg font-black tracking-tight truncate opacity-90 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            #{servicio.folio_imss}
          </span>
        </div>

        {/* El resto del componente permanece igual... */}
        <div className="flex items-center gap-2 mb-3">
          <p className="text-[13px] font-bold truncate flex-1 leading-tight" title={servicio.hospital_origen}>
              {servicio.hospital_origen}
          </p>
          <span className="text-gray-400 text-xs font-black">→</span>
          <p className="text-[13px] font-bold truncate flex-1 leading-tight" title={servicio.hospital_destino}>
              {servicio.hospital_destino}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="bg-gray-100 dark:bg-gray-700/30 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
              🚑 {servicio.unidad_clave || '---'}
          </span>
          <span className="bg-gray-100 dark:bg-gray-700/30 px-2 py-0.5 rounded text-[10px] font-bold">
              {servicio.tipo_servicio}
          </span>
          <span className="bg-gray-100 dark:bg-gray-700/30 px-2 py-0.5 rounded text-[10px] font-bold">
              {servicio.tipo_traslado}
          </span>
          {servicio.operador && (
            <div className="w-full mt-1 bg-gray-50 dark:bg-gray-700/20 rounded-md p-1.5 border border-gray-100 dark:border-gray-700/50">
              <p className="text-[10px] leading-tight truncate text-gray-500 dark:text-gray-400">
                <span className={`font-bold uppercase mr-1 ${darkMode ? 'text-white' : 'text-gray-950'}`}>Operador:</span>
                <span className={`font mr-1 truncate ${darkMode ? 'text-white' : 'text-gray-950'}`}>{servicio.operador}</span>
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700/50 pt-2 mb-3">
          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate flex items-center" title={`${servicio.paciente_nombre} • ${servicio.paciente_diagnostico}`}>
              <span className="mr-1.5 text-blue-500 dark:text-blue-400 text-xs">👤</span> 
              <span className={`font-bold mr-1 truncate ${darkMode ? 'text-white' : 'text-gray-950'}`}>{servicio.paciente_nombre}</span>
              <span className="mx-1 opacity-30">•</span> 
              <span className={`truncate ${darkMode ? 'text-gray-400' : 'text-blue-600'}`}>{servicio.paciente_diagnostico}</span>
          </p>
        </div>
      </div>

      <div className="flex justify-between border-t border-gray-100 dark:border-gray-700/50 pt-3 gap-1">
        <TimeItem label="ACT" time={formatearHora(servicio.h_activacion)} darkMode={darkMode} />
        <TimeItem label="ORI" time={formatearHora(servicio.h_origen)} darkMode={darkMode} />
        <TimeItem label="INI" time={formatearHora(servicio.h_inicio)} darkMode={darkMode} />
        <TimeItem label="DES" time={formatearHora(servicio.h_destino)} darkMode={darkMode} />
        <TimeItem label="FIN" time={formatearHora(servicio.h_final)} darkMode={darkMode} />
      </div>
    </div>
  );
};

const TimeItem = ({ label, time, darkMode }) => (
  <div className="flex flex-col items-center min-w-[35px]">
    <span className={`text-[8px] font-black leading-none mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{label}</span>
    <span className={`text-[10px] sm:text-[11px] font-black ${time === 'N/A' ? 'opacity-30' : 'opacity-100'}`}>{time || 'N/A'}</span>
  </div>
);

export default CardSeguimiento;