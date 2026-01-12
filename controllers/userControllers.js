const { User } = require("../models/model");
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
      const accessToken = jwt.sign(
        {
          username: userOnDB.user_email,
          role: userOnDB.role,
          id: userOnDB._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );
      const refreshToken = jwt.sign(
        {
          username: userOnDB.user_email,
          role: userOnDB.role,
          id: userOnDB._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
      );
      try {
        await User.findByIdAndUpdate(userOnDB._id, {
          user_token: refreshToken,
        });
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        });
        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          maxAge: 15 * 60 * 1000,
        });
        return res.status(201).json({
          user_name: userOnDB.user_name,
          user_email: userOnDB.user_email,
          user_id: userOnDB._id,
        });
      } catch {
        return res
          .status(500)
          .json({ error: "Could not login due to server error" });
      }
    }
    return res.status(401).json({ error: "Error invalid password" });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
};

const registerUserHandler = async (req, res) => {
  try {
    const { user_name, user_email, user_pass } = req.body;
    const user_role = req.body.role;

    const userExists = await User.findOne({ user_email });
    if (userExists) {
      return res.status(409).json({
        error: "User email already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(user_pass, bcrypt.genSaltSync(8));
    const user = new User({
      user_name,
      user_email,
      user_pass: hashedPassword,
      role: user_role,
    });

    await user.save();

    return res.status(201).json({
      message: "User created successfully",
    });
  } catch (err) {
    console.error("User register error:", err);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

const logoutUserHandler = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.refreshToken) {
      return res.sendStatus(204);
    }
    const refreshToken = cookies.refreshToken;
    const user = await User.findOne({ user_token: refreshToken });
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    if (!user) {
      return res.sendStatus(204);
    }
    user.user_token = "";
    await user.save();
    return res.sendStatus(204);
  } catch (err) {
    console.error("Logout error:", err);
    return res.sendStatus(500);
  }
};

module.exports = { loginUserHandler, registerUserHandler, logoutUserHandler };
