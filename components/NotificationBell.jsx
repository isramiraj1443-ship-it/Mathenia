'use client';
import { useState, useEffect } from 'react';
import { callApi } from '@/lib/googleApi';

export default function NotificationBell({ targetId }) {
  const [notifs, setNotifs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function fetchNotif() {
      if (!targetId) return;
      const res = await callApi('getNotifikasi', { targetId });
      if (res.status === 'success') setNotifs(res.data);
    }
    fetchNotif();
    const interval = setInterval(fetchNotif, 10000);
    return () => clearInterval(interval);
  }, [targetId]);

  const unreadCount = notifs.filter(n => n.Dibaca === 'False').length;

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 bg-gray-100 rounded-full hover:bg-gray-200">
        🔔
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 px-1.5 py-0.5 text-[10px] text-white bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-xl z-50 p-3 max-h-96 overflow-y-auto">
          <h3 className="font-bold text-sm border-b pb-1 mb-2">Pemberitahuan Mathenia</h3>
          {notifs.length === 0 ? (
            <p className="text-xs text-gray-500">Tidak ada notifikasi baru.</p>
          ) : (
            notifs.map((n, idx) => (
              <div key={idx} className={`p-2 text-xs mb-1.5 rounded ${n.Dibaca === 'False' ? 'bg-indigo-50 font-medium' : 'bg-gray-50'}`}>
                <p>{n.Pesan}</p>
                <span className="text-[9px] text-gray-400">{new Date(n.CreatedAt).toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
