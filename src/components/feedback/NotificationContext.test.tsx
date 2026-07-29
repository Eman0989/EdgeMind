import {
  act,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  NotificationProvider,
  useNotifications,
  type NotificationTone,
} from "./NotificationContext";

interface TriggerProps {
  tone?: NotificationTone;
  duration?: number;
}

function NotificationTrigger({
  tone = "success",
  duration = 0,
}: TriggerProps) {
  const {
    notify,
  } = useNotifications();

  return (
    <button
      type="button"
      onClick={() => {
        notify({
          title: "Simulation saved",
          message:
            "The simulation is now available.",
          tone,
          duration,
        });
      }}
    >
      Show notification
    </button>
  );
}

describe("NotificationProvider", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders a success notification", async () => {
    const user = userEvent.setup();

    render(
      <NotificationProvider>
        <NotificationTrigger />
      </NotificationProvider>,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Show notification",
      }),
    );

    const notification =
      screen.getByRole("status");

    expect(notification).toHaveTextContent(
      "SUCCESS",
    );

    expect(notification).toHaveTextContent(
      "Simulation saved",
    );

    expect(notification).toHaveTextContent(
      "The simulation is now available.",
    );
  });

  it("uses alert semantics for errors", async () => {
    const user = userEvent.setup();

    render(
      <NotificationProvider>
        <NotificationTrigger tone="error" />
      </NotificationProvider>,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Show notification",
      }),
    );

    expect(
      screen.getByRole("alert"),
    ).toHaveTextContent("ERROR");
  });

  it("allows a notification to be dismissed", async () => {
    const user = userEvent.setup();

    render(
      <NotificationProvider>
        <NotificationTrigger />
      </NotificationProvider>,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Show notification",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "Dismiss notification",
      }),
    );

    expect(
      screen.queryByRole("status"),
    ).not.toBeInTheDocument();
  });

  it("automatically removes timed notifications", () => {
    vi.useFakeTimers();

    render(
      <NotificationProvider>
        <NotificationTrigger
          duration={1000}
        />
      </NotificationProvider>,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Show notification",
      }),
    );

    expect(
      screen.getByRole("status"),
    ).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(
      screen.queryByRole("status"),
    ).not.toBeInTheDocument();
  });

  it("throws when the hook is used outside its provider", () => {
    function InvalidConsumer() {
      useNotifications();

      return null;
    }

    expect(() => {
      render(<InvalidConsumer />);
    }).toThrow(
      "useNotifications must be used inside NotificationProvider.",
    );
  });
});
