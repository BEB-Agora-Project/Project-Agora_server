const { Post, User, Comment, Board, Recommend } = require("../models");

const { asyncWrapper } = require("../errors/async");
const CustomError = require("../errors/custom-error");
const StatusCodes = require("http-status-codes");
const { getUserId } = require("../utils/getUserId");
const { boardPostReward } = require("../config/rewardConfig");
const { pagingSize } = require("../config/pagingConfig");
const { paging, postSize } = require("../utils/paging");
const { textFilter } = require("../utils/filtering");
const { getImgSrcString } = require("../utils/htmlString");
const sequelize = require("sequelize");
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
    const userId = req.userId
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
    const imageUrl= content.includes("<img")?getImgSrcString(content):""
    const newPost = await Post.create({
      opinion: 3,
      title: title,
      content: content,
      image_url:imageUrl,
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
    const userId = req.userId
    const postId = req.params.post_id;
    if (title === undefined || content === undefined) {
      throw new CustomError(
        "올바르지 않은 파라미터 값입니다.",
        StatusCodes.BAD_REQUEST
      );
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
    const imageUrl= content.includes("<img")?getImgSrcString(content):""
    await postData.update({
      title: title,
      content: content,
      image_url:imageUrl
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
    const currentBoard=await Board.findOne({ where: { id: boardId }})
    if (!keyword) {
      count = await Post.count({ where: { board_id: boardId } });
      result = await Post.findAll({
        where: { board_id: boardId },
        order: [["id", "DESC"]],
        include: [
          { model: User, attributes: ["username", "profile_image", "badge"] },
          { model: Comment, attributes: ["id"] },
        ],
        offset: paging(page, pagingSize),
        limit: pagingSize,
      });
    } else {
      count = await Post.count({
        where: { board_id: boardId, title: { [Op.like]: "%" + keyword + "%" } },
      });
      result = await Post.findAll({
        where: { board_id: boardId, title: { [Op.like]: "%" + keyword + "%" } },
        order: [["id", "DESC"]],
        include: [
          { model: User, attributes: ["username", "profile_image", "badge"] },
          { model: Comment, attributes: ["id"] },
        ],
        offset: paging(page, pagingSize),
        limit: pagingSize,
      });
    }
    res.status(200).json({
      status: "success",
      data: result,
      count: count,
      boardname:currentBoard.boardname
    });
  }),
  deleteBoardPost: asyncWrapper(async (req, res) => {
    const postId = req.params.post_id;
    if (postId === undefined) {
      throw new CustomError("올바르지 않은 파라미터입니다", BAD_REQUEST);
    }
    const postData = await Post.findByPk(postId);

    const userId = req.userId

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
    const userId = req.userId
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

    const count = await Post.count({
      where: { board_id: boardId, up: { [Op.gte]: 10 } },
    });
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

    return res.status(200).send({ data: result, count: count });
  },
  uploadPostImage: asyncWrapper(async (req, res) => {
    const userId = req.userId
    if (!req.file) {
      throw new CustomError("잘못된 파일입니다.", StatusCodes.CONFLICT);
    }
    const imageUrl = req.file.location;

    return res.status(200).send({ imageUrl: imageUrl });
  }),

  getAllBoardRecents: asyncWrapper(async (req, res) => {
    const page = req.query.page;
    const keyword = req.query.keyword;
    let result;
    let count;

    if (!keyword) {
      count = await Post.count();
      result = await Post.findAll({
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
      count = await Post.count({
        where: {title: { [Op.like]: "%" + keyword + "%" } },
      });
      result = await Post.findAll({
        where: { title: { [Op.like]: "%" + keyword + "%" } },
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

    res.status(200).json({
      status: "success",
      data: result,
      count: count,
    });
  }),
};

