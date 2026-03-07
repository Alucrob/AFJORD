/*
   SETTINGS PAGE - Dashboard with Stealth Module Cards
*/

let stealthConfig = null;
let agentMode = false;
let appSettings = null;

const DEFAULT_APP_SETTINGS = {
  app: {
    autoCheckUpdates: true,
    minimizeToTray: true,
    openDevToolsOnLaunch: false,
    playSounds: true,
  },
  defaults: {
    depth: 0,
    delay: 0.5,
    maxFiles: 200,
    timeout: 10,
  },
  connection: {
    proxyEnabled: false,
    proxyType: 'http',
    proxyHost: '',
    proxyUsername: '',
    proxyPassword: '',
    captchaService: 'none',
    captchaApiKey: '',
    rateLimitConcurrent: 3,
    rateLimitPerMinute: 30,
  },
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function mergeDeep(base, override) {
  const out = isPlainObject(base) ? { ...base } : {};
  if (!isPlainObject(override)) return out;
  for (const [key, value] of Object.entries(override)) {
    if (isPlainObject(value) && isPlainObject(out[key])) {
      out[key] = mergeDeep(out[key], value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function loadAppSettings() {
  if (appSettings) return appSettings;
  appSettings = mergeDeep(clone(DEFAULT_APP_SETTINGS), window._appSettings || {});
  return appSettings;
}

function getAppSettings() {
  return loadAppSettings();
}

async function persistAppSettings() {
  if (!window.romAPI || !window.romAPI.updateAppSettings) return;
  try {
    const saved = await window.romAPI.updateAppSettings(appSettings);
    appSettings = mergeDeep(clone(DEFAULT_APP_SETTINGS), saved || {});
  } catch {
    // Keep local state if IPC save fails.
  }
}

function getAppSetting(path, fallback) {
  const keys = path.split('.');
  let cursor = loadAppSettings();
  for (const key of keys) {
    if (!isPlainObject(cursor) || !(key in cursor)) return fallback;
    cursor = cursor[key];
  }
  return cursor;
}

function setAppSetting(path, value) {
  const keys = path.split('.');
  const settings = loadAppSettings();
  let cursor = settings;
  for (let i = 0; i < keys.length - 1; i += 1) {
    const key = keys[i];
    if (!isPlainObject(cursor[key])) cursor[key] = {};
    cursor = cursor[key];
  }
  cursor[keys[keys.length - 1]] = value;
  void persistAppSettings();
}

function loadStealthConfig() {
  if (stealthConfig) return stealthConfig;
  stealthConfig = JSON.parse(JSON.stringify(window._stealthDefaults || {}));
  agentMode = stealthConfig.agentMode || false;
  return stealthConfig;
}

function getStealthConfig() {
  return stealthConfig;
}

function setMethodEnabled(methodId, enabled) {
  if (stealthConfig && stealthConfig.methods[methodId]) {
    stealthConfig.methods[methodId].enabled = enabled;
  }
  if (window.romAPI && window.romAPI.updateStealthConfig) {
    window.romAPI.updateStealthConfig(stealthConfig);
  }
}

function setAgentMode(enabled) {
  agentMode = enabled;
  if (stealthConfig) stealthConfig.agentMode = enabled;

  document.querySelectorAll('.module-card').forEach(card => {
    card.classList.toggle('disabled', enabled);
  });

  const banner = document.getElementById('agentBanner');
  if (banner) banner.classList.toggle('visible', enabled);

  if (window.romAPI && window.romAPI.updateStealthConfig) {
    window.romAPI.updateStealthConfig(stealthConfig);
  }
}

function bindFlagToggle(container, selector, settingPath, onAfterToggle) {
  const el = container.querySelector(selector);
  if (!el) return;
  el.addEventListener('click', () => {
    const isOn = el.classList.toggle('on');
    setAppSetting(settingPath, isOn);
    if (onAfterToggle) onAfterToggle(isOn);
  });
}

function bindNumberInput(container, selector, settingPath, fallback, min, max) {
  const input = container.querySelector(selector);
  if (!input) return;
  const commit = () => {
    let next = Number(input.value);
    if (!Number.isFinite(next)) next = fallback;
    if (typeof min === 'number') next = Math.max(min, next);
    if (typeof max === 'number') next = Math.min(max, next);
    input.value = String(next);
    setAppSetting(settingPath, next);
  };
  input.addEventListener('change', commit);
  input.addEventListener('blur', commit);
}

function bindTextInput(container, selector, settingPath) {
  const input = container.querySelector(selector);
  if (!input) return;
  input.addEventListener('change', () => {
    setAppSetting(settingPath, input.value || '');
  });
  input.addEventListener('blur', () => {
    setAppSetting(settingPath, input.value || '');
  });
}

function bindSelectInput(container, selector, settingPath) {
  const input = container.querySelector(selector);
  if (!input) return;
  input.addEventListener('change', () => {
    setAppSetting(settingPath, input.value);
  });
}

function renderStealthTab(container) {
  const cfg = loadStealthConfig();
  const methods = cfg.methods || {};
  const methodEntries = Object.entries(methods);

  container.innerHTML = '';

  const agentSection = document.createElement('div');
  agentSection.style.cssText = 'margin-bottom:20px;';
  agentSection.innerHTML = `
    <div class="agent-banner ${agentMode ? 'visible' : ''}" id="agentBanner">
      <div class="agent-banner-icon">&#x1F916;</div>
      <div class="agent-banner-text">
        <div class="agent-banner-title">AFIND Active</div>
        <div class="agent-banner-desc">The agent is dynamically controlling all stealth methods. Manual toggles are disabled.</div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:12px;padding:8px 0;">
      <div class="toggle-wrap ${agentMode ? 'on' : ''}" id="agentModeToggle">
        <div class="toggle ${agentMode ? 'on' : ''}"></div>
        <span style="font-weight:600;letter-spacing:0.5px;">AFIND Mode</span>
      </div>
      <span style="font-size:10px;color:var(--text-dim);">When enabled, the agent dynamically controls all stealth methods</span>
    </div>`;
  container.appendChild(agentSection);

  const agentToggle = agentSection.querySelector('#agentModeToggle');
  agentToggle.addEventListener('click', () => {
    const isOn = agentToggle.classList.toggle('on');
    agentToggle.querySelector('.toggle').classList.toggle('on', isOn);
    setAgentMode(isOn);
  });

  const grid = document.createElement('div');
  grid.style.cssText = 'display:flex;flex-direction:column;gap:8px;';

  if (!methodEntries.length) {
    const warn = document.createElement('div');
    warn.className = 'card';
    warn.innerHTML = `
      <div class="card-hdr">Stealth Modules Unavailable</div>
      <div style="font-size:11px;line-height:1.7;color:var(--text-sec);">
        No stealth methods were loaded. This usually means
        <code>config/stealth-defaults.json</code> is missing from the build package.
      </div>`;
    container.appendChild(warn);
    return;
  }

  methodEntries.forEach(([id, mod]) => {
    const card = window.ModuleCard.create(
      { id, name: mod.name, desc: mod.desc, icon: mod.icon, enabled: mod.enabled },
      {
        disabled: agentMode,
        onToggle: (methodId, enabled) => setMethodEnabled(methodId, enabled),
        onGear: (methodId) => {
          window.ActivityLog.addLog('INFO', `Opening settings for: ${methods[methodId]?.name || methodId}`, 'lvl-info');
        },
      }
    );
    grid.appendChild(card);
  });

  container.appendChild(grid);
}

function renderGeneralTab(container) {
  const appCfg = getAppSetting('app', DEFAULT_APP_SETTINGS.app);
  const defaultsCfg = getAppSetting('defaults', DEFAULT_APP_SETTINGS.defaults);

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:16px;">
      <div class="card">
        <div class="card-hdr">Application</div>
        <div class="flags-grid">
          <div class="flag-item ${appCfg.autoCheckUpdates ? 'on' : ''}" id="settAutoUpdate"><div class="toggle"></div><span>Auto-check for updates</span></div>
          <div class="flag-item ${appCfg.minimizeToTray ? 'on' : ''}" id="settMinimizeTray"><div class="toggle"></div><span>Minimize to system tray</span></div>
          <div class="flag-item ${appCfg.openDevToolsOnLaunch ? 'on' : ''}" id="settDevTools"><div class="toggle"></div><span>Show DevTools on launch</span></div>
          <div class="flag-item ${appCfg.playSounds ? 'on' : ''}" id="settSounds"><div class="toggle"></div><span>Play notification sounds</span></div>
        </div>
      </div>
      <div class="card">
        <div class="card-hdr">Default Scraper Settings</div>
        <div class="opts-grid">
          <div class="spin-grp"><label class="field-lbl">Default Depth</label><input class="spin-inp" id="settDefaultDepth" type="number" value="${defaultsCfg.depth}" min="0" max="5"></div>
          <div class="spin-grp"><label class="field-lbl">Default Delay</label><input class="spin-inp" id="settDefaultDelay" type="number" value="${defaultsCfg.delay}" min="0" max="30" step="0.1"></div>
          <div class="spin-grp"><label class="field-lbl">Default Max Files</label><input class="spin-inp" id="settDefaultMaxFiles" type="number" value="${defaultsCfg.maxFiles}" min="1" max="10000"></div>
          <div class="spin-grp"><label class="field-lbl">Default Timeout</label><input class="spin-inp" id="settDefaultTimeout" type="number" value="${defaultsCfg.timeout}" min="5" max="60"></div>
        </div>
      </div>
      <div class="card">
        <div class="card-hdr">Data</div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-secondary btn-sm" id="settClearLogHistory">CLEAR LOG HISTORY</button>
          <button class="btn btn-secondary btn-sm" id="settResetAll">RESET ALL SETTINGS</button>
        </div>
      </div>
    </div>`;

  bindFlagToggle(container, '#settAutoUpdate', 'app.autoCheckUpdates');
  bindFlagToggle(container, '#settMinimizeTray', 'app.minimizeToTray');
  bindFlagToggle(container, '#settDevTools', 'app.openDevToolsOnLaunch');
  bindFlagToggle(container, '#settSounds', 'app.playSounds');

  bindNumberInput(container, '#settDefaultDepth', 'defaults.depth', 0, 0, 5);
  bindNumberInput(container, '#settDefaultDelay', 'defaults.delay', 0.5, 0, 30);
  bindNumberInput(container, '#settDefaultMaxFiles', 'defaults.maxFiles', 200, 1, 10000);
  bindNumberInput(container, '#settDefaultTimeout', 'defaults.timeout', 10, 5, 60);

  const clearBtn = container.querySelector('#settClearLogHistory');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (window.ActivityLog && window.ActivityLog.clearLog) {
        window.ActivityLog.clearLog();
      }
    });
  }

  const resetBtn = container.querySelector('#settResetAll');
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      if (window.romAPI && window.romAPI.resetAppSettings) {
        try {
          const reset = await window.romAPI.resetAppSettings();
          appSettings = mergeDeep(clone(DEFAULT_APP_SETTINGS), reset || {});
        } catch {
          appSettings = clone(DEFAULT_APP_SETTINGS);
        }
      } else {
        appSettings = clone(DEFAULT_APP_SETTINGS);
      }

      if (window._stealthDefaults) {
        stealthConfig = clone(window._stealthDefaults);
        agentMode = !!stealthConfig.agentMode;
        if (window.romAPI && window.romAPI.updateStealthConfig) {
          window.romAPI.updateStealthConfig(stealthConfig);
        }
      }

      renderGeneralTab(container);
    });
  }
}

function renderConnectionTab(container) {
  const conn = getAppSetting('connection', DEFAULT_APP_SETTINGS.connection);
  const proxyEnabled = !!conn.proxyEnabled;

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:16px;">
      <div class="card">
        <div class="card-hdr">Proxy Configuration</div>
        <div style="margin-bottom:12px;">
          <div class="flag-item ${proxyEnabled ? 'on' : ''}" id="settProxy"><div class="toggle"></div><span>Enable proxy</span></div>
        </div>
        <div id="proxyFields" style="display:flex;flex-direction:column;gap:8px;opacity:${proxyEnabled ? '1' : '0.4'};pointer-events:${proxyEnabled ? 'auto' : 'none'};">
          <div><label class="field-lbl">Proxy Type</label>
            <select class="inp" id="settProxyType" style="cursor:pointer;background:var(--bg-input)">
              <option value="http"${conn.proxyType === 'http' ? ' selected' : ''}>HTTP</option>
              <option value="socks5"${conn.proxyType === 'socks5' ? ' selected' : ''}>SOCKS5</option>
              <option value="rotating"${conn.proxyType === 'rotating' ? ' selected' : ''}>Rotating (API)</option>
            </select>
          </div>
          <div><label class="field-lbl">Proxy Host</label><input class="inp" id="settProxyHost" type="text" value="${escapeHtml(conn.proxyHost)}" placeholder="proxy.example.com:8080"></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <div><label class="field-lbl">Username</label><input class="inp" id="settProxyUsername" type="text" value="${escapeHtml(conn.proxyUsername)}" placeholder="(optional)"></div>
            <div><label class="field-lbl">Password</label><input class="inp" id="settProxyPassword" type="password" value="${escapeHtml(conn.proxyPassword)}" placeholder="(optional)"></div>
          </div>
          <button class="btn btn-secondary btn-sm" style="align-self:flex-start;">TEST CONNECTION</button>
        </div>
      </div>
      <div class="card">
        <div class="card-hdr">Captcha Solver API</div>
        <div><label class="field-lbl">Service</label>
          <select class="inp" id="settCaptchaService" style="cursor:pointer;background:var(--bg-input)">
            <option value="none"${conn.captchaService === 'none' ? ' selected' : ''}>None (disabled)</option>
            <option value="2captcha"${conn.captchaService === '2captcha' ? ' selected' : ''}>2Captcha</option>
            <option value="anticaptcha"${conn.captchaService === 'anticaptcha' ? ' selected' : ''}>Anti-Captcha</option>
          </select>
        </div>
        <div style="margin-top:8px;"><label class="field-lbl">API Key</label><input class="inp" id="settCaptchaApiKey" type="password" value="${escapeHtml(conn.captchaApiKey)}" placeholder="Enter your API key"></div>
      </div>
      <div class="card">
        <div class="card-hdr">Rate Limiting</div>
        <div class="opts-grid" style="grid-template-columns:1fr 1fr;">
          <div class="spin-grp"><label class="field-lbl">Max Concurrent</label><input class="spin-inp" id="settRateConcurrent" type="number" value="${conn.rateLimitConcurrent}" min="1" max="20"></div>
          <div class="spin-grp"><label class="field-lbl">Requests/min</label><input class="spin-inp" id="settRatePerMinute" type="number" value="${conn.rateLimitPerMinute}" min="1" max="200"></div>
        </div>
      </div>
    </div>`;

  const proxyToggle = container.querySelector('#settProxy');
  const proxyFields = container.querySelector('#proxyFields');
  if (proxyToggle && proxyFields) {
    proxyToggle.addEventListener('click', () => {
      const isOn = proxyToggle.classList.toggle('on');
      proxyFields.style.opacity = isOn ? '1' : '0.4';
      proxyFields.style.pointerEvents = isOn ? 'auto' : 'none';
      setAppSetting('connection.proxyEnabled', isOn);
    });
  }

  bindSelectInput(container, '#settProxyType', 'connection.proxyType');
  bindTextInput(container, '#settProxyHost', 'connection.proxyHost');
  bindTextInput(container, '#settProxyUsername', 'connection.proxyUsername');
  bindTextInput(container, '#settProxyPassword', 'connection.proxyPassword');
  bindSelectInput(container, '#settCaptchaService', 'connection.captchaService');
  bindTextInput(container, '#settCaptchaApiKey', 'connection.captchaApiKey');
  bindNumberInput(container, '#settRateConcurrent', 'connection.rateLimitConcurrent', 3, 1, 20);
  bindNumberInput(container, '#settRatePerMinute', 'connection.rateLimitPerMinute', 30, 1, 200);
}

function render(container) {
  loadAppSettings();

  container.innerHTML = `
<div class="page-enter" style="flex:1;display:flex;flex-direction:column;overflow:hidden;">
  <div class="settings-tabs">
    <div class="settings-tab active" data-tab="general">General</div>
    <div class="settings-tab" data-tab="connection">Connection</div>
    <div class="settings-tab" data-tab="stealth">Stealth &amp; Anti-Blocking</div>
  </div>
  <div class="settings-content" id="settingsContent"></div>
</div>`;

  const content = container.querySelector('#settingsContent');
  const tabs = container.querySelectorAll('.settings-tab');

  function switchTab(tabName) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
    if (tabName === 'general') renderGeneralTab(content);
    else if (tabName === 'connection') renderConnectionTab(content);
    else if (tabName === 'stealth') renderStealthTab(content);
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  switchTab('general');
}

window.SettingsPage = {
  render,
  getStealthConfig,
  loadStealthConfig,
  setAgentMode,
  getAppSettings,
};
