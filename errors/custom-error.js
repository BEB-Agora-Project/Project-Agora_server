
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