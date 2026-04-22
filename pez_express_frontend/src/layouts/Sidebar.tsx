import {NavLink, useLocation} from "react-router-dom";
import {
    Home, Package, Users, Settings,
    ChevronDown, ChevronRight, Sliders, X,
    ShoppingBasket, ChefHat, UserCircle, CreditCard,
    BarChart, ShoppingBag, BookOpen, LayoutGrid
} from "lucide-react";
import {useEffect, useState} from "react";
import LogoPescado from "../assets/pescado.webp";
import {useAuth} from "../context/AuthContext";
// Imports para instalar
import { usePWAInstall } from "../hooks/usePWAInstall";
import { Download, CheckCircle } from "lucide-react";


type Rol = "ADMINISTRADOR" | "MESERO" | "COCINERO";

const navItems = [
    {
        name: "Dashboard",
        path: "/dashboard",
        icon: <Home size={18}/>,
        end: true,
        roles: ["ADMINISTRADOR", "MESERO", "COCINERO"] as Rol[]
    },
    {
        name: "Pedidos",
        path: "/dashboard/pedidos",
        icon: <ShoppingBag size={18}/>,
        roles: ["ADMINISTRADOR", "MESERO"] as Rol[]
    },
    {
        name: "Pagos",
        path: "/dashboard/pagos",
        icon: <CreditCard size={18}/>,
        roles: ["ADMINISTRADOR", "MESERO"] as Rol[]
    },
    {
        name: "Cocina",
        path: "/dashboard/cocina",
        icon: <ChefHat size={18}/>,
        roles: ["ADMINISTRADOR", "COCINERO"] as Rol[]
    },
    {name: "Reportes", path: "/dashboard/reportes", icon: <BarChart size={18}/>, roles: ["ADMINISTRADOR"] as Rol[]},
    {name: "Recetas", path: "/dashboard/recetas", icon: <BookOpen size={18}/>, roles: ["ADMINISTRADOR"] as Rol[]},
    {name: "Productos", path: "/dashboard/productos", icon: <Package size={18}/>, roles: ["ADMINISTRADOR"] as Rol[]},
    {name: "Insumos", path: "/dashboard/insumos", icon: <ShoppingBasket size={18}/>, roles: ["ADMINISTRADOR"] as Rol[]},
    {name: "Usuarios", path: "/dashboard/usuarios", icon: <Users size={18}/>, roles: ["ADMINISTRADOR"] as Rol[]},
];

const configItems = [
    {
        name: "Perfil",
        path: "/dashboard/configuracion/perfil",
        icon: <UserCircle size={16}/>,
        roles: ["ADMINISTRADOR", "MESERO", "COCINERO"] as Rol[]
    },
    {
        name: "General",
        path: "/dashboard/configuracion/general",
        icon: <Sliders size={16}/>,
        roles: ["ADMINISTRADOR"] as Rol[]
    },
    {
        name: "Gestionar Mesas",
        path: "/dashboard/configuracion/mesas",
        icon: <LayoutGrid size={16}/>,
        roles: ["ADMINISTRADOR"] as Rol[]
    },
];

interface SidebarProps {
    mobileOpen: boolean;
    setMobileOpen: (v: boolean) => void;
}

export default function Sidebar({mobileOpen, setMobileOpen}: SidebarProps) {
    const [configOpen, setConfigOpen] = useState(false);
    const {usuario} = useAuth();
    const rol = usuario?.rol as Rol | null ?? null;
    const location = useLocation();
    const { canInstall, install, installed } = usePWAInstall();

    useEffect(() => {
        if (location.pathname.includes("/dashboard/configuracion")) setConfigOpen(true);
    }, [location.pathname]);

    const visibleNav = rol ? navItems.filter((i) => i.roles.includes(rol)) : [];
    const visibleConfig = rol ? configItems.filter((i) => i.roles.includes(rol)) : [];

    return (
        <>
            {/* Overlay oscuro en móvil */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside
                className={`
          flex flex-col h-screen w-64 bg-[#0B1C2D] text-white shadow-xl
          fixed top-0 left-0 z-50
          transform transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:relative md:z-auto
        `}
            >
                {/* Logo / Header del sidebar */}
                <div className="flex items-center justify-between p-6 border-b border-cyan-500/30">
                    <div className="flex items-center gap-3">
                        <img
                            src={LogoPescado}
                            alt="Logo Pez Express"
                            className="w-11 h-11 object-contain rounded-full border border-cyan-400/40"
                        />
                        <div className="leading-tight">
                            <h2 className="text-cyan-300 font-semibold text-sm">Pez Express</h2>
                            <p className="text-xs text-gray-400">Cevichería</p>
                        </div>
                    </div>
                    {/* Botón cerrar sidebar en móvil */}
                    <button
                        aria-label="Cerrar sidebar"
                        className="md:hidden text-cyan-300 hover:text-cyan-100 transition-colors"
                        onClick={() => setMobileOpen(false)}
                    >
                        <X size={20}/>
                    </button>
                </div>

                {/* Navegación */}
                <nav className="flex-1 flex flex-col mt-6 px-3 overflow-y-auto">
                    {/* Skeleton mientras carga el rol */}
                    {!rol && (
                        <div className="space-y-2 px-1">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-10 bg-cyan-500/10 rounded-xl animate-pulse"/>
                            ))}
                        </div>
                    )}

                    {visibleNav.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            onClick={() => setMobileOpen(false)}
                            className={({isActive}) =>
                                `flex items-center gap-3 px-4 py-3 mb-2 rounded-xl transition-all duration-200 text-sm ${
                                    isActive
                                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-md"
                                        : "text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-300"
                                }`
                            }
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </NavLink>
                    ))}

                    {/* Configuración colapsable */}
                    {rol && (
                        <div className="mt-4">
                            <button
                                onClick={() => setConfigOpen(!configOpen)}
                                className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-300 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <Settings size={18}/>
                                    <span>Configuración</span>
                                </div>
                                {configOpen ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-300 ${configOpen ? "max-h-60 mt-2" : "max-h-0"}`}>
                                <div className="ml-6 flex flex-col">
                                    {visibleConfig.map((item) => (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setMobileOpen(false)}
                                            className={({isActive}) =>
                                                `flex items-center gap-2 py-2 px-3 rounded-lg text-sm transition-all ${
                                                    isActive
                                                        ? "bg-cyan-500/20 text-cyan-300"
                                                        : "text-gray-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                                                }`
                                            }
                                        >
                                            {item.icon}
                                            <span>{item.name}</span>
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </nav>

                <div className="p-4 border-t border-cyan-500/20 space-y-3">
                    {/* Botón instalar PWA */}
                    {canInstall && (
                        <button
                            onClick={install}
                            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl
                 bg-cyan-500/20 border border-cyan-400/40 text-cyan-300
                 hover:bg-cyan-500/30 transition-all text-sm font-medium"
                        >
                            <Download size={16} />
                            <span>Instalar app</span>
                        </button>
                    )}

                    {installed && (
                        <div className="flex items-center gap-2 px-4 py-2 text-xs text-emerald-400">
                            <CheckCircle size={14} />
                            <span>App instalada</span>
                        </div>
                    )}

                    <p className="text-xs text-gray-400 text-center">© 2026 Pez Express</p>
                </div>

            </aside>
        </>
    );
}