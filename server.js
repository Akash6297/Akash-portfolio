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
const EmailTemplate = require('./models/emailTemplate');
const Booking = require('./models/booking');
const Resume = require('./models/resume');

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


// --- Helper Function to Build Email HTML ---
const buildEmailHtml = (templateConfig, variables) => {
    const { primaryColor, headerText, bodyText, footerText, showSocials, githubLink, linkedinLink } = templateConfig;

    // Replace placeholders in the body text first
    let personalizedBody = bodyText;
    for (const [key, value] of Object.entries(variables)) {
        personalizedBody = personalizedBody.replace(new RegExp(`{{${key}}}`, 'g'), value.replace(/\n/g, '<br>'));
    }

    // Generate social links block if enabled
    const socialsHTML = showSocials ? `
        <div style="text-align: center; margin-top: 20px;">
            ${githubLink ? `<a href="${githubLink}" style="margin: 0 10px; text-decoration: none;">GitHub</a>` : ''}
            ${linkedinLink ? `<a href="${linkedinLink}" style="margin: 0 10px; text-decoration: none;">LinkedIn</a>` : ''}
        </div>` : '';

    return `
        <div style="font-family: 'Poppins', sans-serif; background-color: #f1f5f9; padding: 40px;">
            <div style="max-width: 600px; margin: auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                <div style="background-color: ${primaryColor}; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">${headerText}</h1>
                </div>
                <div style="padding: 30px; font-size: 16px; line-height: 1.7;">
                    ${personalizedBody}
                </div>
                <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b;">
                    <p>${footerText}</p>
                    ${socialsHTML}
                </div>
            </div>
        </div>
    `;
};


// --- NEW: Middleware to check if user is Super Admin ---
const isSuperAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.session.userId);
        if (user && user.email === process.env.SUPER_ADMIN_EMAIL) {
            next(); // User is the super admin, proceed
        } else {
            res.status(403).json({ message: 'Forbidden: Super admin access required.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error during authorization.' });
    }
};

// --- NEW: Route to check current user's status ---
app.get('/api/admin/status', requireLogin, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).select('username email');
        const isSuper = user.email === process.env.SUPER_ADMIN_EMAIL;
        res.json({ username: user.username, isSuperAdmin: isSuper });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get user status.' });
    }
});


// NEW: Get all users (for Super Admin to see)
app.get('/api/admin/users', requireLogin, isSuperAdmin, async (req, res) => {
    try {
        const users = await User.find().select('username email'); // Don't send passwords
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users.' });
    }
});

// NEW: Update any user's details (for Super Admin)
app.put('/api/admin/users/:id', requireLogin, isSuperAdmin, async (req, res) => {
    try {
        const { username, email, newPassword } = req.body;
        const userToUpdate = await User.findById(req.params.id);
        if (!userToUpdate) return res.status(404).json({ message: 'User not found.' });

        userToUpdate.username = username;
        userToUpdate.email = email;
        if (newPassword && newPassword.length >= 8) {
            userToUpdate.password = await bcrypt.hash(newPassword, 10);
        }
        await userToUpdate.save();
        res.json({ success: true, message: `User ${username} updated successfully.` });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user.' });
    }
});

// NEW: Delete a user (for Super Admin)
app.delete('/api/admin/users/:id', requireLogin, isSuperAdmin, async (req, res) => {
    try {
        const userToDelete = await User.findById(req.params.id);
        // Prevent Super Admin from deleting themselves
        if (userToDelete.email === process.env.SUPER_ADMIN_EMAIL) {
            return res.status(400).json({ message: 'Cannot delete the super admin account.' });
        }
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'User deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user.' });
    }
});

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

// =======================================================
// --- RESUME API ROUTES (NEW) ---
// =======================================================

// Public route to get the latest resume data
app.get('/api/resume', async (req, res) => {
    try {
        let resume = await Resume.findOne();
        if (!resume) {
            // Provide a default empty structure if none exists
            resume = new Resume({
                personalInfo: { name: 'Akash Mandal', title: 'Web Developer', email: 'mail@example.com', summary: 'Passionate developer.' },
                experience: [],
                education: [],
                skills: [],
                projects: []
            });
            await resume.save();
        }
        res.json(resume);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch resume data', error: error.message });
    }
});

