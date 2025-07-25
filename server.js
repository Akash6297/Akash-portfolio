// server.js (Complete Version with All Routes)

const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const multer = require('multer'); // <-- NEW
const axios = require('axios'); // <-- NEW
const FormData = require('form-data'); // <-- NEW
const bcrypt = require('bcryptjs');
require('dotenv').config();



// --- Models ---
const Project = require('./models/project');
const Service = require('./models/service');
const User = require('./models/user');
const Experience = require('./models/experience'); 
const About = require('./models/about');
const Hero = require('./models/hero');

// --- Multer Setup (for handling file uploads) ---
const storage = multer.memoryStorage(); // Store files in memory to upload to ImgBB
const upload = multer({ storage: storage });

// --- App & Port ---
const app = express();
const PORT = process.env.PORT || 3000;

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// --- Middleware ---
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.json());

// --- Session Middleware ---
app.use(session({
    secret: process.env.SESSION_SECRET || 'a_very_secret_key_that_is_long_and_random',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));

// --- Auth Middleware (to protect admin routes) ---
const requireLogin = (req, res, next) => {
    if (!req.session.userId) {
        // For API requests, return 401 Unauthorized. For page loads, redirect.
        if (req.originalUrl.startsWith('/api/admin')) {
             return res.status(401).json({ message: 'Unauthorized' });
        }
        return res.redirect('/admin/login.html');
    }
    next();
};

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

// server.js

app.post('/send-message', (req, res) => {
    const { name, email, message } = req.body;

    // --- Modern HTML Email Template ---
    const htmlTemplate = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #1e293b; color: white; padding: 20px;">
                <h1 style="margin: 0; text-align: center;">New Message from Your Portfolio</h1>
            </div>
            <div style="padding: 20px;">
                <h2 style="color: #0d9488;">Contact Details</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 8px; font-weight: bold;">Name:</td>
                        <td style="padding: 8px;">${name}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 8px; font-weight: bold;">Email:</td>
                        <td style="padding: 8px;"><a href="mailto:${email}">${email}</a></td>
                    </tr>
                </table>
                <h2 style="color: #0d9488; margin-top: 20px;">Message</h2>
                <p style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${message}</p>
            </div>
            <div style="background-color: #f1f5f9; color: #666; text-align: center; padding: 10px; font-size: 12px;">
                <p>This email was sent from your portfolio contact form.</p>
            </div>
        </div>
    `;

    // --- Nodemailer Transporter (unchanged) ---
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // --- Mail Options with Reply-To (CRITICAL CHANGE) ---
    const mailOptions = {
        from: `"Portfolio Inquiry" <${process.env.EMAIL_USER}>`, // FROM YOUR OWN EMAIL
        to: process.env.EMAIL_USER,                             // TO YOUR OWN EMAIL
        replyTo: email,                                         // ** THE KEY FOR EASY REPLIES **
        subject: `New Portfolio Message from ${name}`,
        html: htmlTemplate,                                     // Use the new HTML template
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ success: false, message: 'Something went wrong.' });
        }
        res.status(200).json({ success: true, message: 'Your message has been sent successfully!' });
    });
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


// --- PROTECTED ADMIN PAGES ---
app.get('/admin/dashboard.html', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin/dashboard.html'));
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