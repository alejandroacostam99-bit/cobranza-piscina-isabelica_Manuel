import { pb } from "@/lib/pb";
import type { CreatePagoDTO } from "../types";
import { CreatePagoError } from "../types/error";

export const createPagoMensualidad = async (data: CreatePagoDTO) => {
  try {
    // VALIDACIÓN ESTRICTA BACKEND: 
    // 1. Verificamos que se haya enviado un ID
    if (!data.matricula_id) {
        throw new CreatePagoError("No se proporcionó un ID de matrícula válido.");
    }

    // 2. Consultamos en la Base de Datos si la matrícula existe
    try {
        const matriculaDb = await pb.collection('matriculas').getOne(data.matricula_id);
        
        // 3. Opcional pero recomendado: Verificar que la matrícula esté activa
        if (!matriculaDb.activo) {
             throw new CreatePagoError("No se pueden registrar pagos a una matrícula inactiva.");
        }
    } catch (dbError) {
        // Si getOne falla, significa que el ID no existe en PocketBase
        console.error("Matrícula no encontrada en DB:", dbError);
        throw new CreatePagoError("La matrícula asociada no existe en el sistema. Abortando pago.");
    }

    // Si pasamos las validaciones, creamos el pago con total seguridad
    const record = await pb.collection('pagos').create(data);
    return record;

  } catch (error) {
    console.error("Error registrando el pago:", error);
    // Preservamos el mensaje de error si es nuestro propio CreatePagoError
    if (error instanceof CreatePagoError) {
        throw error;
    }
    throw new CreatePagoError("Ocurrió un error inesperado al guardar el pago en el sistema.");
  }
};