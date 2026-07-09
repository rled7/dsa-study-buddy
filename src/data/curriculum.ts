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
  solutions: [
    {
      approach: "Prefix Sum + HashMap",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      explanation:
        "Track a running prefix sum and how many times each prefix sum value has occurred. A subarray ending at " +
        "the current index sums to k exactly when (currentSum - k) was seen before, so each index is O(1) work.",
      code:
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
    },
    {
      approach: "Brute-force (all subarrays)",
      timeComplexity: "O(n^2)",
      spaceComplexity: "O(1)",
      explanation:
        "Try every start index, extending the end index one step at a time and keeping a running sum. Correct, " +
        "but re-derives every subarray sum from scratch instead of reusing prefix sums.",
      code:
        "function subarraySumEqualsK(nums, k) {\n" +
        "  let count = 0;\n" +
        "  for (let i = 0; i < nums.length; i++) {\n" +
        "    let sum = 0;\n" +
        "    for (let j = i; j < nums.length; j++) {\n" +
        "      sum += nums[j];\n" +
        "      if (sum === k) count++;\n" +
        "    }\n" +
        "  }\n" +
        "  return count;\n" +
        "}",
    },
  ],
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
  solutions: [
    {
      approach: "Sliding Window",
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      explanation:
        "Compute the sum of the first window, then slide it one element at a time: add the entering element and " +
        "subtract the leaving one instead of re-summing the whole window.",
      code:
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
    },
    {
      approach: "Brute-force (recompute each window)",
      timeComplexity: "O(n*k)",
      spaceComplexity: "O(1)",
      explanation:
        "Try every window start index and sum its k elements from scratch. Correct, but redoes work the sliding " +
        "window reuses.",
      code:
        "function maxSumSubarrayOfSizeK(nums, k) {\n" +
        "  let max = -Infinity;\n" +
        "  for (let i = 0; i + k <= nums.length; i++) {\n" +
        "    let sum = 0;\n" +
        "    for (let j = i; j < i + k; j++) sum += nums[j];\n" +
        "    max = Math.max(max, sum);\n" +
        "  }\n" +
        "  return max;\n" +
        "}",
    },
  ],
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
  solutions: [
    {
      approach: "Two Pointers",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      explanation:
        "Clean the string once, then walk pointers inward from both ends, comparing and stopping at the first " +
        "mismatch. No extra pass needed once the string is cleaned.",
      code:
        "function isPalindrome(s) {\n" +
        "  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');\n" +
        "  let i = 0, j = clean.length - 1;\n" +
        "  while (i < j) {\n" +
        "    if (clean[i] !== clean[j]) return false;\n" +
        "    i++; j--;\n" +
        "  }\n" +
        "  return true;\n" +
        "}",
    },
    {
      approach: "Recursive Slice-and-Compare",
      timeComplexity: "O(n^2)",
      spaceComplexity: "O(n)",
      explanation:
        "Clean the string, then recursively compare its outer characters and recurse on the substring with " +
        "both ends trimmed off. Each level slices a new string (an O(n) copy), so total work is quadratic " +
        "even though the recursion is only n levels deep.",
      code:
        "function isPalindrome(s) {\n" +
        "  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');\n" +
        "  function check(str) {\n" +
        "    if (str.length <= 1) return true;\n" +
        "    if (str[0] !== str[str.length - 1]) return false;\n" +
        "    return check(str.slice(1, -1));\n" +
        "  }\n" +
        "  return check(clean);\n" +
        "}",
    },
  ],
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
  solutions: [
    {
      approach: "Frequency Map",
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      explanation:
        "Count each character of s into a map, then decrement while walking t. Space is O(1) since the " +
        "alphabet is fixed-size regardless of string length.",
      code:
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
    },
    {
      approach: "Sort + Compare",
      timeComplexity: "O(n log n)",
      spaceComplexity: "O(n)",
      explanation:
        "Sort both strings' characters and compare the results directly. Simple to reason about, but the sort " +
        "is asymptotically worse than counting.",
      code:
        "function isAnagram(s, t) {\n" +
        "  if (s.length !== t.length) return false;\n" +
        "  const sort = (str) => str.split('').sort().join('');\n" +
        "  return sort(s) === sort(t);\n" +
        "}",
    },
  ],
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
  solutions: [
    {
      approach: "One-pass HashMap",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      explanation:
        "For each number, check whether its complement was already seen before inserting the current number. " +
        "The whole array is scanned exactly once.",
      code:
        "function twoSum(nums, target) {\n" +
        "  const seen = new Map();\n" +
        "  for (let i = 0; i < nums.length; i++) {\n" +
        "    const complement = target - nums[i];\n" +
        "    if (seen.has(complement)) return [seen.get(complement), i];\n" +
        "    seen.set(nums[i], i);\n" +
        "  }\n" +
        "  return [];\n" +
        "}",
    },
    {
      approach: "Brute-force (all pairs)",
      timeComplexity: "O(n^2)",
      spaceComplexity: "O(1)",
      explanation:
        "Check every pair of indices for a sum match. No extra space, but quadratic time.",
      code:
        "function twoSum(nums, target) {\n" +
        "  for (let i = 0; i < nums.length; i++) {\n" +
        "    for (let j = i + 1; j < nums.length; j++) {\n" +
        "      if (nums[i] + nums[j] === target) return [i, j];\n" +
        "    }\n" +
        "  }\n" +
        "  return [];\n" +
        "}",
    },
  ],
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
  solutions: [
    {
      approach: "Sorted-Key HashMap",
      timeComplexity: "O(n * k log k)",
      spaceComplexity: "O(n * k)",
      explanation:
        "Bucket each string under its sorted-character signature (k = string length); anagrams share the same " +
        "signature. Simple, but sorting each string costs an extra log k factor.",
      code:
        "function groupAnagrams(strs) {\n" +
        "  const groups = new Map();\n" +
        "  for (const s of strs) {\n" +
        "    const key = s.split('').sort().join('');\n" +
        "    if (!groups.has(key)) groups.set(key, []);\n" +
        "    groups.get(key).push(s);\n" +
        "  }\n" +
        "  return [...groups.values()];\n" +
        "}",
    },
    {
      approach: "Character-Count Signature",
      timeComplexity: "O(n * k)",
      spaceComplexity: "O(n * k)",
      explanation:
        "Build each string's signature from a 26-length lowercase letter count instead of sorting, dropping the " +
        "log k factor since counting is linear in the string's length.",
      code:
        "function groupAnagrams(strs) {\n" +
        "  const groups = new Map();\n" +
        "  for (const s of strs) {\n" +
        "    const counts = new Array(26).fill(0);\n" +
        "    for (const c of s) counts[c.charCodeAt(0) - 97]++;\n" +
        "    const key = counts.join(',');\n" +
        "    if (!groups.has(key)) groups.set(key, []);\n" +
        "    groups.get(key).push(s);\n" +
        "  }\n" +
        "  return [...groups.values()];\n" +
        "}",
    },
  ],
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
  solutions: [
    {
      approach: "Stack",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      explanation:
        "Push every opening bracket. On a closing bracket, pop and check it matches the expected opener. Valid " +
        "iff the stack is empty once the string is fully consumed.",
      code:
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
    },
    {
      approach: "Iterative Pair Removal",
      timeComplexity: "O(n^2)",
      spaceComplexity: "O(n)",
      explanation:
        "Repeatedly strip innermost matched pairs ('()', '[]', '{}') until nothing changes. Valid iff the " +
        "string is empty at the end. Each pass is O(n) and up to O(n) passes may be needed, so it's quadratic " +
        "in the worst case, but it avoids reasoning about an explicit stack.",
      code:
        "function isValidParens(s) {\n" +
        "  let prev;\n" +
        "  do {\n" +
        "    prev = s;\n" +
        "    s = s.replace('()', '').replace('[]', '').replace('{}', '');\n" +
        "  } while (s !== prev);\n" +
        "  return s.length === 0;\n" +
        "}",
    },
  ],
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
  solutions: [
    {
      approach: "Monotonic Stack",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      explanation:
        "Keep a stack of indices whose 'next greater' hasn't been found yet, decreasing top-to-bottom in value. " +
        "Each index is pushed once and popped at most once, so the total work across the whole array is linear.",
      code:
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
    },
    {
      approach: "Brute-force (scan right for each element)",
      timeComplexity: "O(n^2)",
      spaceComplexity: "O(1)",
      explanation:
        "For each index, scan rightward until a strictly greater element is found. Correct and easy to reason " +
        "about, but re-scans the array from every starting index.",
      code:
        "function nextGreaterElements(nums) {\n" +
        "  const result = new Array(nums.length).fill(-1);\n" +
        "  for (let i = 0; i < nums.length; i++) {\n" +
        "    for (let j = i + 1; j < nums.length; j++) {\n" +
        "      if (nums[j] > nums[i]) {\n" +
        "        result[i] = nums[j];\n" +
        "        break;\n" +
        "      }\n" +
        "    }\n" +
        "  }\n" +
        "  return result;\n" +
        "}",
    },
  ],
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

