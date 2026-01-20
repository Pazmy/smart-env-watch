import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Copy, ArrowLeft, Image as ImageIcon, Activity, AlertCircle } from 'lucide-react';

const Success = () => {
  const location = useLocation();
  const { ticketId, aiResult, imageUrl } = location.state || {};

  const handleCopy = () => {
    if (ticketId) {
      navigator.clipboard.writeText(ticketId);
      alert('Ticket ID copied to clipboard!');
    }
  };

  if (!ticketId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Data Found</h2>
          <p className="text-gray-600 mb-6">Please submit a report first.</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Laporan Berhasil!
          </h2>
          <p className="text-gray-500">
            Terima kasih telah berkontribusi menjaga lingkungan.
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 text-center">
            Tiket ID
          </p>
          <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm">
            <code className="text-xl font-bold text-gray-800 tracking-wider">
              {ticketId}
            </code>
            <button
              onClick={handleCopy}
              className="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
              title="Copy ID"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Simpan ID ini untuk memantau status laporan Anda.
          </p>
        </div>

        <div className="space-y-4">
            {imageUrl && (
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
                    <div className="shrink-0 p-2 bg-blue-50 rounded-lg">
                        <ImageIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Bukti Foto</p>
                        <img src={imageUrl} alt="Uploaded evidence" className="w-full h-32 object-cover rounded-md" />
                    </div>
                </div>
            )}

            {aiResult && (
                 <div className={`p-4 rounded-xl border shadow-sm flex items-start gap-4 ${
                    aiResult.detected 
                      ? 'bg-emerald-50 border-emerald-100' 
                      : 'bg-amber-50 border-amber-200'
                 }`}>
                     <div className="shrink-0 p-2 bg-white rounded-lg">
                        {aiResult.detected ? (
                          <Activity className="w-6 h-6 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-6 h-6 text-amber-600" />
                        )}
                     </div>
                     <div className="w-full">
                        <p className={`text-sm font-semibold mb-1 ${
                          aiResult.detected ? 'text-emerald-900' : 'text-amber-900'
                        }`}>Analisis AI</p>
                        
                        {aiResult.detected ? (
                            <div className="mt-1">
                                <p className="text-lg font-bold text-emerald-800">
                                    Kategori Terdeteksi: {aiResult.class}
                                </p>
                                <p className="text-sm text-emerald-700 font-medium">
                                    Tingkat Akurasi: {aiResult.confidence}%
                                </p>
                            </div>
                        ) : (
                            <p className="text-base text-amber-800 font-medium mt-1">
                                AI tidak dapat mengenali objek. Laporan ditandai untuk verifikasi manual.
                            </p>
                        )}
                     </div>
                 </div>
            )}
        </div>

        <div className="pt-4">
          <Link
            to="/"
            className="w-full flex items-center justify-center px-6 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-gray-900 hover:bg-gray-800 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Buat Laporan Baru
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Success;
