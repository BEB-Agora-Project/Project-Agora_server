// const  StatusCodes  = require("http-status-codes")
// const CustomError = require('./custom-error')
// const ErrorHandlerMiddleware = (err, req, res, next) => {
//     // 만약 err가 직접 구현한 Custom Error 라면 CustomError 객체에서
//     // statusCode와 message 가져와서 응답하기
//     console.log(err)
//     console.log('이거')
//     if (err instanceof CustomError) {
//         return res
//             .status(err.statusCode)
//             .json({ status: err.status, message: err.message });
//     }
// }
//
// module.exports = ErrorHandlerMiddleware

const CustomError = require('./custom-error')

module.exports = (err, req, res, next) => {
    if (err instanceof CustomError) {
        return res.status(err.code).json(err)
    }
    console.log(err)
    return res.status(500).json(err)
}