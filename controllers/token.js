require("dotenv").config();
const getUserId = require("../utils/getUserId");
const User = require("../models/user");

module.exports = {
  myToken: async (req, res) => {
    //db에서 조회하기

    const userId = await getUserId(req);
    const userInfo = await User.findByPk(userId);

    const expectedToken = userInfo.expected_token; //스네이크케이스로 다 수정
    const currentToken = userInfo.current_token;

    const returnObj = {
      expectedToken: expectedToken,
      currentToken: currentToken,
    };

    return res.send(returnObj);
  },
};
