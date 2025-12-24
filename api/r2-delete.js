// Cloudflare R2 Dosya Silme API
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
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

    if (req.method !== 'POST' && req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Environment variables kontrolü
        if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
            return res.status(500).json({ error: 'R2 credentials not configured' });
        }

        const { key } = req.body;

        if (!key) {
            return res.status(400).json({ error: 'key required' });
        }

        // R2'den sil
        const r2 = getR2Client();
        const command = new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
        });

        await r2.send(command);

        console.log('✅ R2 delete success:', key);

        return res.status(200).json({
            success: true,
            message: 'File deleted',
            key: key
        });

    } catch (error) {
        console.error('❌ R2 delete error:', error);
        return res.status(500).json({ 
            error: 'Delete failed', 
            message: error.message 
        });
    }
};
