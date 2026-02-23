import { pb } from "@/lib/pb";
import type { Clase } from "../types";

export const getClasesDisponibles = async (): Promise<Clase[]> => {
  try {
    // AQUÍ ESTÁ EL CAMBIO: Le indicamos <Clase> a getFullList y lo casteamos
    const records = await pb.collection('clases').getFullList<Clase>({
      filter: 'activo = true',
      expand: 'entrenador_id',
      sort: 'nombre',
    });
    
    return records as Clase[];
  } catch (error) {
    console.error("Error al obtener clases:", error);
    throw new Error("No se pudieron cargar las clases disponibles.");
  }
};