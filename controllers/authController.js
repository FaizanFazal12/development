import Joi from 'joi';
import bcrypt from 'bcrypt';
import jwtService from '../services/jwtservice';
import User from '../models/User';

const authController = {
  async LoginUser(req, res, next) {
    const { email, password } = req.body;

    // Validate input
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    });

    const { error } = schema.validate({ email, password });
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

      const accessToken = jwtService.generateAccessToken({ id: user._id, email: user.email });
      const refreshToken = jwtService.generateRefreshToken({ id: user._id, email: user.email });

      res.cookie('accessToken', accessToken, { httpOnly: true });
      res.cookie('refreshToken', refreshToken, { httpOnly: true });
      res.json({ message: 'Login successful', user: { id: user._id, email: user.email } });
    } catch (err) {
      next(err);
    }
  },

  async SignupUser(req, res, next) {
    const { email, password, name } = req.body;

    // Validate input
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      name: Joi.string().min(2).required(),
    });

    const { error } = schema.validate({ email, password, name });
    if (error) {
      return next(error); 
    }

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return next({ status: 400, message: 'User already exists' });
      }

      // Hash the password before saving the user
      const hashedPassword = await bcrypt.hash(password, 10); // Hashing with a salt rounds of 10
      const newUser = new User({ email, password: hashedPassword, name });
      await newUser.save();

      res.status(201).json({ message: 'User registered successfully', user: { id: newUser._id, email: newUser.email } });
    } catch (err) {
      next(err); // Pass any other errors to the error handler
    }
  },
};

export default authController;
