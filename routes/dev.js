const router = require("express").Router();

const {
  pushNewDebateQueue,
  pushNewDebateDB,
} = require("../controllers/debate");

const { serverInit } = require("../controllers/dev");

router.post("/newDebate", pushNewDebateQueue); //새 예정 토론 등록, 개발용입니다
router.post("/newDebateDB", pushNewDebateDB);
router.post("/serverInit", serverInit);
module.exports = router;
