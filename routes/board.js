const router = require("express").Router();
const {
    writeBoardPost,
    editBoardPost,
    getBoardPost,
    getBoardPosts,
    deleteBoardPost,
    voteBoardPost,
    getPopularBoardPosts,
    uploadPostImage,
    getAllBoardRecents
} = require("../controllers/boardPost");

const {
    writeBoardPostComment,
    editBoardPostComment,
    deleteBoardPostComment,
    getBoardPostComments,
    voteBoardComment,
} = require("../controllers/boardComment");

const {
    writeBoardPostCommentReply,
    editBoardPostCommentReply,
    deleteBoardPostCommentReply,
} = require("../controllers/boardCommentReply");

const {makeBoard, getBoards, getBoardRecents} = require("../controllers/board");
const {uploadPost} = require("../middleware/multer");


//board create
//boardPost
router.post("/:board_id", writeBoardPost);
router.post("/post/image", uploadPost, uploadPostImage);
router.get("/:board_id/popular", getPopularBoardPosts);
router.get("/post/recent", getAllBoardRecents);
router.get("/:board_id", getBoardPosts);
router.post("/post/:post_id", voteBoardPost);
router.get("/post/:post_id", getBoardPost);
router.put("/post/:post_id", editBoardPost);
router.delete("/post/:post_id", deleteBoardPost);
router.post("/", makeBoard);
router.get("/", getBoards);


//boardComment
router.post("/post/:post_id/comment", writeBoardPostComment);
router.put("/post/comment/:comment_id", editBoardPostComment);
router.delete("/post/comment/:comment_id", deleteBoardPostComment);
router.post("/post/comment/:comment_id", voteBoardComment);
router.get("/post/:post_id/comment", getBoardPostComments);

//boardCommentReply
router.post("/post/:comment_id/reply", writeBoardPostCommentReply);
router.put("/post/reply/:reply_id", editBoardPostCommentReply);
router.delete("/post/reply/:reply_id", deleteBoardPostCommentReply);

module.exports = router;
