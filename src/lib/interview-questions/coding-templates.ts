import type { InterviewQuestionItem } from '@/lib/interview-questions/schema'
import type { Difficulty } from '@/lib/interview-questions/difficulty'
import { normalizeAnswerKey } from '@/lib/interview-questions/answer-keys'

type CodingTemplate = {
  topic: string
  title: string
  difficulty: Difficulty
  functionName: string
  starterCode: string
  question: string
  publicTests: Array<{ input: string; expected: string }>
  hiddenTests: Array<{ input: string; expected: string }>
}

/** LeetCode-style JS problems with judge-compatible tests (args as JSON array). */
export const CODING_PROBLEM_BANK: CodingTemplate[] = [
  {
    topic: 'Arrays',
    title: 'Two Sum',
    difficulty: 'Easy',
    functionName: 'twoSum',
    starterCode: `function twoSum(nums, target) {
  // return indices of the two numbers that add up to target
}
`,
    question: `## Two Sum

Given an array of integers \`nums\` and an integer \`target\`, return **indices** of the two numbers such that they add up to \`target\`.

You may assume each input has **exactly one** solution, and you may not use the same element twice.

### Example
- Input: \`nums = [2,7,11,15]\`, \`target = 9\`
- Output: \`[0,1]\`
- Explanation: \`nums[0] + nums[1] == 9\`

### Constraints
- \`2 <= nums.length <= 10^4\`
- Only one valid answer exists.

### Follow-up
Can you do it in \`O(n)\` time?`,
    publicTests: [
      { input: '[[2,7,11,15],9]', expected: '[0,1]' },
      { input: '[[3,2,4],6]', expected: '[1,2]' },
    ],
    hiddenTests: [{ input: '[[3,3],6]', expected: '[0,1]' }],
  },
  {
    topic: 'Arrays',
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    functionName: 'maxSubArray',
    starterCode: `function maxSubArray(nums) {
  // return the largest sum of any contiguous subarray
}
`,
    question: `## Maximum Subarray (Kadane)

Given an integer array \`nums\`, find the contiguous subarray (containing at least one number) which has the largest sum and return **that sum**.

### Example
- Input: \`nums = [-2,1,-3,4,-1,2,1,-5,4]\`
- Output: \`6\`
- Explanation: \`[4,-1,2,1]\` has the largest sum \`6\`.

### Constraints
- \`1 <= nums.length <= 10^5\``,
    publicTests: [
      { input: '[[-2,1,-3,4,-1,2,1,-5,4]]', expected: '6' },
      { input: '[[1]]', expected: '1' },
    ],
    hiddenTests: [{ input: '[[5,4,-1,7,8]]', expected: '23' }],
  },
  {
    topic: 'Arrays',
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    functionName: 'maxProfit',
    starterCode: `function maxProfit(prices) {
  // return max profit from one buy and one sell
}
`,
    question: `## Best Time to Buy and Sell Stock

You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i\`th day.

You want to maximize your profit by choosing a **single day** to buy and a **different day in the future** to sell.

Return the maximum profit. If you cannot achieve any profit, return \`0\`.

### Example
- Input: \`prices = [7,1,5,3,6,4]\`
- Output: \`5\`
- Explanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6).`,
    publicTests: [
      { input: '[[7,1,5,3,6,4]]', expected: '5' },
      { input: '[[7,6,4,3,1]]', expected: '0' },
    ],
    hiddenTests: [{ input: '[[2,4,1]]', expected: '2' }],
  },
  {
    topic: 'Arrays',
    title: 'Product of Array Except Self',
    difficulty: 'Medium',
    functionName: 'productExceptSelf',
    starterCode: `function productExceptSelf(nums) {
  // return array answer where answer[i] is product of all except nums[i]
}
`,
    question: `## Product of Array Except Self

Given an integer array \`nums\`, return an array \`answer\` such that \`answer[i]\` is equal to the product of all the elements of \`nums\` except \`nums[i]\`.

The product of any prefix or suffix of \`nums\` is **guaranteed** to fit in a 32-bit integer.

You must write an algorithm that runs in \`O(n)\` time and without using the division operation.

### Example
- Input: \`nums = [1,2,3,4]\`
- Output: \`[24,12,8,6]\``,
    publicTests: [
      { input: '[[1,2,3,4]]', expected: '[24,12,8,6]' },
      { input: '[[-1,1,0,-3,3]]', expected: '[0,0,9,0,0]' },
    ],
    hiddenTests: [{ input: '[[2,3]]', expected: '[3,2]' }],
  },
  {
    topic: 'Arrays',
    title: 'Move Zeroes',
    difficulty: 'Easy',
    functionName: 'moveZeroes',
    starterCode: `function moveZeroes(nums) {
  // move all 0s to the end in-place; return the array
}
`,
    question: `## Move Zeroes

Given an integer array \`nums\`, move all \`0\`s to the end of it while maintaining the relative order of the non-zero elements.

**Note** that you must do this in-place without making a copy of the array. Return \`nums\` after modification.

### Example
- Input: \`nums = [0,1,0,3,12]\`
- Output: \`[1,3,12,0,0]\``,
    publicTests: [
      { input: '[[0,1,0,3,12]]', expected: '[1,3,12,0,0]' },
      { input: '[[0]]', expected: '[0]' },
    ],
    hiddenTests: [{ input: '[[1,0]]', expected: '[1,0]' }],
  },
  {
    topic: 'Arrays',
    title: 'Rotate Array',
    difficulty: 'Medium',
    functionName: 'rotate',
    starterCode: `function rotate(nums, k) {
  // rotate the array to the right by k steps; return nums
}
`,
    question: `## Rotate Array

Given an integer array \`nums\`, rotate the array to the right by \`k\` steps, where \`k\` is non-negative.

Return the rotated array (in-place mutation is fine).

### Example
- Input: \`nums = [1,2,3,4,5,6,7]\`, \`k = 3\`
- Output: \`[5,6,7,1,2,3,4]\``,
    publicTests: [
      { input: '[[1,2,3,4,5,6,7],3]', expected: '[5,6,7,1,2,3,4]' },
      { input: '[[-1,-100,3,99],2]', expected: '[3,99,-1,-100]' },
    ],
    hiddenTests: [{ input: '[[1,2],3]', expected: '[2,1]' }],
  },
  {
    topic: 'Arrays',
    title: 'Find Missing Number',
    difficulty: 'Easy',
    functionName: 'missingNumber',
    starterCode: `function missingNumber(nums) {
  // return the missing number in [0..n]
}
`,
    question: `## Missing Number

Given an array \`nums\` containing \`n\` distinct numbers in the range \`[0, n]\`, return the only number in the range that is missing from the array.

### Example
- Input: \`nums = [3,0,1]\`
- Output: \`2\``,
    publicTests: [
      { input: '[[3,0,1]]', expected: '2' },
      { input: '[[0,1]]', expected: '2' },
    ],
    hiddenTests: [{ input: '[[9,6,4,2,3,5,7,0,1]]', expected: '8' }],
  },
  {
    topic: 'Arrays',
    title: 'Merge Sorted Array',
    difficulty: 'Easy',
    functionName: 'merge',
    starterCode: `function merge(nums1, m, nums2, n) {
  // merge nums2 into nums1 in-place; return nums1
}
`,
    question: `## Merge Sorted Array

You are given two integer arrays \`nums1\` and \`nums2\`, sorted in non-decreasing order, and two integers \`m\` and \`n\`, representing the number of elements in \`nums1\` and \`nums2\` respectively.

Merge \`nums2\` into \`nums1\` as one sorted array. \`nums1\` has length \`m + n\` with trailing zeroes as placeholders. Return \`nums1\` after merge.

### Example
- Input: \`nums1 = [1,2,3,0,0,0]\`, \`m = 3\`, \`nums2 = [2,5,6]\`, \`n = 3\`
- Output: \`[1,2,2,3,5,6]\``,
    publicTests: [
      { input: '[[1,2,3,0,0,0],3,[2,5,6],3]', expected: '[1,2,2,3,5,6]' },
      { input: '[[1],1,[],0]', expected: '[1]' },
    ],
    hiddenTests: [{ input: '[[0],0,[1],1]', expected: '[1]' }],
  },
  {
    topic: 'Arrays',
    title: 'Majority Element',
    difficulty: 'Easy',
    functionName: 'majorityElement',
    starterCode: `function majorityElement(nums) {
  // return the majority element (appears > n/2 times)
}
`,
    question: `## Majority Element

Given an array \`nums\` of size \`n\`, return the **majority element**.

The majority element is the element that appears more than \`⌊n / 2⌋\` times. You may assume it always exists.

### Example
- Input: \`nums = [3,2,3]\`
- Output: \`3\``,
    publicTests: [
      { input: '[[3,2,3]]', expected: '3' },
      { input: '[[2,2,1,1,1,2,2]]', expected: '2' },
    ],
    hiddenTests: [{ input: '[[1]]', expected: '1' }],
  },
  {
    topic: 'Arrays',
    title: 'Remove Duplicates from Sorted Array',
    difficulty: 'Easy',
    functionName: 'removeDuplicates',
    starterCode: `function removeDuplicates(nums) {
  // return the count of unique elements after in-place dedupe
}
`,
    question: `## Remove Duplicates from Sorted Array

Given an integer array \`nums\` sorted in non-decreasing order, remove the duplicates **in-place** such that each unique element appears only once. Return the number of unique elements \`k\`.

The first \`k\` elements of \`nums\` should hold the unique values in order (the judge only checks the returned \`k\`).

### Example
- Input: \`nums = [1,1,2]\`
- Output: \`2\``,
    publicTests: [
      { input: '[[1,1,2]]', expected: '2' },
      { input: '[[0,0,1,1,1,2,2,3,3,4]]', expected: '5' },
    ],
    hiddenTests: [{ input: '[[1,2,3]]', expected: '3' }],
  },
  {
    topic: 'Arrays',
    title: 'Plus One',
    difficulty: 'Easy',
    functionName: 'plusOne',
    starterCode: `function plusOne(digits) {
  // increment the large integer represented by digits; return digits
}
`,
    question: `## Plus One

You are given a large integer represented as an integer array \`digits\`, where each \`digits[i]\` is the \`i\`th digit. Digits are ordered from most to least significant.

Increment the large integer by one and return the resulting array of digits.

### Example
- Input: \`digits = [1,2,3]\`
- Output: \`[1,2,4]\``,
    publicTests: [
      { input: '[[1,2,3]]', expected: '[1,2,4]' },
      { input: '[[9]]', expected: '[1,0]' },
    ],
    hiddenTests: [{ input: '[[9,9]]', expected: '[1,0,0]' }],
  },
  {
    topic: 'Arrays',
    title: 'Single Number',
    difficulty: 'Easy',
    functionName: 'singleNumberArray',
    starterCode: `function singleNumberArray(nums) {
  // every element appears twice except one; return that one
}
`,
    question: `## Single Number (Arrays)

Given a non-empty array of integers \`nums\`, every element appears **twice** except for one. Find that single one.

You must implement a solution with linear runtime and constant extra space (XOR is fine).

### Example
- Input: \`nums = [2,2,1]\`
- Output: \`1\``,
    publicTests: [
      { input: '[[2,2,1]]', expected: '1' },
      { input: '[[4,1,2,1,2]]', expected: '4' },
    ],
    hiddenTests: [{ input: '[[1]]', expected: '1' }],
  },
  {
    topic: 'Hashing',
    title: 'Two Sum Hash Map',
    difficulty: 'Easy',
    functionName: 'twoSumHash',
    starterCode: `function twoSumHash(nums, target) {
  // same as Two Sum; prefer hash map O(n)
}
`,
    question: `## Two Sum (Hash Map)

Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

Assume exactly one solution. Prefer an \`O(n)\` hash map approach.

### Example
- Input: \`nums = [2,7,11,15]\`, \`target = 9\`
- Output: \`[0,1]\``,
    publicTests: [
      { input: '[[2,7,11,15],9]', expected: '[0,1]' },
      { input: '[[3,2,4],6]', expected: '[1,2]' },
    ],
    hiddenTests: [{ input: '[[3,3],6]', expected: '[0,1]' }],
  },
  {
    topic: 'Two Pointers',
    title: 'Container With Most Water',
    difficulty: 'Medium',
    functionName: 'maxArea',
    starterCode: `function maxArea(height) {
  // return max water area between two lines
}
`,
    question: `## Container With Most Water

You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines such that the two endpoints of the \`i\`th line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container such that the container contains the most water. Return the maximum amount of water.

### Example
- Input: \`height = [1,8,6,2,5,4,8,3,7]\`
- Output: \`49\``,
    publicTests: [
      { input: '[[1,8,6,2,5,4,8,3,7]]', expected: '49' },
      { input: '[[1,1]]', expected: '1' },
    ],
    hiddenTests: [{ input: '[[4,3,2,1,4]]', expected: '16' }],
  },
  {
    topic: 'Sliding Window',
    title: 'Longest Repeating Character Replacement',
    difficulty: 'Medium',
    functionName: 'characterReplacement',
    starterCode: `function characterReplacement(s, k) {
  // return length of longest substring after at most k replacements
}
`,
    question: `## Longest Repeating Character Replacement

You are given a string \`s\` and an integer \`k\`. You can choose any character of the string and change it to any other uppercase English character. You can perform this operation at most \`k\` times.

Return the length of the longest substring containing the same letter you can get after performing the above operations.

### Example
- Input: \`s = "ABAB"\`, \`k = 2\`
- Output: \`4\``,
    publicTests: [
      { input: '["ABAB",2]', expected: '4' },
      { input: '["AABABBA",1]', expected: '4' },
    ],
    hiddenTests: [{ input: '["AAAA",2]', expected: '4' }],
  },
  {
    topic: 'Binary Search',
    title: 'Search Insert Position',
    difficulty: 'Easy',
    functionName: 'searchInsert',
    starterCode: `function searchInsert(nums, target) {
  // return index if found, else insert index
}
`,
    question: `## Search Insert Position

Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if inserted in order.

You must write an algorithm with \`O(log n)\` runtime complexity.

### Example
- Input: \`nums = [1,3,5,6]\`, \`target = 5\`
- Output: \`2\``,
    publicTests: [
      { input: '[[1,3,5,6],5]', expected: '2' },
      { input: '[[1,3,5,6],2]', expected: '1' },
    ],
    hiddenTests: [{ input: '[[1,3,5,6],7]', expected: '4' }],
  },
  {
    topic: 'Stacks',
    title: 'Min Stack Top',
    difficulty: 'Medium',
    functionName: 'evalRPN',
    starterCode: `function evalRPN(tokens) {
  // evaluate Reverse Polish Notation; return the integer result
}
`,
    question: `## Evaluate Reverse Polish Notation

You are given an array of strings \`tokens\` that represents an arithmetic expression in Reverse Polish Notation.

Evaluate the expression. The valid operators are \`+\`, \`-\`, \`*\`, and \`/\`. Division truncates toward zero.

### Example
- Input: \`tokens = ["2","1","+","3","*"]\`
- Output: \`9\`
- Explanation: \`((2 + 1) * 3) = 9\``,
    publicTests: [
      { input: '[["2","1","+","3","*"]]', expected: '9' },
      { input: '[["4","13","5","/","+"]]', expected: '6' },
    ],
    hiddenTests: [{ input: '[["10","6","9","3","+","-11","*","/","*","17","+","5","+"]]', expected: '22' }],
  },
  {
    topic: 'Dynamic Programming',
    title: 'House Robber',
    difficulty: 'Medium',
    functionName: 'rob',
    starterCode: `function rob(nums) {
  // return max amount you can rob without adjacent houses
}
`,
    question: `## House Robber

You are a professional robber planning to rob houses along a street. Each house has a certain amount of money. Adjacent houses have security systems connected — you cannot rob two adjacent houses.

Given an integer array \`nums\` representing the amount of money of each house, return the maximum amount you can rob tonight.

### Example
- Input: \`nums = [1,2,3,1]\`
- Output: \`4\``,
    publicTests: [
      { input: '[[1,2,3,1]]', expected: '4' },
      { input: '[[2,7,9,3,1]]', expected: '12' },
    ],
    hiddenTests: [{ input: '[[2,1,1,2]]', expected: '4' }],
  },
  {
    topic: 'Recursion',
    title: 'Pow(x, n)',
    difficulty: 'Medium',
    functionName: 'myPow',
    starterCode: `function myPow(x, n) {
  // return x raised to the power n
}
`,
    question: `## Pow(x, n)

Implement \`pow(x, n)\`, which calculates \`x\` raised to the power \`n\` (i.e., \`x^n\`).

### Example
- Input: \`x = 2.00000\`, \`n = 10\`
- Output: \`1024\`

For the judge, return the exact numeric result for the given cases.`,
    publicTests: [
      { input: '[2,10]', expected: '1024' },
      { input: '[2,-2]', expected: '0.25' },
    ],
    hiddenTests: [{ input: '[2,0]', expected: '1' }],
  },
  {
    topic: 'Greedy',
    title: 'Jump Game II',
    difficulty: 'Medium',
    functionName: 'jump',
    starterCode: `function jump(nums) {
  // return the minimum number of jumps to reach the last index
}
`,
    question: `## Jump Game II

You are given a 0-indexed array of integers \`nums\` of length \`n\`. You are initially at \`nums[0]\`.

Each element \`nums[i]\` represents the maximum length of a forward jump from index \`i\`. Return the minimum number of jumps to reach \`nums[n - 1]\`. The test cases are generated so that you can always reach the last index.

### Example
- Input: \`nums = [2,3,1,1,4]\`
- Output: \`2\``,
    publicTests: [
      { input: '[[2,3,1,1,4]]', expected: '2' },
      { input: '[[2,3,0,1,4]]', expected: '2' },
    ],
    hiddenTests: [{ input: '[[1]]', expected: '0' }],
  },
  {
    topic: 'Sorting',
    title: 'Kth Largest via Sort',
    difficulty: 'Medium',
    functionName: 'findKthLargestSort',
    starterCode: `function findKthLargestSort(nums, k) {
  // return the kth largest element in the array
}
`,
    question: `## Kth Largest Element in an Array

Given an integer array \`nums\` and an integer \`k\`, return the \`k\`th largest element in the array.

Note that it is the \`k\`th largest element in the sorted order, not the \`k\`th distinct element.

### Example
- Input: \`nums = [3,2,1,5,6,4]\`, \`k = 2\`
- Output: \`5\``,
    publicTests: [
      { input: '[[3,2,1,5,6,4],2]', expected: '5' },
      { input: '[[3,2,3,1,2,4,5,5,6],4]', expected: '4' },
    ],
    hiddenTests: [{ input: '[[1],1]', expected: '1' }],
  },
  {
    topic: 'Searching',
    title: 'Find Peak Element',
    difficulty: 'Medium',
    functionName: 'findPeakElement',
    starterCode: `function findPeakElement(nums) {
  // return any peak index
}
`,
    question: `## Find Peak Element

A peak element is an element that is strictly greater than its neighbors.

Given a 0-indexed integer array \`nums\`, find a peak element, and return its index. If the array contains multiple peaks, return the index to **any** of the peaks.

You may imagine that \`nums[-1] = nums[n] = -∞\`. For the judge cases there is a unique peak.

### Example
- Input: \`nums = [1,2,3,1]\`
- Output: \`2\``,
    publicTests: [
      { input: '[[1,2,3,1]]', expected: '2' },
      { input: '[[1,2,1,3,5,6,4]]', expected: '5' },
    ],
    hiddenTests: [{ input: '[[1]]', expected: '0' }],
  },
  {
    topic: 'Queues',
    title: 'Number of Recent Calls (window)',
    difficulty: 'Easy',
    functionName: 'countRecent',
    starterCode: `function countRecent(pings, t) {
  // return how many pings in pings are in [t-3000, t]
}
`,
    question: `## Number of Recent Calls (batch)

Given a sorted array \`pings\` of request times and a time \`t\`, return how many requests have occurred in the inclusive range \`[t - 3000, t]\`.

### Example
- Input: \`pings = [1,100,3001,3002]\`, \`t = 3002\`
- Output: \`3\``,
    publicTests: [
      { input: '[[1,100,3001,3002],3002]', expected: '3' },
      { input: '[[1],1]', expected: '1' },
    ],
    hiddenTests: [{ input: '[[1,2,3001],3001]', expected: '2' }],
  },
  {
    topic: 'Trees',
    title: 'Same Tree (arrays)',
    difficulty: 'Easy',
    functionName: 'isSameTreeArrays',
    starterCode: `function isSameTreeArrays(p, q) {
  // p and q are level-order arrays with null for missing nodes; return true if identical
}
`,
    question: `## Same Tree (array encoding)

You are given two binary trees encoded as level-order arrays \`p\` and \`q\` (use \`null\` for missing children in the JSON). Return \`true\` if they are structurally identical with the same node values.

For these tests, compare the arrays with deep equality after normalizing trailing nulls is **not** required — compare the provided arrays for equality of structure as given.

### Example
- Input: \`p = [1,2,3]\`, \`q = [1,2,3]\`
- Output: \`true\``,
    publicTests: [
      { input: '[[1,2,3],[1,2,3]]', expected: 'true' },
      { input: '[[1,2],[1,null,2]]', expected: 'false' },
    ],
    hiddenTests: [{ input: '[[1,2,1],[1,1,2]]', expected: 'false' }],
  },
  {
    topic: 'Backtracking',
    title: 'Letter Combinations Count',
    difficulty: 'Medium',
    functionName: 'letterCombinationsCount',
    starterCode: `function letterCombinationsCount(digits) {
  // return how many letter combinations digits can form (phone pad)
}
`,
    question: `## Letter Combinations of a Phone Number (count)

Given a string containing digits from \`2-9\` inclusive, return **how many** letter combinations the number could represent (standard phone pad mapping). Empty digits → \`0\`.

Mapping: 2=abc, 3=def, 4=ghi, 5=jkl, 6=mno, 7=pqrs, 8=tuv, 9=wxyz.

### Example
- Input: \`digits = "23"\`
- Output: \`9\``,
    publicTests: [
      { input: '["23"]', expected: '9' },
      { input: '[""]', expected: '0' },
    ],
    hiddenTests: [{ input: '["2"]', expected: '3' }],
  },
  {
    topic: 'Bit Manipulation',
    title: 'Hamming Weight',
    difficulty: 'Easy',
    functionName: 'hammingWeight',
    starterCode: `function hammingWeight(n) {
  // return number of set bits in n
}
`,
    question: `## Number of 1 Bits

Write a function that takes an unsigned integer and returns the number of \`1\` bits it has (also known as the Hamming weight).

### Example
- Input: \`n = 11\` (\`1011\`)
- Output: \`3\``,
    publicTests: [
      { input: '[11]', expected: '3' },
      { input: '[128]', expected: '1' },
    ],
    hiddenTests: [{ input: '[0]', expected: '0' }],
  },
  {
    topic: 'Heap / Priority Queue',
    title: 'Last Stone Weight',
    difficulty: 'Easy',
    functionName: 'lastStoneWeight',
    starterCode: `function lastStoneWeight(stones) {
  // smash heaviest two until <=1 stone remains; return weight or 0
}
`,
    question: `## Last Stone Weight

You are given an array of integers \`stones\` where \`stones[i]\` is the weight of the \`i\`th stone.

We smash the two heaviest stones. If \`x == y\`, both destroyed; if \`x != y\`, a stone of weight \`|x - y|\` is left. Continue until at most one stone remains. Return the smallest possible weight of the left stone (or \`0\`).

### Example
- Input: \`stones = [2,7,4,1,8,1]\`
- Output: \`1\``,
    publicTests: [
      { input: '[[2,7,4,1,8,1]]', expected: '1' },
      { input: '[[1]]', expected: '1' },
    ],
    hiddenTests: [{ input: '[[1,1]]', expected: '0' }],
  },
  {
    topic: 'Graphs',
    title: 'Find Center of Star Graph',
    difficulty: 'Easy',
    functionName: 'findCenter',
    starterCode: `function findCenter(edges) {
  // return the center node of the star graph
}
`,
    question: `## Find Center of Star Graph

There is an undirected star graph with \`n\` nodes labeled from \`1\` to \`n\`. A star graph is a graph where there is one center node and exactly \`n - 1\` edges connecting the center to every other node.

You are given a 2D integer array \`edges\` where each \`edges[i] = [ui, vi]\` indicates an edge. Return the center of the given star graph.

### Example
- Input: \`edges = [[1,2],[2,3],[4,2]]\`
- Output: \`2\``,
    publicTests: [
      { input: '[[[1,2],[2,3],[4,2]]]', expected: '2' },
      { input: '[[[1,2],[5,1],[1,3],[1,4]]]', expected: '1' },
    ],
    hiddenTests: [{ input: '[[[1,2],[1,3]]]', expected: '1' }],
  },
  {
    topic: 'Linked Lists',
    title: 'Merge Two Sorted Lists (arrays)',
    difficulty: 'Easy',
    functionName: 'mergeTwoLists',
    starterCode: `function mergeTwoLists(list1, list2) {
  // list1/list2 are sorted arrays; return merged sorted array
}
`,
    question: `## Merge Two Sorted Lists (array form)

You are given the heads of two sorted linked lists as arrays \`list1\` and \`list2\`. Merge them into one sorted list and return it as an array.

### Example
- Input: \`list1 = [1,2,4]\`, \`list2 = [1,3,4]\`
- Output: \`[1,1,2,3,4,4]\``,
    publicTests: [
      { input: '[[1,2,4],[1,3,4]]', expected: '[1,1,2,3,4,4]' },
      { input: '[[], []]', expected: '[]' },
    ],
    hiddenTests: [{ input: '[[],[0]]', expected: '[0]' }],
  },
  {
    topic: 'Strings',
    title: 'Reverse Words',
    difficulty: 'Medium',
    functionName: 'reverseWords',
    starterCode: `function reverseWords(s) {
  // reverse the order of words; trim and collapse spaces
}
`,
    question: `## Reverse Words in a String

Given an input string \`s\`, reverse the order of the words. A word is a sequence of non-space characters. Return a string of words in reverse order concatenated by a single space. Leading/trailing spaces should be removed.

### Example
- Input: \`s = "the sky is blue"\`
- Output: \`"blue is sky the"\``,
    publicTests: [
      { input: '["the sky is blue"]', expected: '"blue is sky the"' },
      { input: '["  hello world  "]', expected: '"world hello"' },
    ],
    hiddenTests: [{ input: '["a good   example"]', expected: '"example good a"' }],
  },

  {
    topic: 'Strings',
    title: 'Valid Anagram',
    difficulty: 'Easy',
    functionName: 'isAnagram',
    starterCode: `function isAnagram(s, t) {
  // return true if t is an anagram of s
}
`,
    question: `## Valid Anagram

Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`, and \`false\` otherwise.

An **anagram** is a word formed by rearranging the letters of another word, using all original letters exactly once.

### Example
- Input: \`s = "anagram"\`, \`t = "nagaram"\`
- Output: \`true\`

### Constraints
- \`1 <= s.length, t.length <= 5 * 10^4\`
- \`s\` and \`t\` consist of lowercase English letters.`,
    publicTests: [
      { input: '["anagram","nagaram"]', expected: 'true' },
      { input: '["rat","car"]', expected: 'false' },
    ],
    hiddenTests: [{ input: '["a","ab"]', expected: 'false' }],
  },
  {
    topic: 'Strings',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    functionName: 'lengthOfLongestSubstring',
    starterCode: `function lengthOfLongestSubstring(s) {
  // return length of longest substring without repeating characters
}
`,
    question: `## Longest Substring Without Repeating Characters

Given a string \`s\`, find the length of the **longest substring** without repeating characters.

### Example
- Input: \`s = "abcabcbb"\`
- Output: \`3\`
- Explanation: The answer is \`"abc"\` with length 3.

### Constraints
- \`0 <= s.length <= 5 * 10^4\`
- \`s\` consists of English letters, digits, symbols and spaces.`,
    publicTests: [
      { input: '["abcabcbb"]', expected: '3' },
      { input: '["bbbbb"]', expected: '1' },
    ],
    hiddenTests: [{ input: '["pwwkew"]', expected: '3' }],
  },
  {
    topic: 'Hashing',
    title: 'Contains Duplicate',
    difficulty: 'Easy',
    functionName: 'containsDuplicate',
    starterCode: `function containsDuplicate(nums) {
  // return true if any value appears at least twice
}
`,
    question: `## Contains Duplicate

Given an integer array \`nums\`, return \`true\` if any value appears **at least twice** in the array, and return \`false\` if every element is distinct.

### Example
- Input: \`nums = [1,2,3,1]\`
- Output: \`true\`

### Constraints
- \`1 <= nums.length <= 10^5\`
Prefer \`O(n)\` with a hash set.`,
    publicTests: [
      { input: '[[1,2,3,1]]', expected: 'true' },
      { input: '[[1,2,3,4]]', expected: 'false' },
    ],
    hiddenTests: [{ input: '[[1,1,1,3,3,4,3,2,4,2]]', expected: 'true' }],
  },
  {
    topic: 'Two Pointers',
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    functionName: 'isPalindrome',
    starterCode: `function isPalindrome(s) {
  // return true if s is a palindrome after cleaning
}
`,
    question: `## Valid Palindrome

A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Given a string \`s\`, return \`true\` if it is a palindrome, or \`false\` otherwise.

### Example
- Input: \`s = "A man, a plan, a canal: Panama"\`
- Output: \`true\`

### Constraints
- \`1 <= s.length <= 2 * 10^5\``,
    publicTests: [
      { input: '["A man, a plan, a canal: Panama"]', expected: 'true' },
      { input: '["race a car"]', expected: 'false' },
    ],
    hiddenTests: [{ input: '[" "]', expected: 'true' }],
  },
  {
    topic: 'Sliding Window',
    title: 'Maximum Average Subarray I',
    difficulty: 'Easy',
    functionName: 'findMaxAverage',
    starterCode: `function findMaxAverage(nums, k) {
  // return the maximum average of a contiguous subarray of length k
}
`,
    question: `## Maximum Average Subarray I

You are given an integer array \`nums\` consisting of \`n\` elements, and an integer \`k\`.

Find a contiguous subarray whose length is equal to \`k\` that has the maximum average value and return **that average value**.

Answers within \`10^-5\` of the actual answer will be accepted; for this judge, return the exact numeric average.

### Example
- Input: \`nums = [1,12,-5,-6,50,3]\`, \`k = 4\`
- Output: \`12.75\`
- Explanation: Max average is \`(12 - 5 - 6 + 50) / 4 = 12.75\``,
    publicTests: [
      { input: '[[1,12,-5,-6,50,3],4]', expected: '12.75' },
      { input: '[[5],1]', expected: '5' },
    ],
    hiddenTests: [{ input: '[[0,1,1,3,3],4]', expected: '2' }],
  },
  {
    topic: 'Binary Search',
    title: 'Binary Search',
    difficulty: 'Easy',
    functionName: 'search',
    starterCode: `function search(nums, target) {
  // return index of target in sorted nums, or -1
}
`,
    question: `## Binary Search

Given an array of integers \`nums\` sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, return its index. Otherwise return \`-1\`.

You must write an algorithm with \`O(log n)\` runtime complexity.

### Example
- Input: \`nums = [-1,0,3,5,9,12]\`, \`target = 9\`
- Output: \`4\``,
    publicTests: [
      { input: '[[-1,0,3,5,9,12],9]', expected: '4' },
      { input: '[[-1,0,3,5,9,12],2]', expected: '-1' },
    ],
    hiddenTests: [{ input: '[[5],5]', expected: '0' }],
  },
  {
    topic: 'Stacks',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    functionName: 'isValid',
    starterCode: `function isValid(s) {
  // return true if the brackets are valid
}
`,
    question: `## Valid Parentheses

Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{\'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

### Example
- Input: \`s = "()[]{}"\`
- Output: \`true\``,
    publicTests: [
      { input: '["()"]', expected: 'true' },
      { input: '["(]"]', expected: 'false' },
    ],
    hiddenTests: [{ input: '["{[]}"]', expected: 'true' }],
  },
  {
    topic: 'Linked Lists',
    title: 'Reverse Linked List (Array Form)',
    difficulty: 'Easy',
    functionName: 'reverseList',
    starterCode: `function reverseList(head) {
  // head is an array representing list values; return reversed array
}
`,
    question: `## Reverse Linked List (Array Form)

For this sandbox, a singly linked list is represented as an array of values (head → tail).

Given \`head\`, reverse the list and return the values as an array.

### Example
- Input: \`head = [1,2,3,4,5]\`
- Output: \`[5,4,3,2,1]\`

### Note
Implement the logic as if you were reversing pointer links (iterative or recursive).`,
    publicTests: [
      { input: '[[1,2,3,4,5]]', expected: '[5,4,3,2,1]' },
      { input: '[[1,2]]', expected: '[2,1]' },
    ],
    hiddenTests: [{ input: '[[]]', expected: '[]' }],
  },
  {
    topic: 'Dynamic Programming',
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    functionName: 'climbStairs',
    starterCode: `function climbStairs(n) {
  // return number of distinct ways to climb n stairs
}
`,
    question: `## Climbing Stairs

You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?

### Example
- Input: \`n = 3\`
- Output: \`3\`
- Explanation: \`1+1+1\`, \`1+2\`, \`2+1\`.

### Constraints
- \`1 <= n <= 45\``,
    publicTests: [
      { input: '[2]', expected: '2' },
      { input: '[3]', expected: '3' },
    ],
    hiddenTests: [{ input: '[5]', expected: '8' }],
  },
  {
    topic: 'Graphs',
    title: 'Number of Islands (Grid)',
    difficulty: 'Medium',
    functionName: 'numIslands',
    starterCode: `function numIslands(grid) {
  // grid is string[][] of '1' (land) and '0' (water); return island count
}
`,
    question: `## Number of Islands

Given an \`m x n\` 2D binary grid which represents a map of \`'1'\`s (land) and \`'0'\`s (water), return the number of islands.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.

### Example
- Input:
\`\`\`
[
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]
\`\`\`
- Output: \`3\``,
    publicTests: [
      {
        input:
          '[[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]]',
        expected: '3',
      },
    ],
    hiddenTests: [
      {
        input: '[[["1","1","1"],["0","1","0"],["1","1","1"]]]',
        expected: '1',
      },
    ],
  },
  {
    topic: 'Recursion',
    title: 'Fibonacci Number',
    difficulty: 'Easy',
    functionName: 'fib',
    starterCode: `function fib(n) {
  // return the nth Fibonacci number (F(0)=0, F(1)=1)
}
`,
    question: `## Fibonacci Number

The Fibonacci numbers form a sequence where each number is the sum of the two preceding ones, starting from \`0\` and \`1\`.

Given \`n\`, calculate \`F(n)\`.

### Example
- Input: \`n = 4\`
- Output: \`3\`
- Explanation: \`F(4) = F(3) + F(2) = 2 + 1 = 3\``,
    publicTests: [
      { input: '[2]', expected: '1' },
      { input: '[4]', expected: '3' },
    ],
    hiddenTests: [{ input: '[10]', expected: '55' }],
  },
  {
    topic: 'Sorting',
    title: 'Sort Colors (Dutch Flag)',
    difficulty: 'Medium',
    functionName: 'sortColors',
    starterCode: `function sortColors(nums) {
  // sort nums in-place with 0s, then 1s, then 2s; return nums
}
`,
    question: `## Sort Colors

Given an array \`nums\` with \`n\` objects colored red, white, or blue (encoded as \`0\`, \`1\`, and \`2\`), sort them **in-place** so that objects of the same color are adjacent, in the order \`0\`, \`1\`, then \`2\`.

You must solve this without using the library sort function. Prefer one-pass Dutch National Flag.

Return the sorted array (same reference is fine).

### Example
- Input: \`nums = [2,0,2,1,1,0]\`
- Output: \`[0,0,1,1,2,2]\``,
    publicTests: [
      { input: '[[2,0,2,1,1,0]]', expected: '[0,0,1,1,2,2]' },
      { input: '[[2,0,1]]', expected: '[0,1,2]' },
    ],
    hiddenTests: [{ input: '[[0]]', expected: '[0]' }],
  },
  {
    topic: 'Greedy',
    title: 'Jump Game',
    difficulty: 'Medium',
    functionName: 'canJump',
    starterCode: `function canJump(nums) {
  // return true if you can reach the last index
}
`,
    question: `## Jump Game

You are given an integer array \`nums\`. You are initially positioned at the first index, and each element represents your maximum jump length at that position.

Return \`true\` if you can reach the last index, or \`false\` otherwise.

### Example
- Input: \`nums = [2,3,1,1,4]\`
- Output: \`true\`
- Explanation: Jump 1 step to index 1, then 3 steps to the last index.`,
    publicTests: [
      { input: '[[2,3,1,1,4]]', expected: 'true' },
      { input: '[[3,2,1,0,4]]', expected: 'false' },
    ],
    hiddenTests: [{ input: '[[0]]', expected: 'true' }],
  },
  {
    topic: 'Heap / Priority Queue',
    title: 'Kth Largest Element',
    difficulty: 'Medium',
    functionName: 'findKthLargest',
    starterCode: `function findKthLargest(nums, k) {
  // return the kth largest element in the array
}
`,
    question: `## Kth Largest Element in an Array

Given an integer array \`nums\` and an integer \`k\`, return the \`k\`th largest element in the array.

Note that it is the \`k\`th largest element in sorted order, not the \`k\`th distinct element.

### Example
- Input: \`nums = [3,2,1,5,6,4]\`, \`k = 2\`
- Output: \`5\`

### Follow-up
Prefer better than full sort (heap / quickselect).`,
    publicTests: [
      { input: '[[3,2,1,5,6,4],2]', expected: '5' },
      { input: '[[3,2,3,1,2,4,5,5,6],4]', expected: '4' },
    ],
    hiddenTests: [{ input: '[[1],1]', expected: '1' }],
  },
  {
    topic: 'Trees',
    title: 'Maximum Depth of Binary Tree (Level Array)',
    difficulty: 'Easy',
    functionName: 'maxDepth',
    starterCode: `function maxDepth(root) {
  // root is level-order array with nulls; return max depth
}
`,
    question: `## Maximum Depth of Binary Tree

A binary tree is given in **level-order array** form (\`null\` for missing nodes), e.g. \`[3,9,20,null,null,15,7]\`.

Return its maximum depth (number of nodes along the longest path from root to leaf).

### Example
- Input: \`root = [3,9,20,null,null,15,7]\`
- Output: \`3\``,
    publicTests: [
      { input: '[[3,9,20,null,null,15,7]]', expected: '3' },
      { input: '[[1,null,2]]', expected: '2' },
    ],
    hiddenTests: [{ input: '[[]]', expected: '0' }],
  },
  {
    topic: 'Backtracking',
    title: 'Unique Paths',
    difficulty: 'Medium',
    functionName: 'uniquePaths',
    starterCode: `function uniquePaths(m, n) {
  // robot from (0,0) to (m-1,n-1); only right/down; return number of paths
}
`,
    question: `## Unique Paths

There is a robot on an \`m x n\` grid, starting at top-left. The robot can only move either down or right. The robot is trying to reach bottom-right.

Given integers \`m\` and \`n\`, return how many possible unique paths exist.

### Example
- Input: \`m = 3\`, \`n = 7\`
- Output: \`28\`

You may use DP / combinatorics (backtracking with memo also works).`,
    publicTests: [
      { input: '[3,7]', expected: '28' },
      { input: '[3,2]', expected: '3' },
    ],
    hiddenTests: [{ input: '[1,1]', expected: '1' }],
  },
  {
    topic: 'Bit Manipulation',
    title: 'Single Number',
    difficulty: 'Easy',
    functionName: 'singleNumber',
    starterCode: `function singleNumber(nums) {
  // every element appears twice except one; return that one
}
`,
    question: `## Single Number

Given a **non-empty** array of integers \`nums\`, every element appears twice except for one. Find that single one.

You must implement a solution with linear runtime and use only constant extra space (XOR).

### Example
- Input: \`nums = [4,1,2,1,2]\`
- Output: \`4\``,
    publicTests: [
      { input: '[[2,2,1]]', expected: '1' },
      { input: '[[4,1,2,1,2]]', expected: '4' },
    ],
    hiddenTests: [{ input: '[[1]]', expected: '1' }],
  },
  {
    topic: 'Queues',
    title: 'Recent Counter',
    difficulty: 'Easy',
    functionName: 'recentCounter',
    starterCode: `function recentCounter(pings) {
  // pings is an array of call times; return an array of counts for each ping
  // Each ping t requests count of pings in [t-3000, t]
}
`,
    question: `## Number of Recent Calls (batch form)

Implement the RecentCounter logic in batch form.

You are given \`pings\`, an array of strictly increasing timestamps. For each \`pings[i]\`, return how many pings lie in the inclusive range \`[pings[i] - 3000, pings[i]]\`.

### Example
- Input: \`pings = [1,100,3001,3002]\`
- Output: \`[1,2,3,3]\``,
    publicTests: [
      { input: '[[1,100,3001,3002]]', expected: '[1,2,3,3]' },
    ],
    hiddenTests: [{ input: '[[1]]', expected: '[1]' }],
  },
  {
    topic: 'Searching',
    title: 'First Bad Version (API simulation)',
    difficulty: 'Easy',
    functionName: 'firstBadVersion',
    starterCode: `function firstBadVersion(n, bad) {
  // versions 1..n; first bad version is \`bad\`; minimize calls conceptually
  // return the first bad version
}
`,
    question: `## First Bad Version

You have \`n\` versions \`[1, 2, ..., n]\`. The first bad version is \`bad\`; all later versions are bad.

Implement \`firstBadVersion(n, bad)\` returning the first bad version. Prefer binary search (\`O(log n)\`).

### Example
- Input: \`n = 5\`, \`bad = 4\`
- Output: \`4\``,
    publicTests: [
      { input: '[5,4]', expected: '4' },
      { input: '[1,1]', expected: '1' },
    ],
    hiddenTests: [{ input: '[10,7]', expected: '7' }],
  },
]

