// src/pages/entrenadores/services/deleteClase.ts
import { pb } from '@/lib/pb';
import type { Matricula } from '@/pages/atletas/types';

export const deleteClase = async (claseId: string): Promise<boolean> => {
  try {
    // 1. Obtenemos todas las matrículas asociadas a esta clase 
    // que aún no han sido marcadas como eliminadas
    const matriculasAfectadas = await pb.collection('matriculas').getFullList<Matricula>({
      filter: `clase_id = "${claseId}" && deleted = false`
    });

    // 2. Las marcamos como eliminadas Y las inactivamos por seguridad
    if (matriculasAfectadas.length > 0) {
      await Promise.all(
        matriculasAfectadas.map(m => pb.collection('matriculas').update(m.id, { 
          deleted: true, 
          activo: false 
        }))
      );
    }

    // 3. ELIMINACIÓN LÓGICA DE LA CLASE: 
    // En lugar de un delete() físico que rompe las relaciones, la desactivamos permanentemente.
    await pb.collection('clases').update(claseId, {
      activo: false
      // Nota: Si agregas un campo "deleted: boolean" a la colección "clases" en Pocketbase,
      // puedes descomentar la siguiente línea para que no aparezca en ninguna lista regular:
      // deleted: true 
    });
    
    return true;
  } catch (error) {
    console.error("Error al 'eliminar' (desactivar) la clase:", error);
    // OBLIGATORIO: Manejo de errores en la capa de servicios
    throw new Error("No se pudo desactivar la clase. Verifique su conexión y vuelva a intentarlo.");
  }
};