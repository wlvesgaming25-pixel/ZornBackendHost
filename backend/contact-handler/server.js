const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const Joi = require('joi');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3002;

// Security middleware
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000', 
        'http://localhost:8000',
        'http://127.0.0.1:8000',
        'https://zorn-website.netlify.app',
        'https://zorn-website.onrender.com',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
    methods: ['POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Rate limiting
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Max 5 submissions per 15 minutes per IP
    message: {
        error: 'Too many contact submissions. Please wait 15 minutes before trying again.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Email transporter setup
const createTransporter = () => {
    if (process.env.EMAIL_SERVICE === 'gmail') {
        return nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD
            }
        });
    } else if (process.env.EMAIL_SERVICE === 'outlook') {
        return nodemailer.createTransporter({
            host: 'smtp-mail.outlook.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    } else {
        // Generic SMTP configuration
        return nodemailer.createTransporter({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }
};

// Validation schema
const contactSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    subject: Joi.string().min(5).max(200).required(),
    message: Joi.string().min(10).max(2000).required()
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'Contact Handler', timestamp: new Date().toISOString() });
});

// Contact form submission endpoint
app.post('/api/contact', contactLimiter, async (req, res) => {
    try {
        // Validate input
        const { error, value } = contactSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.details.map(detail => detail.message)
            });
        }

        const { name, email, subject, message } = value;

        // Create email transporter
        const transporter = createTransporter();

        // Verify connection
        await transporter.verify();

        // Email to team
        const teamMailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
            subject: `[Zorn Website] ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #ff4824, #ff0b4e); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">New Contact Form Submission</h1>
                    </div>
                    <div style="padding: 30px; background: #f9f9f9;">
                        <h2 style="color: #333; margin-bottom: 20px;">Contact Details</h2>
                        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                            <p><strong>Name:</strong> ${name}</p>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Subject:</strong> ${subject}</p>
                        </div>
                        <div style="background: white; padding: 20px; border-radius: 8px;">
                            <h3 style="color: #333; margin-top: 0;">Message:</h3>
                            <p style="line-height: 1.6; color: #555;">${message.replace(/\n/g, '<br>')}</p>
                        </div>
                        <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-left: 4px solid #2196f3; border-radius: 4px;">
                            <p style="margin: 0; color: #1976d2;">
                                <strong>Timestamp:</strong> ${new Date().toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        // Auto-reply to sender
        const autoReplyOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Thank you for contacting Team Zorn',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #ff4824, #ff0b4e); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">Thank You!</h1>
                    </div>
                    <div style="padding: 30px; background: #f9f9f9;">
                        <h2 style="color: #333;">Hi ${name},</h2>
                        <p style="color: #555; line-height: 1.6;">
                            Thank you for reaching out to Team Zorn! We've received your message and will get back to you as soon as possible.
                        </p>
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #333; margin-top: 0;">Your message:</h3>
                            <p style="color: #666; font-style: italic;">"${subject}"</p>
                        </div>
                        <p style="color: #555; line-height: 1.6;">
                            We typically respond within 24-48 hours. If your inquiry is urgent, you can also reach out to us on Discord.
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://discord.gg/your-invite" style="background: linear-gradient(45deg, #ff4824, #ff0b4e); color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold;">Join Our Discord</a>
                        </div>
                        <p style="color: #999; font-size: 14px; margin-top: 30px;">
                            Best regards,<br>
                            Team Zorn
                        </p>
                    </div>
                </div>
            `
        };

        // Send emails
        await Promise.all([
            transporter.sendMail(teamMailOptions),
            transporter.sendMail(autoReplyOptions)
        ]);

        res.json({
            success: true,
            message: 'Your message has been sent successfully! We\'ll get back to you soon.'
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send message. Please try again later.'
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

app.listen(port, () => {
    console.log(`Contact handler running on port ${port}`);
    console.log('Environment:', process.env.NODE_ENV || 'development');
});

module.exports = app;