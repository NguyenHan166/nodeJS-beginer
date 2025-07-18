'use strict'

const StatusCodes = {
    OK: 200,
    CREATED: 201
}

const ReasonStatusCode = {
    CREATED: 'Created !',
    OK: 'Success'
}

class SuccessResponse {
    constructor({message, statusCode = StatusCodes.OK, reasonStatusCode = ReasonStatusCode.OK, metadata}){
        this.message = !message ? reasonStatusCode : message
        this.statusCode = statusCode
        this.metadata = metadata
        this.reasonStatusCode = reasonStatusCode
    }

    send(res, headers = {}) {
        return res.status(this.statusCode).json(this)
    }
}

class OK extends SuccessResponse {
    constructor({message, metadata}){
        super({message, metadata})
    }
}

class CREATED extends SuccessResponse {
    constructor({options = {} , message, statusCode = StatusCodes.OK, reasonStatusCode = ReasonStatusCode.OK, metadata}){
        super({message , statusCode, reasonStatusCode, metadata})
        this.options = options
    }
}



module.exports = {
    OK, CREATED,
    SuccessResponse 
}