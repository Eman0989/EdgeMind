import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../components/auth/AuthContext";

import DashboardLayout from "../components/dashboard/DashboardLayout";

import {
  simulationService,
} from "../services/simulationService";

import type {
  SimulationHistoryItem,
} from "../types/simulation";

import "./SimulationsPage.css";


function formatDate(
  value: string | null,
) {
  if (!value) {
    return "Not completed";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}


function getErrorMessage(
  error: unknown,
) {
  return error instanceof Error
    ? error.message
    : "Something went wrong.";
}


const PAGE_SIZE = 10;


export default function SimulationsPage() {
  const navigate = useNavigate();

  const {
    token,
  } = useAuth();

  const [
    simulations,
    setSimulations,
  ] = useState<
    SimulationHistoryItem[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const [
    busySimulationId,
    setBusySimulationId,
  ] = useState<string | null>(
    null,
  );

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    total,
    setTotal,
  ] = useState(0);

  const [
    totalPages,
    setTotalPages,
  ] = useState(0);

  const [
    renameTarget,
    setRenameTarget,
  ] = useState<
    SimulationHistoryItem | null
  >(null);

  const [
    renameValue,
    setRenameValue,
  ] = useState("");

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState<
    SimulationHistoryItem | null
  >(null);

  const [
    dialogError,
    setDialogError,
  ] = useState<string | null>(
    null,
  );


  const closeDialog = () => {
    if (busySimulationId) {
      return;
    }

    setRenameTarget(null);
    setRenameValue("");
    setDeleteTarget(null);
    setDialogError(null);
  };


  const openRenameDialog = (
    simulation: SimulationHistoryItem,
  ) => {
    setDeleteTarget(null);
    setRenameTarget(simulation);
    setRenameValue(simulation.name);
    setDialogError(null);
  };


  const openDeleteDialog = (
    simulation: SimulationHistoryItem,
  ) => {
    setRenameTarget(null);
    setRenameValue("");
    setDeleteTarget(simulation);
    setDialogError(null);
  };


  const loadSimulations =
    useCallback(
      async () => {
        if (!token) {
          setLoading(false);
          setError(
            "Authentication required.",
          );

          return;
        }

        setLoading(true);
        setError(null);

        try {
          const response =
            await simulationService.list(
              token,
              page,
              PAGE_SIZE,
            );

          setSimulations(
            response.simulations,
          );

          setTotal(
            response.total,
          );

          setTotalPages(
            response.totalPages,
          );
        } catch (requestError) {
          setError(
            getErrorMessage(
              requestError,
            ),
          );
        } finally {
          setLoading(false);
        }
      },
      [
        page,
        token,
      ],
    );


  useEffect(() => {
    void loadSimulations();
  }, [loadSimulations]);


  useEffect(() => {
    if (
      !renameTarget &&
      !deleteTarget
    ) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key === "Escape" &&
        !busySimulationId
      ) {
        setRenameTarget(null);
        setRenameValue("");
        setDeleteTarget(null);
        setDialogError(null);
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    busySimulationId,
    deleteTarget,
    renameTarget,
  ]);


  const openSimulation =
    async (
      simulationId: string,
    ) => {
      if (!token) {
        return;
      }

      setBusySimulationId(
        simulationId,
      );

      setError(null);

      try {
        const simulation =
          await simulationService.getById(
            simulationId,
            token,
          );

        navigate(
          "/simulation-result",
          {
            state: {
              simulation,
            },
          },
        );
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
          ),
        );

        setBusySimulationId(
          null,
        );
      }
    };


  const rerunSimulation =
    async (
      simulationId: string,
    ) => {
      if (!token) {
        return;
      }

      setBusySimulationId(
        simulationId,
      );

      setError(null);

      try {
        const savedSimulation =
          await simulationService.getById(
            simulationId,
            token,
          );

        const rerun =
          await simulationService.run(
            {
              ...savedSimulation.config,

              name:
                `${savedSimulation.config.name} Rerun`,
            },
            token,
          );

        navigate(
          "/simulation-result",
          {
            state: {
              simulation: rerun,
            },
          },
        );
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
          ),
        );

        setBusySimulationId(
          null,
        );
      }
    };


  const submitRename =
    async () => {
      if (
        !token ||
        !renameTarget
      ) {
        return;
      }

      const nextName =
        renameValue.trim();

      if (nextName.length < 2) {
        setDialogError(
          "The simulation name must contain at least two characters.",
        );

        return;
      }

      if (
        nextName ===
        renameTarget.name
      ) {
        closeDialog();
        return;
      }

      setBusySimulationId(
        renameTarget.id,
      );

      setDialogError(null);

      try {
        const renamed =
          await simulationService.rename(
            renameTarget.id,
            nextName,
            token,
          );

        setSimulations(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                renameTarget.id
                  ? {
                      ...item,
                      name:
                        renamed.name,
                    }
                  : item,
            ),
        );

        setRenameTarget(null);
        setRenameValue("");
      } catch (requestError) {
        setDialogError(
          getErrorMessage(
            requestError,
          ),
        );
      } finally {
        setBusySimulationId(
          null,
        );
      }
    };


  const confirmDelete =
    async () => {
      if (
        !token ||
        !deleteTarget
      ) {
        return;
      }

      setBusySimulationId(
        deleteTarget.id,
      );

      setDialogError(null);

      try {
        await simulationService.delete(
          deleteTarget.id,
          token,
        );

        setDeleteTarget(null);

        if (
          simulations.length === 1 &&
          page > 1
        ) {
          setPage(
            (currentPage) =>
              currentPage - 1,
          );
        } else {
          await loadSimulations();
        }
      } catch (requestError) {
        setDialogError(
          getErrorMessage(
            requestError,
          ),
        );
      } finally {
        setBusySimulationId(
          null,
        );
      }
    };


  return (
    <DashboardLayout>
      <section className="simulations-history">
        <header className="simulations-history-header">
          <div>
            <span>
              SIMULATION HISTORY
            </span>

            <h1>
              Saved simulations
            </h1>

            <p>
              Review previous CDN runs,
              reopen their results, rename
              them, or run the same
              configuration again.
            </p>
          </div>

          <div className="simulations-history-header-actions">
            <button
              type="button"
              onClick={() => {
                void loadSimulations();
              }}
              disabled={loading}
            >
              Refresh
            </button>

            <button
              type="button"
              className="is-primary"
              onClick={() => {
                navigate(
                  "/simulator",
                );
              }}
            >
              New simulation
            </button>
          </div>
        </header>

        <div className="simulations-history-summary">
          <span>
            <small>
              SAVED RUNS
            </small>

            <strong>
              {total}
            </strong>
          </span>

          <span>
            <small>
              STORAGE
            </small>

            <strong>
              EdgeMind database
            </strong>
          </span>

          <span>
            <small>
              ACCOUNT ACCESS
            </small>

            <strong>
              Private
            </strong>
          </span>
        </div>

        {error && (
          <div
            className="simulations-history-message is-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {loading && (
          <div className="simulations-history-message">
            Loading saved simulations…
          </div>
        )}

        {!loading &&
          !error &&
          simulations.length === 0 && (
            <div className="simulations-history-empty">
              <span>
                NO SAVED RUNS
              </span>

              <strong>
                Run your first simulation
              </strong>

              <p>
                Completed simulations will
                automatically appear here.
              </p>

              <button
                type="button"
                onClick={() => {
                  navigate(
                    "/simulator",
                  );
                }}
              >
                Open simulator
              </button>
            </div>
          )}

        {!loading &&
          simulations.length > 0 && (
            <div className="simulations-history-list">
              <div className="simulations-history-columns">
                <span>
                  Simulation
                </span>

                <span>
                  Route
                </span>

                <span>
                  Performance
                </span>

                <span>
                  Completed
                </span>

                <span>
                  Actions
                </span>
              </div>

              {simulations.map(
                (simulation) => {
                  const isBusy =
                    busySimulationId ===
                    simulation.id;

                  return (
                    <article
                      key={simulation.id}
                      className="simulations-history-row"
                    >
                      <div className="simulations-history-name">
                        <small>
                          {simulation.id}
                        </small>

                        <strong>
                          {simulation.name}
                        </strong>

                        <span>
                          <i />
                          {simulation.status}
                        </span>
                      </div>

                      <div className="simulations-history-route">
                        <small>
                          SELECTED PATH
                        </small>

                        <strong>
                          {simulation.route ||
                            "Route unavailable"}
                        </strong>
                      </div>

                      <div className="simulations-history-metrics">
                        <span>
                          <small>
                            LATENCY
                          </small>

                          <strong>
                            {simulation.latencyMs} ms
                          </strong>
                        </span>

                        <span>
                          <small>
                            CACHE HIT
                          </small>

                          <strong>
                            {simulation.cacheHitRate.toFixed(
                              1,
                            )}
                            %
                          </strong>
                        </span>

                        <span>
                          <small>
                            CONFIDENCE
                          </small>

                          <strong>
                            {simulation.confidence}%
                          </strong>
                        </span>
                      </div>

                      <div className="simulations-history-date">
                        <small>
                          COMPLETED
                        </small>

                        <strong>
                          {formatDate(
                            simulation.completedAt,
                          )}
                        </strong>
                      </div>

                      <div className="simulations-history-actions">
                        <button
                          type="button"
                          className="is-open"
                          disabled={isBusy}
                          onClick={() => {
                            void openSimulation(
                              simulation.id,
                            );
                          }}
                        >
                          {isBusy
                            ? "Working…"
                            : "Open"}
                        </button>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => {
                            void rerunSimulation(
                              simulation.id,
                            );
                          }}
                        >
                          Rerun
                        </button>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => {
                            openRenameDialog(
                              simulation,
                            );
                          }}
                        >
                          Rename
                        </button>

                        <button
                          type="button"
                          className="is-delete"
                          disabled={isBusy}
                          onClick={() => {
                            openDeleteDialog(
                              simulation,
                            );
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  );
                },
              )}

              <footer className="simulations-history-pagination">
                <span>
                  Page{" "}
                  {totalPages === 0
                    ? 0
                    : page}{" "}
                  of {totalPages}
                  {" · "}
                  {total} saved run
                  {total === 1
                    ? ""
                    : "s"}
                </span>

                <div>
                  <button
                    type="button"
                    disabled={
                      loading ||
                      page <= 1
                    }
                    onClick={() => {
                      setPage(
                        (currentPage) =>
                          Math.max(
                            1,
                            currentPage - 1,
                          ),
                      );
                    }}
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    disabled={
                      loading ||
                      totalPages === 0 ||
                      page >= totalPages
                    }
                    onClick={() => {
                      setPage(
                        (currentPage) =>
                          currentPage + 1,
                      );
                    }}
                  >
                    Next
                  </button>
                </div>
              </footer>
            </div>
          )}
        {renameTarget && (
          <div
            className="simulations-dialog-backdrop"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeDialog();
              }
            }}
          >
            <div
              className="simulations-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="rename-simulation-title"
            >
              <header>
                <div className="simulations-dialog-icon">
                  ✎
                </div>

                <div>
                  <span>
                    EDIT SAVED RUN
                  </span>

                  <h2 id="rename-simulation-title">
                    Rename simulation
                  </h2>

                  <p>
                    Update the display name
                    for {renameTarget.id}.
                  </p>
                </div>

                <button
                  type="button"
                  className="simulations-dialog-close"
                  aria-label="Close rename dialog"
                  disabled={
                    busySimulationId ===
                    renameTarget.id
                  }
                  onClick={closeDialog}
                >
                  ×
                </button>
              </header>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void submitRename();
                }}
              >
                <label
                  htmlFor="simulation-rename-input"
                >
                  Simulation name
                </label>

                <input
                  id="simulation-rename-input"
                  type="text"
                  autoFocus
                  maxLength={200}
                  value={renameValue}
                  disabled={
                    busySimulationId ===
                    renameTarget.id
                  }
                  onChange={(event) => {
                    setRenameValue(
                      event.target.value,
                    );

                    setDialogError(null);
                  }}
                />

                <div className="simulations-dialog-input-meta">
                  <span>
                    Use a clear name that
                    identifies this network run.
                  </span>

                  <strong>
                    {renameValue.length}/200
                  </strong>
                </div>

                {dialogError && (
                  <p
                    className="simulations-dialog-error"
                    role="alert"
                  >
                    {dialogError}
                  </p>
                )}

                <footer>
                  <button
                    type="button"
                    disabled={
                      busySimulationId ===
                      renameTarget.id
                    }
                    onClick={closeDialog}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="is-primary"
                    disabled={
                      busySimulationId ===
                      renameTarget.id
                    }
                  >
                    {busySimulationId ===
                    renameTarget.id
                      ? "Saving…"
                      : "Save changes"}
                  </button>
                </footer>
              </form>
            </div>
          </div>
        )}

        {deleteTarget && (
          <div
            className="simulations-dialog-backdrop"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeDialog();
              }
            }}
          >
            <div
              className="simulations-dialog is-danger"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-simulation-title"
            >
              <header>
                <div className="simulations-dialog-icon">
                  !
                </div>

                <div>
                  <span>
                    PERMANENT ACTION
                  </span>

                  <h2 id="delete-simulation-title">
                    Delete simulation?
                  </h2>

                  <p>
                    This saved run and its
                    route data will be removed
                    permanently.
                  </p>
                </div>

                <button
                  type="button"
                  className="simulations-dialog-close"
                  aria-label="Close delete dialog"
                  disabled={
                    busySimulationId ===
                    deleteTarget.id
                  }
                  onClick={closeDialog}
                >
                  ×
                </button>
              </header>

              <div className="simulations-dialog-record">
                <small>
                  {deleteTarget.id}
                </small>

                <strong>
                  {deleteTarget.name}
                </strong>

                <span>
                  {deleteTarget.route}
                </span>
              </div>

              {dialogError && (
                <p
                  className="simulations-dialog-error"
                  role="alert"
                >
                  {dialogError}
                </p>
              )}

              <footer>
                <button
                  type="button"
                  disabled={
                    busySimulationId ===
                    deleteTarget.id
                  }
                  onClick={closeDialog}
                >
                  Keep simulation
                </button>

                <button
                  type="button"
                  className="simulations-dialog-delete"
                  disabled={
                    busySimulationId ===
                    deleteTarget.id
                  }
                  onClick={() => {
                    void confirmDelete();
                  }}
                >
                  {busySimulationId ===
                  deleteTarget.id
                    ? "Deleting…"
                    : "Delete permanently"}
                </button>
              </footer>
            </div>
          </div>
        )}

      </section>
    </DashboardLayout>
  );
}
