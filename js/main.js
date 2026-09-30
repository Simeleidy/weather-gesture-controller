// Punto de entrada: conecta interfaz, cámara, gestos y efectos.
import { CANVAS, WEATHER_NAMES } from "./config.js";
import { HandTracker, drawHands } from "./handTracker.js";
import { GestureRecognizer } from "./gestures.js";
import { WeatherEffects } from "./effects.js";

const $ = id => document.getElementById(id);
const video = $("video"), canvas = $("canvas"), ctx = canvas.getContext("2d");
canvas.width = CANVAS.width;
canvas.height = CANVAS.height;

const tracker = new HandTracker();
const recognizer = new GestureRecognizer();
const effects = new WeatherEffects(ctx);

let running = false, hands = [], lastVideoTime = -1;

const setStatus = text => { $("status").textContent = text; };

function updateUI(weather) {
  $("badge").textContent = WEATHER_NAMES[weather];
  $("badge").hidden = weather === "none";
  $("log").textContent = `Manos: ${hands.length}\nGesto: ${recognizer.label}\nClima: ${WEATHER_NAMES[weather]}`;
}

function loop(t) {
  if (!running) return;
  if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {   // solo fotogramas nuevos
    lastVideoTime = video.currentTime;
    hands = tracker.detect(video);
    recognizer.update(hands);
  }
  effects.update(recognizer.weather, hands);
  effects.draw(t);
  drawHands(ctx, hands);
  updateUI(recognizer.weather);
  requestAnimationFrame(loop);
}

$("start").onclick = async () => {
  $("start").disabled = true;
  setStatus("Cargando modelo…");
  try {
    await tracker.load();
    await tracker.startCamera(video);
    recognizer.reset();
    running = true;
    $("hint").hidden = true;
    $("stop").disabled = false;
    setStatus("Cámara activa");
    requestAnimationFrame(loop);
  } catch (e) {
    $("start").disabled = false;
    setStatus("No se pudo iniciar: " + (e.name === "NotAllowedError" ? "permite el acceso a la cámara." : e.message));
  }
};

$("stop").onclick = () => {
  running = false;
  tracker.stopCamera(video);
  effects.reset();
  recognizer.reset();
  hands = [];
  $("hint").hidden = false;
  $("badge").hidden = true;
  $("start").disabled = false;
  $("stop").disabled = true;
  setStatus("Cámara apagada");
};
