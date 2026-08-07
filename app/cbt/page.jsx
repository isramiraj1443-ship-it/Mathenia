'use client';
import { useState, useEffect } from 'react';
import { postApi } from '@/lib/googleApi';

export default function CBTPage() {
  const [soal] = useState([
    { ID: 1, Pertanyaan: "Berapakah hasil dari 15 + 5 x 3?", OpsiA: "60", OpsiB: "30", OpsiC: "45", OpsiD: "20", JawabanBenar: "B" },
    { ID: 2, Pertanyaan: "Jika 3x - 2 = 10, nilai x adalah...", OpsiA: "4", OpsiB: "3", OpsiC: "5", OpsiD: "6", JawabanBenar: "A" }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(300);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSelect = (opt) => setAnswers({ ...answers, [currentIndex]: opt });

  const handleSubmit = async () => {
    let correct = 0;
    soal.forEach((s, idx) => { if (answers[idx] === s.JawabanBenar) correct++; });
    const finalScore = (correct / soal.length) * 100;
    setScore(finalScore);
    setIsSubmitted(true);

    const siswaData = JSON.parse(localStorage.getItem('siswaData') || '{}');
    if (siswaData.id) {
      await postApi('submitCBT', {
        siswaId: siswaData.id,
        namaSiswa: siswaData.nama,
        kelas: siswaData.kelas,
        skor: finalScore
      });
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-md text-center mt-20 space-y-4">
        <h1 className="text-xl font-bold text-green-600">Ujian CBT Selesai!</h1>
        <p className="text-sm text-gray-600">Skor Instan Anda:</p>
        <div className="text-4xl font-extrabold text-indigo-600">{score}</div>
        <a href="/siswa/dashboard" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold">Kembali ke Dashboard</a>
      </div>
    );
  }

  const current = soal[currentIndex];

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10 space-y-6">
      <div className="flex justify-between items-center border-b pb-3">
        <h2 className="font-bold text-md text-indigo-700">Computer Based Test Mathenia</h2>
        <div className="px-3 py-1 bg-red-50 text-red-600 font-bold rounded-lg text-xs">
          ⏱️ {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold text-gray-500">Soal {currentIndex + 1} dari {soal.length}</p>
        <p className="text-sm font-medium text-gray-800">{current.Pertanyaan}</p>
        <div className="grid gap-2 pt-1">
          {['A', 'B', 'C', 'D'].map(opt => (
            <button key={opt} onClick={() => handleSelect(opt)} className={`p-3 text-left border rounded-lg text-xs font-medium transition ${answers[currentIndex] === opt ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}`}>
              <b>{opt}.</b> {current['Opsi' + opt]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t">
        <button disabled={currentIndex === 0} onClick={() => setCurrentIndex(c => c - 1)} className="px-4 py-2 bg-gray-200 rounded-lg text-xs disabled:opacity-50">Sebelumnya</button>
        {currentIndex < soal.length - 1 ? (
          <button onClick={() => setCurrentIndex(c => c + 1)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold">Selanjutnya</button>
        ) : (
          <button onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700">Kirim Ujian</button>
        )}
      </div>
    </div>
  );
}
