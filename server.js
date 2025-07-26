// server.js (Corrected with No Duplicate Logic)

const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config();

// --- Models (Unchanged) ---
const Project = require('./models/project');
const Service = require('./models/service');
const User = require('./models/user');
const Experience = require('./models/experience');
const About = require('./models/about');
const Hero = require('./models/hero');
const Message = require('./models/message');

// --- Multer, App, Port, DB Connection, Middleware (UNCHANGED) ---
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const app = express();
const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB Connected...')).catch(err => console.error('MongoDB Connection Error:', err));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' })); // You only need this line once
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false, store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }) }));
const requireLogin = (req, res, next) => { if (!req.session.userId) { if (req.originalUrl.startsWith('/api/admin')) { return res.status(401).json({ message: 'Unauthorized' }); } return res.redirect('/admin/login.html'); } next(); };
const requireOtpVerification = (req, res, next) => { if (!req.session.isOtpVerified) { return res.status(403).json({ message: 'Access denied. Please complete OTP verification first.' }); } next(); };

// --- PUBLIC ROUTES ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'src', 'index.html')));

app.get('/api/projects', async (req, res) => {
    try {
        const data = await Project.find();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/services', async (req, res) => {
    try {
        const data = await Service.find();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/about', async (req, res) => {
    try {
        // There should only ever be one "about" document
        const data = await About.findOne(); 
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// server.js -> with other public routes
app.get('/api/hero', async (req, res) => {
    try {
        // Find one document, or create it with defaults if it doesn't exist
        let data = await Hero.findOne();
        if (!data) {
            data = new Hero();
            await data.save();
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// ============================================
// --- FINAL, CORRECTED CONTACT FORM ROUTE ---
// ============================================
app.post('/send-message', async (req, res) => {
    // This single try...catch block will handle the entire process.
    try {
        const { name, email, message } = req.body;

        // --- Step 1: Save the message to the database FIRST ---
        const newMessage = new Message({ name, email, message });
        await newMessage.save();
        console.log('Message saved to database.');

        // --- Step 2: Prepare the transporter and email templates ---
        const gmailTransporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // Use SSL
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, // Your Gmail App Password
            },
        });

        // Template for the notification email to YOU
        const adminMailOptions = {
            from: `"${name}" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            replyTo: email,
            subject: `New Portfolio Message from ${name}`,
            html: `
                <div style="font-family: 'Poppins', sans-serif; background-color: #f1f5f9; padding: 40px;">
                    <div style="max-width: 600px; margin: auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                        <div style="background-color: #1e293b; color: white; padding: 20px; text-align: center;"><h1 style="margin: 0; font-size: 24px;">New Portfolio Inquiry</h1></div>
                        <div style="padding: 30px;">
                            <h2 style="color: #0d9488; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">Contact Details</h2>
                            <p style="font-size: 16px;"><strong>Name:</strong> ${name}</p>
                            <p style="font-size: 16px;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #14b8a6;">${email}</a></p>
                            <h2 style="color: #0d9488; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-top: 30px;">Message</h2>
                            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; font-size: 16px; line-height: 1.7; white-space: pre-wrap;">${message}</div>
                        </div>
                    </div>
                </div>
            `,
        };

        // Template for the "Thank You" email to the USER
        const userMailOptions = {
            from: `"Akash Mandal" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Thank You for Your Message, ${name}!`,
            html: `
                <div style="font-family: 'Poppins', sans-serif; background-color: #f1f5f9; padding: 40px;">
                    <div style="max-width: 600px; margin: auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                        <div style="background-color: #1e293b; color: white; padding: 20px; text-align: center;"><h1 style="margin: 0; font-size: 24px;">Message Received!</h1></div>
                        <div style="padding: 30px;">
                            <h2 style="color: #0d9488; font-size: 20px;">Hello ${name},</h2>
                            <p style="font-size: 16px; line-height: 1.7;">Thank you for reaching out through my portfolio. I've successfully received your message and will review it shortly.</p>
                            <p style="font-size: 16px; line-height: 1.7;">I appreciate your interest and will get back to you as soon as possible.</p>
                            <p style="font-size: 16px; line-height: 1.7; margin-top: 30px;">Best regards,<br><b>Akash Mandal</b></p>
                        </div>
                    </div>
                </div>
            `,
        };

        // --- Step 3: Send the emails ---
        await gmailTransporter.sendMail(adminMailOptions);
        console.log('Admin notification sent successfully via Gmail.');
        
        await gmailTransporter.sendMail(userMailOptions);
        console.log('User confirmation sent successfully via Gmail.');

        // --- Step 4: Send ONE final success response ---
        return res.status(200).json({ success: true, message: 'Your message has been sent successfully!' });

    } catch (error) {
        console.error('Error in contact form submission process:', error);
        // --- Step 5: Send ONE final error response if anything fails ---
        return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
    }
});


// --- ADMIN AUTH ROUTES ---
app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) { return res.status(401).json({ success: false, message: 'Invalid credentials.' }); }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) { return res.status(401).json({ success: false, message: 'Invalid credentials.' }); }
    req.session.userId = user._id;
    res.json({ success: true });
});

app.post('/api/admin/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) { return res.status(500).json({ success: false, message: 'Could not log out.' }); }
        res.clearCookie('connect.sid');
        res.json({ success: true });
    });
});


// 1. Request OTP
app.post('/api/admin/request-otp', requireLogin, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user || !user.email) {
            return res.status(400).json({ message: 'Admin email not found.' });
        }
        
        const otp = crypto.randomInt(100000, 999999).toString();
        req.session.otp = otp;
        req.session.otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

        // Use Gmail transporter specifically for this sensitive task
        const gmailTransporter = nodemailer.createTransport({
            host: 'smtp.gmail.com', port: 465, secure: true,
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        await gmailTransporter.sendMail({
            from: `"Portfolio Admin" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Your Admin Area Verification Code',
            html: `<div style="font-family: sans-serif; text-align: center; padding: 40px;">
                       <h2>Verification Required</h2>
                       <p>Your one-time password to access the admin settings is:</p>
                       <p style="font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">${otp}</p>
                       <p>This code will expire in 10 minutes.</p>
                   </div>`
        });

        res.json({ success: true, message: `An OTP has been sent to ${user.email}.` });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ message: 'Failed to send OTP.' });
    }
});

// 2. Verify OTP
app.post('/api/admin/verify-otp', requireLogin, (req, res) => {
    const { otp } = req.body;
    if (!req.session.otp || Date.now() > req.session.otpExpires) {
        return res.status(400).json({ message: 'OTP is invalid or has expired. Please request a new one.' });
    }
    if (otp !== req.session.otp) {
        return res.status(400).json({ message: 'Incorrect OTP.' });
    }
    
    // Success! Grant access.
    req.session.isOtpVerified = true;
    delete req.session.otp; // Clear OTP after successful verification
    delete req.session.otpExpires;
    
    res.json({ success: true, message: 'Verification successful.' });
});

// 3. Change Password
app.put('/api/admin/change-password', requireLogin, requireOtpVerification, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) {
        return res.status(400).json({ message: 'Please provide current password and a new password (min. 8 characters).' });
    }
    
    try {
        const user = await User.findById(req.session.userId);
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password.' });
        }
        
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        
        req.session.isOtpVerified = false; // Require re-verification for next action
        res.json({ success: true, message: 'Password changed successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// 4. Create New Admin
app.post('/api/admin/create-admin', requireLogin, requireOtpVerification, async (req, res) => {
    const { newUsername, newEmail, newPassword } = req.body;
     if (!newUsername || !newEmail || !newPassword || newPassword.length < 8) {
        return res.status(400).json({ message: 'Please provide username, email, and a password (min. 8 characters).' });
    }

    try {
        const existingUser = await User.findOne({ $or: [{ username: newUsername }, { email: newEmail }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already exists.' });
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const newUser = new User({ username: newUsername, email: newEmail, password: hashedPassword });
        await newUser.save();

        req.session.isOtpVerified = false; // Require re-verification for next action
        res.status(201).json({ success: true, message: `Admin user '${newUsername}' created successfully.` });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
});


// --- PROTECTED ADMIN PAGES ---
app.get('/admin/dashboard.html', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin/dashboard.html'));
});

// --- NEW: PROTECTED CRUD API ROUTES FOR MESSAGES ---
app.get('/api/admin/messages', requireLogin, async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 }); // Newest first
        res.json(messages);
    } catch (error) { res.status(500).json({ message: 'Failed to fetch messages.' }); }
});

// --- THIS IS THE NEW, MISSING ENDPOINT ---
app.get('/api/admin/messages/:id', requireLogin, async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) return res.status(404).json({ message: 'Message not found' });
        res.json(message);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch message.' });
    }
});

app.put('/api/admin/messages/:id/read', requireLogin, async (req, res) => {
    try {
        await Message.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ message: 'Failed to mark as read.' }); }
});

