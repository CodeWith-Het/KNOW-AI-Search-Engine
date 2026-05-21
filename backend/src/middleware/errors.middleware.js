import dotenv from "dotenv";
dotenv.config()

const errorhandle = (err, req, res, next) => {

const statusCode = err.status || err.statusCode || 500 

    const response = {
        success: false,
        message: err.message,
    };
 
    if (process.env.NODE_ENVIRONMENT == "production") {
      response.stack = err.stack;
    }

    res.status(err.status || 500).json(response)
}

export default errorhandle