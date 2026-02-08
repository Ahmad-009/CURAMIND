// assets/app.js

// ----- Storage helpers -----
const AMQA_KEYS = {
    ROLE: 'amqa_role',
    CONTEXT: 'amqa_context',
    QUERY: 'amqa_query',
    AUDIT: 'amqa_audit'
};

function saveLS(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { }
}
function loadLS(key, fallback = null) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
}
function setRole(role) { try { localStorage.setItem(AMQA_KEYS.ROLE, role); } catch (e) { } }
function getRole() { try { return localStorage.getItem(AMQA_KEYS.ROLE) || 'unknown'; } catch (e) { return 'unknown'; } }

// ----- Simple Router (relative paths) -----
const ROUTES = {
    signin: 'SignIn.html',
    context: 'PatientContext.html',
    qa: 'QAConsole.html',
    answer: 'AnswerEvidence.html',
    sources: 'SourcesBrowser.html',
    history: 'HistoryAudit.html'
};
function go(page) { window.location.href = ROUTES[page]; }

// ----- Guards (optional, enable per page) -----
// Call these at page-load if you want to enforce flow.
function requireRole() {
    const r = getRole();
    if (!r || r === 'unknown') go('signin');
}
function requireContext() {
    if (!loadLS(AMQA_KEYS.CONTEXT)) go('context');
}
function requireQuery() {
    if (!loadLS(AMQA_KEYS.QUERY)) go('qa');
}

// ----- Audit log -----
function appendAuditRow({ question, snapshot = 'RS-local', version = 'v0.1' }) {
    const rows = loadLS(AMQA_KEYS.AUDIT, []);
    rows.unshift({
        time: new Date().toLocaleString(),
        role: getRole(),
        question: question || '—',
        snapshot,
        version
    });
    saveLS(AMQA_KEYS.AUDIT, rows);
}

// ----- Page helpers -----
// call as: wireTopNav('qa') to highlight current page if you later add a nav bar
function wireTopNav(active) { /* placeholder for future nav */ }

// Expose globally
window.AMQA = {
    AMQA_KEYS, saveLS, loadLS, setRole, getRole,
    go, requireRole, requireContext, requireQuery,
    appendAuditRow
};