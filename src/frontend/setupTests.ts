import '@testing-library/jest-dom';

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

window.PointerEvent = MouseEvent as typeof PointerEvent;
