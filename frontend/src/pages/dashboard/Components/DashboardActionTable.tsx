import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSortUp, FaSortDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import type { AtencionDashboard } from '../Types';
import { obtenerAtencionesDeDashboard } from '@/pages/dashboard/Services/dashboardAtenciones';

// Tipo extendido para la UI (cedula y clase_nombre ya vienen de AtencionDashboard)
type AtencionProcesada = AtencionDashboard & {
    diasRestantes: number;
    estadoTexto: string;
    badgeColor: string;
    iniciales: string;
    idAtletaReal: string;
};

export const DashboardActionTable = () => {
    const navigate = useNavigate();

    const [datosProcesados, setDatosProcesados] = useState<AtencionProcesada[]>([]);
    const [cargando, setCargando] = useState(true);
    const [ordenAscendente, setOrdenAscendente] = useState(true);

    // ESTADOS DE PAGINACIÓN
    const [paginaActual, setPaginaActual] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const limitePorPagina = 5; // Cuántos deudores mostrar por página

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setCargando(true);
                // Llamamos al servicio con la página actual
                const respuesta = await obtenerAtencionesDeDashboard(paginaActual, limitePorPagina);
                
                if (!respuesta) {
                    setDatosProcesados([]);
                    return;
                }

                setTotalPaginas(respuesta.totalPages);

                // Procesamiento Visual
                const procesados = respuesta.items.map(item => {
                    const hoy = new Date();
                    hoy.setHours(0, 0, 0, 0);

                    const vencimiento = new Date(item.fecha_vencimiento);
                    vencimiento.setHours(0, 0, 0, 0);

                    const diferenciaTiempo = vencimiento.getTime() - hoy.getTime();
                    const diasRestantes = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));

                    let estadoTexto = '';
                    let badgeColor = '';

                    if (diasRestantes < 0) {
                        estadoTexto = `🚨 Vencido hace ${Math.abs(diasRestantes)} días`;
                        badgeColor = 'bg-rose-50/80 text-rose-700 border-rose-200 backdrop-blur-sm shadow-sm';
                    } else if (diasRestantes === 0) {
                        estadoTexto = '⚠️ Vence HOY';
                        badgeColor = 'bg-amber-50/80 text-amber-700 border-amber-200 backdrop-blur-sm shadow-sm';
                    } else {
                        estadoTexto = `⏳ Vence en ${diasRestantes} días`;
                        badgeColor = 'bg-slate-50/80 text-slate-600 border-slate-200 backdrop-blur-sm shadow-sm';
                    }

                    const nombreAtleta = item.nombreAtleta || 'Desconocido';
                    const iniciales = nombreAtleta.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
                    
                    const idAtletaReal = item.atleta_id || item.id;

                    return { 
                        ...item, 
                        diasRestantes, 
                        estadoTexto, 
                        badgeColor, 
                        iniciales, 
                        idAtletaReal 
                    };
                });

                setDatosProcesados(procesados);

            } catch (error) {
                console.error("Error al cargar atenciones en tabla", error);
            } finally {
                setCargando(false);
            }
        };
        
        cargarDatos();
    }, [paginaActual]); // Se re-ejecuta cuando cambia la página

    const datosOrdenados = [...datosProcesados].sort((a, b) => {
        if (ordenAscendente) return a.diasRestantes - b.diasRestantes;
        return b.diasRestantes - a.diasRestantes;
    });

    return (
        <div className="w-full mt-10 mb-10 relative">
            <div className="flex justify-between items-end mb-6 px-2">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-2 h-6 lg:h-7 bg-rose-500 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.4)]"></div>
                        <h2 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight">Atención Requerida</h2>
                    </div>
                    <p className="text-sm lg:text-base text-slate-500 ml-5">Vencimientos y deudas urgentes (Sólo Matrículas Activas).</p>
                </div>
                <button
                    onClick={() => navigate('/deuda')}
                    className="hidden sm:flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50/80 hover:bg-blue-100 px-5 py-2.5 rounded-2xl backdrop-blur-sm"
                >
                    Ver todas las deudas &rarr;
                </button>
            </div>

            <div className="bg-white rounded-2xl lg:rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-xs lg:text-sm uppercase tracking-wider">
                                <th className="p-5 lg:p-6 font-bold w-1/2">Atleta y Clase</th>
                                <th
                                    className="p-5 lg:p-6 font-bold cursor-pointer hover:bg-slate-50 transition-colors flex items-center gap-2 select-none"
                                    onClick={() => setOrdenAscendente(!ordenAscendente)}
                                >
                                    Estado del Pago
                                    {ordenAscendente ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />}
                                </th>
                                <th className="p-5 lg:p-6 font-bold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {cargando && (
                                <tr>
                                    <td colSpan={3} className="p-10 text-center text-slate-400 font-medium animate-pulse">
                                        Cargando datos paginados...
                                    </td>
                                </tr>
                            )}

                            {!cargando && datosOrdenados.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="p-10 text-center text-slate-400 font-medium">
                                        ¡Excelente! No hay vencimientos próximos ni deudas. 🎉
                                    </td>
                                </tr>
                            )}

                            {!cargando && datosOrdenados.map((item) => (
                                <tr key={`${item.id}-${item.clase_nombre}`} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-4 lg:p-6 max-w-xs">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center font-black text-sm lg:text-base shadow-sm group-hover:bg-white transition-colors flex-shrink-0">
                                                {item.iniciales}
                                            </div>
                                            
                                            {/* UI actualizada con Clase y Cédula (Truncado) */}
                                            <div className="flex flex-col min-w-0">
                                                <span 
                                                    className="font-bold text-slate-700 lg:text-lg group-hover:text-slate-900 transition-colors leading-tight truncate"
                                                    title={item.nombreAtleta}
                                                >
                                                    {item.nombreAtleta}
                                                </span>
                                                
                                                <div className="flex items-center gap-2 mt-1.5 text-[11px] lg:text-xs font-medium">
                                                    <span 
                                                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 truncate max-w-[130px] lg:max-w-[180px]" 
                                                        title={item.clase_nombre}
                                                    >
                                                        {item.clase_nombre}
                                                    </span>
                                                    
                                                    <span className="w-1 h-1 rounded-full bg-slate-300 flex-shrink-0"></span>
                                                    
                                                    <span className="text-slate-400 whitespace-nowrap flex-shrink-0">
                                                        C.I: {item.cedula}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="p-4 lg:p-6">
                                        <span className={`px-3 py-1.5 rounded-xl text-xs font-black border ${item.badgeColor}`}>
                                            {item.estadoTexto}
                                        </span>
                                    </td>

                                    <td className="p-4 lg:p-6">
                                        <div className="flex items-center justify-end gap-3">
                                            {/* BOTÓN ÚNICO RESTAURADO A TU VERSIÓN */}
                                            <button
                                                onClick={() => navigate('/atletas/perfil/' + item.idAtletaReal)}
                                                className="inline-flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_15px_-3px_rgba(16,185,129,0.2)] cursor-pointer"
                                            >
                                                Cobrar / Renovar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* CONTROLES DE PAGINACIÓN */}
                {!cargando && totalPaginas > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100">
                        <span className="text-sm text-slate-500 font-medium">
                            Página <span className="font-bold text-slate-700">{paginaActual}</span> de <span className="font-bold text-slate-700">{totalPaginas}</span>
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                                disabled={paginaActual === 1}
                                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <FaChevronLeft />
                            </button>
                            <button
                                onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
                                disabled={paginaActual === totalPaginas}
                                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <FaChevronRight />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};