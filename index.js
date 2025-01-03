const express = require('express');
const useragent = require('express-useragent');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const moment = require('moment');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(useragent.express());

// Fungsi untuk mendapatkan informasi detail dari IP
function getIpInfo(req) {
    return {
        ip: req.headers['x-forwarded-for']?.split(',')[0] || 
           req.socket.remoteAddress || 
           req.connection.remoteAddress,
        forwardedFor: req.headers['x-forwarded-for'],
        realIp: req.headers['x-real-ip'],
        proxyIp: req.connection.remoteAddress
    };
}

// Fungsi untuk mendapatkan informasi detail dari User Agent
function getUserAgentInfo(userAgent) {
    return {
        browser: userAgent.browser,
        version: userAgent.version,
        os: userAgent.os,
        platform: userAgent.platform,
        source: userAgent.source,
        isMobile: userAgent.isMobile,
        isDesktop: userAgent.isDesktop,
        isBot: userAgent.isBot,
        isAndroid: userAgent.isAndroid,
        isIOS: userAgent.isIOS,
        isWindows: userAgent.isWindows,
        isMac: userAgent.isMac,
        isLinux: userAgent.isLinux
    };
}

// Route untuk test endpoint
app.get('/test', async (req, res) => {
    try {
        const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
        const randomNum = Math.floor(Math.random() * 1000000);
        const filename = `ip_${timestamp}_${randomNum}.json`;

        // Mengumpulkan semua informasi
        const data = {
            ipInfo: getIpInfo(req),
            userAgent: getUserAgentInfo(req.useragent),
            timestamp: moment().format(),
            headers: req.headers,
            panel: {
                id: `panel_${randomNum}`,
                checkTime: moment().format(),
                name: `Check_${timestamp}`
            }
        };

        // Simpan ke file
        const filePath = path.join('/tmp', filename);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));

        // Response dengan informasi lengkap
        res.status(200).json({
            message: "Berhasil",
            filename: filename,
            ipInfo: data.ipInfo,
            deviceInfo: {
                type: data.userAgent.isMobile ? 'Mobile' : 
                      data.userAgent.isTablet ? 'Tablet' : 
                      data.userAgent.isDesktop ? 'Desktop' : 'Unknown',
                browser: `${data.userAgent.browser} ${data.userAgent.version}`,
                os: data.userAgent.os,
                platform: data.userAgent.platform
            },
            panel_id: data.panel.id
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: "Terjadi kesalahan",
            error: error.message
        });
    }
});

// Handle OPTIONS request untuk CORS
app.options('*', cors());

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: "Terjadi kesalahan internal",
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
});

// Default route
app.get('/', (req, res) => {
    res.json({ message: "API berjalan dengan baik" });
});

// Port untuk development
const PORT = process.env.PORT || 3000;

// Start server jika bukan di Vercel
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server berjalan di port ${PORT}`);
    });
}

module.exports = app;