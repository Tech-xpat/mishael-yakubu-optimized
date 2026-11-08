/**
 * Site-wide premium press feedback for every tappable element.
 *
 *   1. Finger / mouse goes DOWN  -> the element sinks in (soft "tock" sound).
 *   2. Finger / mouse comes UP   -> the element pops back up with a little overshoot (soft "tick").
 *   3. Only once the pop is nearly done does the real action run (link, navigation, submit...).
 *
 * Even a very quick tap plays the whole sequence, so visitors always see it before anything happens.
 * Raised "key" buttons (.key-btn / .key-btn-outline) also drop into their hard shadow while pressed.
 *
 * Works from document-level listeners, so links, router <Link>s and buttons all get it with no
 * per-component code. Opt out with `data-no-press`. Uses the individual `scale` / `translate`
 * properties, so it never fights an element's own `transform`.
 */
import { playPop, playPress, unlockAudio } from './sound';

const SELECTOR = 'a[href], button, [role="button"], summary';
const PRESS_SCALE = 0.93;
const KEY_PRESS_SCALE = 0.97;
const KEY_DROP = '4px 4px';

const PRESS_DELAY_MS = 30; // ignore the very start of a scroll gesture
const PRESS_MS = 180; // the sink-in always lasts at least this long
const POP_MS = 340; // overshoot and settle
const FIRE_AT = 0.8; // run the action when the pop is 80% done

const PRESS_EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
const POP_EASE = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

interface Press {
  el: HTMLElement;
  key: boolean;
  rest: string; // resting box-shadow (key buttons)
  anim: Animation | null;
  timer: number | null;
  pressStart: number; // 0 until the sink-in has begun
  fireAt: number; // 0 until the pop is scheduled
  popTimer: number | null;
}

const bypass = new WeakSet<Element>();
let current: Press | null = null;
let busy = false; // an action is waiting for its pop to finish

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const supportsScaleProp = () => typeof CSS !== 'undefined' && CSS.supports('scale', '1');
const now = () => performance.now();

function targetFor(node: EventTarget | null): HTMLElement | null {
  if (!(node instanceof Element)) return null;
  const el = node.closest<HTMLElement>(SELECTOR);
  if (!el) return null;
  if (el.closest('[data-no-press]')) return null;
  if ((el as HTMLButtonElement).disabled || el.getAttribute('aria-disabled') === 'true') return null;
  if (window.location.pathname.startsWith('/greatness')) return null; // admin stays instant
  return el;
}

const isKey = (el: HTMLElement) => el.classList.contains('key-btn') || el.classList.contains('key-btn-outline');

/** "rgb(250 204 21) 4px 4px 0 0" -> same colour with the given offsets. */
function withOffsets(shadow: string, x: string, y: string): string {
  if (!shadow || shadow === 'none') return shadow;
  return shadow.replace(/(-?[\d.]+px)\s+(-?[\d.]+px)(\s+-?[\d.]+px\s+-?[\d.]+px)/, `${x} ${y}$3`);
}

function create(el: HTMLElement): Press {
  const key = isKey(el);
  return {
    el,
    key,
    rest: key ? getComputedStyle(el).boxShadow : '',
    anim: null,
    timer: null,
    pressStart: 0,
    fireAt: 0,
    popTimer: null,
  };
}

function ensureScalable(el: HTMLElement) {
  if (getComputedStyle(el).display === 'inline') el.style.display = 'inline-block';
}

function pressedFrame(p: Press): Keyframe {
  if (!p.key) return { scale: String(PRESS_SCALE) };
  return {
    scale: String(KEY_PRESS_SCALE),
    translate: KEY_DROP,
    boxShadow: withOffsets(p.rest, '0px', '0px'),
  };
}

function pressIn(p: Press) {
  if (p.pressStart) return;
  p.pressStart = now();
  ensureScalable(p.el);
  unlockAudio();
  playPress();
  p.anim?.cancel();
  // A single keyframe animates from wherever the element currently is (hover state included).
  p.anim = p.el.animate([pressedFrame(p)], { duration: PRESS_MS, easing: PRESS_EASE, fill: 'forwards' });
}

