import { createContext, createRunner, perform } from '.';

describe('Runner', () => {
  it('runner returns the return value of callback', () => {
    const run = createRunner();
    const result = run(() => 'A return value');

    expect(result).toBe('A return value');
  });

  it('allows a performed context to use the default context value', () => {
    const Age = createContext(34);
    const run = createRunner();
    const result = run(() => perform(Age));

    expect(result).toBe(34);
  });

  it('allows a performed context to use the passed in context value', () => {
    const Age = createContext(34);
    const run = createRunner([Age, 35]);
    const result = run(() => perform(Age));

    expect(result).toBe(35);
  });

  it('it allows nested runners to read context values correctly', () => {
    const Age = createContext(33);
    const Name = createContext('Alejandro');

    const outerRun = createRunner([Age, 34]);
    const innerRun = createRunner([Name, 'Marcel']);

    const result = outerRun(() => {
      return innerRun(() => {
        return `${perform(Name)} is ${perform(Age)} years old`;
      });
    });

    expect(result).toBe('Marcel is 34 years old');
  });

  it('allows async tasks to read values correctly', async () => {
    const Age = createContext(0);
    const run = createRunner([Age, 34]);

    const result = await run(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return perform(Age);
    });

    expect(result).toBe(34);
  });

  it('throws if pair is invalid', () => {
    // @ts-expect-error
    const fn = () => createRunner([]);
    expect(fn).toThrowErrorMatchingInlineSnapshot(`"Missing Context in pair"`);
  });

  it('throws if pair is custom object', () => {
    // @ts-expect-error
    const fn = () => createRunner([{ defaultValue: 'xyz' }]);
    expect(fn).toThrowErrorMatchingInlineSnapshot(
      `"Context needs to be created by \`createContext\`"`
    );
  });
});

describe('Perform', () => {
  it('should return default context value when run outside runner', () => {
    const Age = createContext(34);
    expect(perform(Age)).toBe(34);
  });
});
