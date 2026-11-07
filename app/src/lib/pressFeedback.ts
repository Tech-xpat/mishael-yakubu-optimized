/**
 * Site-wide "press in, then pop" feedback for every tappable element.
 *
 *  1. Finger / mouse goes down  -> element eases in (scales down gradually).
 *  2. Finger / mouse is released -> element pops (overshoots, then settles).
 *  3. The action (navigation, link, submit) runs while the pop is playing.
 *
 * It works by listening on the document, so links, router <Link>s and buttons
 * all get it without per-component code. Opt an element out with
 * `data-no-press` (e.g. gallery arrows that must react instantly).
 *
 * Uses the individual CSS `scale` property so it never fights with elements
 * that already use `transform` (centering, hover:scale, etc).
 */

const SELECTOR = 'a[href], button, [role="button"], summary';
const PRESS_SCALE = 0.93;
const PRESS_DELAY_MS = 45; // ignore scroll-starts / ultra-quick brushes
const PRESS_MS = 240; // gradual ease in
const POP_MS = 320; // overshoot + settle
const OPEN_AFTER_MS = 240; // action fires while the pop is finishing

const PRESS_EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
const POP_EASE = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

interface Active {
  el: HTMLElement;
  anim: Animation | null;
  timer: number | null;
  popAt: number;
}

const bypass = new WeakSet<Element>();
let active: Active | null = null;

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const supportsScaleProp = () => typeof CSS !== 'undefined' && CSS.supports('scale', '1');

function targetFor(node: EventTarget | null): HTMLElement | null {
  if (!(node instanceof Element)) return null;
  const el = node.closest<HTMLElement>(SELECTOR);
  if (!el) return null;
  if (el.closest('[data-no-press]')) return null;
  if ((el as HTMLButtonElement).disabled || el.getAttribute('aria-disabled') === 'true') return null;
  if (window.location.pathname.startsWith('/greatness')) return null; // admin stays instant
  return el;
}

function currentScale(el: HTMLElement): number {
  const s = parseFloat(getComputedStyle(el).scale);
  return Number.isFinite(s) ? s : 1;
}

/** `scale` does nothing on display:inline, so promote inline links once. */
function ensureScalable(el: HTMLElement) {
  if (getComputedStyle(el).display === 'inline') el.style.display = 'inline-block';
}

function clearTimer(a: Active) {
  if (a.timer !== null) {
    window.clearTimeout(a.timer);
    a.timer = null;
  }
}

function pressIn(a: Active) {
  const { el } = a;
  ensureScalable(el);
  a.anim?.cancel();
  a.anim = el.animate(
    [{ scale: String(currentScale(el)) }, { scale: String(PRESS_SCALE) }],
    { duration: PRESS_MS, easing: PRESS_EASE, fill: 'forwards' }
  );
}

function release(a: Active) {
  clearTimer(a);
  const { el } = a;
  if (!a.anim) return;
  const from = currentScale(el);
  const old = a.anim;
  const back = el.animate([{ scale: String(from) }, { scale: '1' }], {
    duration: 200,
    easing: PRESS_EASE,
  });
  old.cancel();
  a.anim = null;
  back.onfinish = () => back.cancel();
  if (active === a) active = null;
}

function pop(a: Active) {
  clearTimer(a);
  const { el } = a;
  ensureScalable(el);
  const from = a.anim ? currentScale(el) : 1;
  const old = a.anim;
  const anim = el.animate(
    [
      { scale: String(from), offset: 0 },
      { scale: '1.07', offset: 0.45, easing: POP_EASE },
      { scale: '1', offset: 1 },
    ],
    { duration: POP_MS, easing: 'ease-out' }
  );
  old?.cancel();
  a.anim = anim;
  a.popAt = performance.now();
  anim.onfinish = () => {
    anim.cancel();
    if (a.anim === anim) a.anim = null;
  };
}

function onPointerDown(e: PointerEvent) {
  if (e.button !== 0 || reducedMotion() || !supportsScaleProp()) return;
  const el = targetFor(e.target);
  if (!el) return;
  if (active) release(active);
  const a: Active = { el, anim: null, timer: null, popAt: 0 };
  active = a;
  a.timer = window.setTimeout(() => {
    a.timer = null;
    if (active === a) pressIn(a);
  }, PRESS_DELAY_MS);
}

function onPointerUp(e: PointerEvent) {
  const a = active;
  if (!a) return;
  const under = document.elementFromPoint(e.clientX, e.clientY);
  if (under && a.el.contains(under)) pop(a);
  else release(a);
}

function onPointerCancel() {
  if (active) release(active);
}

function onClickCapture(e: MouseEvent) {
  const el = targetFor(e.target);
  if (!el) return;

  // Our own replayed click: let it through untouched.
  if (bypass.has(el)) {
    bypass.delete(el);
    return;
  }
  if (reducedMotion() || !supportsScaleProp()) return;
  // Keep new-tab / download style clicks native.
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();

  let wait = OPEN_AFTER_MS;
  const a = active && active.el === el ? active : null;
  if (a && a.popAt) {
    wait = Math.max(40, OPEN_AFTER_MS - (performance.now() - a.popAt));
  } else {
    // Keyboard / programmatic activation: no pointer sequence, so pop now.
    const fresh: Active = { el, anim: null, timer: null, popAt: 0 };
    active = fresh;
    pop(fresh);
  }

  window.setTimeout(() => {
    bypass.add(el);
    el.click();
    // If the click was swallowed, don't leave a stale entry behind.
    window.setTimeout(() => bypass.delete(el), 0);
  }, wait);
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
