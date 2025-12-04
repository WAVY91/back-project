const mongoose = require('mongoose')

let donorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Full Name is required!'],
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

    createdAt: {
        type: Date,
        default: Date.now,
    }
})

module.exports = mongoose.model('donor', donorSchema)