// ─── System Design Building Blocks ────────────────────────────────────────
// Codeable versions of terms from the System Design glossary (#/concepts).
// Each problem is graded against ONE fnName/testCases pair like any other
// problem, but `solutions` additionally lists every conceptually distinct
// way to solve it, ordered fastest-to-slowest by time complexity — all
// verified to independently pass the same testCases (see verify/verify-solutions.mjs,
// which covers every pattern's problems, not just System Design).

const lruCache: Problem = {
  id: "sysdes-lru-cache",
  title: "LRU Cache (Caching)",
  difficulty: "Medium",
  description:
    "Codes the 'Caching' glossary term. Given a capacity and a sequence of put(key, value)/get(key) operations, " +
    "return one result per operation: null for put, the value (or -1 if absent) for get. When a put would exceed " +
    "capacity, evict the Least Recently Used key first. Both get and put count as 'using' a key.\n\n" +
    "ops[i] is either \"put\" or \"get\"; argsList[i] holds that operation's arguments.",
  fnName: "lruCacheOperations",
  starterCode: "function lruCacheOperations(capacity, ops, argsList) {\n  // your code here\n}",
  testCases: [
    {
      input: [
        2,
        ["put", "put", "get", "put", "get", "put", "get", "get", "get"],
        [[1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]],
      ],
      expected: [null, null, 1, null, -1, null, -1, 3, 4],
    },
    {
      input: [1, ["put", "get", "put", "get", "get"], [[2, 1], [2], [3, 2], [2], [3]]],
      expected: [null, 1, null, -1, 2],
    },
  ],
  solution:
    "function lruCacheOperations(capacity, ops, argsList) {\n" +
    "  const map = new Map();\n" +
    "  const head = { key: null, value: null, prev: null, next: null };\n" +
    "  const tail = { key: null, value: null, prev: null, next: null };\n" +
    "  head.next = tail; tail.prev = head;\n" +
    "  function remove(node) { node.prev.next = node.next; node.next.prev = node.prev; }\n" +
    "  function addFront(node) { node.next = head.next; node.prev = head; head.next.prev = node; head.next = node; }\n" +
    "  const results = [];\n" +
    "  for (let i = 0; i < ops.length; i++) {\n" +
    "    const op = ops[i], args = argsList[i];\n" +
    "    if (op === 'put') {\n" +
    "      const [key, value] = args;\n" +
    "      if (map.has(key)) {\n" +
    "        const node = map.get(key);\n" +
    "        node.value = value; remove(node); addFront(node);\n" +
    "      } else {\n" +
    "        if (map.size >= capacity) { const lru = tail.prev; remove(lru); map.delete(lru.key); }\n" +
    "        const node = { key, value, prev: null, next: null };\n" +
    "        addFront(node); map.set(key, node);\n" +
    "      }\n" +
    "      results.push(null);\n" +
    "    } else {\n" +
    "      const [key] = args;\n" +
    "      if (!map.has(key)) { results.push(-1); }\n" +
    "      else { const node = map.get(key); remove(node); addFront(node); results.push(node.value); }\n" +
    "    }\n" +
    "  }\n" +
    "  return results;\n" +
    "}",
  solutions: [
    {
      approach: "HashMap + Doubly Linked List",
      timeComplexity: "O(1) per operation",
      spaceComplexity: "O(capacity)",
      explanation:
        "The HashMap gives O(1) lookup by key; the doubly linked list gives O(1) move-to-front and O(1) " +
        "eviction from the tail, since removing/inserting a known node needs no traversal. This is the standard " +
        "real-world implementation (e.g. what a Redis-style in-process cache does).",
      code:
        "function lruCacheOperations(capacity, ops, argsList) {\n" +
        "  const map = new Map();\n" +
        "  const head = { key: null, value: null, prev: null, next: null };\n" +
        "  const tail = { key: null, value: null, prev: null, next: null };\n" +
        "  head.next = tail; tail.prev = head;\n" +
        "  function remove(node) { node.prev.next = node.next; node.next.prev = node.prev; }\n" +
        "  function addFront(node) { node.next = head.next; node.prev = head; head.next.prev = node; head.next = node; }\n" +
        "  const results = [];\n" +
        "  for (let i = 0; i < ops.length; i++) {\n" +
        "    const op = ops[i], args = argsList[i];\n" +
        "    if (op === 'put') {\n" +
        "      const [key, value] = args;\n" +
        "      if (map.has(key)) {\n" +
        "        const node = map.get(key);\n" +
        "        node.value = value; remove(node); addFront(node);\n" +
        "      } else {\n" +
        "        if (map.size >= capacity) { const lru = tail.prev; remove(lru); map.delete(lru.key); }\n" +
        "        const node = { key, value, prev: null, next: null };\n" +
        "        addFront(node); map.set(key, node);\n" +
        "      }\n" +
        "      results.push(null);\n" +
        "    } else {\n" +
        "      const [key] = args;\n" +
        "      if (!map.has(key)) { results.push(-1); }\n" +
        "      else { const node = map.get(key); remove(node); addFront(node); results.push(node.value); }\n" +
        "    }\n" +
        "  }\n" +
        "  return results;\n" +
        "}",
    },
    {
      approach: "Brute-force array (linear scan + splice)",
      timeComplexity: "O(n) per operation",
      spaceComplexity: "O(n)",
      explanation:
        "Keep a plain array ordered most-recently-used first. Every get/put has to scan for the key (O(n)) and " +
        "splice it to the front (O(n)). Correct, but each operation degrades linearly as the cache fills.",
      code:
        "function lruCacheOperations(capacity, ops, argsList) {\n" +
        "  let arr = [];\n" +
        "  const results = [];\n" +
        "  for (let i = 0; i < ops.length; i++) {\n" +
        "    const op = ops[i], args = argsList[i];\n" +
        "    if (op === 'put') {\n" +
        "      const [key, value] = args;\n" +
        "      const idx = arr.findIndex(([k]) => k === key);\n" +
        "      if (idx !== -1) arr.splice(idx, 1);\n" +
        "      arr.unshift([key, value]);\n" +
        "      if (arr.length > capacity) arr.pop();\n" +
        "      results.push(null);\n" +
        "    } else {\n" +
        "      const [key] = args;\n" +
        "      const idx = arr.findIndex(([k]) => k === key);\n" +
        "      if (idx === -1) { results.push(-1); }\n" +
        "      else { const [, value] = arr[idx]; arr.splice(idx, 1); arr.unshift([key, value]); results.push(value); }\n" +
        "    }\n" +
        "  }\n" +
        "  return results;\n" +
        "}",
    },
  ],
};

