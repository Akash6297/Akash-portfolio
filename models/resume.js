const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    personalInfo: {
        name: { type: String, required: true },
        title: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, default: '' },
        address: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        github: { type: String, default: '' },
        photoUrl: { type: String, default: '' },
        photoShape: { type: String, default: 'square' },
        summary: { type: String, required: true }
    },
    experience: [{
        company: { type: String, required: true },
        position: { type: String, required: true },
        startDate: { type: String, required: true },
        endDate: { type: String, required: true },
        description: { type: String, required: true }
    }],
    education: [{
        institution: { type: String, required: true },
        degree: { type: String, required: true },
        startDate: { type: String, required: true },
        endDate: { type: String, required: true },
        scoreType: { type: String, default: 'CGPA' },
        scoreValue: { type: String, default: '' },
        description: { type: String, default: '' }
    }],
    skills: { type: [String], default: [] },
    languages: [{
        language: { type: String, required: true },
        proficiency: { type: String, required: true }
    }],
    projects: [{
        name: { type: String, required: true },
        description: { type: String, required: true },
        link: { type: String, default: '' }
    }],
    sections: [{
        id: { type: String, required: true },
        name: { type: String, required: true },
        order: { type: Number, required: true },
        isVisible: { type: Boolean, default: true }
    }],
    selectedTemplate: { type: String, default: 'classic' }
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
