const bcrypt = require("bcrypt");

// Password strength requirements
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{8,}$/;

/**
 * Validates password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character (@$!%*?&)
 */
const validatePasswordStrength = (password) => {
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    return {
      isValid: false,
      error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
    };
  }

  if (!PASSWORD_REGEX.test(password)) {
    return {
      isValid: false,
      error: "Password must contain uppercase, lowercase, numbers, and special characters (@$!%*?&)",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Verifies if provided password matches hashed password
 */
const verifyPassword = (plainPassword, hashedPassword) => {
  return bcrypt.compareSync(plainPassword, hashedPassword);
};

/**
 * Hashes a password with bcrypt
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, bcrypt.genSaltSync(8));
};

module.exports = {
  validatePasswordStrength,
  verifyPassword,
  hashPassword,
};
