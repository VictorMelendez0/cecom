import React, { useState, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import { X, Ambulance, User, Clipboard, MapPin, MapPinCheckInside, Users, NotepadText, Bold, Check, Copy, File} from 'lucide-react';


const AgregarEstado = ({ isOpen, onClose, darkMode, folioSugerido, 
    prioridadSeleccionada, nombrepaciente, edadasignada, numeroSeguridad, 
    CamaAsignada, DiagnosticoAsig, SeleccionServicio, seleccionTraslado, 
    CodigoAcept, Origen, Destino, Receptor, nombreSol, telsol, notaspac, Contactoreceptor, FechaPaciente, Enviar}) => {

    const refImagen = useRef(null);
    const [copiando, setCopiando] = useState(false);

    // 1. Fecha automatica
    const usuarioLogueado = localStorage.getItem('user_name') || 'Usuario Invitado';
    const fechaActual = new Date().toLocaleDateString('es-ES', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    //Imagen
    const CopiarComoImagen = async () => {
        if (!refImagen.current) return;
        
        setCopiando(true);
        try{
            
            const dataUrl = await htmlToImage.toBlob(refImagen.current, {
                cacheBust: true,
                backgroundColor: '#ffffff',
                pixelRatio: 3,    
            });
            
            if(!dataUrl) throw new Error("No se pudo generar la imagen");

                try {
                const item = new ClipboardItem({ "image/png": dataUrl });
                await navigator.clipboard.write([item]);
                alert("Imagen copiada al portapapeles");
            } catch (clipError) {
                // FALLBACK PARA MÓVILES: Si no puede copiar, ofrece descargar
                const link = document.createElement('a');
                link.download = `Traslado-${folioSugerido || 'IMSS'}.png`;
                link.href = URL.createObjectURL(dataUrl);
                link.click();
                alert("Tu navegador no permitió copiar la imagen. Se ha descargado automáticamente.");
            }

            setTimeout(() => setCopiando(false), 2000);
        }catch (err){
            console.error("Error con html-to-image", err);
            if(err.name === 'NotAllowedError'){
                alert("Error de permisos: La copia al portapapeles solo funciona en sitios seguros (HTTPS) o localhost.")
            }
            setCopiando(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            
            <div className={`relative w-full max-w-5xl max-h-[95vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl ${
                darkMode ? 'bg-[#0f172a] border border-gray-800' : 'bg-white'
            }`}>
                           
                {/* BOTÓN CERRAR */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all"
                >
                    <X className="w-5 h-5" />
                </button>
                
                {/*BARRA SUPERIOR*/}
                <div className={`p-5 md:p-8 border-b transition-all duration-500 ${
                    darkMode 
                        ? 'bg-white border-gray-200'           
                        : 'bg-[#0f172a] border-gray-800/50'   
                }`}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 md:pr-10">
                        
                        <div className="flex item-star md:items-center gap-4">
                            <div className={`p-3 rounded-2xl flex-shrink-0${
                                darkMode ? 'bg-slate-100' : 'bg-white/10'
                            }`}>
                                <Ambulance className={`w-6 h-6 md:w-8 h-8 ${
                                    darkMode ? 'text-[#E95D62]/95' : 'text-blue-400'
                                }`} />
                            </div>

                            <div>
                                <p className={`text-[9px] md:text-[10px] tracking-[0.2em] font-bold uppercase ${
                                    darkMode ? 'text-slate-400' : 'text-gray-500'
                                }`}>
                                    Solicitud de Traslado IMSS
                                </p>
                                
                                <h1 className={`text.xl md:text-3xl font-black mt-0.5 tracking-tight ${
                                    darkMode ? 'text-slate-900' : 'text-white'
                                }`}>
                                    Terapia Móvil
                                </h1>
                                
                                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 items-center text-[10px] font-mono">
                                    {/* Folio */}
                                    <div className="flex flex-col">
                                        <span className="text-gray-500 font-bold uppercase text-[8px]">Folio</span>
                                        <span className={`font-bold ${darkMode ? 'text-blue-600' : 'text-blue-400'}`}>
                                            {folioSugerido || 'SOL-0000'}
                                        </span>
                                    </div>

                                    {/* Separador visual si quieres uno */}
                                    <div className={`h-4 w-[1px] hidden md:block ${darkMode ? 'bg-gray-200' : 'bg-gray-700'}`} />

                                    <div className="flex flex-col border-l border-gray-700/30 pl-4 md:border-none md:pl-0">
                                        <span className="text-gray-500 font-bold uppercase text-[8px]">Prioridad</span>
                                        <span className={`font-bold uppercase ${
                                            darkMode ? 'text-slate-900' : 'text-white'
                                        }`}>
                                            {prioridadSeleccionada || 'NORMAL'}
                                        </span>
                                    </div>

                                    <div className={`h-4 w-[1px] hidden md:block ${darkMode ? 'bg-gray-200' : 'bg-gray-700'}`} />

                                    {/* Operador */}
                                    <div className="flex flex-col w-full md:w-auto mt-2 md:mt-0 pt-2 border-t border-gray-700/20 md:border-none md:pt-0">
                                        <span className="text-gray-500 font-bold uppercase text-[9px]">Operador</span>
                                        <span className={`font-bold uppercase ${
                                            darkMode ? 'text-slate-700' : 'text-gray-400'
                                        }`}>
                                            {usuarioLogueado}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/*Fecha (Derecha) */}
                        <div className={`w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 md:border-l md:pl-6 border-gray-500/20 text-left md:text-right`}>
                            <p className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                Fecha de Emisión
                            </p>
                            <p className={`text-[11px] md:text-sm font-bold capitalize mt-1 ${
                                darkMode ? 'text-slate-800' : 'text-white'
                            }`}>
                                {fechaActual} - {new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col flex-1 overflow-y-auto">  
                {/* CUERPO DE LA FICHA */}
                {/* CUERPO DE LA FICHA - SECCIÓN PACIENTE */}
                <div className="p-4 md:p-10 space-y-4 md:space-y-6">
                                                    
                        {/* GRUPO: DATOS DEL PACIENTE */}
                        <section className={`p-4 md:p-6 rounded-2xl border transition-all ${
                            darkMode ? 'bg-slate-800/30 border-slate-700/50' : 'bg-gray-50 border-gray-100'
                        }`}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`w-1 h-5 rounded-full ${darkMode ? 'bg-blue-500' : 'bg-blue-600'}`} />
                                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-blue-50'}`}>
                                        <User className={`w-6 h-6 ${
                                            darkMode ? 'text-slate-400' : 'text-blue-400'
                                        }`} />
                                    </div>
                                    <h2 className={`text-[11px] font-bold uppercase tracking-widest ${darkMode ? 'text-gray-300' : 'text-slate-800'}`}>
                                        Información del Paciente
                                    </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 px-1 md:px-4">
                                {/* Nombre Completo - Ocupa 2 columnas */}
                                <div className="md:col-span-2 flex flex-col gap-1">
                                    <label className="text-[9px] font-bold text-gray-500 uppercase">
                                        Nombre del Paciente
                                    </label>
                                    <span className={`text-sm md:text-base font-bold uppercase leading-tight ${
                                        darkMode ? 'text-white' : 'text-slate-900'
                                    }`}>
                                        {nombrepaciente || 'NO DEFINIDA'}
                                    </span>
                                </div>

                                {/* Edad*/}
                                <div className="md:col-span-1 flex flex-col gap-1 md:border-l md:border-l md:pl-6 border-gray-700/20">
                                    <label className="text-[9px] font-bold text-gray-500 uppercase">
                                        Edad
                                    </label>
                                    <span className={`font-bold ${
                                    darkMode ? 'text-white' : 'text-slate-900'
                                    }`}>
                                        {edadasignada || '--'} <span className="text-[10px] font-medium text-gray-500">Años</span>
                                    </span>
                                </div>
                                
                                {/* NSS */}
                                <div className="md:col-span-1 flex flex-col gap-1 md:border-l md:pl-6 border-gray-700/20">
                                    <label className="text-[9px] font-bold text-gray-500 uppercase">
                                        NSS / Agregado
                                    </label>
                                    <span className={`font-bold ${
                                        darkMode ? 'text-white' : 'text-slate-900'
                                    }`}>
                                            {numeroSeguridad || '0000-00-0000'}
                                    </span>
                                </div>

                                {/* Cama */}
                                <div className="md:col-span-1 flex flex-col gap-1 pt-2 border-t border-gray-700/10 md:border-t-0 md:pt-0">
                                    <label className="text-[9px] font-bold text-gray-500 uppercase">
                                    Habitación / Cama
                                    </label>
                                    <span className={`font-bold ${
                                        darkMode ? 'text-white' : 'text-slate-900'
                                    }`}>
                                        {CamaAsignada || '--'}
                                    </span>
                                </div>
                                {/*Diagnostico*/}
                                <div className="md:col-span-3 flex flex-col gap-1 pt-2 border-t border-gray-700/10 md:border-t-0 md:pt-0 md:border-l md:pl-6">
                                    <label className="text-[9px] font-bold text-gray-500 uppercase">
                                    Diagnostico
                                    </label>
                                    <span className={`text-sm font-bold uppercase ${
                                        darkMode ? 'text-white' : 'text-slate-900'
                                    }`}>
                                            {DiagnosticoAsig || 'NO DEFINIDA'}
                                    </span>
                                </div>
                            </div>
                        </section>

                        {/* Puedes agregar más secciones como "DIAGNÓSTICO" aquí abajo siguiendo el mismo patrón */}
                        {/* GRUPO: DATOS DEL SERVICIO */}
                        <section className={`p-4 md:p-6 rounded-2xl border transition-all ${
                            darkMode ? 'bg-blue-500/5 border-blue-500/10': 'bg-blue-50/50 border-blue-100/50'
                        }`}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`w-1 h-5 rounded-full ${darkMode ? 'bg-blue-500' : 'bg-blue-600'}`} />
                                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-blue-50'}`}>
                                        <Clipboard className={`w-6 h-6 ${
                                            darkMode ? 'text-slate-400' : 'text-blue-400'
                                        }`} />
                                    </div>
                                    <h2 className={`text-[11px] font-bold uppercase tracking-widest ${darkMode ? 'text-gray-300' : 'text-slate-800'}`}>
                                        Información del Servicio
                                    </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 px-1 md:px-4">
                                {/* Tipo de Servicio*/}
                                <div className="md:col-span-2 flex flex-col gap-1">
                                    <label className="text-[9px] font-bold text-gray-500 uppercase">
                                        Tipo de Servicio
                                    </label>
                                    <span className={`font-bold uppercase ${
                                        darkMode ? 'text-white' : 'text-slate-900'
                                    }`}>
                                        {SeleccionServicio || 'NO DEFINIDO'}
                                    </span>
                                </div>

                                {/* Tipo de traslado*/}
                                <div className="md:col-span-1 flex flex-col gap-1 md:border-l md:pl-6 border-gray-700/20">
                                    <label className="text-[9px] font-bold text-gray-500 uppercase">
                                        Tipo de Traslado
                                    </label>
                                    <span className={`font-bold uppercase ${
                                    darkMode ? 'text-white' : 'text-slate-900'
                                    }`}>
                                        {seleccionTraslado || 'NO DEFINIDO'} 
                                    </span>
                                </div>
                                
                                {/* Codigo */}
                                <div className="md:col-span-1 flex flex-col gap-1 md:border-l md:pl-6 border-gray-700/20">
                                    <label className="text-[9px] font-bold text-gray-500 uppercase">
                                        Codigo de aceptación
                                    </label>
                                    <span className={`font-bold uppercase ${
                                        darkMode ? 'text-white' : 'text-slate-900'
                                    }`}>
                                            {CodigoAcept || '0000'}
                                    </span>
                                </div>

                                {/* Origen */}
                                <div className="md:col-span-2 flex flex-col gap-1 pt-2 border-t border-gray-700/10 md:border-t-0 md:pt-0">                                                        
                                    <label className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                        <MapPin className={`w-3 h-3 ${
                                            darkMode ? 'text-slate-400' : 'text-blue-400'
                                        }`} />
                                    Origen
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className={`font-bold uppercase ${
                                            darkMode ? 'text-white' : 'text-slate-900'
                                        }`}>
                                                {Origen || '--'}
                                        </span>
                                    </div>
                                </div>

                                {/*Destino*/}
                                <div className="md:col-span-2 flex flex-col gap-1 pt-2 border-t border-gray-700/10 md:border-t-0 md:pt-0 md:border-l md:pl-6">
                                    <label className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                        <MapPinCheckInside className={`w-3 h-3 ${
                                            darkMode ? 'text-slate-400' : 'text-blue-400'
                                        }`} />
                                    Destino
                                    </label>
                                    <span className={`font-bold uppercase ${
                                        darkMode ? 'text-white' : 'text-slate-900'
                                    }`}>
                                            {Destino || '--'}
                                    </span>
                                </div>
                            </div>
                        </section>

                        {/* GRUPO: DATOS DEL RESPONSABLE */}
                        <section className={`p-4 md:p-6 rounded-2xl border transition-al${
                            darkMode ? 'bg-slate-800/30 border-slate-700/50' : 'bg-gray-50 border-gray-100'
                        }`}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`w-1 h-5 rounded-full ${darkMode ? 'bg-blue-500' : 'bg-blue-600'}`} />
                                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-blue-50'}`}>
                                        <Users className={`w-6 h-6 ${
                                            darkMode ? 'text-slate-400' : 'text-blue-400'
                                        }`} />
                                    </div>
                                    <h2 className={`text-[11px] font-bold uppercase tracking-widest ${darkMode ? 'text-gray-300' : 'text-slate-800'}`}>
                                        Información de los responsables
                                    </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 px-1 md:px-4">
                                {/* Solicitante*/}
                                <div className="md:col-span-2 flex flex-col gap-1">
                                    <label className="text-[9px] font-bold text-gray-500 uppercase">
                                        Solicitante
                                    </label>
                                    <span className={`text-sm font-bold uppercase ${
                                        darkMode ? 'text-white' : 'text-slate-900'
                                    }`}>
                                        {nombreSol || 'NO DEFINIDO'}
                                    </span>
                                </div>

                                {/* Contacto Solicitante */}
                                <div className="md:col-span-2 flex flex-col gap-1 md:border-l md:pl-6 border-gray-700/20">
                                    <label className="text-[9px] font-bold text-gray-500 uppercase">
                                        Contacto
                                    </label>
                                    <span className={`font-bold ${
                                        darkMode ? 'text-white' : 'text-slate-900'
                                    }`}>
                                            {telsol || '00-0000-0000'}
                                    </span>
                                </div>

                                <div className="md:hidden border-t border-gray-700/10 my-2" />

                                {/* Receptor*/}
                                <div className="md:col-span-2 flex flex-col gap-1 pt-2 md:pt-0">
                                    <label className="text-[9px] font-bold text-gray-500 uppercase">
                                        Receptor
                                    </label>
                                    <span className={`text-sm font-bold uppercase ${
                                    darkMode ? 'text-white' : 'text-slate-900'
                                    }`}>
                                        {Receptor || 'NO DEFINIDO'} 
                                    </span>
                                </div>
                                
                                {/* Contacto Receptor */}
                                <div className="md:col-span-1 flex flex-col gap-1 pt-2 md:pt-0 md:border-l md:pl-6 border-gray-700/20">
                                    <label className="text-[9px] font-bold text-gray-500 uppercase">
                                        Contacto
                                    </label>
                                    <span className={`font-bold uppercase ${
                                        darkMode ? 'text-white' : 'text-slate-900'
                                    }`}>
                                            {Contactoreceptor || '00-0000-0000'}
                                    </span>
                                </div>
                            </div>
                        </section>

                        {/* GRUPO: NOTAS */}
                        <section className={`p-4 md:p-6 rounded-2xl border transition-all ${
                            darkMode ? 'bg-blue-500/5 border-blue-500/10': 'bg-blue-50/50 border-blue-100/50'
                        }`}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`w-1 h-5 rounded-full ${darkMode ? 'bg-blue-500' : 'bg-blue-600'}`} />
                                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-blue-50'}`}>
                                        <NotepadText className={`w-6 h-6 ${
                                            darkMode ? 'text-slate-400' : 'text-blue-400'
                                        }`} />
                                    </div>
                                    <h2 className={`text-[11px] font-bold uppercase tracking-widest ${darkMode ? 'text-gray-300' : 'text-slate-800'}`}>
                                        Observaciones Adicionales
                                    </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-1 md:px-4">
                                {/* Solicitante*/}
                                <div className="md:col-span-4 flex flex-col gap-2">
                                    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                        Notas
                                    </label>
                                    <span className={`text-sm leading-relaxed whitespace-pre-wrap ${
                                        darkMode ? 'text-white' : 'text-slate-900'
                                    }`}>
                                        {notaspac || 'Sin observaciones registradas para este traslado.'}
                                    </span>
                                </div>
                            </div>
                        </section>
                    </div>    
                </div>   

                {/*Seccion de Botones*/}
                <div className={`flex-none p-4 md:p-6 border-t flex flex-col md:flex-row justify-end items-stretch md:items-center gap-3 ${
                    darkMode ? 'bg-[#0f172a] border-gray-800' : 'bg-gray-50 border-gray-100'
                }`}>
                    <div className="flex gap-2 order-2 md:order-1">
                        
                        {/*Boton Copiar*/}
                        <button
                            onClick={CopiarComoImagen}
                            disabled={copiando}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                                copiando 
                                    ? 'bg-green-500 text-white cursor-wait' 
                                    : darkMode 
                                        ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30' 
                                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'
                            }`}
                        >
                            {copiando ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copiando ? "Copiado al Portapapeles" : "Copiar Imagen"}
                        </button>

                        {/*Botn Cerrar*/}
                        <button
                            onClick={onClose}
                            className={`flex-1 md:flex-none px-5 py-3 rounded-xl text-xs font-bold transition-all ${
                                darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                            Cerrar
                        </button>
                    </div>
                        
                    {/*Boton traslado*/}
                    <button 
                        onClick={Enviar}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95 cursor-pointer"
                    >
                        Autorizar traslado
                    </button>
                </div>
            </div>

            {/*Ventana de imagen*/}
            <div style={{ position: 'absolute', top: '-9999px', left:'-9999px'}}>
                <div
                    ref={refImagen}
                    className="w-[850px] p-10 bg-white text-black"
                >
                    <h2 className="text-black-600 text-center font-bold mb-4">
                        SUBROGACIÓN DE TRASLADO IMSS — TERAPIA MÓVIL
                    </h2>
                    
                    {/*Cabecera*/}
                    <div className="flex items-center justify-between border-b pb-6 mb-6">
                        <div className="flex item-center gap-6">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <Ambulance className= "w-8 h-8 text-[#003969]/95" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900">
                                Terapia Móvil
                            </h1>
                        </div>

                        <div className="text-right border-r-4 border-[#6AB534] pr-6">
                            <p className="text-[10px] font-bold text-gray-800 uppercase tracking-widest">
                                Fecha y Hora de Activación:
                            </p>
                            <p className= "text-lg font-bold text-slate-800" >                                                            
                                {fechaActual} - {new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                            </p>
                        </div>
                    </div>                          
                    
                    <div className="bg-slate-50/50 rounded-xl border border-slate-100 overflow-hidden">
                        <div className="grid grid-cols-5 divide-x divide-slate-100">
                            <div className="p-5">
                                <p className="text-[9px] font-bold uppercase text-slate-900 mb-1 tracking-wider">Folio</p>
                                <p className="text-sm font-black text-slate">{folioSugerido}</p>
                            </div>
                            <div className="p-5">
                                <p className="text-[9px] font-bold uppercase text-slate-900 mb-1 tracking-wider">Solicitante</p>
                                <p className="text-sm font-black text-slate">{nombreSol}</p>
                            </div>
                            <div className="p-5">
                                <p className="text-[9px] font-bold uppercase text-slate-900 mb-1 tracking-wider">Contacto</p>
                                <p className="text-sm font-black text-slate">{telsol}</p>
                            </div>
                            <div className="p-5">
                                <p className="text-[9px] font-bold uppercase text-slate-900 mb-1 tracking-wider">Receptor</p>
                                <p className="text-sm font-black text-slate">{Receptor}</p>
                            </div>
                            <div className="p-5">
                                <p className="text-[9px] font-bold uppercase text-slate-900 mb-1 tracking-wider">Contacto</p>
                                <p className="text-sm font-black text-slate">{Contactoreceptor}</p>
                            </div>
                        </div>

                        <div className="mt-8">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-1.5 h-6 rounded-full bg-[#6AB534]"  />
                                    <Clipboard className= "w-6 h-6 text-[#003969]"/>
                                    <h2 className= "text-sm font-bold uppercase tracking-widest text-slate">
                                        Información del Servicio
                                    </h2>
                            </div>
                            
                            <div className="bg-slate-50/50 rounded-xl border border-slate-100 overflow-hidden">
                                <div className="grid grid-cols-5 divide-x divide-slate-100">
                                    <div className="p-5">
                                        <p className="text-[9px] font-bold uppercase text-slate-900 mb-1 tracking-wider">Tipo de Servicio</p>
                                        <p className="text-[13px] font-black text-slate-800 leading-tight uppercase">
                                            {SeleccionServicio}
                                        </p>
                                    </div>

                                    <div className="p-5">
                                        <p className="text-[9px] font-bold uppercase text-slate-900 mb-1 tracking-wider">Tipo de Traslado</p>
                                        <p className="text-[13px] font-black text-slate-800 uppercase">
                                            {seleccionTraslado}
                                        </p>
                                    </div>

                                    <div className="p-5">
                                        <p className="text-[9px] font-bold uppercase text-slate-900 mb-1 tracking-wider">Origen</p>
                                        <p className="text-[13px] font-black text-slate-800 leading-tight">
                                            {Origen}
                                        </p>
                                    </div>

                                    <div className="p-5">
                                        <p className="text-[9px] font-bold uppercase text-slate-900 mb-1 tracking-wider">Destino</p>
                                        <p className="text-[13px] font-black text-slate-800 leading-tight">
                                            {Destino}
                                        </p>
                                    </div>

                                    <div className="p-5 bg-slate-100/50">
                                        <p className="text-[9px] font-bold uppercase text-slate-900 mb-1 tracking-wider">Cód. Aceptación</p>
                                        <p className="text-sm font-black text-[#003969]">
                                            {CodigoAcept}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-1.5 h-6 rounded-full bg-[#6AB534]"  />
                                    <User className= "w-6 h-6 text-[#003969]"/>
                                    <h2 className= "text-sm font-bold uppercase tracking-widest text-slate">
                                        Información del Usuario
                                    </h2>
                            </div>
                            
                            <div className="bg-slate-50/50 rounded-xl border border-slate-100 overflow-hidden">
                                <div className="grid grid-cols-5 divide-x divide-slate-100">
                                    <div className="p-5">
                                        <p className="text-[9px] font-bold uppercase text-slate-900 mb-1 tracking-wider">Nombre del Paciente</p>
                                        <p className="text-sm font-black text-slate">
                                            {nombrepaciente}
                                        </p>
                                    </div>

                                    <div className="p-5">
                                        <p className="text-[9px] font-bold uppercase text-slate-900 mb-1 tracking-wider">Fecha de Nacimiento</p>
                                        <p className="text-sm font-black text-slate">
                                            {FechaPaciente}
                                        </p>
                                    </div>

                                    <div className="p-5">
                                        <p className="text-[9px] font-bold uppercase text-slate-900 mb-1 tracking-wider">Edad</p>
                                        <p className="text-sm font-black text-slate">
                                            {edadasignada}
                                        </p>
                                    </div>

                                    <div className="p-5">
                                        <p className="text-[9px] font-bold uppercase text-slate-900 mb-1 tracking-wider">NSS</p>
                                        <p className="text-[13px] font-black text-slate-800 leading-tight">
                                            {numeroSeguridad}
                                        </p>
                                    </div>

                                    <div className="p-5 bg-slate-100/50">
                                        <p className="text-[9px] font-bold uppercase text-slate-900 mb-1 tracking-wider">Habitacion / Cama</p>
                                        <p className="text-sm font-black text-slate">
                                            {CamaAsignada}
                                        </p>
                                    </div>

                                    <div className="p-5 bg-slate-100/50">
                                        <p className="text-[9px] font-bold uppercase text-slate-900 mb-1 tracking-wider">Diagnostico / Cama</p>
                                        <p className="text-sm font-black text-slate">
                                            {DiagnosticoAsig}
                                        </p>
                                    </div>

                                    <div className="p-5 bg-slate-100/50 col-span-2">
                                        <p className="text-[9px] font-bold uppercase text-slate-900 mb-1 tracking-wider">Notas / Cama</p>
                                        <p className="text-sm font-black text-slate">
                                            {notaspac}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-1.5 h-6 rounded-full bg-[#6AB534]"  />
                                    <File className= "w-6 h-6 text-[#003969]"/>
                                    <h2 className= "text-sm font-bold uppercase tracking-widest text-slate">
                                        Documentos Requeridos Para Realizar el Servicio
                                    </h2>
                            </div>
                            
                            <div className="bg-slate-50/50 rounded-xl border border-slate-100 overflow-hidden">                                
                                <div className="p-5">
                                    
                                    <p className="text-sm font-black text-slate">
                                        Hoja de subrogación con sellos y firmas
                                        Hoja de envio con sellos y firmas
                                    </p>
                                    <p className="text-sm font-black text-slate">
                                        Hoja de envio con sellos y firmas
                                    </p>
                                    <p className="text-sm font-black text-slate">
                                        Hoja de correo de aceptacion de la unidad receptora con sellos y firmas
                                    </p>
                                    <p className="text-sm font-black text-slate">
                                        Hoja de vigencia del paquete
                                    </p>
                                </div>
                            </div>
                        </div>            
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgregarEstado;