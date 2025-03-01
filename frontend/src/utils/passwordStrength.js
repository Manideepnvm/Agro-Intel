export const checkPasswordStrength = (password) => {
  let strength = 0;
  const feedback = [];

  // Length check
  if (password.length < 8) {
    feedback.push("Password should be at least 8 characters long");
  } else {
    strength += 1;
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    feedback.push("Add uppercase letter");
  } else {
    strength += 1;
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    feedback.push("Add lowercase letter");
  } else {
    strength += 1;
  }

  // Number check
  if (!/[0-9]/.test(password)) {
    feedback.push("Add number");
  } else {
    strength += 1;
  }

  // Special character check
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push("Add special character");
  } else {
    strength += 1;
  }

  return {
    score: strength,
    isStrong: strength >= 4,
    feedback
  };
}; 