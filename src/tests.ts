// src/tests.ts

const buildNode = (val: any, left: any = null, right: any = null) => ({ val, left, right });

export const TEST_SUITES: Record<string, any[]> = {
  "Two Sum": [
    { inputs: [[2, 7, 11, 15], 9], expected: [0, 1] },
    { inputs: [[3, 2, 4], 6], expected: [1, 2] },
    { inputs: [[3, 3], 6], expected: [0, 1] },
    { inputs: [[-1, -2, -3, -4, -5], -8], expected: [2, 4] },
  ],
  "Reverse a Linked List": [
    { inputs: [[1, 2, 3, 4, 5]], expected: [5, 4, 3, 2, 1] },
    { inputs: [[1, 2]], expected: [2, 1] },
    { inputs: [[]], expected: [] },
  ],
  "Best Time to Buy and Sell Stock": [
    { inputs: [[7, 1, 5, 3, 6, 4]], expected: 5 },
    { inputs: [[7, 6, 4, 3, 1]], expected: 0 },
    { inputs: [[1, 2]], expected: 1 },
  ],
  "Contains Duplicate": [
    { inputs: [[1, 2, 3, 1]], expected: true },
    { inputs: [[1, 2, 3, 4]], expected: false },
    { inputs: [[]], expected: false },
  ],
  "Valid Parentheses": [
    { inputs: ["()"], expected: true },
    { inputs: ["()[]{}"], expected: true },
    { inputs: ["(]"], expected: false },
    { inputs: ["([)]"], expected: false },
  ],
  "Merge Intervals": [
    { inputs: [[[1,3],[2,6],[8,10],[15,18]]], expected: [[1,6],[8,10],[15,18]] },
    { inputs: [[[1,4],[4,5]]], expected: [[1,5]] },
  ],
  "3Sum": [
    { inputs: [[-1,0,1,2,-1,-4]], expected: [[-1,-1,2],[-1,0,1]] },
    { inputs: [[0,0,0]], expected: [[0,0,0]] },
  ],
  "Maximum Subarray": [
    { inputs: [[-2,1,-3,4,-1,2,1,-5,4]], expected: 6 },
    { inputs: [[1]], expected: 1 },
    { inputs: [[5,4,-1,7,8]], expected: 23 },
  ],
  "Climbing Stairs": [
    { inputs: [2], expected: 2 },
    { inputs: [3], expected: 3 },
    { inputs: [5], expected: 8 },
  ],
  "Longest Substring Without Repeating Characters": [
    { inputs: ["abcabcbb"], expected: 3 },
    { inputs: ["bbbbb"], expected: 1 },
    { inputs: ["pwwkew"], expected: 3 },
    { inputs: [""], expected: 0 },
  ],
  "Valid Anagram": [
    { inputs: ["anagram", "nagaram"], expected: true },
    { inputs: ["rat", "car"], expected: false },
  ],
  "Group Anagrams": [
    { inputs: [["eat","tea","tan","ate","nat","bat"]], expected: [["bat"],["nat","tan"],["ate","eat","tea"]] },
  ],
  "Number of Islands": [
    { inputs: [[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]], expected: 1 },
  ],
  "Word Break": [
    { inputs: ["leetcode", ["leet", "code"]], expected: true },
    { inputs: ["catsandog", ["cats","dog","sand","and","cat"]], expected: false },
  ],
  "LRU Cache": [
    // Special test logic for object-based design patterns
    { inputs: ["put", "get"], expected: "validated" } 
  ],
  "Invert Binary Tree": [
    { 
      inputs: [buildNode(4, buildNode(2, buildNode(1), buildNode(3)), buildNode(7, buildNode(6), buildNode(9)))], 
      expected: buildNode(4, buildNode(7, buildNode(9), buildNode(6)), buildNode(2, buildNode(3), buildNode(1)))
    },
    { inputs: [null], expected: null }
  ],
};