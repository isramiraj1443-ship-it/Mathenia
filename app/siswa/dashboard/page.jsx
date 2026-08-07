'use client';
import { useState, useEffect } from 'react';
import { callApi, postApi } from '@/lib/googleApi';
import NotificationBell from '@/components/NotificationBell';

export default function SiswaDashboard() {
  const [siswa, setSiswa] = useState(null);
  const [materi, setMateri] = useState([]);
  const [penugasan, setPenugasan] = useState([]);
  const [fileBase64, setFileBase64] = useState('');
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    const data = localStorage.getItem('siswaData');
    if (data) {
      const parsed = JSON.parse(data);
      setSiswa(parsed);
      loadModul(parsed.kelas);
    }
  }, []);

  async function loadModul(kelas) {
    const resMat = await callApi('getMateri', { kelas });
    if (resMat.status === 'success') setMateri(resMat.data);

    const resTug = await callApi('getPenugasan', { kelas });
    if (resTug.status === 'success') setPenugasan(resTug.data);
  }

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setFileBase64(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadTugasSiswa = async (tugasId) => {
    if (!fileBase64) { alert("Pilih file jawaban terlebih dahulu."); return; }
    const res = await postApi('uploadTugas', {
      tugasId,
      siswaId: siswa.id,
      namaSiswa: siswa.nama,
      kelas: siswa.kelas,
      fileBase64,
      fileName
    });
    if (res.status === 'success') {
      alert("Jawaban tugas berhasil diunggah langsung ke Folder Google Drive Anda!");
      setFileBase64('');
      setFileName('');
    } else {
      alert("Gagal unggah: " + res.message);
    }
  };

  if (!siswa) return <div className="p-8 text-center text-sm">Akses ditolak. Silakan <a href="/profil" className="text-indigo-600 underline font-bold">Registrasi Profil</a> terlebih dahulu.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-xl shadow-sm border border-indigo-100">
        <div className="flex items-center space-x-3">
          <img src={siswa.fotoUrl} alt="Profil" className="w-12 h-12 rounded-full object-cover border-2 border-indigo-600" />
          <div>
            <h2 className="font-bold text-base text-gray-800">{siswa.nama}</h2>
            <p className="text-xs text-indigo-600 font-semibold">Mathenia - Kelas {siswa.kelas}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <a href="/cbt" className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg font-bold shadow hover:bg-green-700">Mulai CBT Ujian</a>
          <NotificationBell targetId={siswa.id} />
        </div>
      </div>

      {/* Bagian Materi Terisolasi */}
      <div className="bg-white p-5 rounded-xl shadow-sm border">
        <h3 className="text-md font-bold text-indigo-700 mb-3">Modul Materi & Media Pembelajaran (Kelas {siswa.kelas})</h3>
        {materi.length === 0 ? <p className="text-xs text-gray-400">Belum ada materi untuk kelas ini.</p> : (
          <div className="space-y-3">
            {materi.map((m, i) => (
              <div key={i} className="p-3 border rounded-lg flex justify-between items-center bg-gray-50">
                <div>
                  <h4 className="font-semibold text-sm text-gray-800">{m.Judul}</h4>
                  <p className="text-xs text-gray-500">{m.Deskripsi}</p>
                </div>
                <a href={m.FileUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700">Viewer / Download</a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bagian Penugasan & Upload ke Drive Personal */}
      <div className="bg-white p-5 rounded-xl shadow-sm border">
        <h3 className="text-md font-bold text-indigo-700 mb-3">Modul Penugasan & LKPD Interaktif</h3>
        {penugasan.length === 0 ? <p className="text-xs text-gray-400">Belum ada penugasan aktif.</p> : (
          <div className="space-y-4">
            {penugasan.map((t, i) => (
              <div key={i} className="p-4 border rounded-lg space-y-2 bg-gray-50">
                <h4 className="font-semibold text-sm text-gray-800">{t.Judul}</h4>
                <p className="text-xs text-gray-600">{t.Deskripsi}</p>
                <p className="text-xs text-red-500 font-medium">Batas Pengumpulan: {t.Deadline}</p>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 pt-2 border-t">
                  <input type="file" onChange={handleFile} className="text-xs text-gray-500" />
                  <button onClick={() => uploadTugasSiswa(t.ID)} className="px-4 py-1.5 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700">Kirim ke Drive Pribadi</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
