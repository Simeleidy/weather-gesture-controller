// Configuración central: cambia aquí URLs, umbrales y textos.

export const MEDIAPIPE = {
  wasm: "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm",
  model: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
  numHands: 2,
  delegate: "GPU",
};

export const CANVAS = { width: 640, height: 480 };

export const THRESHOLDS = {
  fingerExtended: 1.15,   // punta/muñeca frente a articulación/muñeca
  handsTogether: 2.5,     // distancia entre manos, en tamaños de palma
  smoothWindow: 8,        // fotogramas recordados
  smoothMin: 6,           // votos necesarios para cambiar de efecto
  transitionSpeed: 0.07,  // rapidez del fundido entre efectos
};

export const WEATHER_NAMES = {
  rain: "LLUVIA", sun: "SOL", cloud: "NUBLADO",
  clear: "DESPEJADO", star: "MODO ESTRELLA", none: "-",
};

export const GESTURE_NAMES = { fist: "Puño", open: "Mano abierta", index: "Índice", other: "-" };
