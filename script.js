// ===== Shared across all pages =====

// region picker: filter the list while typing
const search = document.getElementById('region-search');
if (search) {
    search.addEventListener('input', () => {
        const q = search.value.trim().toLowerCase();
        document.querySelectorAll('.region').forEach(li => {
            li.style.display = li.textContent.toLowerCase().includes(q) ? '' : 'none';
        });
    });
}

// register dropdown: close when clicking anywhere outside it
document.addEventListener('click', e => {
    if (!e.target.closest('.register-wrap')) {
        document.getElementById('register-toggle').checked = false;
    }
});

// menu panel: close on outside click or when a link inside it is tapped
const menuToggle = document.getElementById('menu-toggle');
document.addEventListener('click', e => {
    const insideMenu = e.target.closest('.menu-panel, .menu, #menu-toggle');
    if (!insideMenu || e.target.closest('.menu-panel a')) {
        menuToggle.checked = false;
    }
});

// Esc closes the popups
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        document.getElementById('lang-toggle').checked = false;
        document.getElementById('menu-toggle').checked = false;
        document.getElementById('register-toggle').checked = false;
    }
});


// ===== Home page only (index.html) =====

// services carousel: arrow buttons scroll the row one card at a time
const row = document.querySelector('.images');
if (row) {
    const prev = document.getElementById('prev');
    const next = document.getElementById('next');

    const step = () => row.querySelector('.card').offsetWidth + 20;

    prev.addEventListener('click', () => row.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => row.scrollBy({ left: step(), behavior: 'smooth' }));

    function updateArrows() {
        prev.disabled = row.scrollLeft <= 5;
        next.disabled = row.scrollLeft + row.clientWidth >= row.scrollWidth - 5;
    }
    row.addEventListener('scroll', updateArrows);
    window.addEventListener('resize', updateArrows);
    updateArrows();
}

// download tabs: swap the text, button and image
const tabs = document.querySelectorAll('.tab');
if (tabs.length) {
    const tabContent = {
        rides: {
            title: 'The fast, affordable way to ride.',
            sub: 'Available for iOS and Android devices.',
            btn: 'Get Bolt',
            img: 'media/image15.png'
        },
        delivery: {
            title: 'Food and groceries, delivered fast.',
            sub: 'Available for iOS and Android devices.',
            btn: 'Get Bolt Food',
            img: 'media/image15.png'   // swap for a delivery image if you have one
        }
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const c = tabContent[tab.dataset.tab];
            tabs.forEach(t => t.classList.toggle('active', t === tab));
            document.getElementById('dl-title').textContent = c.title;
            document.getElementById('dl-sub').textContent = c.sub;
            document.getElementById('dl-btn').textContent = c.btn;
            document.getElementById('dl-img').src = c.img;
        });
    });
}


// ===== Support page only (support.html) =====

// search: filter the article links in the category cards as you type
const supportSearch = document.getElementById('support-search');
if (supportSearch) {
    const cats = document.querySelectorAll('.s-cat');
    const empty = document.getElementById('support-empty');

    supportSearch.addEventListener('input', () => {
        const q = supportSearch.value.trim().toLowerCase();
        let shown = 0;

        cats.forEach(cat => {
            const links = cat.querySelectorAll('li');
            let matches = 0;
            links.forEach(li => {
                const hit = !q || li.textContent.toLowerCase().includes(q);
                li.style.display = hit ? '' : 'none';
                if (hit) matches++;
            });

            // cards without article links (Privacy) match on their title instead
            const titleHit = cat.querySelector('h2').textContent.toLowerCase().includes(q);
            const visible = !q || matches > 0 || titleHit;
            cat.style.display = visible ? '' : 'none';
            if (titleHit && q) links.forEach(li => (li.style.display = ''));
            if (visible) shown++;
        });

        empty.hidden = shown > 0;
    });
}


// ===== Region / language picker (all pages) =====
// Builds the full country list, and when a country + language is picked it updates
// the navbar flag and code, moves that country to the top, and remembers it on every page.
(function () {
    const list = document.querySelector('.region-list');
    const navFlag = document.querySelector('.language .flag');
    const navLabel = document.querySelector('.language > span');
    if (!list || !navFlag || !navLabel) return;

    // [flag code, English name, local name, languages]
    // (same name twice = no small English label above it)
    const COUNTRIES = [
        ['ng', 'Nigeria', 'Nigeria', ['English']],
        ['global', 'Global', 'Global', ['English']],
        ['ao', 'Angola', 'Angola', ['Português', 'English']],
        ['au', 'Australia', 'Australia', ['English']],
        ['at', 'Austria', 'Österreich', ['Deutsch', 'English']],
        ['az', 'Azerbaijan', 'Azərbaycan', ['Azərbaycanca', 'English', 'Русский']],
        ['be', 'Belgium', 'België', ['Nederlands', 'Français', 'English']],
        ['cm', 'Cameroon', 'Cameroon', ['Français', 'English']],
        ['ca', 'Canada', 'Canada', ['English', 'Français']],
        ['ci', "Côte d'Ivoire", "Côte d'Ivoire", ['Français', 'English']],
        ['hr', 'Croatia', 'Hrvatska', ['Hrvatski', 'English']],
        ['cy', 'Cyprus', 'Κύπρος', ['Ελληνικά', 'English']],
        ['cz', 'Czechia', 'Česko', ['Čeština', 'English']],
        ['dk', 'Denmark', 'Danmark', ['Dansk', 'English']],
        ['cd', 'DR Congo', 'RD Congo', ['Français', 'English']],
        ['eg', 'Egypt', 'مصر', ['العربية', 'English']],
        ['ee', 'Estonia', 'Eesti', ['Eesti', 'English', 'Русский']],
        ['fi', 'Finland', 'Suomi', ['Suomi', 'English', 'Svenska']],
        ['fr', 'France', 'France', ['Français', 'English']],
        ['ge', 'Georgia', 'საქართველო', ['ქართული', 'English']],
        ['de', 'Germany', 'Deutschland', ['Deutsch', 'English']],
        ['gh', 'Ghana', 'Ghana', ['English']],
        ['gr', 'Greece', 'Ελλάδα', ['Ελληνικά', 'English']],
        ['hu', 'Hungary', 'Magyarország', ['Magyar', 'English']],
        ['ie', 'Ireland', 'Ireland', ['English']],
        ['it', 'Italy', 'Italia', ['Italiano', 'English']],
        ['kz', 'Kazakhstan', 'Қазақстан', ['Қазақша', 'English', 'Русский']],
        ['ke', 'Kenya', 'Kenya', ['English']],
        ['lv', 'Latvia', 'Latvija', ['Latviešu', 'English', 'Русский']],
        ['lt', 'Lithuania', 'Lietuva', ['Lietuvių', 'English']],
        ['my', 'Malaysia', 'Malaysia', ['English']],
        ['mt', 'Malta', 'Malta', ['English']],
        ['md', 'Moldova', 'Moldova', ['Română', 'English', 'Русский']],
        ['ma', 'Morocco', 'المغرب', ['العربية', 'Français', 'English']],
        ['nl', 'Netherlands', 'Nederland', ['Nederlands', 'English']],
        ['nz', 'New Zealand', 'New Zealand', ['English']],
        ['no', 'Norway', 'Norge', ['Norsk', 'English']],
        ['pl', 'Poland', 'Polska', ['Polski', 'English']],
        ['pt', 'Portugal', 'Portugal', ['Português', 'English']],
        ['ro', 'Romania', 'România', ['Română', 'English']],
        ['rs', 'Serbia', 'Srbija', ['Srpski', 'English']],
        ['sk', 'Slovakia', 'Slovensko', ['Slovenčina', 'English']],
        ['si', 'Slovenia', 'Slovenija', ['Slovenščina', 'English']],
        ['za', 'South Africa', 'South Africa', ['English']],
        ['es', 'Spain', 'España', ['Español', 'English']],
        ['se', 'Sweden', 'Sverige', ['Svenska', 'English']],
        ['ch', 'Switzerland', 'Schweiz', ['Deutsch', 'Français', 'English']],
        ['tz', 'Tanzania', 'Tanzania', ['English', 'Kiswahili']],
        ['th', 'Thailand', 'ประเทศไทย', ['ไทย', 'English']],
        ['tn', 'Tunisia', 'تونس', ['العربية', 'Français', 'English']],
        ['ug', 'Uganda', 'Uganda', ['English']],
        ['ua', 'Ukraine', 'Україна', ['Українська', 'English']],
        ['ae', 'United Arab Emirates', 'الإمارات', ['العربية', 'English']],
        ['gb', 'United Kingdom', 'United Kingdom', ['English']],
        ['uz', 'Uzbekistan', 'Oʻzbekiston', ['Oʻzbekcha', 'English', 'Русский']],
        ['zm', 'Zambia', 'Zambia', ['English']]
    ];

    // flags already drawn in CSS (m.css); every other country uses a flag image
    const CSS_FLAGS = ['ng', 'global', 'ao', 'az', 'be', 'cz', 'dk', 'ee', 'fr', 'gh', 'lt', 'pl', 'ua'];
    const flagImg = code => `https://flagcdn.com/w80/${code}.png`;

    const CODES = {
        'English': 'EN', 'Português': 'PT', 'Azərbaycanca': 'AZ', 'Русский': 'RU',
        'Nederlands': 'NL', 'Français': 'FR', 'Čeština': 'CS', 'Dansk': 'DA',
        'Eesti': 'ET', 'Lietuvių': 'LT', 'Polski': 'PL', 'Українська': 'UK',
        'Deutsch': 'DE', 'Hrvatski': 'HR', 'Ελληνικά': 'EL', 'العربية': 'AR',
        'Suomi': 'FI', 'Svenska': 'SV', 'ქართული': 'KA', 'Magyar': 'HU',
        'Italiano': 'IT', 'Қазақша': 'KK', 'Latviešu': 'LV', 'Română': 'RO',
        'Norsk': 'NO', 'Srpski': 'SR', 'Slovenčina': 'SK', 'Slovenščina': 'SL',
        'Español': 'ES', 'Kiswahili': 'SW', 'ไทย': 'TH', 'Oʻzbekcha': 'UZ'
    };

    // ---- build the list ----
    list.textContent = '';
    COUNTRIES.forEach(([code, name, local, langs]) => {
        const li = document.createElement('li');
        li.className = 'region';
        li.dataset.code = code;

        const flag = document.createElement('span');
        if (code === 'global') {
            flag.className = 'fl fl-global';
            flag.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>';
        } else if (CSS_FLAGS.includes(code)) {
            flag.className = 'fl fl-' + code;
        } else {
            flag.className = 'fl';
            flag.style.background = `url(${flagImg(code)}) center / cover no-repeat`;
        }

        const label = document.createElement('div');
        label.className = 'region-name';
        label.innerHTML = (name !== local ? `<small>${name}</small>` : '') + `<b>${local}</b>`;

        const links = document.createElement('div');
        links.className = 'region-langs';
        links.innerHTML = langs.map(l => `<a href="#">${l}</a>`).join('');

        li.append(flag, label, links);
        list.appendChild(li);
    });

    const regions = Array.from(list.querySelectorAll('.region'));

    function apply(li, lang) {
        // highlight the chosen row (and chosen language) and put it at the top
        regions.forEach(r => {
            r.classList.toggle('selected', r === li);
            r.querySelectorAll('.region-langs a').forEach(a => {
                a.style.fontWeight = (r === li && a.textContent.trim() === lang) ? '700' : '';
            });
        });
        list.prepend(li);
        list.scrollTop = 0;

        // navbar flag + language code
        const src = li.querySelector('.fl');
        Array.from(navFlag.classList).filter(c => c.startsWith('fl-')).forEach(c => navFlag.classList.remove(c));
        navFlag.textContent = '';
        navFlag.style.background = '';
        navFlag.style.position = 'relative';
        navFlag.style.alignItems = 'center';
        navFlag.style.justifyContent = 'center';

        const cssFlag = Array.from(src.classList).find(c => c.startsWith('fl-'));
        if (cssFlag) {
            navFlag.classList.add(cssFlag);
        } else {
            navFlag.style.background = src.style.background;   // flag image
        }
        const icon = src.querySelector('svg');                 // the "Global" flag has a globe icon
        if (icon) {
            const g = icon.cloneNode(true);
            g.setAttribute('width', 14);
            g.setAttribute('height', 14);
            navFlag.appendChild(g);
        }
        navLabel.textContent = CODES[lang] || lang.slice(0, 2).toUpperCase();
    }

    function remember(li, lang) {
        try { localStorage.setItem('boltRegion', JSON.stringify({ code: li.dataset.code, lang })); } catch (e) {}
    }

    regions.forEach(li => { li.style.cursor = 'pointer'; });

    list.addEventListener('click', e => {
        const li = e.target.closest('.region');
        if (!li) return;
        e.preventDefault();

        const link = e.target.closest('.region-langs a') || li.querySelector('.region-langs a');
        const lang = link.textContent.trim();

        apply(li, lang);
        remember(li, lang);

        // clear the search box, show the full list again, close the popup
        const box = document.getElementById('region-search');
        if (box) box.value = '';
        regions.forEach(r => { r.style.display = ''; });
        document.getElementById('lang-toggle').checked = false;
    });

    // start on Nigeria, or restore the saved choice
    let start = [regions[0], 'English'];
    try {
        const saved = JSON.parse(localStorage.getItem('boltRegion'));
        const li = saved && regions.find(r => r.dataset.code === saved.code);
        if (li) start = [li, saved.lang];
    } catch (e) {}
    apply(start[0], start[1]);
})();



