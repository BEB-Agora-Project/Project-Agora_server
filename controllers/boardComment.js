module.exports = {};
const { Post, User, Comment, Board, Recommend} = require("../models");

const { isAuthorized } = require("../middleware/webToken");
const { asyncWrapper } = require("../errors/async");
const { getUserId } = require("../utils/getUserId");
const CustomError = require("../errors/custom-error");
const StatusCodes = require("http-status-codes");
const {textFilter}=require("../utils/filtering")

module.exports = {
  writeBoardPostComment: asyncWrapper(async (req, res) => {
    const { content } = req.body;
    const postId = req.params.post_id;

    const userId = await getUserId(req);
    if (!userId) {
      throw new CustomError("로그인이 필요합니다.", StatusCodes.UNAUTHORIZED);
    }

    if (postId === undefined || content === undefined) {
      throw new CustomError(
        "올바르지 않은 파라미터 값입니다.",
        StatusCodes.BAD_REQUEST
      );
    }

    const currentBoard =await Post.findOne({
      where:{
        id:postId
      }
    })
    if(!currentBoard){
      throw new CustomError("존재하지 않는 게시글입니다.", StatusCodes.METHOD_NOT_ALLOWED);
    }

    if(await textFilter(content)){
      throw new CustomError("댓글 내용에 사용할 수 없는 문자열이 포함되어 있습니다.", StatusCodes.CONFLICT);
    }

    const newComment = await Comment.create({
      content: content,
      user_id: userId,
      post_id: postId,
    });

    return res
      .status(StatusCodes.CREATED)
      .json({ status: "success", data: { commentId: newComment.id } });
  }),
  editBoardPostComment: asyncWrapper(async (req, res) => {
    const commentId = req.params.comment_id;
    const { content } = req.body;
    if (content === undefined || commentId === undefined) {
      throw new CustomError(
        "올바르지 않은 파라미터 값입니다.",
        StatusCodes.BAD_REQUEST
      );
    }

    const userId = await getUserId(req);
    if (!userId) {
      throw new CustomError("로그인이 필요합니다.", StatusCodes.UNAUTHORIZED);
    }
    const commentData = await Comment.findByPk(commentId);

    if (!commentData) {
      throw new CustomError(
          "존재하지 않는 댓글입니다.",
          StatusCodes.METHOD_NOT_ALLOWED
      );
    }

    if (!commentData.user_id === userId) {
      throw new CustomError(
        "본인의 코멘트가 아닙니다.",
        StatusCodes.METHOD_NOT_ALLOWED
      );
    }
    if(await textFilter(content)){
      throw new CustomError("댓글 내용에 사용할 수 없는 문자열이 포함되어 있습니다.", StatusCodes.CONFLICT);
    }

    await commentData.update({
      content: content,
    });
    res.status(StatusCodes.OK).send({ message: "ok" });
  }),

  /*
Writing ID를 받아서 해당 writing에 대한 정보를 응답
*/

  deleteBoardPostComment: asyncWrapper(async (req, res) => {
    const commentId = req.params.comment_id;
    if (!commentId) {
      throw new CustomError(
        "올바르지 않은 파라미터 값입니다.",
        StatusCodes.BAD_REQUEST
      );
    }

    const userId = await getUserId(req);
    if (!userId) {
      throw new CustomError("로그인이 필요합니다.", StatusCodes.UNAUTHORIZED);
    }
    const commentData = await Comment.findByPk(commentId);
    const commentUserId = commentData.user_id;

    if (!commentData) {
      throw new CustomError(
        `댓글번호 ${commentId} 가 존재하지 않습니다.`,
        StatusCodes.NOT_FOUND
      );
    }

    if (commentUserId !== userId) {
      throw new CustomError(
        `댓글 작성자가 아닙니다.`,
        StatusCodes.METHOD_NOT_ALLOWED
      );
    }
    // db에 저장
    await Comment.destroy({
      where: { id: commentId },
    });
    // await mintToken(userInfo.address, 1);
    res.status(StatusCodes.ACCEPTED).send({ message: "ok" });
  }),
  getBoardPostComments: asyncWrapper(async (req, res) => {
    const postId = req.params.post_id;
    if (!postId) {
      throw new CustomError(
        "올바르지 않은 파라미터 값입니다.",
        StatusCodes.BAD_REQUEST
      );
    }
    const comments = await Comment.findAll({
      where: { post_id: postId },
      include: [{ model: User, attributes: ["username"] }],
    });

    return res.status(StatusCodes.OK).send(comments);
  }),

  voteBoardComment: asyncWrapper(async (req, res) => {
    const userId = await getUserId(req);
    if (!userId) {
      throw new CustomError(
          "로그인되지 않은 사용자입니다",
          StatusCodes.UNAUTHORIZED
      );
    }
    const vote = req.query.vote;
    const commentId = req.params.comment_id;
    const commentInfo = await Comment.findOne({
      where:{id:commentId}
    });
    if(!commentInfo){
      throw new CustomError("존재하지 않는 댓글 id 입니다.",StatusCodes.CONFLICT)
    }
    const isRecommend = await Recommend.findOne({
      where:{user_id:userId,comment_id:commentId}
    })
    if(isRecommend){
      throw new CustomError("이미 추천/반대 하였습니다.",StatusCodes.CONFLICT)
    }
    let curVote;
    await Recommend.create({
      state:vote,
      comment_id:commentId,
      user_id:userId
    })

    if (vote === "up") {
      curVote = commentInfo.up;
      curVote++;
      await commentInfo.update({
        up: curVote,
      });

      return res.status(200).send({curVote: curVote});
    } else if (vote === "down") {
      curVote = commentInfo.down;
      curVote++;
      await commentInfo.update({
        down: curVote,
      });
      return res.status(200).send({curVote: curVote});
    } else {
      return res.send(405).send("그런 요청은 없다");
    }
    //   const userId = await getUserId(req);
    //   if (!userId) return res.status(401).send("로그인하지 않은 사용자입니다");
    //
    //   const commentId = req.params.comment_id;
    //   const vote = req.query.vote;
    //   let curVote;
    //
    //   const commentInfo = await Comment.findByPk(commentId);
    //   if (commentInfo === null) {
    //     return res.status(404).send("존재하지 않는 코멘트입니다");
    //   }
    //   if (vote === "up") {
    //     curVote = commentInfo.up;
    //     curVote++;
    //     await commentInfo.update({
    //       up: curVote,
    //     });
    //     return res.status(200).send({ curVote: curVote });
    //   } else if (vote === "down") {
    //     curVote = commentInfo.down;
    //     curVote++;
    //     await commentInfo.update({
    //       down: curVote,
    //     });
    //     return res.status(200).send({ curVote: curVote });
    //   } else {
    //     return res.status(400).send("올바르지 않은 요청입니다.");
    //   }
    // },
  }),
};
