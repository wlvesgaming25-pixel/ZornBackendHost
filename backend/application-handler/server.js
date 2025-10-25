const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const Joi = require('joi');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3003;

// Security middleware
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
    methods: ['POST', 'GET'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
        files: 3 // Max 3 files
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'video/mp4'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, PDF, and MP4 files are allowed.'));
        }
    }
});

// Rate limiting
const applicationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Max 3 applications per hour per IP
    message: {
        error: 'Too many applications submitted. Please wait 1 hour before submitting another application.'
    }
});

// Application types and their validation schemas
const applicationSchemas = {
    competitive: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        email: Joi.string().email().required(),
        discord: Joi.string().min(3).max(50).required(),
        age: Joi.number().min(13).max(50).required(),
        game: Joi.string().min(2).max(50).required(),
        rank: Joi.string().min(2).max(100).required(),
        experience: Joi.string().min(10).max(2000).required(),
        availability: Joi.string().min(5).max(500).required(),
        motivation: Joi.string().min(10).max(2000).required()
    }),
    
    creator: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        email: Joi.string().email().required(),
        discord: Joi.string().min(3).max(50).required(),
        age: Joi.number().min(13).max(50).required(),
        platform: Joi.string().min(2).max(50).required(),
        followers: Joi.number().min(0).required(),
        contentType: Joi.string().min(2).max(100).required(),
        experience: Joi.string().min(10).max(2000).required(),
        portfolio: Joi.string().uri().allow('').optional(),
        motivation: Joi.string().min(10).max(2000).required()
    }),
    
    editor: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        email: Joi.string().email().required(),
        discord: Joi.string().min(3).max(50).required(),
        age: Joi.number().min(13).max(50).required(),
        software: Joi.string().min(2).max(200).required(),
        experience: Joi.string().min(10).max(2000).required(),
        portfolio: Joi.string().uri().allow('').optional(),
        availability: Joi.string().min(5).max(500).required(),
        motivation: Joi.string().min(10).max(2000).required()
    }),
    
    designer: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        email: Joi.string().email().required(),
        discord: Joi.string().min(3).max(50).required(),
        age: Joi.number().min(13).max(50).required(),
        specialization: Joi.string().min(2).max(100).required(),
        software: Joi.string().min(2).max(200).required(),
        experience: Joi.string().min(10).max(2000).required(),
        portfolio: Joi.string().uri().allow('').optional(),
        motivation: Joi.string().min(10).max(2000).required()
    })
};

// Email transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD
        }
    });
};

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'Application Handler', timestamp: new Date().toISOString() });
});

// Application submission endpoint
app.post('/api/apply/:type', applicationLimiter, upload.array('files', 3), async (req, res) => {
    try {
        const applicationType = req.params.type;
        const schema = applicationSchemas[applicationType];
        
        if (!schema) {
            return res.status(400).json({
                success: false,
                error: 'Invalid application type'
            });
        }

        // Validate input
        const { error, value } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.details.map(detail => detail.message)
            });
        }

        const applicationData = value;
        const files = req.files || [];

        // Create email transporter
        const transporter = createTransporter();

        // Format application data for email
        const formatApplicationData = (data, type) => {
            const fields = Object.entries(data).map(([key, value]) => {
                const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
                return `<p><strong>${label}:</strong> ${value}</p>`;
            }).join('');

            return `
                <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #ff4824, #ff0b4e); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">New ${type.charAt(0).toUpperCase() + type.slice(1)} Application</h1>
                    </div>
                    <div style="padding: 30px; background: #f9f9f9;">
                        <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
                            <h2 style="color: #333; margin-top: 0;">Application Details</h2>
                            ${fields}
                        </div>
                        ${files.length > 0 ? `
                        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                            <h3 style="color: #333; margin-top: 0;">Attachments</h3>
                            <p>${files.length} file(s) attached to this application.</p>
                        </div>
                        ` : ''}
                        <div style="margin-top: 20px; padding: 15px; background: #e8f5e8; border-left: 4px solid #4caf50; border-radius: 4px;">
                            <p style="margin: 0; color: #2e7d32;">
                                <strong>Submitted:</strong> ${new Date().toLocaleString()}<br>
                                <strong>Application ID:</strong> ${Date.now()}-${type}
                            </p>
                        </div>
                    </div>
                </div>
            `;
        };

        // Email to team
        const teamMailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.APPLICATIONS_EMAIL || process.env.EMAIL_USER,
            subject: `[Team Zorn Application] ${applicationType.charAt(0).toUpperCase() + applicationType.slice(1)} - ${applicationData.name}`,
            html: formatApplicationData(applicationData, applicationType),
            attachments: files.map((file, index) => ({
                filename: `attachment_${index + 1}_${file.originalname}`,
                content: file.buffer,
                contentType: file.mimetype
            }))
        };

        // Auto-reply to applicant
        const autoReplyOptions = {
            from: process.env.EMAIL_USER,
            to: applicationData.email,
            subject: 'Application Received - Team Zorn',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #ff4824, #ff0b4e); padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0;">Application Received!</h1>
                    </div>
                    <div style="padding: 30px; background: #f9f9f9;">
                        <h2 style="color: #333;">Hi ${applicationData.name},</h2>
                        <p style="color: #555; line-height: 1.6;">
                            Thank you for your interest in joining Team Zorn as a ${applicationType}! 
                            We've successfully received your application and our team will review it carefully.
                        </p>
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff4824;">
                            <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
                            <ul style="color: #555; line-height: 1.8;">
                                <li>Our team will review your application within 5-7 business days</li>
                                <li>If you're a good fit, we'll reach out via Discord or email</li>
                                <li>Successful candidates will be invited for an interview/trial</li>
                                <li>Join our Discord to stay updated on opportunities</li>
                            </ul>
                        </div>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://discord.gg/your-invite" style="background: linear-gradient(45deg, #ff4824, #ff0b4e); color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold;">Join Our Discord</a>
                        </div>
                        <p style="color: #999; font-size: 14px; margin-top: 30px;">
                            Best of luck,<br>
                            Team Zorn Recruitment Team<br>
                            <em>Application ID: ${Date.now()}-${applicationType}</em>
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
            message: 'Application submitted successfully! Check your email for confirmation.',
            applicationId: `${Date.now()}-${applicationType}`
        });

    } catch (error) {
        console.error('Application submission error:', error);
        
        if (error instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                error: 'File upload error: ' + error.message
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to submit application. Please try again later.'
        });
    }
});

// Get application status (future feature)
app.get('/api/application/:id', (req, res) => {
    res.json({
        success: true,
        status: 'under_review',
        message: 'Your application is currently under review. We\'ll contact you soon!'
    });
});

app.listen(port, () => {
    console.log(`Application handler running on port ${port}`);
});

module.exports = app;