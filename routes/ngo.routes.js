const express = require("express")
const router = express.Router()
const {postNGOSignUp, postNGOSignIn, getNGOs} = require("../controllers/ngo.controllers")

router.post("/signup", postNGOSignUp)
router.post("/signin", postNGOSignIn)
router.get("/all", getNGOs)

module.exports = router
