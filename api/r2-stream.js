// Cloudflare R2 Stream Upload API - Büyük dosyalar için
// Binary stream olarak alır, doğrudan R2'ye yükler
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

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

// Request body'yi buffer olarak oku
async function getRawBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => resolve(Buffer.concat(chunks)));
        req.on('error', reject);
    });
}

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-File-Name, X-Content-Type, X-Folder');
    res.setHeader('Content-Type', 'application/json');

    // CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST' && req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Environment variables kontrolü
        if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
            return res.status(500).json({ error: 'R2 credentials not configured' });
        }

        // Headers'dan metadata al
        const fileName = req.headers['x-file-name'] || 'unnamed_file';
        const contentType = req.headers['x-content-type'] || req.headers['content-type'] || 'application/octet-stream';
        const folder = req.headers['x-folder'] || 'uploads';

        console.log('Stream upload başladı:', { fileName, contentType, folder });

        // Raw body'yi al
        const buffer = await getRawBody(req);
        
        console.log('Buffer alındı, boyut:', buffer.length);

        if (buffer.length === 0) {
            return res.status(400).json({ error: 'Empty file' });
        }

        // Dosya boyutu kontrolü (500MB)
        if (buffer.length > 500 * 1024 * 1024) {
            return res.status(400).json({ error: 'File too large (max 500MB)' });
        }

        // Benzersiz dosya adı
        const timestamp = Date.now();
        const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const key = `${folder}/${timestamp}_${safeName}`;

        // R2'ye yükle
        const r2 = getR2Client();
        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        });

        await r2.send(command);

        // Public URL oluştur
        const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

        console.log('Upload başarılı:', publicUrl);

        return res.status(200).json({
            success: true,
            url: publicUrl,
            key: key,
            size: buffer.length
        });

    } catch (error) {
        console.error('R2 stream upload error:', error);
        return res.status(500).json({
            error: 'Upload failed',
            message: error.message
        });
    }
};

// Vercel'e raw body parse etmemesini söyle
module.exports.config = {
    api: {
        bodyParser: false,
    },
};
