(function () {
  function findWallPanel() {
    const heading = Array.from(document.querySelectorAll("h2")).find(
      (node) => node.textContent.trim() === "Control 2D de Paredes"
    );
    if (!heading) return null;

    let panel = heading.parentElement;
    while (panel && !panel.querySelector(".wall-bg")) {
      panel = panel.parentElement;
    }
    return panel;
  }

  function decorateGuide(panel) {
    if (panel.querySelector(".iu-wall-guide")) return;

    const guide = document.createElement("div");
    guide.className = "iu-wall-guide";
    guide.innerHTML = [
      "<span>Plano frontal por pared</span>",
      "<span>Puntos editables con color</span>",
      "<span>Zonas fijas en baja opacidad</span>",
    ].join("");

    const header = panel.querySelector("h2")?.parentElement;
    if (header) header.insertAdjacentElement("afterend", guide);
  }

  function decorateWallLanes(panel) {
    panel.querySelectorAll(".wall-bg").forEach((wall, index) => {
      wall.dataset.wallSide = index === 0 ? "left" : "right";
      const lane = wall.closest(".flex.flex-col");
      if (lane) lane.classList.add("iu-wall-lane");

      const meta = lane?.querySelector("div:first-child span:last-child");
      if (meta) meta.textContent = "Izquierda a derecha";
    });
  }

  function refresh() {
    const panel = findWallPanel();
    if (!panel) return;

    panel.classList.add("iu-wall-panel");
    decorateGuide(panel);
    decorateWallLanes(panel);
  }

  window.InterfazUnion = window.InterfazUnion || {};
  window.InterfazUnion.wallControl = { refresh };
})();
