const express = require('express')
const app = express()
const PORT = process.env.PORT || 4500
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
const campaignRoutes = require('./routes/campaign.routes')
const donationRoutes = require('./routes/donation.routes')
const cors = require('cors')

const corsOptions = {
    origin: ['https://front-project-phi.vercel.app', 'http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(cors(corsOptions))

app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.use('/donor', donorRoutes)
app.use('/admin', adminRoutes)
app.use('/ngo', ngoRoutes)
app.use('/contact', contactRoutes)
app.use('/donation', donationRoutes)
app.use('/campaign', campaignRoutes)

mongoose
    .connect(MONGO_URI)
    .then(() => console.log("MongoDB is connected."))
    .catch((err) => console.log(err));

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
