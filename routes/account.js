const router = require('express').Router();
const {signIn,signOut,signUp} = require('../controllers/account');




router.post('/signin', signIn);
router.post('/signup', signUp);
router.get('/signout', signOut);



module.exports = router;