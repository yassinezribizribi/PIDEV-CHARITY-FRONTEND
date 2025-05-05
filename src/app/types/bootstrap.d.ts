declare module 'bootstrap' {
  export class Dropdown {
    constructor(element: Element, options?: any);
    toggle(): void;
    show(): void;
    hide(): void;
    dispose(): void;
  }
} 