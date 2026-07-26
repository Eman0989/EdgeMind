import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type SoundState =
  | "off"
  | "starting"
  | "on"
  | "unavailable";

interface AudioContextWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}

interface ToneOptions {
  frequency: number;
  delay?: number;
  duration?: number;
  gain?: number;
  type?: OscillatorType;
}

const PHASE_CUES = [
  [130.81, 196],
  [164.81, 246.94],
  [220, 329.63],
  [261.63, 392],
  [293.66, 440],
  [329.63, 493.88],
  [392, 587.33],
];

function getPhaseIndex(progress: number) {
  if (progress < 7) {
    return 0;
  }

  if (progress < 23) {
    return 1;
  }

  if (progress < 34) {
    return 2;
  }

  if (progress < 61) {
    return 3;
  }

  if (progress < 74) {
    return 4;
  }

  if (progress < 80) {
    return 5;
  }

  return 6;
}

function scheduleTone(
  context: AudioContext,
  destination: AudioNode,
  {
    frequency,
    delay = 0,
    duration = 0.24,
    gain = 0.045,
    type = "sine",
  }: ToneOptions,
) {
  const oscillator =
    context.createOscillator();

  const toneGain = context.createGain();

  const now = context.currentTime + delay;
  const end = now + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(
    frequency,
    now,
  );

  toneGain.gain.setValueAtTime(
    0.0001,
    now,
  );

  toneGain.gain.exponentialRampToValueAtTime(
    gain,
    now + 0.025,
  );

  toneGain.gain.exponentialRampToValueAtTime(
    0.0001,
    end,
  );

  oscillator.connect(toneGain);
  toneGain.connect(destination);

  oscillator.start(now);
  oscillator.stop(end + 0.02);
}

