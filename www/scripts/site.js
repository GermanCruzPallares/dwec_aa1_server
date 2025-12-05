const API_URL = "http://localhost:3000";

class ApiService {
  constructor(url) {
    this.url = url;
  }

  async createSite(siteData) {
    const response = await fetch(`${this.url}/sites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(siteData),
    });
    return await response.json();
  }
}

const api = new ApiService(API_URL);

const urlParams = new URLSearchParams(window.location.search);
const categoryId = Number(urlParams.get("categoryId"));

if (!categoryId) {
  alert("No hay categoría seleccionada. Volviendo...");
  window.location.href = "index.html";
}

const inputName = document.getElementById("input-name");
const inputUrl = document.getElementById("input-url");
const inputUser = document.getElementById("input-user");
const inputPass = document.getElementById("input-password");
const inputDesc = document.getElementById("input-description");

const btnGenerate = document.getElementById("btn-generate");
const btnCancel = document.getElementById("btn-cancel");
const btnSave = document.getElementById("btn-save");
const toggleBtn = document.getElementById("toggle-password");

const inputs = [inputName, inputUrl, inputUser, inputPass];

inputs.forEach((input) => {
  input.addEventListener("blur", () => {
    validateField(input);
  });

  input.addEventListener("input", () => {
    input.style.borderColor = "#ccc";
  });
});

function validateField(input) {
  const value = input.value.trim();
  let isValid = true;

  if (!value) isValid = false;

  if (input.id === "input-url" && value) {
    if (!value.startsWith("http")) isValid = false;
  }

  if (!isValid) {
    input.style.borderColor = "red";
  } else {
    input.style.borderColor = "green";
  }
  return isValid;
}

btnGenerate.addEventListener("click", () => {
  inputPass.value = generateSecurePassword();
  validateField(inputPass);
});

function generateSecurePassword() {
  const length = 12;
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%&*-_=+";

  const allChars = upper + lower + numbers + symbols;
  let pass = "";

  pass += upper[Math.floor(Math.random() * upper.length)];
  pass += lower[Math.floor(Math.random() * lower.length)];
  pass += numbers[Math.floor(Math.random() * numbers.length)];
  pass += symbols[Math.floor(Math.random() * symbols.length)];

  for (let i = 4; i < length; i++) {
    pass += allChars[Math.floor(Math.random() * allChars.length)];
  }

  return pass
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
}

if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    const type = inputPass.type === "password" ? "text" : "password";
    inputPass.type = type;
    toggleBtn.textContent = type === "password" ? "Ver" : "Ocultar";
  });
}

btnCancel.addEventListener("click", () => {
  window.location.href = "index.html";
});

btnSave.addEventListener("click", async () => {
  let allValid = true;
  inputs.forEach((input) => {
    if (!validateField(input)) allValid = false;
  });

  if (!allValid) {
    alert("Por favor, revisa los campos marcados en rojo.");
    return;
  }

  const siteData = {
    name: inputName.value.trim(),
    url: inputUrl.value.trim(),
    user: inputUser.value.trim(),
    password: inputPass.value.trim(),
    description: inputDesc.value.trim(),
    categoryId,
  };

  try {
    await api.createSite(siteData);
    window.location.href = "index.html";
  } catch (err) {
    console.error(err);
    alert("Error al conectar con el servidor");
  }
});
