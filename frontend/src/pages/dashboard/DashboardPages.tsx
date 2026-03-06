import { ComponentsModuleGrid } from "./Components/ComponentsModuleGrid";
import { DashboardStats } from "./Components/DashboardStats";
import { DashboardActionTable } from "./Components/DashboardActionTable"; // <-- Importamos la tabla

const DashboardPages = () => {
  return (
    // El fondo bg-slate-50 es vital para que las tarjetas blancas resalten
    <div className="p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto min-h-screen bg-slate-50">

      {/* Encabezado del Dashboard */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800">Centro de Control</h1>
        <p className="text-sm md:text-base text-slate-500 mt-1">Resumen operativo y financiero de la academia.</p>
      </div>

      {/* Fila 1: Botones de Acceso Rápido */}
      <ComponentsModuleGrid />

      {/* Fila 2: Tarjetas de Estadísticas (KPIs) */}
      <DashboardStats />

      {/* Fila 3: Tabla de Acción Inmediata (Deudores) */}
      <DashboardActionTable />

    </div>
  );
};

export default DashboardPages;