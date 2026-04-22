// src/pages/public/Home.tsx
import { useEffect } from "react";
import ContactoSection from "../../components/sections/ContactoSection";
import HeroSection from "../../components/sections/HeroSection";
import NosotrosSection from "../../components/sections/NosotrosSection";
import PlatosSection from "../../components/sections/PlatosSection";
import UbicacionSection from "../../components/sections/UbicacionSection";

// Tipamos la prop scrollTo
type HomeProps = {
  scrollTo?: string;
};

export default function Home({ scrollTo }: HomeProps) {
  useEffect(() => {
    if (scrollTo) {
      const el = document.getElementById(scrollTo);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [scrollTo]);

  return (
    <>
      <HeroSection />
      <NosotrosSection /> 
      <PlatosSection />   
      <UbicacionSection />
      <ContactoSection /> 
    </>
  );
}