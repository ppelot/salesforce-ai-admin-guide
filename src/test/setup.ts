import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';

// jsdom doesn't implement these browser APIs the app calls. Stub them so
// integration tests exercising real components don't throw.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

// jsdom defines these as throwing stubs, so override unconditionally.
window.scrollTo = () => {};
window.print = () => {};

// Clipboard fallback path uses document.execCommand('copy'); stub "success".
document.execCommand = () => true;

// Reset the URL hash and storage between tests for isolation.
afterEach(() => {
  window.location.hash = '';
  window.localStorage.clear();
  vi.restoreAllMocks();
});
