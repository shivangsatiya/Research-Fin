// ============================================================
//  ResearchFin — Frontend API Integration (api.js)
//  Add this file to your project and include it in HTML BEFORE
//  Research Fin.js:  <script src="api.js"></script>
// ============================================================

const API_BASE = 'http://localhost:3000/api';

// ---- Helper: get saved token ----
function getToken() {
  return localStorage.getItem('rf_token');
}

// ---- Helper: make authenticated API call ----
async function apiCall(method, endpoint, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'authorization': getToken() || ''
    }
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(API_BASE + endpoint, options);
  return res.json();
}

// ============================================================
//  AUTH: Register
// ============================================================
async function apiRegister(name, regId, dept, role, password) {
  return apiCall('POST', '/register', { name, regId, dept, role, password });
}

// ============================================================
//  AUTH: Login
// ============================================================
async function apiLogin(regId, password) {
  const data = await apiCall('POST', '/login', { regId, password });
  if (data.token) {
    localStorage.setItem('rf_token', data.token);
    localStorage.setItem('rf_user', JSON.stringify(data.user));
  }
  return data;
}

// ============================================================
//  AUTH: Logout
// ============================================================
function apiLogout() {
  localStorage.removeItem('rf_token');
  localStorage.removeItem('rf_user');
}

// ============================================================
//  BUDGET: Save to server
// ============================================================
async function apiSaveBudget(items) {
  return apiCall('POST', '/budget', { items });
}

// ============================================================
//  BUDGET: Load from server
// ============================================================
async function apiLoadBudget() {
  return apiCall('GET', '/budget');
}

// ============================================================
//  ASSESSMENT: Save result
// ============================================================
async function apiSaveAssessment(score, level, answers) {
  return apiCall('POST', '/assessment', { score, level, answers });
}

// ============================================================
//  ASSESSMENT: Load result
// ============================================================
async function apiLoadAssessment() {
  return apiCall('GET', '/assessment');
}

// ============================================================
//  HOW TO USE IN YOUR EXISTING CODE:
//
//  1. In doLogin() — after form validation, call:
//     const result = await apiLogin(id, 'demo123');
//     if (result.error) { show error }
//     else { proceed to show app }
//
//  2. In addBudget() — after pushing to budgetItems array, call:
//     await apiSaveBudget(budgetItems);
//
//  3. In showResult() — after calculating quiz score, call:
//     await apiSaveAssessment(score, lvl, answers);
//
//  4. In doLogout() — call:
//     apiLogout();
// ============================================================
