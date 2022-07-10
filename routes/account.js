const router = require('express').Router();
const {signIn,signOut,signUp,editPassword} = require('../controllers/account');





router.post('/signin', signIn);
router.post('/signup', signUp);
router.get('/signout', signOut);
router.post("/editPassword", editPassword);



module.exports = router;