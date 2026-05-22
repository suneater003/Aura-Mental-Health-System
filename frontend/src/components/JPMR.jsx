import React, { useEffect, useRef, useState } from "react";

const DEFAULT_STEPS = [
  { group: "Toes", tenseInstruction: "Curl and tense your toes tightly.", relaxInstruction: "Release your toes and feel them soften.", tenseDuration: 15, relaxDuration: 15 },
  { group: "Calves", tenseInstruction: "Tighten your calf muscles firmly.", relaxInstruction: "Let your calves become heavy and relaxed.", tenseDuration: 15, relaxDuration: 15 },
  { group: "Thighs", tenseInstruction: "Squeeze your thigh muscles strongly.", relaxInstruction: "Allow your thighs to go soft and warm.", tenseDuration: 15, relaxDuration: 15 },
  { group: "Stomach", tenseInstruction: "Tighten your stomach muscles gently.", relaxInstruction: "Breathe and let your stomach relax.", tenseDuration: 15, relaxDuration: 15 },
  { group: "Hands", tenseInstruction: "Clench your fists as tightly as you can.", relaxInstruction: "Release your fists and feel the tension melt away.", tenseDuration: 15, relaxDuration: 15 },
  { group: "Forearms", tenseInstruction: "Tighten your forearms and feel them firm up.", relaxInstruction: "Let your forearms go limp and heavy.", tenseDuration: 15, relaxDuration: 15 },
  { group: "Shoulders", tenseInstruction: "Lift your shoulders up toward your ears and hold.", relaxInstruction: "Drop your shoulders and notice the release.", tenseDuration: 15, relaxDuration: 15 },
  { group: "Face", tenseInstruction: "Squeeze your facial muscles tightly (squint, clench jaw).", relaxInstruction: "Unclench and soften your face, breathe gently.", tenseDuration: 15, relaxDuration: 15 },
];

function getImageForPart(part) {
  const map = {
    Toes: "toes.png",
    Calves: "calf.png",
    Thighs: "thighs.png",
    Stomach: "stomach.png",
    Hands: "hands.png",
    Forearms: "forearms.png",
    Shoulders: "shoulder.png",
    Face: "head.png",
  };
  return map[part] || null;
}

function BodyPartImage({ part, isTensing, size = 180 }) {
  const filename = getImageForPart(part);
  if (!filename) return null;
  return (
    <img
      src={`/body/${filename}`}
      alt={part}
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
      className={`mx-auto transition-all duration-300 ${isTensing ? "opacity-100 saturate-100" : "grayscale brightness-50 opacity-80"}`}
    />
  );
}

