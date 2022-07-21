const { User } = require("../models");
const { isAuthorized } = require("../middleware/webToken");

async function getUserId(req) {
  const decoded = await isAuthorized(req);
  if (!decoded) return false;
  const userInfo = await User.findOne({
    where: { id: decoded.id },
  });
  if (!userInfo) return false;
  const userId = userInfo.id;
  return userId;
}

module.exports = { getUserId };
