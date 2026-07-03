/** DOM bindings for HUD, care actions, shop */

import { SHOP_ITEMS, addXP, purchaseUpgrade, getJournalMessage } from './game.js';

export function bindUI(callbacks) {
  const els = {
    level: document.getElementById('player-level'),
    xpText: document.getElementById('xp-text'),
    xpFill: document.getElementById('xp-fill'),
    coins: document.getElementById('coin-count'),
    streak: document.getElementById('streak-count'),
    growDay: document.getElementById('grow-day'),
    temp: document.getElementById('temp-val'),
    humidity: document.getElementById('humidity-val'),
    ph: document.getElementById('ph-val'),
    tempFill: document.getElementById('temp-fill'),
    humidityFill: document.getElementById('humidity-fill'),
    phFill: document.getElementById('ph-fill'),
    plantCards: document.getElementById('plant-cards'),
    journal: document.getElementById('journal'),
    shopModal: document.getElementById('shop-modal'),
    shopItems: document.getElementById('shop-items'),
    shopCoins: document.getElementById('shop-coins'),
    levelupModal: document.getElementById('levelup-modal'),
    levelupText: document.getElementById('levelup-text'),
  };

  document.querySelectorAll('.care-btn[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => callbacks.onCare(btn.dataset.action, btn));
  });

  document.getElementById('btn-shop').addEventListener('click', () => {
    els.shopModal.classList.remove('hidden');
    callbacks.onShopOpen?.();
  });

  document.getElementById('shop-close').addEventListener('click', () => {
    els.shopModal.classList.add('hidden');
  });

  els.shopModal.querySelector('.modal-backdrop').addEventListener('click', () => {
    els.shopModal.classList.add('hidden');
  });

  document.getElementById('levelup-ok').addEventListener('click', () => {
    els.levelupModal.classList.add('hidden');
  });

  return {
    sync(state, plants) {
      els.level.textContent = state.level;
      els.xpText.textContent = `${state.xp} / 500`;
      els.xpFill.style.width = `${(state.xp / 500) * 100}%`;
      els.coins.textContent = state.coins;
      els.streak.textContent = state.streak;
      els.growDay.textContent = state.day;
      els.temp.textContent = `${state.temp}°F`;
      els.humidity.textContent = `${state.humidity}%`;
      els.ph.textContent = state.ph.toFixed(1);
      els.tempFill.style.width = `${((state.temp - 60) / 30) * 100}%`;
      els.humidityFill.style.width = `${state.humidity}%`;
      els.phFill.style.width = `${((state.ph - 5.5) / 2) * 100}%`;

      els.plantCards.innerHTML = plants
        .map(
          (p, i) => p
            ? `<div class="plant-card">
                <strong>Plant ${String.fromCharCode(65 + i)} — ${p.name}</strong>
                <span>${p.stage} · ${p.height}mm</span>
                <div class="stat-row"><span>Health</span><span>${p.health}%</span></div>
                <div class="health-bar"><span style="width:${p.health}%"></span></div>
                ${p.potency ? `<div class="stat-row"><span>Potency</span><span>${p.potency}%</span></div>` : ''}
              </div>`
            : ''
        )
        .join('');

      const map = {
        visit: 'visited',
        water: 'watered',
        feed: 'fed',
        'light-up': 'lightRaised',
        prune: 'pruned',
      };
      document.querySelectorAll('.care-btn[data-action]').forEach((btn) => {
        const key = map[btn.dataset.action];
        if (key && state.today[key]) btn.classList.add('done');
        else if (key) btn.classList.remove('done');
      });
    },

    renderShop(state, onBuy) {
      els.shopCoins.textContent = state.coins;
      els.shopItems.innerHTML = SHOP_ITEMS.map((item) => {
        const owned = state.owned.has(item.id);
        const canBuy = !owned && state.coins >= item.cost;
        return `<div class="shop-item ${owned ? 'owned' : ''}">
          <span class="emoji">${item.emoji}</span>
          <div>
            <h3>${item.name}</h3>
            <p>${item.desc}</p>
          </div>
          <button data-id="${item.id}" ${owned || !canBuy ? 'disabled' : ''}>
            ${owned ? 'Owned' : item.cost + ' ◎'}
          </button>
        </div>`;
      }).join('');

      els.shopItems.querySelectorAll('button[data-id]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const item = SHOP_ITEMS.find((i) => i.id === btn.dataset.id);
          if (item && purchaseUpgrade(state, item)) {
            onBuy(item);
            this.renderShop(state, onBuy);
            this.sync(state, callbacks.getPlants());
            showJournal(els, getJournalMessage('shop', state));
          }
        });
      });
    },

    showJournal(action, state) {
      showJournal(els, getJournalMessage(action, state));
    },

    showLevelUp(level) {
      els.levelupText.textContent = `You reached level ${level}. New challenges and shop tiers await.`;
      els.levelupModal.classList.remove('hidden');
      showJournal(els, getJournalMessage('levelup', { level }));
    },
  };
}

function showJournal(els, text) {
  els.journal.textContent = text;
  els.journal.classList.remove('hidden');
  clearTimeout(els.journal._timer);
  els.journal._timer = setTimeout(() => els.journal.classList.add('hidden'), 5000);
}

export { addXP };