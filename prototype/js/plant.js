/** Procedural plant generator — mirrors node-graph growth visually */

const STAGES = ['Seed', 'Seedling', 'Vegetative', 'Preflower', 'Flowering'];

export function createPlant(seed) {
  const rng = mulberry32(seed);
  const nodeCount = 12 + Math.floor(rng() * 80);
  const nodes = [];
  let x = 0;
  let y = 0;
  let angle = -Math.PI / 2 + (rng() - 0.5) * 0.3;
  const spread = 0.35 + rng() * 0.25;

  for (let i = 0; i < nodeCount; i++) {
    const len = 8 + rng() * 18;
    const thickness = Math.min(5, 1 + Math.floor(i / 15));
    angle += (rng() - 0.5) * spread;
    const nx = x + Math.cos(angle) * len;
    const ny = y + Math.sin(angle) * len;
    const leafType = pickLeafType(i, nodeCount, rng);
    nodes.push({
      x0: x, y0: y, x1: nx, y1: ny,
      thickness,
      leafType,
      leafId: Math.floor(rng() * 5),
      hasBud: leafType >= 3 && rng() > 0.55,
    });
    if (rng() > 0.82 && i > 4) angle += (rng() > 0.5 ? 1 : -1) * 0.9;
    x = nx;
    y = ny;
  }

  const stageIdx = Math.min(4, Math.floor(nodeCount / 22));
  return {
    name: ['Northern Lights', 'Blue Dream', 'Sour Diesel'][seed % 3],
    stage: STAGES[stageIdx],
    health: 72 + Math.floor(rng() * 24),
    height: Math.round(Math.abs(y)),
    potency: stageIdx >= 4 ? 12 + Math.floor(rng() * 10) : 0,
    moisture: 55 + Math.floor(rng() * 30),
    nodes,
    crownY: y,
  };
}

function pickLeafType(i, total, rng) {
  if (i < total * 0.15) return 0;
  if (i < total * 0.45) return 1;
  if (i < total * 0.75) return 2;
  return 3 + Math.floor(rng() * 2);
}

export function drawPlant(ctx, plant, originX, originY, scale, options = {}) {
  const { stress = 0, highlight = false, time = 0 } = options;
  const sway = Math.sin(time * 1.2 + originX * 0.01) * 2;

  ctx.save();
  ctx.translate(originX, originY);
  ctx.scale(scale, scale);

  if (highlight) {
    ctx.shadowColor = 'rgba(95, 214, 138, 0.5)';
    ctx.shadowBlur = 20;
  }

  for (const n of plant.nodes) {
    drawStem(ctx, n, sway, stress);
  }
  for (const n of plant.nodes) {
    if (n.leafType > 0) drawLeaf(ctx, n, sway, stress, time);
    if (n.hasBud) drawBud(ctx, n, sway, time);
  }

  ctx.restore();
}

function drawStem(ctx, n, sway, stress) {
  const grad = ctx.createLinearGradient(n.x0, n.y0, n.x1, n.y1);
  const brown = stress > 0.5 ? '#6b4423' : '#4a3728';
  const green = stress > 0.3 ? '#3d5c34' : '#2d5a27';
  grad.addColorStop(0, brown);
  grad.addColorStop(1, green);

  ctx.strokeStyle = grad;
  ctx.lineWidth = n.thickness;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(n.x0 + sway * 0.3, n.y0);
  ctx.quadraticCurveTo(
    (n.x0 + n.x1) / 2 + sway,
    (n.y0 + n.y1) / 2,
    n.x1 + sway * 0.6,
    n.y1
  );
  ctx.stroke();
}

function drawLeaf(ctx, n, sway, stress, time) {
  const sizes = [0, 14, 20, 26, 32];
  const sz = sizes[Math.min(n.leafType, 4)];
  const lx = n.x1 + sway * 0.6;
  const ly = n.y1;
  const side = n.leafId % 2 === 0 ? 1 : -1;
  const flutter = Math.sin(time * 2 + n.leafId) * 0.08;

  ctx.save();
  ctx.translate(lx, ly);
  ctx.rotate(side * (0.4 + flutter) + (n.leafId * 0.3));

  const leafGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, sz);
  if (stress > 0.6) {
    leafGrad.addColorStop(0, '#a8c66c');
    leafGrad.addColorStop(1, '#6b7a3a');
  } else {
    leafGrad.addColorStop(0, '#7fd99a');
    leafGrad.addColorStop(0.5, '#3d9a5f');
    leafGrad.addColorStop(1, '#1e5c34');
  }

  ctx.fillStyle = leafGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(sz * 0.5, -sz * 0.3, sz, -sz * 0.1, sz * 1.1, 0);
  ctx.bezierCurveTo(sz, sz * 0.35, sz * 0.3, sz * 0.5, 0, 0);
  ctx.fill();

  ctx.strokeStyle = 'rgba(30, 92, 52, 0.6)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(sz * 0.9, 0);
  ctx.stroke();

  ctx.restore();
}

function drawBud(ctx, n, sway, time) {
  const bx = n.x1 + sway * 0.6;
  const by = n.y1 - 4;
  const pulse = 1 + Math.sin(time * 3 + n.leafId) * 0.06;
  const r = 7 * pulse;

  const grad = ctx.createRadialGradient(bx - 2, by - 2, 0, bx, by, r);
  grad.addColorStop(0, '#c8f0a0');
  grad.addColorStop(0.4, '#7cb356');
  grad.addColorStop(1, '#3d6b2a');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(bx, by, r * 0.85, r, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 220, 150, 0.5)';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + time;
    ctx.beginPath();
    ctx.arc(bx + Math.cos(a) * 3, by + Math.sin(a) * 2, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}