export default function useCinematicAudio(
  progress: number,
) {
  const [soundEnabled, setSoundEnabled] =
    useState(false);

  const [soundState, setSoundState] =
    useState<SoundState>("off");

  const audioContextRef =
    useRef<AudioContext | null>(null);

  const masterGainRef =
    useRef<GainNode | null>(null);

  const ambientSourcesRef =
    useRef<AudioScheduledSourceNode[]>([]);

  const lastPhaseRef = useRef(-1);
  const finalCuePlayedRef = useRef(false);

  const playPhaseCue = useCallback(
    (phaseIndex: number) => {
      const context =
        audioContextRef.current;

      const masterGain =
        masterGainRef.current;

      if (!context || !masterGain) {
        return;
      }

      const cue =
        PHASE_CUES[
          Math.min(
            PHASE_CUES.length - 1,
            Math.max(0, phaseIndex),
          )
        ];

      scheduleTone(
        context,
        masterGain,
        {
          frequency: cue[0],
          duration: 0.22,
          gain: 0.038,
          type: "sine",
        },
      );

      scheduleTone(
        context,
        masterGain,
        {
          frequency: cue[1],
          delay: 0.09,
          duration: 0.3,
          gain: 0.032,
          type: "triangle",
        },
      );
    },
    [],
  );

  const playFinalCue = useCallback(() => {
    const context =
      audioContextRef.current;

    const masterGain =
      masterGainRef.current;

    if (!context || !masterGain) {
      return;
    }

    [392, 523.25, 659.25].forEach(
      (frequency, index) => {
        scheduleTone(
          context,
          masterGain,
          {
            frequency,
            delay: index * 0.075,
            duration: 0.48,
            gain: 0.035,
            type:
              index === 0
                ? "sine"
                : "triangle",
          },
        );
      },
    );
  }, []);

  const stopSound = useCallback(() => {
    const context =
      audioContextRef.current;

    const masterGain =
      masterGainRef.current;

    setSoundEnabled(false);
    setSoundState("off");
    finalCuePlayedRef.current = false;

    if (!context) {
      return;
    }

    const now = context.currentTime;

    if (masterGain) {
      masterGain.gain.cancelScheduledValues(
        now,
      );

      masterGain.gain.setValueAtTime(
        Math.max(
          0.0001,
          masterGain.gain.value,
        ),
        now,
      );

      masterGain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + 0.16,
      );
    }

    ambientSourcesRef.current.forEach(
      (source) => {
        try {
          source.stop(now + 0.18);
        } catch {
          // The node may already be stopped.
        }
      },
    );

    window.setTimeout(() => {
      void context.close();
    }, 200);

    audioContextRef.current = null;
    masterGainRef.current = null;
    ambientSourcesRef.current = [];
  }, []);

  const startSound = useCallback(async () => {
    if (soundState === "starting") {
      return;
    }

    setSoundState("starting");

    const browserWindow =
      window as AudioContextWindow;

    const AudioContextClass =
      window.AudioContext ??
      browserWindow.webkitAudioContext;

    if (!AudioContextClass) {
      setSoundEnabled(false);
      setSoundState("unavailable");
      return;
    }

    try {
      const context =
        new AudioContextClass();

      await context.resume();

      const masterGain =
        context.createGain();

      const lowPass =
        context.createBiquadFilter();

      masterGain.gain.setValueAtTime(
        0.0001,
        context.currentTime,
      );

      masterGain.gain.exponentialRampToValueAtTime(
        0.72,
        context.currentTime + 0.18,
      );

      lowPass.type = "lowpass";
      lowPass.frequency.setValueAtTime(
        620,
        context.currentTime,
      );

      lowPass.Q.setValueAtTime(
        0.7,
        context.currentTime,
      );

      lowPass.connect(masterGain);
      masterGain.connect(
        context.destination,
      );

      const baseOscillator =
        context.createOscillator();

      const baseGain =
        context.createGain();

      baseOscillator.type = "sine";

      baseOscillator.frequency.setValueAtTime(
        48,
        context.currentTime,
      );

      baseGain.gain.setValueAtTime(
        0.012,
        context.currentTime,
      );

      baseOscillator.connect(baseGain);
      baseGain.connect(lowPass);

      const overtoneOscillator =
        context.createOscillator();

      const overtoneGain =
        context.createGain();

      overtoneOscillator.type = "triangle";

      overtoneOscillator.frequency.setValueAtTime(
        96,
        context.currentTime,
      );

      overtoneGain.gain.setValueAtTime(
        0.0036,
        context.currentTime,
      );

      overtoneOscillator.connect(
        overtoneGain,
      );

      overtoneGain.connect(lowPass);

      const movementOscillator =
        context.createOscillator();

      const movementGain =
        context.createGain();

      movementOscillator.type = "sine";

      movementOscillator.frequency.setValueAtTime(
        0.09,
        context.currentTime,
      );

      movementGain.gain.setValueAtTime(
        0.003,
        context.currentTime,
      );

      movementOscillator.connect(
        movementGain,
      );

      movementGain.connect(
        baseGain.gain,
      );

      baseOscillator.start();
      overtoneOscillator.start();
      movementOscillator.start();

      audioContextRef.current = context;
      masterGainRef.current = masterGain;

      ambientSourcesRef.current = [
        baseOscillator,
        overtoneOscillator,
        movementOscillator,
      ];

      lastPhaseRef.current =
        getPhaseIndex(progress);

      finalCuePlayedRef.current =
        progress >= 92;

      setSoundEnabled(true);
      setSoundState("on");

      scheduleTone(
        context,
        masterGain,
        {
          frequency: 220,
          duration: 0.18,
          gain: 0.04,
          type: "sine",
        },
      );

      scheduleTone(
        context,
        masterGain,
        {
          frequency: 440,
          delay: 0.08,
          duration: 0.26,
          gain: 0.03,
          type: "triangle",
        },
      );
    } catch {
      setSoundEnabled(false);
      setSoundState("unavailable");
    }
  }, [progress, soundState]);

  const toggleSound = useCallback(() => {
    if (soundEnabled) {
      stopSound();
      return;
    }

    void startSound();
  }, [
    soundEnabled,
    startSound,
    stopSound,
  ]);

  useEffect(() => {
    if (!soundEnabled) {
      return;
    }

    const currentPhase =
      getPhaseIndex(progress);

    if (
      currentPhase !==
      lastPhaseRef.current
    ) {
      lastPhaseRef.current =
        currentPhase;

      playPhaseCue(currentPhase);
    }

    if (
      progress >= 92 &&
      !finalCuePlayedRef.current
    ) {
      finalCuePlayedRef.current = true;
      playFinalCue();
    }
  }, [
    playFinalCue,
    playPhaseCue,
    progress,
    soundEnabled,
  ]);

  useEffect(() => {
    return () => {
      const context =
        audioContextRef.current;

      ambientSourcesRef.current.forEach(
        (source) => {
          try {
            source.stop();
          } catch {
            // The node may already be stopped.
          }
        },
      );

      if (context) {
        void context.close();
      }
    };
  }, []);

  return {
    soundEnabled,
    soundState,
    toggleSound,
    stopSound,
  };
}