// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { readConnectorPreferences, saveConnectorPreferences } from "./connector-preferences";
afterEach(() => { localStorage.clear(); vi.restoreAllMocks(); });
it('starts straight and restores only valid remembered fields', () => {
  expect(readConnectorPreferences()).toEqual({ stroke: 'solid', path: 'straight', direction: 'one-way' });
  saveConnectorPreferences({ stroke: 'dotted', path: 'curved', direction: 'both' });
  expect(readConnectorPreferences()).toEqual({ stroke: 'dotted', path: 'curved', direction: 'both' });
  localStorage.setItem('system-canvas:connector-preferences', JSON.stringify({ stroke: 'dashed', path: 'invalid', direction: 'invalid' }));
  expect(readConnectorPreferences()).toEqual({ stroke: 'dashed', path: 'straight', direction: 'one-way' });
});
it('survives malformed and unavailable browser storage', () => {
  localStorage.setItem('system-canvas:connector-preferences', '{');
  expect(readConnectorPreferences().path).toBe('straight');
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
  expect(readConnectorPreferences().path).toBe('straight');
  expect(() => saveConnectorPreferences({ path: 'elbow', stroke: 'solid', direction: 'both' })).not.toThrow();
});
