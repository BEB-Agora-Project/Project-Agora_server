const router = require("express").Router();
const {
  writeBoardPost,
  editBoardPost,
  getBoardPost,
  getBoardPosts,
  deleteBoardPost,
  voteBoardPost,
  getPopularBoardPosts,
} = require("../controllers/boardPost");

const {
  writeBoardPostComment,
  editBoardPostComment,
  deleteBoardPostComment,
  getBoardPostComments,
  voteBoardComment
} = require("../controllers/boardComment");

const { makeBoard, getBoards } = require("../controllers/board");

//board create
//boardPost
router.post("/:board_id", writeBoardPost);
router.get("/:board_id/popular", getPopularBoardPosts);
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

module.exports = router;
