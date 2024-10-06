const jwtService = require("../services/jwtservice");

const auth = (req, res, next) => {
  const token = req.cookies.accessToken; 

  if (!token) {
    return res.status(401).json({ message: 'No token provided, unauthorized' });
  }

  try {
    const decoded = jwtService.verifyAccessToken(token);
    if(decoded){
      req.user = decoded; 
      next();
    }
    
  } catch (error) {
    res.status(403).json({ message: 'Invalid token, access denied' });
  }
};

module.exports = auth;
