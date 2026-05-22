import dotenv from "dotenv";
dotenv.config()

const errorhandle = (err, req, res, next) => { 

    const response = {
        success: false,
        message: err.message,
    };
 
    if (process.env.NODE_ENVIRONMENT == "development") {
      response.stack = err.stack;
    }

    res.status(err.status || 500).json(response)
}

export default errorhandle