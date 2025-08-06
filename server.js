// --- IMPORTS ---
const express = require('express');
const cors = require('cors');
const multer = require('multer');
// Note: We don't need 'path' for serving local files anymore.

// Document & Image Processing Libraries
const { exec } = require('child_process');
const fs = require('fs');
const JSZip = require('jszip');
const { PDFDocument } = require('pdf-lib');
const pdfParse = require('pdf-parse');
const sharp = require('sharp');
const { Document, Packer, Paragraph, TextRun } = require('docx');
const exceljs = require('exceljs');
const qrcode = require('qrcode');


// --- INITIALIZATION ---
const app = express();
const PORT = process.env.PORT || 3000;
const upload = multer({ storage: multer.memoryStorage() });


// --- CORS CONFIGURATION ---
// This is the most important security feature.
// It ensures that only your website can make requests to this backend.
const corsOptions = {
  origin: 'https://belgianchoclates.be',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));


// --- MIDDLEWARE ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// --- HELPER FUNCTION FOR ERROR HANDLING ---
const handleError = (res, error, toolName) => {
    console.error(`Error in ${toolName}:`, error);
    res.status(500).json({ message: `An error occurred during ${toolName}.`, details: error.message });
};


// --- TEST ROUTE ---
// You can visit https://docushift-backend.onrender.com/ to see this message.
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'DocuShift Pro Backend is running. Ready for requests from belgianchoclates.be'
    });
});


// --- API ROUTES ---

// Example: QR Code Generator
app.post('/api/qr-code', upload.none(), async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: "Text for QR code is required." });
        const qrCodeBuffer = await qrcode.toBuffer(text, { type: 'png' });
        res.type('image/png').send(qrCodeBuffer);
    } catch (e) {
        handleError(res, e, "QR Code Generation");
    }
});

// Example: PDF to Word
app.post('/api/pdf-to-word', upload.single('files'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded." });
        const data = await pdfParse(req.file.buffer);
        const paragraphs = data.text.split('\n').map(line => new Paragraph({ children: [new TextRun(line)] }));
        const doc = new Document({ sections: [{ children: paragraphs }] });
        const buffer = await Packer.toBuffer(doc);
        res.type('application/vnd.openxmlformats-officedocument.wordprocessingml.document').send(buffer);
    } catch (e) {
        handleError(res, e, "PDF to Word");
    }
});

// NOTE: Add all your other /api/... tool routes here. They do not need to be changed.
// ... (merge, split, compress, resize, etc.)


// --- START THE SERVER ---
app.listen(PORT, () => {
    console.log(`✅ DocuShift Backend started and listening on port ${PORT}`);
});