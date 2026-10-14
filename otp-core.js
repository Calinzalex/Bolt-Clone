// ===== OTP core: makes and checks the confirmation code =====
// Used by otp-channel.html (first code) and enter-code.html (resend + checking).
//
// DEMO ONLY: the code is made and checked inside the browser, so nothing is really
// sent by WhatsApp or SMS. A real site makes and checks the code on a SERVER and
// sends it with a provider (for example Termii or Twilio).

const OTP_LENGTH      = 6;                // digits in the code
const OTP_LIFETIME_MS = 5 * 60 * 1000;    // a code works for 5 minutes
const OTP_MAX_TRIES   = 5;                // wrong guesses allowed per code

// make a new random code and remember it for this browser tab
function createOtp(channel) {
    // crypto gives properly random numbers (better than Math.random for codes)
    const random = crypto.getRandomValues(new Uint32Array(1))[0] % 1000000;

    const otp = {
        code: String(random).padStart(OTP_LENGTH, '0'),   // 42 becomes "000042"
        channel: channel,                                 // "whatsapp" or "sms"
        expires: Date.now() + OTP_LIFETIME_MS,            // time when it stops working
        tries: 0                                          // wrong guesses so far
    };
    sessionStorage.setItem('boltOtp', JSON.stringify(otp));
    return otp;
}

// read the saved code back (null if there isn't one)
function getOtp() {
    try {
        return JSON.parse(sessionStorage.getItem('boltOtp'));
    } catch (e) {
        return null;
    }
}

// compare what the driver typed with the saved code
// returns one of: "ok", "wrong", "expired", "locked", "missing"
function checkOtp(typed) {
    const otp = getOtp();

    if (!otp) return 'missing';                          // no code was requested
    if (Date.now() > otp.expires) return 'expired';      // too late
    if (otp.tries >= OTP_MAX_TRIES) return 'locked';     // too many wrong guesses

    if (typed === otp.code) {
        sessionStorage.removeItem('boltOtp');            // a code can only be used once
        return 'ok';
    }

    // wrong code: count the try and save it
    otp.tries++;
    sessionStorage.setItem('boltOtp', JSON.stringify(otp));
    return otp.tries >= OTP_MAX_TRIES ? 'locked' : 'wrong';
}
