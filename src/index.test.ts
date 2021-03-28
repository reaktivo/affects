
import { createContext, createRunner, perform } from '.';

const Age = createContext(30);
const Name = createContext('Marcel');

const run = createRunner([Age, 29])
const run2 = createRunner([Name, 'Not Marcel']);

run(() => {
  setTimeout(() => {
    run2(() => {
      const age = perform(Age);
      const name = perform(Name);
      console.log(`age ${age} name ${name}`);
    });    
  }, 5);
});

describe('Runner', () => {
  it('runner returns the return value of callback', () => {
    const run = createRunner();
    const result = run(() => 'A return value');
    expect(result).toBe('A result value');
  });
});