app.delete('/api/admin/messages/:id', requireLogin, async (req, res) => {
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Message deleted.' });
    } catch (error) { res.status(500).json({ message: 'Failed to delete message.' }); }
});

// THIS IS THE CORRECTED ROUTE
app.post('/api/admin/messages/:id/reply', requireLogin, async (req, res) => {
    const { replyMessage } = req.body;
    try {
        const originalMessage = await Message.findById(req.params.id);
        if (!originalMessage) {
            return res.status(404).json({ message: 'Original message not found.' });
        }

        // --- THIS IS THE FIX ---
        // Use the same reliable Gmail configuration as your other email functions
        const gmailTransporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // Use SSL
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        
        const replyOptions = {
            from: `"Akash Mandal" <${process.env.EMAIL_USER}>`,
            to: originalMessage.email,
            subject: `Re: Your message from my portfolio`,
            html: `
                <div style="font-family: 'Poppins', sans-serif; background-color: #f1f5f9; padding: 20px;">
                    <div style="max-width: 600px; margin: auto; background-color: white; border-radius: 8px; padding: 30px;">
                        <h2 style="color: #1e293b;">Hello ${originalMessage.name},</h2>
                        <p style="font-size: 16px; line-height: 1.7;">${replyMessage.replace(/\n/g, '<br>')}</p>
                        <p style="font-size: 16px; line-height: 1.7; margin-top: 20px;">Best regards,<br><b>Akash Mandal</b></p>
                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
                        <div style="font-size: 12px; color: #64748b;">
                            <p><b>Original Message from you:</b></p>
                            <p style="font-style: italic;">"${originalMessage.message}"</p>
                        </div>
                    </div>
                </div>
            `
        };
        
        await gmailTransporter.sendMail(replyOptions);
        await Message.findByIdAndUpdate(req.params.id, { replied: true });

        res.json({ success: true, message: 'Reply sent successfully.' });
    } catch (error) {
        console.error('Error sending reply:', error);
        res.status(500).json({ message: 'Failed to send reply.' });
    }
});



