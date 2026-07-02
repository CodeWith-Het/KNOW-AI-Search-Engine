class AppError extends Error{
    constructor(message, statusCode, errorCode = null) {
        
        this.success=false

        super(message)

        this.statusCode = statusCode
        
        this.errorCode = errorCode
        
        Error.captureStackTrace(this,this.constructor)
    }
}

export default AppError