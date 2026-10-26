import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Admin() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState('')

  const login = () => {
    if (password === 'empire2026') setAuthed(true)
    else setStatus('Wrong password')
  }

  const upload = async () => {
    if (!file || !title) return setStatus('Title and image required')
    setStatus('Uploading...')
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}-${title.replace(/\s+/g, '-').toLowerCase()}.${ext}`
    const { error: upErr } = await supabase.storage.from('portfolio').upload(path, file)
    if (upErr) return setStatus(upErr.message)
    const { data: urlData } = supabase.storage.from('portfolio').getPublicUrl(path)
    const { error: dbErr } = await supabase.from('portfolio_items').insert({
      title,
      image_url: urlData.publicUrl,
      category_id: category || null
    })
    if (dbErr) return setStatus(dbErr.message)
    setStatus('Uploaded successfully')
    setTitle('')
    setFile(null)
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] text-white">
        <div className="w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-serif">Admin Login</h1>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-3 bg-white/10 border border-white/20" />
          <button onClick={login} className="w-full py-3 bg-lime text-black font-medium">Enter</button>
          {status && <p className="text-sm text-red-400">{status}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-serif mb-6">Portfolio Admin</h1>
      <div className="max-w-md space-y-4">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" className="w-full px-4 py-3 border" />
        <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Category ID (optional)" className="w-full px-4 py-3 border" />
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
        <button onClick={upload} className="px-6 py-3 bg-black text-white">Upload</button>
        {status && <p className="text-sm">{status}</p>}
      </div>
    </div>
  )
}
