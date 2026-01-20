const Report = require('../models/Report');
const cloudinary = require('cloudinary').v2;
const axios = require('axios');
const stream = require('stream');

// Helper to upload to Cloudinary from buffer
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
    // Step 1: Validate file presence
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    const { lat, lng, description } = req.body;
    
    // Step 2: Upload to Cloudinary
    let cloudinaryResult;
    try {
      cloudinaryResult = await uploadToCloudinary(req.file.buffer);
    } catch (uploadError) {
      console.error('Cloudinary Upload Error:', uploadError);
      return res.status(500).json({ success: false, message: 'Image upload failed' });
    }

    const imageUrl = cloudinaryResult.secure_url;

    // Step 3: Call Roboflow API
    let aiResult = {
      detected: false,
      class: 'Unknown',
      confidence: 0,
      rawResult: {}
    };

    const ROBOFLOW_API_KEY = process.env.ROBOFLOW_API_KEY;
    const ROBOFLOW_MODEL_ID = process.env.ROBOFLOW_MODEL_ID || 'garbage-classification-3'; // Example model
    const ROBOFLOW_VERSION = process.env.ROBOFLOW_VERSION || '1';

    if (ROBOFLOW_API_KEY) {
      try {
        const roboflowUrl = `https://detect.roboflow.com/${ROBOFLOW_MODEL_ID}/${ROBOFLOW_VERSION}?api_key=${ROBOFLOW_API_KEY}`;
        
        // Roboflow accepts image URL or base64. Using URL is easier if it's public.
        // Or we can send base64 to avoid Cloudinary delay issues.
        // Let's use the URL since we just uploaded it.
        const response = await axios.post(roboflowUrl, null, {
            params: {
                image: imageUrl
            }
        });

        const predictions = response.data.predictions;
        aiResult.rawResult = response.data;

        if (predictions && predictions.length > 0) {
           // Get highest confidence prediction
           const bestPrediction = predictions.reduce((prev, current) => 
             (prev.confidence > current.confidence) ? prev : current
           );
           
           aiResult.detected = true;
           aiResult.class = bestPrediction.class;
           aiResult.confidence = bestPrediction.confidence;
        }

      } catch (aiError) {
        console.error('Roboflow API Error:', aiError.message);
        // Don't fail the whole request, just log it.
        aiResult.class = 'AI_Error';
      }
    } else {
      // Mock data if no API Key
      console.log('Roboflow API Key missing, using mock data.');
      aiResult.detected = true;
      aiResult.class = 'Sampah (Mock)';
      aiResult.confidence = 0.95;
    }

    // Step 4: Save to MongoDB
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
    });

    await newReport.save();

    // Step 5: Return Response
    res.status(201).json({
      success: true,
      ticketId,
      message: 'Laporan diterima',
      data: newReport
    });

  } catch (error) {
    console.error('Create Report Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
