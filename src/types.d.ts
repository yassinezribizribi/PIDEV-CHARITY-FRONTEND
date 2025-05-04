declare module 'bootstrap' {
  export class Modal {
    constructor(element: Element, options?: any);
    show(): void;
    hide(): void;
    dispose(): void;
    static getInstance(element: Element): Modal | null;
  }
  
  export class Tooltip {
    constructor(element: Element, options?: any);
    show(): void;
    hide(): void;
    dispose(): void;
  }
  
  export class Popover {
    constructor(element: Element, options?: any);
    show(): void;
    hide(): void;
    dispose(): void;
  }
}

declare module 'canvas-confetti' {
  const confetti: any;
  export default confetti;
}

declare module 'swiper/element/bundle' {
  export function register(): void;
} 