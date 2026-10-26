import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("web-development");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");

  const login = () => {
    if (password === "empire2026") setAuthed(true);
    else setStatus("Incorrect password");
  };

  const upload = async () => {
    if (!file || !title) return setStatus("Title and image required");
    setStatus("Uploading...");

    const path = `portfolio/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const { error: upErr } = await supabase.storage.from("portfolio").upload(path, file, { upsert: true });
    if (upErr) return setStatus(upErr.message);

    const { data: urlData } = supabase.storage.from("portfolio").getPublicUrl(path);

    const { error: dbErr } = await supabase.from("portfolio_items").insert({
      title,
      description,
      image_url: urlData.publicUrl,
    });
    if (dbErr) return setStatus(dbErr.message);

    setStatus("Uploaded. It will appear in the flip-card portfolio.");
    setTitle("");
    setDescription("");
    setFile(null);
  };

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
        <div className="w-full max-w-sm space-y-4 p-6">
          <h1 className="text-2xl font-serif">Admin Access</h1>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded" />
          <button onClick={login} className="w-full py-3 bg-white text-black font-medium rounded">Enter</button>
          {status && <p className="text-sm text-red-400">{status}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl shadow">
        <h1 className="text-2xl font-serif mb-6">Upload Portfolio Item</h1>
        <div className="space-y-4">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title (e.g. Brand Website or Flyer)" className="w-full px-4 py-3 border rounded" />
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description" className="w-full px-4 py-3 border rounded" rows={3} />
          <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 border rounded">
            <option value="web-development">Website</option>
            <option value="graphic-design">Flyer / Graphic</option>
            <option value="ai-automation">AI Project</option>
            <option value="video-photo">Video / Photo</option>
          </select>
          <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
          <button onClick={upload} className="w-full py-3 bg-black text-white rounded font-medium">Upload</button>
          {status && <p className="text-sm text-center">{status}</p>}
        </div>
      </div>
    </div>
  );
}
