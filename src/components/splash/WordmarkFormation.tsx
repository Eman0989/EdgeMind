import type { CSSProperties } from "react";

interface FormationParticle {
  x: number;
  y: number;
  delay: number;
  size: number;
}

interface FormationFragment {
  x: number;
  y: number;
  rotation: number;
  width: number;
  delay: number;
}

const LETTERS = "EDGEMIND".split("");

const LETTER_ENTRY_OFFSETS = [
  -190,
  -142,
  -94,
  -38,
  38,
  94,
  142,
  190,
];

const particles: FormationParticle[] =
  Array.from({ length: 42 }, (_, index) => ({
    x: ((index * 83) % 760) - 380,
    y: ((index * 137) % 460) - 230,
    delay: (index % 11) * 0.032,
    size: 2 + (index % 3),
  }));

const fragments: FormationFragment[] =
  Array.from({ length: 18 }, (_, index) => ({
    x: ((index * 97) % 680) - 340,
    y: ((index * 61) % 300) - 150,
    rotation: ((index * 37) % 110) - 55,
    width: 34 + ((index * 19) % 74),
    delay: (index % 9) * 0.045,
  }));

export default function WordmarkFormation() {
  return (
    <section className="wordmark-animation-scene wordmark-formation-scene">
      <div
        className="formation-ambient-ring formation-ambient-ring-one"
        aria-hidden="true"
      />

      <div
        className="formation-ambient-ring formation-ambient-ring-two"
        aria-hidden="true"
      />

      <div
        className="formation-particle-field"
        aria-hidden="true"
      >
        {particles.map((particle, index) => (
          <i
            key={`particle-${index}`}
            className={
              index % 5 === 0
                ? "formation-particle is-violet"
                : "formation-particle"
            }
            style={
              {
                "--particle-x": `${particle.x}px`,
                "--particle-y": `${particle.y}px`,
                "--particle-delay": `${particle.delay}s`,
                "--particle-size": `${particle.size}px`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div
        className="formation-fragment-field"
        aria-hidden="true"
      >
        {fragments.map((fragment, index) => (
          <i
            key={`fragment-${index}`}
            className={
              index % 4 === 0
                ? "formation-fragment is-violet"
                : "formation-fragment"
            }
            style={
              {
                "--fragment-x": `${fragment.x}px`,
                "--fragment-y": `${fragment.y}px`,
                "--fragment-rotation":
                  `${fragment.rotation}deg`,
                "--fragment-width":
                  `${fragment.width}px`,
                "--fragment-delay":
                  `${fragment.delay}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div
        className="formation-centre-flash"
        aria-hidden="true"
      />

      <div
        className="formation-wordmark-ghost"
        aria-hidden="true"
      >
        EDGEMIND
      </div>

      <h1
        className="formation-wordmark"
        aria-label="EdgeMind"
      >
        {LETTERS.map((letter, index) => (
          <span
            key={`${letter}-${index}`}
            className="formation-letter"
            aria-hidden="true"
            style={
              {
                "--letter-entry-x":
                  `${LETTER_ENTRY_OFFSETS[index]}px`,
                "--letter-delay":
                  `${index * 0.055}s`,
              } as CSSProperties
            }
          >
            {letter}
          </span>
        ))}
      </h1>

      <div
        className="formation-signal-trace"
        aria-hidden="true"
      >
        <span />
        <i />
      </div>

      <div className="formation-tagline">
        Intelligent CDN Simulation &amp;
        Optimization
      </div>

      <div className="formation-resolution-meta">
        <span>33 NODES MERGED</span>
        <i />
        <span>IDENTITY RESOLVED</span>
      </div>
    </section>
  );
}