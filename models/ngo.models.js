const mongoose = require('mongoose')

let ngoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Contact person name is required!'],
        trim: true,
    },

    email: {
        type: String,
        required: [true, 'Email is required!'],
        unique: [true, 'Email has been used, please choose another email address'],
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
        trim: true,
    },

    password: {
        type: String,
        required: true,
    },

    ngoName: {
        type: String,
        required: [true, 'Organization name is required!'],
        trim: true,
    },

    ngoDescription: {
        type: String,
        required: [true, 'Organization description is required!'],
    },

    status: {
        type: String,
        enum: ['pending', 'active', 'rejected'],
        default: 'pending',
    },

    verified: {
        type: Boolean,
        default: false,
    },

    registrationDoc: {
        type: String,
        default: 'pending_verification',
    },

    createdAt: {
        type: Date,
        default: Date.now,
    }
})

module.exports = mongoose.model('ngo', ngoSchema)
