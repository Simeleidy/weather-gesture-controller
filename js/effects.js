// Efectos visuales del canvas. Para añadir un clima: crea un método draw*() y una entrada en `lvl`.
import { CANVAS, THRESHOLDS } from "./config.js";

const TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);

export class WeatherEffects {
  constructor(ctx) {
    this.ctx = ctx;
    this.W = CANVAS.width;
    this.H = CANVAS.height;
    this.mode = "none";
    this.hands = [];
    this.lvl = { rain: 0, sun: 0, cloud: 0, star: 0 };   // intensidad 0..1 de cada efecto
    this.sun = { x: 530, y: 90 };
    this.drops = Array.from({ length: 260 }, () => ({ x: rand(0, this.W), y: rand(0, this.H), speed: rand(8, 18), len: rand(10, 24) }));
    this.stars = Array.from({ length: 130 }, () => ({ x: rand(0, this.W), y: rand(0, this.H), r: rand(.6, 2.4), phase: rand(0, TAU) }));
    this.clouds = [[120, 90, 1], [340, 60, 1.3], [540, 130, .9], [220, 190, .8]].map(([x, y, s]) => ({ x, y, s }));
  }

  reset() { for (const k in this.lvl) this.lvl[k] = 0; this.mode = "none"; this.hands = []; this.ctx.clearRect(0, 0, this.W, this.H); }

  update(mode, hands) {
    this.mode = mode;
    this.hands = hands;
    for (const k in this.lvl) this.lvl[k] += ((mode === k ? 1 : 0) - this.lvl[k]) * THRESHOLDS.transitionSpeed;
  }

  draw(t) {
    this.ctx.clearRect(0, 0, this.W, this.H);
    this.drawTint();
    this.drawClouds();
    this.drawRain();
    this.drawSun(t);
    this.drawStars(t);
  }

  drawTint() {
    const { ctx, W, H, lvl } = this;
    const layers = [[20, 30, 50, lvl.rain * .35 + lvl.cloud * .15], [255, 190, 80, lvl.sun * .16], [5, 8, 25, lvl.star * .6]];
    for (const [r, g, b, a] of layers) { ctx.fillStyle = `rgba(${r},${g},${b},${a})`; ctx.fillRect(0, 0, W, H); }
  }

  drawClouds() {
    const { ctx, W, lvl } = this;
    const alpha = Math.min(1, lvl.cloud * .85 + lvl.rain * .8) * .75;
    if (alpha < .01) return;
    ctx.fillStyle = `rgba(235,240,246,${alpha})`;
    for (const c of this.clouds) {
      c.x += .25 * c.s;
      if (c.x > W + 120) c.x = -140;
      for (const [dx, dy, r] of [[0, 0, 34], [34, -14, 42], [76, 0, 32], [36, 10, 38]]) {
        ctx.beginPath(); ctx.arc(c.x + dx * c.s, c.y + dy * c.s, r * c.s, 0, TAU); ctx.fill();
      }
    }
  }

  drawRain() {
    const { ctx, W, H, lvl } = this;
    if (lvl.rain < .01) return;
    ctx.strokeStyle = `rgba(200,220,255,${lvl.rain * .7})`; ctx.lineWidth = 1.4; ctx.beginPath();
    for (const d of this.drops) {
      d.y += d.speed * (.5 + lvl.rain); d.x -= 1.2;
      if (d.y > H) { d.y = -20; d.x = rand(0, W); }
      ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - 2, d.y + d.len);
    }
    ctx.stroke();
  }

  drawSun(t) {
    const { ctx, W, H, lvl, sun } = this;
    if (lvl.sun < .01) return;
    const hand = this.hands[0];
    if (this.mode === "sun" && hand) {   // el sol sigue la palma
      sun.x += ((1 - hand[9].x) * W - sun.x) * .15;
      sun.y += (Math.min(hand[9].y * H, H * .6) - 60 - sun.y) * .15;
    }
    const R = 70 * lvl.sun;
    const glow = ctx.createRadialGradient(sun.x, sun.y, 0, sun.x, sun.y, R * 3);
    glow.addColorStop(0, `rgba(255,240,170,${lvl.sun})`);
    glow.addColorStop(.25, `rgba(255,190,60,${lvl.sun * .6})`);
    glow.addColorStop(1, "rgba(255,170,40,0)");
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = `rgba(255,220,120,${lvl.sun * .8})`; ctx.lineWidth = 3;
    for (let i = 0; i < 14; i++) {
      const a = i * Math.PI / 7 + t / 4000;
      ctx.beginPath();
      ctx.moveTo(sun.x + Math.cos(a) * R * .9, sun.y + Math.sin(a) * R * .9);
      ctx.lineTo(sun.x + Math.cos(a) * R * 1.5, sun.y + Math.sin(a) * R * 1.5);
      ctx.stroke();
    }
  }

  drawStars(t) {
    const { ctx, lvl } = this;
    if (lvl.star < .01) return;
    for (const s of this.stars) {
      ctx.fillStyle = `rgba(255,255,235,${lvl.star * (.4 + .6 * Math.abs(Math.sin(t / 700 + s.phase)))})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill();
    }
  }
}
