// Authentication & Token Management
// TOKEN_KEY is defined in constants.js

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function decodePayload(token) {
  try {
    const payloadPart = token.split(".")[1];
    if (!payloadPart) return null;
    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(normalized)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch (_e) {
    return null;
  }
}

function isExpired(token) {
  const payload = decodePayload(token);
  if (!payload || !payload.exp) return true;
  return Date.now() / 1000 >= Number(payload.exp);
}

function showLogin() {
  document.getElementById("loginScreen").classList.remove("hidden");
  document.getElementById("appShell").classList.add("hidden");
}

function showAdmin() {
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("appShell").classList.remove("hidden");
}

function logout(message) {
  localStorage.removeItem(TOKEN_KEY);
  showLogin();
  if (message) {
    setStatus("loginStatus", message, true);
  }
}

function resetAuthForm() {
  document.getElementById("loginEmail").value = "";
  document.getElementById("loginPassword").value = "";
  document.getElementById("loginStatus").textContent = "";
}

async function handleLogin(event) {
  event.preventDefault();

  const supabaseUrl = SUPABASE_URL_DEFAULT;
  const anonKey = SUPABASE_ANON_KEY_DEFAULT;
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!supabaseUrl || !anonKey || !email || !password) {
    setStatus("loginStatus", "All fields are required", true);
    return;
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await response.json().catch(() => ({}));

    const token = data.access_token || data.session?.access_token;

    if (!response.ok || !token) {
      throw new Error(
        data.error_description || data.msg || "Login failed"
      );
    }

    localStorage.setItem(TOKEN_KEY, token);

    showAdmin();
    loadBlogs();
  } catch (err) {
    setStatus("loginStatus", err.message || "Login failed", true);
  }
}
