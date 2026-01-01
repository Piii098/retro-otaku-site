(() => {
  const STORAGE_KEY = "retro_otaku_site_v1";

  const pad = (n, len) => String(n).padStart(len, "0");

  const formatDate = (d) => {
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1, 2);
    const day = pad(d.getDate(), 2);
    return `${y}/${m}/${day}`;
  };

  const formatDateTime = (d) => {
    const hh = pad(d.getHours(), 2);
    const mm = pad(d.getMinutes(), 2);
    const ss = pad(d.getSeconds(), 2);
    return `${formatDate(d)} ${hh}:${mm}:${ss}`;
  };

  const loadState = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return {
          total: 0,
          day: formatDate(new Date()),
          today: 0,
          yesterday: 0,
          guestbook: [],
        };
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") throw new Error("bad state");
      return {
        total: Number(parsed.total) || 0,
        day: typeof parsed.day === "string" ? parsed.day : formatDate(new Date()),
        today: Number(parsed.today) || 0,
        yesterday: Number(parsed.yesterday) || 0,
        guestbook: Array.isArray(parsed.guestbook) ? parsed.guestbook : [],
      };
    } catch {
      return {
        total: 0,
        day: formatDate(new Date()),
        today: 0,
        yesterday: 0,
        guestbook: [],
      };
    }
  };

  const saveState = (state) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  };

  const el = (id) => document.getElementById(id);

  const state = loadState();
  const now = new Date();
  const todayKey = formatDate(now);

  if (state.day !== todayKey) {
    state.yesterday = state.today;
    state.today = 0;
    state.day = todayKey;
  }

  state.total += 1;
  state.today += 1;
  saveState(state);

  const counterEl = el("counter");
  const todayEl = el("today");
  const yesterdayEl = el("yesterday");
  if (counterEl) counterEl.textContent = pad(state.total, 6);
  if (todayEl) todayEl.textContent = String(state.today);
  if (yesterdayEl) yesterdayEl.textContent = String(state.yesterday);

  const lastUpdatedEl = el("lastUpdated");
  if (lastUpdatedEl) lastUpdatedEl.textContent = todayKey;

  const nowEl = el("now");
  const tick = () => {
    if (!nowEl) return;
    nowEl.textContent = formatDateTime(new Date());
  };
  tick();
  setInterval(tick, 1000);

  const kiriTargets = new Set([7777, 8888, 9999]);
  if (kiriTargets.has(state.total)) {
    setTimeout(() => {
      alert(`★キリ番 ${state.total} おめでとうございます★\nゲストブックに「踏みました！」って書いてね！`);
    }, 100);
  }

  const logEl = el("guestbookLog");
  const renderGuestbook = () => {
    if (!logEl) return;

    const items = state.guestbook.slice().reverse();
    if (items.length === 0) {
      logEl.textContent = "（まだ書きこみがありません）";
      return;
    }

    logEl.textContent = "";
    for (const item of items) {
      const wrap = document.createElement("div");
      wrap.className = "gb-item";

      const meta = document.createElement("div");
      meta.className = "gb-meta";
      meta.textContent = `${item.date} / ${item.name}`;

      const body = document.createElement("div");
      body.className = "gb-body";
      body.textContent = item.message;

      wrap.appendChild(meta);
      wrap.appendChild(body);
      logEl.appendChild(wrap);
    }
  };

  const form = el("guestbookForm");
  const nameInput = el("gbName");
  const messageInput = el("gbMessage");
  if (form && nameInput && messageInput) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = String(nameInput.value || "").trim().slice(0, 20) || "ななし";
      const message = String(messageInput.value || "").trim().slice(0, 200);
      if (!message) return;

      state.guestbook.push({
        name,
        message,
        date: formatDateTime(new Date()),
      });
      saveState(state);

      messageInput.value = "";
      renderGuestbook();
    });
  }

  const clearBtn = el("gbClear");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      const ok = confirm("ゲストブックのログを消しますか？（このブラウザ内だけ）");
      if (!ok) return;
      state.guestbook = [];
      saveState(state);
      renderGuestbook();
    });
  }

  renderGuestbook();
})();
