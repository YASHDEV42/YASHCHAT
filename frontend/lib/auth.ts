// This is a simplified auth utility for demonstration purposes
// In a real application, you would use a proper auth library

import { jwtDecode } from "jwt-decode";

export interface User {
  id: string;
  username: string;
  email: string;
}

export function getCurrentUser(token: string): User | null {
  if (!token) return null;

  try {
    const decoded = jwtDecode<User>(token);
    console.log("Decoded token:", decoded);

    return decoded;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}

export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("token") || "";
  return !!getCurrentUser(token);
};
export const logout = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  window.location.href = "/login";
};