// --- PROTECTED CRUD API ROUTES FOR PROJECTS ---

// CREATE a new project
app.post('/api/admin/projects', requireLogin, upload.single('projectImage'), async (req, res) => {
    try {
        const projectData = { ...req.body };
        if (req.file) {
            const formData = new FormData();
            formData.append('image', req.file.buffer, { filename: req.file.originalname });
            
            // Send the file to ImgBB
            const response = await axios.post(
                `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
                formData,
                { headers: formData.getHeaders() } // <-- THE FIX: Add the correct headers
            );
            projectData.imageUrl = response.data.data.url;
        }
        
        const newProject = new Project(projectData);
        await newProject.save();
        res.status(201).json(newProject);
    } catch (error) {
        console.error('Error creating project:', error.response ? error.response.data : error.message);
        res.status(400).json({ message: 'Error creating project.' });
    }
});

// UPDATE an existing project
app.put('/api/admin/projects/:id', requireLogin, upload.single('projectImage'), async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (updateData.tags && typeof updateData.tags === 'string') {
    updateData.tags = updateData.tags.split(',').map(tag => tag.trim());
        }

        if (req.file) {
            const formData = new FormData();
            formData.append('image', req.file.buffer, { filename: req.file.originalname });

            // Send the new file to ImgBB
            const response = await axios.post(
                `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
                formData,
                { headers: formData.getHeaders() } // <-- THE FIX: Add the correct headers
            );
            updateData.imageUrl = response.data.data.url;
        } else {
            // Keep the existing imageUrl if no new file is uploaded
            const project = await Project.findById(req.params.id);
            updateData.imageUrl = project.imageUrl;
        }

        const updatedProject = await Project.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updatedProject);
    } catch (error) {
        console.error('Error updating project:', error.response ? error.response.data : error.message);
        res.status(400).json({ message: 'Error updating project.' });
    }
});


