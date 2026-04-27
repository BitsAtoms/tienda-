(function () {
  const modules = window.InterfazUnion || {};
  let scheduled = false;

  function refresh() {
    scheduled = false;
    document.body.classList.add("interfaz-union-standalone");
    modules.wallControl?.refresh();
    modules.objectActions?.refresh();
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
