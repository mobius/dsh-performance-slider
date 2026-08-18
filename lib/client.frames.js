/*
 * dsh-performance-slider — DSH browser/client half, local-frames edition.
 *
 * Same Codex-style 6-level performance slider, but backgrounds are the 31
 * cutout frames served by the plugin's host half from
 * `/plugins/dsh-performance-slider/frames/frame-00.png` … `frame-30.png`.
 *
 * Interaction matches demo/index.html: drag anywhere on the bar, the nearest
 * frame is shown while dragging, and on release the slider snaps to the
 * nearest of the 6 model+reasoning levels (frames 0/6/12/18/24/30).
 */
window.__ModuleLoader__.load({
  id: 'dsh-performance-slider',
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

    const React = require('react');
    const jsxRuntime = require('react/jsx-runtime');
    const jsx = jsxRuntime.jsx;
    const jsxs = jsxRuntime.jsxs;

    const PLUGIN_ID = 'dsh-performance-slider';
    const NS = 'dshps.performance';
    const STORAGE_KEY = 'dsh-performance-slider.level.v1';
    const COOKIE_KEY = 'dshps_level';
    const FRAME_COUNT = 31;
    const LEVEL_STEP = (FRAME_COUNT - 1) / 5; // 6
    const FRAME_URL_PREFIX = '/plugins/dsh-performance-slider/frames';
    const SCRIM = 'linear-gradient(180deg, rgba(7,9,14,0.30), rgba(7,9,14,0.52))';

    /* ------------------------------------------------------------------ */
    /* Level presets                                                        */
    /* ------------------------------------------------------------------ */

    const LEVELS = [
      {
        id: 'flash-off',
        modelShort: 'Flash',
        models: ['deepseek-v4-flash', 'deepseek-v4-flash-0731', 'deepseek-chat'],
        modelClass: 'flash',
        effort: 'off',
        effortFallbacks: ['off'],
        tokens: {
          '--dsw-alias-bg-base': { light: 'rgba(238,245,255,0.38)', dark: 'rgba(8,17,32,0.22)' },
          '--dsw-alias-bg-layer-1': { light: 'rgba(255,255,255,0.46)', dark: 'rgba(13,24,45,0.42)' },
          '--dsw-alias-bg-layer-2': { light: 'rgba(255,255,255,0.54)', dark: 'rgba(18,31,57,0.50)' },
          '--dsw-specific-sidebar-fill': { light: 'rgba(230,240,255,0.44)', dark: 'rgba(7,15,30,0.38)' },
          '--dsw-alias-brand-primary': { light: '#2f6bff', dark: '#4d7cfe' },
        },
        aura: {
          light: 'radial-gradient(1100px 640px at 85% -8%, rgba(47,107,255,0.20), transparent 62%), radial-gradient(900px 620px at -8% 108%, rgba(56,189,248,0.16), transparent 55%), linear-gradient(180deg, #eef5ff 0%, #e6efff 100%)',
          dark: 'radial-gradient(1100px 640px at 85% -8%, rgba(77,124,254,0.26), transparent 62%), radial-gradient(900px 620px at -8% 108%, rgba(56,189,248,0.14), transparent 55%), linear-gradient(180deg, #081120 0%, #0a1326 100%)',
        },
      },
      {
        id: 'flash-low',
        modelShort: 'Flash',
        models: ['deepseek-v4-flash', 'deepseek-v4-flash-0731', 'deepseek-chat'],
        modelClass: 'flash',
        effort: 'low',
        effortFallbacks: ['low', 'minimal', 'medium'],
        tokens: {
          '--dsw-alias-bg-base': { light: 'rgba(233,251,250,0.38)', dark: 'rgba(6,23,26,0.22)' },
          '--dsw-alias-bg-layer-1': { light: 'rgba(255,255,255,0.46)', dark: 'rgba(8,29,34,0.42)' },
          '--dsw-alias-bg-layer-2': { light: 'rgba(255,255,255,0.54)', dark: 'rgba(11,37,43,0.50)' },
          '--dsw-specific-sidebar-fill': { light: 'rgba(225,248,246,0.44)', dark: 'rgba(5,20,24,0.38)' },
          '--dsw-alias-brand-primary': { light: '#0d9f93', dark: '#23c9b0' },
        },
        aura: {
          light: 'radial-gradient(1100px 640px at 85% -8%, rgba(13,159,147,0.20), transparent 62%), radial-gradient(900px 620px at -8% 108%, rgba(45,212,191,0.16), transparent 55%), linear-gradient(180deg, #e9fbfa 0%, #e2f6f4 100%)',
          dark: 'radial-gradient(1100px 640px at 85% -8%, rgba(35,201,176,0.22), transparent 62%), radial-gradient(900px 620px at -8% 108%, rgba(14,116,144,0.20), transparent 55%), linear-gradient(180deg, #06171a 0%, #082127 100%)',
        },
      },
      {
        id: 'flash-max',
        modelShort: 'Flash',
        models: ['deepseek-v4-flash', 'deepseek-v4-flash-0731', 'deepseek-chat'],
        modelClass: 'flash',
        effort: 'max',
        effortFallbacks: ['max', 'xhigh', 'high'],
        tokens: {
          '--dsw-alias-bg-base': { light: 'rgba(245,242,255,0.38)', dark: 'rgba(13,10,29,0.22)' },
          '--dsw-alias-bg-layer-1': { light: 'rgba(255,255,255,0.46)', dark: 'rgba(22,17,46,0.42)' },
          '--dsw-alias-bg-layer-2': { light: 'rgba(255,255,255,0.54)', dark: 'rgba(28,21,58,0.50)' },
          '--dsw-specific-sidebar-fill': { light: 'rgba(240,236,255,0.44)', dark: 'rgba(14,10,32,0.38)' },
          '--dsw-alias-brand-primary': { light: '#7446e8', dark: '#9673f6' },
        },
        aura: {
          light: 'radial-gradient(1100px 640px at 85% -8%, rgba(116,70,232,0.20), transparent 62%), radial-gradient(900px 620px at -8% 108%, rgba(192,132,252,0.18), transparent 55%), linear-gradient(180deg, #f5f2ff 0%, #efe8ff 100%)',
          dark: 'radial-gradient(1100px 640px at 85% -8%, rgba(150,115,246,0.24), transparent 62%), radial-gradient(900px 620px at -8% 108%, rgba(217,70,239,0.16), transparent 55%), linear-gradient(180deg, #0d0a1d 0%, #130e2b 100%)',
        },
      },
      {
        id: 'pro-off',
        modelShort: 'Pro',
        models: ['deepseek-v4-pro', 'deepseek-reasoner'],
        modelClass: 'pro',
        effort: 'off',
        effortFallbacks: ['off'],
        tokens: {
          '--dsw-alias-bg-base': { light: 'rgba(236,253,245,0.38)', dark: 'rgba(7,22,15,0.22)' },
          '--dsw-alias-bg-layer-1': { light: 'rgba(255,255,255,0.46)', dark: 'rgba(10,31,23,0.42)' },
          '--dsw-alias-bg-layer-2': { light: 'rgba(255,255,255,0.54)', dark: 'rgba(13,39,29,0.50)' },
          '--dsw-specific-sidebar-fill': { light: 'rgba(224,248,238,0.44)', dark: 'rgba(6,23,16,0.38)' },
          '--dsw-alias-brand-primary': { light: '#0f9d67', dark: '#2ec98b' },
        },
        aura: {
          light: 'radial-gradient(1100px 640px at 85% -8%, rgba(15,157,103,0.20), transparent 62%), radial-gradient(900px 620px at -8% 108%, rgba(74,222,128,0.18), transparent 55%), linear-gradient(180deg, #ecfdf5 0%, #e2f9ee 100%)',
          dark: 'radial-gradient(1100px 640px at 85% -8%, rgba(46,201,139,0.22), transparent 62%), radial-gradient(900px 620px at -8% 108%, rgba(5,150,105,0.18), transparent 55%), linear-gradient(180deg, #07160f 0%, #092018 100%)',
        },
      },
      {
        id: 'pro-high',
        modelShort: 'Pro',
        models: ['deepseek-v4-pro', 'deepseek-reasoner'],
        modelClass: 'pro',
        effort: 'high',
        effortFallbacks: ['high', 'xhigh', 'max', 'medium'],
        tokens: {
          '--dsw-alias-bg-base': { light: 'rgba(255,249,235,0.38)', dark: 'rgba(26,16,8,0.22)' },
          '--dsw-alias-bg-layer-1': { light: 'rgba(255,255,255,0.46)', dark: 'rgba(34,23,12,0.42)' },
          '--dsw-alias-bg-layer-2': { light: 'rgba(255,255,255,0.54)', dark: 'rgba(43,29,15,0.50)' },
          '--dsw-specific-sidebar-fill': { light: 'rgba(254,242,219,0.44)', dark: 'rgba(26,16,8,0.38)' },
          '--dsw-alias-brand-primary': { light: '#d97b06', dark: '#f5a524' },
        },
        aura: {
          light: 'radial-gradient(1100px 640px at 85% -8%, rgba(217,123,6,0.22), transparent 62%), radial-gradient(900px 620px at -8% 108%, rgba(251,191,36,0.20), transparent 55%), linear-gradient(180deg, #fff9eb 0%, #fff1d8 100%)',
          dark: 'radial-gradient(1100px 640px at 85% -8%, rgba(245,165,36,0.22), transparent 62%), radial-gradient(900px 620px at -8% 108%, rgba(217,119,6,0.20), transparent 55%), linear-gradient(180deg, #1a1008 0%, #221708 100%)',
        },
      },
      {
        id: 'pro-max',
        modelShort: 'Pro',
        models: ['deepseek-v4-pro', 'deepseek-reasoner'],
        modelClass: 'pro',
        effort: 'max',
        effortFallbacks: ['max', 'xhigh', 'high'],
        tokens: {
          '--dsw-alias-bg-base': { light: 'rgba(255,243,246,0.38)', dark: 'rgba(28,8,14,0.22)' },
          '--dsw-alias-bg-layer-1': { light: 'rgba(255,255,255,0.46)', dark: 'rgba(39,14,24,0.42)' },
          '--dsw-alias-bg-layer-2': { light: 'rgba(255,255,255,0.54)', dark: 'rgba(48,18,30,0.50)' },
          '--dsw-specific-sidebar-fill': { light: 'rgba(255,229,235,0.44)', dark: 'rgba(29,8,17,0.38)' },
          '--dsw-alias-brand-primary': { light: '#e11d48', dark: '#f7597c' },
        },
        aura: {
          light: 'radial-gradient(1100px 640px at 85% -8%, rgba(225,29,72,0.20), transparent 62%), radial-gradient(900px 620px at -8% 108%, rgba(251,113,133,0.20), transparent 55%), linear-gradient(180deg, #fff3f6 0%, #ffe6ec 100%)',
          dark: 'radial-gradient(1100px 640px at 85% -8%, rgba(247,89,124,0.24), transparent 62%), radial-gradient(900px 620px at -8% 108%, rgba(190,18,60,0.22), transparent 55%), linear-gradient(180deg, #1c080e 0%, #270b16 100%)',
        },
      },
    ];

    /* ------------------------------------------------------------------ */
    /* Helpers                                                              */
    /* ------------------------------------------------------------------ */

    function frameForLevel(level) {
      return Math.round(level * LEVEL_STEP);
    }

    function levelForFrame(frame) {
      return Math.max(0, Math.min(LEVELS.length - 1, Math.round(frame / LEVEL_STEP)));
    }

    function frameUrl(frame) {
      return `${FRAME_URL_PREFIX}/frame-${String(frame).padStart(2, '0')}.png`;
    }

    function readCookie(name) {
      if (typeof document === 'undefined' || !document.cookie) return null;
      const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
      return match ? decodeURIComponent(match[1]) : null;
    }

    function readStoredLevel() {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored !== null) return Math.max(0, Math.min(LEVELS.length - 1, Number(stored) || 0));
      } catch {
        /* storage is best-effort only */
      }
      const cookie = readCookie(COOKIE_KEY);
      return cookie === null ? 0 : Math.max(0, Math.min(LEVELS.length - 1, Number(cookie) || 0));
    }

    function persistLevel(index) {
      try {
        window.localStorage.setItem(STORAGE_KEY, String(index));
      } catch {
        /* storage is best-effort only */
      }
      try {
        document.cookie = `${COOKIE_KEY}=${String(index)}; path=/; max-age=31536000; samesite=lax`;
      } catch {
        /* cookie is best-effort only */
      }
    }

    /* ------------------------------------------------------------------ */
    /* Background / theme                                                   */
    /* ------------------------------------------------------------------ */

    let backdropDisposer = null;

    function applyFrameBackdrop(theme, frame) {
      const safeFrame = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(frame)));
      const level = levelForFrame(safeFrame);
      const preset = LEVELS[level];
      const tokens = {};
      for (const [name, pair] of Object.entries(preset.tokens)) {
        tokens[name] = { light: pair.light, dark: pair.dark };
      }

      if (backdropDisposer) backdropDisposer();
      backdropDisposer = theme.overrideTokens(PLUGIN_ID, tokens);

      if (document.body) {
        const dark = document.body.hasAttribute('data-ds-dark-theme');
        const aura = dark ? preset.aura.dark : preset.aura.light;
        document.body.dataset.dshPerformanceLevel = String(level);
        document.body.dataset.dshPerformancePreset = preset.id;
        document.body.dataset.dshPerformanceFrame = String(safeFrame);
        document.body.style.backgroundImage = `${SCRIM}, url("${frameUrl(safeFrame)}"), ${aura}`;
        document.body.style.backgroundPosition = 'center top, center bottom, center top';
        document.body.style.backgroundSize = 'cover, contain, cover';
        document.body.style.backgroundRepeat = 'no-repeat, no-repeat, no-repeat';
      }
    }

    function clearBackdrop() {
      if (backdropDisposer) {
        backdropDisposer();
        backdropDisposer = null;
      }
      if (document.body) {
        delete document.body.dataset.dshPerformanceLevel;
        delete document.body.dataset.dshPerformancePreset;
        delete document.body.dataset.dshPerformanceFrame;
        document.body.style.backgroundImage = '';
        document.body.style.backgroundPosition = '';
        document.body.style.backgroundSize = '';
        document.body.style.backgroundRepeat = '';
      }
    }

    /* ------------------------------------------------------------------ */
    /* Styles                                                               */
    /* ------------------------------------------------------------------ */

    let portraitStyleTag = null;

    function buildStylesheet() {
      return `
.dshps_dock {
  box-sizing: border-box;
  width: 100%;
  max-width: var(--dsh-composer-card-max-width, 760px);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 2px 0;
}
.dshps_header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  padding: 0 4px;
}
.dshps_title {
  color: var(--dsw-alias-label-tertiary);
  font-size: 11px;
  line-height: 16px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.dshps_summary {
  min-width: 0;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  line-height: 18px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dshps_perfbar {
  position: relative;
  width: 100%;
  height: 32px;
  display: flex;
  align-items: center;
  border-radius: 999px;
  cursor: pointer;
  touch-action: none;
  outline: none;
  background: linear-gradient(90deg, #4d7cfe, #23c9b0 20%, #9673f6 40%, #2ec98b 60%, #f5a524 80%, #f7597c 100%);
  border: 1px solid var(--dsw-alias-border-l2, rgba(255,255,255,0.12));
}
.dshps_perfbar:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary); outline-offset: 2px; }
.dshps_perfbar_thumb {
  position: absolute;
  top: 50%;
  left: 0%;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #fff;
  border: 3px solid var(--dsw-alias-brand-primary);
  box-shadow: 0 2px 10px rgba(0,0,0,.35);
  transform: translate(-50%, -50%);
  pointer-events: none;
}
.dshps_ticks {
  display: grid;
  grid-template-columns: 0.5fr 1fr 1fr 1fr 1fr 0.5fr;
  gap: 4px;
  margin-top: 8px;
}
.dshps_tick {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  border: 0;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  cursor: pointer;
  padding: 2px 0;
}
.dshps_tick:hover { color: var(--dsw-alias-label-primary); }
.dshps_tick[data-active="true"] { color: var(--dsw-alias-brand-primary); }
.dshps_tick[data-align="start"] { align-items: flex-start; }
.dshps_tick[data-align="end"] { align-items: flex-end; }
.dshps_model {
  max-width: 100%;
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dshps_effort {
  max-width: 100%;
  font-size: 10px;
  line-height: 14px;
  opacity: .78;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dshps_notice {
  padding: 0 4px;
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  line-height: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dshps_notice[data-kind="error"] { color: var(--dsw-alias-state-error-primary); }
`;
    }

    function installStyles() {
      if (typeof document === 'undefined') return () => {};
      const tag = document.createElement('style');
      tag.dataset.plugin = PLUGIN_ID;
      tag.dataset.pluginCss = `${PLUGIN_ID}/performance-slider.css`;
      portraitStyleTag = tag;
      tag.textContent = buildStylesheet();
      document.head.appendChild(tag);
      return () => {
        if (portraitStyleTag === tag) portraitStyleTag = null;
        tag.remove();
      };
    }

    /* ------------------------------------------------------------------ */
    /* Model + reasoning switching                                          */
    /* ------------------------------------------------------------------ */

    function errorOf(response, fallback) {
      const err = response && response.result ? response.result.error : null;
      if (err) return err.message || err.code || fallback;
      return fallback;
    }

    function advertisedEfforts(model) {
      const efforts = model && model.reasoning && model.reasoning.efforts;
      return Array.isArray(efforts) ? efforts.map((entry) => String(entry && entry.id)) : [];
    }

    function matchesPresetModel(preset, modelId) {
      if (preset.models.includes(modelId)) return true;
      const id = String(modelId || '').toLowerCase();
      if (preset.modelClass === 'flash') return id.includes('flash') && !id.includes('pro');
      if (preset.modelClass === 'pro') return id.includes('pro') || id.includes('reasoner');
      return false;
    }

    function scoreModelForPreset(preset, model) {
      const advertised = advertisedEfforts(model);
      let score = 0;
      if (preset.models.includes(model.id)) score += 6;
      else if (matchesPresetModel(preset, model.id)) score += 3;

      if (preset.effort === 'off') {
        if (advertised.includes('off')) score += 15;
        else if (advertised.length === 0) score += 10;
      } else {
        if (advertised.includes(preset.effort)) score += 12;
        else if ((preset.effortFallbacks || []).some((candidate) => advertised.includes(candidate))) score += 6;
        else if (model.reasoning && model.reasoning.defaultEffort !== undefined) score += 2;
      }
      return score;
    }

    function findModelRoute(groups, preset) {
      let best = null;
      let bestScore = -1;
      for (const group of Array.isArray(groups) ? groups : []) {
        const models = Array.isArray(group.models) ? group.models : [];
        for (const model of models) {
          if (!matchesPresetModel(preset, model.id)) continue;
          const score = scoreModelForPreset(preset, model);
          if (score > bestScore) {
            bestScore = score;
            best = { group, model };
          }
        }
      }
      return best;
    }

    function resolveEffort(model, preset) {
      const advertised = advertisedEfforts(model);
      if (preset.effort === undefined) {
        return model.reasoning && model.reasoning.defaultEffort !== undefined
          ? model.reasoning.defaultEffort
          : undefined;
      }
      if (advertised.includes(preset.effort)) return preset.effort;
      if (advertised.length === 0) {
        return model.reasoning && model.reasoning.defaultEffort !== undefined
          ? model.reasoning.defaultEffort
          : undefined;
      }
      if (preset.effort === 'off') return 'off';
      const fallback = (preset.effortFallbacks || []).find((candidate) => advertised.includes(candidate));
      if (fallback !== undefined) return fallback;
      if (model.reasoning && model.reasoning.defaultEffort !== undefined) return model.reasoning.defaultEffort;
      return advertised[0] || preset.effort;
    }

    async function applyModelSelection(connection, sessions, sessionId, index) {
      const preset = LEVELS[Math.max(0, Math.min(LEVELS.length - 1, Math.round(index)))];

      if (sessions && sessions.subagentAddress && sessions.subagentAddress(sessionId) !== undefined) {
        return { ok: false, code: 'subagent', message: 'model selection is unavailable for addressed subagent sessions' };
      }

      let listed;
      try {
        listed = await connection.api.sessions.models({ sessionId });
      } catch (error) {
        return { ok: false, code: 'transport', message: error && error.message ? error.message : String(error) };
      }
      if (!listed || !listed.result || !listed.result.ok) {
        return { ok: false, code: 'catalog-error', message: errorOf(listed, 'session.models failed') };
      }

      const value = listed.result.value;
      const route = findModelRoute(value && value.groups, preset);
      if (!route) {
        return { ok: false, code: 'preset-model-missing', message: `no advertised model matched ${preset.models.join(' / ')}` };
      }

      const effort = resolveEffort(route.model, preset);
      console.debug('[dsh-performance-slider] target', {
        level: index + 1,
        preset: preset.id,
        provider: route.group.id,
        model: route.model.id,
        effort,
      });

      const current = value.current;
      const alreadySelected = current
        && current.provider === route.group.id
        && current.model === route.model.id
        && (
          effort === undefined
            ? current.reasoningEffort === undefined
            : effort === 'off'
              ? (current.reasoningEffort === undefined || current.reasoningEffort === 'off')
              : current.reasoningEffort === effort
        );
      if (alreadySelected) {
        return {
          ok: true,
          switched: true,
          provider: route.group.id,
          model: route.model.id,
          effort: effort === undefined ? 'default' : effort,
        };
      }

      const payload = {
        sessionId,
        provider: route.group.id,
        model: route.model.id,
        ...(effort === undefined ? {} : { reasoningEffort: effort }),
      };

      let selected;
      try {
        selected = await connection.api.sessions.selectModel(payload);
      } catch (error) {
        return { ok: false, code: 'transport', message: error && error.message ? error.message : String(error) };
      }
      if (!selected || !selected.result || !selected.result.ok) {
        console.debug('[dsh-performance-slider] selectModel failed', errorOf(selected, 'select failed'), { payload });
        if (payload.reasoningEffort !== undefined) {
          const fallbackPayload = { sessionId, provider: payload.provider, model: payload.model };
          try {
            selected = await connection.api.sessions.selectModel(fallbackPayload);
          } catch (error) {
            return { ok: false, code: 'transport', message: error && error.message ? error.message : String(error) };
          }
          if (selected && selected.result && selected.result.ok) {
            const fallbackSettled = selected.result.value && selected.result.value.selected;
            return {
              ok: true,
              switched: true,
              provider: fallbackSettled ? fallbackSettled.provider : payload.provider,
              model: fallbackSettled ? fallbackSettled.model : payload.model,
              effort: fallbackSettled && fallbackSettled.reasoningEffort !== undefined
                ? fallbackSettled.reasoningEffort
                : 'default',
            };
          }
        }
        return { ok: false, code: 'select-failed', message: errorOf(selected, 'session.selectModel failed') };
      }

      const settled = selected.result.value && selected.result.value.selected;
      const settledEffort = settled && settled.reasoningEffort !== undefined
        ? settled.reasoningEffort
        : (effort === undefined ? 'default' : effort);
      console.debug('[dsh-performance-slider] switched to', settled || { provider: route.group.id, model: route.model.id, effort: settledEffort });
      return {
        ok: true,
        switched: true,
        provider: settled ? settled.provider : route.group.id,
        model: settled ? settled.model : route.model.id,
        effort: settledEffort,
      };
    }

    /* ------------------------------------------------------------------ */
    /* Locale                                                               */
    /* ------------------------------------------------------------------ */

    const zh = {
      'slider.title': '性能',
      'level.0.effort': '关闭推理',
      'level.1.effort': '轻推理',
      'level.2.effort': '极限推理',
      'level.3.effort': '关闭推理',
      'level.4.effort': '高推理',
      'level.5.effort': '极限推理',
      'feedback.switched': '已切换：{model} · {effort}',
      'feedback.background': '背景已切换；当前目录没有 {model}',
      'feedback.subagent': '子代理会话不支持切换模型，仅切换背景',
      'feedback.noSession': '当前没有活动会话，仅切换背景',
      'feedback.error': '切换失败：{message}',
      'aria.level': '第 {index} 档：{model} · {effort}',
    };

    const en = {
      'slider.title': 'Performance',
      'level.0.effort': 'Reasoning off',
      'level.1.effort': 'Low reasoning',
      'level.2.effort': 'Max reasoning',
      'level.3.effort': 'Reasoning off',
      'level.4.effort': 'High reasoning',
      'level.5.effort': 'Max reasoning',
      'feedback.switched': 'Switched: {model} · {effort}',
      'feedback.background': 'Background switched; {model} is not in the catalog',
      'feedback.subagent': 'Model switching is unavailable for subagents — background only',
      'feedback.noSession': 'No active session — background only',
      'feedback.error': 'Switch failed: {message}',
      'aria.level': 'Level {index}: {model} · {effort}',
    };

    /* ------------------------------------------------------------------ */
    /* Slider component                                                     */
    /* ------------------------------------------------------------------ */

    function PerformanceSliderDock({ applyFrame, select, t }) {
      const [active, setActive] = React.useState(readStoredLevel);
      const [frame, setFrame] = React.useState(() => frameForLevel(readStoredLevel()));
      const [busy, setBusy] = React.useState(false);
      const [notice, setNotice] = React.useState(null);
      const barRef = React.useRef(null);
      const draggingRef = React.useRef(false);
      const frameRef = React.useRef(frame);
      const busyRef = React.useRef(false);

      const updateFrame = React.useCallback((nextFrame) => {
        const safe = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(nextFrame)));
        frameRef.current = safe;
        setFrame(safe);
        applyFrame(safe);
      }, [applyFrame]);

      const frameFromClientX = React.useCallback((clientX) => {
        const rect = barRef.current ? barRef.current.getBoundingClientRect() : { left: 0, width: 1 };
        const ratio = (clientX - rect.left) / Math.max(1, rect.width);
        return Math.round(Math.max(0, Math.min(1, ratio)) * (FRAME_COUNT - 1));
      }, []);

      const commitLevel = React.useCallback(async (level) => {
        const safeLevel = Math.max(0, Math.min(LEVELS.length - 1, Math.round(level)));
        const snapFrame = frameForLevel(safeLevel);
        frameRef.current = snapFrame;
        setFrame(snapFrame);
        setActive(safeLevel);
        applyFrame(snapFrame);
        persistLevel(safeLevel);
        setNotice(null);
        if (busyRef.current) return; // one in-flight selectModel at a time
        setBusy(true);
        busyRef.current = true;
        try {
          const result = await select(safeLevel);
          if (result.switched) {
            setNotice({
              kind: 'ok',
              text: t('feedback.switched', {
                model: result.model || LEVELS[safeLevel].models[0],
                effort: result.effort || LEVELS[safeLevel].effort || 'default',
              }),
            });
          } else if (result.code === 'subagent') {
            setNotice({ kind: 'ok', text: t('feedback.subagent') });
          } else if (result.code === 'no-session') {
            setNotice({ kind: 'ok', text: t('feedback.noSession') });
          } else if (result.code === 'preset-model-missing') {
            setNotice({ kind: 'ok', text: t('feedback.background', { model: LEVELS[safeLevel].models[0] }) });
          } else {
            setNotice({ kind: 'error', text: t('feedback.error', { message: result.message || result.code || 'unknown error' }) });
          }
        } catch (error) {
          setNotice({
            kind: 'error',
            text: t('feedback.error', { message: error && error.message ? error.message : String(error) }),
          });
        } finally {
          setBusy(false);
          busyRef.current = false;
        }
      }, [applyFrame, select, t]);

      const onPointerDown = React.useCallback((event) => {
        draggingRef.current = true;
        if (barRef.current && barRef.current.setPointerCapture) barRef.current.setPointerCapture(event.pointerId);
        updateFrame(frameFromClientX(event.clientX));
      }, [frameFromClientX, updateFrame]);

      const onPointerMove = React.useCallback((event) => {
        if (!draggingRef.current) return;
        updateFrame(frameFromClientX(event.clientX));
      }, [frameFromClientX, updateFrame]);

      const endDrag = React.useCallback(() => {
        if (!draggingRef.current) return;
        draggingRef.current = false;
        commitLevel(levelForFrame(frameRef.current));
      }, [commitLevel]);

      const currentLevel = LEVELS[active];
      const percent = (frame / (FRAME_COUNT - 1)) * 100;

      return jsxs('div', {
        className: 'dshps_dock',
        'data-dsh-performance-slider': '',
        children: [
          jsxs('div', {
            className: 'dshps_header',
            children: [
              jsx('span', { className: 'dshps_title', children: t('slider.title') }),
              jsx('span', {
                className: 'dshps_summary',
                children: `${currentLevel.modelShort} · ${currentLevel.effort} · frame ${String(frame).padStart(2, '0')}`,
              }),
            ],
          }),
          jsx('div', {
            className: 'dshps_perfbar',
            ref: barRef,
            role: 'slider',
            tabIndex: 0,
            'aria-label': t('slider.title'),
            'aria-valuemin': 0,
            'aria-valuemax': FRAME_COUNT - 1,
            'aria-valuenow': frame,
            'aria-valuetext': `frame ${String(frame).padStart(2, '0')}`,
            onPointerDown,
            onPointerMove,
            onPointerUp: endDrag,
            onPointerCancel: endDrag,
            onLostPointerCapture: endDrag,
            onKeyDown: (event) => {
              const current = frameRef.current;
              let next = null;
              if (event.key === 'ArrowLeft') next = current - 1;
              if (event.key === 'ArrowRight') next = current + 1;
              if (next === null) return;
              event.preventDefault();
              updateFrame(Math.max(0, Math.min(FRAME_COUNT - 1, next)));
              commitLevel(levelForFrame(frameRef.current));
            },
            children: jsx('div', {
              className: 'dshps_perfbar_thumb',
              style: { left: `${percent}%` },
            }),
          }),
          jsx('div', {
            className: 'dshps_ticks',
            children: LEVELS.map((level, index) => {
              const effort = t(`level.${index}.effort`);
              return jsx('button', {
                key: level.id,
                type: 'button',
                className: 'dshps_tick',
                'data-active': active === index ? 'true' : 'false',
                'data-align': index === 0 ? 'start' : index === LEVELS.length - 1 ? 'end' : 'center',
                'aria-pressed': active === index,
                'aria-label': t('aria.level', { index: String(index + 1), model: level.modelShort, effort }),
                title: `${level.modelShort} · ${level.effort}`,
                disabled: busy,
                onClick: () => commitLevel(index),
                children: [
                  jsx('span', { className: 'dshps_model', children: level.modelShort }),
                  jsx('span', { className: 'dshps_effort', children: effort }),
                ],
              });
            }),
          }),
          notice
            ? jsx('div', {
                className: 'dshps_notice',
                'data-kind': notice.kind,
                'aria-live': 'polite',
                title: notice.text,
                children: notice.text,
              })
            : null,
        ],
      });
    }

    /* ------------------------------------------------------------------ */
    /* Plugin body                                                          */
    /* ------------------------------------------------------------------ */

    const inject = ['connection', 'sessions', 'slots', 'theme', 'locale'];

    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-performance-slider: dictionaries');

      ctx.effect(() => {
        const removeStyles = installStyles();
        applyFrameBackdrop(ctx.theme, frameForLevel(readStoredLevel()));
        return () => {
          removeStyles();
          clearBackdrop();
        };
      }, 'dsh-performance-slider: styles and frame backgrounds');

      ctx.slots.inject('conversation.input.dock', () => ctx.slots.register({
        name: 'conversation.input.dock',
        id: 'performance',
        order: 0,
        locale: NS,
        inject: (sessionId) => ({
          applyFrame: (frame) => {
            applyFrameBackdrop(ctx.theme, frame);
          },
          select: (index) => {
            if (sessionId === undefined || sessionId === null) {
              return Promise.resolve({ ok: false, code: 'no-session', message: 'no active session' });
            }
            return applyModelSelection(ctx.connection, ctx.sessions, sessionId, index);
          },
        }),
      }, PerformanceSliderDock));
    }

    exports.LEVELS = LEVELS;
    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  },
});
