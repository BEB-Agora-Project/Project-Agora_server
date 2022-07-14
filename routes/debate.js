const router = require("express").Router();
const {
  debateCommentWrite,
  debateCommentVote,
  debateCommentEdit,
  debatePostComments,
} = require("../controllers/debateComment");
const {
  debatePostWrite,
  debatePostVote,
  debatePostEdit,
  debatePosts,
  debatePost,
  popularDebatePosts,
} = require("../controllers/debatePost");

const {
  archiveList,
  currentDebate,
  newDebatePush,
  newDebateDB,
} = require("../controllers/debate");

//comment
router.post("/post/:post_id/comment", debateCommentWrite);
router.post("/post/:post_id/comment/:comment_id", debateCommentVote); //up,down vote 인지 확인 ?vote=up
router.put("/post/:post_id/comment/:comment_id", debateCommentEdit);
router.get("/post/:post_id/comment/list", debatePostComments); // post의 커멘트 get

//post
router.get("/post/popular", popularDebatePosts);
router.post("/post", debatePostWrite);
router.post("/post/:post_id", debatePostVote); //up,down vote 인지 확인 ?vote=up
router.put("/post/:post_id", debatePostEdit);
router.get("/post/list", debatePosts); //?opinion 에 따라 해당 포스트 리턴
router.get("/post/:post_id", debatePost);

//debate
router.get("/archive", archiveList);
router.get("/", currentDebate);
router.post("/newDebate", newDebatePush); //새 예정 토론 등록, 개발용입니다
router.post("/newDebateDB", newDebateDB);

module.exports = router;
