// Reconocimiento de gestos a partir de los puntos de la mano (sin dependencias).
import { THRESHOLDS, GESTURE_NAMES } from "./config.js";

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// Índices MediaPipe: muñeca 0, nudillo medio 9; [punta, articulación media] de índice, corazón, anular y meñique
const FINGERS = [[8, 6], [12, 10], [16, 14], [20, 18]];

// Un dedo está extendido si su punta está más lejos de la muñeca que su articulación media
const extendedFingers = p =>
  FINGERS.map(([tip, pip]) => dist(p[tip], p[0]) > dist(p[pip], p[0]) * THRESHOLDS.fingerExtended);

export function classifyHand(p) {
  const f = extendedFingers(p);
  const n = f.filter(Boolean).length;
  if (n === 0) return "fist";
  if (n === 4) return "open";
  if (n === 1 && f[0]) return "index";
  return "other";
}

// Convierte las manos detectadas en un clima (sin suavizar)
function decide(hands) {
  const gestures = hands.map(classifyHand);
  let label = gestures.map(g => GESTURE_NAMES[g]).join(" + ") || "-";

  if (hands.length === 2) {
    if (gestures.every(g => g === "index")) return { weather: "star", label };
    const palm = (dist(hands[0][0], hands[0][9]) + dist(hands[1][0], hands[1][9])) / 2;
    if (dist(hands[0][9], hands[1][9]) < palm * THRESHOLDS.handsTogether) {
      return { weather: "clear", label: "Dos manos juntas" };
    }
  }
  const weather = { fist: "rain", open: "sun", index: "cloud" }[gestures[0]] || "none";
  return { weather, label };
}

// Añade suavizado: el clima cambia solo si domina en los últimos fotogramas
export class GestureRecognizer {
  constructor() { this.reset(); }

  reset() { this.history = []; this.weather = "none"; this.label = "-"; }

  update(hands) {
    const raw = decide(hands);
    this.label = raw.label;
    this.history.push(raw.weather);
    if (this.history.length > THRESHOLDS.smoothWindow) this.history.shift();

    const votes = {};
    for (const w of this.history) votes[w] = (votes[w] || 0) + 1;
    const [best, count] = Object.entries(votes).sort((a, b) => b[1] - a[1])[0];
    if (count >= THRESHOLDS.smoothMin) this.weather = best;
    return this.weather;
  }
}
