const Report = require('../models/Report');
const cloudinary = require('cloudinary').v2;
const axios = require('axios');
const stream = require('stream');

// Konfigurasi Cloudinary (Pastikan ini terpanggil, meski kosong)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper: Upload ke Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'smart-env-reports' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);
    bufferStream.pipe(uploadStream);
  });
};

exports.createReport = async (req, res) => {
  try {
    // Step 1: Validasi file
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    const { latitude: lat, longitude: lng, description } = req.body;
    console.log('Received Report Data:', { lat, lng, description });
    let imageUrl = '';

    // ==========================================
    // STEP 2: CLOUDINARY UPLOAD (DENGAN MOCK)
    // ==========================================
    
    // Cek apakah ada API KEY di .env?
    if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_CLOUD_NAME) {
        // JIKA ADA: Upload beneran
        try {
            console.log('Uploading to Cloudinary...');
            const result = await uploadToCloudinary(req.file.buffer);
            imageUrl = result.secure_url;
        } catch (uploadError) {
            console.error('Cloudinary Upload Error:', uploadError);
            return res.status(500).json({ success: false, message: 'Image upload failed' });
        }
    } else {
        // JIKA TIDAK ADA: Pakai URL Dummy (Mock Mode)
        console.log('⚠️ Cloudinary Credentials missing. Using Mock Image URL.');
        // Gunakan placeholder image service atau static url
        imageUrl = 'https://placehold.co/600x400/059669/ffffff?text=Uploaded+Image+(Mock)';
    }

    // ==========================================
    // STEP 3: ROBOFLOW AI (DENGAN MOCK)
    // ==========================================
    let aiResult = {
      detected: false,
      class: 'Unknown',
      confidence: 0,
      rawResult: {}
    };

    const ROBOFLOW_API_KEY = process.env.ROBOFLOW_API_KEY;
    const ROBOFLOW_MODEL_ID = process.env.ROBOFLOW_MODEL_ID || 'garbage-classification-3'; 
    const ROBOFLOW_VERSION = process.env.ROBOFLOW_VERSION || '1';

    if (ROBOFLOW_API_KEY) {
      try {
        const roboflowUrl = `https://detect.roboflow.com/${ROBOFLOW_MODEL_ID}/${ROBOFLOW_VERSION}?api_key=${ROBOFLOW_API_KEY}`;
        
        // Kita kirim URL gambar (baik itu asli dari Cloudinary atau dummy)
        const response = await axios.post(roboflowUrl, null, {
            params: { image: imageUrl }
        });

        const predictions = response.data.predictions;
        aiResult.rawResult = response.data;

        if (predictions && predictions.length > 0) {
           const bestPrediction = predictions.reduce((prev, current) => 
             (prev.confidence > current.confidence) ? prev : current
           );
           
           aiResult.detected = true;
           aiResult.class = bestPrediction.class;
           aiResult.confidence = bestPrediction.confidence;
        }

      } catch (aiError) {
        console.error('Roboflow API Error:', aiError.message);
        aiResult.class = 'AI_Error';
      }
    } else {
      // Mock data AI jika tidak ada API Key
      console.log('⚠️ Roboflow API Key missing, using mock AI result.');
      aiResult.detected = true;
      aiResult.class = 'Tumpukan Sampah (Mock)'; // Contoh hasil dummy
      aiResult.confidence = 0.88;
    }

    // ==========================================
    // STEP 4: SAVE TO MONGODB
    // ==========================================
    const ticketId = `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const newReport = new Report({
      ticketId,
      imageUrl,
      location: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
      description,
      aiAnalysis: aiResult, // Pastikan field ini sesuai dengan Schema kamu (misal: aiResult atau aiAnalysis?)
      status: 'Pending'
    });

    await newReport.save();

    // Step 5: Return Response
    res.status(201).json({
      success: true,
      ticketId,
      message: 'Laporan diterima',
      data: newReport,
      // Kirim balik url dan hasil AI biar bisa ditampilkan di Frontend Success Page
      imageUrl: imageUrl, 
      aiResult: aiResult 
    });

  } catch (error) {
    console.error('Create Report Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.getReportByTicketId = async (req, res) => {
  try {
    const { ticketId } = req.params;

    // 1. Cek User Asli dulu di DB
    let report = await Report.findOne({ ticketId });

    // 2. Jika tidak ketemu, cek apakah ini TESTING ID?
    if (!report && ticketId === 'TEST-123') {
        // Return Dummy Data
        return res.status(200).json({
            success: true,
            data: {
                ticketId: 'TEST-123',
                status: 'In Progress',
                createdAt: new Date(),
                description: 'Laporan percobaan untuk testing fitur cek status.',
                location: {
                    lat: -6.2088,
                    lng: 106.8456
                },
                imageUrl: 'https://placehold.co/600x400/059669/ffffff?text=Evidence+(TEST)',
                aiAnalysis: {
                    detected: true,
                    class: 'Plastic Waste',
                    confidence: 0.95
                }
            }
        });
    }

    if (!report) {
      return res.status(404).json({ success: false, message: 'Laporan tidak ditemukan' });
    }

    res.status(200).json({ success: true, data: report });

  } catch (error) {
    console.error('Get Report Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};