const lfuCache: Problem = {
  id: "sysdes-lfu-cache",
  title: "LFU Cache (Caching)",
  difficulty: "Medium",
  description:
    "A stricter sibling of LRU under the 'Caching' glossary term: evict the Least Frequently Used key " +
    "instead of the least recently used one. Ties (equal frequency) break by evicting whichever of the " +
    "tied keys was touched least recently. Given a capacity and a sequence of put(key, value)/get(key) " +
    "operations, return one result per operation: null for put, the value (or -1 if absent) for get. " +
    "Both get and a put on an existing key count as 'using' that key and bump its frequency by 1.\n\n" +
    "ops[i] is either \"put\" or \"get\"; argsList[i] holds that operation's arguments.",
  fnName: "lfuCacheOperations",
  starterCode: "function lfuCacheOperations(capacity, ops, argsList) {\n  // your code here\n}",
  testCases: [
    {
      input: [
        2,
        ["put", "put", "get", "put", "get", "get", "put", "get", "get", "get"],
        [[1, 1], [2, 2], [1], [3, 3], [2], [3], [4, 4], [1], [3], [4]],
      ],
      expected: [null, null, 1, null, -1, 3, null, -1, 3, 4],
    },
    {
      input: [0, ["put", "get"], [[0, 0], [0]]],
      expected: [null, -1],
    },
  ],
  solution:
    "function lfuCacheOperations(capacity, ops, argsList) {\n" +
    "  const vals = new Map();\n" +
    "  const freqs = new Map();\n" +
    "  const freqGroups = new Map();\n" +
    "  let minFreq = 0;\n" +
    "  function touch(key) {\n" +
    "    const f = freqs.get(key);\n" +
    "    freqGroups.get(f).delete(key);\n" +
    "    if (freqGroups.get(f).size === 0) {\n" +
    "      freqGroups.delete(f);\n" +
    "      if (minFreq === f) minFreq = f + 1;\n" +
    "    }\n" +
    "    freqs.set(key, f + 1);\n" +
    "    if (!freqGroups.has(f + 1)) freqGroups.set(f + 1, new Set());\n" +
    "    freqGroups.get(f + 1).add(key);\n" +
    "  }\n" +
    "  const results = [];\n" +
    "  for (let i = 0; i < ops.length; i++) {\n" +
    "    const op = ops[i], args = argsList[i];\n" +
    "    if (op === 'put') {\n" +
    "      if (capacity <= 0) { results.push(null); continue; }\n" +
    "      const [key, value] = args;\n" +
    "      if (vals.has(key)) {\n" +
    "        vals.set(key, value);\n" +
    "        touch(key);\n" +
    "      } else {\n" +
    "        if (vals.size >= capacity) {\n" +
    "          const evictSet = freqGroups.get(minFreq);\n" +
    "          const evictKey = evictSet.values().next().value;\n" +
    "          evictSet.delete(evictKey);\n" +
    "          if (evictSet.size === 0) freqGroups.delete(minFreq);\n" +
    "          vals.delete(evictKey);\n" +
    "          freqs.delete(evictKey);\n" +
    "        }\n" +
    "        vals.set(key, value);\n" +
    "        freqs.set(key, 1);\n" +
    "        if (!freqGroups.has(1)) freqGroups.set(1, new Set());\n" +
    "        freqGroups.get(1).add(key);\n" +
    "        minFreq = 1;\n" +
    "      }\n" +
    "      results.push(null);\n" +
    "    } else {\n" +
    "      const [key] = args;\n" +
    "      if (!vals.has(key)) { results.push(-1); }\n" +
    "      else { const v = vals.get(key); touch(key); results.push(v); }\n" +
    "    }\n" +
    "  }\n" +
    "  return results;\n" +
    "}",
  solutions: [
    {
      approach: "HashMap + Frequency Buckets",
      timeComplexity: "O(1) per operation",
      spaceComplexity: "O(capacity)",
      explanation:
        "Track each key's frequency and group keys into per-frequency Sets, plus a running minFreq pointer. " +
        "Eviction just pulls the oldest key out of the minFreq group — no scanning required, since Set " +
        "iteration order preserves insertion order for the least-recently-touched tie-break.",
      code:
        "function lfuCacheOperations(capacity, ops, argsList) {\n" +
        "  const vals = new Map();\n" +
        "  const freqs = new Map();\n" +
        "  const freqGroups = new Map();\n" +
        "  let minFreq = 0;\n" +
        "  function touch(key) {\n" +
        "    const f = freqs.get(key);\n" +
        "    freqGroups.get(f).delete(key);\n" +
        "    if (freqGroups.get(f).size === 0) {\n" +
        "      freqGroups.delete(f);\n" +
        "      if (minFreq === f) minFreq = f + 1;\n" +
        "    }\n" +
        "    freqs.set(key, f + 1);\n" +
        "    if (!freqGroups.has(f + 1)) freqGroups.set(f + 1, new Set());\n" +
        "    freqGroups.get(f + 1).add(key);\n" +
        "  }\n" +
        "  const results = [];\n" +
        "  for (let i = 0; i < ops.length; i++) {\n" +
        "    const op = ops[i], args = argsList[i];\n" +
        "    if (op === 'put') {\n" +
        "      if (capacity <= 0) { results.push(null); continue; }\n" +
        "      const [key, value] = args;\n" +
        "      if (vals.has(key)) {\n" +
        "        vals.set(key, value);\n" +
        "        touch(key);\n" +
        "      } else {\n" +
        "        if (vals.size >= capacity) {\n" +
        "          const evictSet = freqGroups.get(minFreq);\n" +
        "          const evictKey = evictSet.values().next().value;\n" +
        "          evictSet.delete(evictKey);\n" +
        "          if (evictSet.size === 0) freqGroups.delete(minFreq);\n" +
        "          vals.delete(evictKey);\n" +
        "          freqs.delete(evictKey);\n" +
        "        }\n" +
        "        vals.set(key, value);\n" +
        "        freqs.set(key, 1);\n" +
        "        if (!freqGroups.has(1)) freqGroups.set(1, new Set());\n" +
        "        freqGroups.get(1).add(key);\n" +
        "        minFreq = 1;\n" +
        "      }\n" +
        "      results.push(null);\n" +
        "    } else {\n" +
        "      const [key] = args;\n" +
        "      if (!vals.has(key)) { results.push(-1); }\n" +
        "      else { const v = vals.get(key); touch(key); results.push(v); }\n" +
        "    }\n" +
        "  }\n" +
        "  return results;\n" +
        "}",
    },
    {
      approach: "Brute-force array (linear scan for lowest frequency)",
      timeComplexity: "O(n) per operation",
      spaceComplexity: "O(n)",
      explanation:
        "Keep a plain array of {key, value, freq, order}. Every get/put has to scan the whole array to find " +
        "the entry (O(n)), and eviction rescans it again to find the min-frequency, oldest-order entry (O(n)). " +
        "Correct, but linear cost on every single operation.",
      code:
        "function lfuCacheOperations(capacity, ops, argsList) {\n" +
        "  let entries = [];\n" +
        "  let counter = 0;\n" +
        "  const results = [];\n" +
        "  for (let i = 0; i < ops.length; i++) {\n" +
        "    const op = ops[i], args = argsList[i];\n" +
        "    if (op === 'put') {\n" +
        "      if (capacity <= 0) { results.push(null); continue; }\n" +
        "      const [key, value] = args;\n" +
        "      const idx = entries.findIndex((e) => e.key === key);\n" +
        "      if (idx !== -1) {\n" +
        "        entries[idx].value = value;\n" +
        "        entries[idx].freq++;\n" +
        "        entries[idx].order = counter++;\n" +
        "      } else {\n" +
        "        if (entries.length >= capacity) {\n" +
        "          let evictIdx = 0;\n" +
        "          for (let j = 1; j < entries.length; j++) {\n" +
        "            if (entries[j].freq < entries[evictIdx].freq ||\n" +
        "                (entries[j].freq === entries[evictIdx].freq && entries[j].order < entries[evictIdx].order)) {\n" +
        "              evictIdx = j;\n" +
        "            }\n" +
        "          }\n" +
        "          entries.splice(evictIdx, 1);\n" +
        "        }\n" +
        "        entries.push({ key, value, freq: 1, order: counter++ });\n" +
        "      }\n" +
        "      results.push(null);\n" +
        "    } else {\n" +
        "      const [key] = args;\n" +
        "      const idx = entries.findIndex((e) => e.key === key);\n" +
        "      if (idx === -1) { results.push(-1); }\n" +
        "      else {\n" +
        "        entries[idx].freq++;\n" +
        "        entries[idx].order = counter++;\n" +
        "        results.push(entries[idx].value);\n" +
        "      }\n" +
        "    }\n" +
        "  }\n" +
        "  return results;\n" +
        "}",
    },
  ],
};

