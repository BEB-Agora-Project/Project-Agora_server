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
const {isAuthorized} = require("../middleware/webToken");

//comment
router.post("/post/:post_id/comment", isAuthorized,writeDebateComment);
router.get("/post/:post_id/comment/list", getDebatePostCommentList); // post의 커멘트 get
router.post("/post/comment/:comment_id", isAuthorized,voteDebateComment); //up,down vote 인지 확인 ?vote=up
router.put("/post/comment/:comment_id", isAuthorized,editDebateComment);

//post
router.get("/post/popular", getPopularDebatePostList);
router.post("/post", isAuthorized,writeDebatePost);
router.post("/post/:post_id", isAuthorized,voteDebatePost); //up,down vote 인지 확인 ?vote=up
router.put("/post/:post_id", isAuthorized,editDebatePost);
router.get("/post/list", getDebatePostList); //?opinion 에 따라 해당 포스트 리턴
router.get("/post/:post_id", getDebatePost);

//boardCommentReply
router.post("/post/:comment_id/reply", isAuthorized,writeBoardPostCommentReply);
router.put("/post/reply/:reply_id", isAuthorized,editBoardPostCommentReply);
router.delete("/post/reply/:reply_id", isAuthorized,deleteBoardPostCommentReply);

//debate
router.get("/archive", getArchiveList);
router.get("/", getCurrentDebate);

module.exports = router;
