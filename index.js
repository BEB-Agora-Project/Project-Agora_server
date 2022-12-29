const express = require("express");
const cron = require("node-cron");
const timezone = { timezone: "Asia/Tokyo" };
const models = require("./models/index.js");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const accountRoutes = require("./routes/account");
const boardRoutes = require("./routes/board");
const debateRoutes = require("./routes/debate");
const marketRoutes = require("./routes/market");
const devRoutes = require("./routes/dev");
const errorHandler = require("./errors/error-handler");
//테스트용 모듈입니다
const { scheduleArchive, scheduleSettlement } = require("./utils/scheduler");
const {
  tokenReward,
  nftBuyEvent,
  archived,
} = require("./utils/contractSubscribe");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger/swagger-output.json");
const https = require("https");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 8080;

//이벤트 서브스크라이버의 내용을 전달하기위한 전역변수
global.nft = false;

nftBuyEvent();

// api 통신을 위한 모듈 설정
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// cors 에러를 잡아주기 위한 설정 -> 여기서는 로컬의 3000번 포트에대한 접근을 허용함
app.use(
  cors({
    origin: 'https://agora-psi.vercel.app/',
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
// 라우터 연결
app.use("/account", accountRoutes);
app.use("/board", boardRoutes);
app.use("/market", marketRoutes);
app.use("/debate", debateRoutes);
app.use("/dev", devRoutes);
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerFile));

//무조건 에러설정은 라우팅 설정 밑에넣는다
app.use(errorHandler);

models.sequelize
  .sync()
  .then(() => {
    console.log(" DB 연결 성공");
  })
  .catch((err) => {
    console.log("연결 실패");
    console.log(err);
  });

//스케줄러
cron.schedule(
  "0 10 3 * * *",
  () => {
    scheduleSettlement();
  },
  timezone
);
cron.schedule(
  "0 0 3 * * *",
  () => {
    scheduleArchive();
  },
  timezone
);
// 서버 구동
if (fs.existsSync("./key.pem") && fs.existsSync("./cert.pem")) {
  const privateKey = fs.readFileSync(__dirname + "/key.pem", "utf8");
  const certificate = fs.readFileSync(__dirname + "/cert.pem", "utf8");
  const credentials = { key: privateKey, cert: certificate };
  let server = https.createServer(credentials, app);
  server.listen(PORT, async () => {
    console.log(`      🚀 HTTPS Server is starting on ${PORT}`);
  });
} else {
  app.listen(PORT, async () => {
    //이벤트 듣기

    console.log("you don't have cert.pem, key.pem!!");
    console.log(`      🚀 HTTP Server is starting on ${PORT}`);
  });
}
