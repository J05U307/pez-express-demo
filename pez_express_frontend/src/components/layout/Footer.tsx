export default function Footer() {
  return (
    <footer className="bg-dark text-white">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">

        {/* Marca */}
        <div>
          <h2 className="text-xl font-bold text-primary">
            Pez-Express Cevichería
          </h2>
          <p className="mt-3 text-sm text-gray-300">
            El sabor fresco del mar, directo a tu mesa.
            Somos una de las mejores cevicherías en Cajamarca,
            especializados en comida marina fresca y de calidad.
          </p>
        </div>

        {/* Enlaces */}
        <div>
          <h3 className="font-semibold mb-3">Enlaces</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><a href="#nosotros" className="hover:text-primary">Nosotros</a></li>
            <li><a href="#carta" className="hover:text-primary">Nuestros Carta</a></li>
            <li><a href="#ubicacion" className="hover:text-primary">Ubicación</a></li>
            <li><a href="#contacto" className="hover:text-primary">Contacto</a></li>
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h3 className="font-semibold mb-3">Ubicación</h3>
          <p className="text-sm text-gray-300">
            Av. Héroes del Cenepa #1275
          </p>
          <p className="text-sm text-gray-300">
            Cajamarca, Perú
          </p>
          <p className="text-sm text-gray-300 mt-2">
            Tel: +51 900 000 000
          </p>
        </div>
      </div>

      <div className="text-center py-6 border-t border-gray-700 text-sm text-gray-400">
        © {new Date().getFullYear()} Pez-Express Cevichería - Todos los derechos reservados.
      </div>
    </footer>
  );
}