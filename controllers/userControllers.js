const { mongoConnect } = require("../database");
const { User } = require("../models/model");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const loginUserHandler = async (req, res) => {
  try {
    const userLoggingEmail = req.body.user_email;
    const userLoggingPass = req.body.user_pass;

    const userOnDB = await User.findOne({ user_email: userLoggingEmail });
    if (userOnDB == null) {
      return res.status(401).json({ erro: "Error invalid user" });
    }

    const isPassRight = bcrypt.compareSync(userLoggingPass, userOnDB.user_pass);
    if (isPassRight) {
      //create JWT
      const accessToken = jwt.sign(
        {
          username: userOnDB.user_email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "20m" }
      );
      const refreshToken = jwt.sign(
        {
          username: userOnDB.user_email,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
      );
      try {
        await User.findByIdAndUpdate(userOnDB._id, {
          user_token: refreshToken,
        });
        res.cookie("jwt", refreshToken, {
          htttpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        });
        return res.json({
          user_name: userOnDB.user_name,
          user_email: userOnDB.user_email,
          user_id: userOnDB._id,
          user_Token: accessToken,
        });
      } catch {
        return res
          .status(500)
          .json({ error: "Could not delete due to server error" });
      }
    }
    return res.status(401).json({ erro: "Error invalid password" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error" });
  }
};

const registerUserHandler = async (req, res) => {
  try {
    const user_auth_email = req.body.user_adm_email;
    const user_auth_pass = req.body.user_adm_pass;

    const itExist = await User.findOne({ user_email: req.body.user_email });
    if (itExist) {
      return res.status(409).json({ erro: "The user email already exists" });
    }

    const userOnDB = await User.findOne({ user_email: user_auth_email });
    if (userOnDB == null) {
      return res.status(401).json({ erro: "The user doesn't exist" });
    }
    console.log(userOnDB.user_pass);
    console.log(user_auth_pass);

    if (userOnDB.role !== "userAdm") {
      return res
        .status(401)
        .json({ erro: "The user doesn't have the authorization" });
    }
    if (!user_auth_pass) {
      return res.status(400).json({ error: "Senha não informada" });
    }
    const isPassRight = bcrypt.compareSync(user_auth_pass, userOnDB.user_pass);
    if (!isPassRight) {
      res.status(401).json({ erro: "Invalid password" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error" });
  }
  const user_role = req.body.role;
  const user_pass = bcrypt.hashSync(
    req.body.user_pass,
    bcrypt.genSaltSync(8),
    null
  );
  const userToCreate = new User({
    user_name: req.body.user_name,
    user_email: req.body.user_email,

    user_pass: user_pass,
    role: user_role,
  });
  try {
    await userToCreate.save();
    res.status(201).json({ message: "Success" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "error" });
  }
};

const logoutUserHandler = async (req, res) => {
  //also delete on the front
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204);
  const refreshToken = cookies.jwt;
  const userWithRefreshTokenInDB = await User.findOne({
    user_token: refreshToken,
  });
  if (userWithRefreshTokenInDB == null) {
    res.clearCookie("jwt", { htttpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    return res.sendStatus(204);
  }
  //delete the refresh token in db
  try {
    await User.findByIdAndUpdate(userWithRefreshTokenInDB._id, {
      user_token: "",
    });
    res.clearCookie("jwt", { htttpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); //secure: true
    return res.sendStatus(204);
  } catch {
    return res.sendStatus(500);
  }
};
module.exports = { loginUserHandler, registerUserHandler, logoutUserHandler };
