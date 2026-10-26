import { useEffect, useState } from "react";
import Navbar from "./sections/Navbar";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Portfolio from "./sections/Portfolio";
import WebDevelopment from "./sections/WebDevelopment";
import BrandDesign from "./sections/BrandDesign";
import AIAutomation from "./sections/AIAutomation";
import Services from "./sections/Services";
import Contact from "./sections/Contact";
import Footer from "./sections/Footer";
import Admin from "./pages/Admin";
import ChatBot from "./components/ChatBot";

export default function App() {
  const [page, setPage] = useState(window.location.hash || "#/");

  useEffect(() => {
    const onHash = () => setPage(window.location.hash || "#/");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (page === "#/admin") return <Admin />;

  return (
    <div className="relative bg-black min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Portfolio />
        <WebDevelopment />
        <BrandDesign />
        <AIAutomation />
        <Services />
        <Contact />
        <Footer />
      </main>
      <ChatBot />
    </div>
  );
}
