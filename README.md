A simple AI-powered chatbot built with Node.js, HTML, and LangChain.js, enhanced with real-time weather updates using the RequestsGetTool.

✨ Features
🤖 LLM-powered chat interface using LangChain

🌍 Live weather data using RequestsGetTool

🧠 Prompt management and basic memory integration

🛠️ Node.js backend with a lightweight HTML frontend

📦 Tech Stack
Node.js (Backend)

LangChain.js

OpenAI API

RequestsGetTool (for weather data)

HTML/CSS (Frontend)







===> NPM vs NPX vs BUN vs pnpm

| Tool     | Purpose                                 | Best For                     |
| -------- | --------------------------------------- | ---------------------------- |
| **npm**  | The OG. Node package manager.           | Industry default, reliable   |
| **npx**  | Executes packages (no install required) | One-time CLI runs            |
| **yarn** | Facebook’s fast alternative to npm      | Workspaces, slightly faster  |
| **pnpm** | Turbo npm with symlink magic            | Speed demons, monorepos      |
| **bun**  | JS runtime + bundler + npm replacement  | Insanely fast dev experience |

| Action        | npm               | yarn           | pnpm           | bun              |
| ------------- | ----------------- | -------------- | -------------- | ---------------- |
| Init project  | `npm init`        | `yarn init`    | `pnpm init`    | `bun init`       |
| Install deps  | `npm install`     | `yarn`         | `pnpm install` | `bun install`    |
| Add 1 pkg     | `npm install pkg` | `yarn add pkg` | `pnpm add pkg` | `bun add pkg`    |
| Add dev dep   | `npm i -D pkg`    | `yarn add -D`  | `pnpm add -D`  | `bun add -d pkg` |
| Run script    | `npm run dev`     | `yarn dev`     | `pnpm dev`     | `bun run dev`    |
| Run local CLI | `npx pkg`         | `yarn dlx pkg` | `pnpm dlx pkg` | `bunx pkg`       |


===> Generator functions
A generator function is a special type of function in JavaScript that can:
pause its execution (yield), resume later,return multiple values over time
behave like a Netflix show you can pause, resume, and binge one frame at a time 

        function* generatorFunc() {
            yield 'First';
            yield 'Second';
            yield 'Third';
        }

        // Use // 
        const gen = generatorFunc();

        console.log(gen.next()); // { value: 'First', done: false }
        console.log(gen.next()); // { value: 'Second', done: false }
        console.log(gen.next()); // { value: 'Third', done: false }
        console.log(gen.next()); // { value: undefined, done: true }

=================== Single yield and multiple next() ===================

        function* gen() {
        yield "Hi";
        }

        const g = gen();
        console.log(g.next());  // {value: 'Hi', done: false}
        console.log(g.next()); // {value: undefined, done: true}

===> Object Descriptors & Object.defineProperty
Every JS object property has a descriptor, controlling its behavior:

| Property       | Meaning                            | Default     |
| -------------- | ---------------------------------- | ----------- |
| `value`        | Actual value                       | `undefined` |
| `writable`     | Can it be changed?                 | `false`     |
| `enumerable`   | Will it show in loops?             | `false`     |
| `configurable` | Can descriptor be changed/deleted? | `false`     |
| `get`          | Getter function                    | `undefined` |
| `set`          | Setter function                    | `undefined` |

        const obj = {};
        Object.defineProperty(obj, 'x', {
        value: 42,
        writable: false,
        enumerable: true,
        configurable: false
        });

        console.log(obj.x);        // 42
        obj.x = 100;
        console.log(obj.x);        // 42 (because writable: false)

===> WeakMap vs Map, WeakSet vs Set

**Map**                                             || **WeakMap**
Key-value store                                     || Keys must be objects
Keys can be any type                                || Keys are weakly held → if no other references exist
Keeps keys in memory (strong reference)             || No iteration, no size, no keys list
        const m = new Map();                        ||      const wm = new WeakMap();
        const obj = {};                             ||      wm.set({}, 'hello');
        m.set(obj, 123);

**Set**                                             || **WeakSet**
Collection of unique values                         || Only objects
const s = new Set([1, 2, 2, 3]);                    || const ws = new WeakSet();
// → Set {1, 2, 3}                                  || ws.add({});


===> Implement Once(fn)
        function once(fn) {
        let count = 0 
        return function(...args){
            if(count === 0){
            count++
            return fn.call(this,...args)
            }
        }
        }
        const log = once(console.log);
        log("Hi");   // prints "Hi"
        log("Again"); // does nothing

===> Deep clone an object 
way 1 : const copied = JSON.parse(JSON.stringify(original));
way 2: 
        function deepClone(obj) {
        if (typeof obj !== 'object' || obj === null) return obj;

        const clone = Array.isArray(obj) ? [] : {};
        for (let key in obj) {
            clone[key] = deepClone(obj[key]);
        }
        return clone;
        }


