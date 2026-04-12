import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isDoctor: { type: Boolean, default: false },
  notification: { type: Array, default: [] },
  seenNotifications: { type: Array, default: [] },
});

const User = mongoose.model("users", UserSchema);

const fixDb = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/doctor-app");
    console.log("Connected to DB");
    
    const result = await User.updateMany({}, { $set: { isAdmin: true } });
    console.log(`Successfully forced EVERY account in the database to be an Admin!`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixDb();
