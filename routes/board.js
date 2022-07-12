const router = require('express').Router();
const {write,getWritingById,getAllWriting,commentToWriting,edit,deleteToWriting,deleteToComment} = require('../controllers/board');



router.post('/posts', write);
router.get("/posts/:id", getWritingById);
router.get("/posts", getAllWriting);
router.post("/comments", commentToWriting); // todo: body에 postId를 전달
router.put("/posts/:id", edit);
router.delete("/posts/:id", deleteToWriting);
router.delete("/comments/:id", deleteToComment);





module.exports = router;