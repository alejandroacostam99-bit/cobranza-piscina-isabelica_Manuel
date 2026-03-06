import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSortUp, FaSortDown } from 'react-icons/fa6';
import { obtenerAtencionesDeDashboard } from '../../dashboard/Services/dashboard.service';

export const DashboardActionTable = () => {
    const navigate = useNavigate();

    const [datosReales, setDatosReales] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);
    const [ordenAscendente, setOrdenAscendente] = useState(true);

    useEffect(() => {
        const cargarDatos = async () => {
            setCargando(true);
            const data = await obtenerAtencionesDeDashboard();
            setDatosReales(data);
            setCargando(false);
        };
        cargarDatos();
    }, []);

    let datosProcesados = datosReales.map(item => {
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

        // CORRECCIÓN 1: Intentamos buscar la cédula real. Si no viene de la BD, ponemos "Sin C.I." en vez del ID raro.
        const cedula = item.cedula || item.atleta_cedula || 'Sin C.I.';

        // Extraemos el ID real del atleta para la navegación
        const idAtletaReal = item.atleta_id || item.id;

        return { ...item, diasRestantes, estadoTexto, badgeColor, iniciales, nombreAtleta, cedula, idAtletaReal };
    });

    datosProcesados = datosProcesados.filter(item => item.diasRestantes <= 5);

    datosProcesados.sort((a, b) => {
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
                    <p className="text-sm lg:text-base text-slate-500 ml-5">Vencimientos y deudas urgentes por matrícula.</p>
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
                                <th className="p-5 lg:p-6 font-bold">Atleta</th>
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
                                    <td colSpan={3} className="p-10 text-center text-slate-400 font-medium">
                                        Cargando datos en vivo...
                                    </td>
                                </tr>
                            )}

                            {!cargando && datosProcesados.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="p-10 text-center text-slate-400 font-medium">
                                        ¡Excelente! No hay vencimientos próximos ni deudas. 🎉
                                    </td>
                                </tr>
                            )}

                            {!cargando && datosProcesados.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-4 lg:p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center font-black text-sm lg:text-base shadow-sm group-hover:bg-white transition-colors flex-shrink-0">
                                                {item.iniciales}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-700 lg:text-lg group-hover:text-slate-900 transition-colors leading-tight">
                                                    {item.nombreAtleta}
                                                </span>
                                                <span className="text-xs lg:text-sm text-slate-400 font-medium mt-0.5">
                                                    C.I: {item.cedula}
                                                </span>
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

                                            {/* CORRECCIÓN 2 Y 3: Navegación directa y cambio de texto */}
                                            {item.diasRestantes < 0 && (
                                                <button
                                                    // OJO AQUÍ: Si tu ruta de detalles es distinta, cámbiala aquí.
                                                    // Ejemplos comunes: `/atletas/${item.idAtletaReal}` o `/atletas/editar/${item.idAtletaReal}`
                                                    onClick={() => navigate(`/atletas/perfil/${item.idAtletaReal}`)}
                                                    className="inline-flex items-center justify-center bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 shadow-sm"
                                                >
                                                    Gestionar Matrícula
                                                </button>
                                            )}

                                            <button
                                                onClick={() => navigate('/pagos')}
                                                className="inline-flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_15px_-3px_rgba(16,185,129,0.2)]"
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
            </div>
        </div>
    );
};