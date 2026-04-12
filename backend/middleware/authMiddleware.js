import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send({ message: "Auth Failed", success: false });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        return res.status(401).send({ message: "Auth Failed", success: false });
      } else {
        req.userId = decode.id;
        next();
      }
    });
  } catch (error) {
    res.status(401).send({ message: "Invalid token", success: false });
  }
};

export default authMiddleware;