===> Output? and why?
        const obj = {
        name: "Lion",
        logName() {
            setTimeout(function () {
            console.log(this.name);
            }, 100);
        },
        };

        obj.logName(); // undefined
Because inside setTimeout(), the callback function has its own this context — and it doesn’t refer to obj, it refers to the global object. window.name = undefined

Fixes: 
1. Arrow Func:  
                const obj = {
                name: "Lion",
                logName() {
                    setTimeout(() => {
                    console.log(this.name); // ✅ this refers to obj
                    }, 100);
                },
                };
2. Bind: 
                const obj = {
                name: "Lion",
                logName() {
                    setTimeout(function () {
                    console.log(this.name);
                    }.bind(this), 100);
                },
                };

===> Build a retry(fn, retries, delay)
        function retry(fn, retries = 3, delay = 1000) {
        return new Promise((resolve, reject) => {
            function attempt() {
            fn()
                .then(resolve)
                .catch((err) => {
                if (retries === 0) {
                    return reject(err);
                }
                retries--;
                setTimeout(attempt, delay);
                });
            }

            attempt();
        });
        }

===> Implement add(1, 2)(3)(4, 5)(6)() // → 21

        function add(...args) {
        let total = args.reduce((acc, val) => acc + val, 0);

        function inner(...nextArgs) {
            if (nextArgs.length === 0) return total;
            total += nextArgs.reduce((acc, val) => acc + val, 0);
            return inner;
        }

        return inner;
        }

===> Custom Event Listener

        class EventEmitter {
        constructor() {
            this.events = {}; // store event: listeners[]
        }

        on(eventName, callback) {
            if (!this.events[eventName]) {
            this.events[eventName] = [];
            }
            this.events[eventName].push(callback);
        }

        emit(eventName, ...args) {
            const listeners = this.events[eventName];
            if (listeners) {
            listeners.forEach((listener) => listener(...args));
            }
        }

        off(eventName, callback) {
            if (!this.events[eventName]) return;

            this.events[eventName] = this.events[eventName].filter(
            (listener) => listener !== callback
            );
        }

        once(eventName, callback) {
            const wrapper = (...args) => {
            callback(...args);
            this.off(eventName, wrapper); // Remove after 1 run
            };
            this.on(eventName, wrapper);
        }
        }


===> CRA vs Vite@Latest
npx create-react-app my-app
Uses Webpack (heavy, slow). Great in 2017. Not so hot in 2025. Zero-config... until you need config.
To customize? You eject and cry 😢.

npm create vite@latest my-app --template react
Built with ESBuild + Rollup. Transpiles in milliseconds. Native ESM (ECMAScript Modules).
Supports TypeScript, JSX, CSS Modules, and more — no setup. Instant hot reload even with big apps.
Much smaller, faster final builds.

Why CRA is falling out of favor:
No major updates recently.
React 18 support felt laggy.
Forces Webpack and Babel.
You need react-scripts for everything (opaque).

===> What is a Webpack?
Webpack is a module bundler.
It takes all your files (JS, CSS, images, etc.), smashes them into a few optimized bundles, and serves them to the browser efficiently.

Why Webpack is required:
browsers don't natively understand import statements across dozens of files — especially for CSS, images, SVGs, etc.
We need a tool to:
Resolve dependencies, Transpile code (ES6 → ES5), Minify for production and Optimize performance (tree-shaking, code-splitting)

Basic Webpack.config.js:
            const path = require('path');

            module.exports = {
            entry: './src/index.js',
            output: {
                path: path.resolve(__dirname, 'dist'),
                filename: 'bundle.js'
            },
            module: {
                rules: [
                { test: /\.css$/, use: ['style-loader', 'css-loader'] }
                ]
            },
            plugins: [],
            mode: 'development'
            };
Webpack: Is slow for large projects. Has a steep learning curve. Requires a config file with ancient sorcery

===>What Exactly is Tree Shaking?
Tree shaking is the process of removing unused (dead) code from your JavaScript bundle during the build process.
It’s called tree shaking because:
The dependency graph is like a tree 🌳
You "shake" the tree to remove dead branches (unused exports)

🔧 How Does Tree Shaking Work?
✅ For it to work, you must:
Use ES Modules (import/export). Use a bundler that supports it (like Webpack, Rollup, Vite)

            // utils.js
            export function add(a, b) { return a + b; }
            export function multiply(a, b) { return a * b; }

            // main.js
            import { add } from './utils';

            console.log(add(2, 3)); // multiply is unused

In production, multiply() is tree-shaken out of the final bundle.

===> Bundle vs Build

🧱 "Build" = The Entire Process                         
Think of building as the full pipeline that prepares your app for production.
Analogy: Full car assembly process

📦 "Bundle" = Just One Step
Bundling is the act of combining your source files into one or more files that browsers can understand.
Analogy: The engine, built from many smaller parts



