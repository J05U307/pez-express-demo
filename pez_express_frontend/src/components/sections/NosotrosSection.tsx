import { motion } from "framer-motion";
import LogoPescadoSmall from "../../assets/pescado-small.webp";



export default function NosotrosSection() {
  return (
    <section
      id="nosotros"
      className="relative py-28 px-6 bg-soft overflow-hidden"
      itemScope
      itemType="https://schema.org/Restaurant"
    >
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">

        {/* TEXTO */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9 }}
          viewport={{ once: true }}
        >
          {/* Logo — ratio 591x422 ≈ 1.4:1, así que w-20 h-14 lo respeta */}
          <div className="flex items-center gap-3 mb-6">
            <img
              src={LogoPescadoSmall}
              alt="Logo Pez Express"
              className="w-20 h-14 object-contain"
            />
            <span className="text-accent font-semibold tracking-widest uppercase text-sm">
              Cevichería Pez Express
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-dark leading-snug">
            Pasión por el mar, tradición peruana
          </h2>

          <div className="mt-4 w-20 h-1 bg-primary rounded-full" />

          <p
            className="mt-8 text-dark/90 leading-relaxed text-lg"
            itemProp="description"
          >
            En <strong>Pez-Express</strong> seleccionamos pescado fresco
            diariamente para garantizar el auténtico sabor del ceviche peruano.
            Nuestra misión es traer lo mejor del mar a Cajamarca,
            combinando tradición, frescura y dedicación en cada plato.
          </p>

          <div className="mt-8 bg-white p-6 rounded-2xl shadow-md border border-primary/10">
            <p className="text-primary font-semibold">✔ Ingredientes frescos cada día</p>
            <p className="text-primary font-semibold mt-2">✔ Recetas tradicionales peruanas</p>
            <p className="text-primary font-semibold mt-2">✔ Calidad y sabor garantizados</p>
          </div>
        </motion.div>

        {/* IMAGEN */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="absolute -bottom-6 -right-6 w-full h-full bg-primary/20 rounded-3xl" />

          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="/local.jpeg"
              alt="Interior del restaurante Pez-Express en Cajamarca"
              className="w-full h-full object-cover hover:scale-105 transition duration-700"
              loading="lazy"
            />

            {/* Badge con logo sobre la imagen */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2.5 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-2xl shadow-md">
              <img
                src={LogoPescadoSmall}
                alt="Pez Express"
                className="w-12 h-8 object-contain"
              />
              <div>
                <p className="text-xs font-black text-gray-800 leading-none">Pez Express</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Cajamarca, Perú</p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}