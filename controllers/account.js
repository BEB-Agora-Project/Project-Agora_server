const {User, Auth} = require('../models');
const {generateAccessToken, sendAccessToken, isAuthorized} = require('../middleware/webToken')
const {asyncWrapper} = require("../errors/async");
const CustomError = require("../errors/custom-error");
const StatusCodes = require("http-status-codes")
const Caver = require('caver-js')
const caver = new Caver('https://api.baobab.klaytn.net:8651/')
// const {mintToken} = require('./smartContract')
const bcrypt = require('bcrypt');
const {sendMailAuth} = require('../middleware/mailer');

module.exports = {

    signIn: asyncWrapper(async (req, res, next) => {

        if (req.body.email === undefined || req.body.password === undefined) {
            throw new CustomError("올바르지 않은 파라미터 값입니다.", StatusCodes.CONFLICT);
        }
        const {email, password} = req.body
        const userInfo = await User.findOne({
            where: {email: email},
        });
        const validPassword = await bcrypt.compare(password, userInfo.password);
        if (!validPassword) {
            throw new CustomError("존재하지 않는 사용자입니다.", StatusCodes.NOT_FOUND);
        }
        if (!userInfo.is_auth) {
            throw new CustomError("이메일 인증을 완료해 주세요!", StatusCodes.UNAUTHORIZED);
        } else {
            const payload = {
                id: userInfo.id,
                email: userInfo.email,
                username: userInfo.username,
                address: userInfo.address,
                privateKey: userInfo.private_key,
                currentToken: userInfo.current_token,
                expectedToken: userInfo.expected_token
            }
            if (userInfo.today_login === false) {
                // await mintToken(userInfo.address, 5);
                await userInfo.update({
                    today_login: true,
                })
            }
            res.status(StatusCodes.OK).send({message: "ok", data: {accessToken: await generateAccessToken(payload)}})
        }
    }),
    signUp: asyncWrapper(async (req, res, next) => {
        if (req.body.email === undefined || req.body.password === undefined || req.body.username === undefined) {
            throw new CustomError("올바르지 않은 파라미터 값입니다.", StatusCodes.CONFLICT);
        } else {
            const {email, username, password} = req.body
            const salt = await bcrypt.genSalt(10);
            const cryptPassword = bcrypt.hashSync(password, salt); //비밀번호 암호화
            const foundAccount = await User.findOne({
                where: {email: req.body.email}
            });
            if (foundAccount) throw new CustomError("이미 존재하는 아이디 입니다.", StatusCodes.CONFLICT);
            const account = caver.klay.accounts.create()
            const newBody = {
                email,
                username,
                password: cryptPassword,
                address: account.address,
                private_key: account.privateKey
            };
            const newAccount = new User(newBody);
            await newAccount.save();
            const authCode = Math.random().toString(36).slice(2);
            await Auth.create({
                code: authCode,
                email: req.body.email
            });
            await sendMailAuth(req.body.email, authCode)
            res.status(StatusCodes.OK).send({message: "이메일을 발송하였습니다. 인증을 완료해주세요!"});
        }
    }),

    authEmail: asyncWrapper(async (req, res, next) => {
        if (req.query.authCode === undefined) {
            throw new CustomError("올바르지 않은 파라미터 값입니다.", StatusCodes.CONFLICT);
        } else {
            const auth = await Auth.findOne({
                where: {code: req.query.authCode}
            });
            if (!auth) {
                throw new CustomError("인증이 완료되었거나, 존재하지 않는 사용자입니다.", StatusCodes.NOT_FOUND);
            } else {
                const authAccount = await User.findOne({
                    where: {email: auth.email}
                });
                await authAccount.update({
                    is_auth: true
                });
                await auth.destroy()
                res.status(StatusCodes.OK).send({message: "인증이 완료되었습니다."});
            }
        }
    }),


    editPassword: asyncWrapper(async (req, res, next) => {
        if (req.body.password === undefined) {
            throw new CustomError("올바르지 않은 파라미터 값입니다.", StatusCodes.CONFLICT);
        } else {
            const decoded = await isAuthorized(req)
            const salt = await bcrypt.genSalt(10);
            const cryptPassword = bcrypt.hashSync(req.body.password, salt);
            const userInfo = await User.findOne({
                where: {id: decoded.id},
            });
            await userInfo.update({
                password: cryptPassword
            });
            res.status(StatusCodes.OK).send({message: "ok"});
        }
    }),

    editUsername: asyncWrapper(async (req, res, next) => {
        if (req.body.username === undefined) {
            throw new CustomError("올바르지 않은 파라미터 값입니다.", StatusCodes.CONFLICT);
        } else {
            const decoded = await isAuthorized(req)
            console.log(decoded.id)
            const userInfo = await User.findOne({
                where: {id: decoded.id},
            });
            await userInfo.update({
                username: req.body.username
            });
            res.status(StatusCodes.OK).send({message: "ok"});
        }
    }),

}