const rateLimiter: Problem = {
  id: "sysdes-rate-limiter",
  title: "Rate Limiter (Rate Limiting)",
  difficulty: "Medium",
  description:
    "Codes the 'Rate Limiting' glossary term. Given maxRequests, windowMs, and an array of request timestamps " +
    "(ms, ascending), return one boolean per timestamp: true if that request is allowed under a sliding " +
    "'maxRequests per windowMs' policy, false if it should be rejected.",
  fnName: "rateLimiterOperations",
  starterCode: "function rateLimiterOperations(maxRequests, windowMs, timestamps) {\n  // your code here\n}",
  testCases: [
    {
      input: [3, 1000, [0, 10, 20, 30, 2000, 2010, 2020, 2030]],
      expected: [true, true, true, false, true, true, true, false],
    },
    { input: [1, 100, [5, 50, 200]], expected: [true, false, true] },
  ],
  solution:
    "function rateLimiterOperations(maxRequests, windowMs, timestamps) {\n" +
    "  let windowStart = null, count = 0;\n" +
    "  const results = [];\n" +
    "  for (const t of timestamps) {\n" +
    "    const windowIndex = Math.floor(t / windowMs);\n" +
    "    if (windowStart === null || windowIndex !== windowStart) { windowStart = windowIndex; count = 0; }\n" +
    "    if (count < maxRequests) { count++; results.push(true); } else { results.push(false); }\n" +
    "  }\n" +
    "  return results;\n" +
    "}",
  solutions: [
    {
      approach: "Fixed Window Counter",
      timeComplexity: "O(1) per request",
      spaceComplexity: "O(1)",
      explanation:
        "Just a counter that resets when the timestamp crosses into a new windowMs-sized bucket. Cheapest option, " +
        "but the classic flaw: a burst straddling a window boundary can let through up to ~2x maxRequests in a " +
        "short span, since each half-window is counted independently.",
      code:
        "function rateLimiterOperations(maxRequests, windowMs, timestamps) {\n" +
        "  let windowStart = null, count = 0;\n" +
        "  const results = [];\n" +
        "  for (const t of timestamps) {\n" +
        "    const windowIndex = Math.floor(t / windowMs);\n" +
        "    if (windowStart === null || windowIndex !== windowStart) { windowStart = windowIndex; count = 0; }\n" +
        "    if (count < maxRequests) { count++; results.push(true); } else { results.push(false); }\n" +
        "  }\n" +
        "  return results;\n" +
        "}",
    },
    {
      approach: "Sliding Window Log",
      timeComplexity: "O(k) per request, k = requests currently in window",
      spaceComplexity: "O(k)",
      explanation:
        "Store the timestamp of every allowed request; on each new request, prune entries older than windowMs " +
        "then check the remaining count. Exact — no boundary-burst flaw — at the cost of storing and scanning a " +
        "log per client instead of one counter.",
      code:
        "function rateLimiterOperations(maxRequests, windowMs, timestamps) {\n" +
        "  const log = [];\n" +
        "  const results = [];\n" +
        "  for (const t of timestamps) {\n" +
        "    while (log.length && log[0] <= t - windowMs) log.shift();\n" +
        "    if (log.length < maxRequests) { log.push(t); results.push(true); } else { results.push(false); }\n" +
        "  }\n" +
        "  return results;\n" +
        "}",
    },
  ],
};

const idempotencyStore: Problem = {
  id: "sysdes-idempotency-store",
  title: "Idempotency Key Store (Idempotency)",
  difficulty: "Easy",
  description:
    "Codes the 'Idempotency' glossary term. Given a sequence of request IDs, return one boolean per request: " +
    "true if this is the first time that ID has been seen (safe to actually process it), false if it's a " +
    "duplicate (already processed, skip it) — the mechanism that prevents a retried network call from double-charging.",
  fnName: "idempotencyOperations",
  starterCode: "function idempotencyOperations(requestIds) {\n  // your code here\n}",
  testCases: [
    { input: [["a", "b", "a", "c", "b", "b", "d"]], expected: [true, true, false, true, false, false, true] },
  ],
  solution:
    "function idempotencyOperations(requestIds) {\n" +
    "  const seen = new Set();\n" +
    "  return requestIds.map((id) => { if (seen.has(id)) return false; seen.add(id); return true; });\n" +
    "}",
  solutions: [
    {
      approach: "HashSet",
      timeComplexity: "O(1) per operation",
      spaceComplexity: "O(n)",
      explanation: "A Set gives O(1) membership checks — the standard way an API gateway dedupes retried requests.",
      code:
        "function idempotencyOperations(requestIds) {\n" +
        "  const seen = new Set();\n" +
        "  return requestIds.map((id) => { if (seen.has(id)) return false; seen.add(id); return true; });\n" +
        "}",
    },
    {
      approach: "Brute-force array scan",
      timeComplexity: "O(n) per operation",
      spaceComplexity: "O(n)",
      explanation: "Same idea, but `.includes` rescans everything seen so far — correct, just needlessly slower.",
      code:
        "function idempotencyOperations(requestIds) {\n" +
        "  const seen = [];\n" +
        "  return requestIds.map((id) => { if (seen.includes(id)) return false; seen.push(id); return true; });\n" +
        "}",
    },
  ],
};

const trieAutocomplete: Problem = {
  id: "sysdes-autocomplete",
  title: "Prefix Autocomplete (Search-as-you-type)",
  difficulty: "Medium",
  description:
    "A common frontend companion to 'Query Optimization' / search indexing: given a dictionary of words and a " +
    "list of query prefixes, return the (alphabetically sorted) words matching each prefix.",
  fnName: "autocompleteOperations",
  starterCode: "function autocompleteOperations(dictionary, prefixes) {\n  // your code here\n}",
  testCases: [
    {
      input: [["cat", "car", "cart", "dog", "do", "door", "cats"], ["ca", "do", "z", "cart"]],
      expected: [["car", "cart", "cat", "cats"], ["do", "dog", "door"], [], ["cart"]],
    },
  ],
  normalize: (v) => (Array.isArray(v) ? v.map((g) => (Array.isArray(g) ? [...g].sort() : g)) : v),
  solution:
    "function autocompleteOperations(dictionary, prefixes) {\n" +
    "  const root = {};\n" +
    "  for (const word of dictionary) {\n" +
    "    let node = root;\n" +
    "    for (const ch of word) { node[ch] = node[ch] || {}; node = node[ch]; }\n" +
    "    node.$end = word;\n" +
    "  }\n" +
    "  function collect(node, out) {\n" +
    "    if (node.$end) out.push(node.$end);\n" +
    "    for (const ch in node) { if (ch !== '$end') collect(node[ch], out); }\n" +
    "  }\n" +
    "  return prefixes.map((prefix) => {\n" +
    "    let node = root;\n" +
    "    for (const ch of prefix) { if (!node[ch]) return []; node = node[ch]; }\n" +
    "    const out = [];\n" +
    "    collect(node, out);\n" +
    "    return out.sort();\n" +
    "  });\n" +
    "}",
  solutions: [
    {
      approach: "Trie",
      timeComplexity: "O(m + results) per query, m = prefix length",
      spaceComplexity: "O(total characters in dictionary)",
      explanation:
        "Build a trie once from the dictionary. Each query walks m characters to the prefix's node, then collects " +
        "whatever words hang below it — cost scales with the prefix and the match count, not the dictionary size.",
      code:
        "function autocompleteOperations(dictionary, prefixes) {\n" +
        "  const root = {};\n" +
        "  for (const word of dictionary) {\n" +
        "    let node = root;\n" +
        "    for (const ch of word) { node[ch] = node[ch] || {}; node = node[ch]; }\n" +
        "    node.$end = word;\n" +
        "  }\n" +
        "  function collect(node, out) {\n" +
        "    if (node.$end) out.push(node.$end);\n" +
        "    for (const ch in node) { if (ch !== '$end') collect(node[ch], out); }\n" +
        "  }\n" +
        "  return prefixes.map((prefix) => {\n" +
        "    let node = root;\n" +
        "    for (const ch of prefix) { if (!node[ch]) return []; node = node[ch]; }\n" +
        "    const out = [];\n" +
        "    collect(node, out);\n" +
        "    return out.sort();\n" +
        "  });\n" +
        "}",
    },
    {
      approach: "Brute-force scan",
      timeComplexity: "O(queries * dictionarySize * wordLength)",
      spaceComplexity: "O(1) extra",
      explanation: "Re-filter the whole dictionary for every query. No setup cost, but doesn't scale with traffic.",
      code:
        "function autocompleteOperations(dictionary, prefixes) {\n" +
        "  return prefixes.map((prefix) => dictionary.filter((w) => w.startsWith(prefix)).sort());\n" +
        "}",
    },
  ],
};

