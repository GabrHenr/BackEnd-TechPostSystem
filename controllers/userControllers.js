const { User } = require("../models/model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
  validatePasswordStrength,
  verifyPassword,
  hashPassword,
} = require("../services/passwordService");


const generateTemporaryPassword = () => {
  const length = Math.floor(Math.random() * 5) + 8; // 8-12 characters
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    password += charset[randomIndex];
  }

  return password;
};

const loginUserHandler = async (req, res) => {
  try {
    const userLoggingEmail = req.body.user_email;
    const userLoggingPass = req.body.user_pass;

    const userOnDB = await User.findOne({ user_email: userLoggingEmail });
    if (userOnDB == null) {
      return res.status(401).json({ error: "Error invalid user" });
    }

    const isPassRight = await bcrypt.compare(
      userLoggingPass,
      userOnDB.user_pass,
    );

    if (isPassRight) {
      const accessToken = jwt.sign(
        {
          username: userOnDB.user_email,
          role: userOnDB.role,
          id: userOnDB._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" },
      );
      const refreshToken = jwt.sign(
        {
          username: userOnDB.user_email,
          role: userOnDB.role,
          id: userOnDB._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" },
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
        return res.status(200).json({
          id: userOnDB._id,
          name: userOnDB.user_name,
          role: userOnDB.role,
          require_password_change: userOnDB.must_change_password || false,
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
    const { user_name, user_email } = req.body;
    const user_role = req.body.role;

    const userExists = await User.findOne({ user_email });
    if (userExists) {
      return res.status(409).json({
        error: "User email already exists",
      });
    }


    const temporaryPassword = generateTemporaryPassword();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(temporaryPassword, salt);

    const user = new User({
      user_name,
      user_email,
      user_pass: hashedPassword,
      role: user_role,
      must_change_password: true,
    });

    try {
      await user.save();
      return res.status(201).json({
        message: "User created successfully",
        temporary_password: temporaryPassword,
      });
    } catch (err) {
      console.error("User register error:", err);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
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

const deleteUserHandler = async (req, res) => {
  try {
    const userId = req.params.id;
    const requestingUserId = req.user.id;


    if (userId === requestingUserId) {
      return res
        .status(403)
        .json({ error: "You cannot delete your own account" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await User.findByIdAndDelete(userId);
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getAllUsersHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const amountOfUsers =
      parseInt(req.query.limit) || parseInt(req.query.amountOfUsers) || 5;
    const role = req.query.role;

    const pipeline = [];

    // Add $match stage if role is provided
    if (role) {
      pipeline.push({
        $match: {
          role: role,
        },
      });
    }

    // Add $facet stage with metadata and data
    pipeline.push({
      $facet: {
        metadata: [{ $count: "totalCount" }],
        data: [
          { $skip: (page - 1) * amountOfUsers },
          { $limit: amountOfUsers },
          {
            $project: {
              _id: 1,
              user_name: 1,
              user_email: 1,
              role: 1,
            },
          },
        ],
      },
    });

    const users = await User.aggregate(pipeline);

    const totalCount = users[0]?.metadata[0]?.totalCount || 0;
    const totalPages = Math.ceil(totalCount / amountOfUsers);

    return res.status(200).json({
      metadata: {
        totalCount,
        totalPages,
        page,
        amountOfUsers,
      },
      data: users[0].data || [],
    });
  } catch (err) {
    console.error("Get all users error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const searchUserByEmailHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const amountOfUsers = parseInt(req.query.amountOfUsers) || 5;
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        error: "Query parameter 'q' is required",
      });
    }

    const regex = new RegExp(q, "i");

    const users = await User.aggregate([
      {
        $match: {
          user_email: regex,
        },
      },
      {
        $facet: {
          metadata: [{ $count: "totalCount" }],
          data: [
            { $skip: (page - 1) * amountOfUsers },
            { $limit: amountOfUsers },
            {
              $project: {
                _id: 1,
                user_name: 1,
                user_email: 1,
                role: 1,
              },
            },
          ],
        },
      },
    ]);

    const totalCount = users[0]?.metadata[0]?.totalCount || 0;
    const totalPages = Math.ceil(totalCount / amountOfUsers);

    return res.status(200).json({
      metadata: {
        totalCount,
        totalPages,
        page,
        amountOfUsers,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      data: users[0].data || [],
    });
  } catch (err) {
    console.error("Search user by email error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const editUserHandler = async (req, res) => {
  try {
    const userId = req.params.id;
    const requestingUserId = req.user.id;
    const { user_name, user_email, role } = req.body;

    // Prevent user from editing their own account
    if (userId === requestingUserId) {
      return res.status(403).json({ error: "You cannot edit your own account" });
    }

    const userToEdit = await User.findById(userId);
    if (!userToEdit) {
      return res.status(404).json({ error: "User not found" });
    }

    // Validate and check if new email is unique (only if email is being changed)
    if (user_email && user_email !== userToEdit.user_email) {
      const emailExists = await User.findOne({ user_email });
      if (emailExists) {
        return res.status(409).json({
          error: "Email already registered",
        });
      }
    }

    // Update only the provided fields
    if (user_name) {
      userToEdit.user_name = user_name;
    }
    if (user_email) {
      userToEdit.user_email = user_email;
    }
    if (role) {
      userToEdit.role = role;
    }

    await userToEdit.save();

    return res.status(200).json({
      message: "User updated successfully",
      data: {
        _id: userToEdit._id,
        user_name: userToEdit.user_name,
        user_email: userToEdit.user_email,
        role: userToEdit.role,
      },
    });
  } catch (err) {
    console.error("Edit user error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const changePasswordHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    // Validate input
    if (!current_password || !new_password) {
      return res.status(400).json({
        message: "Both current_password and new_password are required",
      });
    }

    // Fetch user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isCurrentPasswordValid = verifyPassword(
      current_password,
      user.user_pass,
    );
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    // Verify if password is the same as old one
    const isSamePassword = verifyPassword(new_password, user.user_pass);
    if (isSamePassword) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(new_password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        message: passwordValidation.error,
      });
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(new_password);

    // Update user
    user.user_pass = hashedNewPassword;
    user.must_change_password = false;
    await user.save();

    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  loginUserHandler,
  registerUserHandler,
  logoutUserHandler,
  deleteUserHandler,
  getAllUsersHandler,
  searchUserByEmailHandler,
  editUserHandler,
  changePasswordHandler,
};
