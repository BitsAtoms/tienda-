(function () {
  const STORAGE_KEY = "interfaz-union-object-state";

  const state = loadState();

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return {
        reviewed: new Set(parsed.reviewed || []),
        favorites: new Set(parsed.favorites || []),
      };
    } catch (_) {
      return { reviewed: new Set(), favorites: new Set() };
    }
  }

  function saveState() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        reviewed: Array.from(state.reviewed),
        favorites: Array.from(state.favorites),
      })
    );
  }

  function keyFor(title) {
    return (title || "objeto").trim().toLowerCase();
  }

  function showToast(message) {
    const oldToast = document.querySelector(".iu-toast");
    if (oldToast) oldToast.remove();

    const toast = document.createElement("div");
    toast.className = "iu-toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    window.setTimeout(() => toast.remove(), 2500);
  }

  function pulseFocus(title) {
    const oldFocus = document.querySelector(".iu-scene-focus");
    if (oldFocus) oldFocus.remove();

    const focus = document.createElement("div");
    focus.className = "iu-scene-focus";
    focus.setAttribute("aria-label", `Foco visual sobre ${title}`);
    document.body.appendChild(focus);
    window.setTimeout(() => focus.remove(), 1500);
  }

  function copySummary(title, context) {
    const rows = Array.from(context.querySelectorAll("span, strong"))
      .map((node) => node.textContent.trim())
      .filter(Boolean)
      .slice(0, 12);
    const text = [title, ...rows].join(" | ");

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => showToast(`Ficha copiada: ${title}`),
        () => showToast(`Ficha preparada: ${title}`)
      );
    } else {
      showToast(`Ficha preparada: ${title}`);
    }
  }

  function syncBadges(container, title) {
    let badgeRow = container.querySelector(".iu-object-badges");
    if (!badgeRow) {
      badgeRow = document.createElement("div");
      badgeRow.className = "iu-object-badges";
      container.appendChild(badgeRow);
    }

    const id = keyFor(title);
    const badges = [];
    if (state.reviewed.has(id)) badges.push("Revisado");
    if (state.favorites.has(id)) badges.push("Favorito");
    badgeRow.innerHTML = badges.map((label) => `<span>${label}</span>`).join("");
  }

  function setButtonStates(panel, title) {
    const id = keyFor(title);
    panel.querySelector('[data-action="review"]').dataset.active = String(state.reviewed.has(id));
    panel.querySelector('[data-action="favorite"]').dataset.active = String(state.favorites.has(id));
  }

  function buildActionPanel(title, context) {
    const panel = document.createElement("div");
    panel.className = "iu-action-panel";
    panel.dataset.objectTitle = title;
    panel.innerHTML = [
      '<button type="button" data-action="focus">Enfocar</button>',
      '<button type="button" data-action="review">Marcar OK</button>',
      '<button type="button" data-action="favorite">Favorito</button>',
      '<button type="button" data-action="copy">Copiar ficha</button>',
    ].join("");

    panel.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button) return;

      const id = keyFor(title);
      const action = button.dataset.action;

      if (action === "focus") {
        pulseFocus(title);
        showToast(`Foco aplicado a ${title}`);
      }

      if (action === "review") {
        state.reviewed.has(id) ? state.reviewed.delete(id) : state.reviewed.add(id);
        saveState();
        syncBadges(context, title);
        setButtonStates(panel, title);
      }

      if (action === "favorite") {
        state.favorites.has(id) ? state.favorites.delete(id) : state.favorites.add(id);
        saveState();
        syncBadges(context, title);
        setButtonStates(panel, title);
      }

      if (action === "copy") {
        copySummary(title, context);
      }
    });

    setButtonStates(panel, title);
    return panel;
  }

  function decorateObjectContext(context, title) {
    if (!context || !title) return;

    const oldPanel = context.querySelector(".iu-action-panel");
    if (oldPanel && oldPanel.dataset.objectTitle === title) {
      syncBadges(context, title);
      setButtonStates(oldPanel, title);
      return;
    }
    if (oldPanel) oldPanel.remove();

    const panel = buildActionPanel(title, context);
    context.appendChild(panel);
    syncBadges(context, title);
  }

  function decorateModal() {
    document.querySelectorAll(".fixed.z-50").forEach((modal) => {
      const title = modal.querySelector("h3")?.textContent.trim();
      if (!title) return;
      decorateObjectContext(modal, title);
    });
  }

  function decorateInspector() {
    const heading = Array.from(document.querySelectorAll("h3")).find(
      (node) => node.textContent.trim() === "Seleccion actual"
    );
    if (!heading) return;

    const panel = heading.closest("div");
    const selectedName = panel?.querySelector("strong")?.textContent.trim();
    if (!panel || !selectedName) {
      panel?.querySelector(".iu-action-panel")?.remove();
      panel?.querySelector(".iu-object-badges")?.remove();
      return;
    }

    decorateObjectContext(panel, selectedName);
  }

  function refresh() {
    decorateModal();
    decorateInspector();
  }

  window.InterfazUnion = window.InterfazUnion || {};
  window.InterfazUnion.objectActions = { refresh };
})();
