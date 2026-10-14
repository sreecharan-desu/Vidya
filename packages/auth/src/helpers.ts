import { AuthUser, UserRole } from "./types";

/**
 * Returns true if the user has the specified role.
 */
export const hasRole = (
  user: AuthUser | null | undefined,
  role: UserRole
): boolean => {
  return !!user && user.role === role;
};

/**
 * Returns true if the user is a student.
 */
export const isStudent = (
  user: AuthUser | null | undefined
): boolean => {
  return hasRole(user, "STUDENT");
};