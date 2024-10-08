const JWTService = require('../services/jwtservice');
const User = require('../models/user');

const auth = async (req, res, next) => {
    try{

    const {refreshToken, accessToken} = req.cookies;


    if (!refreshToken || !accessToken){
        const error = {
            status: 401,
            message: 'Unauthorized'
        }

        return next(error)
    }

    let _id;

    try{
        _id = JWTService.verifyAccessToken(accessToken ,refreshToken)._id;

       
    }
    catch(error){
        return next(error);
    }

    let user;

    try{
        user = await User.findOne({_id: _id});
     
    }
    catch(error){
        return next(error);
    }

    
    req.user = user;

    next();
    }
    catch(error){
        return next(error);
    }
}

module.exports = auth;