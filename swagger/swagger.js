const swaggerAutogen = require("swagger-autogen")();

const doc = {
    info: {
        title: "Agora 팀 서버 API",
        description: "서버에서 제공하는 API 정보",
    },
    servers: [
        {
            url: 'https://localhost:4000',
        },
    ],
    host: "localhost:4000",
    schemes: ["https"],
    securityDefinitions: {
        bearerAuth: {
            type: 'https',
            scheme: 'authorization',
            in: 'header',
            bearerFormat: 'JWT',
        },
    },
};

const outputFile = "./swagger-output.json";
const endpointsFiles = [
    "../index.js"
];

swaggerAutogen(outputFile, endpointsFiles, doc);