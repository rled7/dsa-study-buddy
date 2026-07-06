import type { Pattern, Problem } from "./types";

// ─── Shared normalizers ───────────────────────────────────────────────────
// Applied to both the candidate's return value and `expected` before
// comparing, so a correct-but-differently-ordered result still passes.

const sortNums = (v: unknown): unknown => (Array.isArray(v) ? [...v].sort((a, b) => Number(a) - Number(b)) : v);

const canonicalGroups = (v: unknown): unknown => {
  if (!Array.isArray(v)) return v;
  return [...v]
    .map((group) => (Array.isArray(group) ? [...group].sort() : group))
    .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
};

// ─── Arrays ────────────────────────────────────────────────────────────────

const subarraySumEqualsK: Problem = {
  id: "arr-subarray-sum-k",
  title: "Subarray Sum Equals K",
  difficulty: "Medium",
  description:
    "Given an integer array nums and an integer k, return the number of contiguous subarrays whose sum equals k.\n\n" +
    "Classic prefix-sum technique: keep a running prefix sum and a hash map of how many times each prefix sum has " +
    "occurred. For each index, check whether (prefixSum - k) has been seen before.",
  fnName: "subarraySumEqualsK",
  starterCode: "function subarraySumEqualsK(nums, k) {\n  // your code here\n}",
  testCases: [
    { input: [[1, 1, 1], 2], expected: 2 },
    { input: [[1, 2, 3], 3], expected: 2 },
    { input: [[1, -1, 0], 0], expected: 3 },
    { input: [[3, 4, 7, 2, -3, 1, 4, 2], 7], expected: 4 },
  ],
  solution:
    "function subarraySumEqualsK(nums, k) {\n" +
    "  const seen = new Map([[0, 1]]);\n" +
    "  let sum = 0, count = 0;\n" +
    "  for (const n of nums) {\n" +
    "    sum += n;\n" +
    "    count += seen.get(sum - k) || 0;\n" +
    "    seen.set(sum, (seen.get(sum) || 0) + 1);\n" +
    "  }\n" +
    "  return count;\n" +
    "}",
};

const maxSumSubarrayOfSizeK: Problem = {
  id: "arr-max-sum-subarray-k",
  title: "Maximum Sum Subarray of Size K",
  difficulty: "Easy",
  description:
    "Given an integer array nums and an integer k, find the maximum sum of any contiguous subarray of size k.\n\n" +
    "Sliding window: maintain a running sum for a window of size k, sliding it one element at a time instead of " +
    "recomputing the sum from scratch.",
  fnName: "maxSumSubarrayOfSizeK",
  starterCode: "function maxSumSubarrayOfSizeK(nums, k) {\n  // your code here\n}",
  testCases: [
    { input: [[2, 1, 5, 1, 3, 2], 3], expected: 9 },
    { input: [[2, 3, 4, 1, 5], 2], expected: 7 },
    { input: [[1, 1, 1, 1, 1], 1], expected: 1 },
    { input: [[4, 2, 1, 6], 4], expected: 13 },
  ],
  solution:
    "function maxSumSubarrayOfSizeK(nums, k) {\n" +
    "  let windowSum = 0;\n" +
    "  for (let i = 0; i < k; i++) windowSum += nums[i];\n" +
    "  let max = windowSum;\n" +
    "  for (let i = k; i < nums.length; i++) {\n" +
    "    windowSum += nums[i] - nums[i - k];\n" +
    "    max = Math.max(max, windowSum);\n" +
    "  }\n" +
    "  return max;\n" +
    "}",
};

