const router = require('express').Router();
const {signIn,signUp,editPassword,editUsername} = require('../controllers/account');





router.post('/signin', signIn);
router.post('/signup', signUp);
router.put("/password", editPassword);
router.put("/username", editUsername);



module.exports = router;