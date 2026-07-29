import {
  render,
  screen,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  EmptyState,
  ErrorState,
  LoadingSkeleton,
} from "./AsyncState";

describe("LoadingSkeleton", () => {
  it("announces that content is loading", () => {
    render(
      <LoadingSkeleton
        cards={2}
        rows={3}
      />,
    );

    const skeleton = screen.getByLabelText(
      "Loading content",
    );

    expect(skeleton).toHaveAttribute(
      "aria-busy",
      "true",
    );

    expect(
      screen.getByText("Loading data…"),
    ).toBeInTheDocument();

    expect(
      skeleton.querySelectorAll(
        ".async-skeleton-card",
      ),
    ).toHaveLength(2);

    expect(
      skeleton.querySelectorAll(
        ".async-skeleton-row",
      ),
    ).toHaveLength(3);
  });
});

describe("ErrorState", () => {
  it("shows the supplied error message", () => {
    render(
      <ErrorState message="The API is unavailable." />,
    );

    expect(
      screen.getByRole("alert"),
    ).toHaveTextContent(
      "Unable to load data",
    );

    expect(
      screen.getByText(
        "The API is unavailable.",
      ),
    ).toBeInTheDocument();
  });

  it("calls the retry handler", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(
      <ErrorState
        message="Request failed."
        retryLabel="Reload data"
        onRetry={onRetry}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: /reload data/i,
      }),
    );

    expect(onRetry).toHaveBeenCalledOnce();
  });
});

describe("EmptyState", () => {
  it("renders its content and action", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    render(
      <EmptyState
        eyebrow="NO RESULTS"
        title="No simulations found"
        message="Create a simulation to begin."
        actionLabel="Create simulation"
        onAction={onAction}
      />,
    );

    expect(
      screen.getByText("NO RESULTS"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "No simulations found",
      ),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: /create simulation/i,
      }),
    );

    expect(onAction).toHaveBeenCalledOnce();
  });
});
