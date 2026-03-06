import { pb } from '@/lib/pb'; // O tu ruta correcta a pb
import type { EstadisticasDashboard, VistaEstadisticasRecord } from '../Types';

export const obtenerEstadisticasDashboard = async (): Promise<EstadisticasDashboard | null> => {
    try {
        // Usamos getList en lugar de getFirstListItem para evitar bugs del SDK
        const result = await pb.collection('vista_estadisticas_dashboard').getList<VistaEstadisticasRecord>(1, 1);
        
        if (result.items.length === 0) {
            throw new Error("La vista de estadísticas está vacía");
        }

        const record = result.items[0];

        return {
            totalAtletas: record.total_atletas || 0,
            totalMatriculas: record.total_matriculas || 0,
            totalEntrenadores: record.total_entrenadores || 0,
            ingresosMes: record.ingresos_mes || 0,
            deudoresActivos: record.deudores_activos || 0,
            porVencer: record.por_vencer || 0
        };

    } catch (error) {
        console.error("[Dashboard Service] Error al obtener las estadísticas agregadas:", error);
        return null;
    }
};