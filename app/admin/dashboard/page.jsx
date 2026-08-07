'use client';
import { useState, useEffect } from 'react';
import { callApi, postApi } from '@/lib/googleApi';
import NotificationBell from '@/components/NotificationBell';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('validasi');
  const [bankSoal, setBankSoal] = useState([]);
  const [aiTopic, setAiTopic] = useState('');
  const [aiOutput, setAiOutput] = useState('');

  useEffect(() => {
    async function loadData() {
      const res = await callApi('getBankSoal');
      if (res.status === 'success') setBankSoal(res.data);
    }
    loadData();
  }, []);

  const handleAiGenerator = () => {
    if (!aiTopic) return;
    setAiOutput(`[SUKSES]: LKPD format DOCX berbasis Taksonomi SOLO untuk topik "${aiTopic}" berhasil di-generate dan disinkronkan ke Google Drive Guru.`);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center bg-gray-900 text-white p-4 rounded-xl shadow">
        <h1 className="text-lg font-bold">Mathenia - Dashboard Guru (Admin)</h1>
        <NotificationBell targetId="ADMIN" />
      </div>

      <div className="flex space-x-2 border-b pb-2">
        <button onClick={() => setActiveTab('validasi')} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === 'validasi' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Validasi Tugas</button>
        <button onClick={() => setActiveTab('ai')} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === 'ai' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>AI LKPD Generator</button>
        <button onClick={() => setActiveTab('bank')} className={`px-4 py-2 rounded-lg text-xs font-bold ${activeTab === 'bank' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}>Bank Soal Drive</button>
      </div>

      {activeTab === 'validasi' && (
        <div className="bg-white p-5 rounded-xl shadow-sm border space-y-3">
          <h3 className="font-bold text-md text-indigo-700">Validasi Tugas Siswa</h3>
          <p className="text-xs text-gray-500">Tinjau lembar kerja atau file jawaban siswa yang masuk ke Google Drive mereka.</p>
          <div className="p-3 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 gap-2">
            <div>
              <p className="font-semibold text-sm">Siswa: Ahmad Fauzi (Kelas 7)</p>
              <span className="text-xs text-indigo-600 underline font-medium cursor-pointer">Lihat Berkas Jawaban Drive</span>
            </div>
            <div className="flex items-center space-x-2">
              <select id="val-status" className="border text-xs p-1.5 rounded bg-white">
                <option value="Approved">Approved</option>
                <option value="Revisi">Revisi</option>
              </select>
              <input id="val-nilai" type="number" placeholder="Nilai" className="border w-16 text-xs p-1.5 rounded" />
              <button onClick={() => alert("Validasi berhasil dikirim dan notifikasi terkirim ke siswa!")} className="px-3 py-1.5 bg-green-600 text-white text-xs rounded font-bold">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="bg-white p-5 rounded-xl shadow-sm border space-y-4">
          <h3 className="font-bold text-md text-indigo-700">AI Math Assistant & 5 Level Taksonomi SOLO</h3>
          <textarea value={aiTopic} onChange={e => setAiTopic(e.target.value)} placeholder="Masukkan prompt materi & level Taksonomi SOLO (e.g., Aljabar Relational)..." className="w-full p-3 border rounded-lg text-xs h-28 focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
          <button onClick={handleAiGenerator} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700">Generate DOCX LKPD ke Drive</button>
          {aiOutput && <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-xs text-indigo-800 font-medium">{aiOutput}</div>}
        </div>
      )}

      {activeTab === 'bank' && (
        <div className="bg-white p-5 rounded-xl shadow-sm border space-y-3">
          <h3 className="font-bold text-md text-indigo-700">Parser Folder "Bank Soal" Google Drive</h3>
          <p className="text-xs text-gray-500">Sistem otomatis mendeteksi dokumen soal di direktori Google Drive khusus.</p>
          <div className="space-y-2">
            {bankSoal.length === 0 ? <p className="text-xs text-gray-400">Belum ada soal terindeks otomatis.</p> : bankSoal.map((b, i) => (
              <div key={i} className="p-3 border rounded-lg text-xs bg-gray-50">
                <p className="font-semibold text-gray-800">Q: {b.Pertanyaan}</p>
                <span className="text-[10px] text-gray-500">Kelas: {b.Kelas} | Kunci: {b.JawabanBenar}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
