const router = require("express").Router();
const {uploadProfile} = require("../middleware/multer")
const {
    signIn,
    signUp,
    editPassword,
    editUsername,
    authEmail,
    findPassword,
    getMyPage,
    getMyInfo,
    setProfileImage,
    setBadge
} = require("../controllers/account");

router.post("/signin", signIn);
router.post("/signup", signUp);
router.put("/password", editPassword);
router.post("/password", findPassword);
router.put("/username", editUsername);
router.post("/auth", authEmail);
router.post("/profile", uploadProfile,setProfileImage);
router.post("/badge",setBadge);
router.get("/mypage", getMyPage);
router.get("/myinfo", getMyInfo);

module.exports = router;
