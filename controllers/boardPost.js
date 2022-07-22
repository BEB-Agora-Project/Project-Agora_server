const { Post, User, Comment, Board, Recommend } = require("../models");

const { asyncWrapper } = require("../errors/async");
const CustomError = require("../errors/custom-error");
const StatusCodes = require("http-status-codes");
const { getUserId } = require("../utils/getUserId");
const { boardPostReward } = require("../config/rewardConfig");
const { pagingSize } = require("../config/pagingConfig");
const { NOT_ACCEPTABLE, BAD_REQUEST } = require("http-status-codes");
const { paging, postSize } = require("../utils/paging");
const { textFilter } = require("../utils/filtering");
const sequelize = require("sequelize");
const board = require("./board");
const Op = sequelize.Op;
module.exports = {
  writeBoardPost: asyncWrapper(async (req, res) => {
    const { title, content } = req.body;
    const boardId = req.params.board_id;

    if (title === undefined || content === undefined) {
      throw new CustomError(
        "올바르지 않은 파라미터 값입니다.",
        StatusCodes.BAD_REQUEST
      );
    }

    const userId = await getUserId(req);
    if (!userId) {
      throw new CustomError("로그인이 필요합니다.", StatusCodes.UNAUTHORIZED);
    }

    if (await textFilter(title)) {
      throw new CustomError(
        "게시글 제목에 사용할 수 없는 문자열이 포함되어 있습니다.",
        StatusCodes.CONFLICT
      );
    }

    if (await textFilter(content)) {
      throw new CustomError(
        "게시글 내용에 사용할 수 없는 문자열이 포함되어 있습니다.",
        StatusCodes.CONFLICT
      );
    }
    const currentBoard = await Board.findOne({
      where: {
        id: boardId,
      },
    });
    if (!currentBoard) {
      throw new CustomError(
        "존재하지 않는 게시판입니다.",
        StatusCodes.METHOD_NOT_ALLOWED
      );
    }

    const newPost = await Post.create({
      opinion: 3,
      title: title,
      content: content,
      user_id: userId,
      board_id: boardId,
      debate_id: null,
    });
    const userInfo = await User.findByPk(userId);

    let expectedToken = userInfo.expected_token + boardPostReward;

    await userInfo.update({
      expected_token: expectedToken,
    });

    res
      .status(StatusCodes.CREATED)
      .json({ status: "success", data: { postId: newPost.id } });
  }),

  editBoardPost: asyncWrapper(async (req, res) => {
    const { title, content } = req.body;
    const postId = req.params.post_id;
    if (title === undefined || content === undefined) {
      throw new CustomError(
        "올바르지 않은 파라미터 값입니다.",
        StatusCodes.BAD_REQUEST
      );
    }

    const userId = await getUserId(req);
    if (!userId) {
      throw new CustomError("로그인이 필요합니다", StatusCodes.UNAUTHORIZED);
    }

    if (!postId) {
      throw new CustomError(
        "올바르지 않은 파라미터입니다.",
        StatusCodes.BAD_REQUEST
      );
    }

    const postData = await Post.findOne({
      where: { id: postId },
    });

    if (!postData) {
      throw new CustomError(
        `글번호 ${postId} 가 존재하지 않습니다.`,
        StatusCodes.NOT_FOUND
      );
    }

    if (postData.user_id !== userId) {
      throw new CustomError(
        `올바른 사용자가 아닙니다`,
        StatusCodes.METHOD_NOT_ALLOWED
      );
    }

    if (await textFilter(title)) {
      throw new CustomError(
        "게시글 제목에 사용할 수 없는 문자열이 포함되어 있습니다.",
        StatusCodes.CONFLICT
      );
    }

    if (await textFilter(content)) {
      throw new CustomError(
        "게시글 내용에 사용할 수 없는 문자열이 포함되어 있습니다.",
        StatusCodes.CONFLICT
      );
    }
    await postData.update({
      title: title,
      content: content,
    });

    res.status(StatusCodes.OK).send("OK");
  }),
  getBoardPost: asyncWrapper(async (req, res) => {
    //전달받은 id를 가진 writing을 찾아옴
    const postId = req.params.post_id;
    if (postId === undefined) {
      throw new CustomError(
        "올바른 파라미터가 아닙니다",
        StatusCodes.BAD_REQUEST
      );
    }

    const postData = await Post.findByPk(postId, {
      include: [
        { model: User, attributes: ["username", "profile_image", "badge"] },
        { model: Board, attributes: ["boardname"] },
      ],
    });

    //해당 id를 가진 writing 없으면 에러 응답
    if (!postData) {
      throw new CustomError(
        `글번호 ${req.params.id} 가 존재하지 않습니다.`,
        StatusCodes.BAD_REQUEST
      );
    }
    await postData.increment("hit");

    res.status(200).json({
      status: "success",
      data: postData,
    });
  }),

  getBoardPosts: asyncWrapper(async (req, res) => {
    const boardId = req.params.board_id;
    const page = req.query.page;
    const keyword = req.query.keyword;
    if (!boardId) {
      throw new CustomError(
        "올바른 파라미터가 아닙니다",
        StatusCodes.BAD_REQUEST
      );
    }

    let result;
    let count;

    if (!keyword) {
      count = await Post.count({ where: { board_id: boardId } });
      result = await Post.findAll({
        where: { board_id: boardId },
        order: [["id", "DESC"]],
        include: [
          { model: User, attributes: ["username", "profile_image", "badge"] },
          { model: Comment, attributes: ["id"] },
          { model: Board, attributes: ["boardname"] },
        ],
        offset: paging(page, pagingSize),
        limit: pagingSize,
      });
    } else {
      count = await Post.count({ where: { board_id: boardId } });
      result = await Post.findAll({
        where: { board_id: boardId, title: { [Op.like]: "%" + keyword + "%" } },
        order: [["id", "DESC"]],
        include: [
          { model: User, attributes: ["username", "profile_image", "badge"] },
          { model: Comment, attributes: ["id"] },
          { model: Board, attributes: ["boardname"] },
        ],
        offset: paging(page, pagingSize),
        limit: pagingSize,
      });
    }
    // const writings = await Post.findAll({
    //   where: { board_id: boardId },
    //   order: [["id", "DESC"]],
    //   include: [
    //     { model: User, attributes: ["username"] },
    //     { model: Board, attributes: ["boardname"] },
    //     {
    //       model: Comment,
    //       attributes: ["id"],
    //     },
    //   ],
    //   offset: paging(req.query.page, pagingSize),
    //   limit: pagingSize,
    // });

    // Array에 map을 돌 때 콜백함수가 비동기면 일반적인 방법으로는 구현이 안됨
    // 그래서 Promise.all을 사용함
    // const data = await Promise.all(
    //   writings.map(
    //     async ({ id, title, created_at, updated_at, hit, user_id }) => {
    //       const { username } = await User.findOne({
    //         where: { id: user_id },
    //       });
    //       const comments = await Comment.findAndCountAll({
    //         where: { post_id: id },
    //       });
    //       const commentsCount = comments.count;
    //       return {
    //         id,
    //         title,
    //         username,
    //         hit,
    //         commentsCount,
    //         created_at,
    //         updated_at,
    //       };
    //     }
    //   )
    // );
    res.status(200).json({
      status: "success",
      data: result,
      count: count,
    });
  }),
  deleteBoardPost: asyncWrapper(async (req, res) => {
    const postId = req.params.post_id;
    if (postId === undefined) {
      throw new CustomError("올바르지 않은 파라미터입니다", BAD_REQUEST);
    }
    const postData = await Post.findByPk(postId);

    const userId = await getUserId(req);
    if (!userId) {
      throw new CustomError(
        "로그인되지 않은 사용자입니다",
        StatusCodes.UNAUTHORIZED
      );
    }

    if (!postData) {
      throw new CustomError(
        `글번호 ${postId} 가 존재하지 않습니다.`,
        StatusCodes.NOT_FOUND
      );
    }

    if (postData.user_id !== userId) {
      throw new CustomError(
        `게시글 작성자가 아닙니다.`,
        StatusCodes.METHOD_NOT_ALLOWED
      );
    }
    // db에 저장
    await Post.destroy({
      where: { id: postId },
    });
    // await mintToken(userInfo.address, 1);
    res.status(StatusCodes.ACCEPTED).send({ message: "ok" });
  }),
  voteBoardPost: asyncWrapper(async (req, res) => {
    const userId = await getUserId(req);
    if (!userId) {
      throw new CustomError(
        "로그인되지 않은 사용자입니다",
        StatusCodes.UNAUTHORIZED
      );
    }
    const vote = req.query.vote;
    const postId = req.params.post_id;
    const postInfo = await Post.findByPk(postId);

    if (!postInfo) {
      throw new CustomError(
        `글번호 ${postId} 가 존재하지 않습니다.`,
        StatusCodes.NOT_FOUND
      );
    }
    const isRecommend = await Recommend.findOne({
      where: { user_id: userId, post_id: postId },
    });
    if (isRecommend) {
      console.log(isRecommend);
      throw new CustomError("이미 추천/반대 하였습니다.", StatusCodes.CONFLICT);
    }
    let curVote;
    await Recommend.create({
      state: vote,
      post_id: postId,
      user_id: userId,
    });

    if (vote === "up") {
      curVote = postInfo.up;
      curVote++;
      await postInfo.update({
        up: curVote,
      });
      return res.status(200).send({ curVote: curVote });
    } else if (vote === "down") {
      curVote = postInfo.down;
      curVote++;
      await postInfo.update({
        down: curVote,
      });
      return res.status(200).send({ curVote: curVote });
    } else {
      return res.send(405).send("그런 요청은 없다");
    }
  }),
  getPopularBoardPosts: async (req, res) => {
    const boardId = req.params.board_id;
    const page = req.query.opinion;
    if (!boardId) {
      throw new CustomError(
        "올바른 파라미터가 아닙니다",
        StatusCodes.BAD_REQUEST
      );
    }
    const result = await Post.findAll({
      where: { board_id: boardId, up: { [Op.gte]: 10 } },
      order: [
        ["id", "DESC"],
        ["up", "DESC"],
      ],
      include: [
        { model: User, attributes: ["username", "profile_image", "badge"] },
        { model: Board, attributes: ["boardname"] },
        {
          model: Comment,
          attributes: ["id"],
        },
      ],
      offset: paging(page, pagingSize),
      limit: pagingSize,
    });

    return res.status(200).send(result);
  },
  uploadPostImage: asyncWrapper(async (req, res) => {
    const userId = await getUserId(req);
    if (!req.file) {
      throw new CustomError("잘못된 파일입니다.", StatusCodes.CONFLICT);
    }
    const imageUrl = req.file.location;
    if (!userId) {
      throw new CustomError("로그인이 필요합니다.", StatusCodes.UNAUTHORIZED);
    }
    return res.status(200).send({ imageUrl: imageUrl });
  }),
};
