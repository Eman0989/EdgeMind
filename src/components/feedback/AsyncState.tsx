import type {
  ReactNode,
} from "react";

import "./AsyncState.css";


interface SkeletonProps {
  rows?: number;
  cards?: number;
}


interface ErrorStateProps {
  title?: string;
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
}


interface EmptyStateProps {
  eyebrow?: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}


export function LoadingSkeleton({
  rows = 4,
  cards = 3,
}: SkeletonProps) {
  return (
    <div
      className="async-skeleton"
      aria-label="Loading content"
      aria-busy="true"
    >
      <div className="async-skeleton-cards">
        {Array.from({
          length: cards,
        }).map((_, index) => (
          <div
            key={index}
            className="async-skeleton-card"
          >
            <span />
            <strong />
            <small />
          </div>
        ))}
      </div>

      <div className="async-skeleton-table">
        <div className="async-skeleton-heading">
          <span />
          <span />
          <span />
        </div>

        {Array.from({
          length: rows,
        }).map((_, index) => (
          <div
            key={index}
            className="async-skeleton-row"
          >
            <span />
            <span />
            <span />
            <span />
          </div>
        ))}
      </div>

      <span className="async-screen-reader">
        Loading data…
      </span>
    </div>
  );
}


export function ErrorState({
  title = "Unable to load data",
  message,
  retryLabel = "Try again",
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      className="async-state is-error"
      role="alert"
    >
      <div className="async-state-icon">
        !
      </div>

      <div className="async-state-content">
        <span>
          REQUEST FAILED
        </span>

        <strong>
          {title}
        </strong>

        <p>
          {message}
        </p>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
        >
          {retryLabel}

          <span aria-hidden="true">
            ↻
          </span>
        </button>
      )}
    </div>
  );
}


export function EmptyState({
  eyebrow = "NOTHING HERE YET",
  title,
  message,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="async-state is-empty">
      <div className="async-state-icon">
        {icon ?? "○"}
      </div>

      <div className="async-state-content">
        <span>
          {eyebrow}
        </span>

        <strong>
          {title}
        </strong>

        <p>
          {message}
        </p>
      </div>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
        >
          {actionLabel}

          <span aria-hidden="true">
            ↗
          </span>
        </button>
      )}
    </div>
  );
}
