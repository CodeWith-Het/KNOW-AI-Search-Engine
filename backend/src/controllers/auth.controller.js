import userModel from '../models/user.model.js';
import jwt from "jsonwebtoken"

export const registerUser = async(req,res,next) => {
    try {
      const { username, email, password } = req.body;

      const isAlreadyExist = await userModel.findOne({
        $or: [{ username }, { email }],
      });

      if (isAlreadyExist) {
        const error = new Error("User Already Exist this Email or Username")
        error.statusCode = 400
        return next(error)
      }

      const user = await userModel.create({
        username,
        email,
        password,
        verificationToken,
        verificationTokenExpires,
      });

      const token = jwt.sign(
        {
          id: user._id,
          isVerified: user.isVerified,
        },
        process.env.JWT_SECRET
      );

      res.status(201).json({
        message: "User Successfully Registed",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isVerified: user.isVerified,
        },
      });
    } catch (error) {
      next(error);
    }
}     