import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import router from "./routes/api.js";
import "dotenv/config";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

const app = express();

const PORT = 8080;

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).json({ msg: "Everything is ok" });
});

app.use("/api", router);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
