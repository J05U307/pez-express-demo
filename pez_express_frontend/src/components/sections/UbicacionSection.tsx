export default function UbicacionSection() {
  return (
    <section
      id="ubicacion"
      className="relative overflow-hidden text-dark"
      style={{
        background: "linear-gradient(180deg, #e6f7fb 0%, #cdeaf5 100%)",
      }}
    >
      {/* 🌊 ONDA SUPERIOR (mismo color que termina PlatosSection) */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180">
        <svg
          viewBox="0 0 1440 320"
          className="w-full h-28 md:h-40"
          preserveAspectRatio="none"
        >
          <path
            fill="#e6f7fb"
            d="M0,160L80,170.7C160,181,320,203,480,197.3C640,192,800,160,960,154.7C1120,149,1280,171,1360,181.3L1440,192L1440,320L0,320Z"
          />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-36 z-10">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold">
            Visítanos en Cajamarca
          </h2>

          <div className="mt-4 w-28 h-1 bg-primary mx-auto rounded-full"></div>

          <p className="mt-6 text-dark/70 max-w-2xl mx-auto">
            Disfruta del auténtico sabor del mar peruano en un ambiente acogedor y familiar.
          </p>
        </div>

        <div className="mt-20 grid lg:grid-cols-2 gap-16 items-center">
          <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-3xl p-10">
            <h3 className="text-2xl font-bold text-primary">
              Pez-Express Cevichería
            </h3>

            <p className="mt-6 text-dark">
              📍 Av. Ejemplo #1275 <br />
              Cajamarca, Perú
            </p>

            <p className="mt-4 text-dark">
              🕒 10:00 AM – 4:00 PM
            </p>

            <p className="mt-4 text-dark">
              📞 +51 999 888 777
            </p>

            <button className="mt-8 bg-primary hover:bg-secondary transition text-white px-6 py-3 rounded-full shadow-lg">
              Cómo llegar
            </button>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-2xl">
            <iframe
              title="Mapa Pez-Express Cajamarca"
              src="https://www.google.com/maps/embed?pb=..."
              width="100%"
              height="450"
              loading="lazy"
              className="border-0"
            ></iframe>
          </div>
        </div>
      </div>

      {/* 🌊 ONDA INFERIOR (para conectar con la siguiente sección) */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg
          viewBox="0 0 1440 320"
          className="w-full h-28 md:h-40"
          preserveAspectRatio="none"
        >
          <path
            fill="#f2fbfd"
            d="M0,160L80,170.7C160,181,320,203,480,197.3C640,192,800,160,960,154.7C1120,149,1280,171,1360,181.3L1440,192L1440,320L0,320Z"
          />
        </svg>
      </div>
    </section>
  );
}