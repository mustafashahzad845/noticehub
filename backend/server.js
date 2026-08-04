import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { setServers } from "node:dns/promises";
import MemberModel from "./models/member.js";

setServers(["8.8.8.8", "1.1.1.1"]);

const URI =
  "mongodb+srv://aplinode329_db_user:admin@cluster0.v0eo9fz.mongodb.net/noticehub";
const PORT = 4000;

mongoose.connect(URI).then((res) => console.log("MongoDB connected"));

const app = express();

app.use(express.json());
app.use(cors());

// Routes

app.get("/", (request, response) => {
  response.json({
    message: "Server is successfully running...",
    body: null,
    status: true,
  });
});

app.post("/api/signup", async (request, response) => {
  const { fullName, email, password } = request.body;

  if (!fullName || !email || !password) {
    response.json({
      message: "Required fields are missing",
      body: null,
      status: false,
    });
    return;
  }

  const userData = await MemberModel.create(request.body);
  console.log(userData);

  console.log(request.body);

  response.json({
    message: "User Created",
    body: null,
    status: true,
  });
});

// Server running and listening

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