const invertedIndexSearch: Problem = {
  id: "sysdes-inverted-index",
  title: "Inverted Index Search (Search-as-you-type)",
  difficulty: "Medium",
  description:
    "The structure behind whole-word search (as opposed to autocomplete's prefix search) — the same idea " +
    "search engines and log search tools use under 'Query Optimization'. Given a list of documents and a " +
    "list of single-word queries, return the (ascending-sorted) document indices where each queried word " +
    "appears. Word matching is case-insensitive and punctuation-insensitive.",
  fnName: "buildAndQuery",
  starterCode: "function buildAndQuery(documents, queries) {\n  // your code here\n}",
  testCases: [
    {
      input: [
        ["the quick brown fox", "the lazy dog", "quick dogs run"],
        ["quick", "the", "dog", "cat"],
      ],
      expected: [[0, 2], [0, 1], [1], []],
    },
    { input: [[""], ["anything"]], expected: [[]] },
  ],
  solution:
    "function buildAndQuery(documents, queries) {\n" +
    "  const index = new Map();\n" +
    "  documents.forEach((doc, docIdx) => {\n" +
    "    const words = new Set(doc.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));\n" +
    "    for (const w of words) {\n" +
    "      if (!index.has(w)) index.set(w, new Set());\n" +
    "      index.get(w).add(docIdx);\n" +
    "    }\n" +
    "  });\n" +
    "  return queries.map((q) => {\n" +
    "    const set = index.get(q.toLowerCase());\n" +
    "    return set ? [...set].sort((a, b) => a - b) : [];\n" +
    "  });\n" +
    "}",
  solutions: [
    {
      approach: "Inverted Index (word -> Set of document indices)",
      timeComplexity: "O(D + Q) — D = total words across all documents, Q = number of queries",
      spaceComplexity: "O(D) — one index entry per distinct (word, document) pair",
      explanation:
        "Build the word -> documents map once, up front, in a single pass over every document. After that, " +
        "each query is a single map lookup — the cost of searching never grows with the number of documents " +
        "once the index exists, which is exactly why real search engines build an index instead of grepping " +
        "the corpus per query.",
      code:
        "function buildAndQuery(documents, queries) {\n" +
        "  const index = new Map();\n" +
        "  documents.forEach((doc, docIdx) => {\n" +
        "    const words = new Set(doc.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));\n" +
        "    for (const w of words) {\n" +
        "      if (!index.has(w)) index.set(w, new Set());\n" +
        "      index.get(w).add(docIdx);\n" +
        "    }\n" +
        "  });\n" +
        "  return queries.map((q) => {\n" +
        "    const set = index.get(q.toLowerCase());\n" +
        "    return set ? [...set].sort((a, b) => a - b) : [];\n" +
        "  });\n" +
        "}",
    },
    {
      approach: "Brute-force scan (re-tokenize every document per query)",
      timeComplexity: "O(Q * D) — rescans every document's words for every query",
      spaceComplexity: "O(1) extra",
      explanation:
        "No index, no setup cost — but every query re-tokenizes and re-scans the entire document set from " +
        "scratch. Fine for a handful of one-off searches, falls over as either the corpus or the query volume " +
        "grows.",
      code:
        "function buildAndQuery(documents, queries) {\n" +
        "  return queries.map((q) => {\n" +
        "    const target = q.toLowerCase();\n" +
        "    const matches = [];\n" +
        "    documents.forEach((doc, docIdx) => {\n" +
        "      const words = doc.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);\n" +
        "      if (words.includes(target)) matches.push(docIdx);\n" +
        "    });\n" +
        "    return matches;\n" +
        "  });\n" +
        "}",
    },
  ],
};

const clusterConnectivity: Problem = {
  id: "sysdes-cluster-connectivity",
  title: "Cluster Connectivity (Leader Election / Service Discovery)",
  difficulty: "Medium",
  description:
    "Codes the union/find machinery under 'Leader Election' and 'Service Discovery' — nodes that merge into the " +
    "same group when they discover each other. Given numNodes and a sequence of union(a,b)/connected(a,b) " +
    "operations, return one result per operation: null for union, boolean for connected.",
  fnName: "clusterConnectivityOperations",
  starterCode: "function clusterConnectivityOperations(numNodes, ops, argsList) {\n  // your code here\n}",
  testCases: [
    {
      input: [
        6,
        ["union", "union", "connected", "connected", "union", "connected"],
        [[0, 1], [1, 2], [0, 2], [0, 3], [3, 4], [0, 4]],
      ],
      expected: [null, null, true, false, null, false],
    },
  ],
  solution:
    "function clusterConnectivityOperations(numNodes, ops, argsList) {\n" +
    "  const parent = Array.from({ length: numNodes }, (_, i) => i);\n" +
    "  const rank = new Array(numNodes).fill(0);\n" +
    "  function find(x) { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }\n" +
    "  function union(a, b) {\n" +
    "    const ra = find(a), rb = find(b);\n" +
    "    if (ra === rb) return;\n" +
    "    if (rank[ra] < rank[rb]) parent[ra] = rb;\n" +
    "    else if (rank[ra] > rank[rb]) parent[rb] = ra;\n" +
    "    else { parent[rb] = ra; rank[ra]++; }\n" +
    "  }\n" +
    "  const results = [];\n" +
    "  for (let i = 0; i < ops.length; i++) {\n" +
    "    const [a, b] = argsList[i];\n" +
    "    if (ops[i] === 'union') { union(a, b); results.push(null); }\n" +
    "    else { results.push(find(a) === find(b)); }\n" +
    "  }\n" +
    "  return results;\n" +
    "}",
  solutions: [
    {
      approach: "Union-Find (path compression + union by rank)",
      timeComplexity: "O(α(n)) per operation — effectively constant",
      spaceComplexity: "O(n)",
      explanation:
        "Path compression flattens the tree every time find() is called, and union-by-rank keeps it from growing " +
        "tall in the first place. Together they make near-constant-time cluster membership checks at any scale.",
      code:
        "function clusterConnectivityOperations(numNodes, ops, argsList) {\n" +
        "  const parent = Array.from({ length: numNodes }, (_, i) => i);\n" +
        "  const rank = new Array(numNodes).fill(0);\n" +
        "  function find(x) { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }\n" +
        "  function union(a, b) {\n" +
        "    const ra = find(a), rb = find(b);\n" +
        "    if (ra === rb) return;\n" +
        "    if (rank[ra] < rank[rb]) parent[ra] = rb;\n" +
        "    else if (rank[ra] > rank[rb]) parent[rb] = ra;\n" +
        "    else { parent[rb] = ra; rank[ra]++; }\n" +
        "  }\n" +
        "  const results = [];\n" +
        "  for (let i = 0; i < ops.length; i++) {\n" +
        "    const [a, b] = argsList[i];\n" +
        "    if (ops[i] === 'union') { union(a, b); results.push(null); }\n" +
        "    else { results.push(find(a) === find(b)); }\n" +
        "  }\n" +
        "  return results;\n" +
        "}",
    },
    {
      approach: "Naive adjacency list + BFS",
      timeComplexity: "O(V + E) per connected() query",
      spaceComplexity: "O(V + E)",
      explanation:
        "union() just records an edge (cheap), but connected() has to walk the graph from scratch every time to " +
        "prove two nodes are reachable. Fine for a handful of checks, falls over as the cluster and query volume grow.",
      code:
        "function clusterConnectivityOperations(numNodes, ops, argsList) {\n" +
        "  const adj = Array.from({ length: numNodes }, () => []);\n" +
        "  function connected(a, b) {\n" +
        "    if (a === b) return true;\n" +
        "    const seen = new Set([a]);\n" +
        "    const queue = [a];\n" +
        "    while (queue.length) {\n" +
        "      const cur = queue.shift();\n" +
        "      for (const next of adj[cur]) {\n" +
        "        if (next === b) return true;\n" +
        "        if (!seen.has(next)) { seen.add(next); queue.push(next); }\n" +
        "      }\n" +
        "    }\n" +
        "    return false;\n" +
        "  }\n" +
        "  const results = [];\n" +
        "  for (let i = 0; i < ops.length; i++) {\n" +
        "    const [a, b] = argsList[i];\n" +
        "    if (ops[i] === 'union') { adj[a].push(b); adj[b].push(a); results.push(null); }\n" +
        "    else { results.push(connected(a, b)); }\n" +
        "  }\n" +
        "  return results;\n" +
        "}",
    },
  ],
};