function pop(p: Press) {
  const { el } = p;
  playPop();
  const frames: Keyframe[] = p.key
    ? [
        { ...pressedFrame(p), offset: 0 },
        {
          scale: '1.05',
          translate: '-2px -2px',
          boxShadow: withOffsets(p.rest, '6px', '6px'),
          offset: 0.5,
          easing: PRESS_EASE,
        },
        { scale: '1', translate: '0px 0px', boxShadow: p.rest, offset: 1 },
      ]
    : [
        { scale: String(PRESS_SCALE), offset: 0 },
        { scale: '1.07', offset: 0.45, easing: PRESS_EASE },
        { scale: '1', offset: 1 },
      ];
  const old = p.anim;
  const anim = el.animate(frames, { duration: POP_MS, easing: POP_EASE });
  old?.cancel();
  p.anim = anim;
  anim.onfinish = () => {
    anim.cancel();
    if (p.anim === anim) p.anim = null;
  };
}

/** Put a half-pressed element back to rest without an action (finger slid away / cancelled). */
function abandon(p: Press) {
  if (p.timer !== null) window.clearTimeout(p.timer);
  if (p.popTimer !== null) window.clearTimeout(p.popTimer);
  p.timer = p.popTimer = null;
  const old = p.anim;
  if (old) {
    const back = p.el.animate(
      [p.key ? { scale: '1', translate: '0px 0px', boxShadow: p.rest } : { scale: '1' }],
      { duration: 220, easing: PRESS_EASE }
    );
    old.cancel();
    back.onfinish = () => back.cancel();
  }
  p.anim = null;
  if (current === p) current = null;
}

/** Run the rest of the sequence: finish the sink-in, pop, and report when the action may run. */
function schedulePop(p: Press): number {
  if (p.fireAt) return p.fireAt;
  if (p.timer !== null) {
    window.clearTimeout(p.timer);
    p.timer = null;
  }
  if (!p.pressStart) pressIn(p); // tap was shorter than the start delay
  const sinkDone = p.pressStart + PRESS_MS;
  const wait = Math.max(0, sinkDone - now());
  p.popTimer = window.setTimeout(() => {
    p.popTimer = null;
    pop(p);
  }, wait);
  p.fireAt = now() + wait + POP_MS * FIRE_AT;
  return p.fireAt;
}

function onPointerDown(e: PointerEvent) {
  if (e.button !== 0 || busy || reducedMotion() || !supportsScaleProp()) return;
  const el = targetFor(e.target);
  if (!el) return;
  if (current) abandon(current);
  const p = create(el);
  current = p;
  unlockAudio();
  p.timer = window.setTimeout(() => {
    p.timer = null;
    if (current === p) pressIn(p);
  }, PRESS_DELAY_MS);
}

function onPointerUp(e: PointerEvent) {
  const p = current;
  if (!p || busy) return;
  const under = document.elementFromPoint(e.clientX, e.clientY);
  if (under && p.el.contains(under)) schedulePop(p);
  else abandon(p);
}

function onPointerCancel() {
  if (current && !busy) abandon(current);
}

function onClickCapture(e: MouseEvent) {
  const el = targetFor(e.target);
  if (!el) return;

  // Our own replayed click goes straight through to the app.
  if (bypass.has(el)) {
    bypass.delete(el);
    return;
  }
  // Another action is already waiting for its animation: swallow double taps.
  if (busy) {
    e.preventDefault();
    e.stopImmediatePropagation();
    return;
  }
  if (reducedMotion() || !supportsScaleProp()) return;
  // Keep new-tab / download style clicks native.
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();

  // Pointer taps already started the sequence on pointerdown; keyboard activation has not.
  let p = current && current.el === el ? current : null;
  if (!p) {
    p = create(el);
    current = p;
  }
  const fireAt = schedulePop(p);
  busy = true;

  window.setTimeout(() => {
    busy = false;
    if (current === p) current = null;
    bypass.add(el);
    el.click();
    // If the click was swallowed, do not leave a stale entry behind.
    window.setTimeout(() => bypass.delete(el), 0);
  }, Math.max(20, fireAt - now()));
}

export function installPressFeedback(): () => void {
  document.addEventListener('pointerdown', onPointerDown, { passive: true });
  document.addEventListener('pointerup', onPointerUp, { passive: true });
  document.addEventListener('pointercancel', onPointerCancel, { passive: true });
  document.addEventListener('click', onClickCapture, true);
  return () => {
    document.removeEventListener('pointerdown', onPointerDown);
    document.removeEventListener('pointerup', onPointerUp);
    document.removeEventListener('pointercancel', onPointerCancel);
    document.removeEventListener('click', onClickCapture, true);
  };
}