export default function JPMR({ steps = DEFAULT_STEPS, onComplete, onClose, isDarkMode = false, fullScreen = false }) {
  const [currentStep, setCurrentStep] = useState(null);
  const [timerMs, setTimerMs] = useState(0);
  const [isTensing, setIsTensing] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("[JPMR] mounted, fullScreen=", fullScreen);
    return () => {
      // eslint-disable-next-line no-console
      console.log("[JPMR] unmounted");
    };
  }, [fullScreen]);

  const startJourney = () => {
    if (!steps?.length) return;
    setCurrentStep(0);
    setIsTensing(true);
    setIsCompleted(false);
    setIsRunning(true);
    setTimerMs(steps[0].tenseDuration * 1000);
  };

  const stopJourney = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsRunning(false);
    setCurrentStep(null);
    setTimerMs(0);
    setIsTensing(true);
  };

  useEffect(() => {
    if (!isRunning || isCompleted || currentStep === null) return;
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      setTimerMs((prev) => (prev <= 100 ? 0 : prev - 100));
    }, 100);

    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isRunning, currentStep, isCompleted]);

  useEffect(() => {
    if (currentStep === null || isCompleted) return;
    if (timerMs > 0) return;

    const step = steps[currentStep];
    if (!step) return;

    if (isTensing) {
      setIsTensing(false);
      setTimerMs(step.relaxDuration * 1000);
      return;
    }

    const next = currentStep + 1;
    if (next < steps.length) {
      setCurrentStep(next);
      setIsTensing(true);
      setTimerMs(steps[next].tenseDuration * 1000);
    } else {
      setIsCompleted(true);
      setIsRunning(false);
      setCurrentStep(null);
      if (typeof onComplete === "function") {
        try {
          onComplete();
        } catch {
          // ignore callback errors
        }
      }
    }
  }, [timerMs, currentStep, isTensing, isCompleted, steps, onComplete]);

  const formatTime = (ms) => `${Math.ceil(ms / 1000)}s`;
  const phaseMs = currentStep === null ? 1 : (isTensing ? steps[currentStep].tenseDuration : steps[currentStep].relaxDuration) * 1000;
  const progress = currentStep === null ? 0 : Math.max(0, Math.min(1, (phaseMs - timerMs) / phaseMs));
  const size = 220;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  const shellClass = fullScreen
    ? "fixed inset-4 z-[10000] rounded-3xl border border-orange-500/40 bg-white/98 dark:bg-zinc-950/98 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl overflow-auto"
    : `w-full max-w-2xl mx-auto p-6 rounded-2xl border ${isDarkMode ? "border-orange-500" : "border-orange-500"} bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-200`;

  return (
    <div className={shellClass}>
      <div className={`${fullScreen ? "min-h-[calc(100vh-2rem)] p-6 md:p-10" : "p-0"}`}>
        <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col items-center gap-6">
          <div className="w-full text-right">
            <button
              onClick={() => {
                if (typeof onClose === "function") onClose();
              }}
              className="px-3 py-2 rounded-full bg-white/95 dark:bg-zinc-800 border border-orange-500 text-orange-500 shadow-lg"
            >
              Close
            </button>
          </div>

          <div className="w-full rounded-3xl border border-orange-500/30 bg-white/95 dark:bg-zinc-950/95 shadow-2xl backdrop-blur-xl p-6 md:p-10">
            <div className="flex flex-col items-center gap-6">
              <h2 className="text-2xl font-semibold text-orange-500">Jacobson's Progressive Muscle Relaxation</h2>

              {!isRunning && !isCompleted && (
                <div className="space-y-3 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Gently guide your attention through each muscle group. Follow the instructions and breathe.</p>
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={startJourney} className="px-5 py-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-300 dark:focus:ring-orange-600 shadow-sm">Start Journey</button>
                    <button onClick={() => { setCurrentStep(0); setIsTensing(true); setTimerMs(steps[0]?.tenseDuration * 1000 || 0); setIsRunning(true); }} className="px-4 py-2 rounded-full border border-orange-500 text-orange-500 bg-white dark:bg-transparent dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-zinc-900">Quick Start</button>
                  </div>
                </div>
              )}

              {isRunning && currentStep !== null && (
                <div className="flex flex-col items-center gap-6 w-full">
                  <div className="relative">
                    <svg width={size} height={size} className="transform -rotate-90">
                      <defs>
                        <linearGradient id="gradOrange" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#ffb547" />
                          <stop offset="100%" stopColor="#ff5a87" />
                        </linearGradient>
                      </defs>
                      <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} stroke={isDarkMode ? "#2b2b2b" : "#f3f3f3"} fill="none" />
                      <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} stroke="url(#gradOrange)" strokeLinecap="round" fill="none" strokeDasharray={circumference} strokeDashoffset={dashOffset} style={{ transition: "stroke-dashoffset 0.2s linear" }} />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className={`flex flex-col items-center justify-center ${isTensing ? "animate-pulse" : ""}`}>
                        <div className={`rounded-full w-40 h-40 flex items-center justify-center ${isTensing ? "ring-8 ring-orange-400/30" : "ring-4 ring-orange-200/20"}`}>
                          <div className="text-center">
                            <div className="text-sm uppercase tracking-wide text-orange-500 font-semibold">{isTensing ? "Tense" : "Relax"}</div>
                            <div className={`text-3xl font-bold mt-2 ${isDarkMode ? 'text-orange-400' : 'text-blue-600'}`}>
                              {formatTime(timerMs)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full max-w-xl text-center">
                    <div className="mb-4">
                      <BodyPartImage part={steps[currentStep].group} isTensing={isTensing} size={180} />
                    </div>
                    <div className={`p-5 rounded-lg border ${isTensing ? "border-orange-500 bg-orange-50/60" : "border-orange-200 bg-transparent"} dark:bg-transparent transition-all duration-300`}>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">Target: <span className="font-semibold text-gray-800 dark:text-gray-100">{steps[currentStep].group}</span></div>
                      <div className={`text-lg leading-relaxed ${isTensing ? "text-orange-600 dark:text-orange-400 font-semibold" : "text-gray-800 dark:text-gray-100"}`}>
                        {isTensing ? steps[currentStep].tenseInstruction : steps[currentStep].relaxInstruction}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button onClick={stopJourney} className="px-4 py-2 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 border border-transparent hover:opacity-95">Stop</button>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Step {currentStep + 1} of {steps.length}</div>
                  </div>
                </div>
              )}

              {isCompleted && (
                <div className="flex flex-col items-center gap-4">
                  <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-orange-500 shadow-lg">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-28 h-28 rounded-full flex items-center justify-center bg-gradient-to-br from-orange-300 to-pink-400 text-white shadow-xl transform-gpu" style={{ boxShadow: "0 10px 30px rgba(255,140,50,0.25)" }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2C13.1046 2 14 2.89543 14 4V6H10V4C10 2.89543 10.8954 2 12 2Z" fill="white" />
                          <path d="M6 8H18V20H6V8Z" fill="white" />
                        </svg>
                      </div>
                      <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">Session Complete</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">You've earned the <span className="text-orange-500 font-semibold">Somatic Peace Badge</span></div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => { setIsCompleted(false); setCurrentStep(null); }} className="px-4 py-2 rounded-full bg-white dark:bg-zinc-800 border border-orange-500 text-orange-500">Done</button>
                    <button onClick={() => { setIsCompleted(false); startJourney(); }} className="px-4 py-2 rounded-full bg-orange-500 text-white">Repeat Session</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
