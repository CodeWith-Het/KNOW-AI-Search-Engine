import mongoose from "mongoose";

const connectToDB = async () => {
  try {
      const connectToDB = await mongoose.connect(process.env.MONGO_URI).then(() => {
        console.log("connect to DB 🟢")
    })
  } catch (error) {
    console.error(`🛑 Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectToDB