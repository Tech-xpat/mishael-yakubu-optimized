import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'sonner';

interface ImageUploadProps {
  onUploadComplete: (url: string, fileName: string) => void;
  folder: string;
  maxSize?: number; // in MB, default 5
}

const ImageUpload = ({ onUploadComplete, folder, maxSize = 5 }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_SIZE_BYTES = maxSize * 1024 * 1024;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only JPG, PNG, and WebP files are allowed');
      return;
    }

    // Validate file size
    if (file.size > MAX_SIZE_BYTES) {
      toast.error(`File size must be less than ${maxSize}MB`);
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const fileName = `${Date.now()}-${selectedFile.name}`;
      const storageRef = ref(storage, `${folder}/${fileName}`);

      // Upload to Firebase Storage
      await uploadBytes(storageRef, selectedFile);
      const downloadURL = await getDownloadURL(storageRef);

      onUploadComplete(downloadURL, selectedFile.name);
      setSelectedFile(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {!preview ? (
        <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/40 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex flex-col items-center gap-3 mx-auto"
          >
            <Upload size={32} className="text-white/50" />
            <div className="text-sm text-white/70">
              <p className="font-semibold">Click to upload or drag and drop</p>
              <p className="text-xs text-white/50">JPG, PNG or WebP (max {maxSize}MB)</p>
            </div>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-lg bg-white/5 border border-white/10">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-white/90 disabled:opacity-50 transition-all font-medium"
            >
              {uploading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Upload
                </>
              )}
            </button>
            <button
              onClick={handleClear}
              disabled={uploading}
              className="px-4 py-2 border border-white/20 rounded-lg hover:border-white/40 transition-colors disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
