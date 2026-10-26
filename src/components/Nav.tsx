export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#/" className="font-serif text-lg tracking-tight">Empire Digitals</a>
        <div className="flex items-center gap-6 text-sm">
          <a href="#portfolio" className="text-gray-600 hover:text-black">Work</a>
          <a href="#contact" className="text-gray-600 hover:text-black">Contact</a>
          <a href="#/about" className="text-gray-400 hover:text-black text-xs">About</a>
        </div>
      </div>
    </nav>
  );
}
