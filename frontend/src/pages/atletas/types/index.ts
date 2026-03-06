import type { RecordModel } from "pocketbase";

export interface UltimoPago extends RecordModel {
  cobertura_hasta: string;
}
// 1. TU INTERFAZ ATLETA INTACTA (No se toca)
export interface Atleta {
  id: string;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  direccion: string;
  activo: boolean;
  fecha_nacimiento: string; 
  representante_nombre?: string;
  representante_cedula?: string;
  condicion_medica?: string;
  created?: string;
  updated?: string;
}

// 2. NUEVAS INTERFACES (Para las Clases y Entrenadores)
export interface EntrenadorResumen {
  id: string;
  nombre: string;
  apellido: string;
}

export interface Clase extends RecordModel {
  id: string;
  nombre: string;
  costo: number;
  edadMin: number;
  entrenador_id: string;
  activo: boolean;
  expand?: {
    entrenador_id?: EntrenadorResumen;
  };
}

// 3. TU INTERFAZ MATRÍCULA (Enriquecida pero compatible hacia atrás)
export interface Matricula extends RecordModel {
  id: string;
  atleta_id: string;
  clase_id: string;
  activo: boolean;
  
  // -- NUEVOS CAMPOS (Añadidos como opcionales ? para no romper código previo) --
  fecha_inscripcion?: string;
  
  // -- EXPAND MEJORADO --
  expand?: {
    atleta_id?: Atleta; // Tu expand original (le pongo ? por si en alguna consulta no haces expand)
    clase_id?: Clase;   // El nuevo expand que necesitamos para la vista de matrícula
  };
}