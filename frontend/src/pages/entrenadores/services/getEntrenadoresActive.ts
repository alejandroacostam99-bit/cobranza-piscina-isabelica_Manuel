
import { pb } from '@/lib/pb';
import type { Entrenador } from '@/pages/entrenadores/types';
import {  GetEntrenadorError } from '@/pages/entrenadores/types/error';


export const getEntrenadoresActive = async (): Promise<Entrenador[]> => {
  try {
    const records = await pb.collection('entrenadores').getFullList<Entrenador>({
      sort: '-created',
      filter: 'activo=true', 
    });
    
    return records;
  } catch (error) {
    console.error('Error fetching entrenadores:', error);
    throw new GetEntrenadorError("Error al obtener entrenadores");
  }
};