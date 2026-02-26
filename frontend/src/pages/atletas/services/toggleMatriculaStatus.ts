// src/pages/atletas/services/toggleMatriculaStatus.ts
import { pb } from '@/lib/pb';
import type { Matricula } from '../types';

export const toggleMatriculaStatus = async (id: string, currentStatus: boolean): Promise<Matricula> => {
  try {
    const nuevoEstado = !currentStatus;

    // 1. REGLA DE NEGOCIO: Si vamos a ACTIVAR la matrícula, verificamos la clase.
    if (nuevoEstado === true) {
      // Obtenemos la matrícula con los datos de su clase expandidos
      const matricula = await pb.collection('matriculas').getOne(id, {
        expand: 'clase_id'
      });

      const clase = matricula.expand?.clase_id;

      // Si la clase no existe o fue eliminada lógicamente (activo = false)
      if (!clase || clase.activo === false) {
        // Marcamos la matrícula como eliminada (Soft Delete) para limpiar la base de datos
        await pb.collection('matriculas').update(id, {
          activo: false,
          deleted: true
        });
        
        // Lanzamos un error con un mensaje específico para la UI
        throw new Error("CLASE_INACTIVA");
      }
    }

    // 2. Si la clase es válida o simplemente estamos desactivando, procedemos normal
    const result = await pb.collection('matriculas').update<Matricula>(id, {
      activo: nuevoEstado
    });
    
    return result;
  } catch (error) {
    console.error("Error al cambiar estado de la matrícula:", error);
    
    // Si el error es nuestra validación de clase inactiva, lo propagamos tal cual
    if (error instanceof Error && error.message === "CLASE_INACTIVA") {
      throw new Error("No se puede reactivar: La clase asociada a esta matrícula fue eliminada. La matrícula ha sido descartada del historial.");
    }
    
    throw new Error("No se pudo actualizar el estado de la inscripción. Verifique su conexión.");
  }
};