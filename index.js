const express = require("express");
const models = require("./models/index.js");
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const accountRoutes = require('./routes/account');
const boardRoutes = require('./routes/board');
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger/swagger-output.json");
const https = require("https");
const fs = require("fs");
const app = express();
const PORT = process.env.HTTPS_PORT;

// api 통신을 위한 모듈 설정
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// cors 에러를 잡아주기 위한 설정 -> 여기서는 로컬의 3000번 포트에대한 접근을 허용함
app.use(
    cors({
        origin: ['https://localhost:3000'],
        credentials: true,
        methods: ['GET', 'POST']
    })
);
// 라우터 연결
app.use('/account', accountRoutes);
app.use('/board', boardRoutes);
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerFile));

// 데이터베이스 연결 및 HTTPS 서버 실행
models.sequelize.sync().then( () => {
    console.log(" DB 연결 성공");
    if (fs.existsSync('./key.pem') && fs.existsSync('./cert.pem')) {
        const privateKey = fs.readFileSync(__dirname + '/key.pem', 'utf8');
        const certificate = fs.readFileSync(__dirname + '/cert.pem', 'utf8');
        const credentials = { key: privateKey, cert: certificate };
        let server = https.createServer(credentials, app);
        server.listen(PORT, async () => {
            console.log(`      🚀 HTTPS Server is starting on ${PORT}`);
        })
    } else {
        app.listen(PORT, async () => {
            console.log("you don't have cert.pem, key.pem!!")
            console.log(`      🚀 HTTP Server is starting on ${PORT}`);
        })
    }
}).catch(err => {
    console.log("연결 실패");
    console.log(err);
})

