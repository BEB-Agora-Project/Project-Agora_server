const User = require("../models/user");

export async function getUserId(req) {
  const decoded = await isAuthorized(req);
  const userInfo = await User.findOne({
    where: { id: decoded.id },
  });
  const userId = userInfo.id;
  return userId;
}
