import { pb } from '@/lib/pb';

export const deleteMatricula = async (id: string): Promise<boolean> => {
  try {
    // Soft Delete: La marcamos como eliminada y la desactivamos por seguridad
    await pb.collection('matriculas').update(id, {
      deleted: true,
      activo: false 
    });
    return true;
  } catch (error) {
    console.error("Error al eliminar la matrícula:", error);
    throw new Error("No se pudo eliminar la inscripción. Verifique su conexión.");
  }
};