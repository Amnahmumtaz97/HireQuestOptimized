/** DSA / coding interview category bank (static). */
export const CODING_CATEGORIES = [
  'Arrays',
  'Strings',
  'Hashing',
  'Linked Lists',
  'Stacks',
  'Queues',
  'Trees',
  'Graphs',
  'Binary Search',
  'Dynamic Programming',
  'Greedy',
  'Recursion',
  'Sorting',
  'Searching',
  'Bit Manipulation',
  'Backtracking',
  'Sliding Window',
  'Two Pointers',
  'Heap / Priority Queue',
] as const

export type CodingCategory = (typeof CODING_CATEGORIES)[number]

export const CODING_CATEGORY_SET = new Set<string>(CODING_CATEGORIES)
