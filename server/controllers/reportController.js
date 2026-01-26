const Report = require('../models/Report');
const cloudinary = require('cloudinary').v2;
const axios = require('axios');
const stream = require('stream');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
    
    if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_CLOUD_NAME) {
        try {
            console.log('Uploading to Cloudinary...');
            const result = await uploadToCloudinary(req.file.buffer);
            imageUrl = result.secure_url;
        } catch (uploadError) {
            console.error('Cloudinary Upload Error:', uploadError);
            return res.status(500).json({ success: false, message: 'Image upload failed' });
        }
    } else {
        console.log('⚠️ Cloudinary Credentials missing. Using Mock Image URL.');
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

    const ROBOFLOW_API_KEY = process.env.PRIVATE_KEY || process.env.ROBOFLOW_API_KEY;
    const ROBOFLOW_MODEL_ID = process.env.ROBOFLOW_MODEL_ID || 'garbage-classification-3'; 
    const ROBOFLOW_VERSION = process.env.ROBOFLOW_VERSION || '1';

    if (ROBOFLOW_API_KEY) {
      try {
        const roboflowUrl = `${process.env.ROBOFLOW_BASEURL}/${ROBOFLOW_MODEL_ID}/${ROBOFLOW_VERSION}?api_key=${ROBOFLOW_API_KEY}`;
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
      aiResult.class = 'garbage'; // Contoh hasil dummy (was 'Tumpukan Sampah (Mock)') - changed to match logic
      aiResult.confidence = 0.88;
    }

    // ==========================================
    // STEP 3.5: HYBRID WORKFLOW LOGIC
    // ==========================================
    let category = 'Butuh Verifikasi';
    let aiStatus = false;

    // Pastikan classname sesuai dengan yang dilatih (lowercase verify)
    const detectedClass = aiResult.class ? aiResult.class.toLowerCase() : '';
    const GARBAGE_CLASSES = ['garbage', 'trash', 'plastic', 'sampah']; // Tambahkan label lain jika ada

    if (
        aiResult.detected && 
        GARBAGE_CLASSES.some(cls => detectedClass.includes(cls)) && 
        aiResult.confidence > 0.4
    ) {
        category = 'Sampah';
        aiStatus = true;
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
      aiAnalysis: aiResult, 
      status: 'Pending',
      category: category
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
      aiResult: aiResult,
      category: category
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

exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    console.error('Get All Reports Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, category } = req.body;

    let updateData = {};
    if (status) {
        if (!['Pending', 'In Progress', 'Resolved', 'Rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value' });
        }
        updateData.status = status;
    }

    if (category) {
        // Validasi category jika perlu, atau percayakan enum Mongoose
        updateData.category = category;
    }

    const report = await Report.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true } // runValidators penting untuk check enum
    );

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    console.error('Update Report Status Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
