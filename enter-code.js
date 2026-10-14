// ===== Enter-code page (enter-code.html) =====
// Needs otp-core.js (loaded first in the HTML) for getOtp(), createOtp(), checkOtp().

// Set to false when a real server sends the code, so the code is no longer shown on screen.
const DEMO_MODE = true;

const RESEND_SECONDS = 30;   // how long the driver waits before asking for a new code

// ---- 1. Grab the elements we need ----
const codeForm   = document.getElementById('code-form');
const boxes      = Array.from(document.querySelectorAll('.code-box'));
const codeError  = document.getElementById('code-error');
const resendBtn  = document.getElementById('resend-btn');
const resendTime = document.getElementById('resend-timer');
const codeBox    = document.getElementById('code-box');
const successBox = document.getElementById('success-box');

// ---- 2. Check the driver really started a registration ----
let signup = null;
try { signup = JSON.parse(sessionStorage.getItem('boltSignup')); } catch (e) {}

if (!signup || !getOtp()) {
    // nothing to confirm (page opened directly): go back to the sign-up form
    window.location.replace('driver.html#signup');
}

// ---- 3. Fill in the text on the page ----
function showDetails() {
    const otp = getOtp();
    if (!otp || !signup) return;

    const p = signup.phone;   // 8012345678  ->  +234 801 234 5678
    document.getElementById('code-phone').textContent =
        '+234 ' + p.slice(0, 3) + ' ' + p.slice(3, 6) + ' ' + p.slice(6);
    document.getElementById('code-channel').textContent =
        otp.channel === 'whatsapp' ? 'WhatsApp' : 'SMS';

    // demo only: show the code on screen because nothing is really sent
    if (DEMO_MODE) {
        document.getElementById('demo-code').textContent = otp.code;
        document.getElementById('demo-note').hidden = false;
    }
}
showDetails();

// ---- 4. The six digit boxes ----
function clearBoxes() {
    boxes.forEach(b => { b.value = ''; b.classList.remove('invalid'); });
    boxes[0].focus();
}

function getTypedCode() {
    return boxes.map(b => b.value).join('');   // "1","2","3"... becomes "123..."
}

boxes.forEach((box, i) => {
    // when a digit is typed: keep digits only, then jump to the next box
    box.addEventListener('input', () => {
        box.value = box.value.replace(/\D/g, '');
        codeError.textContent = '';
        boxes.forEach(b => b.classList.remove('invalid'));

        if (box.value && i < boxes.length - 1) {
            boxes[i + 1].focus();
        }
    });

    // Backspace on an empty box: go back one box
    box.addEventListener('keydown', e => {
        if (e.key === 'Backspace' && !box.value && i > 0) {
            boxes[i - 1].focus();
        }
    });

    // pasting a whole code (e.g. "123456") spreads it over the boxes
    box.addEventListener('paste', e => {
        e.preventDefault();
        const digits = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, boxes.length);
        digits.split('').forEach((d, n) => { boxes[n].value = d; });
        boxes[Math.min(digits.length, boxes.length - 1)].focus();
    });
});

boxes[0].focus();

// ---- 5. Confirm button ----
codeForm.addEventListener('submit', e => {
    e.preventDefault();

    const typed = getTypedCode();
    if (typed.length < OTP_LENGTH) {
        codeError.textContent = 'Enter all 6 digits of the code.';
        return;
    }

    const result = checkOtp(typed);   // "ok", "wrong", "expired", "locked" or "missing"

    if (result === 'ok') {
        confirmRegistration();
        return;
    }

    // show the right message for each problem
    const messages = {
        wrong:   'That code is not correct. Try again.',
        expired: 'This code has expired. Request a new one.',
        locked:  'Too many wrong tries. Request a new code.',
        missing: 'No code found. Request a new one.'
    };
    codeError.textContent = messages[result];
    boxes.forEach(b => b.classList.add('invalid'));

    if (result === 'wrong') {
        boxes[boxes.length - 1].focus();
        boxes[boxes.length - 1].select();
    } else {
        // the old code can't be used any more, so allow a new one straight away
        stopTimer();
        resendBtn.disabled = false;
    }
});

// ---- 6. The code was right: the account is now registered ----
function confirmRegistration() {
    // Save the account in the list that login.html searches.
    // (demo only: with a real backend the server would create the account)
    try {
        const accounts = JSON.parse(localStorage.getItem('boltAccounts')) || [];
        const email = signup.email.trim().toLowerCase();
        const others = accounts.filter(a => a.email !== email);   // replace an older account with the same email
        others.push({ email: email, phone: signup.phone, city: signup.city });
        localStorage.setItem('boltAccounts', JSON.stringify(others));
    } catch (err) {}

    // the sign-up details are no longer needed
    sessionStorage.removeItem('boltSignup');

    document.getElementById('success-text').textContent =
        'Your driver account for ' + signup.email + ' is ready. Log in to continue.';
    codeBox.hidden = true;
    successBox.hidden = false;
}

// ---- 7. Resend with a countdown ----
let timerId = null;

function stopTimer() {
    clearInterval(timerId);
    resendTime.textContent = '';
}

function startTimer() {
    let left = RESEND_SECONDS;
    resendBtn.disabled = true;
    resendTime.textContent = 'in ' + left + 's';

    clearInterval(timerId);
    timerId = setInterval(() => {
        left--;
        if (left <= 0) {
            stopTimer();
            resendBtn.disabled = false;
        } else {
            resendTime.textContent = 'in ' + left + 's';
        }
    }, 1000);
}

resendBtn.addEventListener('click', () => {
    const old = getOtp();
    createOtp(old ? old.channel : 'sms');   // a fresh code replaces the old one
    showDetails();
    clearBoxes();
    codeError.textContent = '';
    startTimer();
});

startTimer();   // the first "Resend" is available after 30 seconds