type CodingAnswerKey = {
  time: string
  space: string
  edgeCases: string[]
  keyPoints: string[]
}

/**
 * Static answer keys for the curated bank, keyed by functionName (EVALUATION_PLAN §4).
 * Complexity is the optimal class the judge compares the candidate's solution against.
 */
const CODING_ANSWER_KEYS: Record<string, CodingAnswerKey> = {
  twoSum: { time: 'O(n)', space: 'O(n)', edgeCases: ['Two equal numbers summing to target', 'Negative numbers'], keyPoints: ['Uses a hash map from value to index for O(1) complement lookup', 'Single pass over the array', 'Returns indices, not values'] },
  twoSumHash: { time: 'O(n)', space: 'O(n)', edgeCases: ['Two equal numbers summing to target', 'Negative numbers'], keyPoints: ['Uses a hash map from value to index', 'Single pass', 'Checks complement before inserting the current value'] },
  maxSubArray: { time: 'O(n)', space: 'O(1)', edgeCases: ['All negative numbers', 'Single element'], keyPoints: ["Kadane's algorithm: running sum reset when it drops below zero", 'Tracks the best sum seen so far', 'Handles all-negative arrays by seeding with the first element'] },
  maxProfit: { time: 'O(n)', space: 'O(1)', edgeCases: ['Prices strictly decreasing (profit 0)', 'Two-day array'], keyPoints: ['Tracks the minimum price seen so far', 'Updates max profit at each day in one pass', 'Never sells before buying'] },
  productExceptSelf: { time: 'O(n)', space: 'O(1)', edgeCases: ['Array containing a zero', 'Two elements'], keyPoints: ['Prefix products then suffix products', 'No division', 'Output array reused as the prefix buffer for O(1) extra space'] },
  moveZeroes: { time: 'O(n)', space: 'O(1)', edgeCases: ['All zeros', 'No zeros', 'Single element'], keyPoints: ['Write pointer for the next non-zero slot', 'Preserves relative order of non-zero elements', 'In place, no copy'] },
  rotate: { time: 'O(n)', space: 'O(1)', edgeCases: ['k larger than the array length', 'k equal to 0'], keyPoints: ['Reduces k modulo the length', 'Three-reversal technique or cyclic replacement', 'In place'] },
  missingNumber: { time: 'O(n)', space: 'O(1)', edgeCases: ['Missing number is 0', 'Missing number is n'], keyPoints: ['Gauss sum n(n+1)/2 minus the actual sum, or XOR trick', 'Single pass'] },
  merge: { time: 'O(m+n)', space: 'O(1)', edgeCases: ['nums2 empty', 'nums1 has no real elements (m = 0)'], keyPoints: ['Merges from the back to avoid overwriting', 'Three pointers', 'Copies remaining nums2 elements'] },
  majorityElement: { time: 'O(n)', space: 'O(1)', edgeCases: ['Single element', 'Majority element at the end'], keyPoints: ['Boyer–Moore voting: candidate and counter', 'Single pass, constant space'] },
  removeDuplicates: { time: 'O(n)', space: 'O(1)', edgeCases: ['All elements identical', 'No duplicates'], keyPoints: ['Slow/fast pointer', 'Writes unique values in place', 'Returns the count k'] },
  plusOne: { time: 'O(n)', space: 'O(1)', edgeCases: ['All nines (length grows)', 'Single digit 9'], keyPoints: ['Iterates from the least significant digit', 'Carries and stops early when no carry', 'Prepends 1 when every digit was 9'] },
  singleNumberArray: { time: 'O(n)', space: 'O(1)', edgeCases: ['Single element', 'Negative numbers'], keyPoints: ['XOR of all elements cancels pairs', 'Constant space'] },
  singleNumber: { time: 'O(n)', space: 'O(1)', edgeCases: ['Single element', 'Negative numbers'], keyPoints: ['XOR of all elements cancels pairs', 'Constant space'] },
  maxArea: { time: 'O(n)', space: 'O(1)', edgeCases: ['Two lines only', 'All heights equal'], keyPoints: ['Two pointers from both ends', 'Moves the shorter line inward', 'Tracks the maximum area'] },
  characterReplacement: { time: 'O(n)', space: 'O(1)', edgeCases: ['k equal to 0', 'All characters identical'], keyPoints: ['Sliding window with a frequency count', 'Window valid while length − maxFreq ≤ k', 'Shrinks from the left when invalid'] },
  searchInsert: { time: 'O(log n)', space: 'O(1)', edgeCases: ['Target smaller than every element', 'Target larger than every element'], keyPoints: ['Binary search', 'Returns the left bound when not found'] },
  evalRPN: { time: 'O(n)', space: 'O(n)', edgeCases: ['Division truncating toward zero with negatives', 'Single number'], keyPoints: ['Stack of operands', 'Pops two, applies the operator, pushes the result', 'Truncates division toward zero'] },
  rob: { time: 'O(n)', space: 'O(1)', edgeCases: ['Single house', 'Two houses'], keyPoints: ['DP: rob[i] = max(rob[i-1], rob[i-2] + nums[i])', 'Two rolling variables for O(1) space'] },
  myPow: { time: 'O(log n)', space: 'O(1)', edgeCases: ['Negative exponent', 'Exponent 0'], keyPoints: ['Fast exponentiation by squaring', 'Handles negative n by inverting x'] },
  jump: { time: 'O(n)', space: 'O(1)', edgeCases: ['Single element (0 jumps)', 'Every element 1'], keyPoints: ['Greedy: tracks the current jump end and the farthest reachable index', 'Increments jumps when the current end is reached'] },
  findKthLargestSort: { time: 'O(n log n)', space: 'O(1)', edgeCases: ['k equal to the length', 'Duplicates'], keyPoints: ['Sorts descending and indexes k−1, or uses a heap / quickselect'] },
  findKthLargest: { time: 'O(n log k)', space: 'O(k)', edgeCases: ['k equal to the length', 'Duplicates'], keyPoints: ['Min-heap of size k or quickselect', 'Better than a full sort'] },
  findPeakElement: { time: 'O(log n)', space: 'O(1)', edgeCases: ['Single element', 'Peak at either end'], keyPoints: ['Binary search toward the rising side', 'Compares mid with mid+1'] },
  countRecent: { time: 'O(log n)', space: 'O(1)', edgeCases: ['Single ping', 'All pings outside the window'], keyPoints: ['Binary search for the window start, or a linear scan', 'Inclusive bounds [t−3000, t]'] },
  recentCounter: { time: 'O(n)', space: 'O(n)', edgeCases: ['Single ping', 'Pings exactly 3000 apart'], keyPoints: ['Sliding window / queue over the sorted timestamps', 'Inclusive window bounds'] },
  isSameTreeArrays: { time: 'O(n)', space: 'O(1)', edgeCases: ['Different lengths', 'Null positions differing'], keyPoints: ['Compares lengths then element-wise including nulls'] },
  maxDepth: { time: 'O(n)', space: 'O(n)', edgeCases: ['Empty tree', 'Skewed tree with nulls'], keyPoints: ['Level-order traversal counting levels, or index math on the array', 'Handles null children'] },
  letterCombinationsCount: { time: 'O(n)', space: 'O(1)', edgeCases: ['Empty string (0)', 'Digit 7 or 9 (four letters)'], keyPoints: ['Product of letters per digit', 'Empty input returns 0'] },
  hammingWeight: { time: 'O(1)', space: 'O(1)', edgeCases: ['Zero', 'Power of two'], keyPoints: ['n & (n−1) clears the lowest set bit', 'Counts iterations'] },
  lastStoneWeight: { time: 'O(n log n)', space: 'O(n)', edgeCases: ['Single stone', 'Two equal stones (0)'], keyPoints: ['Max-heap or repeated sort', 'Smashes the two heaviest until one or none remains'] },
  findCenter: { time: 'O(1)', space: 'O(1)', edgeCases: ['Exactly two edges'], keyPoints: ['The center appears in both of the first two edges', 'No need to scan every edge'] },
  mergeTwoLists: { time: 'O(m+n)', space: 'O(m+n)', edgeCases: ['Both lists empty', 'One list empty'], keyPoints: ['Two pointers merging in order', 'Appends the remaining tail'] },
  reverseWords: { time: 'O(n)', space: 'O(n)', edgeCases: ['Leading, trailing and multiple spaces', 'Single word'], keyPoints: ['Splits on whitespace runs', 'Filters empty tokens', 'Reverses and joins with a single space'] },
  isAnagram: { time: 'O(n)', space: 'O(1)', edgeCases: ['Different lengths', 'Repeated letters'], keyPoints: ['Length check first', 'Frequency count of 26 letters', 'Compares counts'] },
  lengthOfLongestSubstring: { time: 'O(n)', space: 'O(min(n, alphabet))', edgeCases: ['Empty string', 'All identical characters'], keyPoints: ['Sliding window with last-seen index map', 'Moves the left bound past repeats'] },
  containsDuplicate: { time: 'O(n)', space: 'O(n)', edgeCases: ['No duplicates', 'Duplicate at the end'], keyPoints: ['Hash set of seen values', 'Returns early on first repeat'] },
  isPalindrome: { time: 'O(n)', space: 'O(1)', edgeCases: ['Only non-alphanumerics (true)', 'Mixed case'], keyPoints: ['Two pointers skipping non-alphanumerics', 'Case-insensitive comparison'] },
  findMaxAverage: { time: 'O(n)', space: 'O(1)', edgeCases: ['k equal to the array length', 'Negative numbers'], keyPoints: ['Sliding window sum of length k', 'Divides only once at the end'] },
  search: { time: 'O(log n)', space: 'O(1)', edgeCases: ['Single element', 'Target absent'], keyPoints: ['Binary search with inclusive bounds', 'Returns −1 when not found'] },
  isValid: { time: 'O(n)', space: 'O(n)', edgeCases: ['Unmatched opening bracket at the end', 'Closing bracket first'], keyPoints: ['Stack of expected closers', 'Empty stack at the end means valid'] },
  reverseList: { time: 'O(n)', space: 'O(1)', edgeCases: ['Empty list', 'Single node'], keyPoints: ['Iterative pointer reversal (prev/current/next) or recursion', 'Returns the new head'] },
  climbStairs: { time: 'O(n)', space: 'O(1)', edgeCases: ['n = 1', 'n = 2'], keyPoints: ['Fibonacci recurrence', 'Two rolling variables'] },
  numIslands: { time: 'O(m·n)', space: 'O(m·n)', edgeCases: ['All water', 'Single cell'], keyPoints: ['BFS/DFS flood fill from each unvisited land cell', 'Marks visited cells', 'Counts starts'] },
  fib: { time: 'O(n)', space: 'O(1)', edgeCases: ['n = 0', 'n = 1'], keyPoints: ['Iterative with two rolling variables or memoised recursion', 'No exponential recursion'] },
  sortColors: { time: 'O(n)', space: 'O(1)', edgeCases: ['Single element', 'Already sorted'], keyPoints: ['Dutch national flag with three pointers', 'One pass, in place'] },
  canJump: { time: 'O(n)', space: 'O(1)', edgeCases: ['Single element (true)', 'Zero blocking the path'], keyPoints: ['Greedy farthest-reach tracking', 'Fails when the index passes the farthest reach'] },
  uniquePaths: { time: 'O(m·n)', space: 'O(n)', edgeCases: ['1×1 grid', 'Single row or column'], keyPoints: ['DP over the grid or the binomial coefficient C(m+n−2, m−1)', 'Rolling row for O(n) space'] },
  firstBadVersion: { time: 'O(log n)', space: 'O(1)', edgeCases: ['First version bad', 'Last version bad'], keyPoints: ['Binary search for the first bad version', 'Keeps the right bound as a candidate'] },
}

