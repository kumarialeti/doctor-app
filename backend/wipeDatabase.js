import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const wipeDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");
    
    // Drop the entire database (this removes ALL collections)
    await mongoose.connection.db.dropDatabase();
    
    console.log("🔥 Successfully wiped ALL data (Users, Doctors, Appointments, Reviews)!");
    process.exit(0);
  } catch (error) {
    console.error("Error wiping database:", error);
    process.exit(1);
  }
};

wipeDatabase();
