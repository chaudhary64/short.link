import api from "./axios";

export async function SignUpUser({ name, email, password, gender }) {
  const res = await api.post("/api/auth/register", { name, email, password, gender });
  return res;
}

export async function LoginUser({ email, password }) {
  const res = await api.post("/api/auth/login", { email, password });
  return res;
}

export async function GoogleLoginUser({ token }) {
  const res = await api.post("/api/auth/google", { token });
  return res;
}

export async function LogoutUser() {
  const res = await api.post("/api/auth/logout");
  return res;
}

export async function updateUser({ name }) {
  const res = await api.put("/api/auth/me", { name });
  return res;
}

export async function deleteUser() {
  const res = await api.delete("/api/auth/me");
  return res;
}

export async function ForgotPasswordUser({ email }) {
  const res = await api.post("/api/auth/forgot-password", { email });
  return res;
}

export async function VerifyOtp({ email, otp }) {
  const res = await api.post("/api/auth/verify-email", { email, otp });
  return res;
}
