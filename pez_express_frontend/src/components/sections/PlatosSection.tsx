import { useState } from "react";

// Carga todas las imágenes de la carpeta platos de una sola vez
const imagenesImportadas = import.meta.glob(
    "/src/assets/platos/*.webp",
    { eager: true, import: "default" }
) as Record<string, string>;

function img(nombre: string): string {
  return imagenesImportadas[`/src/assets/platos/${nombre}`] ?? "";
}

// Iconos SVG minimalistas por categoría
const CategoryIcon = ({ categoria }: { categoria: string }) => {
  const iconProps = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (categoria) {
    case "Ceviches":
      return (
          <svg {...iconProps}>
            {/* Pescado simplificado */}
            <path d="M2 12c0 0 4-6 10-6s10 6 10 6-4 6-10 6S2 12 2 12z" />
            <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
            <path d="M22 12l-3-3M22 12l-3 3" />
          </svg>
      );
    case "Sudados y Parihuelas":
      return (
          <svg {...iconProps}>
            <path d="M6 19V8a6 6 0 0 1 12 0v11" />
            <path d="M4 19h16" />
            <path d="M9 8c0 1.5 3 3 3 3s3-1.5 3-3" />
            <path d="M12 5V3" />
          </svg>
      );
    case "Chupes":
      return (
          <svg {...iconProps}>
            <path d="M4 11h16" />
            <path d="M6 11V7a6 6 0 0 1 12 0v4" />
            <path d="M5 19h14a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1z" />
          </svg>
      );
    case "Arroces":
      return (
          <svg {...iconProps}>
            <ellipse cx="12" cy="17" rx="8" ry="3" />
            <path d="M4 17V9a8 8 0 0 1 16 0v8" />
            <path d="M9 9c0 1.5 1.5 3 3 3s3-1.5 3-3" />
          </svg>
      );
    case "Chicharrones":
      return (
          <svg {...iconProps}>
            <rect x="3" y="12" width="18" height="8" rx="2" />
            <path d="M6 12V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" />
            <path d="M10 4V3M14 4V3" />
          </svg>
      );
    case "Picantes":
      return (
          <svg {...iconProps}>
            <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
            <path d="M12 2v4M9 5l3-3 3 3" />
          </svg>
      );
    case "Dúos y Tríos":
      return (
          <svg {...iconProps}>
            <circle cx="9" cy="12" r="5" />
            <circle cx="15" cy="12" r="5" />
          </svg>
      );
    default:
      return (
          <svg {...iconProps}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4l3 3" />
          </svg>
      );
  }
};

