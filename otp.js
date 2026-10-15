// ===== OTP channel page (otp-channel.html) =====
// Note: this page has no navbar, so it uses its own small script instead of script.js.
// It also needs otp-core.js (loaded first in the HTML) for createOtp().

// 1. Grab the elements we need
const otpForm  = document.getElementById('otp-form');
const otpSend  = document.getElementById('otp-send');
const otpError = document.getElementById('otp-error');
const otpPhone = document.getElementById('otp-phone');

// 2. Show the phone number the driver typed on driver.html
// driver.html saved it in sessionStorage (see the "Driver page only" part of script.js).
let phoneShown = 'your phone number';   // fallback if the page is opened directly
try {
    const saved = JSON.parse(sessionStorage.getItem('boltSignup'));
    if (saved && saved.phone) {
        // 8012345678  ->  +234 801 234 5678
        const p = saved.phone;
        phoneShown = '+234 ' + p.slice(0, 3) + ' ' + p.slice(3, 6) + ' ' + p.slice(6);
    }
} catch (e) {}
otpPhone.textContent = phoneShown;

// 3. Only show the channels listed in the URL, e.g. ?channels=whatsapp,sms
// (if the URL doesn't say, show both)
const params  = new URLSearchParams(window.location.search);
const allowed = (params.get('channels') || 'whatsapp,sms').split(',');

document.querySelectorAll('.otp-option').forEach(option => {
    const value = option.querySelector('input').value;
    if (!allowed.includes(value)) {
        option.style.display = 'none';
    }
});

// 4. Clear the error message as soon as the driver picks something
otpForm.addEventListener('change', () => {
    otpError.textContent = '';
});

// 5. When "Send code" is pressed
otpForm.addEventListener('submit', async e => {
    e.preventDefault();   // stop the page from reloading

    const chosen = otpForm.querySelector('input[name="channel"]:checked');

    // Nothing picked yet: tell the driver what to do
    if (!chosen) {
        otpError.textContent = 'Choose WhatsApp or SMS to continue.';
        return;
    }
    const channel = chosen.value;   // "whatsapp" or "sms"

    // Loading state: disable the button so it can't be clicked twice
    otpSend.disabled = true;
    otpSend.textContent = 'Sending code…';

    try {
        await sendCode(channel);

        // Success: go to the page where the driver types the code
        window.location.href = 'enter-code.html';

    } catch (err) {
        // Failure: explain what happened and let the driver try again
        otpError.textContent = "We couldn't send the code. Check your connection and try again.";
        otpSend.disabled = false;
        otpSend.textContent = 'Send code';
    }
});

// 6. The function that makes the code and "sends" it.
// For now it waits one second to imitate a server, then makes the code in the browser.
// With a backend you would ask the server to make and send it instead:
//   const response = await fetch('/api/send-otp', { method: 'POST', ... });
async function sendCode(channel) {
    await new Promise(resolve => setTimeout(resolve, 1000));   // fake wait
    createOtp(channel);                                        // from otp-core.js
}