import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../components/auth/AuthContext";

import DashboardLayout from "../components/dashboard/DashboardLayout";

import "./SettingsPage.css";


function getInitials(
  name: string,
) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "EM";
  }

  return parts
    .map((part) =>
      part[0]?.toUpperCase(),
    )
    .join("");
}


function formatMemberDate(
  value: string | undefined,
) {
  if (!value) {
    return "Unavailable";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      dateStyle: "medium",
    },
  ).format(date);
}


export default function SettingsPage() {
  const navigate = useNavigate();

  const {
    user,
    updateProfile,
    logout,
  } = useAuth();

  const [
    name,
    setName,
  ] = useState(
    user?.name ?? "",
  );

  const [
    email,
    setEmail,
  ] = useState(
    user?.email ?? "",
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState<string | null>(
    null,
  );

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(
    null,
  );


  useEffect(() => {
    setName(
      user?.name ?? "",
    );

    setEmail(
      user?.email ?? "",
    );
  }, [
    user?.name,
    user?.email,
  ]);


  const normalizedName =
    name.trim();

  const normalizedEmail =
    email.trim().toLowerCase();

  const isDirty =
    normalizedName !==
      (user?.name ?? "") ||
    normalizedEmail !==
      (user?.email ?? "");

  const isValid =
    normalizedName.length >= 2 &&
    normalizedEmail.includes("@");

  const initials = useMemo(
    () =>
      getInitials(
        user?.name ??
          "EdgeMind Operator",
      ),
    [user?.name],
  );


  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setSuccessMessage(null);
    setErrorMessage(null);

    if (!isValid) {
      setErrorMessage(
        "Enter a valid name and email address.",
      );

      return;
    }

    setSaving(true);

    const result =
      await updateProfile({
        name: normalizedName,
        email: normalizedEmail,
      });

    setSaving(false);

    if (!result.ok) {
      setErrorMessage(
        result.message,
      );

      return;
    }

    setSuccessMessage(
      result.message,
    );
  };


  const handleReset = () => {
    setName(
      user?.name ?? "",
    );

    setEmail(
      user?.email ?? "",
    );

    setSuccessMessage(null);
    setErrorMessage(null);
  };


  const handleLogout = () => {
    logout();

    navigate(
      "/login",
      {
        replace: true,
      },
    );
  };


  return (
    <DashboardLayout>
      <section className="settings-page">
        <header className="settings-heading">
          <div>
            <span>
              ACCOUNT CONTROL
            </span>

            <h1>
              Settings
            </h1>

            <p>
              Manage your EdgeMind identity,
              account details, and active
              session.
            </p>
          </div>

          <div className="settings-status">
            <i />

            PROFILE CONNECTED
          </div>
        </header>


        <div className="settings-grid">
          <aside className="settings-profile-card">
            <div className="settings-avatar">
              {initials}
            </div>

            <h2>
              {user?.name ??
                "EdgeMind Operator"}
            </h2>

            <p>
              {user?.email ??
                "operator@edgemind.dev"}
            </p>

            <div className="settings-profile-state">
              <i />

              AUTHENTICATED
            </div>

            <dl>
              <div>
                <dt>
                  USER ID
                </dt>

                <dd>
                  {user?.id
                    ? `USR-${user.id.padStart(
                        6,
                        "0",
                      )}`
                    : "Unavailable"}
                </dd>
              </div>

              <div>
                <dt>
                  MEMBER SINCE
                </dt>

                <dd>
                  {formatMemberDate(
                    user?.createdAt,
                  )}
                </dd>
              </div>

              <div>
                <dt>
                  ACCESS LEVEL
                </dt>

                <dd>
                  Workspace operator
                </dd>
              </div>
            </dl>
          </aside>


          <div className="settings-main-column">
            <article className="settings-panel">
              <header>
                <div>
                  <span>
                    PROFILE
                  </span>

                  <h2>
                    Account details
                  </h2>

                  <p>
                    These details appear in
                    your dashboard header and
                    saved workspace session.
                  </p>
                </div>

                <div className="settings-panel-icon">
                  ID
                </div>
              </header>

              <form
                className="settings-form"
                onSubmit={handleSubmit}
              >
                <label>
                  <span>
                    FULL NAME
                  </span>

                  <input
                    type="text"
                    value={name}
                    minLength={2}
                    maxLength={120}
                    autoComplete="name"
                    placeholder="Your full name"
                    disabled={saving}
                    onChange={(event) => {
                      setName(
                        event.target.value,
                      );

                      setSuccessMessage(null);
                      setErrorMessage(null);
                    }}
                  />
                </label>

                <label>
                  <span>
                    EMAIL ADDRESS
                  </span>

                  <input
                    type="email"
                    value={email}
                    maxLength={320}
                    autoComplete="email"
                    placeholder="name@example.com"
                    disabled={saving}
                    onChange={(event) => {
                      setEmail(
                        event.target.value,
                      );

                      setSuccessMessage(null);
                      setErrorMessage(null);
                    }}
                  />
                </label>

                <div className="settings-form-note">
                  Changing your email also
                  changes the address you use
                  to log in.
                </div>

                {errorMessage && (
                  <div
                    className="settings-message is-error"
                    role="alert"
                  >
                    <i />

                    {errorMessage}
                  </div>
                )}

                {successMessage && (
                  <div
                    className="settings-message is-success"
                    role="status"
                  >
                    <i />

                    {successMessage}
                  </div>
                )}

                <footer>
                  <button
                    type="button"
                    className="settings-secondary-button"
                    disabled={
                      saving ||
                      !isDirty
                    }
                    onClick={handleReset}
                  >
                    Reset
                  </button>

                  <button
                    type="submit"
                    className="settings-primary-button"
                    disabled={
                      saving ||
                      !isDirty ||
                      !isValid
                    }
                  >
                    {saving
                      ? "Saving changes…"
                      : "Save changes"}
                  </button>
                </footer>
              </form>
            </article>


            <article className="settings-panel settings-session-panel">
              <header>
                <div>
                  <span>
                    SECURITY
                  </span>

                  <h2>
                    Active session
                  </h2>

                  <p>
                    Your authentication token
                    grants access to private
                    simulations and account
                    data.
                  </p>
                </div>

                <div className="settings-panel-icon">
                  SEC
                </div>
              </header>

              <div className="settings-session-row">
                <div>
                  <i />

                  <span>
                    <strong>
                      Current browser
                    </strong>

                    <small>
                      Active authenticated
                      session
                    </small>
                  </span>
                </div>

                <span className="settings-session-badge">
                  ACTIVE
                </span>
              </div>
            </article>


            <article className="settings-panel settings-danger-panel">
              <header>
                <div>
                  <span>
                    SESSION CONTROL
                  </span>

                  <h2>
                    Log out of EdgeMind
                  </h2>

                  <p>
                    This removes the current
                    authentication session
                    from this browser.
                  </p>
                </div>
              </header>

              <button
                type="button"
                className="settings-logout-button"
                onClick={handleLogout}
              >
                Log out
              </button>
            </article>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
