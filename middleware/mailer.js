const nodemailer = require('nodemailer');
require('dotenv').config();


module.exports = {
    sendMailAuth:async (sendEmail, authCode) => {
        const smtpTransport = nodemailer.createTransport({
            service: "Naver",
            auth: {
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        const mailOptions = {
            from: process.env.NODEMAILER_USER,
            to: sendEmail,
            subject: "[Agora]인증 관련 이메일 입니다",
            html: `<p>가입확인 버튼을 누르시면 Agora 가입 인증이 완료됩니다.</p><br/>`+
                    `<form action="https://127.0.0.1:4000/account/auth?authCode=${authCode}" method="POST">
                    <button>가입확인</button></form>`

        };
        await smtpTransport.sendMail(mailOptions, (error, responses) => {
            return !error;
        });
    },
    sendNewPassword:async (sendEmail, newPassword) => {
        const smtpTransport = nodemailer.createTransport({
            service: "Naver",
            auth: {
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        const mailOptions = {
            from: process.env.NODEMAILER_USER,
            to: sendEmail,
            subject: "[Agora]비밀번호 찾기 관련 이메일 입니다",
            test: `임시 비밀번호는 "${newPassword}" 입니다.`

        };
        await smtpTransport.sendMail(mailOptions, (error, responses) => {
            return !error;
        });
    }
}