/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from "zustand";
import { User } from "../types/user";
import { jwtDecode } from "jwt-decode";
import {
  CognitoUserPool,
  // CognitoUserAttribute,
  AuthenticationDetails,
  CognitoUser as CognitoIdentityUser,
  CognitoUserSession,
} from "amazon-cognito-identity-js";

// Cognito User Pool configuration sourced from environment variables
const poolData = {
  UserPoolId: import.meta.env.VITE_APP_AUTH_USER_POOL_ID,
  ClientId: import.meta.env.VITE_APP_AUTH_USER_POOL_WEB_CLIENT_ID,
};

const userPool = new CognitoUserPool(poolData);

/**
 * @interface AuthState
 * Defines the shape of the authentication state managed by Zustand.
 * Includes user information, authentication status, and methods for auth operations.
 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  checkAuth: () => Promise<boolean>;
  fetchUserAttributes: (
    cognitoUser: CognitoIdentityUser,
    idTokenForSub: string
  ) => Promise<Pick<User, "id" | "name" | "email"> | null>;
}

/**
 * Decodes the ID token to extract Cognito groups and determine user role.
 * @param {string} idToken - The JWT ID token.
 * @returns {"admin" | "member" | undefined} The user's role or undefined if not found or error.
 */
const getRoleFromIdToken = (
  idToken: string
): "admin" | "member" | undefined => {
  try {
    // Decode the token to access claims, specifically looking for 'cognito:groups'.
    const decodedToken = jwtDecode<{
      "cognito:groups"?: string[];
      sub?: string;
    }>(idToken);
    const groups = decodedToken["cognito:groups"];
    if (groups) {
      if (groups.includes("admin")) return "admin";
      if (groups.includes("member")) return "member";
    }
  } catch (error) {
    console.error("Error decoding token or extracting groups:", error);
  }
  return undefined;
};

