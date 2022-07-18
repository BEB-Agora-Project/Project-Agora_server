require("dotenv").config();
const { sign, verify } = require("jsonwebtoken");

module.exports = {
  generateAccessToken: async (data) => {
    return await sign(data, process.env.ACCESS_SECRET, { expiresIn: "30d" });
  },
  // sendAccessToken: (res, accessToken) => {
  //     return res.cookie("jwt",accessToken);
  // },
  isAuthorized: async (req) => {
    if (req.headers["authorization"]) {
      const token = req.headers["authorization"].split("Bearer ")[1];
      try {
        const verifyResult = verify(token, process.env.ACCESS_SECRET);
        return verifyResult;
      } catch (err) {
        console.log(err);
      }
    } else {
      return false;
    }
  },
};
