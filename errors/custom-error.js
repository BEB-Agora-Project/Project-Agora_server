// class CustomError extends Error {
//   constructor(msg, statusCode) {
//     console.log(msg)
//     console.log(statusCode)
//     console.log('이거임')
//     super(msg);
//     this.status = statusCode;
//     this.statusCode = statusCode;
//   }
// }
//
// module.exports = CustomError

class CustomError extends Error {
  constructor(message, code, ...params) {
    super(...params)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError)
    }

    this.code = code
    this.message = message
  }
}

module.exports = CustomError