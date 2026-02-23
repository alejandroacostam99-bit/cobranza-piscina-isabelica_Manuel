import { pb } from "@/lib/pb";
import type { Atleta } from "@/pages/atletas/types";

export const getAtletaById = async (id: string): Promise<Atleta> => {
  try {
    return await pb.collection('atletas').getOne<Atleta>(id);
  } catch (error) {
    console.error("Error getAtletaById:", error);
    throw new Error("No se pudo cargar la información del atleta.");
  }
};