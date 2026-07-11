// ─── Language & framework reference library ────────────────────────────────
// A browsable, leveled (beginner → advanced) reference of core methods and
// concepts per language/framework — separate from the runnable Problem model
// in ./types.ts, same spirit as the glossary in ./architecture.ts.
//
// This is intentionally curated, not exhaustive: every entry here is a
// well-established, stable API that's safe to state confidently. For
// anything not listed, ask the buddy panel (the local LLM has its own
// knowledge of the language and can answer arbitrary method questions on
// demand — no need to hand-author every possible method here).
//
// Add a new language by pushing a LanguageRef with empty `categories: []`
// (renders as "reference coming soon"), then fill it in incrementally.

export type RefLevel = "beginner" | "intermediate" | "advanced";

export interface RefItem {
  /** The method/keyword/concept name, e.g. "Array.prototype.map()". */
  name: string;
  level: RefLevel;
  /** One or two plain-English sentences: what it does and why it matters. */
  summary: string;
  /** Optional short usage example. */
  example?: string;
  /** If set, the item links to a fuller ReferenceDeepDive (see ./referenceDeepDives.ts) instead of rendering as plain text. */
  deepDiveId?: string;
}

export interface RefCategory {
  id: string;
  name: string;
  items: RefItem[];
}

export interface LanguageRef {
  id: string;
  name: string;
  tagline: string;
  categories: RefCategory[];
}

// ─── JavaScript ─────────────────────────────────────────────────────────────

const javascript: LanguageRef = {
  id: "javascript",
  name: "JavaScript",
  tagline: "The language this whole app runs on. Core built-ins, from array basics to prototype internals.",
  categories: [
    {
      id: "js-arrays",
      name: "Arrays",
      items: [
        { name: "push(item)", level: "beginner", summary: "Add item(s) to the end (mutates), returns new length.", example: "arr.push(4)" },
        { name: "pop()", level: "beginner", summary: "Remove and return the last item (mutates)." },
        { name: "shift()", level: "beginner", summary: "Remove and return the first item (mutates)." },
        { name: "unshift(item)", level: "beginner", summary: "Add item(s) to the start (mutates)." },
        { name: "length", level: "beginner", summary: "Property: number of items in the array." },
        { name: "indexOf(item)", level: "beginner", summary: "First index of item, or -1 if not found." },
        { name: "includes(item)", level: "beginner", summary: "True/false whether the array contains item — correctly handles NaN, unlike indexOf." },
        { name: "slice(start, end)", level: "beginner", summary: "Shallow copy of a portion; does not mutate the original." },
        { name: "map(fn)", level: "intermediate", summary: "New array with fn applied to every item." },
        { name: "filter(fn)", level: "intermediate", summary: "New array of items where fn returns true." },
        { name: "reduce(fn, init)", level: "intermediate", summary: "Fold the array down to a single value, left to right.", deepDiveId: "js-reduce" },
        { name: "forEach(fn)", level: "intermediate", summary: "Run fn on every item; returns undefined — no chaining." },
        { name: "find(fn) / findIndex(fn)", level: "intermediate", summary: "First matching item (or its index), or undefined/-1." },
        { name: "some(fn) / every(fn)", level: "intermediate", summary: "True if fn holds for at least one / all items." },
        { name: "sort(fn)", level: "intermediate", summary: "Sorts in place; without a comparator it sorts as strings — [10,2].sort() gives [10,2], not [2,10].", deepDiveId: "js-sort" },
        { name: "concat(other)", level: "intermediate", summary: "New array combining this with other array(s), no mutation." },
        { name: "flat(depth) / flatMap(fn)", level: "intermediate", summary: "Flatten nested arrays; flatMap is map() then flat(1) in one pass." },
        { name: "join(sep)", level: "intermediate", summary: "Join items into a string with sep as separator." },
        { name: "splice(start, count, ...items)", level: "intermediate", summary: "Remove/insert in place; returns removed items — the only method that both mutates and inserts.", deepDiveId: "js-splice" },
        { name: "Array.from(iterable)", level: "advanced", summary: "Build a real array from an iterable or array-like (NodeList, arguments, a Set)." },
        { name: "Array.of(...items)", level: "advanced", summary: "Build from arguments directly, avoiding the new Array(7) 'length 7' footgun." },
        { name: "reduceRight(fn, init)", level: "advanced", summary: "Like reduce but folds right to left." },
        { name: "copyWithin(target, start, end)", level: "advanced", summary: "Copy a slice of the array onto itself, in place, without changing length." },
        { name: "Symbol.iterator", level: "advanced", summary: "What makes arrays work with for...of and spread — arrays are iterable, not just indexable." },
      ],
    },
    {
      id: "js-strings",
      name: "Strings",
      items: [
        { name: "length", level: "beginner", summary: "Property: number of UTF-16 code units." },
        { name: "toUpperCase() / toLowerCase()", level: "beginner", summary: "Case conversion." },
        { name: "trim()", level: "beginner", summary: "Remove whitespace from both ends." },
        { name: "slice(start, end)", level: "beginner", summary: "Extract a substring; supports negative indices, unlike substring()." },
        { name: "split(sep)", level: "beginner", summary: "Split into an array of substrings." },
        { name: "includes(sub) / indexOf(sub)", level: "beginner", summary: "Substring search." },
        { name: "replace(pattern, replacement)", level: "beginner", summary: "Replace the first match only." },
        { name: "replaceAll(pattern, replacement)", level: "intermediate", summary: "Replace every match; pattern can be a string or a /g regex." },
        { name: "padStart(len, pad) / padEnd(len, pad)", level: "intermediate", summary: "Pad to a target length — e.g. zero-padding numbers." },
        { name: "repeat(n) / startsWith(sub) / endsWith(sub)", level: "intermediate", summary: "Repeat, or check prefix/suffix." },
        { name: "Template literals `${}`", level: "intermediate", summary: "Multi-line strings with embedded expressions." },
        { name: "normalize()", level: "advanced", summary: "Normalize Unicode representation (e.g. combining accents) so string comparisons work correctly." },
        { name: "matchAll(regex)", level: "advanced", summary: "Iterator of all regex matches with capture groups (regex needs the /g flag)." },
        { name: "String.raw", level: "advanced", summary: "Tagged template returning the raw string, ignoring escape sequences — used for regex/paths." },
        { name: "codePointAt(i)", level: "advanced", summary: "Like charCodeAt but correctly handles characters outside the Basic Multilingual Plane (emoji, etc.)." },
      ],
    },
    {
      id: "js-objects",
      name: "Objects",
      items: [
        { name: "Object.keys(obj) / values(obj) / entries(obj)", level: "beginner", summary: "Arrays of an object's own enumerable keys, values, or [key, value] pairs." },
        { name: "Object.assign(target, ...sources)", level: "beginner", summary: "Shallow-copy/merge properties into target (mutates target)." },
        { name: "Spread {...obj}", level: "intermediate", summary: "Shallow copy/merge without mutating the original." },
        { name: "Destructuring `const {a, b} = obj`", level: "intermediate", summary: "Pull named properties into local variables." },
        { name: "Object.freeze(obj)", level: "intermediate", summary: "Prevent adding/removing/reassigning top-level properties — shallow only, nested objects stay mutable." },
        { name: "Object.fromEntries(pairs)", level: "intermediate", summary: "Build an object back from [key, value] pairs — inverse of Object.entries." },
        { name: "Optional chaining `obj?.a?.b`", level: "intermediate", summary: "Short-circuits to undefined instead of throwing on a missing intermediate property." },
        { name: "Nullish coalescing `a ?? b`", level: "intermediate", summary: "Falls back only on null/undefined, unlike || which also falls back on 0 or ''." },
        { name: "Object.defineProperty", level: "advanced", summary: "Define a property with fine-grained control: getter/setter, enumerable, writable, configurable." },
        { name: "Object.getPrototypeOf / setPrototypeOf", level: "advanced", summary: "Read or change what an object delegates lookups to." },
        { name: "Proxy", level: "advanced", summary: "Intercept fundamental operations (get/set/has/deleteProperty) on an object." },
        { name: "Reflect", level: "advanced", summary: "Companion to Proxy — the default behaviors you'd otherwise reimplement by hand inside traps." },
        { name: "structuredClone(obj)", level: "advanced", summary: "Built-in deep clone, handles cycles/Maps/Sets — unlike JSON.parse(JSON.stringify())." },
      ],
    },
    {
      id: "js-numbers",
      name: "Numbers & Math",
      items: [
        { name: "parseInt / parseFloat", level: "beginner", summary: "Parse a string into a number." },
        { name: "toFixed(n)", level: "beginner", summary: "Format to n decimal places, returns a string." },
        { name: "Math.round / floor / ceil / trunc", level: "beginner", summary: "Rounding variants." },
        { name: "Math.random()", level: "beginner", summary: "Random float in [0, 1)." },
        { name: "Math.max / Math.min", level: "beginner", summary: "Largest/smallest of the given arguments." },
        { name: "Number.isInteger(x)", level: "intermediate", summary: "Safer than a modulo check — correctly false for NaN/Infinity." },
        { name: "Number.isNaN(x)", level: "intermediate", summary: "Unlike global isNaN(), doesn't coerce its argument first." },
        { name: "Number.EPSILON", level: "intermediate", summary: "Smallest representable difference — use for float comparisons instead of ===." },
        { name: "Math.pow(base, exp) / `**`", level: "intermediate", summary: "Exponentiation." },
        { name: "Math.sqrt / Math.cbrt", level: "intermediate", summary: "Square/cube root." },
        { name: "Math.hypot(...values)", level: "advanced", summary: "sqrt(sum of squares) in one call, avoids intermediate overflow." },
        { name: "BigInt", level: "advanced", summary: "Arbitrary-precision integers (123n) for values beyond Number.MAX_SAFE_INTEGER." },
        { name: "Number.MAX_SAFE_INTEGER", level: "advanced", summary: "Above 2^53-1, integer math silently loses precision — the reason BigInt exists." },
      ],
    },
    {
      id: "js-collections",
      name: "Map, Set, WeakMap, WeakSet",
      items: [
        { name: "new Map() / .set / .get / .has / .delete", level: "beginner", summary: "Key-value store where keys can be any type, unlike plain objects which coerce keys to strings." },
        { name: "new Set() / .add / .has / .delete", level: "beginner", summary: "Collection of unique values." },
        { name: "Map/Set .size", level: "beginner", summary: "Property: number of entries." },
        { name: "for...of over Map/Set", level: "intermediate", summary: "Map yields [key, value] pairs; Set yields values directly." },
        { name: "[...set] / Array.from(set)", level: "intermediate", summary: "Dedupe an array in one line: [...new Set(arr)]." },
        { name: "WeakMap / WeakSet", level: "advanced", summary: "Keys must be objects, held weakly — entries can be garbage-collected, preventing leaks in object-keyed caches." },
        { name: "Map for O(1) memoization", level: "advanced", summary: "A Map keyed by an argument tuple/string as a memo cache, vs. an object's string-only keys." },
      ],
    },
    {
      id: "js-async",
      name: "Async & Promises",
      items: [
        { name: "new Promise((resolve, reject) => ...)", level: "beginner", summary: "Wrap async work in a value that eventually settles." },
        { name: ".then / .catch / .finally", level: "beginner", summary: "React to a Promise's fulfillment, rejection, or either." },
        { name: "async/await", level: "beginner", summary: "Syntactic sugar over Promises — await pauses the async function until the Promise settles." },
        { name: "try/catch around await", level: "intermediate", summary: "How you catch rejections with async/await instead of .catch()." },
        { name: "Promise.all(promises)", level: "intermediate", summary: "Run in parallel, resolves when ALL succeed, rejects immediately if ANY fails.", deepDiveId: "js-promise-combinators" },
        { name: "Promise.allSettled(promises)", level: "intermediate", summary: "Run in parallel, always resolves with each result's status — never short-circuits on failure.", deepDiveId: "js-promise-combinators" },
        { name: "Promise.race(promises)", level: "intermediate", summary: "Settles as soon as the first promise settles, fulfilled or rejected.", deepDiveId: "js-promise-combinators" },
        { name: "Promise.any(promises)", level: "advanced", summary: "Settles on the first fulfillment; rejects only if ALL reject (AggregateError).", deepDiveId: "js-promise-combinators" },
        { name: "Microtask vs. macrotask ordering", level: "advanced", summary: "Promise callbacks run before setTimeout callbacks, even setTimeout(fn, 0) — explains surprising execution order." },
        { name: "AbortController", level: "advanced", summary: "Standard cancellation signal, e.g. to cancel a fetch() or your own long-running async work." },
        { name: "Async generators / for await...of", level: "advanced", summary: "Iterate an async sequence (e.g. paginated API results) with normal for-loop syntax." },
      ],
    },
    {
      id: "js-functions",
      name: "Functions & Closures",
      items: [
        { name: "Function declaration vs. expression", level: "beginner", summary: "Declarations are hoisted; expressions are not." },
        { name: "Arrow functions", level: "beginner", summary: "No own this/arguments — inherits from the enclosing scope, which is why they're wrong for object methods needing this." },
        { name: "Default parameters", level: "beginner", summary: "function f(x = 1) — fallback used only when the argument is undefined." },
        { name: "Rest parameters (...args)", level: "beginner", summary: "Collect remaining arguments into a real array." },
        { name: "Closures", level: "intermediate", summary: "A function remembers variables from its enclosing scope even after that scope has returned — the basis of private state without classes.", deepDiveId: "js-closures" },
        { name: "Higher-order functions", level: "intermediate", summary: "Functions that take or return other functions (map/filter/reduce are all HOFs)." },
        { name: "Currying", level: "intermediate", summary: "Transforming f(a, b, c) into f(a)(b)(c) — enables partial application." },
        { name: "call / apply / bind", level: "advanced", summary: "Explicitly set what this refers to; apply/call invoke immediately, bind returns a new bound function." },
        { name: "IIFE", level: "advanced", summary: "Immediately Invoked Function Expression — creates a private scope, the pre-module way to avoid leaking globals." },
        { name: "Memoization", level: "advanced", summary: "Cache a pure function's return value by its arguments to skip recomputation." },
        { name: "Generators (function* / yield)", level: "advanced", summary: "A function that can pause and resume, yielding a sequence of values lazily instead of computing them all up front." },
      ],
    },
    {
      id: "js-classes",
      name: "Classes & Prototypes",
      items: [
        { name: "class / constructor", level: "beginner", summary: "Blueprint for creating objects with shared methods." },
        { name: "extends / super", level: "intermediate", summary: "Inheritance; super calls the parent constructor/method." },
        { name: "Getters/setters", level: "intermediate", summary: "get/set define computed properties that read like plain fields." },
        { name: "Static members", level: "intermediate", summary: "Belong to the class itself, not instances — e.g. factory methods, constants." },
        { name: "Prototype chain", level: "advanced", summary: "Every object has an internal link to another object it delegates lookups to; classes are sugar over this." },
        { name: "Private fields (#field)", level: "advanced", summary: "True encapsulation enforced by the engine, unlike the old _underscore convention." },
        { name: "Mixins", level: "advanced", summary: "Compose behavior from multiple sources into a class since JS only allows single inheritance." },
        { name: "Symbol.hasInstance", level: "advanced", summary: "Customize what instanceof checks — rarely needed, but explains how instanceof actually works." },
      ],
    },
    {
      id: "js-iteration",
      name: "Iterators & Generators",
      items: [
        { name: "for...of", level: "intermediate", summary: "Iterates values directly — vs. for...in, which iterates enumerable keys including inherited ones, the classic footgun." },
        { name: "Symbol.iterator protocol", level: "advanced", summary: "Implement it to make your own class work with for...of and spread.", deepDiveId: "js-iterator-protocol" },
        { name: "yield*", level: "advanced", summary: "Delegate to another generator/iterable from within a generator." },
      ],
    },
    {
      id: "js-json",
      name: "JSON",
      items: [
        { name: "JSON.stringify(obj)", level: "beginner", summary: "Serialize a value to a JSON string." },
        { name: "JSON.parse(str)", level: "beginner", summary: "Parse a JSON string back into a value." },
        { name: "stringify/parse replacer & reviver", level: "advanced", summary: "Second argument lets you transform values during (de)serialization — e.g. to handle Dates or filter fields." },
      ],
    },
  ],
};

