import React from 'react';
import { X } from 'lucide-react';

const CargarCotizaciones = ({ isOpen, onClose, darkMode, listaCotizaciones, onSelect}) => {
  if (!isOpen) return null;

  const data = [
   
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden border transition-all duration-300 ${
        darkMode 
          ? 'bg-[#0b1120] border-gray-800' 
          : 'bg-[#f8f9fb] border-gray-200'
      }`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          darkMode ? 'border-gray-800 bg-[#0f172a]' : 'border-gray-200 bg-white'
        }`}>
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            Cargar cotización
          </h2>
          <button 
            onClick={onClose} 
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-400'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <h3 className={`text-sm font-bold mb-4 ${darkMode ? 'text-withe' : 'text-gray-600'}`}>
            Cotizaciones registradas
          </h3>
          
          <div className={`overflow-x-auto border rounded-lg ${
            darkMode ? 'border-gray-800 bg-[#111827]' : 'border-gray-200 bg-white'
          }`}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Folio</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Solicitante</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tipo de Servicio</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Origen</th>
                  <th className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-800' : 'divide-gray-100'}`}>
                {listaCotizaciones
                .filter((item)=> item.estatus_cotizacion === "COT")
                .map((item, index) => (
                  <tr key={index} className={`transition-colors ${
                    darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-slate-50'
                  }`}>
                    <td className={`px-4 py-4 text-sm font-medium ${darkMode ? 'text-blue-400' : 'text-gray-600'}`}>
                      {item.folio_cotizacion}
                    </td>
                    <td className={`px-4 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {item.solicitante_nombre}
                    </td>
                    <td className={`px-4 py-4 text-[13px] uppercase ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.tipo_servicio}
                    </td>
                    <td className={`px-4 py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.origen}
                    </td>
                    <td className="px-4 py-4">
                      <button 
                        onClick={() => onSelect(item)}
                        className={`px-5 py-2 rounded-md text-sm font-bold transition-all shadow-sm cursor-pointer ${
                        darkMode 
                          ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                          : 'bg-[#334155] hover:bg-[#1e293b] text-white'
                      }`}>
                        Cargar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex justify-end p-4 border-t ${
          darkMode ? 'border-gray-800 bg-[#0f172a]' : 'border-gray-100 bg-white'
        }`}>
          <button 
            onClick={onClose}
            className={`px-6 py-2 border rounded-lg font-medium transition-colors shadow-sm cursor-pointer ${
              darkMode 
                ? 'border-gray-700 text-gray-300 hover:bg-gray-800' 
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CargarCotizaciones;