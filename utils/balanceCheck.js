const User = require("../models/user");

// 요청을 처리하기전에 currentToken + expectedToekn이 요청에 필요한 토큰양보다 많은지 확인하는 함수

async function balanceCheck(userId) {
  const userInfo = await User.findByPk(userId);
  const currentToken = userInfo.currentToken;
  const expectedToken = userInfo.expectedToken;
  const currentTokenBalance = currentToken + expectedToken;

  return currentTokenBalance;
}

module.exports = { balanceCheck };
