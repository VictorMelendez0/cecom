import React, { useState, useMemo} from 'react';

const AgregarSolicitante = ({ isOpen, onClose, darkMode, setLista, datosCatalogo = [], datosSolicitantes = [] }) => {
    const [estaActivo, setActivo] = useState(true);
    const [institucion, setInstitucion] = useState('');
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    
    const institucionesUnicas = [...new Set(datosCatalogo?.map(item => 
    item.institucion_servicio))].filter(Boolean);

    const usuarioLogueado = localStorage.getItem('user_name') || 'Usuario Invitado';
    const fechaActual = new Date().toLocaleDateString('es-ES', {
        year: '2-digit',
        month: '2-digit',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const idGenerado = useMemo(() => {
    if (!datosSolicitantes || datosSolicitantes.length === 0) return "SOL-0001";

    // Extraemos los números de los IDs existentes (ej: de "SOL-0010" saca 10)
    const numeros = datosSolicitantes.map(item => {
        const valorId = item.id_solicitantes || item.id_solicitante || "";

        const match = String(valorId).match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
    }).filter(n => !isNaN(n));

    // Buscamos el máximo y sumamos 1
    const maxId = numeros.length > 0 ? Math.max(...numeros) : 0;
    const siguienteNumero = (maxId + 1).toString().padStart(4, '0');
    
    return `SOL-${siguienteNumero}`;
}, [isOpen, datosSolicitantes]);

    const manejarGuardar = async () => {
        if (!nombre || !institucion) {
            alert("Por favor completa Nombre y Módulo");
            return;
        }
        
    const nuevoRegistro = {
      targetSheet: "CATALOGO_SOLICITANTES",
      "id_solicitante": idGenerado,
      "nombre_solicitante": nombre,
      "telefono": telefono,
      "modulo": institucion, 
      "activo": estaActivo ? "SI" : "NO",
      "created_at": fechaActual,
      "created_by_id": " ",
      "created_by_nombre": usuarioLogueado,
      "updated_at": fechaActual,
      "updated_by_id": " ",
      "updated_by_nombre": usuarioLogueado
    };

    try {
      // Reemplaza con tu URL de implementación de Google Apps Script
      const URL_API = "https://script.google.com/macros/s/AKfycbyvS9cxB5kjuZ3VO3EplAA3xTMJmZS2vj1O5GQzaS0seRKr4L7OiLEyRn14-y66A1CF/exec";

      await fetch(URL_API, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoRegistro)
      });

      setLista(prev => [...prev, nuevoRegistro]);
      alert("Registro guardado con éxito");
      onClose();
      
    } catch (error) {
      console.error("Error:", error);
      alert("Error al conectar con la base de datos");
    }
  };

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 ${
          darkMode ? 'bg-[#111827] border border-gray-800' : 'bg-white border border-gray-100'
        }`}
      >
        {/* Cabecera */}
        <div className={`p-4 md:px-6 md:py-4 border-b flex justify-between items-center ${
          darkMode ? 'border-gray-800' : 'border-gray-100'
        }`}>
          <h2 className={`text-base md:text-lg   font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Nuevo Solicitante
          </h2>
          <button 
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <svg className="w-5 h-5 md:w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulario Interno */}
        <div className="p-4 md:p-6 space-y-3 md:space-y-4">
          <div className="flex flex-col gap-3 md:gap-4">

            {/*Input Nombre*/}
            <div className="flex flex-col gap-1">
              <label className={`block text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Nombre del Solicitante
              </label>
              <input 
                type="text" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)} className={`p-2 rounded-xl border ${
                    darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50'}`} placeholder="Nombre completo..."                
              />
            </div>
            {/*Input Telefono*/}
            <div className='flex flex-col gap-1'>
              <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Teléfono / Contacto
              </label>
              <input 
                type="text" 
                value={telefono} 
                onChange={(e) => setTelefono(e.target.value)} className={`p-2 rounded-xl border ${
                    darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50'}`} placeholder="771..."
              />
            </div>
            {/*Select modulos*/}
            <div className="flex flex-col ga-1">
                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${
                    darkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                   Modulo 
                </label>

                <select value={institucion} onChange={(e) => setInstitucion(e.target.value)} className={`p-2 rounded-xl border ${
                    darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50'}`}>
                    <option value=""> Seleccionar Modulo...</option>
                    {institucionesUnicas.map((nombre, index) => (
                        <option key={index} value={nombre}>
                            {nombre}
                        </option>
                    ))}
                </select>
            </div>
            {/*Marcador Activo*/}
            <div className="flex flex-col gap-2">
                <label className={`block text-[10px] font-bold uppercase tracking-wider ${
                    darkMode ? 'text-gray-500' : 'text-gray-400'
                }`}>
                   ¿Estatus Activo? 
                </label>
                <div className="flex gap-6 items-center">
                    {/*si*/}
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="radio"
                          checked={estaActivo === true}
                          onChange={() => setActivo(true)}
                          className={`w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50'
                            }`} 
                        />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Sí</span>
                    </label>
                    {/* Opción NO */}
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                            type="radio"
                            checked={estaActivo === false}
                            onChange={() => setActivo(false)}
                            className={`w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50'
                            }`}
                        />
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>No</span>
                    </label>
                </div>
            </div>
            {/*Botones*/}
            <div className="flex flex-col sm:flex-row gap-3 pt-3 md:pt-4">
              <button 
                onClick={onClose}
                className={`w-full sm:flex-1 py-3 rounded-xl font-bold text-xs md:text-sm transition-colors ${
                  darkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={manejarGuardar} 
                className="w-full sm:flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs md:text-sm hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all"
                >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgregarSolicitante;