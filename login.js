// ===== Login page (login.html) =====
// Like otp-channel.html, this page has no navbar, so it has its own small script.
//
// HOW IT WORKS (demo, no backend):
// driver.html saves every registered account in localStorage under "boltAccounts".
// Here we look for an account that matches what the driver typed.
// With a real backend, this check would happen on the server instead.

const loginForm  = document.getElementById('login-form');
const loginId    = document.getElementById('login-id');
const loginError = document.getElementById('login-error');
const loginBox   = document.getElementById('login-box');
const welcomeBox = document.getElementById('welcome-box');
const welcomeTxt = document.getElementById('welcome-text');
const logoutBtn  = document.getElementById('logout-btn');

// ---- helpers ----

// get the list of registered accounts (an empty list if there are none yet)
function getAccounts() {
    try {
        return JSON.parse(localStorage.getItem('boltAccounts')) || [];
    } catch (e) {
        return [];
    }
}

// turn what the driver typed into just the 10 phone digits
// (same rules as the sign-up form: drop "234" or a leading 0)
function cleanPhone(text) {
    let digits = text.replace(/\D/g, '');
    if (digits.startsWith('234')) digits = digits.slice(3);
    if (digits.startsWith('0')) digits = digits.slice(1);
    return digits;
}

// find the account that matches an email or a phone number (or undefined)
function findAccount(typed) {
    const text = typed.trim();
    const accounts = getAccounts();

    if (text.includes('@')) {
        // it looks like an email: compare in lowercase
        return accounts.find(a => a.email === text.toLowerCase());
    }
    // otherwise treat it as a phone number
    return accounts.find(a => a.phone === cleanPhone(text));
}

// swap the login form for the "Welcome back" box
function showWelcome(account) {
    welcomeTxt.textContent = 'You are logged in as ' + account.email + ' (' + account.city + ').';
    loginBox.hidden = true;
    welcomeBox.hidden = false;
    // LATER: when you build the driver dashboard, replace the 3 lines above with
    //        window.location.href = 'dashboard.html';
}

// ---- already logged in? (the session survives a page refresh) ----
try {
    const session = JSON.parse(localStorage.getItem('boltSession'));
    const account = session && getAccounts().find(a => a.email === session.email);
    if (account) showWelcome(account);
} catch (e) {}

// ---- clear the error as soon as the driver starts typing again ----
loginId.addEventListener('input', () => {
    loginError.textContent = '';
    loginId.classList.remove('invalid');
});

// ---- when "Log in" is pressed ----
loginForm.addEventListener('submit', e => {
    e.preventDefault();   // stop the page from reloading

    // 1. empty box
    if (loginId.value.trim() === '') {
        loginError.textContent = 'Enter your email or phone number.';
        loginId.classList.add('invalid');
        return;
    }

    // 2. look for a matching registered account
    const account = findAccount(loginId.value);

    if (!account) {
        loginError.textContent = "We couldn't find an account with those details. Check them or register as a driver.";
        loginId.classList.add('invalid');
        return;
    }

    // 3. success: remember who is logged in, then show the welcome box
    try {
        localStorage.setItem('boltSession', JSON.stringify({ email: account.email }));
    } catch (err) {}
    showWelcome(account);
});

// ---- log out ----
logoutBtn.addEventListener('click', () => {
    try { localStorage.removeItem('boltSession'); } catch (err) {}
    loginId.value = '';
    welcomeBox.hidden = true;
    loginBox.hidden = false;
});
