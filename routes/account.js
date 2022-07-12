const router = require('express').Router();
const {signIn,signUp,editPassword,editUsername,authEmail} = require('../controllers/account');





router.post('/signin', signIn);
router.post('/signup', signUp);
router.put("/password", editPassword);
router.put("/username", editUsername);
router.post("/auth", authEmail);


module.exports = router;