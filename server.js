const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 3000;

// Auto-copy screenshots from brain storage to static folder on startup
const figmaScreenshots = [
    {
        src: 'C:\\Users\\steva\\.gemini\\antigravity\\brain\\de2522f2-9952-4a4c-ac74-832be3dfa2f4\\kustore_1782573714708.png',
        dest: path.join(__dirname, 'static', 'kustore.png')
    },
    {
        src: 'C:\\Users\\steva\\.gemini\\antigravity\\brain\\de2522f2-9952-4a4c-ac74-832be3dfa2f4\\indoflazz_1782573740268.png',
        dest: path.join(__dirname, 'static', 'indoflazz.png')
    },
    {
        src: 'C:\\Users\\steva\\.gemini\\antigravity\\brain\\de2522f2-9952-4a4c-ac74-832be3dfa2f4\\kpr_rumah_impian_1782573760890.png',
        dest: path.join(__dirname, 'static', 'kpr_rumah_impian.png')
    }
];

figmaScreenshots.forEach(shot => {
    try {
        if (fs.existsSync(shot.src)) {
            const staticDir = path.join(__dirname, 'static');
            if (!fs.existsSync(staticDir)) {
                fs.mkdirSync(staticDir, { recursive: true });
            }
            fs.copyFileSync(shot.src, shot.dest);
            console.log(`Successfully copied ${path.basename(shot.dest)} to static directory.`);
        } else {
            console.warn(`Source file not found: ${shot.src}`);
        }
    } catch (err) {
        console.error(`Failed to copy screenshot: ${err.message}`);
    }
});

// Enable JSON body parsing for API requests
app.use(express.json());

// Serve static assets from the 'static' directory
app.use('/static', express.static(path.join(__dirname, 'static')));

// SMTP Nodemailer Transporter Configuration
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // false for port 587 (TLS/STARTTLS)
    auth: {
        user: 'stevanlim123@gmail.com',
        pass: 'jzfhwfmomsbclazw' // Gmail App Password
    },
    tls: {
        rejectUnauthorized: false
    }
});

// API Endpoint to process and send contact emails via SMTP
app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ success: false, error: 'Semua field harus diisi.' });
    }

    const mailOptions = {
        from: '"noreply portofolio" <noreply@you.com>',
        to: 'stevanlim123@gmail.com', // Receive messages here
        replyTo: `"${name}" <${email}>`, // Allow direct reply to the sender
        subject: `[Portofolio] ${subject}`,
        text: `Nama: ${name}\nEmail: ${email}\n\nPesan:\n${message}`,
        html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #3b82f6; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 0;">Pesan Baru dari Kontak Portofolio</h2>
                <p style="margin: 8px 0;"><strong>Nama:</strong> ${name}</p>
                <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a></p>
                <p style="margin: 8px 0;"><strong>Subjek:</strong> ${subject}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="white-space: pre-wrap; line-height: 1.6; background-color: #f9fafb; padding: 15px; border-radius: 6px; border: 1px solid #f3f4f6;">${message}</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Pesan berhasil terkirim!' });
    } catch (error) {
        console.error('SMTP Error:', error);
        res.status(500).json({ success: false, error: 'Gagal mengirim email. Silakan coba lagi.' });
    }
});

// Serve the main index.html file for the root path
app.get('/', (req, res) => {
    // Lazy copy screenshots if they do not exist in the destination yet
    figmaScreenshots.forEach(shot => {
        try {
            if (fs.existsSync(shot.src)) {
                const staticDir = path.join(__dirname, 'static');
                if (!fs.existsSync(staticDir)) {
                    fs.mkdirSync(staticDir, { recursive: true });
                }
                fs.copyFileSync(shot.src, shot.dest);
                console.log(`[Lazy Copy] Successfully copied ${path.basename(shot.dest)} to static directory.`);
            }
        } catch (err) {
            console.error(`[Lazy Copy] Failed to copy screenshot: ${err.message}`);
        }
    });
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`  Stevan Lim Portfolio Server is running!`);
    console.log(`  Local URL: http://localhost:${PORT}`);
    console.log(`==================================================`);
});
