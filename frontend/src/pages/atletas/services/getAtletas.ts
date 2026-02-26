// src/pages/atletas/services/getAtletas.ts
import { pb } from '@/lib/pb';
import type { Atleta } from '../types';

// OBLIGATORIO: Mantener interfaces separadas (puedes mover esto a tu archivo types si prefieres)
export interface GetAtletasParams {
  page?: number;
  perPage?: number;
  searchTerm?: string;
  activo?: boolean; // Nuevo parámetro
}

export const getAtletas = async ({ 
  page = 1, 
  perPage = 10, 
  searchTerm = '', 
  activo = true // Por defecto buscamos los activos
}: GetAtletasParams) => {
  try {
    // 1. Empezamos el filtro con el estado del atleta
    let filterString = `activo = ${activo}`;

    // 2. Si hay un término de búsqueda, lo concatenamos con un AND (&&)
    if (searchTerm) {
      // Ajusta los campos por los que quieras buscar
      filterString += ` && (nombre ~ "${searchTerm}" || apellido ~ "${searchTerm}" || cedula ~ "${searchTerm}")`;
    }

    // 3. Consulta a PocketBase
    const result = await pb.collection('atletas').getList<Atleta>(page, perPage, {
      filter: filterString,
      sort: '-created', // Ordenar por los más recientes
    });

    return result;
  } catch (error) {
    console.error("Error en getAtletas:", error);
    // OBLIGATORIO: Manejo de errores en servicios
    throw new Error("Ocurrió un error al cargar la lista de atletas. Verifique su conexión.");
  }
};