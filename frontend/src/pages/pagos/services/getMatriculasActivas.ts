import { pb } from "@/lib/pb";
import type { MatriculaActiva } from "../types";
import { GetMatriculasError } from "../types/error";

export const getMatriculasActivas = async (atletaId: string): Promise<MatriculaActiva[]> => {
  try {
    return await pb.collection('matriculas').getFullList<MatriculaActiva>({
      filter: `atleta_id="${atletaId}" && activo=true && deleted=false`,
      expand: 'clase_id.entrenador_id',
    });
  } catch (error) {
    console.error("Error obteniendo matrículas activas:", error);
    throw new GetMatriculasError("No se pudieron cargar las clases del atleta.");
  }
};