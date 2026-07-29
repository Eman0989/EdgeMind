import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import "./NotificationContext.css";


export type NotificationTone =
  | "success"
  | "error"
  | "info";


interface NotificationInput {
  title: string;
  message: string;
  tone?: NotificationTone;
  duration?: number;
}


interface NotificationItem
  extends NotificationInput {
  id: number;
  tone: NotificationTone;
}


interface NotificationContextValue {
  notify: (
    notification: NotificationInput,
  ) => void;
  dismissNotification: (
    id: number,
  ) => void;
}


interface NotificationProviderProps {
  children: ReactNode;
}


const NotificationContext =
  createContext<
    NotificationContextValue | undefined
  >(undefined);


export function NotificationProvider({
  children,
}: NotificationProviderProps) {
  const [
    notifications,
    setNotifications,
  ] = useState<NotificationItem[]>([]);

  const nextId = useRef(1);


  const dismissNotification =
    useCallback(
      (id: number) => {
        setNotifications(
          (currentNotifications) =>
            currentNotifications.filter(
              (notification) =>
                notification.id !== id,
            ),
        );
      },
      [],
    );


  const notify = useCallback(
    ({
      title,
      message,
      tone = "info",
      duration = 4500,
    }: NotificationInput) => {
      const id = nextId.current;

      nextId.current += 1;

      setNotifications(
        (currentNotifications) => [
          ...currentNotifications,
          {
            id,
            title,
            message,
            tone,
            duration,
          },
        ].slice(-4),
      );

      if (duration > 0) {
        window.setTimeout(() => {
          dismissNotification(id);
        }, duration);
      }
    },
    [dismissNotification],
  );


  const contextValue =
    useMemo<NotificationContextValue>(
      () => ({
        notify,
        dismissNotification,
      }),
      [
        notify,
        dismissNotification,
      ],
    );


  return (
    <NotificationContext.Provider
      value={contextValue}
    >
      {children}

      <div
        className="notification-viewport"
        aria-live="polite"
        aria-label="Application notifications"
      >
        {notifications.map(
          (notification) => (
            <article
              key={notification.id}
              className={[
                "notification-toast",
                `is-${notification.tone}`,
              ].join(" ")}
              role={
                notification.tone ===
                "error"
                  ? "alert"
                  : "status"
              }
            >
              <div className="notification-toast-icon">
                {notification.tone ===
                "success"
                  ? "✓"
                  : notification.tone ===
                      "error"
                    ? "!"
                    : "i"}
              </div>

              <div>
                <span>
                  {notification.tone.toUpperCase()}
                </span>

                <strong>
                  {notification.title}
                </strong>

                <p>
                  {notification.message}
                </p>
              </div>

              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => {
                  dismissNotification(
                    notification.id,
                  );
                }}
              >
                ×
              </button>
            </article>
          ),
        )}
      </div>
    </NotificationContext.Provider>
  );
}


export function useNotifications() {
  const context =
    useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider.",
    );
  }

  return context;
}
