import dotenv from "dotenv";
dotenv.config()

const errorHandle = (err, req, res, next) => { 

    const response = {
        success: false,
        message: err.message || "Internal Server Error"
    };

    if (err.errorCode) {
        response.errorCode=err.errorCode
    }
 
    if (process.env.NODE_ENV == "production") {
      response.stack = err.stack;
    }

    res.status(err.statusCode || 500).json(response)
}

export default errorHandle