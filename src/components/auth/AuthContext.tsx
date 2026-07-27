import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const ACCOUNTS_STORAGE_KEY =
  "edgemind_mock_accounts_v1";

const AUTH_SESSION_KEY =
  "edgemind_auth_session_v1";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface StoredAccount extends AuthUser {
  passwordHash: string;
}

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

interface AuthResult {
  ok: boolean;
  message: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (
    input: LoginInput,
  ) => Promise<AuthResult>;
  register: (
    input: RegisterInput,
  ) => Promise<AuthResult>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const DEMO_ACCOUNT: StoredAccount = {
  id: "edgemind-demo-user",
  name: "Demo Operator",
  email: "demo@edgemind.dev",
  passwordHash:
    "3e33961bba9e645900db0e3fa999668664d549382c9f3ed6b4fd974a800c5992",
  createdAt:
    "2026-01-01T00:00:00.000Z",
};

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

function isAuthUser(
  value: unknown,
): value is AuthUser {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const candidate =
    value as Partial<AuthUser>;

  return (
    typeof candidate.id ===
      "string" &&
    typeof candidate.name ===
      "string" &&
    typeof candidate.email ===
      "string" &&
    typeof candidate.createdAt ===
      "string"
  );
}

function isStoredAccount(
  value: unknown,
): value is StoredAccount {
  return (
    isAuthUser(value) &&
    typeof (
      value as Partial<StoredAccount>
    ).passwordHash === "string"
  );
}

function parseSession(
  rawValue: string | null,
) {
  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue: unknown =
      JSON.parse(rawValue);

    return isAuthUser(parsedValue)
      ? parsedValue
      : null;
  } catch {
    return null;
  }
}

function readStoredSession() {
  try {
    const persistentSession =
      parseSession(
        window.localStorage.getItem(
          AUTH_SESSION_KEY,
        ),
      );

    if (persistentSession) {
      return persistentSession;
    }

    return parseSession(
      window.sessionStorage.getItem(
        AUTH_SESSION_KEY,
      ),
    );
  } catch {
    return null;
  }
}

function readAccounts() {
  let storedAccounts:
    StoredAccount[] = [];

  try {
    const rawValue =
      window.localStorage.getItem(
        ACCOUNTS_STORAGE_KEY,
      );

    if (rawValue) {
      const parsedValue: unknown =
        JSON.parse(rawValue);

      if (Array.isArray(parsedValue)) {
        storedAccounts =
          parsedValue.filter(
            isStoredAccount,
          );
      }
    }
  } catch {
    storedAccounts = [];
  }

  const accountsWithoutDemo =
    storedAccounts.filter(
      (account) =>
        normalizeEmail(
          account.email,
        ) !== DEMO_ACCOUNT.email,
    );

  return [
    DEMO_ACCOUNT,
    ...accountsWithoutDemo,
  ];
}

function writeAccounts(
  accounts: StoredAccount[],
) {
  try {
    window.localStorage.setItem(
      ACCOUNTS_STORAGE_KEY,
      JSON.stringify(accounts),
    );

    return true;
  } catch {
    return false;
  }
}

function writeSession(
  user: AuthUser,
  rememberMe: boolean,
) {
  try {
    window.localStorage.removeItem(
      AUTH_SESSION_KEY,
    );

    window.sessionStorage.removeItem(
      AUTH_SESSION_KEY,
    );

    const targetStorage =
      rememberMe
        ? window.localStorage
        : window.sessionStorage;

    targetStorage.setItem(
      AUTH_SESSION_KEY,
      JSON.stringify(user),
    );

    return true;
  } catch {
    return false;
  }
}

async function hashPassword(
  password: string,
) {
  if (!window.crypto?.subtle) {
    throw new Error(
      "Secure browser hashing is unavailable.",
    );
  }

  const encodedPassword =
    new TextEncoder().encode(
      password,
    );

  const digest =
    await window.crypto.subtle.digest(
      "SHA-256",
      encodedPassword,
    );

  return Array.from(
    new Uint8Array(digest),
  )
    .map((byte) =>
      byte
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");
}

function createUserId() {
  if (
    typeof window.crypto
      .randomUUID === "function"
  ) {
    return window.crypto.randomUUID();
  }

  return [
    "edgemind",
    Date.now().toString(36),
    Math.random()
      .toString(36)
      .slice(2),
  ].join("-");
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<AuthUser | null>(
      readStoredSession,
    );

  const login = useCallback(
    async ({
      email,
      password,
      rememberMe,
    }: LoginInput) => {
      try {
        const normalizedEmail =
          normalizeEmail(email);

        const account =
          readAccounts().find(
            (candidate) =>
              normalizeEmail(
                candidate.email,
              ) === normalizedEmail,
          );

        if (!account) {
          return {
            ok: false,
            message:
              "The email or password is incorrect.",
          };
        }

        const passwordHash =
          await hashPassword(
            password,
          );

        if (
          passwordHash !==
          account.passwordHash
        ) {
          return {
            ok: false,
            message:
              "The email or password is incorrect.",
          };
        }

        const authenticatedUser:
          AuthUser = {
            id: account.id,
            name: account.name,
            email: account.email,
            createdAt:
              account.createdAt,
          };

        if (
          !writeSession(
            authenticatedUser,
            rememberMe,
          )
        ) {
          return {
            ok: false,
            message:
              "Your browser blocked session storage.",
          };
        }

        setUser(authenticatedUser);

        return {
          ok: true,
          message:
            "Authentication successful.",
        };
      } catch {
        return {
          ok: false,
          message:
            "Authentication could not be completed in this browser.",
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
    }: RegisterInput) => {
      try {
        const normalizedEmail =
          normalizeEmail(email);

        const accounts =
          readAccounts();

        const accountExists =
          accounts.some(
            (account) =>
              normalizeEmail(
                account.email,
              ) === normalizedEmail,
          );

        if (accountExists) {
          return {
            ok: false,
            message:
              "An account already exists for this email address.",
          };
        }

        const passwordHash =
          await hashPassword(
            password,
          );

        const newAccount:
          StoredAccount = {
            id: createUserId(),
            name: name.trim(),
            email: normalizedEmail,
            passwordHash,
            createdAt:
              new Date().toISOString(),
          };

        const nextAccounts = [
          ...accounts,
          newAccount,
        ];

        if (
          !writeAccounts(
            nextAccounts,
          )
        ) {
          return {
            ok: false,
            message:
              "Your browser blocked account storage.",
          };
        }

        const authenticatedUser:
          AuthUser = {
            id: newAccount.id,
            name: newAccount.name,
            email: newAccount.email,
            createdAt:
              newAccount.createdAt,
          };

        if (
          !writeSession(
            authenticatedUser,
            true,
          )
        ) {
          return {
            ok: false,
            message:
              "The account was created, but the session could not be saved.",
          };
        }

        setUser(authenticatedUser);

        return {
          ok: true,
          message:
            "Account created successfully.",
        };
      } catch {
        return {
          ok: false,
          message:
            "The account could not be created in this browser.",
        };
      }
    },
    [],
  );

  const logout = useCallback(() => {
    try {
      window.localStorage.removeItem(
        AUTH_SESSION_KEY,
      );

      window.sessionStorage.removeItem(
        AUTH_SESSION_KEY,
      );
    } finally {
      setUser(null);
    }
  }, []);

  const contextValue =
    useMemo<AuthContextValue>(
      () => ({
        user,
        isAuthenticated:
          user !== null,
        login,
        register,
        logout,
      }),
      [
        user,
        login,
        register,
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