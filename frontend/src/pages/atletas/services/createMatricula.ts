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
    type: 'USD' | 'BS';
    metodo: string;
  };
}

export const createMatricula = async (data: CreateMatriculaConPagoDTO) => {
  let matriculaCreadaId: string | null = null;
  let pagoCreadoId: string | null = null;

  try {
    // 1. Crear la Matrícula
    const matricula = await pb.collection('matriculas').create(data.matricula);
    matriculaCreadaId = matricula.id;

    // VALIDACIÓN ESTRICTA: Asegurarnos de que la matrícula realmente se creó y tiene ID
    if (!matriculaCreadaId) {
        throw new Error("El sistema no devolvió un ID para la matrícula. Operación abortada.");
    }

    // 2. Crear el Pago asociado a la nueva matrícula
    const pagoPayload = {
      matricula_id: matriculaCreadaId,
      monto: data.pago.monto,
      referencia: data.pago.referencia,
      fecha_pago: data.pago.fecha_pago,
      cobertura_desde: data.pago.cobertura_desde,
      cobertura_hasta: data.pago.cobertura_hasta,
      type: data.pago.type,      
      metodo: data.pago.metodo,  
    };

    const pago = await pb.collection('pagos').create(pagoPayload);
    pagoCreadoId = pago.id; // Guardamos el ID del pago para posible rollback

    // 3. ACTIVAR AL ALUMNO (Paso Final)
    // Como ya garantizamos que tiene matrícula y pago, lo pasamos a estado activo
    await pb.collection('atletas').update(data.matricula.atleta_id, {
      activo: true
    });

    return matricula;

  } catch (error) {
    console.warn("Fallo en la transacción, iniciando rollback manual...");

    // ROLLBACK MANUAL INVERSO
    // A. Si se creó el pago (y falló la activación del atleta), borramos el pago
    if (pagoCreadoId) {
      await pb.collection('pagos').delete(pagoCreadoId).catch(err => 
        console.error("Error al revertir el pago:", err)
      );
    }

    // B. Si se creó la matrícula (y falló el pago o el atleta), borramos la matrícula
    if (matriculaCreadaId) {
      await pb.collection('matriculas').delete(matriculaCreadaId).catch(err => 
        console.error("Error al revertir la matrícula:", err)
      );
    }
    
    console.error("Error en la transacción Matrícula-Pago-Atleta:", error);
    throw new Error(error instanceof Error ? error.message : "No se pudo procesar la inscripción completa. Cambios revertidos.");
  }
};