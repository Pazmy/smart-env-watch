import React, { useState, useRef } from 'react';
import { Camera, MapPin, Upload } from 'lucide-react';

const Home = () => {
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

  const handleSubmit = () => {
    console.log({
      image,
      preview,
      location,
      description,
    });
    alert('Laporan berhasil dikirim! (Cek Console)');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* Hero Section */}
      <header className="w-full bg-emerald-600 py-12 px-4 shadow-lg text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Smart Environment Watch
        </h1>
        <p className="text-emerald-100 text-lg">
          Lapor kerusakan lingkungan di sekitarmu dengan mudah.
        </p>
      </header>

      <main className="w-full max-w-lg p-6 -mt-8">
        <div className="bg-white rounded-xl shadow-xl p-6 space-y-6">
          
          {/* Image Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
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
              className="w-full h-48 border-2 border-dashed border-emerald-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 transition-colors"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center text-emerald-600">
                  <Camera className="w-12 h-12 mx-auto mb-2" />
                  <span className="text-sm font-medium">Ambil / Pilih Foto</span>
                </div>
              )}
            </div>
          </div>

          {/* Location Button */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Lokasi
            </label>
            <button
              onClick={handleLocationClick}
              type="button"
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                location
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MapPin className={`w-5 h-5 ${location ? 'fill-current' : ''}`} />
              {loading
                ? 'Sedang mengambil lokasi...'
                : location
                ? `Lokasi Terkunci: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                : 'Ambil Lokasi Saya'}
            </button>
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Keterangan
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan masalah lingkungan yang Anda temukan..."
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-95"
          >
            Kirim Laporan
          </button>
        </div>
      </main>
    </div>
  );
};

export default Home;
