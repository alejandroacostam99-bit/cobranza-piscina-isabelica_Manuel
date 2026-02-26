// src/pages/atletas/services/getMatriculasByAtletas.ts
import { pb } from '@/lib/pb';
import type { Matricula } from '../types';

export const getMatriculasByAtleta = async (atletaId: string, activo: boolean = true): Promise<Matricula[]> => {
  try {
    // REGLA: Buscamos por el estado solicitado, pero NUNCA traemos las eliminadas
    const records = await pb.collection('matriculas').getFullList<Matricula>({
      filter: `atleta_id = "${atletaId}" && activo = ${activo} && deleted = false`,
      expand: 'clase_id.entrenador_id',
      sort: '-created',
    });
    return records;
  } catch (error) {
    console.error("Error al obtener matrículas del atleta:", error);
    throw new Error("No se pudieron cargar las matrículas del atleta.");
  }
};