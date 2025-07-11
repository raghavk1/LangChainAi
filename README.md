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
