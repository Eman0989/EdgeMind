import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  ApiClientError,
} from "../../services/apiClient";

import {
  authService,
} from "../../services/authService";

import type {
  AuthSession,
  AuthUser,
} from "../../types/auth";

export type {
  AuthUser,
} from "../../types/auth";

interface LoginInput {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface UpdateProfileInput {
  name: string;
  email: string;
}


interface AuthResult {
  ok: boolean;
  message: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (
    input: LoginInput,
  ) => Promise<AuthResult>;
  register: (
    input: RegisterInput,
  ) => Promise<AuthResult>;
  updateProfile: (
    input: UpdateProfileInput,
  ) => Promise<AuthResult>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext =
  createContext<
    AuthContextValue | undefined
  >(undefined);

function normalizeEmail(
  value: string,
) {
  return value
    .trim()
    .toLowerCase();
}

function getErrorMessage(
  error: unknown,
  fallback: string,
) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (
    error instanceof Error &&
    error.message
  ) {
    return error.message;
  }

  return fallback;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const storedSession =
    authService.readSession();

  const [session, setSession] =
    useState<AuthSession | null>(
      storedSession,
    );

  useEffect(() => {
    if (!storedSession) {
      return;
    }

    let cancelled = false;

    authService
      .restoreSession(
        storedSession,
      )
      .then((restoredSession) => {
        if (!cancelled) {
          setSession(
            restoredSession,
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          authService.clearSession();
          setSession(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async ({
      email,
      password,
      rememberMe,
    }: LoginInput): Promise<AuthResult> => {
      try {
        const authenticatedSession =
          await authService.login(
            {
              email:
                normalizeEmail(email),
              password,
            },
            rememberMe,
          );

        setSession(
          authenticatedSession,
        );

        return {
          ok: true,
          message:
            "Authentication successful.",
        };
      } catch (error) {
        return {
          ok: false,
          message: getErrorMessage(
            error,
            "Authentication could not be completed.",
          ),
        };
      }
    },
    [],
  );

  const register = useCallback(
    async ({
      name,
      email,
      password,
    }: RegisterInput): Promise<AuthResult> => {
      try {
        const authenticatedSession =
          await authService.register({
            full_name: name.trim(),
            email:
              normalizeEmail(email),
            password,
          });

        setSession(
          authenticatedSession,
        );

        return {
          ok: true,
          message:
            "Account created successfully.",
        };
      } catch (error) {
        return {
          ok: false,
          message: getErrorMessage(
            error,
            "The account could not be created.",
          ),
        };
      }
    },
    [],
  );

  const updateProfile = useCallback(
    async ({
      name,
      email,
    }: UpdateProfileInput): Promise<AuthResult> => {
      if (!session) {
        return {
          ok: false,
          message:
            "You must be signed in to update your profile.",
        };
      }

      try {
        const updatedSession =
          await authService.updateProfile(
            session,
            {
              full_name: name.trim(),
              email:
                normalizeEmail(email),
            },
          );

        setSession(updatedSession);

        return {
          ok: true,
          message:
            "Profile updated successfully.",
        };
      } catch (error) {
        return {
          ok: false,
          message: getErrorMessage(
            error,
            "The profile could not be updated.",
          ),
        };
      }
    },
    [session],
  );


  const logout = useCallback(() => {
    authService.clearSession();
    setSession(null);
  }, []);

  const contextValue =
    useMemo<AuthContextValue>(
      () => ({
        user:
          session?.user ?? null,
        token:
          session?.token ?? null,
        isAuthenticated:
          session !== null,
        login,
        register,
        updateProfile,
        logout,
      }),
      [
        session,
        login,
        register,
        updateProfile,
        logout,
      ],
    );

  return (
    <AuthContext.Provider
      value={contextValue}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider.",
    );
  }

  return context;
}
