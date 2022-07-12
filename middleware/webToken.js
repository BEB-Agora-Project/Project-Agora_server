require('dotenv').config();
const {sign, verify} = require('jsonwebtoken');

module.exports={
    generateAccessToken: async (data) => {
        return await sign(data, process.env.ACCESS_SECRET, {expiresIn: '1d'});
    },
    // sendAccessToken: (res, accessToken) => {
    //     return res.cookie("jwt",accessToken);
    // },
    isAuthorized: async (req) => {
        console.log(req.headers)
        if(req.headers['authorization']){
            const token =req.headers['authorization'].split('Bearer ')[1]
            console.log(token)
            return verify(token, process.env.ACCESS_SECRET);
        }else{
            return false
        }
    }
}