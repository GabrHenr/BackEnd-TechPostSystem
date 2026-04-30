const bcrypt = require("bcrypt");

// Requisitos de força de senha
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]{8,}$/;

/**
 * Valida a força da senha
 * Requisitos:
 * - Mínimo 8 caracteres
 * - Pelo menos uma letra maiúscula
 * - Pelo menos uma letra minúscula
 * - Pelo menos um número
 * - Pelo menos um caractere especial (@$!%*?&)
 */
const validatePasswordStrength = (password) => {
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    return {
      isValid: false,
      error: `A senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres`,
    };
  }

  if (!PASSWORD_REGEX.test(password)) {
    return {
      isValid: false,
      error: "A senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais (@$!%*?&)",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Verifica se a senha fornecida corresponde à senha hash
 */
const verifyPassword = (plainPassword, hashedPassword) => {
  return bcrypt.compareSync(plainPassword, hashedPassword);
};

/**
 * Criptografa uma senha com bcrypt
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, bcrypt.genSaltSync(8));
};

module.exports = {
  validatePasswordStrength,
  verifyPassword,
  hashPassword,
};
