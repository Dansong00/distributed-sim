// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { EditableTitle } from './EditableTitle';

afterEach(cleanup);
test('IME confirmation and cancellation do not commit or leave title editing', () => {
  const rename = vi.fn();
  render(<EditableTitle name="Original" disabled={false} onRename={rename} />);
  const title = screen.getByRole('textbox', { name: 'Diagram title' });
  act(() => title.focus());
  fireEvent.change(title, { target: { value: 'Composed title' } });
  for (const key of ['Enter', 'Escape']) {
    fireEvent.keyDown(title, { key, isComposing: true });
    expect(document.activeElement).toBe(title);
    expect(rename).not.toHaveBeenCalled();
  }
  fireEvent.keyDown(title, { key: 'Enter' });
  expect(rename).toHaveBeenCalledWith('Composed title');
});
