const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class FakeElement {
  constructor() { this.style = {}; this.listeners = {}; this.children = []; this.removed = false; this.clicks = 0; this.events = []; }
  addEventListener(type, listener) { (this.listeners[type] ||= []).push(listener); }
  dispatchEvent(event) { this.events.push(event.type); for (const fn of this.listeners[event.type] || []) fn(event); return true; }
  appendChild(child) { this.children.push(child); child.parent = this; return child; }
  remove() { this.removed = true; }
  closest() { return this; }
  click() { this.clicks++; }
  getBoundingClientRect() { return { left: parseFloat(this.style.left) || 0, top: parseFloat(this.style.top) || 0, width: parseFloat(this.style.width) || 100, height: parseFloat(this.style.height) || 100 }; }
}

test('virtual movement emits page hover events and clicks a target once per run', () => {
  const root = new FakeElement();
  const documentListeners = {};
  const target = new FakeElement();
  const document = {
    documentElement: root,
    createElement: () => new FakeElement(),
    addEventListener: (type, fn) => { (documentListeners[type] ||= []).push(fn); },
    removeEventListener: () => {},
    elementFromPoint: () => target
  };
  let frame;
  let interval;
  let listener;
  const messages = [];
  const chrome = { runtime: { onMessage: { addListener: fn => { listener = fn; } }, sendMessage: msg => messages.push(msg) } };
  const context = {
    window: {}, document, chrome,
    PointerEvent: class { constructor(type, init) { this.type = type; Object.assign(this, init); } },
    MouseEvent: class { constructor(type, init) { this.type = type; Object.assign(this, init); } },
    requestAnimationFrame: fn => { frame = fn; return 1; }, cancelAnimationFrame: () => {},
    setTimeout: () => 2, clearTimeout: () => {}, setInterval: fn => { interval = fn; return 3; }, clearInterval: () => {},
    performance: { now: () => 1000 }, Math, WeakSet,
    addEventListener: () => {}
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'extension', 'content.js'), 'utf8'), context);

  listener({ type: 'DRAW_BOX' });
  const selection = root.children.find(el => el.style.cursor === 'crosshair');
  const event = (x, y) => ({ clientX: x, clientY: y, preventDefault() {}, stopPropagation() {} });
  selection.dispatchEvent(Object.assign(event(10, 10), { type: 'pointerdown' }));
  selection.dispatchEvent(Object.assign(event(110, 110), { type: 'pointermove' }));
  selection.dispatchEvent(Object.assign(event(110, 110), { type: 'pointerup' }));
  listener({ type: 'START_ENGINE', settings: { min: 100, max: 100, pmin: 100, pmax: 100, size: 18, clicks: true, clickMs: 800 } });
  frame(1200);
  interval();
  interval();

  assert.ok(target.events.includes('pointermove'));
  assert.ok(target.events.includes('mousemove'));
  assert.equal(target.clicks, 1);
  listener({ type: 'STOP_ENGINE' });
  assert.ok(messages.some(m => m.type === 'ENGINE_STATUS' && m.running === false));
});
