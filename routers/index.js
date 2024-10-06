const { default: authController } = require("../controllers/authController");
const auth = require("../middlewares/auth");

const express = requie('express');

const router = express.Router();


router.post('/login',authController.LoginUser);

router.post('/register',authController.SignupUser);

  
export default router