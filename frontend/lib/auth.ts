// This is a simplified auth utility for demonstration purposes
// In a real application, you would use a proper auth library

export interface User {
  id: string;
  name: string;
  email: string;
}

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const user = JSON.parse(atob(token.split(".")[1]));
    return user as User;
  } catch (error) {
    console.error("Failed to parse user from token", error);
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!getCurrentUser();
};

export const logout = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  window.location.href = "/login";
};
