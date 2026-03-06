import type { RecordModel } from "pocketbase";

export interface AtletaPago extends RecordModel {
  id: string;
  nombre: string;
  apellido: string;
  cedula: string;
  fecha_nacimiento: string;
}

export interface ClasePago extends RecordModel {
  id: string;
  nombre: string;
  costo: number;
  expand?: {
    entrenador_id?: {
      nombre: string;
      apellido: string;
    };
  };
}

export interface MatriculaActiva extends RecordModel {
  id: string;
  atleta_id: string;
  clase_id: string;
  activo: boolean;
  expand?: {
    clase_id?: ClasePago;
  };
}

export interface UltimoPago extends RecordModel {
  cobertura_hasta: string;
}

export interface CreatePagoDTO {
  matricula_id: string;
  monto: number;
  referencia: string;
  fecha_pago: string;
  cobertura_desde: string;
  cobertura_hasta: string;
  type: 'USD' | 'BS'; // Añadido y tipado estrictamente
  metodo: string;       // Añadido para guardar el método exacto (zelle, pago_movil, etc.)
}