const consistentHashingRing: Problem = {
  id: "sysdes-consistent-hashing",
  title: "Consistent Hashing Ring (Leader Election / Service Discovery)",
  difficulty: "Hard",
  description:
    "The routing scheme behind 'Service Discovery' at scale: instead of a plain key % numNodes (which " +
    "reshuffles almost every key whenever a node joins or leaves), hash both nodes and keys onto the same " +
    "ring and route each key to the first node clockwise from it. Given a sequence of addNode(name)/" +
    "removeNode(name)/route(key) operations, return one result per operation: null for add/remove, the " +
    "owning node's name for route (or null if the ring is empty).\n\n" +
    "ops[i] is \"addNode\", \"removeNode\", or \"route\"; argsList[i] holds that operation's single argument.",
  fnName: "consistentHashingOperations",
  starterCode: "function consistentHashingOperations(ops, argsList) {\n  // your code here\n}",
  testCases: [
    {
      input: [
        ["addNode", "addNode", "addNode", "route", "route", "route", "removeNode", "route"],
        [["node-a"], ["node-b"], ["node-c"], ["user:1"], ["user:2"], ["user:3"], ["node-b"], ["user:2"]],
      ],
      expected: [null, null, null, "node-a", "node-a", "node-a", null, "node-a"],
    },
    { input: [["route"], [["user:1"]]], expected: [null] },
  ],
  solution:
    "function consistentHashingOperations(ops, argsList) {\n" +
    "  const RING_SIZE = 1000;\n" +
    "  function ringHash(str) {\n" +
    "    let h = 0;\n" +
    "    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % RING_SIZE;\n" +
    "    return h;\n" +
    "  }\n" +
    "  function lowerBound(nodes, hash) {\n" +
    "    let lo = 0, hi = nodes.length;\n" +
    "    while (lo < hi) {\n" +
    "      const mid = (lo + hi) >> 1;\n" +
    "      if (nodes[mid].hash < hash) lo = mid + 1; else hi = mid;\n" +
    "    }\n" +
    "    return lo;\n" +
    "  }\n" +
    "  let nodes = [];\n" +
    "  const results = [];\n" +
    "  for (let i = 0; i < ops.length; i++) {\n" +
    "    const op = ops[i], args = argsList[i];\n" +
    "    if (op === 'addNode') {\n" +
    "      const [name] = args;\n" +
    "      const hash = ringHash(name);\n" +
    "      nodes.splice(lowerBound(nodes, hash), 0, { hash, name });\n" +
    "      results.push(null);\n" +
    "    } else if (op === 'removeNode') {\n" +
    "      const [name] = args;\n" +
    "      nodes = nodes.filter((n) => n.name !== name);\n" +
    "      results.push(null);\n" +
    "    } else {\n" +
    "      const [key] = args;\n" +
    "      if (nodes.length === 0) { results.push(null); continue; }\n" +
    "      const pos = lowerBound(nodes, ringHash(key));\n" +
    "      results.push((pos < nodes.length ? nodes[pos] : nodes[0]).name);\n" +
    "    }\n" +
    "  }\n" +
    "  return results;\n" +
    "}",
  solutions: [
    {
      approach: "Sorted ring + binary search",
      timeComplexity: "O(log n) per route lookup, O(n) per add/remove (array splice)",
      spaceComplexity: "O(n) — n = number of nodes",
      explanation:
        "Keep nodes sorted by their ring position so route() can binary-search for the first node clockwise " +
        "of a key instead of scanning. route() is by far the most frequent operation in a real deployment " +
        "(nodes join/leave rarely, keys route constantly), so this is the operation worth optimizing.",
      code:
        "function consistentHashingOperations(ops, argsList) {\n" +
        "  const RING_SIZE = 1000;\n" +
        "  function ringHash(str) {\n" +
        "    let h = 0;\n" +
        "    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % RING_SIZE;\n" +
        "    return h;\n" +
        "  }\n" +
        "  function lowerBound(nodes, hash) {\n" +
        "    let lo = 0, hi = nodes.length;\n" +
        "    while (lo < hi) {\n" +
        "      const mid = (lo + hi) >> 1;\n" +
        "      if (nodes[mid].hash < hash) lo = mid + 1; else hi = mid;\n" +
        "    }\n" +
        "    return lo;\n" +
        "  }\n" +
        "  let nodes = [];\n" +
        "  const results = [];\n" +
        "  for (let i = 0; i < ops.length; i++) {\n" +
        "    const op = ops[i], args = argsList[i];\n" +
        "    if (op === 'addNode') {\n" +
        "      const [name] = args;\n" +
        "      const hash = ringHash(name);\n" +
        "      nodes.splice(lowerBound(nodes, hash), 0, { hash, name });\n" +
        "      results.push(null);\n" +
        "    } else if (op === 'removeNode') {\n" +
        "      const [name] = args;\n" +
        "      nodes = nodes.filter((n) => n.name !== name);\n" +
        "      results.push(null);\n" +
        "    } else {\n" +
        "      const [key] = args;\n" +
        "      if (nodes.length === 0) { results.push(null); continue; }\n" +
        "      const pos = lowerBound(nodes, ringHash(key));\n" +
        "      results.push((pos < nodes.length ? nodes[pos] : nodes[0]).name);\n" +
        "    }\n" +
        "  }\n" +
        "  return results;\n" +
        "}",
    },
    {
      approach: "Unsorted array, linear scan every operation",
      timeComplexity: "O(n) per operation, including route",
      spaceComplexity: "O(n)",
      explanation:
        "Skip maintaining sorted order — just append on addNode, filter on removeNode, and walk the full node " +
        "list on every route() to find the closest clockwise hash. Simpler to write, but route() degrades " +
        "linearly with cluster size instead of logarithmically.",
      code:
        "function consistentHashingOperations(ops, argsList) {\n" +
        "  const RING_SIZE = 1000;\n" +
        "  function ringHash(str) {\n" +
        "    let h = 0;\n" +
        "    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % RING_SIZE;\n" +
        "    return h;\n" +
        "  }\n" +
        "  let nodes = [];\n" +
        "  const results = [];\n" +
        "  for (let i = 0; i < ops.length; i++) {\n" +
        "    const op = ops[i], args = argsList[i];\n" +
        "    if (op === 'addNode') {\n" +
        "      const [name] = args;\n" +
        "      nodes.push({ hash: ringHash(name), name });\n" +
        "      results.push(null);\n" +
        "    } else if (op === 'removeNode') {\n" +
        "      const [name] = args;\n" +
        "      nodes = nodes.filter((n) => n.name !== name);\n" +
        "      results.push(null);\n" +
        "    } else {\n" +
        "      const [key] = args;\n" +
        "      if (nodes.length === 0) { results.push(null); continue; }\n" +
        "      const hash = ringHash(key);\n" +
        "      let owner = null;\n" +
        "      for (const n of nodes) { if (n.hash >= hash && (!owner || n.hash < owner.hash)) owner = n; }\n" +
        "      if (!owner) { for (const n of nodes) { if (!owner || n.hash < owner.hash) owner = n; } }\n" +
        "      results.push(owner.name);\n" +
        "    }\n" +
        "  }\n" +
        "  return results;\n" +
        "}",
    },
  ],
};

