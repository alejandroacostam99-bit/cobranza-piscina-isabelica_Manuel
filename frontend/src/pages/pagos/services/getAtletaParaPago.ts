import { pb } from "@/lib/pb";
import type { AtletaPago } from "../types";
import { GetAtletaError } from "../types/error";

export const getAtletaParaPago = async (id: string): Promise<AtletaPago> => {
  try {
    return await pb.collection('atletas').getOne<AtletaPago>(id);
  } catch (error) {
    console.error("Error obteniendo atleta para pago:", error);
    throw new GetAtletaError("No se pudo cargar la información del atleta.");
  }
};