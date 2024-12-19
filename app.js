import "./components/todo-item.js";
import Router from "./components/router.js";

const state = {
  todos: [],
  filter: "all", // Keep track of the current filter ('all', 'completed', 'pending')
  search: "", // Current search term
};

// Save todos to localStorage
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(state.todos));
}

// Load todos from localStorage
function loadTodos() {
  const savedTodos = localStorage.getItem("todos");
  if (savedTodos) {
    state.todos = JSON.parse(savedTodos);
    renderTodos();
  }
}

// Save dark mode preference to localStorage
function saveDarkModePreference(isDarkMode) {
  localStorage.setItem("darkMode", isDarkMode);
}

// Load dark mode preference from localStorage
function loadDarkModePreference() {
  const darkMode = localStorage.getItem("darkMode") === "true";
  if (darkMode) {
    document.body.classList.add("dark-mode");
  }
}

// Render todos based on the current filter and search term
function renderTodos() {
  const app = document.getElementById("app");
  app.innerHTML = ""; // Clear the container

  const filteredTodos = state.todos.filter((todo) => {
    const matchesFilter =
      state.filter === "all" ||
      (state.filter === "completed" && todo.completed) ||
      (state.filter === "pending" && !todo.completed);
    const matchesSearch = todo.text
      .toLowerCase()
      .includes(state.search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  filteredTodos.forEach((todo, index) => {
    const item = document.createElement("todo-item");
    item.textContent = todo.text;

    // Mark completed todos visually
    if (todo.completed) {
      item.style.textDecoration = "line-through";
      item.style.color = "#757575";
    }

    item.addEventListener("delete", () => {
      state.todos.splice(index, 1);
      renderTodos();
    });

    item.addEventListener("click", () => {
      state.todos[index].completed = !state.todos[index].completed;
      renderTodos();
    });

    app.appendChild(item);
  });

  // Save todos whenever the list is updated
  saveTodos();
}

// Set up the dark mode toggle
function setupDarkModeToggle() {
  const darkModeToggle = document.getElementById("darkModeToggle");

  darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    saveDarkModePreference(document.body.classList.contains("dark-mode"));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const appContainer = document.getElementById("app");

  // Input for new todos
  const newTodoInput = document.getElementById("newTodo");
  newTodoInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && e.target.value) {
      state.todos.push({ text: e.target.value, completed: false }); // Add new todo
      e.target.value = ""; // Clear input field
      renderTodos();
    }
  });

  // Input for search
  const searchTodoInput = document.getElementById("searchTodo");
  searchTodoInput.addEventListener("input", (e) => {
    state.search = e.target.value;
    renderTodos();
  });

  // Load todos and dark mode preference
  loadTodos();
  loadDarkModePreference();

  // Render todos initially
  renderTodos();

  // Set up dark mode toggle
  setupDarkModeToggle();

  // Initialize Router
  const router = new Router({
    "#/": () => {
      state.filter = "all";
      renderTodos();
    },
    "#/completed": () => {
      state.filter = "completed";
      renderTodos();
    },
    "#/pending": () => {
      state.filter = "pending";
      renderTodos();
    },
  });
});
