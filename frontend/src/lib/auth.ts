
// import { api } from "./api";

// export interface Counselor {
//   id: string;
//   name: string;
//   email: string;
// }

// export interface AuthResponse {
//   token: string;
//   employee: Counselor;
// }

// export interface RegisterInput {
//   name: string;
//   email: string;
//   password: string;
// }

// export interface LoginInput {
//   email: string;
//   password: string;
// }

// export async function login(input: LoginInput) {
//   const { data } = await api.post<AuthResponse>(
//     "/auth/login",
//     input,
//   );

//   localStorage.setItem("accessToken", data.token);
//   localStorage.setItem("counselor", JSON.stringify(data.employee));

//   return data;
// }

// export async function register(input: RegisterInput) {
//   const { data } = await api.post<AuthResponse>(
//     "/auth/register",
//     input,
//   );

//   localStorage.setItem("accessToken", data.token);
//   localStorage.setItem("counselor", JSON.stringify(data.employee));

//   return data;
// }

// export function logout() {
//   localStorage.removeItem("accessToken");
//   localStorage.removeItem("counselor");
// }

// export function getStoredCounselor(): Counselor | null {
//   const stored = localStorage.getItem("counselor");

//   if (!stored) return null;

//   try {
//     return JSON.parse(stored) as Counselor;
//   } catch {
//     localStorage.removeItem("counselor");
//     return null;
//   }
// }

// export function isAuthenticated() {
//   return Boolean(localStorage.getItem("accessToken"));
// }


import { api } from "./api";

export interface Counselor {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    employee: Counselor;
    token: string;
  };
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

function saveSession(response: AuthResponse) {
  const { employee, token } = response.data;

  localStorage.setItem("accessToken", token);
  localStorage.setItem("counselor", JSON.stringify(employee));

  return { employee, token };
}

export async function login(input: LoginInput) {
  const { data } = await api.post<AuthResponse>("/auth/login", input);
  return saveSession(data);
}

export async function register(input: RegisterInput) {
  const { data } = await api.post<AuthResponse>("/auth/register", input);
  return saveSession(data);
}

export function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("counselor");
}

export function getStoredCounselor(): Counselor | null {
  const stored = localStorage.getItem("counselor");

  if (!stored) return null;

  try {
    return JSON.parse(stored) as Counselor;
  } catch {
    localStorage.removeItem("counselor");
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem("accessToken"));
}
