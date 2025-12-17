"use client";
import { useEffect, useRef } from "react";

export default function FlohmarktPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const injectedRef = useRef(false);

  useEffect(() => {
    if (injectedRef.current) return;
    injectedRef.current = true;

    const container = containerRef.current;
    if (!container) return;

    // Insert the CSS blocks + HTML body content from original file
    container.innerHTML = `
      <style>
        body {
            font-family: sans-serif;
            margin: 0;
        }

        #error-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: white;
            z-index: 9999;
            padding: 20px;
            color: red;
            text-align: center;
        }
      </style>

      <style>
        /* ========================================= */
        /* DESIGN SYSTEM                             */
        /* ========================================= */
        :root {
            --primary-color: #003366;
            --accent-color: #FFCC00;
            --danger-color: #dc3545;
            --success-color: #28a745;
            --text-on-primary: #FFFFFF;
            --text-dark: #222222;
            --text-light: #777777;
            --overlay-bg: rgba(0, 51, 102, 0.95);
            --bg-light: #f5f5f5;
            --header-height: 60px;
            --nav-height: 50px;
        }

        * {
            box-sizing: border-box;
        }

        body,
        html {
            height: 100%;
            margin: 0;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            font-size: 16px;
            background-color: var(--bg-light);
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        button {
            cursor: pointer;
            transition: all 0.2s;
        }

        button:active {
            transform: scale(0.98);
        }

        /* ========================================= */
        /* VIEW 1: FRONTPAGE (Startseite)            */
        /* ========================================= */
        #frontpage {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 3000;
            background-color: var(--primary-color);
            transition: transform 0.3s ease-in-out;
        }

        #background-map {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            filter: grayscale(80%) contrast(1.2);
            opacity: 0.6;
        }

        .overlay-container {
            position: relative;
            z-index: 10;
            height: 100%;
            width: 100%;
            background-color: rgba(0, 51, 102, 0.85);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .content-box {
            background: #fff;
            padding: 30px 20px;
            border-radius: 12px;
            width: 100%;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            margin-bottom: auto;
            margin-top: auto;
        }

        .content-box h1 {
            color: var(--primary-color);
            margin: 0 0 10px 0;
            line-height: 1.2;
        }

        .menu-buttons {
            display: flex;
            flex-direction: column;
            gap: 15px;
            width: 100%;
        }

        .fp-btn {
            font-size: 1.1rem;
            font-weight: bold;
            padding: 15px;
            border: none;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
        }

        .btn-primary {
            background-color: var(--primary-color);
            color: white;
            border-bottom: 4px solid #002244;
        }

        .nav-group {
            display: flex;
            gap: 10px;
        }

        .nav-group button {
            flex: 1;
            background-color: #eee;
            color: var(--text-dark);
            border: 1px solid #ccc;
            border-bottom: 3px solid #bbb;
        }

        .btn-outline {
            background: transparent;
            border: 2px solid var(--primary-color);
            color: var(--primary-color);
            margin-top: 10px;
        }

        .fp-footer {
            margin-top: 20px;
            display: flex;
            gap: 20px;
            font-size: 0.85rem;
        }

        .fp-footer a {
            color: #ccc;
            text-decoration: none;
            border-bottom: 1px dotted #ccc;
            padding-bottom: 2px;
            cursor: pointer;
        }

        .fp-footer a:hover {
            color: white;
            border-bottom-style: solid;
        }

        /* ========================================= */
        /* VIEW: AUTH SCREENS                        */
        /* ========================================= */
        .auth-view {
            display: none;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #f5f5f5;
            z-index: 4000;
            flex-direction: column;
            overflow-y: auto;
        }

        .auth-view.active {
            display: flex;
        }

        .auth-header {
            padding: 20px;
            display: flex;
            align-items: center;
        }

        .auth-back-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: var(--primary-color);
            padding: 0;
            margin-right: 15px;
        }

        .auth-container {
            max-width: 400px;
            width: 100%;
            margin: 0 auto;
            padding: 20px;
        }

        .auth-container h2 {
            margin-top: 0;
            color: var(--primary-color);
        }

        .google-btn {
            background: white;
            border: 1px solid #ccc;
            color: #444;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 12px;
            border-radius: 6px;
            font-weight: bold;
            width: 100%;
            margin-bottom: 20px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .google-icon {
            font-weight: bold;
            font-family: serif;
            color: #DB4437;
            font-size: 1.2rem;
        }

        .divider {
            text-align: center;
            margin: 20px 0;
            color: #999;
            font-size: 0.9rem;
            position: relative;
        }

        .divider::before,
        .divider::after {
            content: "";
            position: absolute;
            top: 50%;
            width: 40%;
            height: 1px;
            background: #ddd;
        }

        .divider::before {
            left: 0;
        }

        .divider::after {
            right: 0;
        }

        .form-group {
            margin-bottom: 15px;
        }

        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #555;
            font-size: 0.9rem;
        }

        .auth-input {
            width: 100%;
            padding: 12px;
            border: 1px solid #ccc;
            border-radius: 6px;
            font-size: 1rem;
        }

        .action-btn {
            width: 100%;
            background-color: var(--primary-color);
            color: white;
            padding: 14px;
            border: none;
            border-radius: 6px;
            font-size: 1.1rem;
            font-weight: bold;
            margin-top: 10px;
        }

        .auth-links {
            margin-top: 20px;
            text-align: center;
            font-size: 0.9rem;
        }

        .auth-links a {
            color: var(--primary-color);
            text-decoration: none;
        }


        /* ========================================= */
        /* VIEW: ORGANIZER DASHBOARD                 */
        /* ========================================= */
        #view-organizer-dashboard {
            display: none;
            height: 100%;
            flex-direction: column;
            background-color: #f5f5f5;
            z-index: 3500;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
        }

        #view-organizer-dashboard.active {
            display: flex;
        }

        .dashboard-header {
            background: var(--primary-color);
            color: white;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .dashboard-content {
            padding: 20px;
            overflow-y: auto;
            width: 100%;
            max-width: 1000px;
            margin: 0 auto;
        }

        /* Event Create Form Box */
        .event-create-box {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        /* Dashboard Control Panel (Success & Management) */
        #dashboard-event-control {
            display: none;
            flex-direction: column;
            gap: 20px;
        }

        .event-card-success {
            background: white;
            border: 1px solid #ddd;
            border-left: 5px solid var(--success-color);
            padding: 20px;
            border-radius: 8px;
        }

        .link-wrapper {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 10px;
        }

        .link-box {
            background: #eee;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            font-family: monospace;
            word-break: break-all;
            flex-grow: 1;
        }

        .copy-btn {
            background: #ddd;
            border: 1px solid #ccc;
            padding: 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1.2rem;
        }

        .copy-btn:hover {
            background: #ccc;
        }

        /* ADMIN TABLE (Verwaltung) */
        .admin-table-container {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            overflow-x: auto;
        }

        table.admin-table {
            width: 100%;
            border-collapse: collapse;
            min-width: 600px;
        }

        table.admin-table th {
            text-align: left;
            background: #eee;
            padding: 10px;
            border-bottom: 2px solid #ccc;
            color: var(--primary-color);
        }

        table.admin-table td {
            padding: 10px;
            border-bottom: 1px solid #eee;
            vertical-align: top;
        }

        table.admin-table tr:hover {
            background-color: #f9f9f9;
        }

        .badge-private {
            background: #e3f2fd;
            color: #0d47a1;
            font-size: 0.75rem;
            padding: 2px 5px;
            border-radius: 4px;
            display: inline-block;
            margin-bottom: 4px;
        }

        .admin-delete-btn {
            background: #fff0f0;
            border: 1px solid #ffcccc;
            color: var(--danger-color);
            width: 30px;
            height: 30px;
            border-radius: 4px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        .admin-delete-btn:hover {
            background: var(--danger-color);
            color: white;
        }


        /* ========================================= */
        /* VIEW: APP INTERFACE (Haupt-App / Visitor) */
        /* ========================================= */
        #app-view {
            display: none;
            height: 100%;
            flex-direction: column;
            position: relative;
        }

        .app-header {
            background-color: var(--primary-color);
            color: white;
            height: var(--header-height);
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 20px;
            flex-shrink: 0;
            z-index: 2000;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }

        .back-link {
            color: var(--accent-color);
            font-weight: bold;
            cursor: pointer;
            text-decoration: none;
        }

        .tabs {
            display: flex;
            height: var(--nav-height);
            background: #fff;
            border-bottom: 1px solid #ccc;
            flex-shrink: 0;
            z-index: 1900;
        }

        .tab-button {
            flex: 1;
            border: none;
            background: none;
            font-weight: bold;
            color: #666;
            cursor: pointer;
            border-bottom: 4px solid transparent;
            font-size: 1rem;
        }

        .tab-button.active {
            color: var(--primary-color);
            border-bottom-color: var(--accent-color);
            background-color: #f9f9f9;
        }

        .main-content-area {
            position: relative;
            flex-grow: 1;
            overflow: hidden;
            background-color: #f0f0f0;
        }

        #view-list {
            display: none;
            height: 100%;
            overflow-y: auto;
            padding: 20px;
        }

        #view-list.active {
            display: block;
        }

        .list-container {
            max-width: 800px;
            margin: 0 auto;
            padding-bottom: 80px;
        }

        .spot-item {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            border-left: 5px solid var(--primary-color);
            cursor: pointer;
            transition: transform 0.1s;
            position: relative;
        }

        .spot-item:active {
            transform: scale(0.99);
        }

        .spot-item h3 {
            margin: 0 0 5px 0;
            color: var(--primary-color);
            font-size: 1.1rem;
        }

        .btn-delete-icon {
            position: absolute;
            top: 15px;
            right: 15px;
            background: #fff0f0;
            border: 1px solid #ffcccc;
            color: var(--danger-color);
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1rem;
            cursor: pointer;
            z-index: 5;
        }

        .btn-delete-icon:hover {
            background: var(--danger-color);
            color: white;
        }

        .highlight-new {
            animation: flashYellow 2s ease-out;
            border: 2px solid var(--accent-color);
        }

        @keyframes flashYellow {
            0% {
                background-color: var(--accent-color);
            }

            100% {
                background-color: white;
            }
        }

        #view-map {
            display: none;
            height: 100%;
            width: 100%;
            position: relative;
        }

        #view-map.active {
            display: block;
        }

        #app-map {
            height: 100%;
            width: 100%;
            z-index: 1;
        }

        .map-list-toggle {
            position: absolute;
            bottom: 20px;
            left: 20px;
            z-index: 1000;
            background-color: var(--primary-color);
            color: white;
            padding: 12px 20px;
            border-radius: 30px;
            border: none;
            font-weight: bold;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .map-overlay-list {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 300px;
            background: white;
            z-index: 1001;
            transform: translateX(-100%);
            transition: transform 0.3s ease-in-out;
            box-shadow: 4px 0 15px rgba(0, 0, 0, 0.2);
            display: flex;
            flex-direction: column;
        }

        .map-overlay-list.open {
            transform: translateX(0);
        }

        @media (max-width: 480px) {
            .map-overlay-list {
                width: 85%;
            }
        }

        .overlay-header {
            padding: 15px;
            background: #eee;
            border-bottom: 1px solid #ccc;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
        }

        .overlay-content {
            overflow-y: auto;
            padding: 10px;
            flex-grow: 1;
        }

        #view-form,
        #view-delete {
            display: none;
            height: 100%;
            overflow-y: auto;
            padding: 20px;
        }

        #view-form.active,
        #view-delete.active {
            display: block;
        }

        .form-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
        }

        textarea {
            width: 100%;
            padding: 12px;
            margin-bottom: 15px;
            border: 1px solid #ccc;
            border-radius: 6px;
            font-size: 1rem;
        }

        .checkbox-group {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            margin-bottom: 20px;
        }

        .checkbox-group input {
            width: 20px;
            height: 20px;
            margin-top: 3px;
            flex-shrink: 0;
        }

        .checkbox-group label {
            font-size: 0.95rem;
            color: #333;
            line-height: 1.4;
        }

        .hint-text {
            font-size: 0.8rem;
            color: #777;
            margin-top: -10px;
            margin-bottom: 20px;
            line-height: 1.4;
            background: #f9f9f9;
            padding: 10px;
            border-radius: 4px;
        }

        .btn-confirm-delete {
            background-color: var(--danger-color);
            color: white;
            width: 100%;
            padding: 14px;
            border: none;
            border-radius: 6px;
            font-weight: bold;
            font-size: 1.1rem;
        }

        .fab-contact {
            position: absolute;
            bottom: 20px;
            right: 20px;
            width: 56px;
            height: 56px;
            background-color: var(--accent-color);
            color: var(--primary-color);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
            z-index: 2500;
            text-decoration: none;
            transition: transform 0.2s;
        }

        .fab-contact:hover {
            transform: scale(1.1);
        }

        .row-2 {
            display: flex;
            gap: 15px;
        }

        .row-2 .form-group {
            flex: 1;
        }
    </style>

      <!-- body content -->
      <div id="error-overlay">
        <h2>⚠️ Es ist ein Fehler aufgetreten</h2>
        <p>Die Seite konnte nicht geladen werden.</p>
      </div>

      <div id="auth-register" class="auth-view">
        <div class="auth-header">
          <button class="auth-back-btn" onclick="showFrontpage()">←</button>
          <span>Startseite</span>
        </div>
        <div class="auth-container">
          <h2>Als Veranstalter:in registrieren</h2>
          <p style="color:#666; margin-bottom:20px;">Erstelle einen Account, um ein Event anzulegen.</p>
          <button class="google-btn" onclick="simulateAuth()"><span class="google-icon">G</span> Weiter mit
            Google</button>
          <div class="divider">ODER</div>
          <form onsubmit="simulateAuth(); return false;">
            <div class="form-group"><label>Name</label><input type="text" class="auth-input" required
                    placeholder="Max Mustermann"></div>
            <div class="form-group"><label>E-Mail</label><input type="email" class="auth-input" required
                    placeholder="max@beispiel.de"></div>
            <div class="form-group"><label>Passwort</label><input type="password" class="auth-input" required></div>
            <button type="submit" class="action-btn">Account erstellen</button>
          </form>
          <div class="auth-links">Bereits registriert? <a href="#" onclick="showLogin()">Hier einloggen</a></div>
        </div>
      </div>

      <div id="auth-login" class="auth-view">
        <div class="auth-header">
          <button class="auth-back-btn" onclick="showFrontpage()">←</button>
          <span>Startseite</span>
        </div>
        <div class="auth-container">
          <h2>Login für Veranstalter:innen</h2>
          <form onsubmit="simulateAuth(); return false;">
            <div class="form-group"><label>E-Mail</label><input type="email" class="auth-input" required></div>
            <div class="form-group"><label>Passwort</label><input type="password" class="auth-input" required></div>
            <button type="submit" class="action-btn">Einloggen</button>
          </form>
          <div class="auth-links">Noch kein Account? <a href="#" onclick="showRegister()">Jetzt registrieren</a></div>
        </div>
      </div>

      <div id="view-organizer-dashboard">
        <div class="dashboard-header">
          <span style="font-weight:bold; font-size:1.1rem;">Veranstaltungsbereich</span>
          <button onclick="logout()"
            style="background:transparent; border:1px solid white; color:white; padding:5px 10px; border-radius:4px;">Logout</button>
        </div>
        <div class="dashboard-content">
          <!-- organizer content -->
          <div id="organizer-create-section" class="event-create-box">
            <h2>Neues Event anlegen</h2>
            <p style="color:#666;">Trage hier die Eckdaten für deine Veranstaltung ein.</p>
            <form id="create-event-form">
              <div class="form-group"><label>Titel der Veranstaltung</label><input type="text" id="evt-title"
                      class="auth-input" placeholder="z.B. Hof-Flohmarkt im Neuen Quartier" required></div>
              <div class="row-2">
                <div class="form-group"><label>Datum</label><input type="date" id="evt-date" class="auth-input"
                        required></div>
              </div>
              <div class="row-2">
                <div class="form-group"><label>Beginn</label><input type="time" id="evt-start"
                        class="auth-input" required></div>
                <div class="form-group"><label>Ende</label><input type="time" id="evt-end" class="auth-input"
                        required></div>
              </div>
              <button type="submit" class="action-btn">Event erstellen</button>
            </form>
          </div>

          <div id="dashboard-event-control">
            <div class="event-card-success" style="display:block;">
              <h3 style="margin-top:0; color:var(--success-color);">Aktiv: <span id="dash-evt-title"></span></h3>
              <p>Öffentlicher Link für Teilnehmer:</p>

              <div class="link-wrapper">
                <div class="link-box" id="evt-link-output"></div>
                <button class="copy-btn" onclick="copyLink()" title="Link kopieren">📋</button>
              </div>

              <div style="margin-top:15px;">
                <button onclick="goToAppFromDashboard()" class="action-btn"
                  style="background-color: var(--accent-color); color: var(--primary-color); width:auto; display:inline-block; padding:10px 20px;">Zur
                  Teilnehmer-Ansicht (Demo)</button>
              </div>
            </div>

            <div class="admin-table-container">
              <h3 style="margin-top:0; border-bottom:1px solid #eee; padding-bottom:10px;">Verwaltung: Angemeldete
                Spots</h3>
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Adresse / Spot</th>
                    <th>Beschreibung</th>
                    <th>Interne Daten (Privat)</th>
                    <th>Aktion</th>
                  </tr>
                </thead>
                <tbody id="admin-spot-list">
                </tbody>
              </table>

              <div style="margin-top:20px; text-align:right;">
                <button onclick="emailAllSpots()" class="action-btn"
                  style="width:auto; display:inline-block; background-color:#555;">📧 Alle Spots
                  kontaktieren</button>
              </div>
            </div>

          </div>

        </div>
      </div>

      <div id="frontpage">
        <div id="background-map"></div>
        <div class="overlay-container">
          <main class="content-box">
            <header>
              <h1>QuartierSpots</h1>
              <p>Die Plattform für Hof-Flohmärkte und Nachbarschafts-Events.</p>
            </header>
            <div class="menu-buttons">
              <div class="nav-group">
                <button class="fp-btn" onclick="goToApp('map')"><span class="btn-icon">🗺️</span> Karte
                  (Demo)</button>
                <button class="fp-btn" onclick="goToApp('list')"><span class="btn-icon">📋</span> Liste
                  (Demo)</button>
              </div>
              <button class="fp-btn btn-outline" onclick="location.href='mailto:info@werderau.de'"><span
                  class="btn-icon">✉️</span> Support kontaktieren</button>
            </div>
          </main>
          <footer class="fp-footer">
            <a onclick="showLogin()">Veranstalter-Login</a>
            <a onclick="showRegister()">Event anlegen (Registrieren)</a>
          </footer>
        </div>
      </div>

      <div id="app-view">
        <header class="app-header">
          <div style="font-size: 1.2rem; font-weight: bold;" id="app-title-display">2. Hof-Flohmarkt Werderau</div>
          <a class="back-link" onclick="showFrontpage()">🏠 Start</a>
        </header>

        <nav class="tabs">
          <button class="tab-button" data-target="list" onclick="switchTab('list')">Liste</button>
          <button class="tab-button" data-target="map" onclick="switchTab('map')">Karte</button>
          <button class="tab-button" data-target="form" onclick="switchTab('form')">Hinzufügen</button>
        </nav>

        <div class="main-content-area">

          <a href="mailto:info@werderau.de" class="fab-contact" title="Veranstalter:in kontaktieren">✉️</a>

          <div id="view-list">
            <div class="list-container">
              <h2 style="color:var(--primary-color); margin-top:0;">Alle Spots</h2>
              <div id="spot-list-main">Lade Daten...</div>
            </div>
          </div>

          <div id="view-map">
            <div id="app-map"></div>
            <button class="map-list-toggle" onclick="toggleMapList()"><span>☰</span> Liste</button>
            <div class="map-overlay-list" id="map-drawer">
              <div class="overlay-header"><strong>Spots in der Nähe</strong><button class="close-btn"
                      onclick="toggleMapList()">×</button></div>
              <div class="overlay-content">
                <div id="spot-list-overlay"></div>
              </div>
            </div>
          </div>

          <div id="view-form">
            <div class="form-container">
              <h3>Deinen Spot eintragen</h3>
              <form id="add-form">
                <div class="form-group"><label>Adresse</label><input type="text" id="address" class="auth-input"
                        placeholder="Straße, Hausnummer, Stadt" required></div>
                <div class="checkbox-group"><input type="checkbox" id="consent" required><label
                        for="consent">Ich bin damit einverstanden, dass meine Adresse öffentlich auf der Karte
                        angezeigt wird.</label></div>
                <div class="form-group"><label>Dein Name (Optional)</label><input type="text" id="name"
                        class="auth-input" placeholder="Name"></div>
                <div class="form-group"><label>Kontakt (Email/Telefon) (Optional)</label><input type="text"
                        id="contact" class="auth-input" placeholder="Email oder Telefonnummer"></div>
                <div class="hint-text">Hinweis: Name und E-Mail-Adresse werden nicht öffentlich angezeigt. Daten
                  dienen lediglich der Kontaktaufnahme seitens der Veranstalter:innen.</div>
                <div class="form-group"><label>Was verkaufst du?</label><textarea id="desc" rows="3"
                        placeholder="z.B. Kindersachen, Bücher..." required></textarea></div>
                <button type="submit" class="action-btn">Absenden</button>
              </form>
            </div>
          </div>

          <div id="view-delete">
            <div class="form-container" style="border: 1px solid var(--danger-color);">
              <h3 style="color: var(--danger-color);">Spot löschen</h3>
              <p>Bitte gib deine Daten ein, um deinen Spot zu verifizieren und zu löschen.</p>
              <form id="delete-form">
                <div class="form-group"><label>Adresse (exakt wie beim Eintrag)</label><input type="text"
                        id="del-address" class="auth-input" required></div>
                <div class="form-group"><label>Dein Name (wie beim Eintrag)</label><input type="text"
                        id="del-name" class="auth-input"></div>
                <div class="form-group"><label>Kontakt (wie beim Eintrag)</label><input type="text"
                        id="del-contact" class="auth-input"></div>
                <button type="submit" class="btn-confirm-delete">Endgültig löschen</button>
                <button type="button" class="action-btn" style="background:#ccc; margin-top:10px; color:#333;"
                    onclick="switchTab('list')">Abbrechen</button>
              </form>
            </div>
          </div>

        </div>
      </div>
    `;

    // Ensure Leaflet CSS is available
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet (CDN) if necessary, then load the legacy script we created under /js
    const loadLegacyScript = () => {
      // avoid loading twice
      if (document.getElementById('flohmarkt-legacy')) return;
      const s = document.createElement('script');
      s.id = 'flohmarkt-legacy';
      s.src = '/js/flohmarkt-legacy.js';
      s.defer = true;
      document.body.appendChild(s);
    };

    if (typeof (window as any).L === 'undefined') {
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      s.onload = () => loadLegacyScript();
      document.head.appendChild(s);
    } else {
      loadLegacyScript();
    }

  }, []);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      {/* The styles from the original HTML's <style> blocks are included inside the markup and will apply. */}
      <div ref={containerRef} />
    </div>
  );
}
