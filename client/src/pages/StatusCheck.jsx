import React, { useState } from 'react';
import axios from 'axios';
import { Search, AlertCircle, MapPin, Calendar, CheckCircle, XCircle, Clock, Image as ImageIcon } from 'lucide-react';

const StatusCheck = () => {
  const [ticketId, setTicketId] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        setError('Laporan tidak ditemukan. Pastikan ID Tiket Anda benar.');
      } else {
        setError('Terjadi kesalahan koneksi. Silakan coba lagi.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full border border-green-200">
            <CheckCircle className="w-4 h-4" />
            <span className="font-semibold text-sm">Selesai</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full border border-red-200">
            <XCircle className="w-4 h-4" />
            <span className="font-semibold text-sm">Ditolak</span>
          </div>
        );
      case 'in progress':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full border border-blue-200">
            <Clock className="w-4 h-4" />
            <span className="font-semibold text-sm">Diproses</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full border border-yellow-200">
            <Clock className="w-4 h-4" />
            <span className="font-semibold text-sm">Menunggu</span>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto py-10 px-4">
      {/* Search Card */}
      <div className="bg-white rounded-xl shadow-xl p-6 mb-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Cek Status Laporan</h2>
          <p className="text-gray-500 mt-1">Pantau tindak lanjut laporan Anda</p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID Tiket</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Masukkan ID Tiket (Contoh: RPT-12345)"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !ticketId}
            className={`w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg shadow transition-all ${
              loading ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-md active:scale-95'
            }`}
          >
            {loading ? 'Sedang Mencari...' : 'Cari Laporan'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 border border-red-100">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}
      </div>

      {/* Result Card */}
      {report && (
        <div className="bg-white rounded-xl shadow-xl overflow-hidden animate-fade-in-up">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">ID Laporan</p>
              <p className="text-lg font-mono font-bold text-gray-800">{report.ticketId}</p>
            </div>
            {getStatusBadge(report.status)}
          </div>

          <div className="p-6 space-y-6">
            {/* Image */}
            <div className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
               {report.imageUrl ? (
                 <img src={report.imageUrl} alt="Bukti Laporan" className="w-full h-56 object-cover" />
               ) : (
                 <div className="w-full h-48 flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="w-12 h-12 mb-2"/>
                    <span className="text-sm">Tidak ada foto</span>
                 </div>
               )}
            </div>
            
            {/* Details */}
            <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold text-gray-900 text-sm">Tanggal Lapor</h4>
                        <p className="text-gray-600 text-sm">
                            {new Date(report.createdAt).toLocaleDateString('id-ID', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold text-gray-900 text-sm">Lokasi</h4>
                        <a 
                            href={`https://www.google.com/maps?q=${report.location?.lat},${report.location?.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 hover:underline text-sm break-all"
                        >
                            {report.location?.lat}, {report.location?.lng}
                        </a>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">Keterangan:</h4>
                    <p className="text-gray-600 text-sm italic">"{report.description || 'Tidak ada keterangan'}"</p>
                </div>
            </div>
            
            {/* AI Analysis Badge (Optional display) */}
            {report.aiAnalysis && (
                <div className="pt-4 border-t border-gray-100">
                     <p className="text-xs text-gray-400 uppercase font-bold mb-2">Analisis AI</p>
                     <div className="flex items-center gap-2">
                         <div className={`w-3 h-3 rounded-full ${report.aiAnalysis.detected ? 'bg-amber-500' : 'bg-gray-300'}`}></div>
                         <span className="text-sm font-medium text-gray-700">
                             {report.aiAnalysis.detected 
                                ? `Terdeteksi: ${report.aiAnalysis.class} (${Math.round(report.aiAnalysis.confidence * 100)}%)` 
                                : 'Tidak ada objek signifikan terdeteksi'}
                         </span>
                     </div>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusCheck;
