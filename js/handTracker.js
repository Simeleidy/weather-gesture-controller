// Cámara, MediaPipe Hand Landmarker y dibujo del esqueleto de la mano.
import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs";
import { MEDIAPIPE, CANVAS } from "./config.js";

export class HandTracker {
  constructor() { this.landmarker = null; this.stream = null; }

  async load() {
    if (this.landmarker) return;
    const fileset = await FilesetResolver.forVisionTasks(MEDIAPIPE.wasm);
    this.landmarker = await HandLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: MEDIAPIPE.model, delegate: MEDIAPIPE.delegate },
      runningMode: "VIDEO",
      numHands: MEDIAPIPE.numHands,
    });
  }

  async startCamera(video) {
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: { width: CANVAS.width, height: CANVAS.height, facingMode: "user" },
    });
    video.srcObject = this.stream;
    await video.play();
  }

  stopCamera(video) {
    this.stream?.getTracks().forEach(t => t.stop());
    video.srcObject = null;
  }

  // Devuelve una lista de manos; cada mano son 21 puntos {x, y, z} normalizados
  detect(video) {
    return this.landmarker.detectForVideo(video, performance.now()).landmarks;
  }
}

// El vídeo está espejado, así que se invierte x al dibujar
export function drawHands(ctx, hands) {
  const { width: W, height: H } = CANVAS;
  for (const p of hands) {
    ctx.strokeStyle = "#3ddc84"; ctx.lineWidth = 2;
    for (const { start, end } of HandLandmarker.HAND_CONNECTIONS) {
      ctx.beginPath();
      ctx.moveTo((1 - p[start].x) * W, p[start].y * H);
      ctx.lineTo((1 - p[end].x) * W, p[end].y * H);
      ctx.stroke();
    }
    ctx.fillStyle = "#a8ffd0";
    for (const q of p) { ctx.beginPath(); ctx.arc((1 - q.x) * W, q.y * H, 3.5, 0, Math.PI * 2); ctx.fill(); }
  }
}
