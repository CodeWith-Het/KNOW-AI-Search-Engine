import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchemaModel = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      select: false,
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  }
);


userSchemaModel.pre("save", async function () {

  if (!this.password) return;

  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt);
});

userSchemaModel.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;

  return await bcrypt.compare(enteredPassword, this.password);
};


const userModel = mongoose.model("user", userSchemaModel);

export default userModel;