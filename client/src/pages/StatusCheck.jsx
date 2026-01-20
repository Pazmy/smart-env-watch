import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StatusCheck = () => {
  const [ticketId, setTicketId] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!ticketId.trim()) return;

    setLoading(true);
    setError('');
    setReport(null);

    try {
      const response = await axios.get(`http://localhost:5000/api/reports/${ticketId}`);
      if (response.data.success) {
        setReport(response.data.data);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('Laporan tidak ditemukan. Pastikan ID Tiket benar.');
      } else {
        setError('Terjadi kesalahan saat mencari laporan.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'in progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // Pending
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Navbar Simple */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-emerald-950">EcoWatch</span>
        </div>
        <button onClick={() => navigate('/')} className="text-sm font-medium text-slate-500 hover:text-emerald-600 transition">
          &larr; Kembali ke Home
        </button>
      </nav>

      <div className="flex-1 max-w-3xl mx-auto w-full p-6 flex flex-col items-center">
        
        {/* Header Section */}
        <div className="text-center mt-10 mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Cek Status Laporan</h1>
          <p className="text-slate-500">Masukkan ID Tiket Anda untuk melihat progress penanganan.</p>
        </div>

        {/* Search Box */}
        <form onSubmit={handleSearch} className="w-full max-w-lg mb-12">
            <div className="relative flex items-center">
                <input 
                    type="text" 
                    placeholder="Contoh: RPT-17123-ABCDE (atau TEST-123)"
                    className="w-full px-5 py-4 rounded-xl border border-slate-200 shadow-sm focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition text-lg bg-white placeholder:text-slate-300"
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value)}
                />
                <button 
                    type="submit"
                    disabled={loading || !ticketId}
                    className="absolute right-2 px-6 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 active:scale-95 transition disabled:opacity-50 disabled:active:scale-100"
                >
                    {loading ? 'Mencari...' : 'Cek'}
                </button>
            </div>
            {error && (
                <div className="mt-3 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center animate-fade-in-up">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    {error}
                </div>
            )}
        </form>

        {/* Result Card */}
        {report && (
            <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 animate-fade-in-up">
                {/* Header Card: Status */}
                <div className="px-6 py-6 border-b border-slate-50 bg-slate-50/50 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">ID TIKET</p>
                        <p className="text-xl font-mono font-bold text-slate-700 select-all">{report.ticketId}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full border ${getStatusColor(report.status)} font-bold text-sm flex items-center shadow-sm`}>
                         <div className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse"></div>
                         {report.status}
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Details */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                Tanggal Laporan
                            </h3>
                            <p className="text-slate-600 ml-6">{new Date(report.createdAt).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                Lokasi
                            </h3>
                            <div className="ml-6 flex items-center text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                <span className="font-mono text-xs">{report.location?.lat?.toFixed(6)}, {report.location?.lng?.toFixed(6)}</span>
                                <a href={`https://www.google.com/maps/search/?api=1&query=${report.location?.lat},${report.location?.lng}`} target="_blank" rel="noopener noreferrer" className="ml-auto text-emerald-600 hover:text-emerald-700 text-xs font-semibold">Lihat Peta &rarr;</a>
                            </div>
                        </div>

                        <div>
                             <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                Deskripsi
                            </h3>
                            <p className="text-slate-600 ml-6 bg-slate-50 p-3 rounded-lg text-sm italic border-l-2 border-emerald-200">"{report.description || 'Tidak ada deskripsi tambahan'}"</p>
                        </div>
                    </div>

                    {/* Right Column: Evidence & AI */}
                    <div className="space-y-6">
                        <div>
                             <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                Bukti Foto
                            </h3>
                            <div className="relative group rounded-xl overflow-hidden shadow-sm border border-slate-100">
                                <img src={report.imageUrl} alt="Bukti Laporan" className="w-full h-48 object-cover group-hover:scale-105 transition duration-500" />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                     {report.aiAnalysis?.detected ? (
                                        <div className="flex items-center space-x-2">
                                            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">AI DETECTED</span>
                                            <span className="text-white text-xs font-medium">{report.aiAnalysis.class} ({(report.aiAnalysis.confidence * 100).toFixed(0)}%)</span>
                                        </div>
                                     ) : (
                                        <span className="bg-slate-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">NO OBJECT DETECTED</span>
                                     )}
                                </div>
                            </div>
                        </div>

                        {/* Optional Timeline Placeholder */}
                         <div className="pt-2">
                           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Riwayat</h3>
                           <div className="relative pl-4 border-l-2 border-slate-100 space-y-4">
                              <div className="relative">
                                  <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-50"></div>
                                  <p className="text-xs text-slate-500 font-mono mb-0.5">{new Date(report.createdAt).toLocaleString()}</p>
                                  <p className="text-sm font-medium text-slate-800">Laporan Diterima</p>
                              </div>
                              {/* Future statuses can be mapped here */}
                           </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default StatusCheck;
