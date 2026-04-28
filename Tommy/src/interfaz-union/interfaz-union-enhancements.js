(function () {
  const modules = window.InterfazUnion || {};
  let scheduled = false;

  const roomBuilderState = {
    createdConfig: null,
    previousConfig: null,
  };

  function createInput(label, inputHtml) {
    const field = document.createElement("label");
    field.className = "iu-room-field";
    field.innerHTML = `<span>${label}</span>${inputHtml}`;
    return field;
  }

  function getSectionByHeading(tagName, text) {
    const heading = Array.from(document.querySelectorAll(tagName)).find(
      (node) => node.textContent.trim() === text
    );
    if (!heading) return null;
    return heading.closest("section") || heading.parentElement?.closest("section") || heading.parentElement;
  }

  function clickButtonWithText(scope, text) {
    const button = Array.from(scope.querySelectorAll("button")).find(
      (node) =>
        node.textContent.trim() === text ||
        node.querySelector("strong")?.textContent?.trim() === text ||
        node.textContent.includes(text)
    );
    if (button) button.click();
    return button;
  }

  function readActiveTemplateName(section) {
    const active = Array.from(section.querySelectorAll("button")).find((button) =>
      button.className.includes("border-cyan-300")
    );
    return active?.textContent.trim() || "Base showroom";
  }

  function readRoomSnapshot() {
    const roomSection = getSectionByHeading("h2", "Crear Mi Sala");
    const panoramaSection = getSectionByHeading("h2", "Panoramicas");
    const assetsSection = getSectionByHeading("h2", "Assets y Signage");
    const sceneSection = getSectionByHeading("h2", "Escena");
    const lightToggle = getSectionByHeading("h2", "Iluminacion")?.querySelector("button");
    const lightRange = getSectionByHeading("h2", "Iluminacion")?.querySelector('input[type="range"]');

    const panorama = panoramaSection
      ? Array.from(panoramaSection.querySelectorAll("button")).find((button) =>
          button.className.includes("border-cyan-300")
        )?.querySelector("strong")?.textContent?.trim() || "Pasillo Hero"
      : "Pasillo Hero";

    const signage = assetsSection
      ? Array.from(assetsSection.querySelectorAll("button")).find((button) =>
          button.className.includes("border-cyan-300")
        )?.textContent?.trim() || "Promo Neon Cyber"
      : "Promo Neon Cyber";

    const controllerVisible = sceneSection
      ? Array.from(sceneSection.querySelectorAll("button")).some((button) =>
          button.textContent.includes("Ocultar controlador 2D")
        )
      : true;

    return {
      roomName: readActiveTemplateName(roomSection || document),
      baseTemplate: readActiveTemplateName(roomSection || document),
      roomShape: "Rectangular",
      roomWidth: 20,
      roomDepth: 8,
      roomHeight: 4,
      roomEntrance: "Frontal",
      panorama,
      signage,
      light: Number(lightRange?.value || 100),
      lightsOn: Boolean(lightToggle?.textContent.includes("Luces encendidas")),
      controllerVisible,
    };
  }

  function setLightLevel(value, lightsOn) {
    const lightSection = getSectionByHeading("h2", "Iluminacion");
    if (!lightSection) return;

    const toggle = lightSection.querySelector("button");
    const range = lightSection.querySelector('input[type="range"]');
    if (!range) return;

    const nextValue = String(Math.max(35, Math.min(100, Number(value) || 100)));
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
    nativeSetter?.call(range, nextValue);
    range.dispatchEvent(new Event("input", { bubbles: true }));
    range.dispatchEvent(new Event("change", { bubbles: true }));

    const shouldBeOn = lightsOn !== false;
    const areLightsOn = toggle?.textContent.includes("Luces encendidas");
    if (toggle && shouldBeOn && !areLightsOn) toggle.click();
    if (toggle && !shouldBeOn && areLightsOn) toggle.click();
  }

  function updateRoomBuilderSummary() {
    const summary = document.querySelector(".iu-room-summary");
    if (!summary) return;

    const created = roomBuilderState.createdConfig;
    if (!created) {
      summary.innerHTML =
        "<strong>Sin sala creada todavia.</strong><span>Configura valores y genera una nueva variante personalizada.</span>";
      return;
    }

    summary.innerHTML = [
      `<strong>${created.roomName}</strong>`,
      `<span>${created.roomShape} - ${created.roomWidth}m x ${created.roomDepth}m x ${created.roomHeight}m - Acceso ${created.roomEntrance}</span>`,
      `<span>${created.baseTemplate} - ${created.panorama}</span>`,
      `<span>Luz ${created.light}% - ${created.signage} - Controlador ${created.controllerVisible ? "visible" : "oculto"}</span>`,
    ].join("");
  }

  function syncRoomBuilderFields(config) {
    const container = document.querySelector(".iu-room-builder");
    if (!container || !config) return;

    const values = {
      roomName: config.roomName,
      baseTemplate: config.baseTemplate,
      roomShape: config.roomShape,
      roomWidth: config.roomWidth,
      roomDepth: config.roomDepth,
      roomHeight: config.roomHeight,
      roomEntrance: config.roomEntrance,
      panorama: config.panorama,
      signage: config.signage,
      light: config.light,
      controllerVisible: config.controllerVisible ? "visible" : "hidden",
    };

    Object.entries(values).forEach(([name, value]) => {
      const field = container.querySelector(`[name="${name}"]`);
      if (field && value !== undefined) field.value = value;
    });

    const lightPreview = container.querySelector("[data-light-preview]");
    if (lightPreview && values.light !== undefined) lightPreview.textContent = `${values.light}%`;
  }

  function applyRoomConfig(config) {
    const roomSection = getSectionByHeading("h2", "Crear Mi Sala");
    const panoramaSection = getSectionByHeading("h2", "Panoramicas");
    const assetsSection = getSectionByHeading("h2", "Assets y Signage");
    const sceneSection = getSectionByHeading("h2", "Escena");

    if (roomSection) clickButtonWithText(roomSection, config.baseTemplate);
    if (panoramaSection) clickButtonWithText(panoramaSection, config.panorama);
    if (assetsSection) clickButtonWithText(assetsSection, config.signage);

    if (sceneSection) {
      const controllerButton = Array.from(sceneSection.querySelectorAll("button")).find((button) =>
        button.textContent.includes("controlador 2D")
      );
      const visibleNow = controllerButton?.textContent.includes("Ocultar controlador 2D");
      if (controllerButton && config.controllerVisible !== visibleNow) {
        controllerButton.click();
      }
    }

    setLightLevel(config.light, config.lightsOn);
    syncRoomBuilderFields(config);
    updateRoomBuilderSummary();
    document.dispatchEvent(new CustomEvent("iu-room-config-change", { detail: config }));
  }

  function enhanceRoomBuilder() {
    const section = getSectionByHeading("h2", "Crear Mi Sala");
    if (!section) return;

    let container = section.querySelector(".iu-room-builder");
    if (!container) {
      const originalGrid = section.querySelector(".mt-3.grid.gap-2");
      if (originalGrid) {
        originalGrid.classList.add("iu-room-presets");
      }

      container = document.createElement("div");
      container.className = "iu-room-builder";

      const heading = document.createElement("div");
      heading.className = "iu-room-builder-heading";
      heading.innerHTML = [
        "<strong>Configurador avanzado</strong>",
        "<span>Define una sala nueva con valores reales y aplicala sin perder la anterior.</span>",
      ].join("");

      const fields = document.createElement("div");
      fields.className = "iu-room-fields";
      fields.appendChild(createInput("Nombre", '<input type="text" name="roomName" value="Sala personalizada" maxlength="40" />'));
      fields.appendChild(
        createInput(
          "Forma de sala",
          '<select name="roomShape"><option>Rectangular</option><option>Cuadrada</option><option>Pasillo largo</option><option>En L</option><option>Abierta</option></select>'
        )
      );
      fields.appendChild(createInput("Ancho (m)", '<input type="number" name="roomWidth" min="4" max="60" step="0.5" value="20" />'));
      fields.appendChild(createInput("Fondo (m)", '<input type="number" name="roomDepth" min="3" max="40" step="0.5" value="8" />'));
      fields.appendChild(createInput("Altura (m)", '<input type="number" name="roomHeight" min="2.2" max="8" step="0.1" value="4" />'));
      fields.appendChild(
        createInput(
          "Acceso principal",
          '<select name="roomEntrance"><option>Frontal</option><option>Lateral izquierdo</option><option>Lateral derecho</option><option>Doble acceso</option><option>Sin acceso visible</option></select>'
        )
      );
      fields.appendChild(
        createInput(
          "Base",
          '<select name="baseTemplate"><option>Base showroom</option><option>Setup denso</option><option>Setup minimo</option></select>'
        )
      );
      fields.appendChild(
        createInput(
          "Panoramica",
          '<select name="panorama"><option>Pasillo Hero</option><option>Pantallas</option><option>Matrix</option></select>'
        )
      );
      fields.appendChild(
        createInput(
          "Signage",
          '<select name="signage"><option>Promo Neon Cyber</option><option>Cyber City Art</option><option>Abstract Matrix</option><option>Apagado</option></select>'
        )
      );
      fields.appendChild(
        createInput(
          "Luz",
          '<input type="range" name="light" min="35" max="100" value="100" /><em data-light-preview>100%</em>'
        )
      );
      fields.appendChild(
        createInput(
          "Controlador 2D",
          '<select name="controllerVisible"><option value="visible">Visible</option><option value="hidden">Oculto</option></select>'
        )
      );

      const actions = document.createElement("div");
      actions.className = "iu-room-actions";
      actions.innerHTML = [
        '<button type="button" data-room-action="create">Crear sala personalizada</button>',
        '<button type="button" data-room-action="previous">Volver a la anterior</button>',
        '<button type="button" data-room-action="created">Ir a la sala creada</button>',
      ].join("");

      const summary = document.createElement("div");
      summary.className = "iu-room-summary";

      container.appendChild(heading);
      container.appendChild(fields);
      container.appendChild(actions);
      container.appendChild(summary);
      section.appendChild(container);

      const lightPreview = container.querySelector("[data-light-preview]");
      const lightInput = container.querySelector('input[name="light"]');
      lightInput?.addEventListener("input", () => {
        if (lightPreview) lightPreview.textContent = `${lightInput.value}%`;
      });

      actions.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-room-action]");
        if (!button) return;

        if (button.dataset.roomAction === "create") {
          roomBuilderState.previousConfig = readRoomSnapshot();
          roomBuilderState.createdConfig = {
            roomName: container.querySelector('input[name="roomName"]')?.value.trim() || "Sala personalizada",
            baseTemplate: container.querySelector('select[name="baseTemplate"]')?.value || "Base showroom",
            roomShape: container.querySelector('select[name="roomShape"]')?.value || "Rectangular",
            roomWidth: Number(container.querySelector('input[name="roomWidth"]')?.value || 20),
            roomDepth: Number(container.querySelector('input[name="roomDepth"]')?.value || 8),
            roomHeight: Number(container.querySelector('input[name="roomHeight"]')?.value || 4),
            roomEntrance: container.querySelector('select[name="roomEntrance"]')?.value || "Frontal",
            panorama: container.querySelector('select[name="panorama"]')?.value || "Pasillo Hero",
            signage: container.querySelector('select[name="signage"]')?.value || "Promo Neon Cyber",
            light: Number(container.querySelector('input[name="light"]')?.value || 100),
            lightsOn: true,
            controllerVisible:
              (container.querySelector('select[name="controllerVisible"]')?.value || "visible") === "visible",
          };
          applyRoomConfig(roomBuilderState.createdConfig);
        }

        if (button.dataset.roomAction === "previous" && roomBuilderState.previousConfig) {
          applyRoomConfig(roomBuilderState.previousConfig);
        }

        if (button.dataset.roomAction === "created" && roomBuilderState.createdConfig) {
          applyRoomConfig(roomBuilderState.createdConfig);
        }
      });
    }

    updateRoomBuilderSummary();
  }

  function enhanceLighting() {
    if (document.body.dataset.iuLightingBoosted === "true") return;
    const lightSection = getSectionByHeading("h2", "Iluminacion");
    const lightRange = lightSection?.querySelector('input[type="range"]');
    if (!lightRange) return;

    document.body.dataset.iuLightingBoosted = "true";
    window.requestAnimationFrame(() => {
      setLightLevel(Math.max(100, Number(lightRange.value || 0)), true);
    });
  }

  function refresh() {
    scheduled = false;
    document.body.classList.add("interfaz-union-standalone");
    modules.wallControl?.refresh();
    modules.objectActions?.refresh();
    enhanceLighting();
    enhanceRoomBuilder();
  }

  function scheduleRefresh() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(refresh);
  }

  const observer = new MutationObserver(scheduleRefresh);
  observer.observe(document.body, { childList: true, subtree: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", refresh, { once: true });
  } else {
    refresh();
  }
})();
