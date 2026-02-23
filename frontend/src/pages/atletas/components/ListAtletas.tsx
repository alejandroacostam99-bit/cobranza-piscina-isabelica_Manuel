import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Iconos
import { 
  FaIdCard, 
  FaSearch, 
  FaBirthdayCake, 
  FaBriefcaseMedical, 
  FaUserFriends,
  FaArrowRight,
  FaSpinner,
  FaSwimmer, // Nuevo icono de usuario
  FaChevronLeft,
  FaChevronRight,
  FaMapMarkerAlt
} from 'react-icons/fa';

import { MdPool } from "react-icons/md";

// Tipos y Servicios
import type { Atleta } from '@/pages/atletas/types';
import { AtletaError } from '@/pages/atletas/types/error';
import { getAtletas } from '@/pages/atletas/services/getAtletas';

const ListAtletas: React.FC = () => {
  const navigate = useNavigate();

  // --- ESTADOS DE DATOS ---
  const [atletas, setAtletas] = useState<Atleta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // --- ESTADOS DE PAGINACIÓN ---
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // --- ESTADOS DE FILTRO ---
  const [filter, setFilter] = useState(''); // Lo que escribe el usuario
  const [debouncedFilter, setDebouncedFilter] = useState(''); // Lo que enviamos a la BD

  // 1. Efecto Debounce: Espera 500ms después de escribir para ejecutar la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilter(filter);
      setPage(1); // Al buscar, reseteamos a la página 1
    }, 500);

    return () => clearTimeout(timer);
  }, [filter]);

  // 2. Efecto de Carga: Se dispara al cambiar Página o Filtro procesado
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getAtletas(page, debouncedFilter);
        setAtletas(data.items);
        setTotalPages(data.totalPages);
        setTotalItems(data.totalItems);
      } catch (err) {
        alert((err as AtletaError).message || 'Error al cargar atletas');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, debouncedFilter]);

  // --- Helper: Calcular Edad ---
  const calculateAge = (dobString: string) => {
    if (!dobString) return 'N/A';
    const dob = new Date(dobString);
    const diff_ms = Date.now() - dob.getTime();
    const age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      
      {/* --- ENCABEZADO Y BUSCADOR --- */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-3xl font-black uppercase text-slate-800 tracking-tight">
            Directorio de <span className="text-blue-600">Atletas</span>
          </h2>
          <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
            <MdPool className="text-blue-400"/>
            <span>Listado Oficial ({totalItems} Registros)</span>
          </p>
        </div>

        {/* Buscador */}
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FaSearch className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input 
            type="text"
            placeholder="Buscar por nombre, apellido o cédula..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm focus:shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-medium"
          />
        </div>
      </div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 text-blue-600">
          <FaSpinner className="animate-spin text-5xl mb-4" />
          <p className="font-bold tracking-widest uppercase text-xs animate-pulse">Sincronizando...</p>
        </div>
      ) : atletas.length === 0 ? (
        <div className="text-center py-24 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <FaSwimmer className="text-6xl text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No se encontraron atletas.</p>
        </div>
      ) : (
        <>
          {/* GRID DE TARJETAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up">
            {atletas.map((atleta) => {
              const edad = calculateAge(atleta.fecha_nacimiento);
              const tieneRepresentante = !!atleta.representante_nombre;
              const tieneCondicion = !!atleta.condicion_medica;

              return (
                <div 
                  key={atleta.id}
                  onClick={() => navigate(`/atletas/perfil/${atleta.id}`)}
                  className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden cursor-pointer hover:-translate-y-1"
                >
                  {/* Borde lateral con gradiente */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-500 to-cyan-300"></div>

                  <div className="p-5 pl-7">
                    
                    {/* Header Tarjeta: Avatar + Badges */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <FaSwimmer /> {/* Icono Cambiado */}
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
                        {tieneCondicion && (
                          <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-50 text-red-600 text-[10px] font-bold border border-red-100 animate-pulse" title={atleta.condicion_medica}>
                            <FaBriefcaseMedical /> ALERTA
                          </span>
                        )}
                        {tieneRepresentante && (
                          <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-orange-50 text-orange-600 text-[10px] font-bold border border-orange-100">
                            <FaUserFriends /> MENOR
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Info Principal */}
                    <div className="mb-4">
                      <h3 className="text-lg font-extrabold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors uppercase truncate">
                        {atleta.nombre} {atleta.apellido}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md flex items-center gap-1">
                          <FaIdCard className="text-slate-400"/> {atleta.cedula}
                        </span>
                        <span className="text-xs font-medium text-slate-400 flex items-center gap-1 px-1">
                           <FaBirthdayCake className="text-slate-300 mb-0.5"/> {edad} Años
                        </span>
                      </div>
                    </div>

                    {/* Datos de Contacto (Resumen) */}
                    <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                      <div className="text-xs text-slate-400 font-medium max-w-[70%]">
                        {tieneRepresentante ? (
                          <div className="flex flex-col">
                             <span className="uppercase text-[10px] text-slate-300 font-bold">Representante</span>
                             <span className="truncate text-slate-600">{atleta.representante_nombre}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-slate-500">
                             <FaMapMarkerAlt className="text-slate-300"/> 
                             <span className="truncate">{atleta.direccion || 'Sin dirección'}</span>
                          </div>
                        )}
                      </div>

                      <button className="w-8 h-8 rounded-full bg-slate-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                         <FaArrowRight size={12} />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* --- CONTROLES DE PAGINACIÓN --- */}
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center items-center gap-4 animate-fade-in">
                <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                >
                    <FaChevronLeft /> Anterior
                </button>
                
                <span className="font-mono font-bold text-slate-400 text-xs bg-slate-100 px-3 py-1 rounded-lg">
                    {page} / {totalPages}
                </span>

                <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                >
                    Siguiente <FaChevronRight />
                </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ListAtletas;