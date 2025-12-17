// Adapted legacy script from V3.9.1.html
// NOTE: This file expects the HTML markup to already be present in the DOM.

// GLOBALE VARIABLEN
let bgMap;
let appMap;
let markers = [];

let events = [];
let currentEvent = null;

// Initial Data (Spots)
let spots = [
    { description: "Spielzeug & Bücher", address: "Rüsternweg 50, Nürnberg", lat: 49.417652, lng: 11.055152, name: "Max Mustermann", contact: "max@test.de", consent: true },
    { description: "Vintage Kleidung", address: "Heisterstraße 60, Nürnberg", lat: 49.423576, lng: 11.062553, name: "Anna Schmidt", contact: "0170-1234567", consent: true },
    { description: "Omas Geschirr", address: "Mustergasse 12, Nürnberg", lat: 49.4200, lng: 11.0600, name: "", contact: "", consent: true }
];

function initApp() {
    const errEl = document.getElementById('error-overlay');
    if (errEl) errEl.style.display = 'none';
    if (typeof L !== 'undefined') {
        // ensure marker icons load from CDN
        try {
            delete L.Icon.Default.prototype._getIconUrl;
        } catch (e) {}
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        if (document.getElementById('background-map')) {
            bgMap = L.map('background-map', {
                zoomControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, attributionControl: false
            }).setView([49.42, 11.06], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(bgMap);
        }

        // Wire up handlers that rely on elements existing
        attachHandlers();

        // Initialize admin / render initial data if app map loads later
    }
}

// Attach event handlers and wire UI logic
function attachHandlers() {
    // NAV
    window.goToApp = function (target) {
        const fp = document.getElementById('frontpage');
        if (fp) fp.style.transform = 'translateY(-100%)';
        setTimeout(() => {
            if (fp) fp.style.display = 'none';
            const av = document.getElementById('app-view');
            if (av) av.style.display = 'flex';
            if (!appMap && typeof L !== 'undefined') initAppMap();
            switchTab(target);
        }, 300);
    };

    window.goToAppFromDashboard = function () {
        const dash = document.getElementById('view-organizer-dashboard');
        if (dash) {
            dash.classList.remove('active');
            dash.style.display = 'none';
        }
        const av = document.getElementById('app-view');
        if (av) av.style.display = 'flex';
        if (!appMap && typeof L !== 'undefined') initAppMap();
        switchTab('map');
        if (currentEvent) {
            const t = document.getElementById('app-title-display');
            if (t) t.innerText = currentEvent.title;
        }
    };

    window.showFrontpage = function () {
        document.querySelectorAll('.auth-view').forEach(el => el.classList.remove('active'));
        const dash = document.getElementById('view-organizer-dashboard');
        if (dash) {
            dash.classList.remove('active');
            dash.style.display = 'none';
        }
        const fp = document.getElementById('frontpage');
        if (fp) fp.style.display = 'block';
        setTimeout(() => {
            if (fp) fp.style.transform = 'translateY(0)';
            const av = document.getElementById('app-view');
            if (av) av.style.display = 'none';
        }, 10);
    };

    window.showRegister = function () { document.getElementById('auth-login')?.classList.remove('active'); document.getElementById('auth-register')?.classList.add('active'); };
    window.showLogin = function () { document.getElementById('auth-register')?.classList.remove('active'); document.getElementById('auth-login')?.classList.add('active'); };

    window.simulateAuth = function () {
        alert("Login erfolgreich! (Veranstalter-Modus)");
        document.querySelectorAll('.auth-view').forEach(el => el.classList.remove('active'));
        const fp = document.getElementById('frontpage'); if (fp) fp.style.display = 'none';
        const dash = document.getElementById('view-organizer-dashboard'); if (dash) { dash.style.display = 'flex'; dash.classList.add('active'); }
        updateDashboardState();
    };

    window.logout = function () { window.showFrontpage(); };

    // Dashboard
    window.updateDashboardState = function () {
        if (currentEvent) {
            const organizer = document.getElementById('organizer-create-section'); if (organizer) organizer.style.display = 'none';
            const c = document.getElementById('dashboard-event-control'); if (c) c.style.display = 'flex';
            const t = document.getElementById('dash-evt-title'); if (t) t.innerText = currentEvent.title;
            const out = document.getElementById('evt-link-output'); if (out) out.innerText = currentEvent.link;
            renderAdminSpotList();
        } else {
            const organizer = document.getElementById('organizer-create-section'); if (organizer) organizer.style.display = 'block';
            const c = document.getElementById('dashboard-event-control'); if (c) c.style.display = 'none';
        }
    };

    window.copyLink = function () {
        const linkText = document.getElementById('evt-link-output')?.innerText || '';
        if (navigator.clipboard) {
            navigator.clipboard.writeText(linkText).then(() => { alert("Link kopiert!"); });
        } else { alert("Kopieren nicht unterstützt, bitte manuell markieren."); }
    };

    window.emailAllSpots = function () {
        const emails = [...new Set(spots.map(s => s.contact).filter(c => c && c.includes('@')))];
        if (emails.length === 0) { alert("Keine gültigen E-Mail-Adressen gefunden."); return; }
        const mailtoLink = `mailto:?bcc=${emails.join(',')}&subject=Info zum Flohmarkt`;
        window.location.href = mailtoLink;
    };

    window.adminDeleteSpot = function (index) {
        if (confirm("Diesen Spot wirklich unwiderruflich löschen?")) {
            spots.splice(index, 1);
            renderAdminSpotList();
            renderData();
        }
    };

    // Form handlers
    const createForm = document.getElementById('create-event-form');
    if (createForm) {
        createForm.onsubmit = (e) => {
            e.preventDefault();
            const title = document.getElementById('evt-title').value; 
            const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            const publicLink = window.location.origin + window.location.pathname + '#event/' + slug;
            currentEvent = { title: title, date: document.getElementById('evt-date').value, link: publicLink }; 
            updateDashboardState();
        };
    }

    renderData();

    const addForm = document.getElementById('add-form');
    if (addForm) {
        addForm.onsubmit = (e) => {
            e.preventDefault();
            const addressInput = document.getElementById('address').value; 
            const coords = mockBackendGeocode(addressInput);
            const newSpot = {
                description: document.getElementById('desc').value,
                address: addressInput,
                lat: coords.lat,
                lng: coords.lng,
                consent: document.getElementById('consent').checked,
                name: document.getElementById('name').value,
                contact: document.getElementById('contact').value
            };
            spots.push(newSpot);
            renderData();
            if (currentEvent) renderAdminSpotList();
            alert("Spot erfolgreich angelegt!");
            switchTab('list');
            e.target.reset();
            setTimeout(() => {
                const newIndex = spots.length - 1;
                const newItem = document.getElementById('spot-item-' + newIndex);
                if (newItem) { newItem.scrollIntoView({ behavior: 'smooth', block: 'center' }); newItem.classList.add('highlight-new'); }
            }, 300);
        };
    }

    const delForm = document.getElementById('delete-form');
    if (delForm) {
        delForm.onsubmit = (e) => {
            e.preventDefault();
            const addr = document.getElementById('del-address').value;
            const name = document.getElementById('del-name').value;
            const contact = document.getElementById('del-contact').value;
            const index = spots.findIndex(s => s.address.trim() === addr.trim() && s.name.trim() === name.trim() && s.contact.trim() === contact.trim());
            if (index > -1) {
                spots.splice(index, 1);
                renderData();
                if (currentEvent) renderAdminSpotList();
                alert("Spot erfolgreich gelöscht.");
                switchTab('list');
                document.getElementById('delete-form').reset();
            } else {
                alert("Fehler: Es wurde kein Spot mit diesen exakten Daten gefunden.");
            }
        };
    }
}

// --- VISITOR & MAP LOGIC ---
window.switchTab = function (tabName) {
    document.querySelectorAll('[id^="view-"]').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(el => el.classList.remove('active'));
    const view = document.getElementById('view-' + tabName);
    if (view) view.classList.add('active');
    const btn = document.querySelector(`button[data-target="${tabName}"]`);
    if (btn) btn.classList.add('active');
    if (tabName === 'map' && appMap) { setTimeout(() => { appMap.invalidateSize(); }, 100); }
};

window.openDeleteForm = function (addressPreFill) {
    switchTab('delete');
    if (addressPreFill) document.getElementById('del-address').value = addressPreFill;
};

function initAppMap() {
    if (typeof L === 'undefined') return;
    appMap = L.map('app-map').setView([49.42, 11.06], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(appMap);
    renderData();
}

window.toggleMapList = function () { document.getElementById('map-drawer')?.classList.toggle('open'); };

function mockBackendGeocode(address) {
    const centerLat = 49.418;
    const centerLng = 11.058;
    return { lat: centerLat + (Math.random() - 0.5) * 0.01, lng: centerLng + (Math.random() - 0.5) * 0.01 };
}

function renderData() {
    const listMain = document.getElementById('spot-list-main');
    const listOverlay = document.getElementById('spot-list-overlay');
    if (listMain) listMain.innerHTML = '';
    if (listOverlay) listOverlay.innerHTML = '';
    markers.forEach(m => appMap?.removeLayer(m)); markers = [];

    spots.forEach((spot, index) => {
        const displayTitle = spot.address;
        const displayDesc = spot.description;
        const popupContent = `
            <b>${displayTitle}</b><br>${displayDesc}<br>
            <button onclick="openDeleteForm('${displayTitle}')" style="margin-top:5px; color:red; border:1px solid red; background:white; padding:2px 5px; border-radius:4px; font-size:0.8rem;">🗑️ Spot löschen</button>
        `;
        if (appMap && typeof L !== 'undefined') {
            const m = L.marker([spot.lat, spot.lng]).addTo(appMap).bindPopup(popupContent);
            markers.push(m);
        }

        const createItem = (isOverlay) => {
            const item = document.createElement('div');
            item.className = 'spot-item';
            if (!isOverlay) item.id = 'spot-item-' + index;
            if (isOverlay) { item.style.padding = "10px"; item.style.fontSize = "0.9rem"; }
            let deleteBtn = '';
            if (!isOverlay) {
                deleteBtn = `<button class="btn-delete-icon" title="Eigenen Spot löschen" onclick="event.stopPropagation(); openDeleteForm('${spot.address}')">🗑️</button>`;
            }
            item.innerHTML = `${deleteBtn}<h3>${displayTitle}</h3><p style="margin:0; color:#555;">${displayDesc}</p>`;
            item.onclick = (e) => {
                if (e.target.closest('.btn-delete-icon')) return;
                switchTab('map');
                appMap?.setView([spot.lat, spot.lng], 16);
                const m = markers[index]; if (m) m.openPopup();
                if (isOverlay && window.innerWidth < 768) toggleMapList();
            };
            return item;
        };
        listMain?.appendChild(createItem(false));
        listOverlay?.appendChild(createItem(true));
    });
}

function renderAdminSpotList() {
    const tbody = document.getElementById('admin-spot-list');
    if (!tbody) return;
    tbody.innerHTML = '';
    spots.forEach((spot, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${spot.address}</strong></td>
            <td>${spot.description}</td>
            <td>
                <div class="badge-private">Name: ${spot.name || '-'}</div><br>
                <div class="badge-private">Kontakt: ${spot.contact || '-'}</div>
            </td>
            <td>
                <button class="admin-delete-btn" title="Löschen (Admin)" onclick="adminDeleteSpot(${index})">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Initialize once the script loads
try { initApp(); } catch (e) { console.error('initApp error', e); }
