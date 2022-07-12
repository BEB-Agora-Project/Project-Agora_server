const router = require('express').Router();
const {writePost,getPost,getPostsList,writeComment,editPost,editComment,deletePost,deleteComment} = require('../controllers/board');



router.post('/posts', writePost);
router.get("/posts/:id", getPost);
router.get("/posts", getPostsList);
router.post("/comments", writeComment);
router.put("/posts/:id", editPost);
router.put("/comments/:id", editComment);
router.delete("/posts/:id", deletePost);
router.delete("/comments/:id", deleteComment);





module.exports = router;