/* eslint-env node */
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Basic static serving if needed
// app.use(express.static(path.join(__dirname, 'dist')));

// Configure Nodemailer transporter (Gmail App Password)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s/g, '') : ''
  }
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('[SMTP] Connection verification failed:', error);
  } else {
    console.log('[SMTP] Server is ready to take our messages');
  }
});

// Mock database of registered authorities
const registeredAuthorities = [
  'vedavignanreddykomma@gmail.com',
  process.env.EMAIL_USER // Include the sender as requested
];

app.post('/api/alert', async (req, res) => {
  const { timestamp, type } = req.body;

  console.log(`[ALERT] Received critical alert at ${timestamp}`);
  console.log(`[DEBUG] Attempting to send email from: ${process.env.EMAIL_USER} to: ${registeredAuthorities.join(', ')}`);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: registeredAuthorities.join(', '),
    subject: 'URGENT: HOPE Project Security Alert Detected',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 25px; color: #1a1a1a; background-color: #fef2f2; border: 2px solid #ef4444; border-radius: 12px;">
        <h1 style="color: #ef4444; margin-top: 0;">CRITICAL ALERT</h1>
        <p style="font-size: 1.2rem; font-weight: bold;">A suspicious hanging activity detected. Please check the location immediately.</p>
        
        <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #fee2e2;">
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="margin-bottom: 8px;"><strong>📅 Time:</strong> ${timestamp}</li>
            <li style="margin-bottom: 8px;"><strong>🔍 Detection Type:</strong> ${type || 'AI Visual Matching'}</li>
            <li style="margin-bottom: 8px;"><strong>📍 Source:</strong> HOPE Camera 01</li>
          </ul>
        </div>

        <div style="padding: 15px; background: #ef4444; color: white; border-radius: 8px; font-weight: bold; text-align: center;">
          IMMEDIATE INTERVENTION REQUIRED
        </div>

        <p style="margin-top: 30px; font-style: italic; color: #6366f1;">"If HOPE can give even one life a second chance, then this project has already succeeded"</p>
        <hr style="border: 0; border-top: 1px solid #fecaca; margin: 20px 0;" />
        <p style="font-size: 0.8rem; color: #666;">This is an automated priority alert from the HOPE Safety Platform.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[ALERT] Email dispatched to authorities.');
    console.log('[DEBUG] Envelope:', info.envelope);
    console.log('[DEBUG] MessageId:', info.messageId);
    console.log('[DEBUG] Accepted:', info.accepted);
    res.status(200).json({ success: true, message: 'Alert dispatched successfully.' });
  } catch (error) {
    console.error('[ALERT] Failed to send email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`HOPE Server running on port ${PORT}`);
});
