/** Gamification mock — XP, coins, upgrades, daily care state */

export const SHOP_ITEMS = [
  {
    id: 'clip_fan',
    name: 'Clip Fan',
    emoji: '🌀',
    cost: 200,
    desc: '−4°F, stabilizes humidity swings',
    effects: { temp: -4, humidity: 5 },
    upgradeKey: 'fan',
  },
  {
    id: 'air_reflector',
    name: 'Air-Cooled Reflector',
    emoji: '🔆',
    cost: 450,
    desc: '+5% yield, brighter cone, cooler room',
    effects: { temp: -3, yield: 5 },
    upgradeKey: 'reflector',
  },
  {
    id: 'mylar_lining',
    name: 'Mylar Lining',
    emoji: '✨',
    cost: 300,
    desc: 'Light efficiency + visible wall sheen',
    effects: { light: 8 },
    upgradeKey: 'mylar',
  },
  {
    id: 'pro_nutes',
    name: 'Pro Nutrient Line',
    emoji: '🧪',
    cost: 350,
    desc: 'pH holds longer after feeding',
    effects: { phStability: 1 },
    upgradeKey: 'proNutes',
  },
  {
    id: 'smart_pot',
    name: 'Smart Pot (3×)',
    emoji: '🪴',
    cost: 500,
    desc: 'Moisture drains better — fewer dry spells',
    effects: { moisture: 10 },
    upgradeKey: 'smartPot',
  },
];

const XP_PER_LEVEL = 500;

export function createGameState() {
  return {
    day: 42,
    level: 3,
    xp: 240,
    coins: 1250,
    streak: 5,
    temp: 78,
    humidity: 58,
    ph: 6.4,
    lightHeight: 0.55,
    owned: new Set(),
    today: {
      visited: false,
      watered: false,
      fed: false,
      lightRaised: false,
      pruned: false,
    },
    potWetness: [0.55, 0.42, 0.6],
  };
}

export function addXP(state, amount) {
  state.xp += amount;
  let leveled = false;
  while (state.xp >= XP_PER_LEVEL) {
    state.xp -= XP_PER_LEVEL;
    state.level += 1;
    leveled = true;
  }
  return leveled;
}

export function purchaseUpgrade(state, item) {
  if (state.owned.has(item.id) || state.coins < item.cost) return false;
  state.coins -= item.cost;
  state.owned.add(item.id);
  if (item.effects.temp) state.temp += item.effects.temp;
  if (item.effects.humidity) state.humidity = Math.min(70, state.humidity + item.effects.humidity);
  return true;
}

export function endDay(state, plants) {
  const wateredToday = state.today.watered;
  const visitedToday = state.today.visited;

  state.day += 1;
  state.today = {
    visited: false,
    watered: false,
    fed: false,
    lightRaised: false,
    pruned: false,
  };

  if (visitedToday) state.streak += 1;
  else state.streak = 1;

  state.coins += 15 + Math.floor(Math.random() * 20);
  addXP(state, 50);

  for (let i = 0; i < 3; i++) {
    state.potWetness[i] = Math.max(0.2, state.potWetness[i] - 0.08);
    if (plants[i]) {
      plants[i].health = Math.max(40, Math.min(98, plants[i].health + (wateredToday ? 2 : -3)));
      if (state.day % 3 === 0 && plants[i].nodes.length < 120) {
        growPlantOneNode(plants[i]);
      }
    }
  }

  state.humidity = Math.max(40, Math.min(75, state.humidity + (Math.random() - 0.5) * 6));
  state.ph = Math.max(5.8, Math.min(7.0, state.ph + (Math.random() - 0.5) * 0.2));
}

function growPlantOneNode(plant) {
  const last = plant.nodes[plant.nodes.length - 1];
  const angle = Math.atan2(last.y1 - last.y0, last.x1 - last.x0) + (Math.random() - 0.5) * 0.5;
  const len = 10 + Math.random() * 12;
  const nx = last.x1 + Math.cos(angle) * len;
  const ny = last.y1 + Math.sin(angle) * len;
  plant.nodes.push({
    x0: last.x1, y0: last.y1, x1: nx, y1: ny,
    thickness: Math.min(5, last.thickness + (Math.random() > 0.9 ? 1 : 0)),
    leafType: Math.min(4, last.leafType + (Math.random() > 0.7 ? 1 : 0)),
    leafId: Math.floor(Math.random() * 5),
    hasBud: last.leafType >= 3 && Math.random() > 0.7,
  });
  plant.height = Math.round(Math.abs(ny));
  if (plant.nodes.length > 30) plant.stage = 'Flowering';
  else if (plant.nodes.length > 18) plant.stage = 'Preflower';
}

export function getJournalMessage(action, state) {
  const tips = {
    visit: 'Plants look perky under the HPS. Check moisture before lights-off.',
    water: 'Nice soak — runoff clear. Watch for droop tomorrow if overdone.',
    feed: state.owned.has('pro_nutes')
      ? 'Pro line keeping pH stable. NPK balanced for mid-flower.'
      : 'Fed at 1.2 EC. pH may drift — consider the Pro Nutrient upgrade.',
    'light-up': 'Raised hood 3". Heat stress risk drops on the center cola.',
    prune: 'Topped Plant B — two new mains will split from the tip node.',
    'end-day': `Day ${state.day} complete. Streak: ${state.streak} 🔥`,
    shop: 'Invest coins in gear that shows on-screen and shifts your stats.',
    levelup: 'New shop tiers unlock as you level. Keep the daily streak alive.',
  };
  return tips[action] || 'Keep showing up — consistency beats perfect runs.';
}