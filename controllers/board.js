const {Post, User, Comment} = require('../models');

const {isAuthorized} = require('../middleware/webToken')
// const {mintToken} = require('./smartContract')
const {asyncWrapper} = require("../errors/async");
const CustomError = require("../errors/custom-error");
const StatusCodes = require("http-status-codes")
module.exports = {
    write: asyncWrapper(async (req, res) => {
        if (req.body.title === undefined || req.body.content === undefined) {
            throw new CustomError("올바르지 않은 파라미터 값입니다.",StatusCodes.CONFLICT);
        }
        const decoded = await isAuthorized(req)
        const userInfo = await User.findOne({
            where: {id: decoded.id},
        });
        const userId = userInfo.id
        if (!decoded) {
            throw new CustomError("인가되지 않은 사용자입니다.", StatusCodes.UNAUTHORIZED);
        }
        const {title, content} = req.body;
        // req.body에 필요한 값들이 없으면 Bad Request 에러 응답
        if (!title || !content) {
            throw new CustomError("올바르지 않은 파라미터 값입니다.", StatusCodes.CONFLICT);
        }
        const newPost = new Post({
            title:title,
            content:content,
            user_id:userId
        });
        try {
            // db에 저장
            const createdPost = await newPost.save();
            // await mintToken(userInfo.address, 5);
            res.status(StatusCodes.CREATED).json({status: "success", data: {postId: createdPost.id}});
        } catch (err) {
            throw new Error(err);
        }
    }),

    edit : asyncWrapper(async (req, res) => {
        if (req.body.title === undefined || req.body.content === undefined) {
            throw new CustomError("올바르지 않은 파라미터 값입니다.",StatusCodes.CONFLICT);
        }
        const decoded = await isAuthorized(req)
        const userInfo = await User.findOne({
            where: {id: decoded.id},
        });
        const userId = userInfo.id
        const postData = await Post.findOne({
            where: {id: req.params.id},
        });
        if (!postData) {
            throw new CustomError(`글번호 ${req.params.id} 가 존재하지 않습니다.`,StatusCodes.CONFLICT);
        }



        if(!postData.user_id===userId){
            throw new CustomError(`올바른 사용자가 아닙니다`,StatusCodes.CONFLICT);
        }
        const {title,content} = req.body;
        await postData.update({
            title:title,
            content: content
        });
        res.status(StatusCodes.OK).json({status: "success", data: {post_id: postData.id}});
    }),

    /*
  Writing ID를 받아서 해당 writing에 대한 정보를 응답
*/
    getWritingById: asyncWrapper(async (req, res) => {
        //전달받은 id를 가진 writing을 찾아옴
        const postData = await Post.findOne({
            where: {id: req.params.id},
        });
        await Post.increment({hit: 1}, {where: {id: req.params.id}})
        //해당 id를 가진 writing 없으면 에러 응답
        if (!postData) {
            throw new CustomError(`글번호 ${req.params.id} 가 존재하지 않습니다.`, StatusCodes.CONFLICT);
        }
        const {id, title, content, hit, created_at, updated_at, user_id} = postData;
        const {username} = await User.findOne({
            where: {id: postData.user_id},
        });
        // db에 comments가 유저의 object id로 저장이 되어있기 때문에
        // 응답으로 보내줄 때는 유저의 id와 닉네임을 추가해서 보내준다.
        const postComments = await Comment.findAll({
            include: [
                {
                    model: User,
                    attributes: ['username']
                }
            ],
            where: {post_id: postData.id},
            });

        res.status(200).json({
            status: "success",
            data: {
                id,
                title,
                content,
                hit,
                created_at,
                updated_at,
                username,
                postComments,
            },
        });
    }),

    getAllWriting: asyncWrapper(async (req, res) => {
        const writings = await Post.findAll();
        // Array에 map을 돌 때 콜백함수가 비동기면 일반적인 방법으로는 구현이 안됨
        // 그래서 Promise.all을 사용함
        const data = await Promise.all(
            writings.map(
                async ({id, title, created_at, updated_at, hit, user_id}) => {
                    const {username} = await User.findOne({
                        where: {id: user_id},
                    });
                    const comments = await Comment.findAndCountAll({
                        where: {post_id: id},
                    });
                    const commentsCount= comments.count
                    return {
                        id,
                        title,
                        username,
                        hit,
                        commentsCount,
                        created_at,
                        updated_at
                    };
                }
            )
        );
        res.status(200).json({
            status: "success",
            data,
        });
    }),

    commentToWriting : asyncWrapper(async (req, res) => {
        if (req.body.content === undefined) {
            throw new CustomError("올바르지 않은 파라미터 값입니다.",StatusCodes.CONFLICT);
        }
        const {postId,content} = req.body;
        const postData = await Post.findOne({
            where: {id: req.params.id},
        });
        const decoded = await isAuthorized(req)
        if (!postData) {
            throw new CustomError(`글번호 ${postId} 가 존재하지 않습니다.`,StatusCodes.CONFLICT);
        }
        const newComment = new Comment({
            content:content,
            user_id: decoded.id,
            post_id:postId
        });
        try {
            // db에 저장
            const createdComment = await newComment.save();
            // await mintToken(userInfo.address, 1);
            res.status(StatusCodes.CREATED).json({status: "success", data: {commentId: createdComment.id}});
        } catch (err) {
            throw new Error(err);
        }
    }),
    deleteToWriting : asyncWrapper(async (req, res) => {

        const postData = await Post.findOne({
            where: {id: req.params.id},
        });
        const postId = postData.id
        const postUserId = postData.user_id
        const decoded = await isAuthorized(req)
        const userInfo = await User.findOne({
            where: {id: decoded.id},
        });
        if (!postData) {
            throw new CustomError(`글번호 ${postId} 가 존재하지 않습니다.`,StatusCodes.CONFLICT);
        }
        if (postUserId!==userInfo.id) {
            throw new CustomError(`게시글 작성자가 아닙니다.`,StatusCodes.CONFLICT);
        }
        try {
            // db에 저장
            await  Post.destroy(
                {
                    where: {id:postId}
                }
            )
            // await mintToken(userInfo.address, 1);
            res.status(StatusCodes.OK).send({message: "ok"});
        } catch (err) {
            throw new Error(err);
        }
    }),
    deleteToComment : asyncWrapper(async (req, res) => {
        const commentData = await Post.findOne({
            where: {id: req.params.id},
        });
        const commentId = commentData.id
        const commentUserId = commentData.user_id
        const decoded = await isAuthorized(req)
        const userInfo = await User.findOne({
            where: {id: decoded.id},
        });
        if (!commentData) {
            throw new CustomError(`댓글번호 ${commentId} 가 존재하지 않습니다.`,StatusCodes.CONFLICT);
        }
        if (commentUserId!==userInfo.id) {
            throw new CustomError(`댓글 작성자가 아닙니다.`,StatusCodes.CONFLICT);
        }
        try {
            // db에 저장
            await  Comment.destroy(
                {
                    where: {id:commentId}
                }
            )
            // await mintToken(userInfo.address, 1);
            res.status(StatusCodes.OK).send({message: "ok"});
        } catch (err) {
            throw new Error(err);
        }
    }),


}