const OFFSCREEN_URL = 'offscreen.html';
let creatingOffscreen = null;
let creatingHostWindow = null;
let hostWindowId = null;
let creatingHostTab = null;
let hostTabId = null;

async function hasOffscreenDocument() {
  if (!chrome.runtime.getContexts) {
    return false;
  }
  const contexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [chrome.runtime.getURL(OFFSCREEN_URL)]
  });
  return contexts.length > 0;
}

async function ensureOffscreenDocument() {
  if (!chrome.offscreen || !chrome.offscreen.createDocument) {
    return false;
  }
  if (creatingOffscreen) {
    await creatingOffscreen;
    return true;
  }
  if (await hasOffscreenDocument()) {
    return true;
  }
  creatingOffscreen = chrome.offscreen.createDocument({
    url: OFFSCREEN_URL,
    reasons: ['USER_MEDIA', 'LOCAL_STORAGE'],
    justification: 'Process captured tab audio for EQ and persist settings.'
  });
  try {
    await creatingOffscreen;
    return true;
  } catch (err) {
    console.warn('Failed to create offscreen document:', err);
    return false;
  } finally {
    creatingOffscreen = null;
  }
}

function getWindow(windowId) {
  return new Promise((resolve) => {
    chrome.windows.get(windowId, null, (win) => resolve(win || null));
  });
}

async function ensureHostWindow() {
  if (!chrome.windows || !chrome.windows.create) {
    return false;
  }
  if (creatingHostWindow) {
    await creatingHostWindow;
    return !!hostWindowId;
  }
  if (hostWindowId !== null) {
    const existing = await getWindow(hostWindowId);
    if (existing) {
      return true;
    }
    hostWindowId = null;
  }

  const url = chrome.runtime.getURL(OFFSCREEN_URL);
  creatingHostWindow = new Promise((resolve) => {
    chrome.windows.create(
      {
        url: url,
        type: 'popup',
        focused: false,
        width: 1,
        height: 1,
        left: -10000,
        top: -10000,
        state: 'minimized'
      },
      (win) => {
        if (win && typeof win.id === 'number') {
          hostWindowId = win.id;
        }
        resolve();
      }
    );
  });
  await creatingHostWindow;
  creatingHostWindow = null;
  return !!hostWindowId;
}

function getTab(tabId) {
  return new Promise((resolve) => {
    chrome.tabs.get(tabId, (tab) => resolve(tab || null));
  });
}

async function ensureHostTab() {
  if (!chrome.tabs || !chrome.tabs.create) {
    return false;
  }
  if (creatingHostTab) {
    await creatingHostTab;
    return !!hostTabId;
  }
  if (hostTabId !== null) {
    const existing = await getTab(hostTabId);
    if (existing) {
      return true;
    }
    hostTabId = null;
  }

  const url = chrome.runtime.getURL(OFFSCREEN_URL);
  creatingHostTab = new Promise((resolve) => {
    chrome.tabs.create(
      {
        url: url,
        active: false,
        pinned: true
      },
      (tab) => {
        if (tab && typeof tab.id === 'number') {
          hostTabId = tab.id;
        }
        resolve();
      }
    );
  });
  await creatingHostTab;
  creatingHostTab = null;
  return !!hostTabId;
}

async function ensureAudioHost() {
  const offscreenOk = await ensureOffscreenDocument();
  if (offscreenOk) {
    return true;
  }
  const windowOk = await ensureHostWindow();
  if (windowOk) {
    return true;
  }
  return await ensureHostTab();
}

function wrapCallback(result) {
  const err = chrome.runtime.lastError;
  if (err) {
    return { error: err.message };
  }
  return { data: result };
}

async function handleBridgeMessage(message) {
  const payload = (message && message.payload) || {};
  switch (message.type) {
    case 'storage.sync.get':
      return await new Promise((resolve) => {
        chrome.storage.sync.get(payload.keys ?? null, (items) => {
          resolve(wrapCallback(items));
        });
      });
    case 'storage.sync.set':
      return await new Promise((resolve) => {
        chrome.storage.sync.set(payload.items || {}, () => {
          resolve(wrapCallback(true));
        });
      });
    case 'storage.sync.remove':
      return await new Promise((resolve) => {
        chrome.storage.sync.remove(payload.keys ?? null, () => {
          resolve(wrapCallback(true));
        });
      });
    case 'tabs.query':
      try {
        return { data: await chrome.tabs.query(payload.queryInfo || {}) };
      } catch (err) {
        return { error: err && err.message };
      }
    case 'tabs.getSelected':
      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        return { data: tabs[0] || null };
      } catch (err) {
        return { error: err && err.message };
      }
    case 'windows.get':
      return await new Promise((resolve) => {
        chrome.windows.get(payload.windowId, payload.getInfo || null, (win) => {
          resolve(wrapCallback(win));
        });
      });
    case 'windows.update':
      return await new Promise((resolve) => {
        chrome.windows.update(payload.windowId, payload.updateInfo || {}, (win) => {
          resolve(wrapCallback(win));
        });
      });
    case 'tabCapture.getMediaStreamId': {
      const options = payload.options || {};
      const getOptions = {};
      if (typeof options.targetTabId === 'number') {
        getOptions.targetTabId = options.targetTabId;
      }
      if (typeof options.consumerTabId === 'number') {
        getOptions.consumerTabId = options.consumerTabId;
      }
      return await new Promise((resolve) => {
        chrome.tabCapture.getMediaStreamId(getOptions, (streamId) => {
          const result = wrapCallback(streamId);
          if (result.error) {
            resolve(result);
          } else {
            resolve({ data: { streamId: streamId } });
          }
        });
      });
    }
    default:
      return { error: 'Unknown bridge message: ' + message.type };
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message !== 'object') {
    return;
  }
  if (message.type === 'ensureOffscreen') {
    ensureAudioHost().then((ok) => sendResponse({ ok: !!ok }));
    return true;
  }
  if (message.__earsBridge) {
    handleBridgeMessage(message).then(sendResponse);
    return true;
  }
});

chrome.runtime.onInstalled.addListener(() => {
  ensureOffscreenDocument();
});

chrome.runtime.onStartup.addListener(() => {
  ensureOffscreenDocument();
});

if (chrome.windows && chrome.windows.onRemoved) {
  chrome.windows.onRemoved.addListener((windowId) => {
    if (windowId === hostWindowId) {
      hostWindowId = null;
    }
  });
}

if (chrome.tabs && chrome.tabs.onRemoved) {
  chrome.tabs.onRemoved.addListener((tabId) => {
    if (tabId === hostTabId) {
      hostTabId = null;
    }
  });
}

chrome.storage.onChanged.addListener((changes, area) => {
  chrome.runtime.sendMessage({
    __earsBridgeEvent: 'storage.onChanged',
    payload: changes,
    area: area
  });
});

chrome.tabCapture.onStatusChanged.addListener((status) => {
  chrome.runtime.sendMessage({
    __earsBridgeEvent: 'tabCapture.onStatusChanged',
    payload: status
  });
});