// ─── Everything else: scaffolded now, filled in incrementally ─────────────
// Empty `categories` renders a "coming soon" state in the UI (same idiom as
// stub patterns/sub-patterns elsewhere in this app) rather than a dead link.

const python: LanguageRef = {
  id: "python",
  name: "Python",
  tagline: "Lists, dicts, comprehensions, generators, and the standard library.",
  categories: [
    {
      id: "py-lists",
      name: "Lists",
      items: [
        { name: "append(item)", level: "beginner", summary: "Add one item to the end (mutates)." },
        { name: "pop(i=-1)", level: "beginner", summary: "Remove & return the item at index i (default: last)." },
        { name: "insert(i, item)", level: "beginner", summary: "Insert item at index i (mutates)." },
        { name: "remove(item)", level: "beginner", summary: "Remove the first matching value; raises ValueError if absent." },
        { name: "index(item) / count(item)", level: "beginner", summary: "First index of item (raises if absent), or how many times it appears." },
        { name: "sort(key=None, reverse=False)", level: "beginner", summary: "In-place, stable sort. Use sorted() for a new list instead." },
        { name: "reverse()", level: "beginner", summary: "Reverse in place." },
        { name: "Slicing lst[a:b:step]", level: "beginner", summary: "Extract a sub-list; supports negative indices/steps, never mutates." },
        { name: "List comprehension [x for x in it if cond]", level: "intermediate", summary: "Build a list in one expression." },
        { name: "sorted(iterable, key=..., reverse=...)", level: "intermediate", summary: "New sorted list, non-mutating, stable, works on any iterable." },
        { name: "enumerate(iterable)", level: "intermediate", summary: "Pairs (index, value) while iterating." },
        { name: "zip(*iterables)", level: "intermediate", summary: "Iterate multiple sequences in lockstep; stops at the shortest." },
        { name: "Star-unpacking `a, *rest = lst`", level: "intermediate", summary: "Captures the remainder into a list." },
        { name: "bisect module (bisect_left / insort)", level: "advanced", summary: "Binary-search the insertion point in a sorted list in O(log n)." },
        { name: "list.pop(0) vs. collections.deque.popleft()", level: "advanced", summary: "Removing from the front of a list is O(n); a deque does it in O(1)." },
      ],
    },
    {
      id: "py-strings",
      name: "Strings",
      items: [
        { name: 'f-strings f"{x}"', level: "beginner", summary: "Embed expressions directly in a string literal." },
        { name: "split() / join()", level: "beginner", summary: "Break a string apart on a separator, or glue an iterable back together." },
        { name: "strip() / lstrip() / rstrip()", level: "beginner", summary: "Remove whitespace (or given characters) from ends." },
        { name: "upper() / lower()", level: "beginner", summary: "Case conversion." },
        { name: "replace(old, new)", level: "beginner", summary: "Replace all occurrences of a substring." },
        { name: "startswith() / endswith()", level: "intermediate", summary: "Prefix/suffix check, optionally over a tuple of options." },
        { name: "isdigit() / isalpha() / isalnum()", level: "intermediate", summary: "Character-class checks." },
        { name: "Slicing s[a:b:step]", level: "intermediate", summary: "Same slicing rules as lists — strings are sequences too." },
        { name: "re module (match / search / findall / sub)", level: "advanced", summary: "Regular expressions for pattern matching and substitution." },
        { name: "str.translate + str.maketrans", level: "advanced", summary: "Fast bulk character replacement/deletion via a translation table." },
      ],
    },
    {
      id: "py-dicts-sets",
      name: "Dicts & Sets",
      items: [
        { name: "dict.get(key, default)", level: "beginner", summary: "Read with a fallback instead of raising KeyError." },
        { name: "dict.keys() / values() / items()", level: "beginner", summary: "Views over a dict's keys, values, or (key, value) pairs." },
        { name: "dict.setdefault(key, default) / update(other)", level: "beginner", summary: "Insert-if-missing, or bulk-merge another mapping in." },
        { name: "set add() / remove() / union() / intersection() / difference()", level: "beginner", summary: "Core set operations, each with an operator form too (| & -)." },
        { name: "Dict comprehension {k: v for ...}", level: "intermediate", summary: "Build a dict in one expression." },
        { name: "Insertion-order guarantee (3.7+)", level: "intermediate", summary: "Dicts preserve insertion order as a language guarantee, not an implementation detail." },
        { name: "collections.defaultdict(factory)", level: "intermediate", summary: "Auto-initializes missing keys via factory() instead of raising KeyError." },
        { name: "collections.Counter", level: "intermediate", summary: "Frequency counting / multiset, with a .most_common() method." },
        { name: "frozenset", level: "advanced", summary: "Immutable, hashable set — usable as a dict key or set member, unlike a regular set." },
      ],
    },
    {
      id: "py-numbers",
      name: "Numbers & Math",
      items: [
        { name: "// and %", level: "beginner", summary: "Floor division and modulo." },
        { name: "round(x, n)", level: "beginner", summary: "Rounds half-to-even (banker's rounding) — round(2.5) is 2, not 3, a common surprise." },
        { name: "math module (sqrt, floor, ceil, log)", level: "beginner", summary: "Standard math functions on floats." },
        { name: "int() / float() conversions", level: "beginner", summary: "Explicit type conversion between numeric types and strings." },
        { name: "Arbitrary-precision integers", level: "intermediate", summary: "Python ints have no fixed bit width and never silently overflow, unlike most languages." },
        { name: "decimal.Decimal", level: "advanced", summary: "Exact base-10 arithmetic, avoiding binary-float rounding error (e.g. for money)." },
        { name: "fractions.Fraction", level: "advanced", summary: "Exact rational arithmetic." },
      ],
    },
    {
      id: "py-comprehensions",
      name: "Comprehensions & Generators",
      items: [
        { name: "List/set/dict comprehensions", level: "intermediate", summary: "One-line construction with an optional filter clause." },
        { name: "Generator expression (x for x in it)", level: "intermediate", summary: "Lazy version of a list comprehension — no intermediate list is built." },
        { name: "yield / generator functions", level: "advanced", summary: "A function that pauses and resumes, producing a lazy sequence of values." },
        { name: "yield from", level: "advanced", summary: "Delegate iteration to a sub-generator or iterable." },
        { name: "itertools (chain, product, combinations, permutations, groupby)", level: "advanced", summary: "Composable building blocks for iterator pipelines." },
      ],
    },
    {
      id: "py-functions",
      name: "Functions & Decorators",
      items: [
        { name: "*args / **kwargs", level: "beginner", summary: "Collect extra positional or keyword arguments." },
        { name: "Default arguments", level: "beginner", summary: "Evaluated once at def time — a mutable default (e.g. []) is a classic shared-state bug." },
        { name: "lambda", level: "beginner", summary: "Anonymous single-expression function." },
        { name: "Closures", level: "intermediate", summary: "An inner function that remembers variables from its enclosing scope." },
        { name: "functools.reduce(fn, iterable, init)", level: "intermediate", summary: "Fold an iterable down to a single value." },
        { name: "Decorators (@decorator)", level: "advanced", summary: "A function that wraps another function to add behavior without changing its source." },
        { name: "functools.wraps", level: "advanced", summary: "Preserve the wrapped function's __name__/docstring when writing a decorator." },
        { name: "functools.lru_cache", level: "advanced", summary: "Built-in memoization decorator — caches a pure function's results by argument." },
      ],
    },
    {
      id: "py-classes",
      name: "Classes & OOP",
      items: [
        { name: "class / __init__ / self", level: "beginner", summary: "Constructor and the explicit instance reference every method receives." },
        { name: "Inheritance / super()", level: "intermediate", summary: "Extend a parent class; super() calls the parent's implementation." },
        { name: "Dunder methods (__str__, __eq__, __len__)", level: "intermediate", summary: "Make your objects work with built-ins: str(), ==, len(), etc." },
        { name: "@property", level: "intermediate", summary: "Expose a method as a computed attribute (read like a field, runs code)." },
        { name: "@staticmethod / @classmethod", level: "intermediate", summary: "Methods that don't need an instance, or that receive the class instead of self." },
        { name: "Multiple inheritance & MRO", level: "advanced", summary: "Method Resolution Order (C3 linearization) decides which parent's method wins on conflict." },
        { name: "__slots__", level: "advanced", summary: "Restrict which instance attributes are allowed, saving memory and disallowing typos-as-new-attrs." },
        { name: "abc module (abstract base classes)", level: "advanced", summary: "Define an interface that subclasses are forced to implement." },
      ],
    },
    {
      id: "py-context",
      name: "Iterators & Context Managers",
      items: [
        { name: "with statement", level: "intermediate", summary: "Guarantees cleanup (e.g. closing a file) even if the block raises." },
        { name: "__iter__ / __next__ protocol", level: "advanced", summary: "Implement these to make your own class work with for-loops." },
        { name: "contextlib.contextmanager", level: "advanced", summary: "Write a context manager as a generator function instead of a class with __enter__/__exit__." },
      ],
    },
    {
      id: "py-exceptions",
      name: "Exceptions",
      items: [
        { name: "try / except / else / finally", level: "beginner", summary: "else runs only if no exception was raised; finally always runs." },
        { name: "raise", level: "beginner", summary: "Trigger an exception, optionally re-raising the current one." },
        { name: "Custom exception classes", level: "intermediate", summary: "Subclass Exception to create domain-specific error types." },
        { name: "except SomeError as e", level: "intermediate", summary: "Bind the caught exception to a name for inspection." },
        { name: "Bare except:", level: "intermediate", summary: "Also catches KeyboardInterrupt/SystemExit — almost always prefer except Exception." },
      ],
    },
    {
      id: "py-stdlib",
      name: "Standard Library Highlights",
      items: [
        { name: "collections.deque", level: "intermediate", summary: "Double-ended queue with O(1) append/pop from both ends." },
        { name: "collections.namedtuple", level: "intermediate", summary: "Lightweight immutable record type with named fields." },
        { name: "dataclasses.dataclass", level: "advanced", summary: "Decorator that auto-generates __init__/__repr__/__eq__ for a class of fields." },
        { name: "heapq", level: "advanced", summary: "Min-heap operations on top of a plain list — heappush/heappop." },
        { name: "typing module (type hints)", level: "intermediate", summary: "Optional static type annotations, checked by external tools (mypy), not the interpreter." },
      ],
    },
  ],
};
const java: LanguageRef = {
  id: "java",
  name: "Java",
  tagline: "Collections, streams, generics, and the object model.",
  categories: [
    {
      id: "java-collections",
      name: "Collections",
      items: [
        { name: "ArrayList: add / get / remove / size", level: "beginner", summary: "Resizable array-backed list." },
        { name: "HashMap: put / get / containsKey / remove", level: "beginner", summary: "Hash table-backed key-value store, O(1) average access." },
        { name: "HashSet: add / contains / remove", level: "beginner", summary: "Hash table-backed set of unique elements." },
        { name: "List.of() / Map.of()", level: "intermediate", summary: "Immutable factory collections (Java 9+) — mutating them throws UnsupportedOperationException." },
        { name: "Collections.sort(list, comparator)", level: "intermediate", summary: "Sort a list in place with a custom Comparator." },
        { name: "Iterator / ListIterator", level: "intermediate", summary: "Remove elements safely while iterating — mutating the list directly throws ConcurrentModificationException." },
        { name: "TreeMap / TreeSet", level: "advanced", summary: "Sorted map/set backed by a red-black tree — O(log n) operations, keys iterate in order." },
        { name: "LinkedHashMap", level: "advanced", summary: "Preserves insertion order (or access order, useful for building an LRU cache)." },
        { name: "PriorityQueue", level: "advanced", summary: "Min-heap by default; pass a Comparator for a max-heap or custom ordering." },
        { name: "ArrayDeque", level: "advanced", summary: "Resizable array implementing both stack and queue interfaces — faster than LinkedList for most uses." },
      ],
    },
    {
      id: "java-strings",
      name: "Strings",
      items: [
        { name: "length() / charAt() / substring()", level: "beginner", summary: "Core string access methods." },
        { name: ".equals() vs. ==", level: "beginner", summary: "== compares references; .equals() compares content — the classic Java string gotcha." },
        { name: "split() / String.join()", level: "beginner", summary: "Break a string apart, or glue pieces back together with a separator." },
        { name: "trim() vs. strip()", level: "beginner", summary: "strip() (Java 11+) is Unicode-aware; trim() only strips ASCII whitespace." },
        { name: "String.format()", level: "intermediate", summary: "printf-style string formatting." },
        { name: "StringBuilder", level: "intermediate", summary: "Mutable string buffer — avoids the O(n²) cost of repeated String concatenation in a loop." },
        { name: 'Text blocks """..."""', level: "advanced", summary: "Multi-line string literals (Java 15+), no manual \\n or concatenation needed." },
      ],
    },
    {
      id: "java-streams",
      name: "Streams (Java 8+)",
      items: [
        { name: "stream() / collect(Collectors.toList())", level: "intermediate", summary: "Turn a collection into a Stream pipeline, then materialize the result." },
        { name: "map / filter / reduce", level: "intermediate", summary: "Core stream transformations — lazy until a terminal operation runs them." },
        { name: "Collectors.joining()", level: "intermediate", summary: "Concatenate stream elements into a single String, with an optional delimiter." },
        { name: "Arrays.stream() / Stream.of()", level: "intermediate", summary: "Build a Stream from an array or explicit values." },
        { name: "IntStream.range(a, b)", level: "intermediate", summary: "Primitive int stream, avoids boxing overhead for numeric loops." },
        { name: "Collectors.groupingBy()", level: "advanced", summary: "Partition stream elements into a Map<K, List<V>> by a classifier function." },
        { name: "Parallel streams", level: "advanced", summary: ".parallelStream() splits work across threads — only worth it for large, CPU-bound, stateless operations." },
      ],
    },
    {
      id: "java-generics",
      name: "Generics",
      items: [
        { name: "Generic classes <T>", level: "intermediate", summary: "Write a class/method once, parameterized over a type." },
        { name: "Bounded type parameters <T extends Comparable<T>>", level: "advanced", summary: "Restrict T to types that support a given operation." },
        { name: "Wildcards ? extends / ? super", level: "advanced", summary: "PECS: Producer Extends, Consumer Super — governs which wildcard to use in method signatures." },
        { name: "Type erasure", level: "advanced", summary: "Generic type info doesn't exist at runtime — you can't do `new T()` or create a `T[]` directly." },
      ],
    },
    {
      id: "java-oop",
      name: "OOP & Classes",
      items: [
        { name: "@Override", level: "beginner", summary: "Compiler-checked annotation confirming a method actually overrides a superclass/interface method." },
        { name: "Static vs. instance members", level: "beginner", summary: "Static belongs to the class itself; instance members belong to each object." },
        { name: "Interfaces vs. abstract classes", level: "intermediate", summary: "A class can implement many interfaces but extend only one (abstract) class." },
        { name: "equals() / hashCode() contract", level: "advanced", summary: "Must override both together — equal objects need equal hash codes or HashMap/HashSet break silently." },
        { name: "Records (Java 16+)", level: "advanced", summary: "Immutable data carrier class — auto-generates constructor, accessors, equals/hashCode/toString." },
        { name: "Sealed classes (Java 17+)", level: "advanced", summary: "Restrict which classes are allowed to extend/implement a type." },
      ],
    },
    {
      id: "java-exceptions",
      name: "Exceptions",
      items: [
        { name: "try / catch / finally", level: "beginner", summary: "finally runs whether or not an exception was thrown." },
        { name: "Checked vs. unchecked exceptions", level: "intermediate", summary: "Checked exceptions must be declared (throws) or caught; unchecked (RuntimeException) don't." },
        { name: "try-with-resources", level: "intermediate", summary: "Auto-closes any AutoCloseable resource, even if the block throws." },
        { name: "Custom exception classes", level: "intermediate", summary: "Extend Exception or RuntimeException for domain-specific errors." },
      ],
    },
    {
      id: "java-concurrency",
      name: "Concurrency",
      items: [
        { name: "Thread / Runnable", level: "intermediate", summary: "Basic unit of concurrent execution." },
        { name: "synchronized keyword", level: "advanced", summary: "Mutual-exclusion lock on a method or block to prevent concurrent access to shared state." },
        { name: "volatile keyword", level: "advanced", summary: "Guarantees visibility of writes across threads — not atomicity." },
        { name: "ExecutorService", level: "advanced", summary: "Manage a thread pool instead of creating raw Thread objects by hand." },
        { name: "CompletableFuture", level: "advanced", summary: "Compose asynchronous operations with chained callbacks, similar in spirit to JS Promises." },
      ],
    },
    {
      id: "java-functional",
      name: "Functional Interfaces & Optional",
      items: [
        { name: "Lambda expressions", level: "intermediate", summary: "Concise syntax for an anonymous implementation of a functional interface." },
        { name: "Method references (Class::method)", level: "intermediate", summary: "Shorthand for a lambda that just calls an existing method." },
        { name: "Function, Predicate, Supplier, Consumer", level: "intermediate", summary: "The core built-in functional interfaces in java.util.function." },
        { name: "Optional<T>", level: "advanced", summary: "Explicit 'may be absent' wrapper to avoid null, with .map/.orElse/.ifPresent." },
      ],
    },
    {
      id: "java-numbers",
      name: "Numbers & Autoboxing",
      items: [
        { name: "Wrapper classes: Integer.parseInt() / valueOf()", level: "beginner", summary: "Convert between primitives, wrapper objects, and Strings." },
        { name: "Autoboxing / unboxing (int <-> Integer)", level: "intermediate", summary: "Automatic conversion between a primitive and its wrapper class." },
        { name: "Integer caching (-128 to 127)", level: "advanced", summary: "Integer == comparison happens to work for small cached values, then silently breaks above 127 — use .equals() instead." },
      ],
    },
  ],
};
const c: LanguageRef = {
  id: "c",
  name: "C",
  tagline: "Pointers, memory management, and the standard library.",
  categories: [
    {
      id: "c-pointers",
      name: "Pointers & Memory",
      items: [
        { name: "Declaring a pointer `int *p`", level: "beginner", summary: "p holds the address of an int." },
        { name: "& (address-of) / * (dereference)", level: "beginner", summary: "& gets an address; * reads/writes the value at an address." },
        { name: "malloc / free", level: "beginner", summary: "Manual heap allocation — every malloc needs exactly one matching free." },
        { name: "NULL pointer checks", level: "beginner", summary: "malloc returns NULL on failure; dereferencing NULL is undefined behavior." },
        { name: "calloc", level: "intermediate", summary: "Like malloc but zero-initializes the allocated memory." },
        { name: "realloc", level: "intermediate", summary: "Resize a previously allocated block — may move it, so always reassign the returned pointer." },
        { name: "Pointer arithmetic", level: "intermediate", summary: "p + 1 advances by sizeof(*p) bytes, not 1 byte." },
        { name: "Function pointers", level: "advanced", summary: "Store/pass a function as a value, e.g. for callbacks or a dispatch table." },
        { name: "void*", level: "advanced", summary: "Generic pointer type — must be cast to a concrete type before dereferencing." },
        { name: "Dangling pointers / use-after-free", level: "advanced", summary: "Undefined behavior from accessing memory after it's been freed." },
        { name: "Double free", level: "advanced", summary: "Undefined behavior, a common cause of heap corruption." },
      ],
    },
    {
      id: "c-arrays-strings",
      name: "Arrays & Strings",
      items: [
        { name: "Array declaration `int arr[10]`", level: "beginner", summary: "Fixed-size, stack-allocated (at this scope) block of 10 ints." },
        { name: "C-strings & the null terminator", level: "beginner", summary: "A string is a char array ending in '\\0'; forgetting it is a classic buffer-overrun cause." },
        { name: "strlen / strcpy / strcat / strcmp", level: "beginner", summary: "Core string.h functions — none of them bounds-check the destination buffer." },
        { name: "Arrays decay to pointers", level: "intermediate", summary: "Passing an array to a function passes a pointer, losing size info — sizeof inside that function returns pointer size, not array size." },
        { name: "strncpy / strncat / snprintf", level: "intermediate", summary: "Bounded variants that avoid overflowing the destination buffer." },
        { name: "2D arrays vs. array of pointers", level: "advanced", summary: "int arr[R][C] is one contiguous block; int *arr[R] is R separate allocations — very different memory layouts." },
      ],
    },
    {
      id: "c-structs",
      name: "Structs & Unions",
      items: [
        { name: "struct definition", level: "beginner", summary: "Group related fields into one named type." },
        { name: "Member access: . vs. ->", level: "beginner", summary: ". for a struct value, -> for a pointer to a struct (sugar for (*p).field)." },
        { name: "typedef", level: "beginner", summary: "Give an existing type a new name, commonly used to drop the 'struct' keyword at use sites." },
        { name: "Nested structs", level: "intermediate", summary: "A struct field can itself be another struct type." },
        { name: "union", level: "advanced", summary: "All members share the same memory; only one is valid to read at a time." },
        { name: "Struct padding/alignment", level: "advanced", summary: "The compiler may insert padding between fields for alignment — sizeof(struct) isn't just the sum of member sizes." },
      ],
    },
    {
      id: "c-stdlib",
      name: "Standard Library",
      items: [
        { name: "printf / scanf format specifiers", level: "beginner", summary: "%d, %s, %f, %p etc. control how arguments are formatted or parsed." },
        { name: "malloc family (stdlib.h)", level: "beginner", summary: "malloc/calloc/realloc/free for dynamic memory." },
        { name: "atoi / atof / strtol", level: "intermediate", summary: "strtol is the safer choice — it reports how much of the string it actually parsed." },
        { name: "memcpy / memmove / memset", level: "intermediate", summary: "memmove is safe for overlapping regions; memcpy is not (undefined behavior if src/dst overlap)." },
        { name: "qsort", level: "advanced", summary: "Generic in-place sort taking a comparator function pointer — the C ancestor of Array.sort/Collections.sort." },
      ],
    },
    {
      id: "c-preprocessor",
      name: "Preprocessor & Compilation",
      items: [
        { name: "#include", level: "beginner", summary: "Textually pastes a header file's contents before compilation." },
        { name: "#define macros", level: "beginner", summary: "Text substitution before compilation, not a real function call — no type checking." },
        { name: "Header guards (#ifndef / #define / #endif)", level: "intermediate", summary: "Prevent a header from being included twice in the same translation unit." },
        { name: "const correctness", level: "intermediate", summary: "Mark data (or a pointer's target) as read-only, checked at compile time." },
        { name: "static (file scope vs. persistent local)", level: "advanced", summary: "Two meanings depending on context: limits linkage to the file, or makes a local variable's value persist across calls." },
        { name: "extern", level: "advanced", summary: "Declare a variable/function that's actually defined in another translation unit." },
      ],
    },
    {
      id: "c-functions",
      name: "Functions",
      items: [
        { name: "Pass-by-value semantics", level: "beginner", summary: "C always passes by value; to 'pass by reference' you explicitly pass a pointer." },
        { name: "Recursion", level: "beginner", summary: "A function calling itself; each call gets its own stack frame." },
        { name: "Variadic functions (stdarg.h)", level: "advanced", summary: "printf-style functions that accept a variable number of arguments." },
        { name: "inline", level: "advanced", summary: "Hint to the compiler to substitute the function body at the call site instead of a real call." },
      ],
    },
    {
      id: "c-bitwise",
      name: "Bitwise Operations",
      items: [
        { name: "& | ^ ~", level: "beginner", summary: "AND, OR, XOR, NOT at the bit level." },
        { name: "<< >>", level: "beginner", summary: "Shift left/right; right-shift on a signed negative number is implementation-defined." },
        { name: "Bit masks", level: "intermediate", summary: "Use & and | to read or set individual bits/flags packed into an integer." },
        { name: "XOR swap", level: "advanced", summary: "Swap two integers without a temp variable — rarely needed, but a classic interview trick." },
      ],
    },
    {
      id: "c-file-io",
      name: "File I/O",
      items: [
        { name: "fopen / fclose", level: "beginner", summary: "Open and close a file handle (FILE*)." },
        { name: 'File modes ("r", "w", "a", "rb", ...)', level: "beginner", summary: "Control read/write/append and text vs. binary interpretation." },
        { name: "fread / fwrite", level: "intermediate", summary: "Binary block I/O." },
        { name: "fprintf / fscanf", level: "intermediate", summary: "Formatted I/O to/from a file, same format specifiers as printf/scanf." },
      ],
    },
  ],
};
const ruby: LanguageRef = {
  id: "ruby",
  name: "Ruby & Rails",
  tagline: "Blocks, enumerables, and the Rails conventions built on top.",
  categories: [
    {
      id: "ruby-enumerable",
      name: "Enumerable & Blocks",
      items: [
        { name: "each", level: "beginner", summary: "Iterate with a block; returns the original collection." },
        { name: "map / collect", level: "beginner", summary: "New array built from the block's return values." },
        { name: "select / filter", level: "beginner", summary: "New array of elements where the block is truthy." },
        { name: "reject", level: "beginner", summary: "Opposite of select — keeps elements where the block is falsy." },
        { name: "reduce / inject", level: "intermediate", summary: "Fold to a single value; supports an initial value and a symbol shorthand like reduce(:+)." },
        { name: "find / detect", level: "intermediate", summary: "First element for which the block is truthy." },
        { name: "each_with_index", level: "intermediate", summary: "Iterate with both element and index." },
        { name: "sort_by", level: "intermediate", summary: "Sort by a computed key instead of the element itself." },
        { name: "yield / block_given?", level: "intermediate", summary: "yield calls the block implicitly passed to a method; block_given? checks whether one was." },
        { name: "each_with_object(obj)", level: "advanced", summary: "Like reduce but accumulates into a passed-in object — handy for building up a hash." },
        { name: "group_by", level: "advanced", summary: "Partition elements into a Hash keyed by the block's result." },
        { name: "Blocks vs. Procs vs. Lambdas", level: "advanced", summary: "do...end/{} blocks are implicit; Proc.new is lenient on arity; lambda is strict on arity, and its return only exits the lambda, not the enclosing method." },
      ],
    },
    {
      id: "ruby-strings",
      name: "Strings",
      items: [
        { name: "upcase / downcase / strip", level: "beginner", summary: "Case conversion and whitespace trimming." },
        { name: "split / join", level: "beginner", summary: "Break apart on a separator, or glue back together." },
        { name: 'String interpolation "#{}"', level: "beginner", summary: "Embed expressions directly inside a double-quoted string." },
        { name: "include? / start_with? / end_with?", level: "beginner", summary: "Substring and prefix/suffix checks." },
        { name: "gsub / sub", level: "beginner", summary: "gsub replaces every match; sub replaces only the first." },
        { name: "%w[] / %i[]", level: "intermediate", summary: "Shorthand literals for an array of strings / an array of symbols." },
        { name: "<<~HEREDOC", level: "advanced", summary: "Squiggly heredoc — strips the common leading indentation from a multi-line string." },
      ],
    },
    {
      id: "ruby-collections",
      name: "Arrays & Hashes",
      items: [
        { name: "push / << / pop / shift / unshift", level: "beginner", summary: "Core array mutation methods; << is the idiomatic append operator." },
        { name: "Hash#each / keys / values / merge", level: "beginner", summary: "Core hash iteration and combination." },
        { name: "Array#uniq / flatten / compact", level: "intermediate", summary: "Dedupe, flatten nested arrays, or drop nil entries." },
        { name: "Array#zip", level: "intermediate", summary: "Combine multiple arrays element-wise into an array of arrays." },
        { name: "Hash#fetch(key, default)", level: "intermediate", summary: "Raises or falls back explicitly, unlike [] which silently returns nil for a missing key." },
        { name: "Array#dig / Hash#dig", level: "advanced", summary: "Safe nested lookup — returns nil instead of raising on a missing intermediate key." },
        { name: "Splat `*` / double-splat `**`", level: "advanced", summary: "Capture or spread positional (*) or keyword (**) arguments." },
      ],
    },
    {
      id: "ruby-classes",
      name: "Classes & Modules",
      items: [
        { name: "class / initialize", level: "beginner", summary: "initialize is Ruby's constructor, run automatically by .new." },
        { name: "attr_accessor / attr_reader / attr_writer", level: "beginner", summary: "Auto-generate getter/setter methods for instance variables." },
        { name: "super", level: "intermediate", summary: "Call the parent class's version of the current method." },
        { name: "Method visibility (public / private / protected)", level: "intermediate", summary: "Controls where a method can be called from." },
        { name: "Modules & include (mixins)", level: "intermediate", summary: "Share behavior across unrelated classes as instance methods, without inheritance." },
        { name: "extend", level: "advanced", summary: "Mix a module's methods in as class-level methods instead of instance methods." },
        { name: "Comparable module", level: "advanced", summary: "Implement <=> once and get <, >, ==, between? for free." },
      ],
    },
    {
      id: "ruby-symbols-procs",
      name: "Symbols, Procs & Lambdas",
      items: [
        { name: "Symbols :name", level: "beginner", summary: "Immutable, interned identifiers — lighter-weight than strings, idiomatic for hash keys." },
        { name: "Proc.new / proc", level: "intermediate", summary: "A block turned into an object you can store and pass around." },
        { name: "lambda / ->() {}", level: "intermediate", summary: "Like a Proc but strict about argument count, and return only exits the lambda." },
        { name: "Symbol#to_proc (&:method_name)", level: "advanced", summary: "arr.map(&:upcase) passes a proc that calls .upcase on each element." },
      ],
    },
    {
      id: "ruby-metaprogramming",
      name: "Metaprogramming",
      items: [
        { name: "respond_to?", level: "intermediate", summary: "Check whether an object defines a given method before calling it." },
        { name: "send", level: "advanced", summary: "Call a method by name (string/symbol), bypassing normal visibility rules." },
        { name: "define_method", level: "advanced", summary: "Define a method dynamically at runtime." },
        { name: "method_missing", level: "advanced", summary: "Intercept calls to methods that aren't defined — the basis of many Rails/DSL tricks." },
      ],
    },
    {
      id: "rails-conventions",
      name: "Rails Conventions",
      items: [
        { name: "MVC structure (app/models, app/views, app/controllers)", level: "beginner", summary: "Rails' default separation of data, presentation, and request handling." },
        { name: "Convention over configuration", level: "beginner", summary: "e.g. a Post model maps to a posts table automatically — no config needed for the common case." },
        { name: "rails generate / rails g", level: "beginner", summary: "Scaffolding commands for models, controllers, and migrations." },
        { name: "rails console (rails c)", level: "beginner", summary: "Interactive REPL with your app's models and environment loaded." },
      ],
    },
    {
      id: "rails-activerecord",
      name: "ActiveRecord",
      items: [
        { name: "ActiveRecord::Base models", level: "beginner", summary: "Each model maps to a database table; each instance to a row." },
        { name: "find / find_by / where", level: "beginner", summary: "Core query methods — find by primary key, by condition, or a filtered relation." },
        { name: "has_many / belongs_to / has_one", level: "intermediate", summary: "Association macros that generate methods for related records." },
        { name: "validates", level: "intermediate", summary: "Declarative model validations (presence, uniqueness, etc.) that run before save." },
        { name: "has_many :through", level: "advanced", summary: "Many-to-many association via an explicit join model." },
        { name: "Callbacks (before_save, after_create, ...)", level: "advanced", summary: "Hook custom logic into a record's save/create/update/destroy lifecycle." },
        { name: "Scopes", level: "advanced", summary: "Named, chainable query fragments defined on the model." },
        { name: "N+1 queries & .includes", level: "advanced", summary: "Eager-load associations with .includes to avoid firing one extra query per record." },
      ],
    },
    {
      id: "rails-routing-migrations",
      name: "Routing & Migrations",
      items: [
        { name: "config/routes.rb", level: "beginner", summary: "Central file mapping URLs + HTTP verbs to controller actions." },
        { name: "resources :posts", level: "beginner", summary: "Generates the full RESTful route set (index/show/new/create/edit/update/destroy) in one line." },
        { name: "rails db:migrate / rollback", level: "beginner", summary: "Apply or undo pending schema migrations." },
        { name: "Nested routes", level: "intermediate", summary: "Scope child resources under a parent, e.g. posts/:post_id/comments." },
        { name: "db/schema.rb", level: "intermediate", summary: "Auto-generated snapshot of the current database schema, checked into version control." },
      ],
    },
  ],
};
const sql: LanguageRef = {
  id: "sql",
  name: "SQL",
  tagline: "Joins, aggregates, window functions, indexing.",
  categories: [
    {
      id: "sql-querying",
      name: "Querying",
      items: [
        { name: "SELECT / FROM / WHERE", level: "beginner", summary: "Pick columns, name the table, filter rows." },
        { name: "ORDER BY", level: "beginner", summary: "Sort result rows, ASC (default) or DESC." },
        { name: "LIMIT / OFFSET", level: "beginner", summary: "Cap the number of rows returned, optionally skipping some for pagination." },
        { name: "DISTINCT", level: "beginner", summary: "Remove duplicate rows from the result." },
        { name: "LIKE / wildcards (%, _)", level: "beginner", summary: "Pattern-match text; % is any-length wildcard, _ is single-character." },
        { name: "BETWEEN / IN", level: "beginner", summary: "Range check, or match against a list of values." },
        { name: "IS NULL / IS NOT NULL", level: "intermediate", summary: "= NULL never matches anything — null comparisons require IS NULL." },
        { name: "CASE WHEN", level: "intermediate", summary: "Inline conditional logic inside a SELECT expression." },
      ],
    },
    {
      id: "sql-joins",
      name: "Joins",
      items: [
        { name: "INNER JOIN", level: "beginner", summary: "Only rows with a match in both tables." },
        { name: "LEFT JOIN / RIGHT JOIN", level: "intermediate", summary: "All rows from one side, matched rows (or NULLs) from the other." },
        { name: "FULL OUTER JOIN", level: "intermediate", summary: "All rows from both sides, NULL-filled where there's no match." },
        { name: "CROSS JOIN", level: "advanced", summary: "Cartesian product — every row of one table paired with every row of another." },
        { name: "Self join", level: "advanced", summary: "Join a table to itself, e.g. to compare rows or walk a parent/child relationship." },
      ],
    },
    {
      id: "sql-aggregation",
      name: "Aggregation & Grouping",
      items: [
        { name: "COUNT / SUM / AVG / MIN / MAX", level: "beginner", summary: "Core aggregate functions." },
        { name: "GROUP BY", level: "beginner", summary: "Collapse rows sharing a key into one row per group for aggregation." },
        { name: "HAVING vs. WHERE", level: "intermediate", summary: "WHERE filters rows before grouping; HAVING filters groups after aggregation." },
        { name: "Window functions (OVER, PARTITION BY)", level: "advanced", summary: "Compute a value across a set of related rows without collapsing them, unlike GROUP BY." },
        { name: "RANK() / ROW_NUMBER() / DENSE_RANK()", level: "advanced", summary: "Ranking window functions — differ in how they handle ties." },
      ],
    },
    {
      id: "sql-subqueries",
      name: "Subqueries & CTEs",
      items: [
        { name: "Subquery in WHERE", level: "intermediate", summary: "Nest a query inside another to filter by a computed set of values." },
        { name: "Correlated subquery", level: "advanced", summary: "References a column from the outer query — re-evaluated once per outer row." },
        { name: "CTE (WITH clause)", level: "advanced", summary: "Name a subquery for readability and reuse within one statement." },
        { name: "Recursive CTE", level: "advanced", summary: "Traverse hierarchical/graph data (e.g. an org chart) in pure SQL." },
      ],
    },
    {
      id: "sql-indexes",
      name: "Indexes & Performance",
      items: [
        { name: "What an index is", level: "intermediate", summary: "A separate sorted structure (usually a B-tree) letting the DB find rows without scanning the whole table." },
        { name: "PRIMARY KEY / UNIQUE auto-index", level: "intermediate", summary: "These constraints automatically create a backing index." },
        { name: "EXPLAIN / EXPLAIN ANALYZE", level: "advanced", summary: "Show the query planner's chosen execution plan, and (with ANALYZE) actual runtime stats." },
        { name: "Composite indexes & column order", level: "advanced", summary: "Leftmost-prefix rule: an index on (a, b) helps queries filtering on a, or a and b, but not b alone." },
        { name: "N+1 query problem", level: "advanced", summary: "Firing one query per row in a loop instead of one query for the whole set — the most common ORM performance bug." },
      ],
    },
    {
      id: "sql-transactions",
      name: "Transactions",
      items: [
        { name: "BEGIN / COMMIT / ROLLBACK", level: "intermediate", summary: "Group statements into an all-or-nothing unit of work." },
        { name: "ACID properties", level: "intermediate", summary: "Atomicity, Consistency, Isolation, Durability — the guarantees a transaction provides." },
        { name: "Isolation levels", level: "advanced", summary: "READ COMMITTED, REPEATABLE READ, SERIALIZABLE trade consistency guarantees for concurrency." },
      ],
    },
    {
      id: "sql-schema",
      name: "Schema (DDL)",
      items: [
        { name: "CREATE TABLE", level: "beginner", summary: "Define a table's columns and types." },
        { name: "PRIMARY KEY / FOREIGN KEY", level: "beginner", summary: "Uniquely identify a row, and reference a row in another table." },
        { name: "ALTER TABLE", level: "intermediate", summary: "Add, remove, or modify columns/constraints on an existing table." },
        { name: "Normalization (1NF / 2NF / 3NF)", level: "advanced", summary: "Structure tables to reduce redundancy and avoid update anomalies." },
      ],
    },
  ],
};

const nosql: LanguageRef = {
  id: "nosql",
  name: "NoSQL",
  tagline: "Document, key-value, and wide-column data modeling.",
  categories: [
    {
      id: "nosql-modeling",
      name: "Data Modeling Concepts",
      items: [
        { name: "Schema-less / dynamic schema", level: "beginner", summary: "Documents in the same collection don't need identical fields." },
        { name: "Denormalization", level: "beginner", summary: "Duplicate data across documents to avoid joins, trading storage for read speed." },
        { name: "Embedding vs. referencing", level: "intermediate", summary: "Embed related data in one document for fast reads, or reference by ID like a foreign key." },
        { name: "Aggregate/document as the unit of consistency", level: "advanced", summary: "Operations on a single document are atomic; across documents usually aren't, shaping how you model data." },
      ],
    },
    {
      id: "nosql-documents",
      name: "Document Stores",
      items: [
        { name: "Collections & documents", level: "beginner", summary: "A collection is like a table; a document is like a row, but nested/flexible (MongoDB-style)." },
        { name: "find() / insertOne() / updateOne() / deleteOne()", level: "beginner", summary: "Core CRUD operations." },
        { name: "Query operators ($gt, $in, $exists)", level: "intermediate", summary: "Comparison and existence operators used inside query filters." },
        { name: "Indexes on document fields", level: "intermediate", summary: "Same purpose as a SQL index — speed up lookups on frequently-queried fields." },
        { name: "Aggregation pipeline ($match, $group, $project)", level: "advanced", summary: "A chain of stages transforming documents — the document-store answer to SQL's GROUP BY/JOIN." },
      ],
    },
    {
      id: "nosql-kv-wide",
      name: "Key-Value & Wide-Column",
      items: [
        { name: "Key-value stores (Redis-style)", level: "beginner", summary: "Simple get/set by key, extremely fast — often used for caching/sessions." },
        { name: "TTL / expiring keys", level: "intermediate", summary: "Automatically evict a key after a set duration — the basis of cache expiry." },
        { name: "Wide-column stores (Cassandra-style)", level: "advanced", summary: "Rows can have different columns; data is partitioned by a row key across nodes." },
        { name: "Partition key design", level: "advanced", summary: "Choosing a key that distributes load evenly is the central design decision in wide-column stores." },
      ],
    },
    {
      id: "nosql-consistency",
      name: "Consistency Models",
      items: [
        { name: "CAP theorem", level: "intermediate", summary: "Under a network partition, a system must choose Consistency or Availability, not both." },
        { name: "Eventual consistency", level: "intermediate", summary: "Replicas converge to the same value over time, not instantly." },
        { name: "Strong vs. eventual consistency trade-offs", level: "advanced", summary: "Strong consistency costs latency/availability; eventual consistency risks briefly stale reads." },
      ],
    },
  ],
};

