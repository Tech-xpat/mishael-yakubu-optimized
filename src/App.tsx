import Nav from "./components/Nav";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Career from "./sections/Career";
import Gallery from "./sections/Gallery";
import Portfolio from "./sections/Portfolio";
import Empire from "./sections/Empire";
import Expertise from "./sections/Expertise";
import Strip from "./sections/Strip";
import Vision from "./sections/Vision";
import Contact from "./sections/Contact";
import Footer from "./sections/Footer";
import ChatBot from "./components/ChatBot";

export default function App() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Nav />
      <Hero />
      <About />
      <Career />
      <Gallery />
      <Portfolio />
      <Empire />
      <Expertise />
      <Strip />
      <Vision />
      <Contact />
      <Footer />
      <ChatBot />
    </div>
  );
}