const bloomFilter: Problem = {
  id: "sysdes-bloom-filter",
  title: "Bloom Filter Membership (Data Operations)",
  difficulty: "Medium",
  description:
    "A probabilistic sibling of 'Database Indexing' for existence checks: given items to insert and items to " +
    "query, return whether each queried item 'might exist' (true) or 'definitely does not exist' (false). " +
    "False positives are an accepted tradeoff for a probabilistic structure; false negatives are never allowed.",
  fnName: "bloomFilterOperations",
  starterCode: "function bloomFilterOperations(insertItems, queryItems) {\n  // your code here\n}",
  testCases: [{ input: [["apple", "banana"], ["apple", "cherry"]], expected: [true, false] }],
  solution:
    "function bloomFilterOperations(insertItems, queryItems) {\n" +
    "  const set = new Set(insertItems);\n" +
    "  return queryItems.map((q) => set.has(q));\n" +
    "}",
  solutions: [
    {
      approach: "Exact HashSet",
      timeComplexity: "O(1) per operation",
      spaceComplexity: "O(n) — one full entry per inserted item",
      explanation:
        "Perfectly accurate and just as fast as a bloom filter for a single lookup, but it has to store every " +
        "item in full. Fine until n gets large enough that memory is the actual constraint.",
      code:
        "function bloomFilterOperations(insertItems, queryItems) {\n" +
        "  const set = new Set(insertItems);\n" +
        "  return queryItems.map((q) => set.has(q));\n" +
        "}",
    },
    {
      approach: "Bloom Filter (2 hash functions, fixed-size bit array)",
      timeComplexity: "O(k) per operation, k = number of hash functions",
      spaceComplexity: "O(bits) — fixed, independent of item size or count",
      explanation:
        "Hash each item k ways into a shared bit array and set those bits. A query only returns true if ALL k of " +
        "its bits are set. Uses a fraction of the memory of a real set at the cost of possible false positives " +
        "(never false negatives) — exactly the tradeoff CDNs and databases make to avoid checking disk/network " +
        "for a key that almost certainly doesn't exist.",
      code:
        "function bloomFilterOperations(insertItems, queryItems) {\n" +
        "  const size = 64;\n" +
        "  const bits = new Array(size).fill(false);\n" +
        "  function hash1(str) { let h = 0; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return h % size; }\n" +
        "  function hash2(str) { let h = 0; for (let i = 0; i < str.length; i++) h = (h * 37 + str.charCodeAt(i) * 7) >>> 0; return h % size; }\n" +
        "  for (const item of insertItems) { bits[hash1(item)] = true; bits[hash2(item)] = true; }\n" +
        "  return queryItems.map((q) => bits[hash1(q)] && bits[hash2(q)]);\n" +
        "}",
    },
  ],
};

const countMinSketch: Problem = {
  id: "sysdes-count-min-sketch",
  title: "Count-Min Sketch (Data Operations)",
  difficulty: "Medium",
  description:
    "A probabilistic sibling of Bloom Filter, but for counts instead of membership: given a fixed table " +
    "width/depth and a sequence of add(item)/estimate(item) operations, return one result per operation: " +
    "null for add, the estimated count for estimate. Estimates can only ever be an OVER-count (hash " +
    "collisions inflate a count, they never lose one) — the same tradeoff a CDN or rate limiter makes to " +
    "track approximate per-key traffic without a per-key counter.",
  fnName: "countMinSketchOperations",
  starterCode: "function countMinSketchOperations(width, depth, ops, argsList) {\n  // your code here\n}",
  testCases: [
    {
      input: [
        16,
        3,
        ["add", "add", "add", "estimate", "estimate", "estimate"],
        [["a"], ["a"], ["b"], ["a"], ["b"], ["c"]],
      ],
      expected: [null, null, null, 2, 1, 0],
    },
  ],
  solution:
    "function countMinSketchOperations(width, depth, ops, argsList) {\n" +
    "  const table = Array.from({ length: depth }, () => new Array(width).fill(0));\n" +
    "  const seeds = Array.from({ length: depth }, (_, i) => 31 + i * 2);\n" +
    "  function hashRow(item, row) {\n" +
    "    let h = 0;\n" +
    "    for (let i = 0; i < item.length; i++) h = (h * seeds[row] + item.charCodeAt(i)) % width;\n" +
    "    return ((h % width) + width) % width;\n" +
    "  }\n" +
    "  const results = [];\n" +
    "  for (let i = 0; i < ops.length; i++) {\n" +
    "    const op = ops[i], [item] = argsList[i];\n" +
    "    if (op === 'add') {\n" +
    "      for (let row = 0; row < depth; row++) table[row][hashRow(item, row)]++;\n" +
    "      results.push(null);\n" +
    "    } else {\n" +
    "      let est = Infinity;\n" +
    "      for (let row = 0; row < depth; row++) est = Math.min(est, table[row][hashRow(item, row)]);\n" +
    "      results.push(est);\n" +
    "    }\n" +
    "  }\n" +
    "  return results;\n" +
    "}",
  solutions: [
    {
      approach: "Count-Min Sketch (fixed-size table, k independent hashes)",
      timeComplexity: "O(depth) per operation — depth is a small fixed constant, independent of cardinality",
      spaceComplexity: "O(width * depth) — fixed, no matter how many distinct items are ever seen",
      explanation:
        "Every item is hashed depth independent ways into a shared width-wide counter table; add() increments " +
        "all depth cells, estimate() reads the minimum across them (the row least corrupted by collisions). " +
        "Memory never grows with the number of distinct items — the entire point when tracking cardinalities " +
        "too large to give every key its own counter.",
      code:
        "function countMinSketchOperations(width, depth, ops, argsList) {\n" +
        "  const table = Array.from({ length: depth }, () => new Array(width).fill(0));\n" +
        "  const seeds = Array.from({ length: depth }, (_, i) => 31 + i * 2);\n" +
        "  function hashRow(item, row) {\n" +
        "    let h = 0;\n" +
        "    for (let i = 0; i < item.length; i++) h = (h * seeds[row] + item.charCodeAt(i)) % width;\n" +
        "    return ((h % width) + width) % width;\n" +
        "  }\n" +
        "  const results = [];\n" +
        "  for (let i = 0; i < ops.length; i++) {\n" +
        "    const op = ops[i], [item] = argsList[i];\n" +
        "    if (op === 'add') {\n" +
        "      for (let row = 0; row < depth; row++) table[row][hashRow(item, row)]++;\n" +
        "      results.push(null);\n" +
        "    } else {\n" +
        "      let est = Infinity;\n" +
        "      for (let row = 0; row < depth; row++) est = Math.min(est, table[row][hashRow(item, row)]);\n" +
        "      results.push(est);\n" +
        "    }\n" +
        "  }\n" +
        "  return results;\n" +
        "}",
    },
    {
      approach: "Raw event log (exact counting, unbounded memory)",
      timeComplexity: "O(1) per add, O(n) per estimate — n = number of adds so far",
      spaceComplexity: "O(n) — stores every raw event, grows forever",
      explanation:
        "Just append every add()'d item to a list and count matching entries on estimate() by scanning the " +
        "whole log. Always exact, never over-counts — but memory is unbounded and estimate() gets slower the " +
        "longer the stream runs, which is exactly what the sketch exists to avoid.",
      code:
        "function countMinSketchOperations(width, depth, ops, argsList) {\n" +
        "  const events = [];\n" +
        "  const results = [];\n" +
        "  for (let i = 0; i < ops.length; i++) {\n" +
        "    const op = ops[i], [item] = argsList[i];\n" +
        "    if (op === 'add') {\n" +
        "      events.push(item);\n" +
        "      results.push(null);\n" +
        "    } else {\n" +
        "      let count = 0;\n" +
        "      for (const e of events) { if (e === item) count++; }\n" +
        "      results.push(count);\n" +
        "    }\n" +
        "  }\n" +
        "  return results;\n" +
        "}",
    },
  ],
};