const arrays: Pattern = {
  id: "arrays",
  name: "Arrays",
  subpatterns: [
    {
      id: "arr-prefix-sum",
      name: "Prefix Sum",
      explanation:
        "Precompute cumulative sums so any range sum becomes a subtraction instead of a re-scan. Often paired " +
        "with a hash map to count subarrays matching a target sum in O(n).",
      problems: [subarraySumEqualsK],
    },
    {
      id: "arr-sliding-window",
      name: "Sliding Window",
      explanation:
        "Maintain a window [left, right] over the array and slide it, adding/removing one element at a time " +
        "instead of recomputing the window's aggregate from scratch. Turns O(n*k) into O(n).",
      problems: [maxSumSubarrayOfSizeK],
    },
    {
      id: "arr-kadane",
      name: "Kadane's / Subarray",
      explanation:
        "Track the best subarray sum ending at the current index; either extend the previous subarray or start " +
        "fresh at the current element, whichever is larger.",
      problems: [],
    },
    {
      id: "arr-binary-search",
      name: "Binary Search",
      explanation:
        "Repeatedly halve a sorted search space by comparing the midpoint to the target, discarding the half " +
        "that can't contain the answer.",
      problems: [],
    },
  ],
};

// ─── String ────────────────────────────────────────────────────────────────

const validPalindrome: Problem = {
  id: "str-valid-palindrome",
  title: "Valid Palindrome",
  difficulty: "Easy",
  description:
    "Given a string s, return true if it is a palindrome after converting to lowercase and removing all " +
    "non-alphanumeric characters.\n\n" +
    "Two-pointer technique isn't strictly required here but is the natural fit: walk from both ends inward, " +
    "skipping non-alphanumeric characters, and compare.",
  fnName: "isPalindrome",
  starterCode: "function isPalindrome(s) {\n  // your code here\n}",
  testCases: [
    { input: ["A man, a plan, a canal: Panama"], expected: true },
    { input: ["race a car"], expected: false },
    { input: [""], expected: true },
    { input: ["0P"], expected: false },
  ],
  solution:
    "function isPalindrome(s) {\n" +
    "  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');\n" +
    "  let i = 0, j = clean.length - 1;\n" +
    "  while (i < j) {\n" +
    "    if (clean[i] !== clean[j]) return false;\n" +
    "    i++; j--;\n" +
    "  }\n" +
    "  return true;\n" +
    "}",
};

const validAnagram: Problem = {
  id: "str-valid-anagram",
  title: "Valid Anagram",
  difficulty: "Easy",
  description:
    "Given two strings s and t, return true if t is an anagram of s (same letters, same counts, any order).\n\n" +
    "Build a frequency map of one string's characters, then walk the other string decrementing counts.",
  fnName: "isAnagram",
  starterCode: "function isAnagram(s, t) {\n  // your code here\n}",
  testCases: [
    { input: ["anagram", "nagaram"], expected: true },
    { input: ["rat", "car"], expected: false },
    { input: ["a", "a"], expected: true },
    { input: ["ab", "a"], expected: false },
  ],
  solution:
    "function isAnagram(s, t) {\n" +
    "  if (s.length !== t.length) return false;\n" +
    "  const counts = {};\n" +
    "  for (const c of s) counts[c] = (counts[c] || 0) + 1;\n" +
    "  for (const c of t) {\n" +
    "    if (!counts[c]) return false;\n" +
    "    counts[c]--;\n" +
    "  }\n" +
    "  return true;\n" +
    "}",
};

const stringPattern: Pattern = {
  id: "string",
  name: "String",
  subpatterns: [
    {
      id: "str-two-pointers",
      name: "Two Pointers",
      explanation:
        "Walk two indices through a string (often from opposite ends, sometimes both forward) to compare or " +
        "rearrange characters in a single pass instead of nested loops.",
      problems: [],
    },
    {
      id: "str-pattern-matching",
      name: "Pattern Matching / KMP",
      explanation:
        "Find occurrences of a pattern inside text in O(n+m) by precomputing a failure function that avoids " +
        "re-scanning already-matched characters after a mismatch.",
      problems: [],
    },
    {
      id: "str-anagram-frequency",
      name: "Anagram / Frequency Count",
      explanation:
        "Compare character frequency counts (via a map or a fixed-size array for lowercase letters) rather than " +
        "sorting, to check anagram-ness or count distinct character sets in O(n).",
      problems: [validAnagram],
    },
    {
      id: "str-palindrome",
      name: "Palindrome",
      explanation:
        "A string reads the same forwards and backwards. Check with two pointers closing inward, or build up " +
        "palindromic substrings with expand-around-center / DP for harder variants.",
      problems: [validPalindrome],
    },
  ],
};

