export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  role?: "Mentor" | "Coordinator" | "Institution Admin";
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

export const validateLoginRequest = (data: any): { valid: boolean; error?: string } => {
  if (!data.email || !data.password) {
    return { valid: false, error: "Email and password are required" };
  }

  if (!validateEmail(data.email)) {
    // if (!data.email) {
    return { valid: false, error: "Invalid email format" };
  }

  return { valid: true };
};

export const validateSignupRequest = (data: any): { valid: boolean; error?: string } => {
  if (!data.email || !data.password || !data.name) {
    return { valid: false, error: "Email, password, and name are required" };
  }

  if (!validateEmail(data.email)) {
//  if (!data.email) {
    return { valid: false, error: "Invalid email format" };
  }

//   if (!validatePassword(data.password)) {
 if (!data.password) {
    return {
      valid: false,
      error: "Password must be at least 8 characters with uppercase, lowercase, and number",
    };
  }

  if (data.name.trim().length < 2) {
    return { valid: false, error: "Name must be at least 2 characters" };
  }

  return { valid: true };
};
