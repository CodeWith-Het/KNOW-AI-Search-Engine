import jwt from "jsonwebtoken"

export const authUser= async(req,res,next) =>{
    const token = req.cookies.token

    if (!token) {
        return res.status(400).json({
            message: "token not provide , logimn please",
            succcess: false,
            error: new Error("token not provide")
        })
    }

    let decode = null

    try {
        decode = jwt.verify(token, process.env.JWT_SECRET)
        next()

        req.user = decode
    }
    catch (error) {
        return res.status(401).json({
            messageL: "invaild token , can you login please",
            success: false,
            error:new Error("Invaild token")
        })
    }
}