app.get('/api/admin/projects/:id', requireLogin, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        res.json([project]); // Return as array for consistency with frontend code
    } catch (error) { res.status(404).json({ message: 'Project not found' }); }
});

app.put('/api/admin/projects/:id', requireLogin, async (req, res) => {
    try {
        const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedProject);
    } catch (error) { res.status(400).json({ message: error.message }); }
});

app.delete('/api/admin/projects/:id', requireLogin, async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: 'Project deleted successfully' });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// --- PROTECTED CRUD API ROUTES FOR SERVICES ---
app.post('/api/admin/services', requireLogin, async (req, res) => {
    try {
        const newService = new Service(req.body);
        await newService.save();
        res.status(201).json(newService);
    } catch (error) { res.status(400).json({ message: error.message }); }
});

app.get('/api/admin/services/:id', requireLogin, async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        res.json([service]);
    } catch (error) { res.status(404).json({ message: 'Service not found' }); }
});

app.put('/api/admin/services/:id', requireLogin, async (req, res) => {
    try {
        const updatedService = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedService);
    } catch (error) { res.status(400).json({ message: error.message }); }
});

app.delete('/api/admin/services/:id', requireLogin, async (req, res) => {
    try {
        await Service.findByIdAndDelete(req.params.id);
        res.json({ message: 'Service deleted successfully' });
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// server.js -> Public Routes
app.get('/api/experiences', async (req, res) => {
    try {
        // Sort by the 'createdAt' field in descending order to show newest first
        const data = await Experience.find().sort({ createdAt: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// server.js -> Protected CRUD Routes

// --- PROTECTED CRUD API ROUTES FOR EXPERIENCE ---
app.post('/api/admin/experiences', requireLogin, async (req, res) => {
    try {
        const newExperience = new Experience(req.body);
        await newExperience.save();
        res.status(201).json(newExperience);
    } catch (error) { res.status(400).json({ message: error.message }); }
});

app.get('/api/admin/experiences/:id', requireLogin, async (req, res) => {
    try {
        const experience = await Experience.findById(req.params.id);
        res.json(experience);
    } catch (error) { res.status(404).json({ message: 'Experience not found' }); }
});

app.put('/api/admin/experiences/:id', requireLogin, async (req, res) => {
    try {
        const updatedExperience = await Experience.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedExperience);
    } catch (error) { res.status(400).json({ message: error.message }); }
});

app.delete('/api/admin/experiences/:id', requireLogin, async (req, res) => {
    try {
        await Experience.findByIdAndDelete(req.params.id);
        res.json({ message: 'Experience deleted successfully' });
    } catch (error) { res.status(500).json({ message: error.message }); }
});


// --- PROTECTED CRUD API ROUTE FOR ABOUT SECTION ---
app.put('/api/admin/about', requireLogin, async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (updateData.skills && typeof updateData.skills === 'string') {
            updateData.skills = updateData.skills.split(',').map(tag => tag.trim());
        }
        // Find one document and update it, or create it if it doesn't exist ('upsert: true')
        const updatedAbout = await About.findOneAndUpdate({}, updateData, { new: true, upsert: true });
        res.json(updatedAbout);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// server.js -> with other protected admin routes

// --- PROTECTED CRUD API ROUTE FOR HERO SECTION ---
app.put('/api/admin/hero', requireLogin, upload.single('heroPhoto'), async (req, res) => {
    try {
        const updateData = { ...req.body };
        let currentHero = await Hero.findOne();

        if (req.file) {
            // If a new photo is uploaded, send it to ImgBB
            const formData = new FormData();
            formData.append('image', req.file.buffer, { filename: req.file.originalname });
            const response = await axios.post(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, formData, { headers: formData.getHeaders() });
            updateData.photoUrl = response.data.data.url;
        } else {
            // Keep the existing photo if no new one is uploaded
            updateData.photoUrl = currentHero ? currentHero.photoUrl : '/images/logo.jpeg';
        }

        const updatedHero = await Hero.findOneAndUpdate({}, updateData, { new: true, upsert: true });
        res.json(updatedHero);
    } catch (error) {
        console.error('Error updating hero section:', error.response ? error.response.data : error.message);
        res.status(400).json({ message: 'Error updating hero section.' });
    }
});

// --- Server Start ---
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));