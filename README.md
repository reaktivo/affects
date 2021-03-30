### Affects

Affects is a Algebraic Effects inspired library for Node.

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/reaktivo/affects/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/affects.svg?style=flat)](https://www.npmjs.com/package/affects)
![Build status](https://github.com/github/reaktivo/affects/workflows/main.yml/badge.svg)
[![Coverage](https://img.shields.io/codecov/c/github/reaktivo/affects.svg)](https://codecov.io/gh/reaktivo/react-nest)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/reaktivo/affects/compare)

## What is Affects

Affects is a Algebraic Effects inspired library. If you're coming from the React world, you can think of it as the provider of Context and the useContext hook, but for regular javascript.

Affects provides user friendly thread-local storage to Node.js.

## Examples

```js
import { createHandler, createRunner, perform } from 'affects';

// First create a handler that you can use to refer and set a default value
const User = createHandler({ name: '', email: '' });

// Use the handler in a function
async function emailUser() {
  const user = perform(User);
  await thirdPartyApi.email(user.email);
}

async function expressEmailUser(request, response) {
  if (!request.user) {
    return;
  }
  const run = createRunner(() => emailUser());
  await run([User, request.user]);
  response.send(200);
}
```

Although this example might not be the best, you will be able to notice that `emailUser` doesn't actually receive the user from an argument nor from scope, `perform(User)` is actually obtaining the value from storage local to that thread.

This is a feature that is helpful in multiple scenarios:
- Dependency injection
- Mocking
- Etc

### Mocking

Let's take the following example:

```js
export const WriteToPath = createHandler(fs.writeFile);

export const writeConfig = createRunner(async () => {
  const home = await getUserDir();
  perform(WriteToPath)(`${home}/config.txt`, config);
});

// another file
import { writeConfig } from './writeConfig';
writeConfig();
```

By default, `writeConfig` when performing `WriteToPath` will obtain a copy of `fs.writeToFile`, with no modification.

If you would need to run the function, but replace any writing to disk with logs to console, you would:

```js
import { writeConfig, WriteToPath } from './writeConfig';
writeConfig([WriteToPath, (path, data) => console.log(`Wrote to ${path}`)]);
```

If you have read [Algebraic Effects for the Rest of Us](https://overreacted.io/algebraic-effects-for-the-rest-of-us/), you might find the following adapted version of Dan Abramov's example easier to follow:

```js
import { createHandler, createRunner, perform } from 'affects';

const AskName = createHandler();

function getName(user) {
  let name = user.name;
  if (name === null) {
  	name = perform(AskName);
  }
  return name;
}

function makeFriends(user1, user2) {
  user1.friendNames.push(getName(user2));
  user2.friendNames.push(getName(user1));
}

const arya = { name: null, friendNames: [] };
const gendry = { name: 'Gendry', friendNames: [] };
const run = createRunner(() => makeFriends(arya, gendry));

run([AskName, 'Arya Stark']);
```

## Api

Affects only exports 3 functions:

### `createHandler`

Will create an object with a unique identity that is used to refer to when calling `perform`. Additionally it will hold a default value that is used if `perform` is called outside a runner.
You might find it similar to [React's `createContext`](https://reactjs.org/docs/context.html#reactcreatecontext), in fact, it's modeled after it.

```js
const MyHandler = createHandler(defaultValue);
```

### `createRunner`

In most [papers](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/08/algeff-tr-2016-v2.pdf) and [blog posts](https://overreacted.io/algebraic-effects-for-the-rest-of-us/), handlers are inserted in a way similar to the handling of raised exceptions. This is sadly not possible without either modifying the language or converting everything into generator functions.

With `affects`, handlers are passed in as pairs to the function returned by createRunner

```js
// someFunction is a function that calls `perform` either directly or not, synchronously or not.
const run = createRunner(someFunction);
run([Handler, customValue], [AnotherHandler, anotherCustomValue]);
```

### `perform`

Perform will pull in the matching value for a handler, in a similar way to [React's `useContext`](https://reactjs.org/docs/hooks-reference.html#usecontext). Note that unlike `useContext`, `perform` will work across asynchronous work boundaries. Another important feature of `perform` is that it's fully typed and will use the type of your defaultValue as the type that it returns.

```js
const user = perform(User);
```

## Typescript

Affects is fully typed, meaning that `perform`ed values will return the correct types.

## Installation

`npm install affects`

## Limitations

Affects doesn't solve the ["color of your function"](https://journal.stuffwithstuff.com/2015/02/01/what-color-is-your-function/) which means that effects that were originally intended to be synchronous can't be resumed in an asynchronous way.

## License

react-nest is open source software [licensed as MIT](https://github.com/reaktivo/react-nest/blob/master/LICENSE).
