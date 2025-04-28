import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("AuthHeader222----", authHeader?.split(" ")[1]);
  if (authHeader === null || authHeader === undefined) {
    return res.status(401).json({ msg: "Access denied: No token" });
  }
  const token = authHeader?.split(" ")[1] || null;
  console.log("token=====", token);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ msg: "Invalid or expired token" });
    req.user = user;
    next();
  });
};
