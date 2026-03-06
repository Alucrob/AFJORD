/* ═══════════════════════════════════════════════════
   WHATS-NEW — One-time post-update rebrand notice
   ═══════════════════════════════════════════════════ */

(function () {
  const SEEN_KEY = 'afjord_whats_new_seen_v1.0.8';

  function hasBeenSeen() {
    try { return localStorage.getItem(SEEN_KEY) === '1'; } catch { return true; }
  }

  function markSeen() {
    try { localStorage.setItem(SEEN_KEY, '1'); } catch {}
  }

  function show() {
    if (hasBeenSeen()) return;

    const overlay = document.createElement('div');
    overlay.id = 'whatsNewOverlay';
    overlay.innerHTML = `
<style>
#whatsNewOverlay {
  position: fixed; inset: 0; z-index: 9999;
  display: flex; align-items: center; justify-content: center;
  animation: wnFadeIn 0.35s ease both;
}
#whatsNewOverlay::before {
  content: '';
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.72);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
@keyframes wnFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes wnSlideUp {
  from { opacity: 0; transform: translateY(24px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes wnExit {
  from { opacity: 1; transform: scale(1); }
  to   { opacity: 0; transform: scale(0.96); }
}

.wn-card {
  position: relative; z-index: 1;
  width: 480px;
  background: #131315;
  border: 1px solid #2A2A34;
  border-radius: 16px;
  overflow: hidden;
  animation: wnSlideUp 0.4s cubic-bezier(0.34, 1.2, 0.64, 1) 0.1s both;
  box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(240,194,48,0.06);
}

/* Top accent bar */
.wn-topbar {
  height: 3px;
  background: linear-gradient(90deg, #F0C230, #FFD95C, #F0C230);
  background-size: 200% 100%;
  animation: wnShimmer 2.5s linear infinite;
}
@keyframes wnShimmer {
  0%   { background-position: 0% 0; }
  100% { background-position: 200% 0; }
}

.wn-body { padding: 32px 36px 28px; }

/* Header */
.wn-logo-row {
  display: flex; align-items: center; gap: 14px; margin-bottom: 24px;
}
.wn-logo {
  width: 52px; height: 52px;
  background: linear-gradient(135deg, #F0C230, #FFD95C);
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; font-weight: 700;
  color: #0A0A0B;
  font-family: 'IBM Plex Mono', monospace;
  box-shadow: 0 0 24px rgba(240,194,48,0.3);
  flex-shrink: 0;
}
.wn-badge {
  display: inline-block;
  padding: 2px 8px;
  background: rgba(240,194,48,0.12);
  border: 1px solid rgba(240,194,48,0.3);
  border-radius: 3px;
  font-size: 8px; font-weight: 700; letter-spacing: 2px;
  color: #F0C230; text-transform: uppercase;
  font-family: 'IBM Plex Mono', monospace;
  margin-bottom: 4px;
}
.wn-title {
  font-size: 20px; font-weight: 700;
  color: #E8E8EC; letter-spacing: 0.5px;
  font-family: 'IBM Plex Mono', monospace;
}

/* Divider */
.wn-divider {
  height: 1px; background: #1E1E24; margin-bottom: 20px;
}

/* Change list */
.wn-changes { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
.wn-change {
  display: flex; gap: 12px; align-items: flex-start;
}
.wn-change-icon {
  width: 32px; height: 32px; flex-shrink: 0;
  background: #1A1A1E;
  border: 1px solid #1E1E24;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px;
}
.wn-change-text { flex: 1; }
.wn-change-title {
  font-size: 12px; font-weight: 600; color: #E8E8EC;
  margin-bottom: 2px;
}
.wn-change-desc {
  font-size: 10.5px; color: #9898A8; line-height: 1.5;
}

/* Footer */
.wn-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 36px 20px;
  border-top: 1px solid #1E1E24;
  background: #0E0E10;
}
.wn-version {
  font-size: 9px; letter-spacing: 2px; color: #484858;
  font-family: 'IBM Plex Mono', monospace; text-transform: uppercase;
}
.wn-dismiss {
  padding: 10px 24px;
  background: linear-gradient(135deg, #F0C230, #FFD95C);
  border: none; border-radius: 7px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
  text-transform: uppercase; color: #0A0A0B;
  cursor: pointer; transition: all 200ms;
  box-shadow: 0 4px 16px rgba(240,194,48,0.3);
}
.wn-dismiss:hover {
  box-shadow: 0 6px 24px rgba(240,194,48,0.5);
  transform: translateY(-1px);
}
.wn-dismiss:active { transform: translateY(0); }

/* Corner brackets on overlay */
.wn-corner {
  position: absolute; width: 18px; height: 18px;
  border-color: rgba(240,194,48,0.15); border-style: solid;
  z-index: 2;
}
.wn-corner-tl { top: 20px; left: 20px; border-width: 1px 0 0 1px; }
.wn-corner-tr { top: 20px; right: 20px; border-width: 1px 1px 0 0; }
.wn-corner-bl { bottom: 20px; left: 20px; border-width: 0 0 1px 1px; }
.wn-corner-br { bottom: 20px; right: 20px; border-width: 0 1px 1px 0; }
</style>

<div class="wn-corner wn-corner-tl"></div>
<div class="wn-corner wn-corner-tr"></div>
<div class="wn-corner wn-corner-bl"></div>
<div class="wn-corner wn-corner-br"></div>

<div class="wn-card">
  <div class="wn-topbar"></div>
  <div class="wn-body">
    <div class="wn-logo-row">
      <div class="wn-logo">AF</div>
      <div>
        <div class="wn-badge">Rebranded</div>
        <div class="wn-title">Welcome to AFJORD</div>
      </div>
    </div>
    <div class="wn-divider"></div>
    <div class="wn-changes">
      <div class="wn-change">
        <div class="wn-change-icon">&#9670;</div>
        <div class="wn-change-text">
          <div class="wn-change-title">New Identity</div>
          <div class="wn-change-desc">ROM Scraper is now AFJORD — Anti-Fjord, Like Get-Arounds, Twists & Turns. Same tool, sharper edge.</div>
        </div>
      </div>
      <div class="wn-change">
        <div class="wn-change-icon">&#9632;</div>
        <div class="wn-change-text">
          <div class="wn-change-title">Black &amp; Yellow Stealth Theme</div>
          <div class="wn-change-desc">Full UI overhaul with a new dark stealth aesthetic — radar loading screen, grid backgrounds, and yellow accents throughout.</div>
        </div>
      </div>
      <div class="wn-change">
        <div class="wn-change-icon">&#9650;</div>
        <div class="wn-change-text">
          <div class="wn-change-title">ROMAGENT Stealth Engine</div>
          <div class="wn-change-desc">15 anti-blocking methods with dynamic orchestration. The agent monitors failures and auto-escalates strategies in real-time.</div>
        </div>
      </div>
      <div class="wn-change">
        <div class="wn-change-icon">&#9679;</div>
        <div class="wn-change-text">
          <div class="wn-change-title">Modular Architecture</div>
          <div class="wn-change-desc">Fully rebuilt UI with external modules, settings dashboard, stealth configuration panel, and live activity log.</div>
        </div>
      </div>
    </div>
  </div>
  <div class="wn-footer">
    <div class="wn-version">AFJORD v${window.appVersion || '1.0.8'}</div>
    <button class="wn-dismiss" id="wnDismiss">Let&rsquo;s Go &rarr;</button>
  </div>
</div>`;

    document.body.appendChild(overlay);

    document.getElementById('wnDismiss').addEventListener('click', dismiss);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) dismiss();
    });

    function dismiss() {
      markSeen();
      overlay.style.animation = 'wnExit 0.25s ease forwards';
      setTimeout(() => overlay.remove(), 260);
    }
  }

  window.WhatsNew = { show };
})();
