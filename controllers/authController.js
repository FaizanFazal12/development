const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwtService = require('../services/jwtservice');
const User = require('../models/user');

const authController = {
  async LoginUser(req, res, next) {
    const { email, password } = req.body;

    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    });

    const { error } = schema.validate({ email, password }, { abortEarly: false });
    if (error) {
      return next(error); 
    }

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return next({ status: 401, message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return next({ status: 401, message: 'Invalid credentials' });
      }

      const accessToken = jwtService.signAccessToken({ _id: user._id, email: user.email });
      const refreshToken = jwtService.signRefreshToken({ _id: user._id, email: user.email });

      await jwtService.storeRefreshToken(refreshToken, user._id);

      res.cookie('accessToken', accessToken, { httpOnly: true });
      res.cookie('refreshToken', refreshToken, { httpOnly: true });
      res.json({ message: 'Login successful', user: { id: user._id, email: user.email  ,accessToken ,refreshToken} });
    } catch (err) {
      next(err);
    }
  },

  async SignupUser(req, res, next) {
    const { email, password, name, shippingAddress } = req.body; 

    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      name: Joi.string().min(2).required(),
      shippingAddress: Joi.object({ 
        address: Joi.string(),
        city: Joi.string(),
        postalCode: Joi.string(),
        country: Joi.string(),
      }).optional(),
    });

    const { error } = schema.validate({ email, password, name, shippingAddress } , { abortEarly: false });
    if (error) {
      return next(error); 
    }

    try {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return next({ status: 400, message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10); 

      // Create a new user object
      const user = new User({ email, password: hashedPassword, name, shippingAddress });

      
      await user.save();


      const accessToken = jwtService.signAccessToken({ _id: user._id, email: user.email });
      const refreshToken = jwtService.signRefreshToken({ _id: user._id, email: user.email });

      await jwtService.storeRefreshToken(refreshToken, user._id);
      res.cookie('accessToken', accessToken, { httpOnly: true });
      res.cookie('refreshToken', refreshToken, { httpOnly: true });


      res.status(201).json({ message: 'User registered successfully', user: { id: user._id, email: user.email ,refreshToken ,accessToken } });
    } catch (err) {
      next(err);
    }
  },
};

// Export the controller
module.exports = authController;
