import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Iconos
import { 
  FaSave, FaPen, FaArrowLeft, 
  FaIdCard, FaMapMarkerAlt, FaCheckCircle, 
  FaSpinner, FaUndo, FaBirthdayCake, FaBriefcaseMedical, FaUserFriends, FaPlusCircle,
  FaSwimmer // Icono solicitado
} from 'react-icons/fa';
import { MdPool } from "react-icons/md";

// Servicios y Tipos
import { getAtletaById } from '@/pages/atletas/services/getAtletaById';
import { updateAtleta } from '@/pages/atletas/services/updateAtleta';
import { getMatriculasByAtleta } from '@/pages/atletas/services/getMatriculasByAtletas';
import type { Atleta } from '@/pages/atletas/types';

// Interfaz para manejar el estado del formulario con campos divididos
interface AtletaFormData extends Partial<Atleta> {
  phoneCode?: string;
  simplePhone?: string;
  cedulaType?: string;
  cedulaNum?: string;
  repCedulaType?: string; // Nuevo: Tipo de cédula representante
  repCedulaNum?: string;  // Nuevo: Número cédula representante
}

const AtletaPerfil: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // --- ESTADOS ---
  const [atleta, setAtleta] = useState<Atleta | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [matriculas, setMatriculas] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState<AtletaFormData>({});
  
  // Feedback UI
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // --- LÓGICA DE EDAD (Calculada en tiempo real) ---
  const isMinor = useMemo(() => {
    if (!formData.fecha_nacimiento) return false;
    const today = new Date();
    const birthDate = new Date(formData.fecha_nacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age < 18;
  }, [formData.fecha_nacimiento]);

  // --- CARGA DE DATOS ---
  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      try {
        setLoading(true);
        const [atletaData, matriculasData] = await Promise.all([
          getAtletaById(id),
          getMatriculasByAtleta(id)
        ]);

        setAtleta(atletaData);
        setMatriculas(matriculasData);

        // --- PREPARAR DATOS (Desglose) ---
        
        // 1. Teléfono
        let phCode = "0412";
        let phNum = "";
        if (atletaData.telefono && atletaData.telefono.length > 4) {
             if(atletaData.telefono.includes('-')){
                 const parts = atletaData.telefono.split('-');
                 phCode = parts[0];
                 phNum = parts[1];
             } else {
                 phCode = atletaData.telefono.substring(0, 4);
                 phNum = atletaData.telefono.substring(4);
             }
        }

        // 2. Cédula Atleta
        let cedType = "V";
        let cedNum = "";
        if (atletaData.cedula) {
             const clean = atletaData.cedula.toUpperCase();
             if(clean.includes('-')){
                 const parts = clean.split('-');
                 cedType = parts[0];
                 cedNum = parts[1];
             } else {
                 cedType = clean.charAt(0);
                 cedNum = clean.substring(1);
             }
        }

        // 3. Cédula Representante
        let repType = "V";
        let repNum = "";
        if (atletaData.representante_cedula) {
            const cleanRep = atletaData.representante_cedula.toUpperCase();
            if(cleanRep.includes('-')){
                const parts = cleanRep.split('-');
                repType = parts[0];
                repNum = parts[1];
            } else {
                repType = cleanRep.charAt(0);
                repNum = cleanRep.substring(1);
            }
        }

        // 4. Fecha (Formateo Correcto YYYY-MM-DD)
        let formattedDate = "";
        if (atletaData.fecha_nacimiento) {
            formattedDate = new Date(atletaData.fecha_nacimiento).toISOString().split('T')[0];
        }

        setFormData({
            ...atletaData,
            phoneCode: phCode,
            simplePhone: phNum,
            cedulaType: cedType,
            cedulaNum: cedNum,
            repCedulaType: repType,
            repCedulaNum: repNum,
            fecha_nacimiento: formattedDate
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // --- MANEJADORES ---
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // Forzar mayúsculas solo en inputs de texto visible
    const finalValue = (type === 'text' || type === 'textarea') ? value.toUpperCase() : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const onlyNums = value.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, [name]: onlyNums }));
  };

  // --- VALIDACIÓN (Todas las alertas juntas) ---
  const validateForm = (): boolean => {
    const errors: string[] = [];

    // Validaciones Atleta
    if (!formData.nombre?.trim()) errors.push("- El NOMBRE es obligatorio.");
    if (!formData.apellido?.trim()) errors.push("- El APELLIDO es obligatorio.");

    if(!isMinor){
        if(!formData.cedulaNum?.trim()) errors.push("- La CÉDULA es obligatoria.");
    }

    if (!formData.fecha_nacimiento) errors.push("- La FECHA DE NACIMIENTO es obligatoria.");

    if (!formData.simplePhone?.trim()) errors.push("- El TELÉFONO es obligatorio.");
    else if (formData.simplePhone.length !== 7) errors.push("- El TELÉFONO debe tener 7 dígitos.");

    if (!formData.direccion?.trim()) errors.push("- La DIRECCIÓN es obligatoria.");

    // Validaciones Representante (Solo si es menor)
    if (isMinor) {
        if (!formData.representante_nombre?.trim()) errors.push("- Nombre del REPRESENTANTE es obligatorio (es menor de edad).");
        
        if (!formData.repCedulaNum?.trim()) errors.push("- Cédula del REPRESENTANTE es obligatoria (es menor de edad).");
        else if (formData.repCedulaNum.length < 5) errors.push("- La CÉDULA del representante es muy corta.");
    }

    // Si hay errores, mostrarlos todos juntos
    if (errors.length > 0) {
        alert("POR FAVOR CORRIJA LOS SIGUIENTES ERRORES:\n\n" + errors.join("\n"));
        return false;
    }

    return true;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!validateForm()) return;

    try {
      setSaving(true);
      setError(null);

      // Reconstruir Strings
      const finalPhone = `${formData.phoneCode}-${formData.simplePhone}`;
      const finalCedula = `${formData.cedulaType}-${formData.cedulaNum}`;
      const finalRepCedula = isMinor ? `${formData.repCedulaType}-${formData.repCedulaNum}` : '';

      const payload: Partial<Atleta> = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        cedula: finalCedula,
        telefono: finalPhone,
        fecha_nacimiento: new Date(formData.fecha_nacimiento!).toISOString(),
        direccion: formData.direccion,
        condicion_medica: formData.condicion_medica,
        // Representante
        representante_nombre: isMinor ? formData.representante_nombre : '',
        representante_cedula: finalRepCedula,
      };

      const updated = await updateAtleta(id, payload);
      setAtleta(updated);
      setSuccessMsg("Perfil actualizado correctamente");
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(null), 3000);

    } catch (err) {
      setError("No se pudieron guardar los cambios. Verifique su conexión.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    window.location.reload(); 
  };

  // --- RENDER ---
  if (loading) return <div className="flex justify-center p-10"><FaSpinner className="animate-spin text-4xl text-blue-600"/></div>;
  if (!atleta) return <div className="p-10 text-center">Atleta no encontrado</div>;

  // Clases CSS
  const inputClass = `w-full p-2.5 rounded-lg border transition-all outline-none text-sm uppercase ${
    isEditing 
      ? 'border-blue-300 focus:ring-2 focus:ring-blue-500/20 bg-white text-slate-800' 
      : 'border-transparent bg-slate-100 text-slate-600 font-medium cursor-not-allowed'
  }`;

  const labelClass = "block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1";
  
  const prefixSelectClass = `rounded-l-lg border-r-0 text-center font-bold text-slate-700 cursor-pointer text-sm outline-none ${
    isEditing 
      ? 'bg-slate-50 border border-blue-300 focus:ring-2 focus:ring-blue-500/20' 
      : 'bg-slate-200 border-transparent cursor-not-allowed'
  }`;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in pb-20">
      
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-slate-500 hover:text-blue-600 font-medium text-sm transition-colors">
        <FaArrowLeft className="mr-2" /> Volver al Directorio
      </button>

      {/* --- HEADER --- */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-t-2xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="bg-white/20 p-4 rounded-full backdrop-blur-md border-2 border-white/30 shadow-inner">
             {/* Icono de Nadador */}
             <FaSwimmer className="text-4xl text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight uppercase">{atleta.nombre} {atleta.apellido}</h1>
            <div className="flex gap-3 mt-2">
                <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-mono flex items-center gap-1">
                    <FaIdCard/> {atleta.cedula}
                </span>
                {atleta.condicion_medica && (
                    <span className="bg-red-500/80 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 animate-pulse">
                        <FaBriefcaseMedical/> CONDICIÓN MÉDICA
                    </span>
                )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {isEditing ? (
             <button onClick={handleCancel} className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white transition-all backdrop-blur-sm">
               <FaUndo /> Cancelar
             </button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 shadow-md transition-all">
               <FaPen className="text-xs" /> Editar Datos
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- FORMULARIO --- */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            
            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-100">{error}</div>}
            {successMsg && <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded flex items-center gap-2"><FaCheckCircle/> {successMsg}</div>}

            <form onSubmit={handleSave} className="space-y-5">
                
                {/* Nombre y Apellido */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className={labelClass}>Nombre <span className="text-red-400">*</span></label>
                        <input type="text" name="nombre" value={formData.nombre || ''} onChange={handleInputChange} disabled={!isEditing} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Apellido <span className="text-red-400">*</span></label>
                        <input type="text" name="apellido" value={formData.apellido || ''} onChange={handleInputChange} disabled={!isEditing} className={inputClass} />
                    </div>
                </div>

                {/* Cédula y Teléfono */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Cédula Atleta */}
                    <div>
                        <label className={labelClass}>Cédula <span className="text-red-400">*</span></label>
                        <div className="flex w-full">
                            <select name="cedulaType" value={formData.cedulaType} onChange={handleInputChange} disabled={!isEditing} className={`w-16 ${prefixSelectClass}`}>
                                <option value="V">V</option>
                                <option value="E">E</option>
                            </select>
                            <input type="text" name="cedulaNum" maxLength={10} value={formData.cedulaNum || ''} onChange={handleNumberChange} disabled={!isEditing} className={`flex-1 rounded-l-none rounded-r-lg font-mono ${inputClass}`} />
                        </div>
                    </div>
                    
                    {/* Teléfono (6 Opciones) */}
                    <div>
                        <label className={labelClass}>Teléfono <span className="text-red-400">*</span></label>
                        <div className="flex w-full">
                            <select name="phoneCode" value={formData.phoneCode} onChange={handleInputChange} disabled={!isEditing} className={`w-24 ${prefixSelectClass}`}>
                                <option value="0412">0412</option>
                                <option value="0414">0414</option>
                                <option value="0424">0424</option>
                                <option value="0416">0416</option>
                                <option value="0426">0426</option>
                                <option value="0241">0241</option> {/* Opción Local */}
                            </select>
                            <input type="text" name="simplePhone" maxLength={7} value={formData.simplePhone || ''} onChange={handleNumberChange} disabled={!isEditing} placeholder="1234567" className={`flex-1 rounded-l-none rounded-r-lg font-mono ${inputClass}`} />
                        </div>
                    </div>
                </div>

                {/* Fecha Nacimiento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className={labelClass}>Fecha de Nacimiento <span className="text-red-400">*</span></label>
                        <div className="relative">
                            <FaBirthdayCake className="absolute top-3 left-3 text-slate-400 z-10"/>
                            <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento || ''} onChange={handleInputChange} disabled={!isEditing} className={`${inputClass} pl-10 uppercase`} />
                        </div>
                        <p className="text-[10px] mt-1 text-slate-400 text-right">
                           {isMinor ? <span className="text-orange-500 font-bold">ES MENOR DE EDAD</span> : <span className="text-green-600 font-bold">ES MAYOR DE EDAD</span>}
                        </p>
                    </div>
                </div>

                {/* Dirección */}
                <div>
                    <label className={labelClass}>Dirección <span className="text-red-400">*</span></label>
                    <div className="relative">
                        <FaMapMarkerAlt className="absolute top-3 left-3 text-slate-400 z-10"/>
                        <textarea rows={2} name="direccion" value={formData.direccion || ''} onChange={handleInputChange} disabled={!isEditing} className={`${inputClass} pl-10 resize-none`} />
                    </div>
                </div>

                {/* Condición Médica */}
                <div className="pt-4 border-t border-slate-100">
                    <label className={`${labelClass} text-red-400`}>Condición Médica</label>
                    <textarea rows={2} name="condicion_medica" value={formData.condicion_medica || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="NINGUNA"
                        className={`${inputClass} ${formData.condicion_medica ? 'bg-red-50 text-red-700 border-red-100' : ''}`} 
                    />
                </div>

                {/* --- SECCIÓN REPRESENTANTE (SOLO SI ES MENOR) --- */}
                {isMinor && (
                    <div className="pt-4 border-t border-slate-100 bg-orange-50/30 p-4 rounded-xl border border-orange-100 animate-fade-in">
                        <h4 className="text-xs font-bold text-orange-500 uppercase mb-3 flex items-center gap-2">
                            <FaUserFriends className="text-lg"/> Datos del Representante (Obligatorio)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Nombre y Apellido Rep.</label>
                                <input type="text" name="representante_nombre" value={formData.representante_nombre || ''} onChange={handleInputChange} disabled={!isEditing} className={inputClass} />
                            </div>
                            
                            {/* Cédula Representante (Dividida) */}
                            <div>
                                <label className={labelClass}>Cédula Rep.</label>
                                <div className="flex w-full">
                                    <select name="repCedulaType" value={formData.repCedulaType || 'V'} onChange={handleInputChange} disabled={!isEditing} className={`w-16 ${prefixSelectClass}`}>
                                        <option value="V">V</option>
                                        <option value="E">E</option>
                                    </select>
                                    <input type="text" name="repCedulaNum" maxLength={10} value={formData.repCedulaNum || ''} onChange={handleNumberChange} disabled={!isEditing} className={`flex-1 rounded-l-none rounded-r-lg font-mono ${inputClass}`} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isEditing && (
                    <button type="submit" disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all flex justify-center items-center gap-2 mt-4">
                        {saving ? <FaSpinner className="animate-spin" /> : <FaSave />} Guardar Cambios
                    </button>
                )}
            </form>
        </div>

        {/* --- LISTA DE MATRÍCULAS --- */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full min-h-[400px]">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                        <MdPool className="text-blue-500 text-xl"/> Matrículas Activas
                    </h2>
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">
                        {matriculas.length}
                    </span>
                </div>

                <div className="flex-1 p-4 overflow-y-auto max-h-[500px] space-y-3">
                    {matriculas.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">
                            <MdPool className="mx-auto text-4xl opacity-20 mb-2"/>
                            <p className="text-sm">Sin inscripciones activas.</p>
                        </div>
                    ) : (
                        matriculas.map((mat) => {
                            const clase = mat.expand?.clase_id;
                            const profe = clase?.expand?.entrenador_id;
                            return (
                                <div key={mat.id} className="border border-slate-100 rounded-xl p-3 bg-white shadow-sm hover:shadow-md transition-all">
                                    <h4 className="font-bold text-blue-900 text-sm mb-1 uppercase">{clase?.nombre || 'Clase Desconocida'}</h4>
                                    <p className="text-xs text-slate-500 mb-2 uppercase">
                                        Prof. {profe ? `${profe.nombre} ${profe.apellido}` : 'Sin asignar'}
                                    </p>
                                    <div className="flex justify-between items-center border-t border-slate-50 pt-2">
                                        <span className="text-xs font-mono font-bold text-green-600">${clase?.costo}</span>
                                        <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Activo</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 bg-white">
                    <button 
                        onClick={() => navigate(`/atletas/matricular/${id}`)}
                        className="w-full py-3 rounded-xl border-2 border-dashed border-blue-200 text-blue-600 font-bold text-sm hover:bg-blue-50 hover:border-blue-300 transition-all flex justify-center items-center gap-2"
                    >
                        <FaPlusCircle /> Nueva Inscripción
                    </button>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default AtletaPerfil;