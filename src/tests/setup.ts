import "@testing-library/jest-dom";
// setupTests.ts
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
