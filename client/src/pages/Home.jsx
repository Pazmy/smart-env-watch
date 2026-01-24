import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Camera, MapPin, Upload, AlertCircle } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [location, setLocation] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLoading(false);
          alert('Gagal mengambil lokasi. Pastikan GPS aktif.');
        }
      );
    } else {
      alert('Geolocation tidak didukung browser ini.');
    }
  };

  const handleSubmit = async () => {
    if (!image || !location) {
      alert('Mohon lengkapi foto dan lokasi!');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('image', image);
    formData.append('latitude', location.lat);
    formData.append('longitude', location.lng);
    formData.append('description', description);

    try {
      const response = await axios.post('http://localhost:5000/api/reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Navigate to Success page with response data
      navigate('/success', {
        state: {
          ticketId: response.data.ticketId,
          aiResult: response.data.aiResult,
          imageUrl: response.data.imageUrl
        }
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Gagal mengirim laporan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto py-10 px-4">
      {/* Hero / Title Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lapor Masalah Lingkungan</h1>
        <p className="text-gray-600 text-lg">
          Bantu kami menjaga lingkungan. Ambil foto dan lapor segera.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-xl p-6 space-y-6">
        
        {/* Image Input */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Foto Bukti
          </label>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <div
            onClick={() => fileInputRef.current.click()}
            className={`w-full h-52 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group ${
                preview 
                ? 'border-emerald-500 bg-white' 
                : 'border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50'
            }`}
          >
            {preview ? (
              <div className="relative w-full h-full overflow-hidden rounded-lg p-1">
                 <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg shadow-sm"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <p className="text-white font-medium bg-black/50 px-3 py-1 rounded-full text-sm">Ganti Foto</p>
                  </div>
              </div>
            ) : (
              <div className="text-center text-emerald-600 group-hover:text-emerald-700 group-hover:scale-105 transition-transform">
                <div className="bg-emerald-100 p-3 rounded-full inline-block mb-3">
                    <Camera className="w-8 h-8" />
                </div>
                <span className="block text-sm font-medium">Klik untuk Ambil/Pilih Foto</span>
              </div>
            )}
          </div>
        </div>

        {/* Location Button */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Lokasi
          </label>
          <button
            onClick={handleLocationClick}
            type="button"
            className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg font-medium transition-all duration-200 border shadow-sm ${
              location
                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-emerald-400 hover:text-emerald-600'
            }`}
          >
            <MapPin className={`w-5 h-5 ${location ? 'fill-current' : ''}`} />
            {loading && !location
              ? 'Mengambil koordinat...'
              : location
              ? `Lokasi Terkunci: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
              : 'Ambil Lokasi Saat Ini'}
          </button>
        </div>

        {/* Description Input */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Keterangan Tambahan
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contoh: Ada tumpukan sampah plastik di pinggir sungai..."
            rows={4}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition placeholder:text-gray-400 resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-lg shadow-lg hover:shadow-xl transition-all transform active:scale-[0.98] flex justify-center items-center gap-3 text-lg ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Sedang Mengirim...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Kirim Laporan
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Home;
