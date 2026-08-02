import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { setServers } from "node:dns/promises";

setServers(["8.8.8.8", "1.1.1.1"]);

const URI =
  "mongodb+srv://aplinode329_db_user:admin@cluster0.v0eo9fz.mongodb.net/noticehub";
const PORT = 4000;

mongoose.connect(URI).then((res) => console.log("MongoDB connected"));

// Server Create

const app = express();

app.get("/", (request, response) => {
  response.json({
    message: "Server is successfully running...",
    body: null,
    status: true,
  });
});

app.listen(PORT, () => console.log("Server running.."));
