const state = { examples: [], visible: [], selected: null, timer: null, syncing: false };
const $ = (id) => document.getElementById(id);
const unique = (items, key) => [...new Set(items.map((item) => item[key]))].sort();
const fill = (select, values, current) => {
  select.innerHTML = values
    .map((v) => `<option${v === current ? " selected" : ""}>${v}</option>`)
    .join("");
};
const formatTask = (value) =>
  value === "DD" ? "Disease diagnosis" : value === "LL" ? "Lesion localization" : value;

function readParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    proposer: params.get("proposer") || "",
    target: params.get("target") || "",
    task: params.get("task") || "",
    id: params.get("id") || "",
    key: params.get("key") || "",
  };
}

function writeParams() {
  if (state.syncing || !state.selected) return;
  const x = state.selected;
  const params = new URLSearchParams({
    proposer: x.proposer_model,
    target: x.target_vlm,
    task: x.task,
    id: x.id,
  });
  const next = `${window.location.pathname}?${params.toString()}`;
  const current = `${window.location.pathname}${window.location.search}`;
  if (next !== current) {
    history.replaceState(null, "", next);
  }
}

function applyQuerySelection() {
  const q = readParams();
  if (q.id) {
    const byId = state.examples.find((x) => x.id === q.id);
    if (byId) {
      $("proposer").value = byId.proposer_model;
      updateFilters("proposer", { skipUrl: true });
      $("target").value = byId.target_vlm;
      updateFilters("target", { skipUrl: true });
      $("task").value = byId.task;
      updateFilters("task", { skipUrl: true });
      $("example").value = byId.title;
      updateFilters("example", { skipUrl: true });
      return true;
    }
  }
  if (q.key) {
    const byKey = state.examples.find((x) => x.key === q.key);
    if (byKey) {
      $("proposer").value = byKey.proposer_model;
      updateFilters("proposer", { skipUrl: true });
      $("target").value = byKey.target_vlm;
      updateFilters("target", { skipUrl: true });
      $("task").value = byKey.task;
      updateFilters("task", { skipUrl: true });
      $("example").value = byKey.title;
      updateFilters("example", { skipUrl: true });
      return true;
    }
  }
  if (q.proposer) $("proposer").value = q.proposer;
  updateFilters("proposer", { skipUrl: true });
  if (q.target) $("target").value = q.target;
  updateFilters("target", { skipUrl: true });
  if (q.task) $("task").value = q.task;
  updateFilters("task", { skipUrl: true });
  return Boolean(q.proposer || q.target || q.task);
}

function updateFilters(origin, { skipUrl = false } = {}) {
  fill($("proposer"), unique(state.examples, "proposer_model"), $("proposer").value);
  let rows = state.examples.filter((x) => x.proposer_model === $("proposer").value);
  fill($("target"), unique(rows, "target_vlm"), $("target").value);
  rows = rows.filter((x) => x.target_vlm === $("target").value);
  fill($("task"), unique(rows, "task"), $("task").value);
  rows = rows.filter((x) => x.task === $("task").value);
  state.visible = rows;
  $("task").querySelectorAll("option").forEach((o) => {
    o.textContent = formatTask(o.value);
  });
  fill(
    $("example"),
    rows.map((x) => x.title),
    $("example").value
  );
  state.selected = rows.find((x) => x.title === $("example").value) || rows[0];
  render();
  if (!skipUrl) writeParams();
}

function typeInto(node, text, speed = 2) {
  clearInterval(state.timer);
  node.textContent = "";
  node.classList.add("typing");
  let i = 0;
  const chunk = Math.max(1, Math.ceil(text.length / 180));
  state.timer = setInterval(() => {
    i = Math.min(text.length, i + chunk);
    node.textContent = text.slice(0, i);
    if (i >= text.length) {
      clearInterval(state.timer);
      node.classList.remove("typing");
    }
  }, speed * chunk);
}

function render(animate = false) {
  const x = state.selected;
  if (!x) return;
  $("title").textContent = x.title;
  $("example-count").textContent = `${state.examples.indexOf(x) + 1} of ${
    state.examples.length
  } recorded examples`;
  $("proposer-badge").textContent = `Proposer · ${x.proposer_model}`;
  $("target-badge").textContent = `Target · ${x.target_vlm}`;
  $("ultrasound").src = x.image;
  $("ultrasound").alt = `Ultrasound image for ${x.title}, record ${x.key}`;
  $("before").textContent = x.prediction_before;
  $("after").textContent = x.prediction_after;
  $("truth").textContent = x.ground_truth;
  $("changes").innerHTML = x.changes
    .map(
      (c) =>
        `<li><b>Step ${c.step}</b><br><del>${escapeHtml(c.previous)}</del> → <ins>${escapeHtml(
          c.replacement
        )}</ins></li>`
    )
    .join("");
  $("record-key").textContent = x.key;
  $("dataset-source").textContent = `${x.dataset_source} · row ${x.dataset_row_index}`;
  if (animate) {
    typeInto($("original-prompt"), x.original_prompt);
    setTimeout(() => typeInto($("attacked-prompt"), x.attacked_prompt), 650);
  } else {
    $("original-prompt").textContent = x.original_prompt;
    $("attacked-prompt").textContent = x.attacked_prompt;
  }
}

function escapeHtml(value) {
  const d = document.createElement("div");
  d.textContent = value;
  return d.innerHTML;
}

fetch("data/examples.json")
  .then((r) => r.json())
  .then((data) => {
    state.examples = data;
    fill($("proposer"), unique(data, "proposer_model"));
    state.syncing = true;
    const applied = applyQuerySelection();
    if (!applied) updateFilters("proposer", { skipUrl: true });
    writeParams();
    state.syncing = false;
    ["proposer", "target", "task", "example"].forEach((id) =>
      $(id).addEventListener("change", () => updateFilters(id))
    );
    $("replay").addEventListener("click", () => render(true));
  })
  .catch((error) => {
    document.querySelector("main").innerHTML = `<p>Could not load examples: ${error.message}</p>`;
  });
