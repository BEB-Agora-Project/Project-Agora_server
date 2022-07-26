const router = require("express").Router();
const {uploadProfile} = require("../middleware/multer")
const {isAuthorized} = require("../middleware/webToken")
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
router.put("/password", isAuthorized,editPassword);
router.post("/password",findPassword);
router.put("/username", isAuthorized,editUsername);
router.post("/auth", authEmail);
router.post("/profile", isAuthorized,uploadProfile,setProfileImage);
router.post("/badge",isAuthorized,setBadge);
router.get("/mypage", isAuthorized,getMyPage);
router.get("/myinfo",isAuthorized ,getMyInfo);

module.exports = router;
