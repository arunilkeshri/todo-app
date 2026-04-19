(function () {
  "use strict";

  const STORAGE_KEY = "vibelist-todos-v1";

  const form = document.getElementById("form-add");
  const input = document.getElementById("input-todo");
  const listEl = document.getElementById("list");
  const emptyEl = document.getElementById("empty");
  const btnClear = document.getElementById("btn-clear");
  const chips = document.querySelectorAll(".chip");

  /** @type {{ id: string, text: string, done: boolean }[]} */
  let todos = load();
  let filter = "all";

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (t) =>
          t &&
          typeof t.id === "string" &&
          typeof t.text === "string" &&
          typeof t.done === "boolean"
      );
    } catch {
      return [];
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  function uid() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function visibleTodos() {
    if (filter === "active") return todos.filter((t) => !t.done);
    if (filter === "completed") return todos.filter((t) => t.done);
    return todos;
  }

  function render() {
    const items = visibleTodos();
    listEl.innerHTML = "";

    if (todos.length === 0) {
      emptyEl.hidden = false;
      emptyEl.textContent =
        "Nothing here yet — add your first task above 🔥";
    } else if (items.length === 0) {
      emptyEl.hidden = false;
      if (filter === "active") {
        emptyEl.textContent =
          "All caught up ✨ — or add something new.";
      } else {
        emptyEl.textContent =
          "No completed tasks in this view — try Active or All.";
      }
    } else {
      emptyEl.hidden = true;
    }

    items.forEach((todo) => {
      const li = document.createElement("li");
      li.className = "item" + (todo.done ? " item--done" : "");
      li.dataset.id = todo.id;

      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "toggle";
      toggle.setAttribute(
        "aria-label",
        todo.done ? "Mark as not done" : "Mark as done"
      );
      toggle.setAttribute("aria-pressed", todo.done ? "true" : "false");

      const span = document.createElement("span");
      span.className = "item__text";
      span.textContent = todo.text;

      const del = document.createElement("button");
      del.type = "button";
      del.className = "del";
      del.setAttribute("aria-label", "Delete task");
      del.textContent = "×";

      li.append(toggle, span, del);
      listEl.appendChild(li);
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    todos.push({ id: uid(), text, done: false });
    input.value = "";
    save();
    render();
    input.focus();
  });

  listEl.addEventListener("click", (e) => {
    const target = /** @type {HTMLElement} */ (e.target);
    const li = target.closest(".item");
    if (!li) return;
    const id = li.dataset.id;

    if (target.classList.contains("toggle")) {
      const t = todos.find((x) => x.id === id);
      if (t) {
        t.done = !t.done;
        save();
        render();
      }
      return;
    }

    if (target.classList.contains("del")) {
      todos = todos.filter((x) => x.id !== id);
      save();
      render();
    }
  });

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const next = chip.getAttribute("data-filter");
      if (!next || next === filter) return;
      filter = next;
      chips.forEach((c) => {
        const active = c.getAttribute("data-filter") === filter;
        c.classList.toggle("chip--active", active);
        c.setAttribute("aria-selected", active ? "true" : "false");
      });
      render();
    });
  });

  btnClear.addEventListener("click", () => {
    const before = todos.length;
    todos = todos.filter((t) => !t.done);
    if (todos.length !== before) {
      save();
      render();
    }
  });

  render();
})();