const postgresql: LanguageRef = {
  id: "postgresql",
  name: "PostgreSQL",
  tagline: "Postgres-specific features on top of standard SQL.",
  categories: [
    {
      id: "pg-types",
      name: "Postgres-Specific Types",
      items: [
        { name: "SERIAL / IDENTITY", level: "beginner", summary: "Auto-incrementing integer primary key column." },
        { name: "UUID type", level: "intermediate", summary: "Native storage for universally unique identifiers, often used as a primary key instead of SERIAL." },
        { name: "ENUM type", level: "intermediate", summary: "A column restricted to a fixed set of named values, enforced by the database." },
        { name: "ARRAY type", level: "intermediate", summary: "Store an array directly in a single column instead of a join table." },
      ],
    },
    {
      id: "pg-json",
      name: "JSON / JSONB",
      items: [
        { name: "JSON vs. JSONB", level: "intermediate", summary: "JSONB is stored in a binary, indexable format; JSON preserves exact text, whitespace, and key order." },
        { name: "-> and ->> operators", level: "intermediate", summary: "Extract a JSON field as JSON (->) or as text (->>)." },
        { name: "@> containment operator", level: "advanced", summary: "Test whether one JSONB value contains another — the basis of indexed JSONB queries." },
        { name: "jsonb_set", level: "advanced", summary: "Update a value at a given path inside a JSONB column without rewriting the whole document." },
      ],
    },
    {
      id: "pg-indexing",
      name: "Indexing",
      items: [
        { name: "B-tree (default)", level: "beginner", summary: "Postgres' default index type — good for equality and range queries." },
        { name: "Partial index", level: "advanced", summary: "Index only rows matching a WHERE condition — smaller and faster than indexing the whole table." },
        { name: "GIN index", level: "advanced", summary: "Good for indexing JSONB, arrays, and full-text search." },
        { name: "GiST index", level: "advanced", summary: "Good for geometric and range-type data." },
      ],
    },
    {
      id: "pg-extensions",
      name: "Extensions",
      items: [
        { name: "Common extensions (postgis, uuid-ossp)", level: "intermediate", summary: "Postgres' extension system adds capabilities like geospatial types or UUID generation functions." },
        { name: "pg_stat_statements", level: "advanced", summary: "Tracks execution stats for every query — the key tool for finding slow queries." },
        { name: "pgvector", level: "advanced", summary: "Vector similarity search extension used for embeddings — the Postgres equivalent of this app's own IndexedDB-based 'Feed the Brain' retrieval." },
      ],
    },
  ],
};

