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
            );

          setSimulations(
            response.simulations,
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
      [token],
    );


  useEffect(() => {
    void loadSimulations();
  }, [loadSimulations]);


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


  const renameSimulation =
    async (
      simulation: SimulationHistoryItem,
    ) => {
      if (!token) {
        return;
      }

      const nextName =
        window.prompt(
          "Enter a new simulation name:",
          simulation.name,
        )?.trim();

      if (
        !nextName ||
        nextName === simulation.name
      ) {
        return;
      }

      if (nextName.length < 2) {
        setError(
          "The simulation name must contain at least two characters.",
        );

        return;
      }

      setBusySimulationId(
        simulation.id,
      );

      setError(null);

      try {
        const renamed =
          await simulationService.rename(
            simulation.id,
            nextName,
            token,
          );

        setSimulations(
          (current) =>
            current.map(
              (item) =>
                item.id ===
                simulation.id
                  ? {
                      ...item,
                      name:
                        renamed.name,
                    }
                  : item,
            ),
        );
      } catch (requestError) {
        setError(
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


  const deleteSimulation =
    async (
      simulation: SimulationHistoryItem,
    ) => {
      if (!token) {
        return;
      }

      const confirmed =
        window.confirm(
          `Delete "${simulation.name}"? This action cannot be undone.`,
        );

      if (!confirmed) {
        return;
      }

      setBusySimulationId(
        simulation.id,
      );

      setError(null);

      try {
        await simulationService.delete(
          simulation.id,
          token,
        );

        setSimulations(
          (current) =>
            current.filter(
              (item) =>
                item.id !==
                simulation.id,
            ),
        );
      } catch (requestError) {
        setError(
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
              {simulations.length}
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
                            void renameSimulation(
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
                            void deleteSimulation(
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
            </div>
          )}
      </section>
    </DashboardLayout>
  );
}
