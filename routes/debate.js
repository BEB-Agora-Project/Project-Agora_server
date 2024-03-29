const router = require("express").Router();
const {
  writeDebateComment,
  voteDebateComment,
  editDebateComment,
  getDebatePostCommentList,
} = require("../controllers/debateComment");
const {
  writeDebatePost,
  voteDebatePost,
  editDebatePost,
  getDebatePostList,
  getDebatePost,
  getPopularDebatePostList,
} = require("../controllers/debatePost");

const {
  writeBoardPostCommentReply,
  editBoardPostCommentReply,
  deleteBoardPostCommentReply,
} = require("../controllers/boardCommentReply");

const { getArchiveList, getCurrentDebate } = require("../controllers/debate");

//comment
router.post("/post/:post_id/comment", writeDebateComment);
router.get("/post/:post_id/comment/list", getDebatePostCommentList); // post의 커멘트 get
router.post("/post/comment/:comment_id", voteDebateComment); //up,down vote 인지 확인 ?vote=up
router.put("/post/comment/:comment_id", editDebateComment);

//post
router.get("/post/popular", getPopularDebatePostList);
router.post("/post", writeDebatePost);
router.post("/post/:post_id", voteDebatePost); //up,down vote 인지 확인 ?vote=up
router.put("/post/:post_id", editDebatePost);
router.get("/post/list", getDebatePostList); //?opinion 에 따라 해당 포스트 리턴
router.get("/post/:post_id", getDebatePost);

//boardCommentReply
router.post("/post/:comment_id/reply", writeBoardPostCommentReply);
router.put("/post/reply/:reply_id", editBoardPostCommentReply);
router.delete("/post/reply/:reply_id", deleteBoardPostCommentReply);

//debate
router.get("/archive", getArchiveList);
router.get("/", getCurrentDebate);

module.exports = router;