const graphql: LanguageRef = {
  id: "graphql",
  name: "GraphQL",
  tagline: "Schemas, resolvers, queries, and mutations.",
  categories: [
    {
      id: "gql-core",
      name: "Core Concepts",
      items: [
        { name: "Single endpoint", level: "beginner", summary: "One URL handles all queries/mutations, unlike REST's many endpoints." },
        { name: "Client specifies exact fields", level: "beginner", summary: "Avoids over-fetching and under-fetching — you get exactly the shape you ask for." },
        { name: "Strongly typed schema", level: "beginner", summary: "Every field's type is known and validated before a query runs." },
      ],
    },
    {
      id: "gql-schema",
      name: "Schema & Types",
      items: [
        { name: "type / field definitions", level: "beginner", summary: "Declare the shape of your data and how fields relate." },
        { name: "Scalar types (String, Int, Float, Boolean, ID)", level: "beginner", summary: "The built-in leaf types every schema is built from." },
        { name: "Nullability (Type!)", level: "intermediate", summary: "A trailing ! means the field can never be null in a valid response." },
        { name: "Input types", level: "intermediate", summary: "Special types used only as mutation/query arguments, not as return types." },
        { name: "Interfaces & unions", level: "advanced", summary: "Model polymorphic data — a field that can return one of several possible types." },
      ],
    },
    {
      id: "gql-queries",
      name: "Queries & Mutations",
      items: [
        { name: "query", level: "beginner", summary: "Read operation — fields execute in parallel." },
        { name: "mutation", level: "beginner", summary: "Write operation — same syntax as a query, but fields execute sequentially, and it signals a side effect." },
        { name: "Variables", level: "intermediate", summary: "Parameterize a query instead of string-interpolating values into it." },
        { name: "Aliases", level: "intermediate", summary: "Rename a field in the response, e.g. to query the same field twice with different arguments." },
        { name: "Fragments", level: "intermediate", summary: "Reusable named sets of fields shared across multiple queries." },
      ],
    },
    {
      id: "gql-resolvers",
      name: "Resolvers",
      items: [
        { name: "Resolver function per field", level: "intermediate", summary: "Each field in the schema has a function that knows how to fetch its own data." },
        { name: "N+1 problem in resolvers", level: "advanced", summary: "Naive nested resolvers issue one query per parent row — the same footgun as ORM N+1 in SQL." },
        { name: "DataLoader / batching", level: "advanced", summary: "Batch and cache resolver calls within a single request to solve the N+1 problem." },
      ],
    },
  ],
};
const angular: LanguageRef = {
  id: "angular",
  name: "Angular",
  tagline: "Components, services, RxJS, and dependency injection.",
  categories: [
    {
      id: "ng-components",
      name: "Components & Templates",
      items: [
        { name: "@Component decorator", level: "beginner", summary: "Marks a class as an Angular component and attaches its template/styles/selector." },
        { name: "Templates (HTML + Angular syntax)", level: "beginner", summary: "HTML extended with Angular's binding and directive syntax." },
        { name: "Interpolation {{ }}", level: "beginner", summary: "Embed a component property's value directly in the template." },
        { name: "Property binding [property]", level: "beginner", summary: "Bind a DOM element property to a component expression." },
        { name: "Event binding (event)", level: "beginner", summary: "Call a component method in response to a DOM event." },
        { name: "Two-way binding [(ngModel)]", level: "intermediate", summary: "Combines property + event binding for form inputs in one syntax." },
        { name: "@Input() / @Output()", level: "intermediate", summary: "Pass data into a child component, or emit events out to a parent." },
        { name: "Standalone components (Angular 14+)", level: "advanced", summary: "Components that don't need to be declared in an NgModule." },
      ],
    },
    {
      id: "ng-di",
      name: "Services & Dependency Injection",
      items: [
        { name: "Services & @Injectable", level: "intermediate", summary: "Reusable class for shared logic/state, provided via Angular's DI system." },
        { name: "Dependency Injection", level: "intermediate", summary: "Angular constructs and injects a service's dependencies automatically based on constructor parameter types." },
      ],
    },
    {
      id: "ng-rxjs",
      name: "RxJS & Observables",
      items: [
        { name: "RxJS Observables", level: "advanced", summary: "Angular's core async primitive — streams of values over time, composed with operators like map/filter/switchMap." },
        { name: "async pipe", level: "advanced", summary: "Subscribes to an Observable/Promise directly in the template and auto-unsubscribes when the component is destroyed." },
      ],
    },
    {
      id: "ng-directives",
      name: "Directives & Pipes",
      items: [
        { name: "*ngIf / *ngFor structural directives", level: "beginner", summary: "Conditionally render, or repeat, a template element." },
        { name: "Pipes ({{ value | date }})", level: "intermediate", summary: "Transform a value for display without changing the underlying data." },
        { name: "Custom directives", level: "advanced", summary: "Attach custom behavior to a DOM element beyond the built-in structural/attribute directives." },
      ],
    },
    {
      id: "ng-routing",
      name: "Routing & Change Detection",
      items: [
        { name: "Angular Router", level: "intermediate", summary: "Maps URLs to components, with support for route params, guards, and lazy loading." },
        { name: "Route guards (CanActivate)", level: "advanced", summary: "Control whether navigation to a route is allowed to proceed." },
        { name: "Change detection", level: "advanced", summary: "Default strategy checks the whole component tree on every event; OnPush skips subtrees whose @Input references haven't changed." },
      ],
    },
  ],
};

