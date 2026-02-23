// src/pages/atletas/services/createMatricula.ts
import { pb } from "@/lib/pb";

export interface CreateMatriculaConPagoDTO {
  matricula: {
    atleta_id: string;
    clase_id: string;
    fecha_inscripcion: string;
    activo: boolean;
  };
  pago: {
    monto: number;
    referencia: string;
    fecha_pago: string;
    cobertura_desde: string;
    cobertura_hasta: string;
    // Agrega estos campos si los tienes en tu tabla pagos
    // moneda: string; 
    // metodo: string;
  };
}

export const createMatricula = async (data: CreateMatriculaConPagoDTO) => {
  let matriculaCreadaId = null;

  try {
    // 1. Crear la Matrícula
    const matricula = await pb.collection('matriculas').create(data.matricula);
    matriculaCreadaId = matricula.id;

    // 2. Crear el Pago asociado a la nueva matrícula
    const pagoPayload = {
      matricula_id: matriculaCreadaId,
      monto: data.pago.monto,
      referencia: data.pago.referencia,
      fecha_pago: data.pago.fecha_pago,
      cobertura_desde: data.pago.cobertura_desde,
      cobertura_hasta: data.pago.cobertura_hasta,
    };
    
    await pb.collection('pagos').create(pagoPayload);

    return matricula;

  } catch (error) {
    // 3. ROLLBACK MANUAL: Si falla el pago, borramos la matrícula
    if (matriculaCreadaId) {
      console.warn("Fallo el pago, revirtiendo creación de matrícula...");
      await pb.collection('matriculas').delete(matriculaCreadaId).catch(console.error);
    }
    console.error("Error en la transacción Matrícula-Pago:", error);
    throw new Error("No se pudo procesar la inscripción y el pago. Intente de nuevo.");
  }
};