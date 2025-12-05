const API_URL = "http://localhost:3000";

class ApiService {
  constructor(url) {
    this.url = url;
  }

  async getCategories() {
    const response = await fetch(`${this.url}/categories`);
    return await response.json();
  }

  async createCategory(name) {
    const response = await fetch(`${this.url}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    return await response.json();
  }

  async deleteCategory(id) {
    await fetch(`${this.url}/categories/${id}`, { method: "DELETE" });
  }

  async getSites() {
    const response = await fetch(`${this.url}/sites`);
    return await response.json();
  }

  async deleteSite(id) {
    await fetch(`${this.url}/sites/${id}`, { method: "DELETE" });
  }
}

const api = new ApiService(API_URL);

const categoriesList = document.getElementById("categories-list");
const sitesBody = document.getElementById("sites-body");

let localCategories = [];
let localSites = [];
let currentCategoryId = null;

const searchInput = createSearchInput();

function createSearchInput() {
  const input = document.createElement("input");
  input.id = "search-input";
  input.placeholder = "Buscar...";
  input.style.padding = "6px";
  input.style.marginLeft = "15px";
  input.style.borderRadius = "4px";
  input.style.border = "1px solid #ccc";

  const topbar = document.querySelector(".topbar");
  if (topbar) topbar.appendChild(input);
  return input;
}

searchInput.addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();

  const items = document.querySelectorAll("#categories-list li");
  items.forEach((li) => {
    const name = li.querySelector(".category-name").textContent.toLowerCase();
    li.style.display = name.includes(term) ? "flex" : "none";
  });

  if (currentCategoryId) {
    const filtered = localSites.filter(
      (site) =>
        site.categoryId === currentCategoryId &&
        (site.name.toLowerCase().includes(term) ||
          site.user.toLowerCase().includes(term))
    );
    renderSites(filtered);
  }
});


async function loadCategories() {
  try {
    
    const data = await api.getCategories();
    localCategories = data; 
    console.log("Categorías recibidas:", data);

    categoriesList.innerHTML = "";

    data.forEach((cat) => {
      const li = document.createElement("li");
      li.dataset.id = cat.id;

      li.innerHTML = `
        <span class="category-name">${cat.name}</span>
        <button class="action-btn delete-category-btn" data-category-id="${cat.id}">Borrar</button>
      `;

      li.addEventListener("click", () => {
        document
          .querySelectorAll(".categories-box li")
          .forEach((item) => item.classList.remove("active"));

        li.classList.add("active");
        currentCategoryId = cat.id;

        searchInput.value = "";
        loadSites(cat.id);
      });

      const deleteButton = li.querySelector(".delete-category-btn");
      deleteButton.addEventListener("click", (event) => {
        event.stopPropagation();
        deleteCategory(cat.id);
      });

      categoriesList.appendChild(li);
    });

    if (data.length > 0) {
      const firstLi = categoriesList.querySelector("li");
      if (firstLi) {
        firstLi.classList.add("active");
        firstLi.click();
      }
    }
  } catch (error) {
    console.error("Error cargando categorías:", error);
  }
}

async function loadSites(categoryId) {
  try {
    console.log("Cargando sites para categoryId:", categoryId);

    const allSites = await api.getSites();
    localSites = allSites;

    const sites = allSites.filter(
      (site) => site.categoryId === Number(categoryId)
    );

    renderSites(sites);
  } catch (error) {
    console.error("Error cargando sites:", error);
  }
}

function renderSites(sites) {
  sitesBody.innerHTML = "";

  if (sites.length === 0) {
    const tr = document.createElement("tr");
    tr.classList.add("empty-row");
    tr.innerHTML = `<td colspan="5" style="text-align:center">No hay sites para esta categoría.</td>`;
    sitesBody.appendChild(tr);
    return;
  }

  sites.forEach((site) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td>${site.name}</td>
        <td>${site.user}</td>
        <td>
          <div class="password-container">
             <input type="password" value="${
               site.password
             }" readonly class="password-field">
             <button class="toggle-pass-btn" onclick="toggleTablePassword(this)">Ver</button>
          </div>
        </td>
        <td>${new Date(site.createdAt || Date.now()).toLocaleDateString()}</td>
        <td>
          <button class="action-btn open" onclick="window.open('${
            site.url
          }', '_blank')">Ir</button>
          <button class="action-btn edit">Editar</button>
          <button class="action-btn delete" onclick="deleteSite(${
            site.id
          })">Borrar</button>
        </td>
      `;

    sitesBody.appendChild(tr);
  });
}

window.toggleTablePassword = function (button) {
  const input = button.previousElementSibling;
  const isPass = input.type === "password";
  input.type = isPass ? "text" : "password";
  button.textContent = isPass ? "Ocultar" : "Ver";
};

async function deleteSite(siteId) {
  if (!confirm("¿Eliminar sitio?")) return;
  try {
    await api.deleteSite(siteId);

    if (currentCategoryId) loadSites(currentCategoryId);
  } catch (error) {
    console.error("Error al eliminar site:", error);
    alert("Ocurrió un error al intentar eliminar el site.");
  }
}

async function deleteCategory(categoryId) {
  if (!confirm("¿Eliminar categoría y contenido?")) return;
  try {
    await api.deleteCategory(categoryId);
    console.log(`Categoría con ID ${categoryId} eliminada con éxito.`);
    loadCategories();
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    alert("Ocurrió un error de red al intentar eliminar la categoría.");
  }
}

const overlay = document.getElementById("popup-overlay");
const inputCategory = document.getElementById("new-category-name");
const btnAddCategory = document.getElementById("btn-add-category");
const btnCancelCategory = document.getElementById("btn-cancel-category");
const btnOkCategory = document.getElementById("btn-ok-category");

btnAddCategory.addEventListener("click", () => {
  overlay.classList.remove("hidden");
  inputCategory.value = "";
  inputCategory.focus();
});

btnCancelCategory.addEventListener("click", () => {
  overlay.classList.add("hidden");
});

btnOkCategory.addEventListener("click", async () => {
  const name = inputCategory.value.trim();

  if (!name) {
    alert("El nombre es obligatorio");
    return;
  }

  try {
    await api.createCategory(name);
    overlay.classList.add("hidden");
    loadCategories();
  } catch (error) {
    console.error("Error al añadir categoría:", error);
  }
});

const btnAddSite = document.getElementById("btn-add-site");

btnAddSite.addEventListener("click", () => {
  const active = document.querySelector(".categories-box li.active");

  if (!active) {
    alert("Selecciona una categoría primero");
    return;
  }

  window.location.href = `site.html?categoryId=${active.dataset.id}`;
});

loadCategories();
