import {
  useState,
  type FormEvent,
} from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import AuthShell from "../components/auth/AuthShell";
import {
  useAuth,
} from "../components/auth/AuthContext";

interface LoginErrors {
  email?: string;
  password?: string;
}

interface LoginLocationState {
  from?: string;
}

function isValidEmail(
  value: string,
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value,
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    login,
  } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [rememberMe, setRememberMe] =
    useState(true);

  const [showPassword, setShowPassword] =
    useState(false);

  const [errors, setErrors] =
    useState<LoginErrors>({});

  const [status, setStatus] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const locationState =
    location.state as
      | LoginLocationState
      | null;

  const destination =
    locationState?.from &&
    locationState.from !== "/login"
      ? locationState.from
      : "/dashboard";

  const validate = () => {
    const nextErrors: LoginErrors = {};

    if (!email.trim()) {
      nextErrors.email =
        "Enter your email address.";
    } else if (!isValidEmail(email)) {
      nextErrors.email =
        "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password =
        "Enter your password.";
    } else if (password.length < 8) {
      nextErrors.password =
        "Password must contain at least 8 characters.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setStatus("");

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    const result = await login({
      email,
      password,
      rememberMe,
    });

    setIsSubmitting(false);

    if (!result.ok) {
      setErrors({
        password: result.message,
      });

      return;
    }

    navigate(destination, {
      replace: true,
    });
  };

  const useDemoAccount = () => {
    setEmail("demo@edgemind.dev");
    setPassword("EdgeMind2026");
    setErrors({});
    setStatus(
      "Demo credentials loaded. Select Enter control plane.",
    );
  };

  return (
    <AuthShell
      eyebrow="ACCOUNT ACCESS"
      title="Welcome back."
      description="Sign in to open your EdgeMind control plane and continue working with network simulations."
      footerText="New to EdgeMind?"
      footerLinkLabel="Create an account"
      footerLinkTo="/register"
    >
      <form
        className="auth-form"
        onSubmit={handleSubmit}
        noValidate
      >
        <label className="auth-form-field">
          <span>
            EMAIL ADDRESS
          </span>

          <div className="auth-input-wrap">
            <input
              type="email"
              value={email}
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              onChange={(event) => {
                setEmail(event.target.value);

                if (errors.email) {
                  setErrors(
                    (currentErrors) => ({
                      ...currentErrors,
                      email: undefined,
                    }),
                  );
                }
              }}
            />

            <span
              className="auth-input-icon"
              aria-hidden="true"
            >
              @
            </span>
          </div>

          {errors.email && (
            <small className="auth-field-error">
              {errors.email}
            </small>
          )}
        </label>

        <label className="auth-form-field">
          <span>
            <span>PASSWORD</span>

            <Link to="/login">
              Forgot password?
            </Link>
          </span>

          <div className="auth-input-wrap">
            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={password}
              placeholder="Enter your password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              onChange={(event) => {
                setPassword(event.target.value);

                if (errors.password) {
                  setErrors(
                    (currentErrors) => ({
                      ...currentErrors,
                      password: undefined,
                    }),
                  );
                }
              }}
            />

            <button
              className="auth-input-icon"
              type="button"
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              onClick={() => {
                setShowPassword(
                  (currentValue) =>
                    !currentValue,
                );
              }}
            >
              {showPassword
                ? "HIDE"
                : "SHOW"}
            </button>
          </div>

          {errors.password && (
            <small className="auth-field-error">
              {errors.password}
            </small>
          )}
        </label>

        <div className="auth-form-options">
          <label className="auth-checkbox">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => {
                setRememberMe(
                  event.target.checked,
                );
              }}
            />

            <span>
              Keep me signed in on this device
            </span>
          </label>
        </div>

        <button
          className="auth-form-submit"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Authenticating..."
            : "Enter control plane"}

          <span>↗</span>
        </button>

        {status && (
          <p className="auth-form-status">
            {status}
          </p>
        )}

        <div className="auth-form-divider">
          <span>
            OR CONTINUE WITH
          </span>
        </div>

        <button
          className="auth-demo-button"
          type="button"
          onClick={useDemoAccount}
        >
          Use demonstration account

          <span>
            LOAD CREDENTIALS
          </span>
        </button>
      </form>
    </AuthShell>
  );
}