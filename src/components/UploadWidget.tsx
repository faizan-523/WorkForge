'use client';

import { useState } from 'react';
import { uploadFile } from '@/lib/actions/upload';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';

interface UploadWidgetProps {
  onUploadSuccess: (url: string) => void;
  label?: string;
  folder?: string;
  accept?: string;
}

export default function UploadWidget({
  onUploadSuccess,
  label = 'Upload Image / Asset',
  folder = 'workforge',
  accept = 'image/*',
}: UploadWidgetProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError('');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const res = await uploadFile(base64, file.name, folder);
        if (res.success && res.url) {
          setUploadedUrl(res.url);
          onUploadSuccess(res.url);
        } else {
          setError(res.error || 'Upload failed.');
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || 'File read error');
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-300 block">{label}</label>

      <div className="relative border-2 border-dashed border-slate-700/80 hover:border-indigo-500/50 rounded-2xl p-6 text-center transition-all bg-slate-900/40 hover:bg-slate-900/60 cursor-pointer group">
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={isUploading}
          className="absolute inset-0 opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          ) : uploadedUrl ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          ) : (
            <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-indigo-400 transition-colors" />
          )}

          <p className="text-xs font-medium text-slate-300">
            {isUploading
              ? 'Uploading to Cloudinary...'
              : uploadedUrl
              ? 'Uploaded successfully!'
              : 'Click or drag file to upload'}
          </p>
          <p className="text-[10px] text-slate-500">Supports PNG, JPG, WEBP, PDF up to 10MB</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-1.5 text-xs text-red-400">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
