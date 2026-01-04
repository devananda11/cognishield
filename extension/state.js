export async function getState() {
  return await chrome.storage.local.get({
    enabled: true,
    focusMode: false,
    readabilityMode: false,
    semanticDecanter: false,
    intensity: 0.5
  });
}

export async function setState(newState) {
  await chrome.storage.local.set(newState);
}
