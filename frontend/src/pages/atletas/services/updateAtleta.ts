import { pb } from "@/lib/pb";
import type { Atleta } from "@/pages/atletas/types";

export const updateAtleta = async (id: string, data: Partial<Atleta>) => {
  try {
    return await pb.collection('atletas').update<Atleta>(id, data);
  } catch (error) {
    console.error("Error updateAtleta:", error);
    throw new Error("Error al guardar los cambios del perfil.");
  }
};