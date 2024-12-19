class TodoItem extends HTMLElement {
  constructor() {
    super();

    // Attach shadow DOM
    this.attachShadow({ mode: "open" });

    // Link external stylesheet
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "./styles.css";

    // Define structure
    const template = document.createElement("div");
    template.className = "todo-item";
    template.innerHTML = `
          <span class="text"><slot></slot></span>
          <button class="delete-btn">Delete</button>
        `;

    // Append to shadow DOM
    this.shadowRoot.appendChild(link);
    this.shadowRoot.appendChild(template);

    // Set up event listeners
    this.setupDeleteListener();
    this.setupEditListener();
  }

  setupDeleteListener() {
    this.shadowRoot
      .querySelector(".delete-btn")
      .addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("delete", { bubbles: true }));
      });
  }

  setupEditListener() {
    const textSpan = this.shadowRoot.querySelector(".text");

    textSpan.addEventListener("dblclick", () => {
      // Prevent editing if already in edit mode
      if (this.shadowRoot.querySelector("input")) return;

      // Enter edit mode
      const input = document.createElement("input");
      input.type = "text";
      input.value = this.textContent;
      input.className = "edit-input";

      textSpan.replaceWith(input);
      input.focus();

      // Notify start of editing
      this.dispatchEvent(new CustomEvent("start-edit", { bubbles: true }));

      // Save changes on Enter
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.saveEdit(input);
        }
      });

      // Cancel on Escape
      input.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.cancelEdit(input, textSpan);
        }
      });

      // Save on blur
      input.addEventListener("blur", () => {
        this.saveEdit(input);
      });
    });
  }

  saveEdit(input) {
    this.textContent = input.value.trim();
    input.replaceWith(this.createTextSpan(this.textContent));
    this.dispatchEvent(new CustomEvent("end-edit", { bubbles: true }));
  }

  cancelEdit(input, originalSpan) {
    input.replaceWith(originalSpan);
    this.dispatchEvent(new CustomEvent("end-edit", { bubbles: true }));
  }

  createTextSpan(text) {
    const span = document.createElement("span");
    span.textContent = text;
    span.className = "text";
    this.setupEditListener(); // Reattach listener
    return span;
  }
}

customElements.define("todo-item", TodoItem);