const react: LanguageRef = {
  id: "react",
  name: "React",
  tagline: "Components, hooks, and the render model.",
  categories: [
    {
      id: "react-basics",
      name: "Components & JSX",
      items: [
        { name: "JSX", level: "beginner", summary: "HTML-like syntax that compiles down to React.createElement calls." },
        { name: "Function components", level: "beginner", summary: "A plain function that returns JSX — the standard way to write components today." },
        { name: "props", level: "beginner", summary: "Read-only data passed from a parent component to a child." },
        { name: "Conditional rendering", level: "beginner", summary: "Show different JSX based on a condition, typically with &&  or a ternary." },
        { name: "Lists & keys", level: "beginner", summary: "key helps React identify which items changed/moved between renders — must be stable, not the array index if the list can reorder." },
        { name: "Event handling (onClick, etc.)", level: "beginner", summary: "Attach handlers directly as JSX props; React wraps native events in its own SyntheticEvent." },
      ],
    },
    {
      id: "react-core-hooks",
      name: "Core Hooks",
      items: [
        { name: "useState", level: "beginner", summary: "Local component state — calling the setter triggers a re-render." },
        { name: "useEffect", level: "beginner", summary: "Run side effects after render; the dependency array controls when it re-runs." },
        { name: "useContext", level: "intermediate", summary: "Read a value from a Context Provider without prop drilling through every intermediate component." },
        { name: "useRef", level: "intermediate", summary: "Mutable value that persists across renders without causing one when it changes; also used for DOM refs." },
      ],
    },
    {
      id: "react-patterns",
      name: "State & Data Flow Patterns",
      items: [
        { name: "Controlled vs. uncontrolled components", level: "intermediate", summary: "Controlled: React state drives the input's value. Uncontrolled: the DOM holds it, read via a ref." },
        { name: "Lifting state up", level: "intermediate", summary: "Move state shared by siblings to their closest common ancestor." },
        { name: "Custom hooks", level: "intermediate", summary: "Extract reusable stateful logic into a function whose name starts with 'use'." },
        { name: "useReducer", level: "advanced", summary: "useState alternative for more complex state transitions — a Redux-like reducer pattern, local to one component." },
      ],
    },
    {
      id: "react-performance",
      name: "Rendering & Performance",
      items: [
        { name: "useMemo", level: "intermediate", summary: "Memoize an expensive computed value between renders." },
        { name: "useCallback", level: "intermediate", summary: "Memoize a function reference — avoids re-rendering children that depend on referential equality." },
        { name: "React.memo", level: "advanced", summary: "Skip re-rendering a component if its props are shallow-equal to last render." },
        { name: "Reconciliation / virtual DOM diffing", level: "advanced", summary: "React diffs the virtual DOM tree to compute the minimal real-DOM update needed." },
      ],
    },
    {
      id: "react-advanced",
      name: "Advanced Patterns",
      items: [
        { name: "Error boundaries", level: "advanced", summary: "Components that catch rendering errors in their child tree and show a fallback instead of crashing the whole app." },
        { name: "Suspense", level: "advanced", summary: "Declaratively show a fallback while a child is 'not ready' — e.g. lazy-loaded code or async data." },
        { name: "Portals", level: "advanced", summary: "Render children into a DOM node outside the parent hierarchy — e.g. for modals that escape overflow/z-index constraints." },
      ],
    },
  ],
};

