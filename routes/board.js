const router = require('express').Router();
const {write,getWritingById,getAllWriting,commentToWriting,edit,deleteToWriting} = require('../controllers/board');



router.post('/write', write);
router.get("/:id", getWritingById);
router.get("/", getAllWriting);
router.post("/comment/:id", commentToWriting);
router.post("/edit/:id", edit);
router.post("/delete/:id", deleteToWriting);






module.exports = router;