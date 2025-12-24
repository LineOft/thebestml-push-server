// Cloudflare R2 Dosya Yükleme API
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
};

// R2 Client oluştur
function getR2Client() {
    return new S3Client({
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
    });
}

module.exports = async (req, res) => {
    // CORS preflight
    if (req.method === 'OPTIONS') {
        res.status(200).json({ ok: true });
        return;
    }

    // Set CORS headers
    Object.keys(corsHeaders).forEach(key => {
        res.setHeader(key, corsHeaders[key]);
    });

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Environment variables kontrolü
        if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
            return res.status(500).json({ error: 'R2 credentials not configured' });
        }

        const { fileName, fileData, contentType, folder } = req.body;

        if (!fileName || !fileData) {
            return res.status(400).json({ error: 'fileName and fileData required' });
        }

        // Base64'ü buffer'a çevir
        const base64Data = fileData.replace(/^data:[^;]+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Dosya boyutu kontrolü (100MB)
        if (buffer.length > 100 * 1024 * 1024) {
            return res.status(400).json({ error: 'File too large (max 100MB)' });
        }

        // Benzersiz dosya adı
        const timestamp = Date.now();
        const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const folderPath = folder || 'uploads';
        const key = `${folderPath}/${timestamp}_${safeName}`;

        // R2'ye yükle
        const r2 = getR2Client();
        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: contentType || 'application/octet-stream',
        });

        await r2.send(command);

        // Public URL oluştur
        const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

        console.log('✅ R2 upload success:', key);

        return res.status(200).json({
            success: true,
            url: publicUrl,
            key: key,
            size: buffer.length
        });

    } catch (error) {
        console.error('❌ R2 upload error:', error);
        return res.status(500).json({ 
            error: 'Upload failed', 
            message: error.message 
        });
    }
};
