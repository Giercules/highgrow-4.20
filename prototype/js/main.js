import { createPlant } from './plant.js';
import { RoomRenderer } from './room.js';
import { createGameState, endDay, addXP } from './game.js';
import { bindUI } from './ui.js';

const canvas = document.getElementById('grow-canvas');
const renderer = new RoomRenderer(canvas);
const state = createGameState();
const plants = [
  createPlant(101),
  createPlant(202),
  createPlant(303),
];

let highlightPot = 1;

const ui = bindUI({
  getPlants: () => plants,

  onCare(action, btn) {
    const xpMap = {
      visit: 15,
      water: 20,
      feed: 25,
      'light-up': 10,
      prune: 30,
    };

    const todayMap = {
      visit: 'visited',
      water: 'watered',
      feed: 'fed',
      'light-up': 'lightRaised',
      prune: 'pruned',
    };

    if (action === 'end-day') {
      endDay(state, plants);
      ui.sync(state, plants);
      ui.showJournal('end-day', state);
      syncUpgrades();
      return;
    }

    const key = todayMap[action];
    if (key && state.today[key]) return;

    if (action === 'water') {
      state.potWetness = state.potWetness.map((w) => Math.min(0.95, w + 0.25));
      plants.forEach((p) => { if (p) p.moisture = Math.min(90, p.moisture + 15); });
    }
    if (action === 'feed') {
      state.ph = Math.min(6.8, state.ph + 0.1);
      plants.forEach((p) => { if (p && p.potency) p.potency += 0.3; });
    }
    if (action === 'light-up') {
      state.lightHeight -= 0.03;
      renderer.setLightHeight(state.lightHeight);
      state.temp = Math.max(68, state.temp - 2);
    }
    if (action === 'prune') {
      const p = plants[1];
      if (p && p.nodes.length > 8) {
        p.nodes = p.nodes.slice(0, Math.floor(p.nodes.length * 0.85));
        highlightPot = 1;
      }
    }
    if (action === 'visit') highlightPot = Math.floor(Math.random() * 3);

    if (key) state.today[key] = true;
    if (xpMap[action]) {
      const leveled = addXP(state, xpMap[action]);
      if (leveled) ui.showLevelUp(state.level);
    }

    btn?.classList.add('done');
    ui.sync(state, plants);
    ui.showJournal(action, state);
    syncUpgrades();
  },

  onShopOpen() {
    ui.renderShop(state, (item) => syncUpgrades());
  },
});

function syncUpgrades() {
  renderer.setUpgrades({
    fan: state.owned.has('clip_fan'),
    reflector: state.owned.has('air_reflector'),
    mylar: state.owned.has('mylar_lining'),
  });
  renderer.setLightHeight(state.lightHeight);
}

function loop() {
  renderer.render(plants, {
    potWet: state.potWetness,
    highlightPot,
  });
  requestAnimationFrame(loop);
}

ui.sync(state, plants);
ui.renderShop(state, syncUpgrades);
syncUpgrades();
loop();

window.addEventListener('resize', () => {});

console.log('HighGrow Reboot prototype — Phase 0');
console.log('Use care buttons + shop to validate game feel.');