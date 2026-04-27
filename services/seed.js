const bcrypt = require("bcryptjs");
const models = require("../models/model")

const seedAdminUser = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Check if admin exists
    const admin = await models.User.findOne({ user_email: adminEmail });
    if (admin) {
      console.log("Admin already exists");
      return;
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create Admin
    await models.User.create({
      user_name: "Admin",
      user_email: adminEmail,
      user_pass: hashedPassword,
      role:"userAdm"
    });
    console.log("Admin user seeded successfully");
  } catch (err) {
    console.error("Error seeding admin user:", err.message);
  }
};

module.exports = seedAdminUser;   