const topKFrequent: Problem = {
  id: "sysdes-top-k-frequent",
  title: "Top-K Frequent Items (Observability / Performance Metrics)",
  difficulty: "Medium",
  description:
    "The 'what are my most-hit endpoints' query behind any metrics dashboard: given a stream of items and a " +
    "count k, return the k most frequent items.",
  fnName: "topKFrequentItems",
  starterCode: "function topKFrequentItems(items, k) {\n  // your code here\n}",
  testCases: [
    { input: [["a", "a", "a", "a", "b", "b", "b", "c", "c", "d"], 2], expected: ["a", "b"] },
    { input: [["a", "a", "a", "a", "b", "b", "b", "c", "c", "d"], 3], expected: ["a", "b", "c"] },
  ],
  normalize: (v) => (Array.isArray(v) ? [...v].sort() : v),
  solution:
    "function topKFrequentItems(items, k) {\n" +
    "  const freq = new Map();\n" +
    "  for (const it of items) freq.set(it, (freq.get(it) || 0) + 1);\n" +
    "  const buckets = Array.from({ length: items.length + 1 }, () => []);\n" +
    "  for (const [item, count] of freq) buckets[count].push(item);\n" +
    "  const result = [];\n" +
    "  for (let count = buckets.length - 1; count >= 0 && result.length < k; count--) {\n" +
    "    for (const item of buckets[count]) { if (result.length < k) result.push(item); }\n" +
    "  }\n" +
    "  return result;\n" +
    "}",
  solutions: [
    {
      approach: "Bucket Sort by frequency",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      explanation:
        "Frequency can never exceed n, so bucket items by their count (index = count) and read buckets off from " +
        "the top. Linear — no comparison sort needed at all.",
      code:
        "function topKFrequentItems(items, k) {\n" +
        "  const freq = new Map();\n" +
        "  for (const it of items) freq.set(it, (freq.get(it) || 0) + 1);\n" +
        "  const buckets = Array.from({ length: items.length + 1 }, () => []);\n" +
        "  for (const [item, count] of freq) buckets[count].push(item);\n" +
        "  const result = [];\n" +
        "  for (let count = buckets.length - 1; count >= 0 && result.length < k; count--) {\n" +
        "    for (const item of buckets[count]) { if (result.length < k) result.push(item); }\n" +
        "  }\n" +
        "  return result;\n" +
        "}",
    },
    {
      approach: "Min-Heap of size k",
      timeComplexity: "O(n log k)",
      spaceComplexity: "O(n + k)",
      explanation:
        "Push every (item, count) pair through a size-capped min-heap, popping the smallest whenever it exceeds " +
        "k. Never sorts the full frequency table — useful when k is small relative to the number of distinct items.",
      code:
        "function topKFrequentItems(items, k) {\n" +
        "  const freq = new Map();\n" +
        "  for (const it of items) freq.set(it, (freq.get(it) || 0) + 1);\n" +
        "  const entries = [...freq.entries()];\n" +
        "  const heap = [];\n" +
        "  function push(entry) {\n" +
        "    heap.push(entry);\n" +
        "    let i = heap.length - 1;\n" +
        "    while (i > 0) { const p = (i - 1) >> 1; if (heap[p][1] <= heap[i][1]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; }\n" +
        "  }\n" +
        "  function pop() {\n" +
        "    const top = heap[0], last = heap.pop();\n" +
        "    if (heap.length) { heap[0] = last; let i = 0;\n" +
        "      while (true) { let s = i, l = 2*i+1, r = 2*i+2;\n" +
        "        if (l < heap.length && heap[l][1] < heap[s][1]) s = l;\n" +
        "        if (r < heap.length && heap[r][1] < heap[s][1]) s = r;\n" +
        "        if (s === i) break; [heap[s], heap[i]] = [heap[i], heap[s]]; i = s; }\n" +
        "    }\n" +
        "    return top;\n" +
        "  }\n" +
        "  for (const entry of entries) { push(entry); if (heap.length > k) pop(); }\n" +
        "  return heap.map(([item]) => item);\n" +
        "}",
    },
    {
      approach: "Full sort by frequency",
      timeComplexity: "O(n log n)",
      spaceComplexity: "O(n)",
      explanation: "Sort every distinct item by count descending, take the first k. Simplest to write, but does more work than the answer needs.",
      code:
        "function topKFrequentItems(items, k) {\n" +
        "  const freq = new Map();\n" +
        "  for (const it of items) freq.set(it, (freq.get(it) || 0) + 1);\n" +
        "  return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, k).map(([item]) => item);\n" +
        "}",
    },
  ],
};

const slidingWindowAggregator: Problem = {
  id: "sysdes-sliding-window-aggregator",
  title: "Sliding Window Metrics Aggregator (Observability / Performance Metrics)",
  difficulty: "Medium",
  description:
    "The 'what's my request rate over the last N seconds' query behind any live dashboard: given a list of " +
    "[timestamp, value] events sorted by ascending timestamp, a window size, and a list of ascending-sorted " +
    "query timestamps, return the sum of event values with timestamp in (q - windowSize, q] for each query q.",
  fnName: "slidingWindowAggregator",
  starterCode: "function slidingWindowAggregator(events, windowSize, queries) {\n  // your code here\n}",
  testCases: [
    {
      input: [[[1, 5], [2, 3], [4, 2], [5, 10], [9, 1]], 5, [2, 5, 9, 10]],
      expected: [8, 20, 11, 1],
    },
    {
      input: [[[0, 1], [1, 1], [2, 1]], 1, [0, 1, 2, 3]],
      expected: [1, 1, 1, 0],
    },
  ],
  solution:
    "function slidingWindowAggregator(events, windowSize, queries) {\n" +
    "  let left = 0, right = 0, sum = 0;\n" +
    "  const results = [];\n" +
    "  for (const q of queries) {\n" +
    "    while (right < events.length && events[right][0] <= q) { sum += events[right][1]; right++; }\n" +
    "    while (left < right && events[left][0] <= q - windowSize) { sum -= events[left][1]; left++; }\n" +
    "    results.push(sum);\n" +
    "  }\n" +
    "  return results;\n" +
    "}",
  solutions: [
    {
      approach: "Two-pointer sliding window",
      timeComplexity: "O(events + queries) total — each pointer only ever moves forward",
      spaceComplexity: "O(1) extra",
      explanation:
        "Since both events and queries are sorted ascending, a right pointer admits events up to the current " +
        "query time and a left pointer evicts events that fell out of the window — neither pointer ever moves " +
        "backward, so the whole pass across every query is linear, not quadratic. This is the streaming/" +
        "windowed-aggregation trick behind live dashboards that can't afford to rescan history per query.",
      code:
        "function slidingWindowAggregator(events, windowSize, queries) {\n" +
        "  let left = 0, right = 0, sum = 0;\n" +
        "  const results = [];\n" +
        "  for (const q of queries) {\n" +
        "    while (right < events.length && events[right][0] <= q) { sum += events[right][1]; right++; }\n" +
        "    while (left < right && events[left][0] <= q - windowSize) { sum -= events[left][1]; left++; }\n" +
        "    results.push(sum);\n" +
        "  }\n" +
        "  return results;\n" +
        "}",
    },
    {
      approach: "Brute-force rescan per query",
      timeComplexity: "O(events * queries) — rescans every event for every query",
      spaceComplexity: "O(1) extra",
      explanation:
        "For each query, walk the entire event list and sum whatever falls in the window. Doesn't require " +
        "queries to be sorted, but redoes the full scan from scratch every time — fine for a one-off report, " +
        "not for a dashboard refreshing every second.",
      code:
        "function slidingWindowAggregator(events, windowSize, queries) {\n" +
        "  return queries.map((q) => {\n" +
        "    let sum = 0;\n" +
        "    for (const [t, v] of events) { if (t > q - windowSize && t <= q) sum += v; }\n" +
        "    return sum;\n" +
        "  });\n" +
        "}",
    },
  ],
};

const systemDesign: Pattern = {
  id: "system-design",
  name: "System Design Building Blocks",
  subpatterns: [
    {
      id: "sysdes-caching",
      name: "Caching & Eviction",
      explanation:
        "Bounded-size stores that must decide what to evict when full. See the 'Caching' term in the " +
        "System Design glossary (#/concepts).",
      problems: [lruCache, lfuCache],
    },
    {
      id: "sysdes-traffic-control",
      name: "Traffic Control",
      explanation:
        "Deciding whether a request should even be allowed to proceed. See 'Rate Limiting' and 'Idempotency' " +
        "in the glossary.",
      problems: [rateLimiter, idempotencyStore],
    },
    {
      id: "sysdes-search",
      name: "Search & Indexing",
      explanation: "Structures purpose-built for fast prefix/substring lookups over large text.",
      problems: [trieAutocomplete, invertedIndexSearch],
    },
    {
      id: "sysdes-distributed-coordination",
      name: "Distributed Coordination",
      explanation:
        "How independent nodes agree on group membership. See 'Leader Election' and 'Service Discovery' in " +
        "the glossary.",
      problems: [clusterConnectivity, consistentHashingRing],
    },
    {
      id: "sysdes-probabilistic",
      name: "Probabilistic Structures",
      explanation: "Trading a small, bounded error rate for a large reduction in memory or time.",
      problems: [bloomFilter, countMinSketch],
    },
    {
      id: "sysdes-observability",
      name: "Observability & Metrics",
      explanation: "Turning raw event streams into the aggregates a dashboard actually shows.",
      problems: [topKFrequent, slidingWindowAggregator],
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

// ─── Full 17-pattern curriculum ───────────────────────────────────────────

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
  systemDesign,
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