/**
 * Zustand store for managing authentication state.
 * Handles user login, logout, session checking, and attribute fetching from Cognito.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,

  /**
   * Attempts to authenticate the user with Cognito using email and password.
   * On success, fetches user attributes, determines role, and updates the store.
   * User details are persisted to localStorage.
   * @param {string} email - User's email.
   * @param {string} password - User's password.
   * @returns {Promise<void>} A promise that resolves on successful login or rejects on failure.
   */
  login: async (email, password) => {
    const authenticationData = { Username: email, Password: password };
    const authenticationDetails = new AuthenticationDetails(authenticationData);
    const cognitoIdentityUser = new CognitoIdentityUser({
      Username: email,
      Pool: userPool,
    });

    return new Promise((resolve, reject) => {
      cognitoIdentityUser.authenticateUser(authenticationDetails, {
        onSuccess: async (session: CognitoUserSession) => {
          const idToken = session.getIdToken().getJwtToken();
          const fetchedAttributes = await get().fetchUserAttributes(
            cognitoIdentityUser,
            idToken
          );
          const role = getRoleFromIdToken(idToken);

          if (fetchedAttributes && role) {
            const userWithRole: User = {
              ...fetchedAttributes,
              role: role,
              idToken: idToken,
            };
            set({ user: userWithRole, isAuthenticated: true });
            localStorage.setItem("user", JSON.stringify(userWithRole));
            resolve();
          } else if (fetchedAttributes) {
            console.warn(
              "Login successful, fetched attributes, but role could not be determined."
            );
            const userWithoutRole: User = {
              // Proceed with login, default role to 'member'
              ...fetchedAttributes,
              role: "member",
              idToken: idToken,
            };
            set({ user: userWithoutRole, isAuthenticated: true });
            localStorage.setItem("user", JSON.stringify(userWithoutRole));
            resolve();
          } else {
            console.error(
              "Login: Failed to fetch user attributes or determine role."
            );
            set({ user: null, isAuthenticated: false });
            reject(
              new Error(
                "Failed to fetch user attributes or determine role after login."
              )
            );
          }
        },
        onFailure: (err) => {
          console.error("Login failed:", err);
          set({ user: null, isAuthenticated: false });
          reject(err);
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          // Instead of trying to call a callback, reject with a special object
          reject({
            challenge: "NEW_PASSWORD_REQUIRED",
            cognitoUser: cognitoIdentityUser,
            userAttributes,
            requiredAttributes,
          });
        },
      });
    });
  },

  /**
   * Logs out the current user by signing them out of Cognito and clearing local state/storage.
   */
  logout: async () => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut(); // Invalidate Cognito session
    }
    localStorage.removeItem("user"); // Clear persisted session
    set({ user: null, isAuthenticated: false }); // Reset store state
  },

  /**
   * Updates user information in the local store and localStorage.
   * Note: This does NOT update attributes in Cognito. For persistent changes,
   * Cognito SDK methods for attribute updates should be used elsewhere.
   * @param {User} user - The updated user object.
   */
  updateUser: async (user: User) => {
    try {
      localStorage.setItem("user", JSON.stringify(user));
      set({ user });
      console.warn(
        "updateUser is primarily updating local state and localStorage. Cognito attributes should be updated via Cognito SDK for persistence."
      );
    } catch (error) {
      console.error("Local user update failed:", error);
      throw error;
    }
  },

  /**
   * Checks if a user session is active and valid with Cognito.
   * Typically called on application initialization.
   * If session is valid, fetches attributes, role, and updates the store.
   * @returns {Promise<boolean>} True if authentication is successful, false otherwise.
   */
  checkAuth: async () => {
    return new Promise((resolve) => {
      const cognitoUser = userPool.getCurrentUser();
      if (cognitoUser != null) {
        cognitoUser.getSession(
          async (err: Error | null, session: CognitoUserSession | null) => {
            if (err) {
              console.error("Session check failed (getSession error):", err);
              localStorage.removeItem("user");
              set({ user: null, isAuthenticated: false });
              resolve(false);
              return;
            }
            if (session && session.isValid()) {
              // Crucial check for session validity
              const idToken = session.getIdToken().getJwtToken();
              const fetchedAttributes = await get().fetchUserAttributes(
                cognitoUser,
                idToken
              );
              const role = getRoleFromIdToken(idToken);

              if (fetchedAttributes && role) {
                const userWithRole: User = {
                  ...fetchedAttributes,
                  role: role,
                  idToken: idToken,
                };
                set({ user: userWithRole, isAuthenticated: true });
                localStorage.setItem("user", JSON.stringify(userWithRole));
                resolve(true);
              } else if (fetchedAttributes) {
                console.warn(
                  "checkAuth: Session valid, fetched attributes, but role could not be determined."
                );
                const userWithoutRole: User = {
                  ...fetchedAttributes,
                  role: "member", // Default to 'member'
                  idToken: idToken,
                };
                set({ user: userWithoutRole, isAuthenticated: true });
                localStorage.setItem("user", JSON.stringify(userWithoutRole));
                resolve(true);
              } else {
                console.error(
                  "checkAuth: Session valid, but failed to fetch attributes or determine role."
                );
                localStorage.removeItem("user");
                set({ user: null, isAuthenticated: false });
                resolve(false);
              }
            } else {
              // Session exists but is not valid (e.g., refresh token expired)
              console.log(
                "Session is not valid or does not exist after getSession call."
              );
              localStorage.removeItem("user");
              set({ user: null, isAuthenticated: false });
              resolve(false);
            }
          }
        );
      } else {
        // No current user in Cognito pool (i.e., not logged in or session completely expired)
        localStorage.removeItem("user");
        set({ user: null, isAuthenticated: false });
        resolve(false);
      }
    });
  },

  /**
   * Fetches standard user attributes (name, email) from Cognito and derives the 'id'
   * field from the 'sub' (subject) claim of the provided ID token.
   * @param {CognitoIdentityUser} cognitoUser - The authenticated Cognito user object.
   * @param {string} idTokenForSub - The validated JWT ID token from which to extract the 'sub'.
   * @returns {Promise<Pick<User, "id" | "name" | "email"> | null>} Core user details or null on failure.
   */
  fetchUserAttributes: async (
    cognitoUser: CognitoIdentityUser,
    idTokenForSub: string
  ): Promise<Pick<User, "id" | "name" | "email"> | null> => {
    return new Promise((resolve, reject) => {
      let subFromToken: string | undefined;
      try {
        // Decode the token specifically to get the 'sub' claim for our internal 'id'.
        const decodedToken = jwtDecode<{ sub?: string }>(idTokenForSub);
        subFromToken = decodedToken.sub;
      } catch (error) {
        console.error("Error decoding ID token in fetchUserAttributes:", error);
        // If 'sub' is critical and cannot be decoded, we might reject.
        // For now, it falls back to cognitoUser.getUsername() if subFromToken is undefined.
      }

      cognitoUser.getUserAttributes((err, attributes) => {
        if (err) {
          console.error("Failed to get user attributes:", err);
          reject(err);
          return;
        }

        if (attributes) {
          // The primary identifier 'id' for our User type is the 'sub' claim from the JWT.
          // cognitoUser.getUsername() is the username used for login, can be stored separately if needed.
          const baseUser: Partial<Pick<User, "id" | "name" | "email">> = {
            id: subFromToken || cognitoUser.getUsername(), // Fallback, though subFromToken is preferred.
          };
          attributes.forEach((attr) => {
            if (attr.Name === "email") baseUser.email = attr.Value;
            if (attr.Name === "name") baseUser.name = attr.Value;
            // Cognito 'sub' attribute from getUserAttributes is typically the same as in the token.
            // Prioritizing subFromToken ensures 'id' comes from the validated session token.
          });

          if (!baseUser.id) {
            // Should ideally always have an ID (sub or username)
            console.error(
              "User ID (sub/username) could not be determined in fetchUserAttributes."
            );
            return reject(new Error("User ID could not be determined."));
          }

          resolve(baseUser as Pick<User, "id" | "name" | "email">);
        } else {
          resolve(null); // No attributes found
        }
      });
    });
  },
}));

// Temporary store for Cognito user during NEW_PASSWORD_REQUIRED flow
import { create as createZustand } from "zustand";

interface PendingCognitoUserState {
  cognitoUser: unknown | null;
  setCognitoUser: (user: unknown) => void;
  clearCognitoUser: () => void;
}

export const usePendingCognitoUserStore =
  createZustand<PendingCognitoUserState>((set) => ({
    cognitoUser: null,
    setCognitoUser: (user) => set({ cognitoUser: user }),
    clearCognitoUser: () => set({ cognitoUser: null }),
  }));
