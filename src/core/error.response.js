'use strict'

const { model } = require("mongoose")

const StatusCodes = {
    FORBIDDEN: 403,
    CONFLICT: 409,
    UNAUTHORIZED: 401,
}

const ReasonStatusCode = {
    FORBIDDEN: 'Bad Request Error',
    CONFLICT: 'Conflict Request Error',
    UNAUTHORIZED: 'Unauthorized Error',
}

class ErrorResponse extends Error {
    constructor(message, status) {
        super(message)
        this.status = status
    }
}

class ConflictRequestError extends ErrorResponse {
    constructor(message = ReasonStatusCode.CONFLICT, statusCode = StatusCodes.CONFLICT) {
        super(message, statusCode)
    }
}

class BadRequestError extends ErrorResponse {
    constructor(message = ReasonStatusCode.BAD_REQUEST, statusCode = StatusCodes.BAD_REQUEST) {
        super(message, statusCode)
    }
}

module.exports = {
    ConflictRequestError,
    BadRequestError,
}