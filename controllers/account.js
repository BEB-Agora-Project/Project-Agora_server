const {
  User,
  Auth,
  Post,
  MarketItem,
  Board,
  Comment,
  Normalitemlist,
  Normalitem,
  Nftitem,
} = require("../models");
const {
  generateAccessToken,
  sendAccessToken,
  isAuthorized,
} = require("../middleware/webToken");
const { getUserId } = require("../utils/getUserId");
const { asyncWrapper } = require("../errors/async");
const CustomError = require("../errors/custom-error");
const StatusCodes = require("http-status-codes");
const Caver = require("caver-js");
const caver = new Caver("https://api.baobab.klaytn.net:8651/");
const bcrypt = require("bcrypt");
const { sendMailAuth, sendNewPassword } = require("../utils/mailer");
const axios = require("axios");

module.exports = {
  signIn: asyncWrapper(async (req, res, next) => {
    if (req.body.email === undefined || req.body.password === undefined) {
      throw new CustomError(
        "올바르지 않은 파라미터 값입니다.",
        StatusCodes.CONFLICT
      );
    }
    const { email, password } = req.body;
    const userInfo = await User.findOne({
      where: { email: email },
    });
    if (!userInfo) {
      throw new CustomError("존재하지 않는 계정입니다.", StatusCodes.NOT_FOUND);
    }
    const validPassword = await bcrypt.compare(password, userInfo.password);
    if (!validPassword) {
      throw new CustomError(
        "비밀번호가 잘못되었습니다.",
        StatusCodes.NOT_FOUND
      );
    }
    if (!userInfo.is_auth) {
      throw new CustomError(
        "이메일 인증을 완료해 주세요!",
        StatusCodes.UNAUTHORIZED
      );
    } else {
      const payload = {
        id: userInfo.id,
        email: userInfo.email,
        username: userInfo.username,
        address: userInfo.address,
        privateKey: userInfo.private_key,
        currentToken: userInfo.current_token,
        expectedToken: userInfo.expected_token,
      };
      if (userInfo.today_login === false) {
        // await mintToken(userInfo.address, 5);
        await userInfo.update({
          today_login: true,
        });
      }
      res.status(StatusCodes.OK).send({
        message: "ok",
        data: { accessToken: await generateAccessToken(payload) },
      });
    }
  }),
  signUp: asyncWrapper(async (req, res, next) => {
    if (
      req.body.email === undefined ||
      req.body.password === undefined ||
      req.body.username === undefined
    ) {
      throw new CustomError(
        "올바르지 않은 파라미터 값입니다.",
        StatusCodes.CONFLICT
      );
    } else {
      const { email, username, password } = req.body;
      const salt = await bcrypt.genSalt(10);
      const cryptPassword = bcrypt.hashSync(password, salt); //비밀번호 암호화
      const foundAccount = await User.findOne({
        where: { email: req.body.email },
      });
      if (foundAccount)
        throw new CustomError(
          "이미 존재하는 아이디 입니다.",
          StatusCodes.CONFLICT
        );
      const account = caver.klay.accounts.create();
      const newBody = {
        email,
        username,
        password: cryptPassword,
        address: account.address,
        private_key: account.privateKey,
      };
      const newAccount = new User(newBody);
      await newAccount.save();
      const authCode = Math.random().toString(36).slice(2);
      await Auth.create({
        code: authCode,
        email: req.body.email,
      });
      await sendMailAuth(req.body.email, authCode);
      res
        .status(StatusCodes.OK)
        .send({ message: "이메일을 발송하였습니다. 인증을 완료해주세요!" });
    }
  }),

  authEmail: asyncWrapper(async (req, res, next) => {
    if (req.query.authCode === undefined) {
      throw new CustomError(
        "올바르지 않은 파라미터 값입니다.",
        StatusCodes.CONFLICT
      );
    } else {
      const auth = await Auth.findOne({
        where: { code: req.query.authCode },
      });
      if (!auth) {
        throw new CustomError(
          "인증이 완료되었거나, 존재하지 않는 사용자입니다.",
          StatusCodes.NOT_FOUND
        );
      } else {
        const authAccount = await User.findOne({
          where: { email: auth.email },
        });
        await authAccount.update({
          is_auth: true,
        });
        await auth.destroy();
        res.status(StatusCodes.OK).send({ message: "인증이 완료되었습니다." });
      }
    }
  }),

  editPassword: asyncWrapper(async (req, res, next) => {
    if (req.body.password === undefined) {
      throw new CustomError(
        "올바르지 않은 파라미터 값입니다.",
        StatusCodes.CONFLICT
      );
    } else {
      const decoded = await isAuthorized(req);
      const salt = await bcrypt.genSalt(10);
      const cryptPassword = bcrypt.hashSync(req.body.password, salt);
      const userInfo = await User.findOne({
        where: { id: decoded.id },
      });
      await userInfo.update({
        password: cryptPassword,
      });
      res.status(StatusCodes.OK).send({ message: "ok" });
    }
  }),

  findPassword: asyncWrapper(async (req, res, next) => {
    if (req.body.email === undefined || req.body.username === undefined) {
      throw new CustomError(
        "올바르지 않은 파라미터 값입니다.",
        StatusCodes.CONFLICT
      );
    } else {
      const userInfo = await User.findOne({
        where: { email: req.body.email, username: req.body.username },
      });
      if (!userInfo) {
        throw new CustomError(
          "잘못된 유저이름이거나, 존재하지 않는 사용자입니다.",
          StatusCodes.NOT_FOUND
        );
      } else {
        const tempPassword = Math.random().toString(36).slice(2);
        const salt = await bcrypt.genSalt(10);
        const cryptPassword = bcrypt.hashSync(tempPassword, salt);
        await userInfo.update({
          password: cryptPassword,
        });
        await sendNewPassword(req.body.email, tempPassword);
        res.status(StatusCodes.OK).send({
          message: "등록하신 이메일로 임시 비밀번호가 발송되었습니다.",
        });
      }
    }
  }),

  editUsername: asyncWrapper(async (req, res, next) => {
    if (req.body.username === undefined) {
      throw new CustomError(
        "올바르지 않은 파라미터 값입니다.",
        StatusCodes.CONFLICT
      );
    } else {
      const decoded = await isAuthorized(req);
      const userInfo = await User.findOne({
        where: { id: decoded.id },
      });
      await userInfo.update({
        username: req.body.username,
      });
      res.status(StatusCodes.OK).send({ message: "ok" });
    }
  }),
  getMyPage: asyncWrapper(async (req, res) => {
    const userId = await getUserId(req);
    if (!userId) {
      throw new CustomError(
        "로그인되지 않은 사용자입니다",
        StatusCodes.UNAUTHORIZED
      );
    }
    const attributes = [
      "username",
      "email",
      "address",
      "current_token",
      "expected_token",
      "today_vote_count",
      "created_at",
    ];
    const userInfo = await User.findOne({
      where: { id: userId },
      attributes: attributes,
    });

    const myPosts = await Post.findAll({
      where: { user_id: userId },
      attributes: ["id", "title", "hit", "up", "created_at"],
      order: [["id", "DESC"]],
      include: [{ model: Comment, attributes: ["id"] }],
    });

    const myItem = await Normalitemlist.findAll({
      where: { user_id: userId },
      attributes: ["user_id"],
      include: [{ model: Normalitem, attributes: ["id", "itemname"] }],
    });

    const nfts = await Nftitem.findAll({
      where: { user_id: userId },
    });
    const arr = await Promise.all(
      nfts.map(async (el) => {
        const res = await axios.get(el.dataValues.token_uri);
        const metaData = res.data;
        return metaData;
      })
    );

    const myNFT = [];
    for (let i = 0; i < nfts.length; i++) {
      myNFT.push(Object.assign(arr[i], nfts[i].dataValues));
    }

    const myBoard = await Board.findAll({ where: { user_id: userId } });

    const returnObj = {
      userinfo: userInfo,
      myposts: myPosts,
      myitems: myItem,
      mynft: myNFT,
      myboards: myBoard,
    };

    return res.status(200).send(returnObj);
  }),
  getMyInfo: asyncWrapper(async (req, res) => {
    const userId = await getUserId(req);
    if (!userId) {
      throw new CustomError(
        "로그인되지 않은 사용자입니다",
        StatusCodes.UNAUTHORIZED
      );
    }
    const userInfo = await User.findOne({
      where: { id: userId },
      attributes: ["username", "email", "current_token", "expected_token"],
    });

    const myItem = await Normalitemlist.findAll({
      where: { user_id: userId },
      attributes: ["user_id"],
      include: [{ model: Normalitem, attributes: ["id", "itemname"] }],
    });

    const nfts = await Nftitem.findAll({
      where: { user_id: userId },
    });
    const arr = await Promise.all(
      nfts.map(async (el) => {
        const res = await axios.get(el.dataValues.token_uri);
        const metaData = res.data;
        return metaData;
      })
    );

    const myNFT = [];
    for (let i = 0; i < nfts.length; i++) {
      myNFT.push(Object.assign(arr[i], nfts[i].dataValues));
    }

    const result = {
      userId: userId,
      username: userInfo.username,
      email: userInfo.email,
      token: userInfo.expected_token + userInfo.current_token,
      nft: myNFT,
      item: myItem,
    };

    return res.status(200).send(result);
  }),
};
