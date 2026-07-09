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

const maxSubArraySum: Problem = {
  id: "arr-max-subarray-sum",
  title: "Maximum Subarray Sum (Kadane's Algorithm)",
  difficulty: "Medium",
  description:
    "Given an integer array nums, find the contiguous subarray (containing at least one number) which has " +
    "the largest sum, and return that sum.",
  fnName: "maxSubArraySum",
  starterCode: "function maxSubArraySum(nums) {\n  // your code here\n}",
  testCases: [
    { input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
    { input: [[5, 4, -1, 7, 8]], expected: 23 },
    { input: [[-1]], expected: -1 },
    { input: [[-2, -1]], expected: -1 },
    { input: [[1, 2, 3, 4]], expected: 10 },
  ],
  solution:
    "function maxSubArraySum(nums) {\n" +
    "  let best = nums[0], cur = nums[0];\n" +
    "  for (let i = 1; i < nums.length; i++) {\n" +
    "    cur = Math.max(nums[i], cur + nums[i]);\n" +
    "    best = Math.max(best, cur);\n" +
    "  }\n" +
    "  return best;\n" +
    "}",
  solutions: [
    {
      approach: "Kadane's Algorithm",
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      explanation:
        "At each index, decide whether extending the previous subarray is still worth it or whether starting " +
        "fresh at the current element beats it — track the running best either way. One pass, constant extra state.",
      code:
        "function maxSubArraySum(nums) {\n" +
        "  let best = nums[0], cur = nums[0];\n" +
        "  for (let i = 1; i < nums.length; i++) {\n" +
        "    cur = Math.max(nums[i], cur + nums[i]);\n" +
        "    best = Math.max(best, cur);\n" +
        "  }\n" +
        "  return best;\n" +
        "}",
    },
    {
      approach: "Brute force — all subarrays",
      timeComplexity: "O(n^2)",
      spaceComplexity: "O(1)",
      explanation:
        "Fix every start index and extend the end index one step at a time, tracking the running sum and the " +
        "best seen. Correct and simple, but redoes work Kadane's avoids by never reusing a previous partial sum.",
      code:
        "function maxSubArraySum(nums) {\n" +
        "  let best = -Infinity;\n" +
        "  for (let i = 0; i < nums.length; i++) {\n" +
        "    let sum = 0;\n" +
        "    for (let j = i; j < nums.length; j++) {\n" +
        "      sum += nums[j];\n" +
        "      best = Math.max(best, sum);\n" +
        "    }\n" +
        "  }\n" +
        "  return best;\n" +
        "}",
    },
  ],
};

const classicBinarySearch: Problem = {
  id: "arr-classic-binary-search",
  title: "Binary Search",
  difficulty: "Easy",
  description:
    "Given a sorted array of distinct integers nums and a target value, return the index of target in nums, " +
    "or -1 if it is not present.",
  fnName: "binarySearch",
  starterCode: "function binarySearch(nums, target) {\n  // your code here\n}",
  testCases: [
    { input: [[-1, 0, 3, 5, 9, 12], 9], expected: 4 },
    { input: [[-1, 0, 3, 5, 9, 12], 2], expected: -1 },
    { input: [[5], 5], expected: 0 },
    { input: [[], 3], expected: -1 },
    { input: [[1, 3, 5, 7, 9, 11], 1], expected: 0 },
  ],
  solution:
    "function binarySearch(nums, target) {\n" +
    "  let lo = 0, hi = nums.length - 1;\n" +
    "  while (lo <= hi) {\n" +
    "    const mid = (lo + hi) >> 1;\n" +
    "    if (nums[mid] === target) return mid;\n" +
    "    if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;\n" +
    "  }\n" +
    "  return -1;\n" +
    "}",
  solutions: [
    {
      approach: "Binary Search",
      timeComplexity: "O(log n)",
      spaceComplexity: "O(1)",
      explanation:
        "Repeatedly compare the midpoint to the target and discard the half of the search space that can't " +
        "contain it. Works because the array is sorted — every comparison halves the remaining candidates.",
      code:
        "function binarySearch(nums, target) {\n" +
        "  let lo = 0, hi = nums.length - 1;\n" +
        "  while (lo <= hi) {\n" +
        "    const mid = (lo + hi) >> 1;\n" +
        "    if (nums[mid] === target) return mid;\n" +
        "    if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;\n" +
        "  }\n" +
        "  return -1;\n" +
        "}",
    },
    {
      approach: "Linear Scan",
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      explanation:
        "Check every element left to right until the target is found. Correct for any array, sorted or not — " +
        "but ignores the sortedness that binary search exploits to skip most of the array.",
      code:
        "function binarySearch(nums, target) {\n" +
        "  for (let i = 0; i < nums.length; i++) {\n" +
        "    if (nums[i] === target) return i;\n" +
        "  }\n" +
        "  return -1;\n" +
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
      problems: [maxSubArraySum],
    },
    {
      id: "arr-binary-search",
      name: "Binary Search",
      explanation:
        "Repeatedly halve a sorted search space by comparing the midpoint to the target, discarding the half " +
        "that can't contain the answer.",
      problems: [classicBinarySearch],
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

const isSubsequence: Problem = {
  id: "str-is-subsequence",
  title: "Is Subsequence",
  difficulty: "Easy",
  description:
    "Given two strings s and t, return true if s is a subsequence of t (i.e. s can be formed by deleting some " +
    "characters from t, without changing the order of the remaining characters), or false otherwise.",
  fnName: "isSubsequence",
  starterCode: "function isSubsequence(s, t) {\n  // your code here\n}",
  testCases: [
    { input: ["abc", "ahbgdc"], expected: true },
    { input: ["axc", "ahbgdc"], expected: false },
    { input: ["", "ahbgdc"], expected: true },
    { input: ["abc", "abc"], expected: true },
    { input: ["abc", "ab"], expected: false },
  ],
  solution:
    "function isSubsequence(s, t) {\n" +
    "  let i = 0;\n" +
    "  for (let j = 0; j < t.length && i < s.length; j++) {\n" +
    "    if (s[i] === t[j]) i++;\n" +
    "  }\n" +
    "  return i === s.length;\n" +
    "}",
  solutions: [
    {
      approach: "Two Pointers",
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      explanation:
        "Walk t with one pointer, only advancing the pointer into s when the current characters match. If the " +
        "s-pointer reaches the end, every character of s was found in order somewhere in t.",
      code:
        "function isSubsequence(s, t) {\n" +
        "  let i = 0;\n" +
        "  for (let j = 0; j < t.length && i < s.length; j++) {\n" +
        "    if (s[i] === t[j]) i++;\n" +
        "  }\n" +
        "  return i === s.length;\n" +
        "}",
    },
    {
      approach: "Recursive match-or-skip",
      timeComplexity: "O(2^m) worst case (m = t.length) — branches at every matching character",
      spaceComplexity: "O(m) recursion depth",
      explanation:
        "At each position, either consume a matching character or skip ahead in t, trying both when they match. " +
        "Explores redundant branches the two-pointer scan sidesteps by always taking a match greedily.",
      code:
        "function isSubsequence(s, t) {\n" +
        "  function helper(i, j) {\n" +
        "    if (i === s.length) return true;\n" +
        "    if (j === t.length) return false;\n" +
        "    if (s[i] === t[j] && helper(i + 1, j + 1)) return true;\n" +
        "    return helper(i, j + 1);\n" +
        "  }\n" +
        "  return helper(0, 0);\n" +
        "}",
    },
  ],
};

const strStrProblem: Problem = {
  id: "str-needle-in-haystack",
  title: "Find the Index of the First Occurrence in a String",
  difficulty: "Medium",
  description:
    "Given two strings haystack and needle, return the index of the first occurrence of needle in haystack, " +
    "or -1 if needle is not part of haystack.",
  fnName: "strStr",
  starterCode: "function strStr(haystack, needle) {\n  // your code here\n}",
  testCases: [
    { input: ["sadbutsad", "sad"], expected: 0 },
    { input: ["leetcode", "leeto"], expected: -1 },
    { input: ["hello", ""], expected: 0 },
    { input: ["aaaaa", "bba"], expected: -1 },
    { input: ["mississippi", "issip"], expected: 4 },
  ],
  solution:
    "function strStr(haystack, needle) {\n" +
    "  const n = haystack.length, m = needle.length;\n" +
    "  if (m === 0) return 0;\n" +
    "  const lps = new Array(m).fill(0);\n" +
    "  let len = 0, i = 1;\n" +
    "  while (i < m) {\n" +
    "    if (needle[i] === needle[len]) { len++; lps[i] = len; i++; }\n" +
    "    else if (len !== 0) { len = lps[len - 1]; }\n" +
    "    else { lps[i] = 0; i++; }\n" +
    "  }\n" +
    "  let hi = 0, ni = 0;\n" +
    "  while (hi < n) {\n" +
    "    if (haystack[hi] === needle[ni]) { hi++; ni++; if (ni === m) return hi - ni; }\n" +
    "    else if (ni !== 0) { ni = lps[ni - 1]; }\n" +
    "    else { hi++; }\n" +
    "  }\n" +
    "  return -1;\n" +
    "}",
  solutions: [
    {
      approach: "KMP (failure function)",
      timeComplexity: "O(n + m)",
      spaceComplexity: "O(m)",
      explanation:
        "Precompute, for every prefix of needle, the length of the longest proper prefix that's also a suffix " +
        "(the 'lps' table). On a mismatch, that table tells the pattern pointer exactly how far to fall back " +
        "without ever re-reading a haystack character — linear total work regardless of how repetitive the " +
        "pattern is.",
      code:
        "function strStr(haystack, needle) {\n" +
        "  const n = haystack.length, m = needle.length;\n" +
        "  if (m === 0) return 0;\n" +
        "  const lps = new Array(m).fill(0);\n" +
        "  let len = 0, i = 1;\n" +
        "  while (i < m) {\n" +
        "    if (needle[i] === needle[len]) { len++; lps[i] = len; i++; }\n" +
        "    else if (len !== 0) { len = lps[len - 1]; }\n" +
        "    else { lps[i] = 0; i++; }\n" +
        "  }\n" +
        "  let hi = 0, ni = 0;\n" +
        "  while (hi < n) {\n" +
        "    if (haystack[hi] === needle[ni]) { hi++; ni++; if (ni === m) return hi - ni; }\n" +
        "    else if (ni !== 0) { ni = lps[ni - 1]; }\n" +
        "    else { hi++; }\n" +
        "  }\n" +
        "  return -1;\n" +
        "}",
    },
    {
      approach: "Brute force sliding compare",
      timeComplexity: "O(n * m)",
      spaceComplexity: "O(1)",
      explanation:
        "Try every start position in haystack and compare character-by-character against needle. Simple, but a " +
        "mismatch discards no information — the next attempt restarts the pattern from scratch, which is what " +
        "KMP's failure function exists to avoid.",
      code:
        "function strStr(haystack, needle) {\n" +
        "  const n = haystack.length, m = needle.length;\n" +
        "  if (m === 0) return 0;\n" +
        "  for (let i = 0; i + m <= n; i++) {\n" +
        "    let j = 0;\n" +
        "    while (j < m && haystack[i + j] === needle[j]) j++;\n" +
        "    if (j === m) return i;\n" +
        "  }\n" +
        "  return -1;\n" +
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
      problems: [isSubsequence],
    },
    {
      id: "str-pattern-matching",
      name: "Pattern Matching / KMP",
      explanation:
        "Find occurrences of a pattern inside text in O(n+m) by precomputing a failure function that avoids " +
        "re-scanning already-matched characters after a mismatch.",
      problems: [strStrProblem],
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

const designHashMapProblem: Problem = {
  id: "hash-design-hashmap",
  title: "Design HashMap",
  difficulty: "Easy",
  description:
    "Design a HashMap without using any built-in hash table library, exercised via a sequence of operations. " +
    "ops[i] is one of \"put\", \"get\", \"remove\"; argsList[i] holds that operation's arguments. put/remove " +
    "return null; get returns the value, or -1 if the key is absent.",
  fnName: "hashMapOperations",
  starterCode: "function hashMapOperations(ops, argsList) {\n  // your code here\n}",
  testCases: [
    {
      input: [
        ["put", "put", "get", "get", "put", "get", "remove", "get"],
        [[1, 1], [2, 2], [1], [3], [2, 1], [2], [2], [2]],
      ],
      expected: [null, null, 1, -1, null, 1, null, -1],
    },
    {
      input: [["get", "put", "get"], [["a"], ["a", 5], ["a"]]],
      expected: [-1, null, 5],
    },
  ],
  solution:
    "function hashMapOperations(ops, argsList) {\n" +
    "  const map = new Map();\n" +
    "  const out = [];\n" +
    "  for (let i = 0; i < ops.length; i++) {\n" +
    "    const op = ops[i], a = argsList[i];\n" +
    "    if (op === 'put') { map.set(a[0], a[1]); out.push(null); }\n" +
    "    else if (op === 'get') { out.push(map.has(a[0]) ? map.get(a[0]) : -1); }\n" +
    "    else { map.delete(a[0]); out.push(null); }\n" +
    "  }\n" +
    "  return out;\n" +
    "}",
  solutions: [
    {
      approach: "Native Hash Map",
      timeComplexity: "O(1) average per operation",
      spaceComplexity: "O(n)",
      explanation:
        "A real hash table hashes the key to a bucket, giving average constant-time put/get/remove regardless " +
        "of how many keys are stored.",
      code:
        "function hashMapOperations(ops, argsList) {\n" +
        "  const map = new Map();\n" +
        "  const out = [];\n" +
        "  for (let i = 0; i < ops.length; i++) {\n" +
        "    const op = ops[i], a = argsList[i];\n" +
        "    if (op === 'put') { map.set(a[0], a[1]); out.push(null); }\n" +
        "    else if (op === 'get') { out.push(map.has(a[0]) ? map.get(a[0]) : -1); }\n" +
        "    else { map.delete(a[0]); out.push(null); }\n" +
        "  }\n" +
        "  return out;\n" +
        "}",
    },
    {
      approach: "Array of [key, value] pairs",
      timeComplexity: "O(n) per operation",
      spaceComplexity: "O(n)",
      explanation:
        "Store entries as a flat list and linearly scan for the key on every operation. Illustrates exactly the " +
        "cost a hash table's bucketing avoids — every put/get/remove rescans everything stored so far.",
      code:
        "function hashMapOperations(ops, argsList) {\n" +
        "  const store = [];\n" +
        "  const out = [];\n" +
        "  for (let i = 0; i < ops.length; i++) {\n" +
        "    const op = ops[i], a = argsList[i];\n" +
        "    const idx = store.findIndex((p) => p[0] === a[0]);\n" +
        "    if (op === 'put') {\n" +
        "      if (idx >= 0) store[idx][1] = a[1]; else store.push([a[0], a[1]]);\n" +
        "      out.push(null);\n" +
        "    } else if (op === 'get') {\n" +
        "      out.push(idx >= 0 ? store[idx][1] : -1);\n" +
        "    } else {\n" +
        "      if (idx >= 0) store.splice(idx, 1);\n" +
        "      out.push(null);\n" +
        "    }\n" +
        "  }\n" +
        "  return out;\n" +
        "}",
    },
  ],
};

const firstUniqCharProblem: Problem = {
  id: "hash-first-unique-char",
  title: "First Unique Character in a String",
  difficulty: "Easy",
  description: "Given a string s, return the index of the first non-repeating character, or -1 if none exists.",
  fnName: "firstUniqChar",
  starterCode: "function firstUniqChar(s) {\n  // your code here\n}",
  testCases: [
    { input: ["leetcode"], expected: 0 },
    { input: ["loveleetcode"], expected: 2 },
    { input: ["aabb"], expected: -1 },
    { input: ["z"], expected: 0 },
    { input: [""], expected: -1 },
  ],
  solution:
    "function firstUniqChar(s) {\n" +
    "  const counts = new Map();\n" +
    "  for (const c of s) counts.set(c, (counts.get(c) || 0) + 1);\n" +
    "  for (let i = 0; i < s.length; i++) if (counts.get(s[i]) === 1) return i;\n" +
    "  return -1;\n" +
    "}",
  solutions: [
    {
      approach: "Frequency Map, two passes",
      timeComplexity: "O(n)",
      spaceComplexity: "O(1) — at most 26/alphabet-size distinct keys",
      explanation:
        "First pass builds a count of every character; second pass returns the first index whose count is " +
        "exactly 1. Each pass is linear and independent of how many characters repeat.",
      code:
        "function firstUniqChar(s) {\n" +
        "  const counts = new Map();\n" +
        "  for (const c of s) counts.set(c, (counts.get(c) || 0) + 1);\n" +
        "  for (let i = 0; i < s.length; i++) if (counts.get(s[i]) === 1) return i;\n" +
        "  return -1;\n" +
        "}",
    },
    {
      approach: "Brute force — count via rescanning",
      timeComplexity: "O(n^2)",
      spaceComplexity: "O(1)",
      explanation:
        "For each character, rescan the entire string to count its occurrences. Correct, but redoes the same " +
        "counting work from scratch at every index instead of computing all counts once.",
      code:
        "function firstUniqChar(s) {\n" +
        "  for (let i = 0; i < s.length; i++) {\n" +
        "    let count = 0;\n" +
        "    for (let j = 0; j < s.length; j++) if (s[j] === s[i]) count++;\n" +
        "    if (count === 1) return i;\n" +
        "  }\n" +
        "  return -1;\n" +
        "}",
    },
  ],
};

const countDistinctWindowsProblem: Problem = {
  id: "hash-count-distinct-in-window",
  title: "Count Distinct Elements in Every Window of Size K",
  difficulty: "Medium",
  description:
    "Given an array nums and a window size k, return an array where entry i is the number of distinct elements " +
    "in the window of size k ending at index i (one entry per valid window, in order).",
  fnName: "countDistinctWindows",
  starterCode: "function countDistinctWindows(nums, k) {\n  // your code here\n}",
  testCases: [
    { input: [[1, 2, 1, 3, 4, 2, 3], 4], expected: [3, 4, 4, 3] },
    { input: [[1, 1, 1, 1], 2], expected: [1, 1, 1] },
    { input: [[1, 2, 3, 4], 1], expected: [1, 1, 1, 1] },
    { input: [[1, 2, 1, 2, 1], 3], expected: [2, 2, 2] },
  ],
  solution:
    "function countDistinctWindows(nums, k) {\n" +
    "  const freq = new Map();\n" +
    "  const res = [];\n" +
    "  for (let i = 0; i < nums.length; i++) {\n" +
    "    freq.set(nums[i], (freq.get(nums[i]) || 0) + 1);\n" +
    "    if (i >= k) {\n" +
    "      const out = nums[i - k];\n" +
    "      freq.set(out, freq.get(out) - 1);\n" +
    "      if (freq.get(out) === 0) freq.delete(out);\n" +
    "    }\n" +
    "    if (i >= k - 1) res.push(freq.size);\n" +
    "  }\n" +
    "  return res;\n" +
    "}",
  solutions: [
    {
      approach: "Sliding window + frequency map",
      timeComplexity: "O(n)",
      spaceComplexity: "O(k)",
      explanation:
        "Maintain a running frequency map as the window slides: add the entering element, remove the leaving " +
        "element (deleting its key once its count hits zero so map.size always reflects the true distinct " +
        "count), and read off map.size at each valid window.",
      code:
        "function countDistinctWindows(nums, k) {\n" +
        "  const freq = new Map();\n" +
        "  const res = [];\n" +
        "  for (let i = 0; i < nums.length; i++) {\n" +
        "    freq.set(nums[i], (freq.get(nums[i]) || 0) + 1);\n" +
        "    if (i >= k) {\n" +
        "      const out = nums[i - k];\n" +
        "      freq.set(out, freq.get(out) - 1);\n" +
        "      if (freq.get(out) === 0) freq.delete(out);\n" +
        "    }\n" +
        "    if (i >= k - 1) res.push(freq.size);\n" +
        "  }\n" +
        "  return res;\n" +
        "}",
    },
    {
      approach: "Brute force — new Set per window",
      timeComplexity: "O(n * k)",
      spaceComplexity: "O(k)",
      explanation:
        "For every window start, build a fresh Set from that slice and read its size. Correct, but throws away " +
        "and rebuilds the whole window's distinct-count state on every slide instead of updating incrementally.",
      code:
        "function countDistinctWindows(nums, k) {\n" +
        "  const res = [];\n" +
        "  for (let i = 0; i + k <= nums.length; i++) {\n" +
        "    res.push(new Set(nums.slice(i, i + k)).size);\n" +
        "  }\n" +
        "  return res;\n" +
        "}",
    },
  ],
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
      problems: [designHashMapProblem],
    },
    {
      id: "hash-frequency-map",
      name: "Frequency Map",
      explanation:
        "Count occurrences of each element into a map (or array for small fixed alphabets) to answer questions " +
        "about counts, duplicates, or majority elements in one pass.",
      problems: [firstUniqCharProblem],
    },
    {
      id: "hash-count-distinct",
      name: "Count Distinct",
      explanation:
        "A hash set tracks which elements have already been seen, letting you count or filter distinct values " +
        "in O(n) instead of sorting first.",
      problems: [countDistinctWindowsProblem],
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

const dailyTemperaturesProblem: Problem = {
  id: "stack-daily-temperatures",
  title: "Daily Temperatures",
  difficulty: "Medium",
  description:
    "Given an array of daily temperatures, return an array answer where answer[i] is the number of days you " +
    "have to wait after day i to get a warmer temperature. If there is no future day for which this is " +
    "possible, keep answer[i] == 0.",
  fnName: "dailyTemperatures",
  starterCode: "function dailyTemperatures(temperatures) {\n  // your code here\n}",
  testCases: [
    { input: [[73, 74, 75, 71, 69, 72, 76, 73]], expected: [1, 1, 4, 2, 1, 1, 0, 0] },
    { input: [[30, 40, 50, 60]], expected: [1, 1, 1, 0] },
    { input: [[30, 60, 90]], expected: [1, 1, 0] },
    { input: [[90, 60, 30]], expected: [0, 0, 0] },
  ],
  solution:
    "function dailyTemperatures(temperatures) {\n" +
    "  const res = new Array(temperatures.length).fill(0);\n" +
    "  const stack = [];\n" +
    "  for (let i = 0; i < temperatures.length; i++) {\n" +
    "    while (stack.length && temperatures[stack[stack.length - 1]] < temperatures[i]) {\n" +
    "      const j = stack.pop();\n" +
    "      res[j] = i - j;\n" +
    "    }\n" +
    "    stack.push(i);\n" +
    "  }\n" +
    "  return res;\n" +
    "}",
  solutions: [
    {
      approach: "Monotonic (decreasing) Stack",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      explanation:
        "Keep indices on the stack whose warmer day hasn't been found yet, temperatures decreasing bottom-to-" +
        "top. Each index is pushed once and popped at most once — the moment a warmer day appears, it resolves " +
        "every colder day still waiting on the stack in one shot.",
      code:
        "function dailyTemperatures(temperatures) {\n" +
        "  const res = new Array(temperatures.length).fill(0);\n" +
        "  const stack = [];\n" +
        "  for (let i = 0; i < temperatures.length; i++) {\n" +
        "    while (stack.length && temperatures[stack[stack.length - 1]] < temperatures[i]) {\n" +
        "      const j = stack.pop();\n" +
        "      res[j] = i - j;\n" +
        "    }\n" +
        "    stack.push(i);\n" +
        "  }\n" +
        "  return res;\n" +
        "}",
    },
    {
      approach: "Brute-force (scan right for each day)",
      timeComplexity: "O(n^2)",
      spaceComplexity: "O(1)",
      explanation:
        "For each day, scan forward day by day until a warmer one turns up. Correct, but on a strictly falling " +
        "temperature run every scan walks all the way to the end for no answer.",
      code:
        "function dailyTemperatures(temperatures) {\n" +
        "  const res = new Array(temperatures.length).fill(0);\n" +
        "  for (let i = 0; i < temperatures.length; i++) {\n" +
        "    for (let j = i + 1; j < temperatures.length; j++) {\n" +
        "      if (temperatures[j] > temperatures[i]) { res[i] = j - i; break; }\n" +
        "    }\n" +
        "  }\n" +
        "  return res;\n" +
        "}",
    },
  ],
};

const minStackProblem: Problem = {
  id: "stack-min-stack-design",
  title: "Min Stack",
  difficulty: "Medium",
  description:
    "Design a stack that supports push, pop, top, and retrieving the minimum element, all in O(1), exercised " +
    "via a sequence of operations. ops[i] is one of \"push\", \"pop\", \"top\", \"getMin\"; argsList[i] holds " +
    "that operation's arguments (empty for pop/top/getMin). push/pop return null.",
  fnName: "minStackOperations",
  starterCode: "function minStackOperations(ops, argsList) {\n  // your code here\n}",
  testCases: [
    {
      input: [
        ["push", "push", "push", "getMin", "pop", "top", "getMin"],
        [[-2], [0], [-3], [], [], [], []],
      ],
      expected: [null, null, null, -3, null, 0, -2],
    },
    {
      input: [["push", "push", "getMin", "pop", "getMin"], [[5], [1], [], [], []]],
      expected: [null, null, 1, null, 5],
    },
  ],
  solution:
    "function minStackOperations(ops, argsList) {\n" +
    "  const stack = [];\n" +
    "  const minStack = [];\n" +
    "  const out = [];\n" +
    "  for (let i = 0; i < ops.length; i++) {\n" +
    "    const op = ops[i], a = argsList[i];\n" +
    "    if (op === 'push') {\n" +
    "      stack.push(a[0]);\n" +
    "      minStack.push(minStack.length === 0 ? a[0] : Math.min(minStack[minStack.length - 1], a[0]));\n" +
    "      out.push(null);\n" +
    "    } else if (op === 'pop') { stack.pop(); minStack.pop(); out.push(null); }\n" +
    "    else if (op === 'top') { out.push(stack[stack.length - 1]); }\n" +
    "    else { out.push(minStack[minStack.length - 1]); }\n" +
    "  }\n" +
    "  return out;\n" +
    "}",
  solutions: [
    {
      approach: "Parallel min-stack",
      timeComplexity: "O(1) per operation",
      spaceComplexity: "O(n)",
      explanation:
        "Alongside the value stack, maintain a second stack where each slot holds the minimum seen up to that " +
        "depth. Pushing/popping both stacks together keeps getMin a plain top-of-stack read, never a rescan.",
      code:
        "function minStackOperations(ops, argsList) {\n" +
        "  const stack = [];\n" +
        "  const minStack = [];\n" +
        "  const out = [];\n" +
        "  for (let i = 0; i < ops.length; i++) {\n" +
        "    const op = ops[i], a = argsList[i];\n" +
        "    if (op === 'push') {\n" +
        "      stack.push(a[0]);\n" +
        "      minStack.push(minStack.length === 0 ? a[0] : Math.min(minStack[minStack.length - 1], a[0]));\n" +
        "      out.push(null);\n" +
        "    } else if (op === 'pop') { stack.pop(); minStack.pop(); out.push(null); }\n" +
        "    else if (op === 'top') { out.push(stack[stack.length - 1]); }\n" +
        "    else { out.push(minStack[minStack.length - 1]); }\n" +
        "  }\n" +
        "  return out;\n" +
        "}",
    },
    {
      approach: "Brute force — Math.min over the stack on every getMin",
      timeComplexity: "O(1) push/pop/top, O(n) getMin",
      spaceComplexity: "O(n)",
      explanation:
        "Use a single plain stack and rescan the whole thing whenever getMin is called. Simpler to write, but " +
        "getMin degrades to linear time — exactly the cost the parallel min-stack is designed to avoid.",
      code:
        "function minStackOperations(ops, argsList) {\n" +
        "  const stack = [];\n" +
        "  const out = [];\n" +
        "  for (let i = 0; i < ops.length; i++) {\n" +
        "    const op = ops[i], a = argsList[i];\n" +
        "    if (op === 'push') { stack.push(a[0]); out.push(null); }\n" +
        "    else if (op === 'pop') { stack.pop(); out.push(null); }\n" +
        "    else if (op === 'top') { out.push(stack[stack.length - 1]); }\n" +
        "    else { out.push(Math.min(...stack)); }\n" +
        "  }\n" +
        "  return out;\n" +
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
      problems: [dailyTemperaturesProblem],
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
      problems: [minStackProblem],
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

const maxSlidingWindowProblem: Problem = {
  id: "queue-deque-max-sliding-window",
  title: "Sliding Window Maximum",
  difficulty: "Hard",
  description:
    "Given an array nums and a window size k, return an array of the maximum value in each window as it " +
    "slides from the start of the array to the end.",
  fnName: "maxSlidingWindow",
  starterCode: "function maxSlidingWindow(nums, k) {\n  // your code here\n}",
  testCases: [
    { input: [[1, 3, -1, -3, 5, 3, 6, 7], 3], expected: [3, 3, 5, 5, 6, 7] },
    { input: [[1], 1], expected: [1] },
    { input: [[9, 11], 2], expected: [11] },
    { input: [[4, -2], 2], expected: [4] },
    { input: [[1, 3, 1, 2, 0, 5], 3], expected: [3, 3, 2, 5] },
  ],
  solution:
    "function maxSlidingWindow(nums, k) {\n" +
    "  const dq = [];\n" +
    "  const res = [];\n" +
    "  for (let i = 0; i < nums.length; i++) {\n" +
    "    while (dq.length && dq[0] <= i - k) dq.shift();\n" +
    "    while (dq.length && nums[dq[dq.length - 1]] < nums[i]) dq.pop();\n" +
    "    dq.push(i);\n" +
    "    if (i >= k - 1) res.push(nums[dq[0]]);\n" +
    "  }\n" +
    "  return res;\n" +
    "}",
  solutions: [
    {
      approach: "Monotonic Deque",
      timeComplexity: "O(n)",
      spaceComplexity: "O(k)",
      explanation:
        "Keep a deque of indices whose values are decreasing front-to-back. Evict indices that fell out of the " +
        "window from the front, and evict indices with a smaller value than the incoming one from the back " +
        "(they can never be the max again). The front is always the current window's max.",
      code:
        "function maxSlidingWindow(nums, k) {\n" +
        "  const dq = [];\n" +
        "  const res = [];\n" +
        "  for (let i = 0; i < nums.length; i++) {\n" +
        "    while (dq.length && dq[0] <= i - k) dq.shift();\n" +
        "    while (dq.length && nums[dq[dq.length - 1]] < nums[i]) dq.pop();\n" +
        "    dq.push(i);\n" +
        "    if (i >= k - 1) res.push(nums[dq[0]]);\n" +
        "  }\n" +
        "  return res;\n" +
        "}",
    },
    {
      approach: "Brute force — Math.max over each window",
      timeComplexity: "O(n * k)",
      spaceComplexity: "O(1) extra",
      explanation:
        "Slice out every window and scan it for the max. Correct, but re-examines every element in the window " +
        "again on each slide instead of reusing work from the previous window.",
      code:
        "function maxSlidingWindow(nums, k) {\n" +
        "  const res = [];\n" +
        "  for (let i = 0; i + k <= nums.length; i++) {\n" +
        "    res.push(Math.max(...nums.slice(i, i + k)));\n" +
        "  }\n" +
        "  return res;\n" +
        "}",
    },
  ],
};

const firstNegativeInWindowProblem: Problem = {
  id: "queue-deque-first-negative-in-window",
  title: "First Negative Number in Every Window of Size K",
  difficulty: "Medium",
  description:
    "Given an array nums and a window size k, return an array where entry i is the first negative number in " +
    "the window of size k ending at index i, or 0 if that window has no negative number.",
  fnName: "firstNegativeInWindow",
  starterCode: "function firstNegativeInWindow(nums, k) {\n  // your code here\n}",
  testCases: [
    { input: [[12, -1, -7, 8, -15, 30, 16, 28], 3], expected: [-1, -1, -7, -15, -15, 0] },
    { input: [[-8, 2, 3, -6, 10], 2], expected: [-8, 0, -6, -6] },
    { input: [[5, -3, 5], 2], expected: [-3, -3] },
    { input: [[1, 2, 3], 2], expected: [0, 0] },
  ],
  solution:
    "function firstNegativeInWindow(nums, k) {\n" +
    "  const dq = [];\n" +
    "  const res = [];\n" +
    "  for (let i = 0; i < nums.length; i++) {\n" +
    "    if (nums[i] < 0) dq.push(i);\n" +
    "    while (dq.length && dq[0] <= i - k) dq.shift();\n" +
    "    if (i >= k - 1) res.push(dq.length ? nums[dq[0]] : 0);\n" +
    "  }\n" +
    "  return res;\n" +
    "}",
  solutions: [
    {
      approach: "Deque of negative-value indices",
      timeComplexity: "O(n)",
      spaceComplexity: "O(k)",
      explanation:
        "Only push indices whose value is negative onto the deque, in increasing order. Evict indices that " +
        "fell out of the window from the front; whatever remains at the front is the earliest still-in-window " +
        "negative, or the window has none if the deque is empty.",
      code:
        "function firstNegativeInWindow(nums, k) {\n" +
        "  const dq = [];\n" +
        "  const res = [];\n" +
        "  for (let i = 0; i < nums.length; i++) {\n" +
        "    if (nums[i] < 0) dq.push(i);\n" +
        "    while (dq.length && dq[0] <= i - k) dq.shift();\n" +
        "    if (i >= k - 1) res.push(dq.length ? nums[dq[0]] : 0);\n" +
        "  }\n" +
        "  return res;\n" +
        "}",
    },
    {
      approach: "Brute force — scan each window",
      timeComplexity: "O(n * k)",
      spaceComplexity: "O(1) extra",
      explanation:
        "For every window, walk it left to right until a negative number turns up. Correct, but on a window " +
        "with no negatives it re-walks the full k elements every time instead of remembering that from the " +
        "previous slide.",
      code:
        "function firstNegativeInWindow(nums, k) {\n" +
        "  const res = [];\n" +
        "  for (let i = 0; i + k <= nums.length; i++) {\n" +
        "    let found = 0;\n" +
        "    for (let j = i; j < i + k; j++) { if (nums[j] < 0) { found = nums[j]; break; } }\n" +
        "    res.push(found);\n" +
        "  }\n" +
        "  return res;\n" +
        "}",
    },
  ],
};

const shortestSubarrayProblem: Problem = {
  id: "queue-deque-shortest-subarray-at-least-k",
  title: "Shortest Subarray with Sum at Least K",
  difficulty: "Hard",
  description:
    "Given an integer array nums (which may contain negative numbers) and an integer k, return the length of " +
    "the shortest contiguous subarray with a sum of at least k, or -1 if no such subarray exists.",
  fnName: "shortestSubarray",
  starterCode: "function shortestSubarray(nums, k) {\n  // your code here\n}",
  testCases: [
    { input: [[1], 1], expected: 1 },
    { input: [[1, 2], 4], expected: -1 },
    { input: [[2, -1, 2], 3], expected: 3 },
    { input: [[84, -37, 32, 40, 95], 167], expected: 3 },
    { input: [[-28, 81, -20, 28, -29], 89], expected: 3 },
  ],
  solution:
    "function shortestSubarray(nums, k) {\n" +
    "  const n = nums.length;\n" +
    "  const prefix = new Array(n + 1).fill(0);\n" +
    "  for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] + nums[i];\n" +
    "  const dq = [];\n" +
    "  let best = Infinity;\n" +
    "  for (let i = 0; i <= n; i++) {\n" +
    "    while (dq.length && prefix[i] - prefix[dq[0]] >= k) {\n" +
    "      best = Math.min(best, i - dq.shift());\n" +
    "    }\n" +
    "    while (dq.length && prefix[dq[dq.length - 1]] >= prefix[i]) dq.pop();\n" +
    "    dq.push(i);\n" +
    "  }\n" +
    "  return best === Infinity ? -1 : best;\n" +
    "}",
  solutions: [
    {
      approach: "Prefix Sum + Monotonic Deque",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      explanation:
        "Because nums can hold negatives, prefix sums aren't monotonic, so a plain two-pointer window doesn't " +
        "work. Instead, keep a deque of prefix-sum indices with increasing prefix value: whenever the current " +
        "prefix minus the deque's front is >= k, that front index can never beat this match again, so pop and " +
        "score it; whenever the current prefix is <= the deque's back, the back index is now strictly worse " +
        "than the current one for every future query, so drop it too. Each index enters and leaves the deque " +
        "at most once.",
      code:
        "function shortestSubarray(nums, k) {\n" +
        "  const n = nums.length;\n" +
        "  const prefix = new Array(n + 1).fill(0);\n" +
        "  for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] + nums[i];\n" +
        "  const dq = [];\n" +
        "  let best = Infinity;\n" +
        "  for (let i = 0; i <= n; i++) {\n" +
        "    while (dq.length && prefix[i] - prefix[dq[0]] >= k) {\n" +
        "      best = Math.min(best, i - dq.shift());\n" +
        "    }\n" +
        "    while (dq.length && prefix[dq[dq.length - 1]] >= prefix[i]) dq.pop();\n" +
        "    dq.push(i);\n" +
        "  }\n" +
        "  return best === Infinity ? -1 : best;\n" +
        "}",
    },
    {
      approach: "Brute force — every subarray",
      timeComplexity: "O(n^2)",
      spaceComplexity: "O(1) extra",
      explanation:
        "Try every start index and extend the end index, stopping the inner loop as soon as the running sum " +
        "reaches k. Correct for any input, but doesn't reuse the deque's insight that some starting points can " +
        "be eliminated outright.",
      code:
        "function shortestSubarray(nums, k) {\n" +
        "  const n = nums.length;\n" +
        "  let best = Infinity;\n" +
        "  for (let i = 0; i < n; i++) {\n" +
        "    let sum = 0;\n" +
        "    for (let j = i; j < n; j++) {\n" +
        "      sum += nums[j];\n" +
        "      if (sum >= k) { best = Math.min(best, j - i + 1); break; }\n" +
        "    }\n" +
        "  }\n" +
        "  return best === Infinity ? -1 : best;\n" +
        "}",
    },
  ],
};

const designQueueProblem: Problem = {
  id: "queue-deque-design-queue",
  title: "Implement Queue using Two Stacks",
  difficulty: "Easy",
  description:
    "Implement a FIFO queue using only two stacks, exercised via a sequence of operations. ops[i] is one of " +
    "\"enqueue\", \"dequeue\", \"peek\", \"isEmpty\"; argsList[i] holds that operation's arguments (empty for " +
    "dequeue/peek/isEmpty). enqueue returns null; dequeue/peek return -1 when the queue is empty.",
  fnName: "queueOperations",
  starterCode: "function queueOperations(ops, argsList) {\n  // your code here\n}",
  testCases: [
    {
      input: [
        ["enqueue", "enqueue", "peek", "dequeue", "isEmpty", "enqueue", "dequeue", "dequeue", "isEmpty"],
        [[1], [2], [], [], [], [3], [], [], []],
      ],
      expected: [null, null, 1, 1, false, null, 2, 3, true],
    },
    {
      input: [["dequeue", "enqueue", "peek"], [[], [7], []]],
      expected: [-1, null, 7],
    },
  ],
  solution:
    "function queueOperations(ops, argsList) {\n" +
    "  const inStack = [], outStack = [];\n" +
    "  const out = [];\n" +
    "  function transfer() { while (inStack.length) outStack.push(inStack.pop()); }\n" +
    "  for (let i = 0; i < ops.length; i++) {\n" +
    "    const op = ops[i], a = argsList[i];\n" +
    "    if (op === 'enqueue') { inStack.push(a[0]); out.push(null); }\n" +
    "    else if (op === 'dequeue') { if (!outStack.length) transfer(); out.push(outStack.length ? outStack.pop() : -1); }\n" +
    "    else if (op === 'peek') { if (!outStack.length) transfer(); out.push(outStack.length ? outStack[outStack.length - 1] : -1); }\n" +
    "    else { out.push(inStack.length === 0 && outStack.length === 0); }\n" +
    "  }\n" +
    "  return out;\n" +
    "}",
  solutions: [
    {
      approach: "Two stacks, amortized O(1)",
      timeComplexity: "O(1) amortized per operation",
      spaceComplexity: "O(n)",
      explanation:
        "Push new items onto an 'in' stack. When a dequeue/peek needs the oldest item and the 'out' stack is " +
        "empty, dump the entire 'in' stack onto 'out' — this reverses it to FIFO order in one pass. Each " +
        "element only ever gets moved from 'in' to 'out' once across its whole lifetime, so the total work " +
        "stays linear even though a single dequeue can occasionally be O(n).",
      code:
        "function queueOperations(ops, argsList) {\n" +
        "  const inStack = [], outStack = [];\n" +
        "  const out = [];\n" +
        "  function transfer() { while (inStack.length) outStack.push(inStack.pop()); }\n" +
        "  for (let i = 0; i < ops.length; i++) {\n" +
        "    const op = ops[i], a = argsList[i];\n" +
        "    if (op === 'enqueue') { inStack.push(a[0]); out.push(null); }\n" +
        "    else if (op === 'dequeue') { if (!outStack.length) transfer(); out.push(outStack.length ? outStack.pop() : -1); }\n" +
        "    else if (op === 'peek') { if (!outStack.length) transfer(); out.push(outStack.length ? outStack[outStack.length - 1] : -1); }\n" +
        "    else { out.push(inStack.length === 0 && outStack.length === 0); }\n" +
        "  }\n" +
        "  return out;\n" +
        "}",
    },
    {
      approach: "Brute force — array with shift()",
      timeComplexity: "O(n) per dequeue (Array.shift is linear)",
      spaceComplexity: "O(n)",
      explanation:
        "Use a single array, pushing to the end and calling shift() to dequeue from the front. Simple, but " +
        "shift() re-indexes every remaining element, so it doesn't actually satisfy the 'stacks only, O(1) " +
        "amortized' constraint the two-stack design is built around.",
      code:
        "function queueOperations(ops, argsList) {\n" +
        "  const arr = [];\n" +
        "  const out = [];\n" +
        "  for (let i = 0; i < ops.length; i++) {\n" +
        "    const op = ops[i], a = argsList[i];\n" +
        "    if (op === 'enqueue') { arr.push(a[0]); out.push(null); }\n" +
        "    else if (op === 'dequeue') { out.push(arr.length ? arr.shift() : -1); }\n" +
        "    else if (op === 'peek') { out.push(arr.length ? arr[0] : -1); }\n" +
        "    else { out.push(arr.length === 0); }\n" +
        "  }\n" +
        "  return out;\n" +
        "}",
    },
  ],
};

const queueDeque: Pattern = {
  id: "queue-deque",
  name: "Queue / Deque",
  subpatterns: [
    {
      id: "queue-deque-sliding-window-maximum",
      name: "Sliding Window Maximum",
      explanation:
        "Maintain a deque of indices with strictly decreasing values; the front is always the current window's " +
        "maximum, and stale or dominated indices are evicted as the window slides.",
      problems: [maxSlidingWindowProblem],
    },
    {
      id: "queue-deque-first-negative-in-window",
      name: "First Negative in Window",
      explanation:
        "A deque holding only the indices of negative numbers turns 'find the first negative in this window' " +
        "into a front-of-deque read instead of a rescan.",
      problems: [firstNegativeInWindowProblem],
    },
    {
      id: "queue-deque-deque-optimization",
      name: "Deque Optimization",
      explanation:
        "Some window/range problems (especially with negative values, where two-pointer sums break down) can " +
        "still hit O(n) by keeping a monotonic deque of candidate indices and discarding ones that can " +
        "provably never be optimal again.",
      problems: [shortestSubarrayProblem],
    },
    {
      id: "queue-deque-design-queue",
      name: "Design Queue",
      explanation:
        "A FIFO queue can be built from two LIFO stacks: new items go on one stack, and reversing onto a second " +
        "stack (only when it's empty) restores FIFO order with amortized O(1) cost per operation.",
      problems: [designQueueProblem],
    },
  ],
};

const middleNodeProblem: Problem = {
  id: "linked-list-middle-node",
  title: "Middle of the Linked List",
  difficulty: "Easy",
  description:
    "Given a singly linked list (represented here as an array of values), return the values from the middle " +
    "node to the end. If there are two middle nodes, return starting from the second one.",
  fnName: "middleNode",
  starterCode: "function middleNode(arr) {\n  // your code here\n}",
  testCases: [
    { input: [[1, 2, 3, 4, 5]], expected: [3, 4, 5] },
    { input: [[1, 2, 3, 4, 5, 6]], expected: [4, 5, 6] },
    { input: [[1]], expected: [1] },
    { input: [[1, 2]], expected: [2] },
  ],
  solution:
    "function middleNode(arr) {\n" +
    "  function buildList(a) {\n" +
    "    let head = null, tail = null;\n" +
    "    for (const v of a) {\n" +
    "      const node = { val: v, next: null };\n" +
    "      if (!head) head = tail = node; else { tail.next = node; tail = node; }\n" +
    "    }\n" +
    "    return head;\n" +
    "  }\n" +
    "  function toArray(h) {\n" +
    "    const out = [];\n" +
    "    let cur = h;\n" +
    "    while (cur) { out.push(cur.val); cur = cur.next; }\n" +
    "    return out;\n" +
    "  }\n" +
    "  const head = buildList(arr);\n" +
    "  let slow = head, fast = head;\n" +
    "  while (fast && fast.next) { slow = slow.next; fast = fast.next.next; }\n" +
    "  return toArray(slow);\n" +
    "}",
  solutions: [
    {
      approach: "Fast-Slow Pointers",
      timeComplexity: "O(n)",
      spaceComplexity: "O(1) extra",
      explanation:
        "Advance a slow pointer one node at a time and a fast pointer two nodes at a time. When fast reaches " +
        "the end, slow is exactly at the middle — one traversal, no need to know the length in advance.",
      code:
        "function middleNode(arr) {\n" +
        "  function buildList(a) {\n" +
        "    let head = null, tail = null;\n" +
        "    for (const v of a) {\n" +
        "      const node = { val: v, next: null };\n" +
        "      if (!head) head = tail = node; else { tail.next = node; tail = node; }\n" +
        "    }\n" +
        "    return head;\n" +
        "  }\n" +
        "  function toArray(h) {\n" +
        "    const out = [];\n" +
        "    let cur = h;\n" +
        "    while (cur) { out.push(cur.val); cur = cur.next; }\n" +
        "    return out;\n" +
        "  }\n" +
        "  const head = buildList(arr);\n" +
        "  let slow = head, fast = head;\n" +
        "  while (fast && fast.next) { slow = slow.next; fast = fast.next.next; }\n" +
        "  return toArray(slow);\n" +
        "}",
    },
    {
      approach: "Two-pass — count then walk",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      explanation:
        "First pass collects every node into an array (or just counts the length), then a second step jumps " +
        "straight to the middle index. Needs the whole list materialized (or a length precomputed) before it " +
        "can locate the middle, where fast-slow finds it in a single pass over the live list.",
      code:
        "function middleNode(arr) {\n" +
        "  function buildList(a) {\n" +
        "    let head = null, tail = null;\n" +
        "    for (const v of a) {\n" +
        "      const node = { val: v, next: null };\n" +
        "      if (!head) head = tail = node; else { tail.next = node; tail = node; }\n" +
        "    }\n" +
        "    return head;\n" +
        "  }\n" +
        "  function toArray(h) {\n" +
        "    const out = [];\n" +
        "    let cur = h;\n" +
        "    while (cur) { out.push(cur.val); cur = cur.next; }\n" +
        "    return out;\n" +
        "  }\n" +
        "  const head = buildList(arr);\n" +
        "  const nodes = [];\n" +
        "  let cur = head;\n" +
        "  while (cur) { nodes.push(cur); cur = cur.next; }\n" +
        "  return toArray(nodes[Math.floor(nodes.length / 2)]);\n" +
        "}",
    },
  ],
};

const hasCycleProblem: Problem = {
  id: "linked-list-has-cycle",
  title: "Linked List Cycle Detection",
  difficulty: "Easy",
  description:
    "Given a linked list built from an array of values where the last node's next pointer connects back to " +
    "index pos (or pos = -1 for no cycle), return true if the list has a cycle.",
  fnName: "hasCycle",
  starterCode: "function hasCycle(arr, pos) {\n  // your code here\n}",
  testCases: [
    { input: [[3, 2, 0, -4], 1], expected: true },
    { input: [[1, 2], 0], expected: true },
    { input: [[1], -1], expected: false },
    { input: [[1, 2, 3], -1], expected: false },
  ],
  solution:
    "function hasCycle(arr, pos) {\n" +
    "  const nodes = arr.map((v) => ({ val: v, next: null }));\n" +
    "  for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1];\n" +
    "  if (pos >= 0 && nodes.length) nodes[nodes.length - 1].next = nodes[pos];\n" +
    "  let slow = nodes[0], fast = nodes[0];\n" +
    "  while (fast && fast.next) {\n" +
    "    slow = slow.next; fast = fast.next.next;\n" +
    "    if (slow === fast) return true;\n" +
    "  }\n" +
    "  return false;\n" +
    "}",
  solutions: [
    {
      approach: "Floyd's Fast-Slow Pointers",
      timeComplexity: "O(n)",
      spaceComplexity: "O(1)",
      explanation:
        "If a cycle exists, a pointer moving 2 steps at a time is guaranteed to lap a pointer moving 1 step at " +
        "a time and land on the same node. No extra memory — just two pointers racing around the list.",
      code:
        "function hasCycle(arr, pos) {\n" +
        "  const nodes = arr.map((v) => ({ val: v, next: null }));\n" +
        "  for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1];\n" +
        "  if (pos >= 0 && nodes.length) nodes[nodes.length - 1].next = nodes[pos];\n" +
        "  let slow = nodes[0], fast = nodes[0];\n" +
        "  while (fast && fast.next) {\n" +
        "    slow = slow.next; fast = fast.next.next;\n" +
        "    if (slow === fast) return true;\n" +
        "  }\n" +
        "  return false;\n" +
        "}",
    },
    {
      approach: "Hash Set of visited nodes",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      explanation:
        "Walk the list, remembering every node visited. A cycle exists exactly when the walk revisits a node " +
        "already in the set. Just as fast, but trades Floyd's constant space for a full extra set of node " +
        "references.",
      code:
        "function hasCycle(arr, pos) {\n" +
        "  const nodes = arr.map((v) => ({ val: v, next: null }));\n" +
        "  for (let i = 0; i < nodes.length - 1; i++) nodes[i].next = nodes[i + 1];\n" +
        "  if (pos >= 0 && nodes.length) nodes[nodes.length - 1].next = nodes[pos];\n" +
        "  const seen = new Set();\n" +
        "  let cur = nodes[0];\n" +
        "  while (cur) { if (seen.has(cur)) return true; seen.add(cur); cur = cur.next; }\n" +
        "  return false;\n" +
        "}",
    },
  ],
};

const reverseListProblem: Problem = {
  id: "linked-list-reverse-list",
  title: "Reverse Linked List",
  difficulty: "Easy",
  description: "Given the values of a singly linked list as an array, return the values of the reversed list.",
  fnName: "reverseList",
  starterCode: "function reverseList(arr) {\n  // your code here\n}",
  testCases: [
    { input: [[1, 2, 3, 4, 5]], expected: [5, 4, 3, 2, 1] },
    { input: [[1, 2]], expected: [2, 1] },
    { input: [[1]], expected: [1] },
    { input: [[]], expected: [] },
  ],
  solution:
    "function reverseList(arr) {\n" +
    "  function buildList(a) {\n" +
    "    let head = null, tail = null;\n" +
    "    for (const v of a) {\n" +
    "      const node = { val: v, next: null };\n" +
    "      if (!head) head = tail = node; else { tail.next = node; tail = node; }\n" +
    "    }\n" +
    "    return head;\n" +
    "  }\n" +
    "  function toArray(h) {\n" +
    "    const out = [];\n" +
    "    let cur = h;\n" +
    "    while (cur) { out.push(cur.val); cur = cur.next; }\n" +
    "    return out;\n" +
    "  }\n" +
    "  let cur = buildList(arr);\n" +
    "  let prev = null;\n" +
    "  while (cur) { const next = cur.next; cur.next = prev; prev = cur; cur = next; }\n" +
    "  return toArray(prev);\n" +
    "}",
  solutions: [
    {
      approach: "Iterative pointer rewiring",
      timeComplexity: "O(n)",
      spaceComplexity: "O(1) extra",
      explanation:
        "Walk the list once, and at each node flip its next pointer to point backward at the previous node " +
        "instead of forward. Three running pointers (prev, cur, next) are all the extra state needed.",
      code:
        "function reverseList(arr) {\n" +
        "  function buildList(a) {\n" +
        "    let head = null, tail = null;\n" +
        "    for (const v of a) {\n" +
        "      const node = { val: v, next: null };\n" +
        "      if (!head) head = tail = node; else { tail.next = node; tail = node; }\n" +
        "    }\n" +
        "    return head;\n" +
        "  }\n" +
        "  function toArray(h) {\n" +
        "    const out = [];\n" +
        "    let cur = h;\n" +
        "    while (cur) { out.push(cur.val); cur = cur.next; }\n" +
        "    return out;\n" +
        "  }\n" +
        "  let cur = buildList(arr);\n" +
        "  let prev = null;\n" +
        "  while (cur) { const next = cur.next; cur.next = prev; prev = cur; cur = next; }\n" +
        "  return toArray(prev);\n" +
        "}",
    },
    {
      approach: "Recursive reversal",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n) — recursion stack, one frame per node",
      explanation:
        "Recurse to the end of the list first, then, unwinding, make each node's next node point back at it. " +
        "Same pointer-flipping idea as the iterative version, but the call stack does the bookkeeping instead " +
        "of explicit prev/cur/next variables.",
      code:
        "function reverseList(arr) {\n" +
        "  function buildList(a) {\n" +
        "    let head = null, tail = null;\n" +
        "    for (const v of a) {\n" +
        "      const node = { val: v, next: null };\n" +
        "      if (!head) head = tail = node; else { tail.next = node; tail = node; }\n" +
        "    }\n" +
        "    return head;\n" +
        "  }\n" +
        "  function toArray(h) {\n" +
        "    const out = [];\n" +
        "    let cur = h;\n" +
        "    while (cur) { out.push(cur.val); cur = cur.next; }\n" +
        "    return out;\n" +
        "  }\n" +
        "  function helper(node) {\n" +
        "    if (!node || !node.next) return node;\n" +
        "    const newHead = helper(node.next);\n" +
        "    node.next.next = node;\n" +
        "    node.next = null;\n" +
        "    return newHead;\n" +
        "  }\n" +
        "  return toArray(helper(buildList(arr)));\n" +
        "}",
    },
  ],
};

const mergeTwoListsProblem: Problem = {
  id: "linked-list-merge-two-sorted-lists",
  title: "Merge Two Sorted Lists",
  difficulty: "Easy",
  description:
    "Given two sorted linked lists (as arrays of values), merge them into one sorted list and return its " +
    "values as an array.",
  fnName: "mergeTwoLists",
  starterCode: "function mergeTwoLists(a, b) {\n  // your code here\n}",
  testCases: [
    { input: [[1, 2, 4], [1, 3, 4]], expected: [1, 1, 2, 3, 4, 4] },
    { input: [[], []], expected: [] },
    { input: [[], [0]], expected: [0] },
    { input: [[5], [1, 2, 4]], expected: [1, 2, 4, 5] },
  ],
  solution:
    "function mergeTwoLists(a, b) {\n" +
    "  function buildList(arr) {\n" +
    "    let head = null, tail = null;\n" +
    "    for (const v of arr) {\n" +
    "      const node = { val: v, next: null };\n" +
    "      if (!head) head = tail = node; else { tail.next = node; tail = node; }\n" +
    "    }\n" +
    "    return head;\n" +
    "  }\n" +
    "  function toArray(h) {\n" +
    "    const out = [];\n" +
    "    let cur = h;\n" +
    "    while (cur) { out.push(cur.val); cur = cur.next; }\n" +
    "    return out;\n" +
    "  }\n" +
    "  let p1 = buildList(a), p2 = buildList(b);\n" +
    "  const dummy = { val: 0, next: null };\n" +
    "  let tail = dummy;\n" +
    "  while (p1 && p2) {\n" +
    "    if (p1.val <= p2.val) { tail.next = p1; p1 = p1.next; } else { tail.next = p2; p2 = p2.next; }\n" +
    "    tail = tail.next;\n" +
    "  }\n" +
    "  tail.next = p1 || p2;\n" +
    "  return toArray(dummy.next);\n" +
    "}",
  solutions: [
    {
      approach: "Two-Pointer Merge",
      timeComplexity: "O(n + m)",
      spaceComplexity: "O(1) extra",
      explanation:
        "Walk both lists simultaneously, always splicing the smaller current node onto the result and " +
        "advancing that list's pointer. A dummy head node avoids special-casing the first splice. Once one " +
        "list is exhausted, the remainder of the other is already sorted, so it's spliced on directly.",
      code:
        "function mergeTwoLists(a, b) {\n" +
        "  function buildList(arr) {\n" +
        "    let head = null, tail = null;\n" +
        "    for (const v of arr) {\n" +
        "      const node = { val: v, next: null };\n" +
        "      if (!head) head = tail = node; else { tail.next = node; tail = node; }\n" +
        "    }\n" +
        "    return head;\n" +
        "  }\n" +
        "  function toArray(h) {\n" +
        "    const out = [];\n" +
        "    let cur = h;\n" +
        "    while (cur) { out.push(cur.val); cur = cur.next; }\n" +
        "    return out;\n" +
        "  }\n" +
        "  let p1 = buildList(a), p2 = buildList(b);\n" +
        "  const dummy = { val: 0, next: null };\n" +
        "  let tail = dummy;\n" +
        "  while (p1 && p2) {\n" +
        "    if (p1.val <= p2.val) { tail.next = p1; p1 = p1.next; } else { tail.next = p2; p2 = p2.next; }\n" +
        "    tail = tail.next;\n" +
        "  }\n" +
        "  tail.next = p1 || p2;\n" +
        "  return toArray(dummy.next);\n" +
        "}",
    },
    {
      approach: "Concatenate + sort",
      timeComplexity: "O((n + m) log(n + m))",
      spaceComplexity: "O(n + m)",
      explanation:
        "Ignore that both inputs are already sorted — just concatenate them into one array and sort from " +
        "scratch. Correct, but throws away the sortedness the two-pointer merge exploits to do the same job " +
        "in linear time.",
      code:
        "function mergeTwoLists(a, b) {\n" +
        "  return [...a, ...b].sort((x, y) => x - y);\n" +
        "}",
    },
  ],
};

const linkedList: Pattern = {
  id: "linked-list",
  name: "Linked List",
  subpatterns: [
    {
      id: "linked-list-fast-slow-pointers",
      name: "Fast-Slow Pointers",
      explanation:
        "Two pointers advance through the list at different speeds (typically 1 and 2 steps). Where they meet, " +
        "or whether the fast one reaches the end first, answers questions like 'where's the middle' or " +
        "'is there a cycle' without ever knowing the list's length up front.",
      problems: [middleNodeProblem],
    },
    {
      id: "linked-list-cycle-detection",
      name: "Cycle Detection",
      explanation:
        "A special case of fast-slow pointers: if the fast pointer ever catches up to the slow one, the list " +
        "loops back on itself. If fast reaches a null next pointer instead, there's no cycle.",
      problems: [hasCycleProblem],
    },
    {
      id: "linked-list-reversal",
      name: "Reversal",
      explanation:
        "Flip every node's next pointer to point at the previous node instead of the following one, tracking " +
        "prev/cur/next as you go (or achieving the same flip via recursion, unwinding from the tail).",
      problems: [reverseListProblem],
    },
    {
      id: "linked-list-merge-lists",
      name: "Merge Lists",
      explanation:
        "Walk two already-sorted lists together with one pointer each, always splicing the smaller current " +
        "node onto the result — no need to sort anything, since the inputs' order is never violated.",
      problems: [mergeTwoListsProblem],
    },
  ],
};

const TREE_HELPERS_NOTE =
  "Trees are given as level-order arrays with null for missing children (e.g. [3,9,20,null,null,15,7]), " +
  "the same format LeetCode uses. Each solution below rebuilds real {val,left,right} node objects internally " +
  "and operates on them with genuine pointer traversal — the array is only the wire format for test I/O.";

const levelOrderProblem: Problem = {
  id: "trees-level-order-traversal",
  title: "Binary Tree Level Order Traversal",
  difficulty: "Medium",
  description:
    `Given a binary tree (level-order array with null gaps), return its values grouped by depth level, ` +
    `top to bottom, left to right within each level. ${TREE_HELPERS_NOTE}`,
  fnName: "levelOrder",
  starterCode: "function levelOrder(arr) {\n  \n}",
  testCases: [
    { input: [[3, 9, 20, null, null, 15, 7]], expected: [[3], [9, 20], [15, 7]] },
    { input: [[1]], expected: [[1]] },
    { input: [[]], expected: [] },
    { input: [[1, 2, 3, 4, null, null, 5]], expected: [[1], [2, 3], [4, 5]] },
  ],
  solution:
    "function buildTree(arr) {\n" +
    "  if (!arr.length || arr[0] === null) return null;\n" +
    "  const root = { val: arr[0], left: null, right: null };\n" +
    "  const queue = [root];\n" +
    "  let i = 1;\n" +
    "  while (queue.length && i < arr.length) {\n" +
    "    const node = queue.shift();\n" +
    "    if (i < arr.length) {\n" +
    "      const leftVal = arr[i++];\n" +
    "      if (leftVal !== null) { node.left = { val: leftVal, left: null, right: null }; queue.push(node.left); }\n" +
    "    }\n" +
    "    if (i < arr.length) {\n" +
    "      const rightVal = arr[i++];\n" +
    "      if (rightVal !== null) { node.right = { val: rightVal, left: null, right: null }; queue.push(node.right); }\n" +
    "    }\n" +
    "  }\n" +
    "  return root;\n" +
    "}\n" +
    "function levelOrder(arr) {\n" +
    "  const root = buildTree(arr);\n" +
    "  if (!root) return [];\n" +
    "  const result = [];\n" +
    "  let queue = [root];\n" +
    "  while (queue.length) {\n" +
    "    const level = [];\n" +
    "    const next = [];\n" +
    "    for (const node of queue) {\n" +
    "      level.push(node.val);\n" +
    "      if (node.left) next.push(node.left);\n" +
    "      if (node.right) next.push(node.right);\n" +
    "    }\n" +
    "    result.push(level);\n" +
    "    queue = next;\n" +
    "  }\n" +
    "  return result;\n" +
    "}",
  solutions: [
    {
      approach: "Iterative BFS with a queue",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n) — the queue can hold a full level's worth of nodes",
      explanation:
        "Process the tree one level at a time: snapshot the current queue as 'this level', collect every " +
        "child into a fresh queue for the next pass, and record each level's values before moving on.",
      code:
        "function buildTree(arr) {\n" +
        "  if (!arr.length || arr[0] === null) return null;\n" +
        "  const root = { val: arr[0], left: null, right: null };\n" +
        "  const queue = [root];\n" +
        "  let i = 1;\n" +
        "  while (queue.length && i < arr.length) {\n" +
        "    const node = queue.shift();\n" +
        "    if (i < arr.length) {\n" +
        "      const leftVal = arr[i++];\n" +
        "      if (leftVal !== null) { node.left = { val: leftVal, left: null, right: null }; queue.push(node.left); }\n" +
        "    }\n" +
        "    if (i < arr.length) {\n" +
        "      const rightVal = arr[i++];\n" +
        "      if (rightVal !== null) { node.right = { val: rightVal, left: null, right: null }; queue.push(node.right); }\n" +
        "    }\n" +
        "  }\n" +
        "  return root;\n" +
        "}\n" +
        "function levelOrder(arr) {\n" +
        "  const root = buildTree(arr);\n" +
        "  if (!root) return [];\n" +
        "  const result = [];\n" +
        "  let queue = [root];\n" +
        "  while (queue.length) {\n" +
        "    const level = [];\n" +
        "    const next = [];\n" +
        "    for (const node of queue) {\n" +
        "      level.push(node.val);\n" +
        "      if (node.left) next.push(node.left);\n" +
        "      if (node.right) next.push(node.right);\n" +
        "    }\n" +
        "    result.push(level);\n" +
        "    queue = next;\n" +
        "  }\n" +
        "  return result;\n" +
        "}",
    },
    {
      approach: "Recursive DFS, bucketed by depth",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n) for the result plus O(h) recursion stack (tree height h)",
      explanation:
        "Depth-first walk the tree while tracking the current depth, pushing each node's value into the " +
        "result bucket for that depth (creating the bucket on first visit). No queue needed at all.",
      code:
        "function buildTree(arr) {\n" +
        "  if (!arr.length || arr[0] === null) return null;\n" +
        "  const root = { val: arr[0], left: null, right: null };\n" +
        "  const queue = [root];\n" +
        "  let i = 1;\n" +
        "  while (queue.length && i < arr.length) {\n" +
        "    const node = queue.shift();\n" +
        "    if (i < arr.length) {\n" +
        "      const leftVal = arr[i++];\n" +
        "      if (leftVal !== null) { node.left = { val: leftVal, left: null, right: null }; queue.push(node.left); }\n" +
        "    }\n" +
        "    if (i < arr.length) {\n" +
        "      const rightVal = arr[i++];\n" +
        "      if (rightVal !== null) { node.right = { val: rightVal, left: null, right: null }; queue.push(node.right); }\n" +
        "    }\n" +
        "  }\n" +
        "  return root;\n" +
        "}\n" +
        "function levelOrder(arr) {\n" +
        "  const root = buildTree(arr);\n" +
        "  const result = [];\n" +
        "  function dfs(node, depth) {\n" +
        "    if (!node) return;\n" +
        "    if (!result[depth]) result[depth] = [];\n" +
        "    result[depth].push(node.val);\n" +
        "    dfs(node.left, depth + 1);\n" +
        "    dfs(node.right, depth + 1);\n" +
        "  }\n" +
        "  dfs(root, 0);\n" +
        "  return result;\n" +
        "}",
    },
  ],
};

const isValidBSTProblem: Problem = {
  id: "trees-validate-bst",
  title: "Validate Binary Search Tree",
  difficulty: "Medium",
  description:
    `Given a binary tree (level-order array with null gaps), determine whether it is a valid binary search ` +
    `tree: every node's value must be strictly greater than all values in its left subtree and strictly less ` +
    `than all values in its right subtree. ${TREE_HELPERS_NOTE}`,
  fnName: "isValidBST",
  starterCode: "function isValidBST(arr) {\n  \n}",
  testCases: [
    { input: [[2, 1, 3]], expected: true },
    { input: [[5, 1, 4, null, null, 3, 6]], expected: false },
    { input: [[1, 1]], expected: false },
    { input: [[3, 1, 5, 0, 2, 4, 6]], expected: true },
    { input: [[]], expected: true },
  ],
  solution:
    "function buildTree(arr) {\n" +
    "  if (!arr.length || arr[0] === null) return null;\n" +
    "  const root = { val: arr[0], left: null, right: null };\n" +
    "  const queue = [root];\n" +
    "  let i = 1;\n" +
    "  while (queue.length && i < arr.length) {\n" +
    "    const node = queue.shift();\n" +
    "    if (i < arr.length) {\n" +
    "      const leftVal = arr[i++];\n" +
    "      if (leftVal !== null) { node.left = { val: leftVal, left: null, right: null }; queue.push(node.left); }\n" +
    "    }\n" +
    "    if (i < arr.length) {\n" +
    "      const rightVal = arr[i++];\n" +
    "      if (rightVal !== null) { node.right = { val: rightVal, left: null, right: null }; queue.push(node.right); }\n" +
    "    }\n" +
    "  }\n" +
    "  return root;\n" +
    "}\n" +
    "function isValidBST(arr) {\n" +
    "  const root = buildTree(arr);\n" +
    "  const vals = [];\n" +
    "  function inorder(node) {\n" +
    "    if (!node) return;\n" +
    "    inorder(node.left);\n" +
    "    vals.push(node.val);\n" +
    "    inorder(node.right);\n" +
    "  }\n" +
    "  inorder(root);\n" +
    "  for (let i = 1; i < vals.length; i++) if (vals[i] <= vals[i - 1]) return false;\n" +
    "  return true;\n" +
    "}",
  solutions: [
    {
      approach: "Inorder traversal must be strictly increasing",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n) — stores every value from the inorder walk",
      explanation:
        "A BST's inorder traversal visits values in sorted order if and only if the tree is valid. Collect " +
        "the inorder sequence, then check it's strictly increasing.",
      code:
        "function buildTree(arr) {\n" +
        "  if (!arr.length || arr[0] === null) return null;\n" +
        "  const root = { val: arr[0], left: null, right: null };\n" +
        "  const queue = [root];\n" +
        "  let i = 1;\n" +
        "  while (queue.length && i < arr.length) {\n" +
        "    const node = queue.shift();\n" +
        "    if (i < arr.length) {\n" +
        "      const leftVal = arr[i++];\n" +
        "      if (leftVal !== null) { node.left = { val: leftVal, left: null, right: null }; queue.push(node.left); }\n" +
        "    }\n" +
        "    if (i < arr.length) {\n" +
        "      const rightVal = arr[i++];\n" +
        "      if (rightVal !== null) { node.right = { val: rightVal, left: null, right: null }; queue.push(node.right); }\n" +
        "    }\n" +
        "  }\n" +
        "  return root;\n" +
        "}\n" +
        "function isValidBST(arr) {\n" +
        "  const root = buildTree(arr);\n" +
        "  const vals = [];\n" +
        "  function inorder(node) {\n" +
        "    if (!node) return;\n" +
        "    inorder(node.left);\n" +
        "    vals.push(node.val);\n" +
        "    inorder(node.right);\n" +
        "  }\n" +
        "  inorder(root);\n" +
        "  for (let i = 1; i < vals.length; i++) if (vals[i] <= vals[i - 1]) return false;\n" +
        "  return true;\n" +
        "}",
    },
    {
      approach: "Recursive min/max bounds",
      timeComplexity: "O(n)",
      spaceComplexity: "O(h) recursion stack only — no extra array (tree height h)",
      explanation:
        "Pass down a valid (lo, hi) range as you descend: a node must fall strictly inside its inherited " +
        "range, and it narrows the range further for each subtree. No values need to be stored.",
      code:
        "function buildTree(arr) {\n" +
        "  if (!arr.length || arr[0] === null) return null;\n" +
        "  const root = { val: arr[0], left: null, right: null };\n" +
        "  const queue = [root];\n" +
        "  let i = 1;\n" +
        "  while (queue.length && i < arr.length) {\n" +
        "    const node = queue.shift();\n" +
        "    if (i < arr.length) {\n" +
        "      const leftVal = arr[i++];\n" +
        "      if (leftVal !== null) { node.left = { val: leftVal, left: null, right: null }; queue.push(node.left); }\n" +
        "    }\n" +
        "    if (i < arr.length) {\n" +
        "      const rightVal = arr[i++];\n" +
        "      if (rightVal !== null) { node.right = { val: rightVal, left: null, right: null }; queue.push(node.right); }\n" +
        "    }\n" +
        "  }\n" +
        "  return root;\n" +
        "}\n" +
        "function isValidBST(arr) {\n" +
        "  const root = buildTree(arr);\n" +
        "  function helper(node, lo, hi) {\n" +
        "    if (!node) return true;\n" +
        "    if (node.val <= lo || node.val >= hi) return false;\n" +
        "    return helper(node.left, lo, node.val) && helper(node.right, node.val, hi);\n" +
        "  }\n" +
        "  return helper(root, -Infinity, Infinity);\n" +
        "}",
    },
  ],
};

const lcaProblem: Problem = {
  id: "trees-lowest-common-ancestor",
  title: "Lowest Common Ancestor of a Binary Tree",
  difficulty: "Medium",
  description:
    `Given a binary tree (level-order array with null gaps) and two values p and q known to exist in the ` +
    `tree, return the value of their lowest common ancestor — the deepest node that has both p and q as ` +
    `descendants (a node can be its own descendant). ${TREE_HELPERS_NOTE}`,
  fnName: "lowestCommonAncestor",
  starterCode: "function lowestCommonAncestor(arr, p, q) {\n  \n}",
  testCases: [
    { input: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 5, 1], expected: 3 },
    { input: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 5, 4], expected: 5 },
    { input: [[1, 2], 1, 2], expected: 1 },
  ],
  solution:
    "function buildTree(arr) {\n" +
    "  if (!arr.length || arr[0] === null) return null;\n" +
    "  const root = { val: arr[0], left: null, right: null };\n" +
    "  const queue = [root];\n" +
    "  let i = 1;\n" +
    "  while (queue.length && i < arr.length) {\n" +
    "    const node = queue.shift();\n" +
    "    if (i < arr.length) {\n" +
    "      const leftVal = arr[i++];\n" +
    "      if (leftVal !== null) { node.left = { val: leftVal, left: null, right: null }; queue.push(node.left); }\n" +
    "    }\n" +
    "    if (i < arr.length) {\n" +
    "      const rightVal = arr[i++];\n" +
    "      if (rightVal !== null) { node.right = { val: rightVal, left: null, right: null }; queue.push(node.right); }\n" +
    "    }\n" +
    "  }\n" +
    "  return root;\n" +
    "}\n" +
    "function lowestCommonAncestor(arr, p, q) {\n" +
    "  const root = buildTree(arr);\n" +
    "  function find(node) {\n" +
    "    if (!node) return null;\n" +
    "    if (node.val === p || node.val === q) return node;\n" +
    "    const left = find(node.left);\n" +
    "    const right = find(node.right);\n" +
    "    if (left && right) return node;\n" +
    "    return left || right;\n" +
    "  }\n" +
    "  const res = find(root);\n" +
    "  return res ? res.val : null;\n" +
    "}",
  solutions: [
    {
      approach: "Recursive single-pass search",
      timeComplexity: "O(n)",
      spaceComplexity: "O(h) recursion stack (tree height h)",
      explanation:
        "Recurse into both subtrees. If a call returns a hit from both sides, the current node is the LCA; " +
        "otherwise bubble up whichever side (if any) found something.",
      code:
        "function buildTree(arr) {\n" +
        "  if (!arr.length || arr[0] === null) return null;\n" +
        "  const root = { val: arr[0], left: null, right: null };\n" +
        "  const queue = [root];\n" +
        "  let i = 1;\n" +
        "  while (queue.length && i < arr.length) {\n" +
        "    const node = queue.shift();\n" +
        "    if (i < arr.length) {\n" +
        "      const leftVal = arr[i++];\n" +
        "      if (leftVal !== null) { node.left = { val: leftVal, left: null, right: null }; queue.push(node.left); }\n" +
        "    }\n" +
        "    if (i < arr.length) {\n" +
        "      const rightVal = arr[i++];\n" +
        "      if (rightVal !== null) { node.right = { val: rightVal, left: null, right: null }; queue.push(node.right); }\n" +
        "    }\n" +
        "  }\n" +
        "  return root;\n" +
        "}\n" +
        "function lowestCommonAncestor(arr, p, q) {\n" +
        "  const root = buildTree(arr);\n" +
        "  function find(node) {\n" +
        "    if (!node) return null;\n" +
        "    if (node.val === p || node.val === q) return node;\n" +
        "    const left = find(node.left);\n" +
        "    const right = find(node.right);\n" +
        "    if (left && right) return node;\n" +
        "    return left || right;\n" +
        "  }\n" +
        "  const res = find(root);\n" +
        "  return res ? res.val : null;\n" +
        "}",
    },
    {
      approach: "Iterative parent pointers + ancestor set",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n) — stores a parent pointer for every node in the tree",
      explanation:
        "Walk the whole tree once (iteratively, with a stack) recording each node's parent. Then walk p's " +
        "ancestor chain into a set, and walk q's ancestor chain until it hits something already in that set.",
      code:
        "function buildTree(arr) {\n" +
        "  if (!arr.length || arr[0] === null) return null;\n" +
        "  const root = { val: arr[0], left: null, right: null };\n" +
        "  const queue = [root];\n" +
        "  let i = 1;\n" +
        "  while (queue.length && i < arr.length) {\n" +
        "    const node = queue.shift();\n" +
        "    if (i < arr.length) {\n" +
        "      const leftVal = arr[i++];\n" +
        "      if (leftVal !== null) { node.left = { val: leftVal, left: null, right: null }; queue.push(node.left); }\n" +
        "    }\n" +
        "    if (i < arr.length) {\n" +
        "      const rightVal = arr[i++];\n" +
        "      if (rightVal !== null) { node.right = { val: rightVal, left: null, right: null }; queue.push(node.right); }\n" +
        "    }\n" +
        "  }\n" +
        "  return root;\n" +
        "}\n" +
        "function lowestCommonAncestor(arr, p, q) {\n" +
        "  const root = buildTree(arr);\n" +
        "  const parent = new Map();\n" +
        "  const stack = [root];\n" +
        "  parent.set(root, null);\n" +
        "  let pNode = null, qNode = null;\n" +
        "  while (stack.length) {\n" +
        "    const node = stack.pop();\n" +
        "    if (node.val === p) pNode = node;\n" +
        "    if (node.val === q) qNode = node;\n" +
        "    if (node.left) { parent.set(node.left, node); stack.push(node.left); }\n" +
        "    if (node.right) { parent.set(node.right, node); stack.push(node.right); }\n" +
        "  }\n" +
        "  const ancestors = new Set();\n" +
        "  let cur = pNode;\n" +
        "  while (cur) { ancestors.add(cur); cur = parent.get(cur); }\n" +
        "  cur = qNode;\n" +
        "  while (cur && !ancestors.has(cur)) cur = parent.get(cur);\n" +
        "  return cur ? cur.val : null;\n" +
        "}",
    },
  ],
};

const buildTreeFromTraversalsProblem: Problem = {
  id: "trees-construct-from-preorder-inorder",
  title: "Construct Binary Tree from Preorder and Inorder Traversal",
  difficulty: "Medium",
  description:
    "Given a tree's preorder and inorder traversal arrays (values assumed unique), rebuild the tree and " +
    "return it as a level-order array with null gaps — the same format used elsewhere in this pattern. " +
    "Preorder gives root-first ordering; inorder tells you, for any subtree, which values fall to the left " +
    "of its root and which fall to the right.",
  fnName: "buildTreeFromTraversals",
  starterCode: "function buildTreeFromTraversals(preorder, inorder) {\n  \n}",
  testCases: [
    { input: [[3, 9, 20, 15, 7], [9, 3, 15, 20, 7]], expected: [3, 9, 20, null, null, 15, 7] },
    { input: [[-1], [-1]], expected: [-1] },
    { input: [[1, 2, 3], [3, 2, 1]], expected: [1, 2, null, 3] },
  ],
  solution:
    "function serialize(root) {\n" +
    "  if (!root) return [];\n" +
    "  const result = [];\n" +
    "  const queue = [root];\n" +
    "  while (queue.length) {\n" +
    "    const node = queue.shift();\n" +
    "    if (node) { result.push(node.val); queue.push(node.left); queue.push(node.right); }\n" +
    "    else { result.push(null); }\n" +
    "  }\n" +
    "  while (result.length && result[result.length - 1] === null) result.pop();\n" +
    "  return result;\n" +
    "}\n" +
    "function buildTreeFromTraversals(preorder, inorder) {\n" +
    "  const indexMap = new Map();\n" +
    "  inorder.forEach((v, i) => indexMap.set(v, i));\n" +
    "  let preIdx = 0;\n" +
    "  function build(inLo, inHi) {\n" +
    "    if (inLo > inHi) return null;\n" +
    "    const rootVal = preorder[preIdx++];\n" +
    "    const node = { val: rootVal, left: null, right: null };\n" +
    "    const mid = indexMap.get(rootVal);\n" +
    "    node.left = build(inLo, mid - 1);\n" +
    "    node.right = build(mid + 1, inHi);\n" +
    "    return node;\n" +
    "  }\n" +
    "  return serialize(build(0, inorder.length - 1));\n" +
    "}",
  solutions: [
    {
      approach: "Hashmap-indexed recursion",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n) — the index map plus the recursion stack",
      explanation:
        "Precompute each inorder value's index in a map so the root's split point is an O(1) lookup instead " +
        "of a scan. Preorder is consumed left to right as root values; inorder bounds shrink each recursive call.",
      code:
        "function serialize(root) {\n" +
        "  if (!root) return [];\n" +
        "  const result = [];\n" +
        "  const queue = [root];\n" +
        "  while (queue.length) {\n" +
        "    const node = queue.shift();\n" +
        "    if (node) { result.push(node.val); queue.push(node.left); queue.push(node.right); }\n" +
        "    else { result.push(null); }\n" +
        "  }\n" +
        "  while (result.length && result[result.length - 1] === null) result.pop();\n" +
        "  return result;\n" +
        "}\n" +
        "function buildTreeFromTraversals(preorder, inorder) {\n" +
        "  const indexMap = new Map();\n" +
        "  inorder.forEach((v, i) => indexMap.set(v, i));\n" +
        "  let preIdx = 0;\n" +
        "  function build(inLo, inHi) {\n" +
        "    if (inLo > inHi) return null;\n" +
        "    const rootVal = preorder[preIdx++];\n" +
        "    const node = { val: rootVal, left: null, right: null };\n" +
        "    const mid = indexMap.get(rootVal);\n" +
        "    node.left = build(inLo, mid - 1);\n" +
        "    node.right = build(mid + 1, inHi);\n" +
        "    return node;\n" +
        "  }\n" +
        "  return serialize(build(0, inorder.length - 1));\n" +
        "}",
    },
    {
      approach: "Naive indexOf + slice recursion",
      timeComplexity: "O(n²)",
      spaceComplexity: "O(n²) — each recursive level slices a fresh subarray",
      explanation:
        "Instead of precomputing indices, scan for the root's position with indexOf and slice the inorder " +
        "array into left/right halves on every call. Correct, but the repeated scans and array copies add up.",
      code:
        "function serialize(root) {\n" +
        "  if (!root) return [];\n" +
        "  const result = [];\n" +
        "  const queue = [root];\n" +
        "  while (queue.length) {\n" +
        "    const node = queue.shift();\n" +
        "    if (node) { result.push(node.val); queue.push(node.left); queue.push(node.right); }\n" +
        "    else { result.push(null); }\n" +
        "  }\n" +
        "  while (result.length && result[result.length - 1] === null) result.pop();\n" +
        "  return result;\n" +
        "}\n" +
        "function buildTreeFromTraversals(preorder, inorder) {\n" +
        "  let preIdx = 0;\n" +
        "  function build(inSub) {\n" +
        "    if (!inSub.length) return null;\n" +
        "    const rootVal = preorder[preIdx++];\n" +
        "    const node = { val: rootVal, left: null, right: null };\n" +
        "    const mid = inSub.indexOf(rootVal);\n" +
        "    node.left = build(inSub.slice(0, mid));\n" +
        "    node.right = build(inSub.slice(mid + 1));\n" +
        "    return node;\n" +
        "  }\n" +
        "  return serialize(build(inorder));\n" +
        "}",
    },
  ],
};

const trees: Pattern = {
  id: "trees",
  name: "Trees",
  subpatterns: [
    {
      id: "trees-traversal",
      name: "Traversal",
      explanation:
        "Visit every node exactly once, in an order that suits the question being asked — breadth-first " +
        "level by level for shortest-path-style questions, or depth-first for questions about subtree shape.",
      problems: [levelOrderProblem],
    },
    {
      id: "trees-bst",
      name: "BST",
      explanation:
        "A binary search tree keeps every left descendant smaller and every right descendant larger than " +
        "the current node, which turns search, insert, and validity checks into O(h) operations.",
      problems: [isValidBSTProblem],
    },
    {
      id: "trees-lowest-common-ancestor",
      name: "Lowest Common Ancestor",
      explanation:
        "Find the deepest node that is an ancestor of two given nodes — the point where their paths back to " +
        "the root first converge.",
      problems: [lcaProblem],
    },
    {
      id: "trees-construction",
      name: "Construction",
      explanation:
        "Rebuild a tree from other representations, such as a pair of traversal orders — each traversal " +
        "type constrains the shape differently, and combining two is usually enough to pin it down uniquely.",
      problems: [buildTreeFromTraversalsProblem],
    },
  ],
};

const subsetsProblem: Problem = {
  id: "recursion-subsets",
  title: "Subsets",
  difficulty: "Medium",
  description:
    "Given an array of distinct integers, return every possible subset (the power set), including the " +
    "empty set and the full array itself. Order of subsets and order of elements within a subset don't matter.",
  fnName: "subsets",
  starterCode: "function subsets(nums) {\n  \n}",
  testCases: [
    { input: [[1, 2, 3]], expected: [[], [1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]] },
    { input: [[0]], expected: [[], [0]] },
    { input: [[]], expected: [[]] },
    { input: [[1, 2]], expected: [[], [1], [2], [1, 2]] },
  ],
  normalize: (x) =>
    Array.isArray(x)
      ? x
          .map((a) => (Array.isArray(a) ? [...a].sort((p, q) => p - q) : a))
          .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
      : x,
  solution:
    "function subsets(nums) {\n" +
    "  const result = [];\n" +
    "  function backtrack(start, path) {\n" +
    "    result.push([...path]);\n" +
    "    for (let i = start; i < nums.length; i++) {\n" +
    "      path.push(nums[i]);\n" +
    "      backtrack(i + 1, path);\n" +
    "      path.pop();\n" +
    "    }\n" +
    "  }\n" +
    "  backtrack(0, []);\n" +
    "  return result;\n" +
    "}",
  solutions: [
    {
      approach: "Backtracking (DFS include/exclude)",
      timeComplexity: "O(n·2ⁿ)",
      spaceComplexity: "O(n) extra — recursion depth plus the path buffer (not counting output)",
      explanation:
        "At each index, either it's in the current subset or it isn't. Record the path so far as a subset " +
        "on every call, recurse further with each remaining element added, then backtrack by removing it.",
      code:
        "function subsets(nums) {\n" +
        "  const result = [];\n" +
        "  function backtrack(start, path) {\n" +
        "    result.push([...path]);\n" +
        "    for (let i = start; i < nums.length; i++) {\n" +
        "      path.push(nums[i]);\n" +
        "      backtrack(i + 1, path);\n" +
        "      path.pop();\n" +
        "    }\n" +
        "  }\n" +
        "  backtrack(0, []);\n" +
        "  return result;\n" +
        "}",
    },
    {
      approach: "Iterative bitmask enumeration",
      timeComplexity: "O(n·2ⁿ)",
      spaceComplexity: "O(1) extra — no recursion, just a counter and an inner loop (not counting output)",
      explanation:
        "Every subset corresponds to one n-bit number: bit i set means nums[i] is included. Count from 0 to " +
        "2ⁿ-1 and read off each mask's bits to build that subset — no recursion needed at all.",
      code:
        "function subsets(nums) {\n" +
        "  const n = nums.length;\n" +
        "  const result = [];\n" +
        "  for (let mask = 0; mask < (1 << n); mask++) {\n" +
        "    const subset = [];\n" +
        "    for (let i = 0; i < n; i++) if (mask & (1 << i)) subset.push(nums[i]);\n" +
        "    result.push(subset);\n" +
        "  }\n" +
        "  return result;\n" +
        "}",
    },
  ],
};

const mergeSortProblem: Problem = {
  id: "recursion-merge-sort",
  title: "Sort an Array (Merge Sort)",
  difficulty: "Medium",
  description:
    "Given an array of integers, return it sorted in ascending order, without relying on a built-in sort.",
  fnName: "mergeSortArray",
  starterCode: "function mergeSortArray(nums) {\n  \n}",
  testCases: [
    { input: [[5, 2, 4, 1, 3]], expected: [1, 2, 3, 4, 5] },
    { input: [[]], expected: [] },
    { input: [[1]], expected: [1] },
    { input: [[3, 3, 1, 2]], expected: [1, 2, 3, 3] },
    { input: [[-5, 0, 5, -3]], expected: [-5, -3, 0, 5] },
  ],
  solution:
    "function mergeSortArray(nums) {\n" +
    "  if (nums.length <= 1) return nums.slice();\n" +
    "  const mid = Math.floor(nums.length / 2);\n" +
    "  const left = mergeSortArray(nums.slice(0, mid));\n" +
    "  const right = mergeSortArray(nums.slice(mid));\n" +
    "  const merged = [];\n" +
    "  let i = 0, j = 0;\n" +
    "  while (i < left.length && j < right.length) {\n" +
    "    if (left[i] <= right[j]) merged.push(left[i++]); else merged.push(right[j++]);\n" +
    "  }\n" +
    "  while (i < left.length) merged.push(left[i++]);\n" +
    "  while (j < right.length) merged.push(right[j++]);\n" +
    "  return merged;\n" +
    "}",
  solutions: [
    {
      approach: "Merge sort (divide & conquer)",
      timeComplexity: "O(n log n)",
      spaceComplexity: "O(n) — merged output buffers at every level",
      explanation:
        "Split the array in half, recursively sort each half, then merge the two sorted halves with a " +
        "single linear pass. The split always happens in the middle, so recursion depth is log n.",
      code:
        "function mergeSortArray(nums) {\n" +
        "  if (nums.length <= 1) return nums.slice();\n" +
        "  const mid = Math.floor(nums.length / 2);\n" +
        "  const left = mergeSortArray(nums.slice(0, mid));\n" +
        "  const right = mergeSortArray(nums.slice(mid));\n" +
        "  const merged = [];\n" +
        "  let i = 0, j = 0;\n" +
        "  while (i < left.length && j < right.length) {\n" +
        "    if (left[i] <= right[j]) merged.push(left[i++]); else merged.push(right[j++]);\n" +
        "  }\n" +
        "  while (i < left.length) merged.push(left[i++]);\n" +
        "  while (j < right.length) merged.push(right[j++]);\n" +
        "  return merged;\n" +
        "}",
    },
    {
      approach: "Insertion sort (brute force)",
      timeComplexity: "O(n²)",
      spaceComplexity: "O(1) extra — sorts in place aside from the initial copy",
      explanation:
        "Grow a sorted prefix one element at a time: take the next element and shift it leftward past every " +
        "already-sorted element bigger than it. Simple, but quadratic on average and worst case.",
      code:
        "function mergeSortArray(nums) {\n" +
        "  const arr = nums.slice();\n" +
        "  for (let i = 1; i < arr.length; i++) {\n" +
        "    let j = i, cur = arr[i];\n" +
        "    while (j > 0 && arr[j - 1] > cur) { arr[j] = arr[j - 1]; j--; }\n" +
        "    arr[j] = cur;\n" +
        "  }\n" +
        "  return arr;\n" +
        "}",
    },
  ],
};

const maxDepthProblem: Problem = {
  id: "recursion-max-depth",
  title: "Maximum Depth of Binary Tree",
  difficulty: "Easy",
  description:
    "Given a binary tree (level-order array with null gaps), return its maximum depth — the number of nodes " +
    "along the longest path from the root down to the farthest leaf.",
  fnName: "maxDepth",
  starterCode: "function maxDepth(arr) {\n  \n}",
  testCases: [
    { input: [[3, 9, 20, null, null, 15, 7]], expected: 3 },
    { input: [[1, null, 2]], expected: 2 },
    { input: [[]], expected: 0 },
    { input: [[1]], expected: 1 },
  ],
  solution:
    "function buildTree(arr) {\n" +
    "  if (!arr.length || arr[0] === null) return null;\n" +
    "  const root = { val: arr[0], left: null, right: null };\n" +
    "  const queue = [root];\n" +
    "  let i = 1;\n" +
    "  while (queue.length && i < arr.length) {\n" +
    "    const node = queue.shift();\n" +
    "    if (i < arr.length) {\n" +
    "      const leftVal = arr[i++];\n" +
    "      if (leftVal !== null) { node.left = { val: leftVal, left: null, right: null }; queue.push(node.left); }\n" +
    "    }\n" +
    "    if (i < arr.length) {\n" +
    "      const rightVal = arr[i++];\n" +
    "      if (rightVal !== null) { node.right = { val: rightVal, left: null, right: null }; queue.push(node.right); }\n" +
    "    }\n" +
    "  }\n" +
    "  return root;\n" +
    "}\n" +
    "function maxDepth(arr) {\n" +
    "  const root = buildTree(arr);\n" +
    "  function depth(node) { return node ? 1 + Math.max(depth(node.left), depth(node.right)) : 0; }\n" +
    "  return depth(root);\n" +
    "}",
  solutions: [
    {
      approach: "Recursive DFS",
      timeComplexity: "O(n)",
      spaceComplexity: "O(h) recursion stack (tree height h)",
      explanation:
        "A subtree's depth is 1 plus the deeper of its two children's depths. An empty tree has depth 0 — " +
        "the base case that makes the recursion bottom out.",
      code:
        "function buildTree(arr) {\n" +
        "  if (!arr.length || arr[0] === null) return null;\n" +
        "  const root = { val: arr[0], left: null, right: null };\n" +
        "  const queue = [root];\n" +
        "  let i = 1;\n" +
        "  while (queue.length && i < arr.length) {\n" +
        "    const node = queue.shift();\n" +
        "    if (i < arr.length) {\n" +
        "      const leftVal = arr[i++];\n" +
        "      if (leftVal !== null) { node.left = { val: leftVal, left: null, right: null }; queue.push(node.left); }\n" +
        "    }\n" +
        "    if (i < arr.length) {\n" +
        "      const rightVal = arr[i++];\n" +
        "      if (rightVal !== null) { node.right = { val: rightVal, left: null, right: null }; queue.push(node.right); }\n" +
        "    }\n" +
        "  }\n" +
        "  return root;\n" +
        "}\n" +
        "function maxDepth(arr) {\n" +
        "  const root = buildTree(arr);\n" +
        "  function depth(node) { return node ? 1 + Math.max(depth(node.left), depth(node.right)) : 0; }\n" +
        "  return depth(root);\n" +
        "}",
    },
    {
      approach: "Iterative BFS, counting levels",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n) — the queue can hold a full level's worth of nodes",
      explanation:
        "Process the tree level by level with a queue, incrementing a counter once per level. The final " +
        "count, once the queue empties, is the depth.",
      code:
        "function buildTree(arr) {\n" +
        "  if (!arr.length || arr[0] === null) return null;\n" +
        "  const root = { val: arr[0], left: null, right: null };\n" +
        "  const queue = [root];\n" +
        "  let i = 1;\n" +
        "  while (queue.length && i < arr.length) {\n" +
        "    const node = queue.shift();\n" +
        "    if (i < arr.length) {\n" +
        "      const leftVal = arr[i++];\n" +
        "      if (leftVal !== null) { node.left = { val: leftVal, left: null, right: null }; queue.push(node.left); }\n" +
        "    }\n" +
        "    if (i < arr.length) {\n" +
        "      const rightVal = arr[i++];\n" +
        "      if (rightVal !== null) { node.right = { val: rightVal, left: null, right: null }; queue.push(node.right); }\n" +
        "    }\n" +
        "  }\n" +
        "  return root;\n" +
        "}\n" +
        "function maxDepth(arr) {\n" +
        "  const root = buildTree(arr);\n" +
        "  if (!root) return 0;\n" +
        "  let d = 0;\n" +
        "  let queue = [root];\n" +
        "  while (queue.length) {\n" +
        "    d++;\n" +
        "    const next = [];\n" +
        "    for (const node of queue) { if (node.left) next.push(node.left); if (node.right) next.push(node.right); }\n" +
        "    queue = next;\n" +
        "  }\n" +
        "  return d;\n" +
        "}",
    },
  ],
};

const fibProblem: Problem = {
  id: "recursion-fibonacci",
  title: "Fibonacci Number",
  difficulty: "Easy",
  description:
    "Given n, return the n-th Fibonacci number (fib(0) = 0, fib(1) = 1, fib(n) = fib(n-1) + fib(n-2)).",
  fnName: "fib",
  starterCode: "function fib(n) {\n  \n}",
  testCases: [
    { input: [0], expected: 0 },
    { input: [1], expected: 1 },
    { input: [5], expected: 5 },
    { input: [10], expected: 55 },
    { input: [15], expected: 610 },
  ],
  solution:
    "function fib(n) {\n" +
    "  if (n <= 1) return n;\n" +
    "  return fib(n - 1) + fib(n - 2);\n" +
    "}",
  solutions: [
    {
      approach: "Naive recursion",
      timeComplexity: "O(2ⁿ)",
      spaceComplexity: "O(n) recursion stack",
      explanation:
        "Directly translate the recurrence into code. Correct, but fib(k) gets recomputed from scratch " +
        "every time it's needed by a different branch — the call tree's size explodes exponentially.",
      code:
        "function fib(n) {\n" +
        "  if (n <= 1) return n;\n" +
        "  return fib(n - 1) + fib(n - 2);\n" +
        "}",
    },
    {
      approach: "Top-down memoization",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n) — memo table plus recursion stack",
      explanation:
        "Same recursive structure, but cache each fib(k) the first time it's computed. Every subsequent " +
        "call for that k is an O(1) lookup instead of a re-derivation, collapsing the exponential blowup.",
      code:
        "function fib(n) {\n" +
        "  const memo = new Map();\n" +
        "  function helper(k) {\n" +
        "    if (k <= 1) return k;\n" +
        "    if (memo.has(k)) return memo.get(k);\n" +
        "    const result = helper(k - 1) + helper(k - 2);\n" +
        "    memo.set(k, result);\n" +
        "    return result;\n" +
        "  }\n" +
        "  return helper(n);\n" +
        "}",
    },
  ],
};

const recursion: Pattern = {
  id: "recursion",
  name: "Recursion",
  subpatterns: [
    {
      id: "recursion-backtracking",
      name: "Backtracking",
      explanation:
        "Explore a decision tree by choosing, recursing, then undoing the choice ('backtracking') to try " +
        "the next option — useful whenever you need every valid combination, permutation, or arrangement.",
      problems: [subsetsProblem],
    },
    {
      id: "recursion-divide-and-conquer",
      name: "Divide & Conquer",
      explanation:
        "Split a problem into independent subproblems, solve each recursively, then combine their results — " +
        "the combine step is what separates this from plain recursion.",
      problems: [mergeSortProblem],
    },
    {
      id: "recursion-tree-graph-recursion",
      name: "Tree/Graph Recursion",
      explanation:
        "Recursion mirrors a tree's or graph's own recursive structure: a node's answer is defined in terms " +
        "of its children's answers, with the base case being an empty (null) node.",
      problems: [maxDepthProblem],
    },
    {
      id: "recursion-memoization",
      name: "Memoization",
      explanation:
        "Cache the result of each unique recursive call so overlapping subproblems are computed once instead " +
        "of repeatedly — the fix for recursion trees that revisit the same inputs exponentially often.",
      problems: [fibProblem],
    },
  ],
};

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