// ===== "Get the Bolt app" QR popup (all pages) =====
// Every green "Get Bolt" button opens a popup with a QR code. The QR code below
// points to QR_URL; to change where it goes, generate a new QR code and replace QR_SVG.
(function () {
    const QR_URL = 'https://bolt.eu/en-ng/';
    const QR_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" shape-rendering="crispEdges" role="img" aria-label="QR code to download the Bolt app"><path d="M0 0h7v1h-7zM8 0h1v1h-1zM10 0h1v1h-1zM12 0h2v1h-2zM16 0h1v1h-1zM18 0h7v1h-7zM0 1h1v1h-1zM6 1h1v1h-1zM8 1h1v1h-1zM12 1h2v1h-2zM16 1h1v1h-1zM18 1h1v1h-1zM24 1h1v1h-1zM0 2h1v1h-1zM2 2h3v1h-3zM6 2h1v1h-1zM9 2h1v1h-1zM11 2h1v1h-1zM13 2h1v1h-1zM18 2h1v1h-1zM20 2h3v1h-3zM24 2h1v1h-1zM0 3h1v1h-1zM2 3h3v1h-3zM6 3h1v1h-1zM8 3h2v1h-2zM11 3h3v1h-3zM15 3h1v1h-1zM18 3h1v1h-1zM20 3h3v1h-3zM24 3h1v1h-1zM0 4h1v1h-1zM2 4h3v1h-3zM6 4h1v1h-1zM9 4h1v1h-1zM13 4h4v1h-4zM18 4h1v1h-1zM20 4h3v1h-3zM24 4h1v1h-1zM0 5h1v1h-1zM6 5h1v1h-1zM9 5h1v1h-1zM12 5h3v1h-3zM18 5h1v1h-1zM24 5h1v1h-1zM0 6h7v1h-7zM8 6h1v1h-1zM10 6h1v1h-1zM12 6h1v1h-1zM14 6h1v1h-1zM16 6h1v1h-1zM18 6h7v1h-7zM8 7h3v1h-3zM15 7h2v1h-2zM0 8h1v1h-1zM2 8h2v1h-2zM5 8h3v1h-3zM9 8h1v1h-1zM12 8h1v1h-1zM14 8h3v1h-3zM18 8h1v1h-1zM21 8h1v1h-1zM23 8h2v1h-2zM0 9h6v1h-6zM8 9h3v1h-3zM12 9h2v1h-2zM19 9h1v1h-1zM23 9h1v1h-1zM0 10h1v1h-1zM2 10h1v1h-1zM4 10h3v1h-3zM9 10h2v1h-2zM13 10h1v1h-1zM16 10h1v1h-1zM18 10h1v1h-1zM1 11h3v1h-3zM9 11h1v1h-1zM11 11h1v1h-1zM13 11h1v1h-1zM17 11h3v1h-3zM21 11h2v1h-2zM0 12h1v1h-1zM3 12h1v1h-1zM6 12h3v1h-3zM10 12h1v1h-1zM13 12h6v1h-6zM20 12h1v1h-1zM22 12h3v1h-3zM1 13h1v1h-1zM3 13h2v1h-2zM9 13h3v1h-3zM14 13h7v1h-7zM24 13h1v1h-1zM1 14h2v1h-2zM4 14h4v1h-4zM10 14h1v1h-1zM12 14h1v1h-1zM14 14h1v1h-1zM17 14h2v1h-2zM20 14h1v1h-1zM22 14h2v1h-2zM0 15h1v1h-1zM2 15h3v1h-3zM10 15h1v1h-1zM12 15h1v1h-1zM14 15h3v1h-3zM18 15h3v1h-3zM24 15h1v1h-1zM2 16h2v1h-2zM5 16h3v1h-3zM9 16h3v1h-3zM13 16h2v1h-2zM16 16h9v1h-9zM8 17h1v1h-1zM12 17h1v1h-1zM16 17h1v1h-1zM20 17h1v1h-1zM22 17h1v1h-1zM24 17h1v1h-1zM0 18h7v1h-7zM8 18h1v1h-1zM11 18h4v1h-4zM16 18h1v1h-1zM18 18h1v1h-1zM20 18h1v1h-1zM22 18h3v1h-3zM0 19h1v1h-1zM6 19h1v1h-1zM8 19h2v1h-2zM12 19h1v1h-1zM15 19h2v1h-2zM20 19h1v1h-1zM23 19h2v1h-2zM0 20h1v1h-1zM2 20h3v1h-3zM6 20h1v1h-1zM9 20h5v1h-5zM16 20h6v1h-6zM23 20h1v1h-1zM0 21h1v1h-1zM2 21h3v1h-3zM6 21h1v1h-1zM8 21h2v1h-2zM12 21h2v1h-2zM15 21h4v1h-4zM20 21h5v1h-5zM0 22h1v1h-1zM2 22h3v1h-3zM6 22h1v1h-1zM8 22h1v1h-1zM10 22h4v1h-4zM15 22h2v1h-2zM18 22h1v1h-1zM20 22h1v1h-1zM22 22h2v1h-2zM0 23h1v1h-1zM6 23h1v1h-1zM10 23h1v1h-1zM17 23h1v1h-1zM20 23h1v1h-1zM22 23h1v1h-1zM0 24h7v1h-7zM8 24h1v1h-1zM10 24h1v1h-1zM12 24h1v1h-1zM14 24h2v1h-2zM18 24h7v1h-7z" fill="#000"/></svg>';

    const modal = document.createElement('div');
    modal.className = 'qr-modal';
    modal.hidden = true;
    modal.innerHTML = `
        <div class="qr-backdrop"></div>
        <div class="qr-box" role="dialog" aria-modal="true" aria-labelledby="qr-title">
            <h2 id="qr-title">Get the Bolt app</h2>
            <div class="qr-code">${QR_SVG}</div>
            <p>Scan the QR code with your phone camera to download the Bolt app.</p>
        </div>`;
    document.body.appendChild(modal);

    const open = () => { modal.hidden = false; document.body.style.overflow = 'hidden'; };
    const close = () => { modal.hidden = true; document.body.style.overflow = ''; };

    document.querySelectorAll('.get-bolt').forEach(btn => btn.addEventListener('click', open));
    modal.querySelector('.qr-backdrop').addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();


// ===== Driver page only (driver.html) =====
// Sign-up form: check the phone number, remember what was typed,
// then send the driver to the "how should we send your code?" page.
const signupForm = document.getElementById('signup');
if (signupForm) {
    const phoneInput = document.getElementById('d-phone');

    // clear the "invalid number" message as soon as the driver edits the field
    phoneInput.addEventListener('input', () => phoneInput.setCustomValidity(''));

    signupForm.addEventListener('submit', e => {
        e.preventDefault();   // we move to the next page ourselves

        // keep only the digits, then drop "234" or a leading 0 the driver may have typed
        let digits = phoneInput.value.replace(/\D/g, '');
        if (digits.startsWith('234')) digits = digits.slice(3);
        if (digits.startsWith('0')) digits = digits.slice(1);

        // a Nigerian mobile number has 10 digits after the country code
        if (digits.length !== 10) {
            phoneInput.setCustomValidity('Enter a valid 10-digit phone number');
            phoneInput.reportValidity();
            return;
        }

        // save for the next page (sessionStorage is cleared when the tab closes)
        try {
            sessionStorage.setItem('boltSignup', JSON.stringify({
                email: document.getElementById('d-email').value,
                phone: digits,
                city: document.getElementById('d-city').value
            }));
        } catch (err) {}

        // "register" the account: keep a list of accounts in localStorage so login.html can find it
        // (demo only: with a real backend this would be saved on the server)
        try {
            const email = document.getElementById('d-email').value.trim().toLowerCase();
            const accounts = JSON.parse(localStorage.getItem('boltAccounts')) || [];
            const others = accounts.filter(a => a.email !== email);   // replace an older account with the same email
            others.push({ email: email, phone: digits, city: document.getElementById('d-city').value });
            localStorage.setItem('boltAccounts', JSON.stringify(others));
        } catch (err) {}

        // ?channels=whatsapp,sms decides which options the next page shows
        window.location.href = 'otp-channel.html?channels=whatsapp,sms';
    });
}