const menu = [
  {
    categoria: "Ceviches",
    platos: [
      { nombre: "Leche de Tigre Simple",      precio: "S/.5.00",  imagen: img("lecheTigre.webp") },
      { nombre: "Maruchitas",                  precio: "S/.10.00", imagen: img("maruchitas.webp") },
      { nombre: "Ceviche de Pota",             precio: "S/.10.00", imagen: img("cevichedepota.webp") },
      { nombre: "Pescado + Maruchitas",        precio: "S/.12.00", imagen: img("pescadomasmaruchitas.webp") },
      { nombre: "Caballa con Maruchitas",      precio: "S/.15.00", imagen: img("cevichedecaballaconmaruchitas.webp") },
      { nombre: "Ceviche de Caballa",          precio: "S/.15.00", imagen: img("cevichedecaballa.webp") },
      { nombre: "Ceviche Simple (Tollo)",      precio: "S/.15.00", imagen: img("cevichesimple.webp") },
      { nombre: "Ceviche de Trucha",           precio: "S/.15.00", imagen: img("cevichedetrucha.webp") },
      { nombre: "Ceviche de Cangrejo",         precio: "S/.20.00", imagen: img("cevichedecangrejo.webp") },
      { nombre: "Pescado + Langostino",        precio: "S/.20.00", imagen: img("cevichedepescadomaslangostino.webp") },
      { nombre: "Ceviche Mixto",               precio: "S/.25.00", imagen: img("cevichemixto.webp") },
    ],
  },
  {
    categoria: "Sudados y Parihuelas",
    platos: [
      { nombre: "Sudado de Cabrilla",                    precio: "S/.17.00", imagen: img("sudadodecabrilla.webp") },
      { nombre: "Sudado de Cabrilla con Cangrejo",       precio: "S/.20.00", imagen: img("sudadodecabrillamascangrejo.webp") },
      { nombre: "Parihuela de Cabrilla",                 precio: "S/.25.00", imagen: img("parihueladecabrilla.webp") },
    ],
  },
  {
    categoria: "Chupes",
    platos: [
      { nombre: "Chupe de Pescado (Filete)", precio: "S/.20.00", imagen: img("chupedepescado.webp") },
      { nombre: "Chupe de Cangrejo",         precio: "S/.25.00", imagen: img("chupedecangrejo.webp") },
      { nombre: "Chupe Mixto",               precio: "S/.30.00", imagen: img("chupemixto.webp") },
    ],
  },
  {
    categoria: "Arroces",
    platos: [
      { nombre: "Arroz con Mariscos",              precio: "S/.20.00", imagen: img("arrozconmariscos.webp") },
      { nombre: "Arroz con Langostinos",           precio: "S/.22.00", imagen: img("arrozconlangostinos.webp") },
      { nombre: "Arroz Chaufa de Mariscos",        precio: "S/.20.00", imagen: img("arrozchaufademariscos.webp") },
      { nombre: "Arroz Chaufa de Langostinos",     precio: "S/.22.00", imagen: img("arrozchaufadelangostinos.webp") },
    ],
  },
  {
    categoria: "Chicharrones",
    platos: [
      { nombre: "Chicharrón de Pota",       precio: "S/.15.00", imagen: img("chicharrondepota.webp") },
      { nombre: "Chicharrón de Pescado",    precio: "S/.20.00", imagen: img("chicharrondepescado.webp") },
      { nombre: "Jalea Mixta",              precio: "S/.35.00", imagen: img("jaleamixta.webp") },
      { nombre: "Chicharrón de Langostino", precio: "S/.25.00", imagen: img("chicharrondelangostinos.webp") },
      { nombre: "Cabrilla Frita",           precio: "S/.17.00", imagen: img("cabrillafrita.webp") },
      { nombre: "Trucha Frita",             precio: "S/.17.00", imagen: img("truchafrita.webp") },
    ],
  },
  {
    categoria: "Picantes",
    platos: [
      { nombre: "Picante de Mariscos",  precio: "S/.25.00", imagen: img("picantedemariscos.webp") },
      { nombre: "Picante de Cangrejo",  precio: "S/.25.00", imagen: img("picantedecangrejo.webp") },
      { nombre: "Cabrilla a lo Macho",  precio: "S/.35.00", imagen: img("cabrillaalomacho.webp") },
    ],
  },
  {
    categoria: "Dúos y Tríos",
    platos: [
      { nombre: "Ceviche + Chicharrón de Pota",        precio: "S/.20.00", imagen: img("cevichemaschicharrondepota.webp") },
      { nombre: "Arroz con Mariscos + Ceviche",        precio: "S/.20.00", imagen: img("arrozconmariscosmasceviche.webp") },
      { nombre: "Arroz Chaufa + Ceviche",              precio: "S/.20.00", imagen: img("arrozchaufamasceviche.webp") },
      { nombre: "Arroz c/M. + Ceviche + Chicharrón",  precio: "S/.30.00", imagen: img("arrozconmariscosmasvechicemaschicharron.webp") },
      { nombre: "Arroz Chaufa + Ceviche + Chicharrón", precio: "S/.30.00", imagen: img("arrozchaufamascevichemaschicharron.webp") },
    ],
  },
];

