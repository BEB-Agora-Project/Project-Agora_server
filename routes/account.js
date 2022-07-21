const router = require("express").Router();
const {upload} = require("../middleware/multer")
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
router.post("/profile", upload,setProfileImage);
router.get("/mypage", getMyPage);
router.get("/myinfo", getMyInfo);

module.exports = router;
