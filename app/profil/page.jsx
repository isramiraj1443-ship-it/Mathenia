'use client';
import { useState, useRef, useEffect } from 'react';
import { postApi } from '@/lib/googleApi';
import { useRouter } from 'next/navigation';

export default function ProfilPage() {
  const [nama, setNama] = useState('');
  const [kelas, setKelas] = useState('7');
  const [facingMode, setFacingMode] = useState('user');
  const [brightness, setBrightness] = useState(100);
  const [fotoBase64, setFotoBase64] = useState('');
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    let stream = null;
    async function initCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera access error:", err);
      }
    }
    initCamera();
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, [facingMode]);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      canvas.width = video.videoWidth || 300;
      canvas.height = video.videoHeight || 300;
      const ctx = canvas.getContext('2d');
      ctx.filter = `brightness(${brightness}%)`;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setFotoBase64(canvas.toDataURL('image/png'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nama || !fotoBase64) {
      alert("Mohon lengkapi Nama Lengkap dan ambil Foto Profil!");
      return;
    }
    setLoading(true);
    const res = await postApi('registerSiswa', { nama, kelas, fotoBase64 });
    setLoading(false);
    if (res.status === 'success') {
      localStorage.setItem('siswaData', JSON.stringify(res.data));
      alert("Registrasi Berhasil! Folder Drive Personal Anda telah dibuat otomatis.");
      router.push('/siswa/dashboard');
    } else {
      alert("Gagal registrasi: " + res.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md mt-10 space-y-4">
      <h1 className="text-2xl font-bold text-center text-indigo-600">Registrasi Siswa Mathenia</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
          <input type="text" value={nama} onChange={e => setNama(e.target.value)} required className="w-full p-2 border rounded mt-1 text-sm" placeholder="Contoh: Budi Santoso" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Pilihan Kelas</label>
          <select value={kelas} onChange={e => setKelas(e.target.value)} className="w-full p-2 border rounded mt-1 text-sm">
            <option value="7">Kelas 7</option>
            <option value="9">Kelas 9</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Foto Profil WebRTC</label>
          <div className="relative w-full h-52 bg-black rounded-lg overflow-hidden flex items-center justify-center my-1">
            <video ref={videoRef} autoPlay playsInline style={{ filter: `brightness(${brightness}%)` }} className="w-full h-full object-cover"></video>
            {/* Bingkai Lingkaran 50% */}
            <div className="absolute w-36 h-36 border-4 border-dashed border-white rounded-full pointer-events-none opacity-80"></div>
          </div>
          <div className="flex justify-between items-center text-xs mt-2">
            <button type="button" onClick={() => setFacingMode(m => m === 'user' ? 'environment' : 'user')} className="px-3 py-1 bg-gray-200 rounded">Switch Kamera</button>
            <div className="flex items-center space-x-1">
              <span>Cahaya:</span>
              <input type="range" min="50" max="200" value={brightness} onChange={e => setBrightness(e.target.value)} />
            </div>
          </div>
          <button type="button" onClick={capturePhoto} className="w-full mt-2 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold">Ambil Snapshot</button>
        </div>
        {fotoBase64 && (
          <div className="flex flex-col items-center">
            <span className="text-[11px] text-gray-500 mb-1">Preview Circular Crop:</span>
            <img src={fotoBase64} alt="Crop Result" className="w-20 h-20 rounded-full object-cover border-2 border-indigo-600" />
          </div>
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        <button type="submit" disabled={loading} className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition">
          {loading ? 'Memproses Sistem...' : 'Simpan Profil & Buat Folder Drive'}
        </button>
      </form>
    </div>
  );
}
