import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center text-center overflow-hidden"
      aria-label="Presentación principal Pez-Express"
    >
      {/* 🌊 Imagen de fondo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/hero.webp')",
        }}
      />

      {/* 🎨 Overlay degradado marino */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark/80 via-dark/60 to-dark/90" />

      {/* 🌊 Contenido */}
      <div className="relative z-10 px-6 max-w-4xl text-white">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-bold leading-tight"
        >
          El auténtico sabor del mar en cada ceviche
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-6 text-lg md:text-xl text-gray-200"
        >
          Frescura, tradición y pasión marina en Cajamarca.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a
            href="#carta"
            className="bg-primary text-white px-8 py-3 rounded-full hover:bg-secondary transition font-medium shadow-lg"
          >
            Ver Carta
          </a>

          <a
            href="#ubicacion"
            className="border border-white text-white px-8 py-3 rounded-full hover:bg-white hover:text-dark transition font-medium"
          >
            Cómo Llegar
          </a>
        </motion.div>
      </div>

      {/* 🌊 ONDA INFERIOR */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg
          viewBox="0 0 1440 320"
          className="w-full h-28 md:h-40"
          preserveAspectRatio="none"
        >
          <path
            fill="#F2F2F2"
            d="M0,160L80,170.7C160,181,320,203,480,197.3C640,192,800,160,960,154.7C1120,149,1280,171,1360,181.3L1440,192L1440,320L0,320Z"
          ></path>
        </svg>
      </div>
    </section>
  );
}