const flutter: LanguageRef = {
  id: "flutter",
  name: "Flutter",
  tagline: "Widgets, state management, and Dart.",
  categories: [
    {
      id: "flutter-widgets",
      name: "Widgets Basics",
      items: [
        { name: "Everything is a widget", level: "beginner", summary: "Layout, styling, even padding are all widgets composed together into a tree." },
        { name: "StatelessWidget", level: "beginner", summary: "Immutable widget, rebuilt only when its parent rebuilds it with new data." },
        { name: "StatefulWidget / State", level: "beginner", summary: "Widget with mutable internal state, split into a widget class and its associated State object." },
        { name: "build() method", level: "beginner", summary: "Describes the widget tree; called every time the widget needs to rebuild." },
        { name: "setState()", level: "beginner", summary: "Tells Flutter this widget's state changed and it needs to rebuild." },
        { name: "Hot reload", level: "beginner", summary: "Injects updated code into a running app while preserving state — Flutter's fast iteration loop." },
      ],
    },
    {
      id: "flutter-layout",
      name: "Layout",
      items: [
        { name: "Column / Row", level: "beginner", summary: "Vertical/horizontal layout widgets, analogous to flexbox." },
        { name: "Container", level: "beginner", summary: "Single-child widget for padding, margin, decoration, and sizing." },
        { name: "Expanded / Flexible", level: "intermediate", summary: "Control how a child fills the remaining space inside a Row/Column." },
        { name: "Stack / Positioned", level: "intermediate", summary: "Overlap widgets, positioned absolutely within the stack." },
        { name: "ListView.builder", level: "intermediate", summary: "Lazily builds list items on demand — efficient for long or infinite lists." },
      ],
    },
    {
      id: "flutter-state",
      name: "State Management",
      items: [
        { name: "InheritedWidget", level: "advanced", summary: "Efficiently propagate data down the widget tree — the low-level mechanism many state-management libraries build on." },
        { name: "Provider / Riverpod", level: "advanced", summary: "Popular state-management packages built on top of InheritedWidget-style propagation." },
        { name: "setState scope", level: "advanced", summary: "setState only rebuilds the widget it's called in and its descendants — why large widgets get split up for performance." },
      ],
    },
    {
      id: "flutter-navigation",
      name: "Navigation",
      items: [
        { name: "Navigator.push / pop", level: "intermediate", summary: "Imperative navigation between screens (routes), maintaining a stack." },
      ],
    },
    {
      id: "flutter-dart",
      name: "Dart Language Essentials",
      items: [
        { name: "Null safety (?, !, late)", level: "intermediate", summary: "Types are non-nullable by default; ? marks nullable, ! asserts non-null, late defers initialization." },
        { name: "Futures & async/await", level: "intermediate", summary: "Same async/await syntax as JS, built on Dart's Future type." },
        { name: "Streams", level: "advanced", summary: "Dart's async sequence type — commonly consumed with a StreamBuilder in the widget tree." },
      ],
    },
  ],
};

export const LANGUAGE_REFS: LanguageRef[] = [
  javascript,
  python,
  java,
  c,
  ruby,
  sql,
  nosql,
  postgresql,
  graphql,
  angular,
  react,
  flutter,
];

function languageItemCount(lang: LanguageRef): number {
  return lang.categories.reduce((sum, c) => sum + c.items.length, 0);
}

export function referenceItemCount(langId: string): number {
  const lang = LANGUAGE_REFS.find((l) => l.id === langId);
  return lang ? languageItemCount(lang) : 0;
}

/** Total number of reference items across all languages (for the sidebar count). */
export const REFERENCE_ITEM_COUNT = LANGUAGE_REFS.reduce((sum, l) => sum + languageItemCount(l), 0);
