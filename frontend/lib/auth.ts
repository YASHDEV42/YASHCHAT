// This is a simplified auth utility for demonstration purposes
// In a real application, you would use a proper auth library

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token");
  if (!token) return null;

  // In a real app, you would decode the JWT and validate it
  // For demo purposes, we'll return a mock user
  return {
    id: "1",
    name: "Demo User",
    email: "user@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
  };
};

export const isAuthenticated = (): boolean => {
  return !!getCurrentUser();
};

export const logout = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  window.location.href = "/login";
};
