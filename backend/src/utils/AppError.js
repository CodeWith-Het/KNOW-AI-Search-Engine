class AppError extends Error{
    constructor(message, statusCode, errorCode = null) {
        
        super(message)

        this.success = false

        this.statusCode = statusCode
        
        this.errorCode = errorCode
        
        Error.captureStackTrace(this,this.constructor)
    }
}

export default AppError