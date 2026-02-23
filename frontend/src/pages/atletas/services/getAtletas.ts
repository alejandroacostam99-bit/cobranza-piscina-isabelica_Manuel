import { pb } from '@/lib/pb';
import type { Atleta } from '../types';
import { AtletaNotGetError } from '../types/error';
import type { ListResult } from 'pocketbase';

export const getAtletas = async (page: number = 1, search: string = ''): Promise<ListResult<Atleta>> => {
  try {
    const filterRule = search 
      ? `(nombre ~ "${search}" || apellido ~ "${search}" || cedula ~ "${search}")`
      : '';

    // Pagina de 12 en 12 para que cuadre bien en grid de 3 o 4 columnas
    return await pb.collection('atletas').getList<Atleta>(page, 24, {
      filter: `${filterRule} ${filterRule ? '&&' : ''} activo = true`, 
      sort: 'nombre',
    });
  } catch (error) {
    console.error('Error fetching atletas:', error);
    throw new AtletaNotGetError('Error al obtener atletas paginados.');
  }
};