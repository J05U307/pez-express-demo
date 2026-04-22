import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMe } from "../../services/authService";
import  LogoSmall from "../../../public/logo-small.webp"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();

  const navLinks = [
    { name: "Nosotros", to: "/nosotros" },
    { name: "Carta", to: "/carta" },
    { name: "Ubicación", to: "/ubicacion" },
    { name: "Contacto", to: "/contacto" },
  ];

  // ✅ LOGIN INTELIGENTE
  const handleLoginClick = async () => {
    try {
      await getMe();

      // ya tiene sesión
      navigate("/dashboard");

    } catch (error) {

      // no autenticado
      navigate("/login");
    }
  };

  const handleNavClick = (to: string) => {
    setIsOpen(false);
    navigate(to);
  };

  return (
    <header className="fixed w-full z-50 bg-gradient-to-r from-primary via-accent to-secondary shadow-lg">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* LOGO */}
        <Link
          to="/"
          className="flex items-center gap-3 text-white"
          onClick={() => {
            setIsOpen(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <img
            src={LogoSmall}
            alt="Pez-Express Cevichería"
            className="h-12 w-auto object-contain"
          />
        </Link>

        {/* DESKTOP MENU */}
        <ul className="hidden md:flex gap-10 text-white font-medium items-center">
          {navLinks.map((link) => (
            <li key={link.name}>
              <button
                onClick={() => handleNavClick(link.to)}
                className="hover:opacity-80 transition"
              >
                {link.name}
              </button>
            </li>
          ))}

          {/* ⭐ BOTÓN INTELIGENTE */}
          <li>
            <button
              onClick={handleLoginClick}
              className="bg-white text-primary px-5 py-2 rounded-full font-semibold hover:bg-soft transition"
            >
              Ingresar
            </button>
          </li>
        </ul>

        {/* MOBILE BUTTON */}
        <button
          className="md:hidden text-white text-3xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div
        className={`md:hidden bg-white shadow-xl overflow-hidden transition-all duration-500 ${
          isOpen ? "max-h-96 py-6" : "max-h-0"
        }`}
      >
        <div className="flex flex-col items-center gap-6 text-primary font-semibold text-lg">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavClick(link.to)}
              className="hover:text-accent transition"
            >
              {link.name}
            </button>
          ))}

          {/* ⭐ MOBILE LOGIN INTELIGENTE */}
          <button
            onClick={handleLoginClick}
            className="bg-primary text-white px-6 py-3 rounded-full hover:bg-secondary transition"
          >
            Ingresar
          </button>
        </div>
      </div>
    </header>
  );
}