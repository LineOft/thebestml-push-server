// Cloudflare R2 Presigned URL API - Büyük dosya yükleme için
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

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

        const { fileName, contentType, folder, fileSize } = req.body;

        if (!fileName) {
            return res.status(400).json({ error: 'fileName required' });
        }

        // Dosya boyutu kontrolü (500MB max)
        if (fileSize && fileSize > 500 * 1024 * 1024) {
            return res.status(400).json({ error: 'File too large (max 500MB)' });
        }

        // Benzersiz dosya adı
        const timestamp = Date.now();
        const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const folderPath = folder || 'uploads';
        const key = `${folderPath}/${timestamp}_${safeName}`;

        // Presigned URL oluştur
        const r2 = getR2Client();
        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            ContentType: contentType || 'application/octet-stream',
        });

        // 1 saat geçerli URL oluştur
        const presignedUrl = await getSignedUrl(r2, command, { expiresIn: 3600 });

        // Public URL
        const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

        return res.status(200).json({
            success: true,
            uploadUrl: presignedUrl,
            publicUrl: publicUrl,
            key: key
        });

    } catch (error) {
        console.error('R2 presign error:', error);
        return res.status(500).json({
            error: 'Presign failed',
            message: error.message
        });
    }
};