// Protected Admin route to update the resume data
app.put('/api/admin/resume', requireLogin, upload.single('resumePhoto'), async (req, res) => {
    try {
        const updateData = { ...req.body };
        
        // Handle parsing for arrays if they come as strings
        if (typeof updateData.skills === 'string') {
            try {
                updateData.skills = JSON.parse(updateData.skills);
            } catch (e) {
                updateData.skills = updateData.skills.split(',').map(s => s.trim()).filter(s => s);
            }
        }
        
        if (updateData.experience && typeof updateData.experience === 'string') updateData.experience = JSON.parse(updateData.experience);
        if (updateData.education && typeof updateData.education === 'string') updateData.education = JSON.parse(updateData.education);
        if (updateData.projects && typeof updateData.projects === 'string') updateData.projects = JSON.parse(updateData.projects);
        if (updateData.languages && typeof updateData.languages === 'string') updateData.languages = JSON.parse(updateData.languages);
        if (updateData.sections && typeof updateData.sections === 'string') updateData.sections = JSON.parse(updateData.sections);
        if (updateData.typography && typeof updateData.typography === 'string') updateData.typography = JSON.parse(updateData.typography);


        if (req.file) {
            const formData = new FormData();
            formData.append('image', req.file.buffer, { filename: req.file.originalname });
            
            const response = await axios.post(
                `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
                formData,
                { headers: formData.getHeaders() }
            );
            
            if (!updateData.personalInfo) updateData.personalInfo = {};
            if (typeof updateData.personalInfo === 'string') updateData.personalInfo = JSON.parse(updateData.personalInfo);
            
            updateData.personalInfo.photoUrl = response.data.data.url;
        } else if (updateData.personalInfo && typeof updateData.personalInfo === 'string') {
            updateData.personalInfo = JSON.parse(updateData.personalInfo);
        }

        const updatedResume = await Resume.findOneAndUpdate(
            {}, 
            updateData, 
            { new: true, upsert: true }
        );
        res.json({ success: true, message: 'Resume updated successfully', resume: updatedResume });
    } catch (error) {
        console.error('Error updating resume:', error);
        res.status(400).json({ message: 'Failed to update resume', error: error.message });
    }
});


// =======================================================
// --- BOOKING SYSTEM ROUTES (NEW) ---
// =======================================================

// 1. Fetch available slots for a given date
app.get('/api/available-slots', async (req, res) => {
    try {
        const { date } = req.query; // YYYY-MM-DD
        if (!date) return res.status(400).json({ message: 'Date is required' });

        // Generate all possible slots (10:00 AM to 5:00 PM, 30 min intervals)
        const allSlots = [
            "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", 
            "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", 
            "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", 
            "04:00 PM", "04:30 PM", "05:00 PM"
        ];

        // Find bookings for this date that are NOT rejected
        const existingBookings = await Booking.find({ 
            date, 
            status: { $ne: 'rejected' } 
        });

        const bookedTimes = existingBookings.map(b => b.time);
        
        // Filter out booked times
        const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));
        
        res.json({ availableSlots });
    } catch (error) {
        console.error('Error fetching available slots:', error);
        res.status(500).json({ message: 'Failed to fetch slots' });
    }
});

// 2. Submit a new booking
app.post('/api/bookings', async (req, res) => {
    try {
        const { name, email, date, time, message } = req.body;
        
        // Basic validation
        if (!name || !email || !date || !time) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Check for double booking just in case
        const existing = await Booking.findOne({ date, time, status: { $ne: 'rejected' } });
        if (existing) {
            return res.status(400).json({ success: false, message: 'This slot is already booked.' });
        }

        const newBooking = new Booking({ name, email, date, time, message: message || 'No message provided' });
        await newBooking.save();

        // Optional: Send Email Notification to Admin
        try {
            const gmailTransporter = nodemailer.createTransport({
                host: 'smtp.gmail.com', port: 465, secure: true,
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
            });

            await gmailTransporter.sendMail({
                from: `"Portfolio Booking System" <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_USER,
                replyTo: email,
                subject: `New Meeting Request from ${name}`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px;">
                        <h2>New Meeting Request</h2>
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Date:</strong> ${date}</p>
                        <p><strong>Time:</strong> ${time}</p>
                        <p><strong>Message:</strong><br>${message || 'None'}</p>
                        <p style="margin-top: 20px;"><a href="${process.env.PORT ? 'http://localhost:' + process.env.PORT : 'https://akash-portfolio-n7lc.onrender.com'}/admin/dashboard.html">View in Admin Panel</a></p>
                    </div>`
            });
        } catch (emailErr) {
            console.error('Failed to send admin notification email for booking:', emailErr);
            // We don't fail the booking if email fails
        }

        res.status(201).json({ success: true, message: 'Booking requested successfully! We will confirm shortly.' });
    } catch (error) {
        console.error('Error saving booking:', error);
        res.status(500).json({ success: false, message: 'Failed to save booking' });
    }
});

// 3. Admin: Get all bookings
app.get('/api/admin/bookings', requireLogin, async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ date: 1, time: 1 }); // Sort by date then time
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch bookings.' });
    }
});

// 4. Admin: Update booking status (confirm/reject/complete)
app.put('/api/admin/bookings/:id/status', requireLogin, async (req, res) => {
    try {
        const { status, meetingLink } = req.body;
        if (!['pending', 'confirmed', 'rejected', 'completed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        booking.status = status;
        await booking.save();

        // Optional: Send email to user if confirmed or rejected
        try {
            const gmailTransporter = nodemailer.createTransport({
                host: 'smtp.gmail.com', port: 465, secure: true,
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
            });

            let subject = '';
            let htmlContent = '';

            if (status === 'confirmed') {
                subject = `Meeting Confirmed: Akash Mandal`;
                htmlContent = `
                    <div style="font-family: sans-serif; padding: 20px;">
                        <h2>Meeting Confirmed!</h2>
                        <p>Hi ${booking.name},</p>
                        <p>Your meeting on <strong>${booking.date}</strong> at <strong>${booking.time}</strong> has been confirmed.</p>
                        ${meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : '<p>The meeting link will be shared shortly.</p>'}
                        <p>Looking forward to speaking with you!</p>
                        <p>- Akash Mandal</p>
                    </div>`;
            } else if (status === 'rejected') {
                subject = `Meeting Declined: Akash Mandal`;
                htmlContent = `
                    <div style="font-family: sans-serif; padding: 20px;">
                        <h2>Meeting Update</h2>
                        <p>Hi ${booking.name},</p>
                        <p>Unfortunately, I to decline the meeting requested for <strong>${booking.date}</strong> at <strong>${booking.time}</strong> due to scheduling conflicts.</p>
                        <p>Please feel free to request another time slot on my portfolio.</p>
                        <p>- Akash Mandal</p>
                    </div>`;
            }

            if (subject) {
                await gmailTransporter.sendMail({
                    from: `"Akash Mandal" <${process.env.EMAIL_USER}>`,
                    to: booking.email,
                    subject: subject,
                    html: htmlContent
                });
            }

        } catch (emailErr) {
             console.error('Failed to notify user about status change:', emailErr);
        }

        res.json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update booking status.' });
    }
});

// 5. Admin: Delete a booking
app.delete('/api/admin/bookings/:id', requireLogin, async (req, res) => {
    try {
        await Booking.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Booking deleted.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete booking.' });
    }
});

// =======================================================
// --- CONTACT FORM ROUTE (REBUILT FOR DYNAMIC TEMPLATES) ---
// =======================================================
app.post('/send-message', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        await new Message({ name, email, message }).save();

        const adminTemplateDoc = await EmailTemplate.findOne({ templateName: 'adminNotification' });
        const userTemplateDoc = await EmailTemplate.findOne({ templateName: 'userConfirmation' });

        if (!adminTemplateDoc || !userTemplateDoc) throw new Error('Email templates not found.');

        const adminConfig = JSON.parse(adminTemplateDoc.htmlContent);
        const userConfig = JSON.parse(userTemplateDoc.htmlContent);

        const adminHtml = buildEmailHtml(adminConfig, { name, email, message: `<b>From:</b> ${name} (${email})<br><br>${message}` });
        const userHtml = buildEmailHtml(userConfig, { name, message });

        const adminSubject = adminTemplateDoc.subject.replace('{{name}}', name);
        const userSubject = userTemplateDoc.subject.replace('{{name}}', name);
        
        const gmailTransporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // Use SSL
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, // Your Gmail App Password
            },
        });
        await gmailTransporter.sendMail({ from: `"${name}" <${process.env.EMAIL_USER}>`, to: process.env.EMAIL_USER, replyTo: email, subject: adminSubject, html: adminHtml });
        await gmailTransporter.sendMail({ from: `"Akash Mandal" <${process.env.EMAIL_USER}>`, to: email, subject: userSubject, html: userHtml });

        return res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error in contact form process:', error);
        return res.status(500).json({ success: false, message: 'An error occurred.' });
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

// --- NEW: PROTECTED CRUD API ROUTES FOR EMAIL TEMPLATES ---
app.get('/api/admin/email-templates', requireLogin, async (req, res) => {
    try {
        const templates = await EmailTemplate.find();
        res.json(templates);
    } catch (error) { res.status(500).json({ message: 'Failed to fetch templates.' }); }
});

app.put('/api/admin/email-templates/:id', requireLogin, async (req, res) => {
    try {
        const { subject, htmlContent } = req.body;
        const updatedTemplate = await EmailTemplate.findByIdAndUpdate(req.params.id, { subject, htmlContent }, { new: true });
        res.json(updatedTemplate);
    } catch (error) { res.status(400).json({ message: error.message }); }
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
    try {
        const { replyMessage } = req.body;
        const originalMessage = await Message.findById(req.params.id);
        if (!originalMessage) return res.status(404).json({ message: 'Original message not found.' });
        
        const replyTemplateDoc = await EmailTemplate.findOne({ templateName: 'adminReply' });
        if (!replyTemplateDoc) throw new Error('Reply template not found.');
        
        const replyConfig = JSON.parse(replyTemplateDoc.htmlContent);
        const replyHtml = buildEmailHtml(replyConfig, { name: originalMessage.name, replyMessage, originalMessage: `<b>Original Message from you:</b><br><i>"${originalMessage.message}"</i>` });
        const replySubject = replyTemplateDoc.subject.replace('{{subject}}', originalMessage.message.substring(0, 20));

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

        // Use global replace for all placeholders here as well
        
        await gmailTransporter.sendMail({ from: `"Akash Mandal" <${process.env.EMAIL_USER}>`, to: originalMessage.email, subject: replySubject, html: replyHtml });
        
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
        const data = await Experience.find().lean();
        // Sort by the start date parsed from dateRange
        data.sort((a, b) => {
            const parseDate = (dateStr) => {
                if (!dateStr) return new Date(0);
                // Handle "Present" or "Current"
                if (dateStr.toLowerCase().includes('present') || dateStr.toLowerCase().includes('current')) {
                    dateStr = dateStr.replace(/present|current/i, new Date().toLocaleDateString('en-US', {month: 'short', year: 'numeric'}));
                }
                const parts = dateStr.split('-');
                if (parts.length > 0) {
                    const startStr = parts[0].trim();
                    const d = new Date(startStr);
                    if (!isNaN(d.getTime())) return d;
                    
                    // Try parsing mm/yyyy or mm-yyyy
                    const mdParts = startStr.split(/[\/\-]/);
                    if (mdParts.length === 2) {
                        return new Date(`${mdParts[1]}-${mdParts[0]}-01`);
                    }
                }
                return new Date(0);
            };
            return parseDate(b.dateRange) - parseDate(a.dateRange);
        });
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
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
}

// Export for Vercel Serverless
module.exports = app;