export default function PlatosSection() {
  const [activeTab, setActiveTab] = useState(0);

  return (
      <section id="carta" className="relative bg-white">

        {/* Onda superior */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-none pointer-events-none">
          <svg viewBox="0 0 1440 80" className="w-full h-12 md:h-20" preserveAspectRatio="none">
            <path
                fill="#F2F2F2"
                d="M0,0L80,10C160,20,320,40,480,40C640,40,800,20,960,13C1120,7,1280,13,1360,16L1440,20L1440,0L0,0Z"
            />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-6 pt-24 pb-32">

          {/* Header */}
          <div className="text-center mb-12">
          <span className="inline-block text-[11px] font-semibold tracking-[0.25em] uppercase text-cyan-500 mb-4">
            Nuestra Carta
          </span>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight tracking-tight">
              Sabores del Mar Peruano
            </h2>
            <p className="mt-3 text-gray-400 text-sm md:text-base max-w-md mx-auto leading-relaxed">
              Preparaciones frescas, auténticas y llenas de tradición.
            </p>
            {/* Línea decorativa */}
            <div className="mt-6 flex items-center justify-center gap-3">
              <span className="h-px w-12 bg-gray-200" />
              <span className="h-1 w-1 rounded-full bg-cyan-400" />
              <span className="h-px w-12 bg-gray-200" />
            </div>
          </div>

          {/* Tabs — sin emojis, con icono SVG */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-10 scrollbar-hide">
            {menu.map((cat, i) => (
                <button
                    key={i}
                    onClick={() => setActiveTab(i)}
                    className={`
                flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-semibold
                transition-all duration-200 whitespace-nowrap border
                ${activeTab === i
                        ? "bg-cyan-500 text-white border-cyan-500 shadow-md shadow-cyan-100"
                        : "bg-white text-gray-500 border-gray-200 hover:border-cyan-300 hover:text-cyan-600 hover:bg-cyan-50"
                    }
              `}
                >
              <span className={activeTab === i ? "text-white" : "text-gray-400"}>
                <CategoryIcon categoria={cat.categoria} />
              </span>
                  {cat.categoria}
                </button>
            ))}
          </div>

          {/* Contador de categoría */}
          <div className="flex items-center gap-2 mb-6">
            <h3 className="text-base font-bold text-gray-800">{menu[activeTab].categoria}</h3>
            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {menu[activeTab].platos.length} platos
          </span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {menu[activeTab].platos.map((plato, i) => (
                <article
                    key={`${activeTab}-${i}`}
                    className="group rounded-xl overflow-hidden bg-white border border-gray-100 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-50/60 transition-all duration-250 cursor-default"
                >
                  {/* Imagen */}
                  <div className="relative h-40 sm:h-44 overflow-hidden bg-gray-100">
                    <img
                        src={plato.imagen}
                        alt={plato.nombre}
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-400 ease-out"
                        loading="lazy"
                    />
                    {/* Gradiente sutil sobre la imagen */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-250" />

                    {/* Badge de precio */}
                    <div className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-sm text-cyan-700 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm border border-cyan-100">
                      {plato.precio}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="px-3.5 py-3">
                    <h3 className="text-gray-800 font-semibold text-[13px] leading-snug line-clamp-2 tracking-[-0.01em]">
                      {plato.nombre}
                    </h3>
                  </div>
                </article>
            ))}
          </div>
        </div>

        {/* Onda inferior */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none pointer-events-none">
          <svg viewBox="0 0 1440 320" className="w-full h-28 md:h-40" preserveAspectRatio="none">
            <path
                fill="#e6f7fb"
                d="M0,160L80,170.7C160,181,320,203,480,197.3C640,192,800,160,960,154.7C1120,149,1280,171,1360,181.3L1440,192L1440,320L0,320Z"
            />
          </svg>
        </div>

      </section>
  );
}