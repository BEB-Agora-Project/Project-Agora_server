require("dotenv").config();
const {sign, verify} = require("jsonwebtoken");
const CustomError = require("../errors/custom-error");
const {StatusCodes} = require("http-status-codes");
const {asyncWrapper} = require("../errors/async");

module.exports = {
    generateAccessToken: async (data) => {
        return await sign(data, process.env.ACCESS_SECRET, {expiresIn: "30d"});
    },
    isAuthorized: asyncWrapper(async (req,res,next) => {
        if (req.headers["authorization"]) {
            const token = req.headers["authorization"].split("Bearer ")[1];
            if (verify(token, process.env.ACCESS_SECRET)) {
                req.userId = verify(token, process.env.ACCESS_SECRET).id
                return next()
            } else {
                throw new CustomError("로그인이 필요합니다.", StatusCodes.UNAUTHORIZED)
            }
        } else {
            throw new CustomError("로그인이 필요합니다.", StatusCodes.UNAUTHORIZED)
        }
    })
}
;
