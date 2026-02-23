import { pb } from "@/lib/pb";
import type { Matricula } from "@/pages/atletas/types";

export const getMatriculasByAtleta = async (atletaId: string):Promise<Matricula[]> => {
  try {
    // Filtramos matrículas activas de este atleta
    // Expandimos la 'clase_id' para ver nombre, costo y horario
    return await pb.collection('matriculas').getFullList({
      filter: `atleta_id="${atletaId}" && activo=true`,
      sort: '-created',
      expand: 'clase_id, clase_id.entrenador_id',
    });
  } catch (error) {
    console.error("Error getMatriculasByAtleta:", error);
    throw new Error("Error al cargar las inscripciones.");
  }
};