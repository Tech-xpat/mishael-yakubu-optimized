import { useEffect, useState } from "react";
import Nav from "./components/Nav";
import Hero from "./sections/Hero";
import Portfolio from "./sections/Portfolio";
import Expertise from "./sections/Expertise";
import Contact from "./sections/Contact";
import Footer from "./sections/Footer";
import ChatBot from "./components/ChatBot";
import AboutPage from "./pages/AboutPage";
import Admin from "./pages/Admin";

export default function App() {
  const [page, setPage] = useState(window.location.hash || "#/");

  useEffect(() => {
    const onHash = () => setPage(window.location.hash || "#/");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (page === "#/about") return <AboutPage />;
  if (page === "#/admin") return <Admin />;

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      <Nav />
      <Hero />
      <div className="relative z-20 bg-white">
        <Portfolio />
        <Expertise />
        <Contact />
        <Footer />
      </div>
      <ChatBot />
    </div>
  );
}
