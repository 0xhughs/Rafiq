import type { Vec2 } from './types';

const MOVE_CODES = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
]);

const INTERACT_CODES = new Set(['KeyE', 'Space', 'Enter']);

const HELP_CODES = new Set(['KeyH', 'KeyJ', 'Slash', 'F1']);

function isHtmlElement(target: EventTarget | null): target is HTMLElement {
  return typeof HTMLElement !== 'undefined' && target instanceof HTMLElement;
}

export class InputController {
  private held = new Set<string>();
  private interactQueued = false;
  private escapeQueued = false;
  private helpQueued = false;

  isTypingTarget(target: EventTarget | null): boolean {
    if (!isHtmlElement(target)) return false;
    const tag = target.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable;
  }

  handleKeyDown(event: KeyboardEvent, worldEnabled: boolean): void {
    if (event.code === 'Escape') {
      this.escapeQueued = true;
      event.preventDefault();
      return;
    }
    if (this.isTypingTarget(event.target)) {
      return;
    }
    if (isHtmlElement(event.target) && event.target.closest('button')) {
      if (event.repeat && INTERACT_CODES.has(event.code)) {
        event.preventDefault();
      }
      return;
    }
    if (!worldEnabled) {
      return;
    }
    if (MOVE_CODES.has(event.code) || INTERACT_CODES.has(event.code) || HELP_CODES.has(event.code)) {
      event.preventDefault();
    }
    if (event.repeat) {
      return;
    }
    this.held.add(event.code);
    if (INTERACT_CODES.has(event.code)) {
      this.interactQueued = true;
    }
    if (HELP_CODES.has(event.code)) {
      this.helpQueued = true;
    }
  }

  handleKeyUp(event: KeyboardEvent): void {
    this.held.delete(event.code);
  }

  blur(): void {
    this.held.clear();
  }

  moveVector(): Vec2 {
    let x = 0;
    let y = 0;
    if (this.held.has('ArrowLeft') || this.held.has('KeyA')) x -= 1;
    if (this.held.has('ArrowRight') || this.held.has('KeyD')) x += 1;
    if (this.held.has('ArrowUp') || this.held.has('KeyW')) y -= 1;
    if (this.held.has('ArrowDown') || this.held.has('KeyS')) y += 1;
    if (x !== 0 && y !== 0) {
      x *= Math.SQRT1_2;
      y *= Math.SQRT1_2;
    }
    return { x, y };
  }

  consumeInteract(): boolean {
    const value = this.interactQueued;
    this.interactQueued = false;
    return value;
  }

  consumeEscape(): boolean {
    const value = this.escapeQueued;
    this.escapeQueued = false;
    return value;
  }

  consumeHelp(): boolean {
    const value = this.helpQueued;
    this.helpQueued = false;
    return value;
  }
}
