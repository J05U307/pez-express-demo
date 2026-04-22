import { motion } from "framer-motion";

export default function ContactoSection() {
  return (
    <section
      id="contacto"
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #f2fbfd 0%, #ffffff 100%)",
      }}
    >
      <div className="max-w-5xl mx-auto px-6 py-32">
        {/* Título */}
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-primary">
            Reserva o Contáctanos
          </h2>

          <div className="mt-4 w-28 h-1 bg-primary mx-auto rounded-full"></div>

          <p className="mt-6 text-dark/70 max-w-2xl mx-auto">
            ¿Quieres reservar una mesa o hacer un pedido especial?
            Escríbenos y te responderemos lo antes posible.
          </p>
        </div>

        {/* Formulario */}
        <motion.form
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-20 bg-white shadow-2xl rounded-3xl p-10 md:p-14 space-y-8"
        >
          <div className="grid md:grid-cols-2 gap-8">
            <input
              type="text"
              placeholder="Nombre"
              className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
            />

            <input
              type="tel"
              placeholder="Celular"
              className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
            />
          </div>

          <textarea
            placeholder="Mensaje"
            rows={5}
            className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
          ></textarea>

          <button
            type="submit"
            className="w-full md:w-auto bg-primary text-white px-10 py-4 rounded-xl hover:bg-secondary transition font-semibold shadow-lg"
          >
            Enviar Mensaje
          </button>
        </motion.form>
      </div>
      
    </section>
  );
}