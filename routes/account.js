const router = require("express").Router();
const multer  = require('multer')
const upload = multer({
  dest: __dirname+'/uploads/', // 이미지 업로드 경로
})
const {
  signIn,
  signUp,
  editPassword,
  editUsername,
  authEmail,
  findPassword,
  getMyPage,
  getMyInfo,
  setProfileImage
} = require("../controllers/account");

router.post("/signin", signIn);
router.post("/signup", signUp);
router.put("/password", editPassword);
router.post("/password", findPassword);
router.put("/username", editUsername);
router.post("/auth", authEmail);
router.post("/profile", upload.single('image'),setProfileImage);
router.get("/mypage", getMyPage);
router.get("/myinfo", getMyInfo);

module.exports = router;
