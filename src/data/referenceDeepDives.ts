// ─── Language & Framework Reference: deep dives ────────────────────────────
// A handful of reference items (see ./reference.ts) are dense enough to
// deserve more than a one-line summary — a fuller explanation, the gotchas
// that actually trip people up in interviews, and a longer worked example.
// An item opts in by setting `deepDiveId` to the matching ReferenceDeepDive's
// `id`; it then links to `#/reference/deepdive/:id` instead of rendering as
// plain text. Same idiom as the system-design DEEP_DIVES in ./deepdives.ts,
// but scoped per-item rather than per-strategy-family.
//
// Pilot scope: JavaScript only, for now — six items chosen for teachable
// depth (a real gotcha or mental-model shift), not exhaustive coverage.
// Extend to other languages by following this same shape.

export interface ReferenceDeepDive {
  id: string;
  /** Which LanguageRef this belongs to, for the breadcrumb back-link. */
  langId: string;
  title: string;
  /** Two-to-four sentences of fuller explanation than the item's one-line summary. */
  intro: string;
  /** The specific mistakes/surprises people run into with this — not generic advice. */
  gotchas: string[];
  code: string;
  /** Names of other reference items worth knowing alongside this one. */
  related?: string[];
}

export const REFERENCE_DEEP_DIVES: ReferenceDeepDive[] = [
  {
    id: "js-sort",
    langId: "javascript",
    title: "Array.prototype.sort(fn)",
    intro:
      "sort() mutates the array in place and returns the same reference. Without a comparator, every " +
      "element is converted to a string and compared lexicographically — which is why [10, 2, 1].sort() " +
      "produces [1, 10, 2], not [1, 2, 10]. A comparator function fixes this: return a negative number to " +
      "put a before b, positive to put b before a, zero to leave their order unchanged. Since ES2019 the " +
      "spec guarantees sort() is stable — equal elements keep their original relative order, which matters " +
      "when you sort by one key after already sorting by another.",
    gotchas: [
      "Default (no-argument) sort always compares as strings — numeric input needs an explicit comparator: arr.sort((a, b) => a - b).",
      "sort() mutates the original array. To sort a copy, spread first: [...arr].sort(...) or use toSorted() (ES2023) which returns a new array.",
      "A comparator that isn't a strict total order (e.g. returning true/false instead of a number, or being inconsistent) gives undefined behavior in some engines — always return a number.",
      "Stability (guaranteed since ES2019) is what makes 'sort by secondary key, then sort by primary key' actually work correctly.",
    ],
    code:
      "// Numeric sort — the #1 sort() interview gotcha\n" +
      "[10, 2, 1].sort();                 // ['1', '10', '2']  (string comparison!)\n" +
      "[10, 2, 1].sort((a, b) => a - b);  // [1, 2, 10]         (correct)\n" +
      "\n" +
      "// Sort objects by a key\n" +
      "people.sort((a, b) => a.age - b.age);\n" +
      "\n" +
      "// Stable multi-key sort: sort by lastName, ties broken by firstName\n" +
      "people.sort((a, b) => a.firstName.localeCompare(b.firstName));\n" +
      "people.sort((a, b) => a.lastName.localeCompare(b.lastName));\n" +
      "// ^ safe because sort() is stable — the firstName order survives within each lastName group\n" +
      "\n" +
      "// Non-mutating sort\n" +
      "const sorted = [...arr].sort((a, b) => a - b);  // or arr.toSorted((a, b) => a - b)",
    related: ["reduce(fn, init)", "splice(start, count, ...items)"],
  },
  {
    id: "js-reduce",
    langId: "javascript",
    title: "Array.prototype.reduce(fn, init)",
    intro:
      "reduce() walks the array left to right, carrying an accumulator forward: at each step it calls " +
      "fn(accumulator, currentItem, index, array) and the return value becomes the accumulator for the " +
      "next step. The final accumulator is reduce()'s return value. Because the accumulator can be any " +
      "shape — a number, an array, an object, a Map — reduce() can express sum, count, group-by, flatten, " +
      "or even map/filter themselves; it's the most general of the array iteration methods, which is also " +
      "why overusing it can hurt readability compared to a purpose-built method.",
    gotchas: [
      "Omitting init on an empty array throws a TypeError ('Reduce of empty array with no initial value') — always pass init unless you're certain the array is non-empty.",
      "Without init, the first array element is used as the initial accumulator and iteration starts at index 1 — this silently changes indices inside fn versus the init-supplied case.",
      "Building up an object/array accumulator without mutating a fresh one each call (e.g. spreading into a new object every iteration) is O(n²) — mutate the same accumulator in place instead.",
      "If you only need a boolean/first-match/every-element check, some()/every()/find() are clearer and stop early; reduce() always visits every element.",
    ],
    code:
      "// Sum\n" +
      "[1, 2, 3].reduce((sum, n) => sum + n, 0);  // 6\n" +
      "\n" +
      "// Group by (accumulator is an object) — mutate acc in place, don't spread per-iteration\n" +
      "const byLevel = items.reduce((acc, item) => {\n" +
      "  (acc[item.level] ??= []).push(item);\n" +
      "  return acc;\n" +
      "}, {});\n" +
      "\n" +
      "// Count occurrences (accumulator is a Map)\n" +
      "const counts = words.reduce((acc, w) => acc.set(w, (acc.get(w) ?? 0) + 1), new Map());\n" +
      "\n" +
      "// The empty-array trap\n" +
      "[].reduce((a, b) => a + b);        // TypeError: Reduce of empty array with no initial value\n" +
      "[].reduce((a, b) => a + b, 0);      // 0 — safe, because init was supplied",
    related: ["sort(fn)", "map(fn)", "filter(fn)"],
  },
  {
    id: "js-splice",
    langId: "javascript",
    title: "Array.prototype.splice(start, deleteCount, ...items)",
    intro:
      "splice() is the one array method that mutates, removes, and inserts all in a single call — every " +
      "other common array method does at most one of those. It returns an array of the removed elements " +
      "(empty array if none were removed). start can be negative to count from the end. Because it changes " +
      "the array's length in place, it's easy to confuse with slice() (which never mutates and only " +
      "extracts a copy) — the similar name is a well-known source of bugs.",
    gotchas: [
      "splice() mutates the original array; slice() does not. They are not interchangeable despite the near-identical name.",
      "Omitting deleteCount removes everything from start to the end of the array, not zero elements.",
      "deleteCount: 0 with extra arguments inserts without removing anything: arr.splice(2, 0, 'x') inserts 'x' at index 2.",
      "The return value is the removed elements, not the mutated array — a common mistake is chaining off splice()'s return expecting the full array back.",
    ],
    code:
      "const arr = ['a', 'b', 'c', 'd', 'e'];\n" +
      "\n" +
      "// Remove 2 elements starting at index 1\n" +
      "const removed = arr.splice(1, 2);   // removed = ['b', 'c'], arr is now ['a', 'd', 'e']\n" +
      "\n" +
      "// Insert without removing (deleteCount: 0)\n" +
      "arr.splice(1, 0, 'x', 'y');          // arr is now ['a', 'x', 'y', 'd', 'e']\n" +
      "\n" +
      "// Replace in place (remove then insert in one call)\n" +
      "arr.splice(0, 1, 'A');               // arr is now ['A', 'x', 'y', 'd', 'e']\n" +
      "\n" +
      "// Negative start — counts from the end\n" +
      "arr.splice(-1, 1);                   // removes the last element\n" +
      "\n" +
      "// Non-mutating equivalent, if you need the original array untouched\n" +
      "const withoutFirstTwo = [...arr.slice(0, 1), ...arr.slice(3)];",
    related: ["sort(fn)", "slice(start, end)"],
  },
  {
    id: "js-closures",
    langId: "javascript",
    title: "Closures",
    intro:
      "A closure is what you get whenever a function is defined inside another function and keeps access " +
      "to that outer function's variables even after the outer function has already returned. JavaScript " +
      "doesn't garbage-collect those outer variables as long as an inner function still references them. " +
      "This is the mechanism behind private state without classes (module pattern), memoization caches, " +
      "and event-handler callbacks that 'remember' the value they were created with — and it's also the " +
      "root cause of the single most common JS interview gotcha, the var-in-a-loop bug.",
    gotchas: [
      "The classic loop bug: `for (var i = 0; i < 3; i++) setTimeout(() => console.log(i), 0)` logs 3, 3, 3 — because var is function-scoped, all three closures share the same i, which is 3 by the time the callbacks run.",
      "The fix is `let` instead of `var` — let is block-scoped, so each loop iteration gets its own binding, and the closures each capture a different i (logs 0, 1, 2).",
      "Closures capture variables by reference, not by value at creation time — if the outer variable is reassigned later, every closure over it sees the new value.",
      "Holding a closure alive (e.g. storing a callback long-term) keeps its entire captured scope alive too — an easy, easy-to-miss memory leak source for large captured objects.",
    ],
    code:
      "// The classic bug\n" +
      "for (var i = 0; i < 3; i++) {\n" +
      "  setTimeout(() => console.log(i), 0);  // logs 3, 3, 3\n" +
      "}\n" +
      "for (let i = 0; i < 3; i++) {\n" +
      "  setTimeout(() => console.log(i), 0);  // logs 0, 1, 2 — let is block-scoped per iteration\n" +
      "}\n" +
      "\n" +
      "// Private state via closure (no class needed)\n" +
      "function makeCounter() {\n" +
      "  let count = 0;                 // not accessible from outside — true privacy\n" +
      "  return {\n" +
      "    increment: () => ++count,\n" +
      "    value: () => count,\n" +
      "  };\n" +
      "}\n" +
      "const counter = makeCounter();\n" +
      "counter.increment(); counter.increment();\n" +
      "counter.value();  // 2 — count itself is unreachable from the outside",
    related: ["Arrow functions", "Higher-order functions", "IIFE", "Memoization"],
  },
  {
    id: "js-iterator-protocol",
    langId: "javascript",
    title: "Symbol.iterator protocol",
    intro:
      "for...of, spread (...), Array.from(), and destructuring all work on any object that implements the " +
      "iterable protocol — arrays, strings, Maps, and Sets are built-in iterables, but plain objects are " +
      "not. Implementing it yourself means giving an object a method keyed by the well-known symbol " +
      "Symbol.iterator, which must return an iterator: an object with a next() method returning " +
      "{ value, done }. This is what actually makes 'iterable' a real, checkable interface in JS rather " +
      "than a vague description.",
    gotchas: [
      "Plain objects are not iterable by default — `for (const x of {a: 1})` throws 'is not iterable'; use Object.entries()/keys()/values() to get an iterable view instead.",
      "Symbol.iterator must return an iterator (an object with next()), not a value directly — a common mistake is implementing next() directly on the object and forgetting the [Symbol.iterator]() wrapper that returns `this`.",
      "A generator function (function*) automatically satisfies the iterator protocol, so `[Symbol.iterator]: function* () { yield ...; }` is usually far less code than hand-writing next()/done.",
      "Iterables are consumed once per iterator — running two for...of loops over the same custom iterable requires [Symbol.iterator]() to return a *fresh* iterator each call, not a shared, already-exhausted one.",
    ],
    code:
      "// Hand-written iterator (verbose form)\n" +
      "const range = {\n" +
      "  from: 1, to: 3,\n" +
      "  [Symbol.iterator]() {\n" +
      "    let current = this.from, last = this.to;\n" +
      "    return {\n" +
      "      next() {\n" +
      "        return current <= last\n" +
      "          ? { value: current++, done: false }\n" +
      "          : { value: undefined, done: true };\n" +
      "      },\n" +
      "    };\n" +
      "  },\n" +
      "};\n" +
      "[...range];              // [1, 2, 3] — spread works because range is now iterable\n" +
      "for (const n of range) console.log(n);  // for...of works too\n" +
      "\n" +
      "// Same thing, far less code, using a generator\n" +
      "const range2 = {\n" +
      "  from: 1, to: 3,\n" +
      "  *[Symbol.iterator]() {\n" +
      "    for (let n = this.from; n <= this.to; n++) yield n;\n" +
      "  },\n" +
      "};",
    related: ["for...of", "Generators (function* / yield)", "yield*"],
  },
  {
    id: "js-promise-combinators",
    langId: "javascript",
    title: "Promise.all / allSettled / race / any",
    intro:
      "All four take an array (or iterable) of promises and run them concurrently, but they differ in when " +
      "they settle and how they handle rejection — a distinction that comes up constantly in interviews " +
      "because it's easy to reach for all() when allSettled() is what the requirements actually call for.",
    gotchas: [
      "Promise.all() rejects immediately on the FIRST rejection, even if other promises would have succeeded — the successful results are simply discarded, not returned.",
      "Promise.allSettled() never rejects — it always resolves, with each entry tagged { status: 'fulfilled', value } or { status: 'rejected', reason }. Use it when partial failure is acceptable and you need every result.",
      "Promise.race() settles (fulfilled OR rejected) on whichever promise finishes first — a rejection can win the race just as easily as a fulfillment, which surprises people expecting 'first successful result'.",
      "Promise.any() is the one that actually means 'first success': it resolves on the first fulfillment and only rejects if ALL promises reject, bundling the failures into an AggregateError.",
    ],
    code:
      "const requests = [fetchA(), fetchB(), fetchC()];  // fetchB() rejects\n" +
      "\n" +
      "await Promise.all(requests);\n" +
      "// throws immediately with fetchB's error — fetchA/fetchC results are lost\n" +
      "\n" +
      "await Promise.allSettled(requests);\n" +
      "// [{status:'fulfilled', value:...}, {status:'rejected', reason:...}, {status:'fulfilled', value:...}]\n" +
      "// never throws — you inspect .status on each entry yourself\n" +
      "\n" +
      "await Promise.race(requests);\n" +
      "// settles with whichever of A/B/C finishes first, success or failure\n" +
      "\n" +
      "await Promise.any(requests);\n" +
      "// resolves with the first SUCCESSFUL result (fetchA or fetchC)\n" +
      "// only throws AggregateError if all three reject",
    related: ["async/await", "try/catch around await"],
  },
];

export function findReferenceDeepDive(id: string): ReferenceDeepDive | undefined {
  return REFERENCE_DEEP_DIVES.find((d) => d.id === id);
}
