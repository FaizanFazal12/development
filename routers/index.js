const auth = require("../middlewares/auth");
const express = require('express');

const authController = require('../controllers/authController')

const router = express.Router();


router.post('/login',authController.LoginUser);

router.post('/register',authController.SignupUser);

  
module.exports = router