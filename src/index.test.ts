import { createHandler, createRunner, perform } from '.';

describe('Runner', () => {
  it('runner returns the return value of callback', () => {
    const run = createRunner(() => 'A return value');
    const result = run();

    expect(result).toBe('A return value');
  });

  it('allows a performed context to use the default context value', () => {
    const Age = createHandler(34);
    const run = createRunner(() => perform(Age));
    const result = run();

    expect(result).toBe(34);
  });

  it('allows a performed context to use the passed in context value', () => {
    const Age = createHandler(34);
    const run = createRunner(() => perform(Age));
    const result = run([Age, 35]);

    expect(result).toBe(35);
  });

  it('it allows nested runners to read context values correctly', () => {
    const Age = createHandler(33);
    const Name = createHandler('Alejandro');

    const outerRun = createRunner(() => innerRun([Name, 'Marcel']));
    const innerRun = createRunner(
      () => `${perform(Name)} is ${perform(Age)} years old`
    );

    const result = outerRun([Age, 34]);

    expect(result).toBe('Marcel is 34 years old');
  });

  it('allows async tasks to read values correctly', async () => {
    const Age = createHandler(0);
    const run = createRunner(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return perform(Age);
    });

    const result = await run([Age, 34]);

    expect(result).toBe(34);
  });

  it('throws if pair is invalid', () => {
    // @ts-expect-error
    const fn = () => createRunner()([]);
    expect(fn).toThrowErrorMatchingInlineSnapshot(`"Missing Handler in pair"`);
  });

  it('throws if pair is custom object', () => {
    // @ts-expect-error
    const fn = () => createRunner()([{ defaultValue: 'xyz' }]);
    expect(fn).toThrowErrorMatchingInlineSnapshot(
      `"Handler needs to be created by \`createHandler\`"`
    );
  });
});

describe('Perform', () => {
  it('should return default context value when run outside runner', () => {
    const Age = createHandler(34);
    expect(perform(Age)).toBe(34);
  });
});
