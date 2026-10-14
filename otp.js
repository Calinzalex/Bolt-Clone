// ===== OTP channel page (otp-channel.html) =====
// Note: this page has no navbar, so it uses its own small script instead of script.js.

// 1. Grab the elements we need
const otpForm   = document.getElementById('otp-form');
const otpSend   = document.getElementById('otp-send');
const otpError  = document.getElementById('otp-error');
const otpPhone  = document.getElementById('otp-phone');
const chooseBox = document.getElementById('otp-choose');
const doneBox   = document.getElementById('otp-done');
const doneText  = document.getElementById('otp-done-text');

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

        // Success: swap the "choose" box for the "code sent" box.
        // LATER: when you build the "enter code" page, replace these lines with
        //        window.location.href = 'enter-code.html?channel=' + channel;
        const name = channel === 'whatsapp' ? 'WhatsApp' : 'SMS';
        doneText.textContent = 'We sent a 6-digit code by ' + name + ' to ' + phoneShown + '.';
        chooseBox.hidden = true;
        doneBox.hidden = false;

    } catch (err) {
        // Failure: explain what happened and let the driver try again
        otpError.textContent = "We couldn't send the code. Check your connection and try again.";
        otpSend.disabled = false;
        otpSend.textContent = 'Send code';
    }
});

// 6. The function that actually asks the server to send the code.
// For now it only waits one second to imitate a server. When you have a backend,
// delete the fake wait and use the fetch() block below it.
async function sendCode(channel) {
    await new Promise(resolve => setTimeout(resolve, 1000));   // fake wait

    /* REAL VERSION (needs a backend):
    const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: channel })
    });
    if (!response.ok) throw new Error('Request failed');
    */
}
