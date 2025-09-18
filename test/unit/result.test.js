import { Ok, Err } from '../../src/domain/results/result.js';

describe('Result (Ok/Err) minimal', () => {
  it('Ok holds value and isOk/isErr behave', () => {
    const ok = Ok.of(123);
    expect(ok.isOk()).toBe(true);
    expect(ok.isErr()).toBe(false);
    expect(ok.getValue()).toBe(123);
    expect(() => ok.getError()).toThrow('Cannot get error from Ok result');
  });

  it('Err holds error and isOk/isErr behave', () => {
    const e = new Error('boom');
    const err = Err.of(e);
    expect(err.isOk()).toBe(false);
    expect(err.isErr()).toBe(true);
    expect(err.getError()).toBe(e);
    expect(() => err.getValue()).toThrow('Cannot get value from Err result');
  });
});

