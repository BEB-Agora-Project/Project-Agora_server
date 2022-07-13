const router = require('express').Router();
const {signIn,signUp,editPassword,editUsername,authEmail,findPassword} = require('../controllers/account');





router.post('/signin', signIn);
router.post('/signup', signUp);
router.put("/password", editPassword);
router.post("/password", findPassword);
router.put("/username", editUsername);
router.post("/auth", authEmail);


module.exports = router;