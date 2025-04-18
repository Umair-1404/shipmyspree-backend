import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import router from "./routes/api.js";
import "dotenv/config";
import bodyParser from "body-parser";

const app = express();

const PORT = 8080;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.status(200).json({ msg: "Everything is ok" });
});

app.use("/api", router);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
