/** Grow room renderer — background, pots, lamps, lighting FX */

import { drawPlant } from './plant.js';

const POT_POSITIONS = [
  { x: 0.22, y: 0.78 },
  { x: 0.50, y: 0.76 },
  { x: 0.78, y: 0.78 },
];

export class RoomRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.time = 0;
    this.lightHeight = 0.55;
    this.lampType = 'hps';
    this.upgrades = { fan: false, reflector: false, mylar: false };
    this.particles = [];
    for (let i = 0; i < 40; i++) this.particles.push(this._spawnParticle());
  }

  setUpgrades(upgrades) {
    this.upgrades = { ...this.upgrades, ...upgrades };
  }

  setLightHeight(h) {
    this.lightHeight = Math.max(0.35, Math.min(0.75, h));
  }

  render(plants, mood = {}) {
    const { w, h } = this._size();
    const ctx = this.ctx;
    this.time += 0.016;

    ctx.clearRect(0, 0, w, h);
    this._drawBackground(ctx, w, h);
    this._drawFloor(ctx, w, h);
    this._drawMylar(ctx, w, h);

    for (let i = 0; i < 3; i++) {
      this._drawPot(ctx, w, h, i, mood.potWet?.[i] ?? 0.5);
    }

    for (let i = 0; i < 3; i++) {
      if (plants[i]) {
        const pos = POT_POSITIONS[i];
        const scale = 0.85 + i === 1 ? 0.15 : 0;
        const stress = 1 - (plants[i].health / 100);
        drawPlant(ctx, plants[i], pos.x * w, pos.y * h, scale, {
          stress,
          highlight: mood.highlightPot === i,
          time: this.time,
        });
      }
    }

    for (let i = 0; i < 3; i++) this._drawLamp(ctx, w, h, i);
    this._drawLightCone(ctx, w, h);
    this._drawParticles(ctx, w, h);
    if (this.upgrades.fan) this._drawFan(ctx, w, h);
    this._drawVignette(ctx, w, h);
  }

  _size() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.floor(rect.width * dpr);
    const h = Math.floor(rect.height * dpr);
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    return { w, h };
  }

  _drawBackground(ctx, w, h) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#1a1528');
    g.addColorStop(0.45, '#252035');
    g.addColorStop(1, '#12101a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(40, 35, 55, 0.6)';
    ctx.fillRect(0, 0, w, h * 0.35);

    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(0, h * 0.08 * i);
      ctx.lineTo(w, h * 0.08 * i);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(60, 50, 40, 0.25)';
    ctx.fillRect(w * 0.05, h * 0.12, w * 0.12, h * 0.2);
    ctx.fillRect(w * 0.83, h * 0.1, w * 0.1, h * 0.18);
  }

  _drawFloor(ctx, w, h) {
    const g = ctx.createLinearGradient(0, h * 0.7, 0, h);
    g.addColorStop(0, '#2a2438');
    g.addColorStop(1, '#15121c');
    ctx.fillStyle = g;
    ctx.fillRect(0, h * 0.72, w, h * 0.28);

    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    for (let i = 0; i < 20; i++) {
      const y = h * 0.72 + i * 8;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }

  _drawMylar(ctx, w, h) {
    if (!this.upgrades.mylar) return;
    ctx.fillStyle = 'rgba(200, 220, 255, 0.04)';
    ctx.fillRect(0, 0, w, h * 0.65);
  }

  _drawPot(ctx, w, h, index, wetness) {
    const px = POT_POSITIONS[index].x * w;
    const py = POT_POSITIONS[index].y * h;
    const pw = w * 0.09;
    const ph = h * 0.07;

    ctx.save();
    ctx.translate(px - pw / 2, py - ph * 0.3);

    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(pw / 2, ph + 8, pw * 0.55, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    const potGrad = ctx.createLinearGradient(0, 0, pw, 0);
    potGrad.addColorStop(0, '#5c4033');
    potGrad.addColorStop(0.5, '#8b6914');
    potGrad.addColorStop(1, '#4a3528');
    ctx.fillStyle = potGrad;
    ctx.beginPath();
    ctx.moveTo(pw * 0.1, ph * 0.2);
    ctx.lineTo(pw * 0.9, ph * 0.2);
    ctx.lineTo(pw * 0.78, ph);
    ctx.lineTo(pw * 0.22, ph);
    ctx.closePath();
    ctx.fill();

    const soilGrad = ctx.createRadialGradient(pw / 2, ph * 0.25, 0, pw / 2, ph * 0.3, pw * 0.4);
    soilGrad.addColorStop(0, `rgba(60, 40, 25, ${0.5 + wetness * 0.3})`);
    soilGrad.addColorStop(1, '#2a1a10');
    ctx.fillStyle = soilGrad;
    ctx.beginPath();
    ctx.ellipse(pw / 2, ph * 0.28, pw * 0.38, ph * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  _drawLamp(ctx, w, h, index) {
    const px = POT_POSITIONS[index].x * w;
    const ly = h * this.lightHeight;
    const lw = w * 0.11;
    const lh = h * 0.045;

    ctx.save();
    ctx.translate(px - lw / 2, ly);

    ctx.strokeStyle = '#3a3a45';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lw / 2, lh);
    ctx.lineTo(lw / 2, lh + h * (POT_POSITIONS[index].y - this.lightHeight) - 20);
    ctx.stroke();

    const hoodGrad = ctx.createLinearGradient(0, 0, 0, lh);
    hoodGrad.addColorStop(0, this.upgrades.reflector ? '#4a4a55' : '#35353f');
    hoodGrad.addColorStop(1, '#222228');
    ctx.fillStyle = hoodGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(lw, 0);
    ctx.lineTo(lw * 0.92, lh);
    ctx.lineTo(lw * 0.08, lh);
    ctx.closePath();
    ctx.fill();

    const flicker = 0.85 + Math.sin(this.time * 8 + index) * 0.08;
    const bulbColor = this.lampType === 'hps'
      ? `rgba(255, ${160 + flicker * 40}, 60, ${flicker})`
      : `rgba(140, 200, 255, ${flicker})`;
    ctx.fillStyle = bulbColor;
    ctx.shadowColor = bulbColor;
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.ellipse(lw / 2, lh * 0.55, lw * 0.25, lh * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  _drawLightCone(ctx, w, h) {
    const warmth = this.lampType === 'hps';
    const alpha = 0.12 + (this.upgrades.reflector ? 0.06 : 0);

    for (let i = 0; i < 3; i++) {
      const px = POT_POSITIONS[i].x * w;
      const ly = h * this.lightHeight + h * 0.04;
      const py = POT_POSITIONS[i].y * h - 40;
      const coneW = w * (0.14 + (this.upgrades.reflector ? 0.04 : 0));

      const g = ctx.createRadialGradient(px, ly, 10, px, py, coneW);
      if (warmth) {
        g.addColorStop(0, `rgba(255, 200, 100, ${alpha * 2})`);
        g.addColorStop(0.5, `rgba(255, 150, 60, ${alpha})`);
        g.addColorStop(1, 'rgba(255, 120, 40, 0)');
      } else {
        g.addColorStop(0, `rgba(180, 220, 255, ${alpha * 2})`);
        g.addColorStop(1, 'rgba(100, 160, 255, 0)');
      }
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(px - coneW * 0.5, ly);
      ctx.lineTo(px + coneW * 0.5, ly);
      ctx.lineTo(px + coneW * 0.35, py);
      ctx.lineTo(px - coneW * 0.35, py);
      ctx.closePath();
      ctx.fill();
    }
  }

  _spawnParticle() {
    return {
      x: Math.random(),
      y: Math.random() * 0.5,
      vy: 0.0002 + Math.random() * 0.0004,
      size: 1 + Math.random() * 2,
      alpha: 0.1 + Math.random() * 0.3,
    };
  }

  _drawParticles(ctx, w, h) {
    ctx.fillStyle = 'rgba(255, 220, 150, 0.6)';
    for (const p of this.particles) {
      p.y -= p.vy;
      if (p.y < 0) Object.assign(p, this._spawnParticle(), { y: 0.55 });
      const px = p.x * w + Math.sin(this.time + p.x * 10) * 20;
      const py = p.y * h;
      ctx.globalAlpha = p.alpha * (0.5 + Math.sin(this.time * 2 + p.x * 5) * 0.5);
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  _drawFan(ctx, w, h) {
    const fx = w * 0.92;
    const fy = h * 0.55;
    const spin = this.time * 6;
    ctx.save();
    ctx.translate(fx, fy);
    ctx.fillStyle = '#3a3a45';
    ctx.fillRect(-20, -25, 40, 50);
    ctx.strokeStyle = '#5a5a65';
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.rotate(spin + (i * Math.PI * 2) / 3);
      ctx.beginPath();
      ctx.ellipse(0, -18, 6, 18, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  _drawVignette(ctx, w, h) {
    const g = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
}