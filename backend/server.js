import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { setServers } from "node:dns/promises";
import MemberModel from "./models/member.js";

setServers(["8.8.8.8", "1.1.1.1"]);
dotenv.config();

const URI = process.env.MONGODB_URI
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
  try {
    const { fullName, email, password } = request.body;

    if (!fullName || !email || !password) {
      response.json({
        message: "Required fields are missing",
        body: null,
        status: false,
      });
      return;
    }

    const hashPassword = await bcrypt.hash(password, 10);
    console.log(hashPassword);

    const obj = {
      ...request.body,
      password: hashPassword,
    };

    //Email Already Exist
    const emailExist = await MemberModel.findOne({ email });
    console.log(emailExist);

    if (emailExist) {
      response.json({
        message: "Email already exist",
        body: null,
        status: false,
      });
      return;
    }

    const userData = await MemberModel.create(obj);
    console.log(userData);

    response.json({
      message: "User Created",
      body: null,
      status: true,
    });
  } catch (error) {
    response.json({
      message: error.message,
      body: null,
      status: false,
    });
  }
});

//Login API
app.post("/api/login", async (request, response) => {
  const { email, password } = request.body;

  if (!email || !password) {
    response.json({
      message: "Required fields are missing",
      body: null,
      status: false,
    });
    return;
  }

  const findUser = await MemberModel.findOne({ email });

  if (!findUser) {
    response.json({
      message: "User not found",
      body: null,
      status: false,
    });
    return;
  }

  const comparePassword = await bcrypt.compare(password, findUser.password);
  console.log(comparePassword, "comparePassword");

  if (!comparePassword) {
    response.json({
      message: "invalid email or password",
      body: null,
      status: false,
    });
  }


  const jwtToken = jwt.sign({
    _id : findUser._id , 
    fullName : findUser.fullName,
    email : findUser.email
  } , process.env.JWT_Signature_Key)

  // console.log(jwtToken);
  localStorage.setItem("jwtToken", jwtToken)

response.json({
  message : "Login Successfully",
  status : true,
})

  // response.json({
  //   message : "User found",
  //   status : true,

  // })
});

// Server running and listening

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