// ─── Hashing ───────────────────────────────────────────────────────────────

const twoSum: Problem = {
  id: "hash-two-sum",
  title: "Two Sum",
  difficulty: "Easy",
  description:
    "Given an array of integers nums and an integer target, return the indices of the two numbers that add up " +
    "to target. Assume exactly one solution exists and you may not use the same element twice.\n\n" +
    "One-pass hash map: for each number, check whether its complement (target - num) has already been seen; if " +
    "so, return the stored index and the current index.",
  fnName: "twoSum",
  starterCode: "function twoSum(nums, target) {\n  // your code here, return [i, j]\n}",
  testCases: [
    { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
    { input: [[3, 2, 4], 6], expected: [1, 2] },
    { input: [[3, 3], 6], expected: [0, 1] },
    { input: [[-1, -2, -3, -4, -5], -8], expected: [2, 4] },
  ],
  solution:
    "function twoSum(nums, target) {\n" +
    "  const seen = new Map();\n" +
    "  for (let i = 0; i < nums.length; i++) {\n" +
    "    const complement = target - nums[i];\n" +
    "    if (seen.has(complement)) return [seen.get(complement), i];\n" +
    "    seen.set(nums[i], i);\n" +
    "  }\n" +
    "  return [];\n" +
    "}",
  // Index order is an implementation detail (which of the pair is found
  // first); only the *set* of indices matters, so sort before comparing.
  normalize: sortNums,
};

const groupAnagrams: Problem = {
  id: "hash-group-anagrams",
  title: "Group Anagrams",
  difficulty: "Medium",
  description:
    "Given an array of strings, group the anagrams together. Return the groups in any order; the strings " +
    "within a group may also be in any order.\n\n" +
    "Use a hash map keyed by each string's sorted-character signature (or a letter-count signature); strings " +
    "with the same signature belong to the same group.",
  fnName: "groupAnagrams",
  starterCode: "function groupAnagrams(strs) {\n  // your code here, return string[][]\n}",
  testCases: [
    {
      input: [["eat", "tea", "tan", "ate", "nat", "bat"]],
      expected: [["bat"], ["nat", "tan"], ["ate", "eat", "tea"]],
    },
    { input: [[""]], expected: [[""]] },
    { input: [["a"]], expected: [["a"]] },
  ],
  solution:
    "function groupAnagrams(strs) {\n" +
    "  const groups = new Map();\n" +
    "  for (const s of strs) {\n" +
    "    const key = s.split('').sort().join('');\n" +
    "    if (!groups.has(key)) groups.set(key, []);\n" +
    "    groups.get(key).push(s);\n" +
    "  }\n" +
    "  return [...groups.values()];\n" +
    "}",
  // Both the group order and the order of strings within each group are
  // implementation details; canonicalize both sides before comparing.
  normalize: canonicalGroups,
};

const hashing: Pattern = {
  id: "hashing",
  name: "Hashing",
  subpatterns: [
    {
      id: "hash-hash-map",
      name: "Hash Map",
      explanation:
        "A hash map gives O(1) average lookup/insert, turning many O(n^2) brute-force pair/lookup problems into " +
        "O(n) by trading space for time.",
      problems: [],
    },
    {
      id: "hash-frequency-map",
      name: "Frequency Map",
      explanation:
        "Count occurrences of each element into a map (or array for small fixed alphabets) to answer questions " +
        "about counts, duplicates, or majority elements in one pass.",
      problems: [],
    },
    {
      id: "hash-count-distinct",
      name: "Count Distinct",
      explanation:
        "A hash set tracks which elements have already been seen, letting you count or filter distinct values " +
        "in O(n) instead of sorting first.",
      problems: [],
    },
    {
      id: "hash-group-anagrams",
      name: "Group Anagrams",
      explanation:
        "Bucket strings by a canonical signature (sorted characters, or a letter-count signature) so anagrams " +
        "land in the same bucket without pairwise comparison.",
      problems: [groupAnagrams],
    },
    {
      id: "hash-two-sum",
      name: "Two Sum",
      explanation:
        "The canonical 'have I seen the complement' hash map pattern: check for target - current before " +
        "inserting current, so the whole array is scanned once.",
      problems: [twoSum],
    },
  ],
};

// ─── Stack ─────────────────────────────────────────────────────────────────

const validParentheses: Problem = {
  id: "stack-valid-parentheses",
  title: "Valid Parentheses",
  difficulty: "Easy",
  description:
    "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input is " +
    "valid: every open bracket is closed by the same type of bracket, in the correct order.\n\n" +
    "Push open brackets onto a stack; on a closing bracket, pop and check it matches. Valid iff the stack ends empty.",
  fnName: "isValidParens",
  starterCode: "function isValidParens(s) {\n  // your code here\n}",
  testCases: [
    { input: ["()"], expected: true },
    { input: ["()[]{}"], expected: true },
    { input: ["(]"], expected: false },
    { input: ["([)]"], expected: false },
    { input: ["{[]}"], expected: true },
  ],
  solution:
    "function isValidParens(s) {\n" +
    "  const pairs = { ')': '(', ']': '[', '}': '{' };\n" +
    "  const stack = [];\n" +
    "  for (const c of s) {\n" +
    "    if (c === '(' || c === '[' || c === '{') {\n" +
    "      stack.push(c);\n" +
    "    } else {\n" +
    "      if (stack.pop() !== pairs[c]) return false;\n" +
    "    }\n" +
    "  }\n" +
    "  return stack.length === 0;\n" +
    "}",
};

const nextGreaterElements: Problem = {
  id: "stack-next-greater-elements",
  title: "Next Greater Element",
  difficulty: "Medium",
  description:
    "Given an array of integers, return an array where each element is replaced by the next element to its " +
    "right that is strictly greater; use -1 if there is none.\n\n" +
    "Monotonic stack: walk the array keeping a decreasing stack of indices. When the current element is greater " +
    "than the index on top of the stack, it's that index's 'next greater' — pop and record it.",
  fnName: "nextGreaterElements",
  starterCode: "function nextGreaterElements(nums) {\n  // your code here\n}",
  testCases: [
    { input: [[2, 1, 2, 4, 3]], expected: [4, 2, 4, -1, -1] },
    { input: [[1, 2, 3, 4]], expected: [2, 3, 4, -1] },
    { input: [[4, 3, 2, 1]], expected: [-1, -1, -1, -1] },
  ],
  solution:
    "function nextGreaterElements(nums) {\n" +
    "  const result = new Array(nums.length).fill(-1);\n" +
    "  const stack = [];\n" +
    "  for (let i = 0; i < nums.length; i++) {\n" +
    "    while (stack.length && nums[i] > nums[stack[stack.length - 1]]) {\n" +
    "      const idx = stack.pop();\n" +
    "      result[idx] = nums[i];\n" +
    "    }\n" +
    "    stack.push(i);\n" +
    "  }\n" +
    "  return result;\n" +
    "}",
};

const stack: Pattern = {
  id: "stack",
  name: "Stack",
  subpatterns: [
    {
      id: "stack-monotonic",
      name: "Monotonic Stack",
      explanation:
        "Keep the stack's elements strictly increasing or decreasing by popping before every push. Popped " +
        "elements have just found their 'next greater/smaller' neighbor.",
      problems: [],
    },
    {
      id: "stack-balanced-parens",
      name: "Balanced Parentheses",
      explanation:
        "Push opening brackets; on a closing bracket, pop and verify it's the matching type. Balanced iff the " +
        "stack is empty at the end.",
      problems: [validParentheses],
    },
    {
      id: "stack-next-greater-smaller",
      name: "Next Greater / Smaller",
      explanation:
        "For each element, find the nearest element to its right (or left) that is greater/smaller, using a " +
        "monotonic stack to avoid an O(n^2) scan.",
      problems: [nextGreaterElements],
    },
    {
      id: "stack-min-stack",
      name: "Min Stack",
      explanation:
        "Augment a stack so it can report its current minimum in O(1), typically by pushing (value, currentMin) " +
        "pairs or maintaining a parallel min-stack.",
      problems: [],
    },
  ],
};

// ─── Remaining 12 patterns — structure only, seeded content coming soon ───

function stub(id: string, name: string, subpatternNames: string[]): Pattern {
  return {
    id,
    name,
    subpatterns: subpatternNames.map((n) => ({
      id: `${id}-${n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
      name: n,
      explanation: `Problems coming soon. "${n}" is part of the ${name} pattern family.`,
      problems: [],
    })),
  };
}

const queueDeque = stub("queue-deque", "Queue / Deque", [
  "Sliding Window Maximum",
  "First Negative in Window",
  "Deque Optimization",
  "Design Queue",
]);

const linkedList = stub("linked-list", "Linked List", [
  "Fast-Slow Pointers",
  "Cycle Detection",
  "Reversal",
  "Merge Lists",
]);

const trees = stub("trees", "Trees", ["Traversal", "BST", "Lowest Common Ancestor", "Construction"]);

const recursion = stub("recursion", "Recursion", [
  "Backtracking",
  "Divide & Conquer",
  "Tree/Graph Recursion",
  "Memoization",
]);

const heap = stub("heap", "Heap", ["Priority Queue", "Top-K", "Heapify/Heap Sort"]);

const graphs = stub("graphs", "Graphs", ["BFS", "DFS", "Dijkstra", "Topological Sort"]);

const trie = stub("trie", "Trie", ["Insert/Search", "Prefix Problems", "Word Break"]);

const dynamicProgramming = stub("dynamic-programming", "Dynamic Programming", [
  "1D",
  "2D",
  "Knapsack",
  "DP on Trees",
]);

const greedy = stub("greedy", "Greedy", ["Activity Selection", "Interval Scheduling", "Huffman Coding"]);

const bitManipulation = stub("bit-manipulation", "Bit Manipulation", [
  "Basic Ops",
  "Counting Set Bits",
  "XOR Tricks",
]);

const advanced = stub("advanced", "Advanced", ["Two Pointers", "Meet in the Middle", "Sweep Line"]);

const rangeStructures = stub("range-structures", "Range Structures", [
  "Prefix Sum",
  "Segment Tree",
  "Fenwick Tree/BIT",
]);

// ─── Full 16-pattern curriculum ───────────────────────────────────────────

export const PATTERNS: Pattern[] = [
  arrays,
  stringPattern,
  hashing,
  stack,
  queueDeque,
  linkedList,
  trees,
  recursion,
  heap,
  graphs,
  trie,
  dynamicProgramming,
  greedy,
  bitManipulation,
  advanced,
  rangeStructures,
];

export function findProblem(problemId: string): { pattern: Pattern; subpattern: SubPatternRef; problem: Problem } | undefined {
  for (const pattern of PATTERNS) {
    for (const subpattern of pattern.subpatterns) {
      const problem = subpattern.problems.find((p) => p.id === problemId);
      if (problem) return { pattern, subpattern, problem };
    }
  }
  return undefined;
}

type SubPatternRef = Pattern["subpatterns"][number];
