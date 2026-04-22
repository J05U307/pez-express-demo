import Navbar from "./Navbar";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="bg-soft min-h-screen flex flex-col">
      <Navbar />

      <main className=" flex-grow">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}