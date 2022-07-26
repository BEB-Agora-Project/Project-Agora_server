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

const {makeBoard, getBoards} = require("../controllers/board");
const {uploadPost} = require("../middleware/multer");
const {isAuthorized} = require("../middleware/webToken");


//board create
//boardPost
router.post("/:board_id", isAuthorized,writeBoardPost);
router.post("/post/image", isAuthorized,uploadPost, uploadPostImage);
router.get("/:board_id/popular", getPopularBoardPosts);
router.get("/post/recent", getAllBoardRecents);
router.get("/:board_id", getBoardPosts);
router.post("/post/:post_id", isAuthorized,voteBoardPost);
router.get("/post/:post_id", getBoardPost);
router.put("/post/:post_id", isAuthorized,editBoardPost);
router.delete("/post/:post_id", isAuthorized,deleteBoardPost);
router.post("/", isAuthorized,makeBoard);
router.get("/", getBoards);


//boardComment
router.post("/post/:post_id/comment", isAuthorized,writeBoardPostComment);
router.put("/post/comment/:comment_id", isAuthorized,editBoardPostComment);
router.delete("/post/comment/:comment_id", isAuthorized,deleteBoardPostComment);
router.post("/post/comment/:comment_id", isAuthorized,voteBoardComment);
router.get("/post/:post_id/comment", getBoardPostComments);

//boardCommentReply
router.post("/post/:comment_id/reply", isAuthorized,writeBoardPostCommentReply);
router.put("/post/reply/:reply_id", isAuthorized,editBoardPostCommentReply);
router.delete("/post/reply/:reply_id", isAuthorized,deleteBoardPostCommentReply);

module.exports = router;
