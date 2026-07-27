import {
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  useNavigate,
} from "react-router-dom";
import AuthShell from "../components/auth/AuthShell";
import {
  useAuth,
} from "../components/auth/AuthContext";

interface RegisterErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

function isValidEmail(
  value: string,
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value,
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();

  const {
    register,
  } = useAuth();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [acceptedTerms, setAcceptedTerms] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [errors, setErrors] =
    useState<RegisterErrors>({});

  const [status, setStatus] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const passwordRules = useMemo(
    () => ({
      length: password.length >= 8,
      uppercase:
        /[A-Z]/.test(password),
      number:
        /\d/.test(password),
      symbol:
        /[^A-Za-z0-9]/.test(
          password,
        ),
    }),
    [password],
  );

  const passwordScore =
    Object.values(
      passwordRules,
    ).filter(Boolean).length;

  const passwordLabel =
    passwordScore === 0
      ? "Not entered"
      : passwordScore === 1
        ? "Weak"
        : passwordScore === 2
          ? "Fair"
          : passwordScore === 3
            ? "Strong"
            : "Excellent";

  const validate = () => {
    const nextErrors: RegisterErrors =
      {};

    if (!name.trim()) {
      nextErrors.name =
        "Enter your full name.";
    } else if (
      name.trim().length < 2
    ) {
      nextErrors.name =
        "Name must contain at least 2 characters.";
    }

    if (!email.trim()) {
      nextErrors.email =
        "Enter your email address.";
    } else if (!isValidEmail(email)) {
      nextErrors.email =
        "Enter a valid email address.";
    }

    if (
      !Object.values(
        passwordRules,
      ).every(Boolean)
    ) {
      nextErrors.password =
        "Password must satisfy all four requirements.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword =
        "Confirm your password.";
    } else if (
      confirmPassword !== password
    ) {
      nextErrors.confirmPassword =
        "Passwords do not match.";
    }

    if (!acceptedTerms) {
      nextErrors.terms =
        "Accept the terms to create an account.";
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

    const result =
      await register({
        name,
        email,
        password,
      });

    setIsSubmitting(false);

    if (!result.ok) {
      setStatus(result.message);

      return;
    }

    navigate(
      "/dashboard",
      {
        replace: true,
      },
    );
  };

  return (
    <AuthShell
      eyebrow="CREATE ACCOUNT"
      title="Build your workspace."
      description="Create an EdgeMind account to save simulations, compare routes, and manage your network workspace."
      footerText="Already have an account?"
      footerLinkLabel="Log in"
      footerLinkTo="/login"
    >
      <form
        className="auth-form"
        onSubmit={handleSubmit}
        noValidate
      >
        <label className="auth-form-field">
          <span>
            FULL NAME
          </span>

          <div className="auth-input-wrap">
            <input
              type="text"
              value={name}
              placeholder="Your full name"
              autoComplete="name"
              aria-invalid={
                Boolean(errors.name)
              }
              onChange={(event) => {
                setName(
                  event.target.value,
                );

                if (errors.name) {
                  setErrors(
                    (currentErrors) => ({
                      ...currentErrors,
                      name: undefined,
                    }),
                  );
                }
              }}
            />

            <span
              className="auth-input-icon"
              aria-hidden="true"
            >
              ID
            </span>
          </div>

          {errors.name && (
            <small className="auth-field-error">
              {errors.name}
            </small>
          )}
        </label>

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
              aria-invalid={
                Boolean(errors.email)
              }
              onChange={(event) => {
                setEmail(
                  event.target.value,
                );

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
            PASSWORD
          </span>

          <div className="auth-input-wrap">
            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={password}
              placeholder="Create a password"
              autoComplete="new-password"
              aria-invalid={
                Boolean(errors.password)
              }
              onChange={(event) => {
                setPassword(
                  event.target.value,
                );

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

          <div className="auth-password-strength">
            <div className="auth-password-strength-track">
              {[1, 2, 3, 4].map(
                (level) => (
                  <i
                    key={level}
                    className={
                      passwordScore >=
                      level
                        ? "is-active"
                        : ""
                    }
                  />
                ),
              )}
            </div>

            <div>
              <span>
                PASSWORD STRENGTH
              </span>

              <strong>
                {passwordLabel}
              </strong>
            </div>
          </div>

          <ul className="auth-password-rules">
            <li
              className={
                passwordRules.length
                  ? "is-valid"
                  : ""
              }
            >
              <i />
              8+ characters
            </li>

            <li
              className={
                passwordRules.uppercase
                  ? "is-valid"
                  : ""
              }
            >
              <i />
              Uppercase letter
            </li>

            <li
              className={
                passwordRules.number
                  ? "is-valid"
                  : ""
              }
            >
              <i />
              Number
            </li>

            <li
              className={
                passwordRules.symbol
                  ? "is-valid"
                  : ""
              }
            >
              <i />
              Symbol
            </li>
          </ul>

          {errors.password && (
            <small className="auth-field-error">
              {errors.password}
            </small>
          )}
        </label>

        <label className="auth-form-field">
          <span>
            CONFIRM PASSWORD
          </span>

          <div className="auth-input-wrap">
            <input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              value={confirmPassword}
              placeholder="Repeat your password"
              autoComplete="new-password"
              aria-invalid={
                Boolean(
                  errors.confirmPassword,
                )
              }
              onChange={(event) => {
                setConfirmPassword(
                  event.target.value,
                );

                if (
                  errors.confirmPassword
                ) {
                  setErrors(
                    (currentErrors) => ({
                      ...currentErrors,
                      confirmPassword:
                        undefined,
                    }),
                  );
                }
              }}
            />

            <button
              className="auth-input-icon"
              type="button"
              aria-label={
                showConfirmPassword
                  ? "Hide confirmation password"
                  : "Show confirmation password"
              }
              onClick={() => {
                setShowConfirmPassword(
                  (currentValue) =>
                    !currentValue,
                );
              }}
            >
              {showConfirmPassword
                ? "HIDE"
                : "SHOW"}
            </button>
          </div>

          {errors.confirmPassword && (
            <small className="auth-field-error">
              {errors.confirmPassword}
            </small>
          )}
        </label>

        <div className="auth-form-options">
          <label className="auth-checkbox">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => {
                setAcceptedTerms(
                  event.target.checked,
                );

                if (errors.terms) {
                  setErrors(
                    (currentErrors) => ({
                      ...currentErrors,
                      terms: undefined,
                    }),
                  );
                }
              }}
            />

            <span>
              I agree to the Terms of Service
              and Privacy Policy.
            </span>
          </label>
        </div>

        {errors.terms && (
          <small className="auth-field-error">
            {errors.terms}
          </small>
        )}

        <button
          className="auth-form-submit"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Creating account..."
            : "Create EdgeMind account"}

          <span>↗</span>
        </button>

        {status && (
          <p className="auth-form-status is-error">
            {status}
          </p>
        )}
      </form>
    </AuthShell>
  );
}