function codingAnswerKey(tpl: CodingTemplate) {
  const key = CODING_ANSWER_KEYS[tpl.functionName]
  return normalizeAnswerKey(
    key
      ? {
          expectedComplexity: { time: key.time, space: key.space },
          edgeCases: key.edgeCases,
          keyPoints: key.keyPoints,
        }
      : null,
    'coding',
    tpl.topic,
  )
}

function difficultyRank(d: Difficulty): number {
  if (d === 'Easy') return 0
  if (d === 'Medium') return 1
  return 2
}

function hashSeed(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items]
  let s = seed || 1
  for (let i = arr.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    const j = s % (i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function uniqueByFunctionName(list: CodingTemplate[]): CodingTemplate[] {
  const seen = new Set<string>()
  const out: CodingTemplate[] = []
  for (const p of list) {
    if (seen.has(p.functionName)) continue
    seen.add(p.functionName)
    out.push(p)
  }
  return out
}

/**
 * Pick LeetCode-style templates: unique-first (selected categories, then rest of bank).
 * Adaptive keeps each template's native difficulty and progresses Easy → Hard when possible.
 */
export function buildLeetCodeCodingQuestions(params: {
  topics: string[]
  totalQuestions: number
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Adaptive'
  /** Skip templates whose functionName is already used (e.g. Gemini pad). */
  excludeFunctionNames?: string[]
}): InterviewQuestionItem[] {
  const topicSet = new Set(params.topics.map((t) => t.trim()).filter(Boolean))
  const excluded = new Set(
    (params.excludeFunctionNames || []).map((n) => n.trim()).filter(Boolean),
  )

  const available = CODING_PROBLEM_BANK.filter((p) => !excluded.has(p.functionName))
  const primary = available.filter((p) => topicSet.size === 0 || topicSet.has(p.topic))
  const secondary = available.filter((p) => topicSet.size > 0 && !topicSet.has(p.topic))

  const seed = hashSeed(
    `${[...topicSet].sort().join('|')}|${params.totalQuestions}|${params.difficulty}|${[
      ...excluded,
    ]
      .sort()
      .join(',')}`,
  )

  let primaryPool = uniqueByFunctionName(
    seededShuffle(primary.length ? primary : available, seed),
  )
  let secondaryPool = uniqueByFunctionName(
    seededShuffle(secondary, seed ^ 0x9e3779b9),
  ).filter((p) => !primaryPool.some((x) => x.functionName === p.functionName))

  const target =
    params.difficulty === 'Adaptive' ? null : (params.difficulty as Difficulty)

  if (target) {
    const byTarget = (list: CodingTemplate[]) =>
      [...list].sort(
        (a, b) =>
          Math.abs(difficultyRank(a.difficulty) - difficultyRank(target)) -
          Math.abs(difficultyRank(b.difficulty) - difficultyRank(target)),
      )
    primaryPool = byTarget(primaryPool)
    secondaryPool = byTarget(secondaryPool)
  } else {
    // Adaptive: native difficulties, Easy → Hard within selected categories first
    const byNative = (list: CodingTemplate[]) =>
      [...list].sort(
        (a, b) => difficultyRank(a.difficulty) - difficultyRank(b.difficulty),
      )
    primaryPool = byNative(primaryPool)
    secondaryPool = byNative(secondaryPool)
  }

  let pool = [...primaryPool, ...secondaryPool]
  if (pool.length === 0) pool = uniqueByFunctionName([...CODING_PROBLEM_BANK])

  const n = Math.max(0, params.totalQuestions)
  return Array.from({ length: n }, (_, i) => {
    const tpl = pool[i % pool.length]
    const difficulty =
      params.difficulty === 'Adaptive'
        ? tpl.difficulty
        : params.difficulty === 'Easy' ||
            params.difficulty === 'Medium' ||
            params.difficulty === 'Hard'
          ? params.difficulty
          : tpl.difficulty

    // Keep the problem's real DSA category (may expand beyond the user's selection).
    const topic = tpl.topic

    return {
      type: 'technical' as const,
      topic,
      difficulty,
      question: tpl.question,
      kind: 'coding' as const,
      language: 'javascript' as const,
      functionName: tpl.functionName,
      starterCode: tpl.starterCode,
      publicTests: tpl.publicTests,
      hiddenTests: tpl.hiddenTests,
      rubric: 'coding' as const,
      ...codingAnswerKey(tpl),
    }
  })
}
