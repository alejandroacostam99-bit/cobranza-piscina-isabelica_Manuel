// src/pages/atletas/services/toggleAtletaStatus.ts
import { pb } from '@/lib/pb';
import type { Atleta, Matricula } from '../types';

export const toggleAtletaStatus = async (atleta: Atleta): Promise<Atleta> => {
  try {
    const nuevoEstado = !atleta.activo;
    
    // 1. Actualizamos el atleta
    const updatedAtleta = await pb.collection('atletas').update<Atleta>(atleta.id, {
      activo: nuevoEstado
    });

    // 2. Si el atleta se está INACTIVANDO, aplicamos Soft Delete a sus matrículas
    if (!nuevoEstado) {
      // Buscamos TODAS las matrículas del atleta que aún no hayan sido eliminadas
      const matriculasAfectadas = await pb.collection('matriculas').getFullList<Matricula>({
        filter: `atleta_id = "${atleta.id}" && deleted = false`
      });

      // Actualización en lote (Promise.all)
      if (matriculasAfectadas.length > 0) {
        await Promise.all(
          matriculasAfectadas.map(m => 
            pb.collection('matriculas').update(m.id, { 
              activo: false, 
              deleted: true // NUEVO: Marcamos como eliminada lógicamente
            })
          )
        );
      }
    }

    return updatedAtleta;
  } catch (error) {
    console.error("Error al cambiar estado del atleta:", error);
    // OBLIGATORIO: Manejo estricto de errores
    throw new Error("Ocurrió un error al intentar cambiar el estado del atleta y eliminar sus matrículas.");
  }
};