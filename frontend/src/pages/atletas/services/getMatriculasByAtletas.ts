import { pb } from '@/lib/pb';
import type { Matricula } from '../types';
import { getUltimaCobertura } from '@/pages/atletas/services/getUltimaCobertura';

export const getMatriculasByAtleta = async (atletaId: string, activo: boolean = true): Promise<Matricula[]> => {
  try {
    // 1. Buscamos las matrículas base
    const records = await pb.collection('matriculas').getFullList<Matricula>({
      filter: `atleta_id = "${atletaId}" && activo = ${activo} && deleted = false`,
      expand: 'clase_id.entrenador_id',
      sort: '-created',
    });

    // 2. Enriquecemos los datos consultando la última cobertura en paralelo
    const matriculasEnriquecidas = await Promise.all(
      records.map(async (mat) => {
        try {
          // Buscamos la fecha del último pago para esta matrícula
          const cobertura = await getUltimaCobertura(mat.id);
          // Retornamos la matrícula copiando todos sus datos y añadiendo la fecha
          return { ...mat, ultima_cobertura: cobertura };
        } catch (error) {
          console.warn(`No se pudo cargar cobertura para matrícula ${mat.id}`, error);
          return { ...mat, ultima_cobertura: null };
        }
      })
    );

    // 3. Devolvemos el array ya listo para que el Frontend solo lo pinte
    return matriculasEnriquecidas;

  } catch (error) {
    console.error("Error al obtener matrículas del atleta:", error);
    throw new Error("No se pudieron cargar las matrículas del atleta.");
  }
};