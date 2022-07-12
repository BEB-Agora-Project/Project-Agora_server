const router = require('express').Router();
const {signIn,signUp,editPassword} = require('../controllers/account');





router.post('/signin', signIn);
router.post('/signup', signUp);
router.put("/password", editPassword);



module.exports = router;