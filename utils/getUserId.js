const User = require("../models/user");

async function getUserId(req) {
  const decoded = await isAuthorized(req);
  if (!decoded) return false;
  const userInfo = await User.findOne({
    where: { id: decoded.id },
  });
  const userId = userInfo.id;
  return userId;
}

module.exports = { getUserId };
