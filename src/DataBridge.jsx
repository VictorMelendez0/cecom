import React, { useEffect, useState } from 'react';

const DataBridge = () => {
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(true);

  const URL_API = "https://script.google.com/macros/s/AKfycbyhCzd7fjhvkPFmdRXy2fWhqzEZoppk2IULep5T7stWO53JDYaLI9Z15YfP2xROPTA/exec";

  useEffect(() => {
    fetch(URL_API)
      .then(res => res.json())
      .then(data => {
        console.log("Datos recibidos:", data);
        setDb(data);
        setLoading(false);
      })
      .catch(err => console.error("Error conectando:", err));
  }, []);

  if (loading) return <div className="text-white p-10">⏳ Conectando con CECOM Sheets...</div>;

  // 1. FILTRO DE UNIDADES: Ahora acepta 'EN_SERVICIO' o 'ACTIVA'
  const unidadesActivas = db.asignaciones?.filter(asig => 
    asig.estatus_asignacion === 'EN_SERVICIO' || asig.estatus_asignacion === 'ACTIVA'
  ) || [];

  // 2. CONTEO DE SERVICIOS TOTALES (Suma de los 3 módulos)
  const serviciosIMSS = db.servicios_imss?.filter(s => 
    s.estatus_clave === 'EN_SERVICIO' || s.estatus_clave === 'NUEVO').length || 0;

  const serviciosPrivados = db.servicios_privados?.filter(p => 
    p.estatus_clave === 'EN_PROCESO').length || 0;

  const serviciosEventos = db.ops_eventos?.filter(e => 
    e.estatus_clave === 'ACTIVO').length || 0;

  const totalServicios = serviciosIMSS + serviciosPrivados + serviciosEventos;

  return (
    <div className="p-8 bg-[#050a18] min-h-screen text-white">
      <h2 className="text-2xl font-bold mb-6 text-green-400">✅ Conexión Exitosa con Google Sheets</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Unidades */}
        <div className="bg-[#111827] p-6 rounded-2xl border border-gray-800">
          <h3 className="text-gray-400 uppercase text-sm font-bold">Unidades Activas</h3>
          <p className="text-4xl font-bold mt-2 text-blue-400">{unidadesActivas.length}</p>
        </div>

        {/* Card Servicios Totales */}
        <div className="bg-[#111827] p-6 rounded-2xl border border-gray-800">
          <h3 className="text-gray-400 uppercase text-sm font-bold">Servicios en Proceso</h3>
          <p className="text-4xl font-bold mt-2 text-red-400">{totalServicios}</p>
          <p className="text-xs text-gray-500 mt-1">IMSS: {serviciosIMSS} | Priv: {serviciosPrivados} | Ev: {serviciosEventos}</p>
        </div>

        {/* Card Personal */}
        <div className="bg-[#111827] p-6 rounded-2xl border border-gray-800">
          <h3 className="text-gray-400 uppercase text-sm font-bold">Personal en Catálogo</h3>
          <p className="text-4xl font-bold mt-2">{db.personal?.length || 0}</p>
        </div>
      </div>

      <h3 className="mt-10 mb-4 font-bold">Monitor de Unidades (Servicio / Activa):</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left bg-[#111827] rounded-xl overflow-hidden">
          <thead className="bg-[#1f2937] text-gray-300">
            <tr>
              <th className="p-4">Unidad</th>
              <th className="p-4">Operador</th>
              <th className="p-4">Estatus</th>
              <th className="p-4">Punto Fijo</th>
            </tr>
          </thead>
          <tbody>
            {unidadesActivas.map((u, i) => (
              <tr key={i} className="border-t border-gray-800">
                <td className="p-4 font-mono text-yellow-400">{u.unidad_clave}</td>
                <td className="p-4">{u.operador}</td>
                <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${u.estatus_asignacion === 'EN_SERVICIO' ? 'bg-green-900 text-green-300' : 'bg-blue-900 text-blue-300'}`}>
                        {u.estatus_asignacion}
                    </span>
                </td>
                <td className="p-4 text-sm text-gray-400">{u.punto_fijo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataBridge;