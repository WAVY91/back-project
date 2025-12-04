const express = require('express')
const app = express()
const PORT = process.env.PORT
const dotenv = require('dotenv')
dotenv.config()
const mongoose = require('mongoose')
const MONGO_URI = process.env.MONGO_URI
app.set('view engine', 'ejs')
const Donor = require('./models/donor.models')
const donorRoutes = require('./routes/donor.routes')
const adminRoutes = require('./routes/admin.routes')
const ngoRoutes = require('./routes/ngo.routes')
const contactRoutes = require('./routes/contact.routes')
const cors = require('cors')

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}))

app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.use('/donor', donorRoutes)
app.use('/admin', adminRoutes)
app.use('/ngo', ngoRoutes)
app.use('/contact', contactRoutes)

mongoose
    .connect(MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log(err));

app.listen(4500, () => console.log('Server is running on port 4500'))
