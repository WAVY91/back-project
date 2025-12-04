const mongoose = require('mongoose')

let contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required!'],
        trim: true,
    },

    email: {
        type: String,
        required: [true, 'Email is required!'],
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
        trim: true,
    },

    subject: {
        type: String,
        required: [true, 'Subject is required!'],
        trim: true,
    },

    message: {
        type: String,
        required: [true, 'Message is required!'],
        minlength: [10, 'Message must be at least 10 characters'],
    },

    attended: {
        type: Boolean,
        default: false,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },

    attendedAt: {
        type: Date,
        default: null,
    }
})

module.exports = mongoose.model('contact', contactSchema)
