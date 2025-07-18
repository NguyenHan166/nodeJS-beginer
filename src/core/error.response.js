'use strict'

const { model } = require("mongoose")
// const reasonPhrases = require("../utils/reasonPhrases")
const {ReasonPhrases , StatusCodes} = require('../utils/httpStatusCode')

// const StatusCodes = {
//     FORBIDDEN: 403,
//     CONFLICT: 409,
//     UNAUTHORIZED: 401,
// }

// const ReasonPhrases = {
//     FORBIDDEN: 'Bad Request Error',
//     CONFLICT: 'Conflict Request Error',
//     UNAUTHORIZED: 'Unauthorized Error',
// }

class ErrorResponse extends Error {
    constructor(message, status) {
        super(message)
        this.status = status
    }
}

class ConflictRequestError extends ErrorResponse {
    constructor(message = ReasonPhrases.CONFLICT, statusCode = StatusCodes.CONFLICT) {
        super(message, statusCode)
    }
}

class BadRequestError extends ErrorResponse {
    constructor(message = ReasonPhrases.BAD_REQUEST, statusCode = StatusCodes.BAD_REQUEST) {
        super(message, statusCode)
    }
}

class AuthFailureError extends ErrorResponse {
    constructor(message = ReasonPhrases.UNAUTHORIZED , statusCode = StatusCodes.UNAUTHORIZED) {
        super(message, statusCode)
    }
}

class NotFoundError extends ErrorResponse {
    constructor(message = ReasonPhrases.NOT_FOUND , statusCode = StatusCodes.NOT_FOUND) {
        super(message, statusCode)
    }
}

class ForbiddenError extends ErrorResponse {
    constructor(message = ReasonPhrases.NOT_FOUND , statusCode = StatusCodes.NOT_FOUND) {
        super(message, statusCode)
    }
}


module.exports = {
    ConflictRequestError,
    BadRequestError,
    AuthFailureError,
    NotFoundError,
    ForbiddenError
}