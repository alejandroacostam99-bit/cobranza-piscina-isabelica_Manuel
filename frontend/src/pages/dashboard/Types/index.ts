// Tipado de lo que devuelve la base de datos (PocketBase Records)
export interface VistaClaseAlumnoRecord {
    id: string;
    atleta_id?: string;
    cedula?: string;
    atleta_nombre?: string;
    atleta_apellido?: string;
    cobertura_hasta?: string; // PocketBase devuelve fechas como strings ISO
    monto_deuda?: number;
    deuda?: number;
    atleta_cedula?: string;
    clase_nombre?: string;
}

export interface VistaEstadisticasRecord {
    id: string;
    total_atletas?: number;
    total_matriculas?: number;
    total_entrenadores?: number;
    ingresos_mes?: number;
    deudores_activos?: number;
    por_vencer?: number;
}

export interface AtencionDashboard {
    id: string;
    atleta_id: string;
    nombreAtleta: string;
    fecha_vencimiento: Date;
    monto_deuda: number | null;
    cedula: string;
    clase_nombre: string;
}

export interface EstadisticasDashboard {
    totalAtletas: number;
    totalMatriculas: number;
    totalEntrenadores: number;
    ingresosMes: number;
    deudoresActivos: number;
    porVencer: number;
}

import type { IconType } from "react-icons";

// Exportaciones del módulo Grid
export interface DashboardModuleCard {
    id: string;
    titulo: string;
    descripcion: string;
    ruta: string;
    icono: IconType;
    colorFondo: string;
    colorIcono: string;
}

// ... aquí van también las de EstadisticasDashboard y AtencionDashboard que hicimos antes ...

// Define exactamente qué clases de Tailwind requiere un color del tema
export interface ThemeColor {
    text: string;
    bg: string;
    border: string;
    glow: string;
}
// Define la estructura exacta que devuelve la vista SQL
export interface VistaClaseAlumnoRecord {
    id: string;
    clase_id?: string;
    matricula_activa?: boolean;
    atleta_id?: string;
    atleta_nombre?: string;
    atleta_apellido?: string;
    atleta_cedula?: string;
    atleta_telefono?: string;
    cobertura_hasta?: string;
    // Si a futuro calculas deuda en la vista, agrégalo aquí:
    monto_deuda?: number; 
    deuda?: number;
}