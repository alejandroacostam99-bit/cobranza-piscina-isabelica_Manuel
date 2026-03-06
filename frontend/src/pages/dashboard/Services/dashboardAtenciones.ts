import { pb } from '@/lib/pb'; 
import type { AtencionDashboard, VistaClaseAlumnoRecord } from '../Types'; 

export interface AtencionesPaginadas {
    items: AtencionDashboard[];
    totalPages: number;
    page: number;
    totalItems: number;
}

export const obtenerAtencionesDeDashboard = async (
    page: number = 1, 
    perPage: number = 5
): Promise<AtencionesPaginadas | null> => {
    try {
        // 1. Mejoramos el formato de fecha para que PocketBase lo entienda perfecto (Agregamos la Z de UTC)
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() + 5);
        const fechaLimiteStr = fechaLimite.toISOString().replace('T', ' ').substring(0, 19) + 'Z';

        // 2. Filtro blindado: 
        // - Que la matrícula esté activa (matricula_activa = true ó matricula_activa = 1)
        // - Y que la fecha sea menor a 5 días, O que la fecha esté vacía (nunca ha pagado)
        const result = await pb.collection('vista_clase_alumnos').getList<VistaClaseAlumnoRecord>(page, perPage, {
            filter: `(matricula_activa = true || matricula_activa = 1) && (cobertura_hasta <= "${fechaLimiteStr}" || cobertura_hasta = "" || cobertura_hasta = null)`,
            sort: 'cobertura_hasta', 
        });
        // ELIMINAMOS EL ANY: 'item' ahora es automáticamente inferido como VistaClaseAlumnoRecord
        const items = result.items.map((item): AtencionDashboard => {
            const fechaVencimiento = item.cobertura_hasta 
                ? new Date(item.cobertura_hasta) 
                : new Date();

            return {
                id: item.id,
                atleta_id: item.atleta_id || item.id, 
                nombreAtleta: `${item.atleta_nombre || ''} ${item.atleta_apellido || ''}`.trim(),
                fecha_vencimiento: fechaVencimiento,
                monto_deuda: item.monto_deuda || item.deuda || null,
                cedula: item.atleta_cedula || 'N/A',
                // Mapeamos el nombre de la clase (o un fallback si llega vacío)
                clase_nombre: item.clase_nombre || 'Sin Clase Asignada'
            };
        });

        return {
            items,
            totalPages: result.totalPages,
            page: result.page,
            totalItems: result.totalItems
        };

    } catch (error) {
        console.error("[Dashboard Service] Error al obtener atenciones paginadas:", error);
        return null;
    }
};