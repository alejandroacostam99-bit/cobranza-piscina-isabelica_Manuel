//primer servicio obtenerAtencionesDeDashboard

import { pb } from '../../../lib/pb';

export const obtenerAtencionesDeDashboard = async () => {
    try {
        const records = await pb.collection('vista_clase_alumnos').getFullList();

        return records.map((item: any) => {
            const fechaVencimiento = item.cobertura_hasta ? new Date(item.cobertura_hasta) : new Date();

            return {
                id: item.id,
                // AGREGAMOS ESTA LÍNEA PARA IDENTIFICARLO ÚNICAMENTE
                atleta_id: item.atleta_id || item.cedula || item.id,

                nombreAtleta: `${item.atleta_nombre || ''} ${item.atleta_apellido || ''}`.trim(),
                fecha_vencimiento: fechaVencimiento,
                monto_deuda: item.monto_deuda || item.deuda || null
            };
        });

    } catch (error) {
        console.error("Error al obtener la vista del dashboard:", error);
        return [];
    }
};
// Segundo servicio obtenerEstadisticasDashboard

export const obtenerEstadisticasDashboard = async () => {
    try {
        // 1. Entrenadores e Ingresos
        const entrenadores = await pb.collection('entrenadores').getList(1, 1);

        const hoy = new Date();
        const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
            .toISOString().replace('T', ' ').substring(0, 19);

        const pagosMes = await pb.collection('pagos').getFullList({
            filter: `fecha_pago >= "${primerDiaMes}"`
        });
        const ingresosTotales = pagosMes.reduce((suma, pago) => suma + (pago.monto || 0), 0);

        // ------------------------------------------------------------------
        // 2. EL CONTEO REAL DE ALUMNOS (Directo de la tabla matrículas)
        // ------------------------------------------------------------------
        // Traemos TODAS las matrículas que estén ACTIVAS
        const matriculasActivas = await pb.collection('matriculas').getFullList({
            filter: 'activo = true'
        });

        // Metemos los IDs en la caja inteligente para que no se repitan
        const alumnosActivosUnicos = new Set();
        matriculasActivas.forEach((m: any) => {
            alumnosActivosUnicos.add(m.atleta_id || m.id);
        });

        // ------------------------------------------------------------------
        // 3. LAS DEUDAS (Seguimos usando la vista para las fechas de pago)
        // ------------------------------------------------------------------
        const vista = await obtenerAtencionesDeDashboard();
        let deudores = 0;
        let porVencer = 0;

        hoy.setHours(0, 0, 0, 0);

        vista.forEach((item: any) => {
            const venc = new Date(item.fecha_vencimiento);
            venc.setHours(0, 0, 0, 0);
            const diff = Math.ceil((venc.getTime() - hoy.getTime()) / (1000 * 3600 * 24));

            if (diff < 0) deudores++;
            else if (diff >= 0 && diff <= 5) porVencer++;
        });

        return {
            totalAtletas: alumnosActivosUnicos.size, // ¡Ahora sí dirá 5!
            totalMatriculas: matriculasActivas.length, // El total de matrículas activas reales
            totalEntrenadores: entrenadores.totalItems,
            ingresosMes: ingresosTotales,
            deudoresActivos: deudores,
            porVencer: porVencer
        };

    } catch (error) {
        console.error("Error al obtener estadísticas:", error);
        return null;
    }
};