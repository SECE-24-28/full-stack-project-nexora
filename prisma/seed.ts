import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { config } from 'dotenv';

config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const questionsData = [
  {
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    difficulty: 'Easy',
    categories: ['Arrays', 'Hash Table'],
    companies: ['Google', 'Amazon', 'PayPal'],
  },
  {
    title: 'Reverse a Linked List',
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    difficulty: 'Medium',
    categories: ['Linked Lists'],
    companies: ['Facebook', 'Microsoft'],
  },
  {
    title: 'Best Time to Buy and Sell Stock',
    description: 'You are given an array prices where prices[i] is the price of a given stock on the ith day. Maximize your profit.',
    difficulty: 'Easy',
    categories: ['Arrays'],
    companies: ['Amazon', 'Apple', 'Google'],
  },
  {
    title: 'Contains Duplicate',
    description: 'Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.',
    difficulty: 'Easy',
    categories: ['Arrays', 'Hash Table'],
    companies: ['Google', 'Microsoft', 'Apple'],
  },
  {
    title: 'Valid Parentheses',
    description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
    difficulty: 'Easy',
    categories: ['Stacks', 'Strings'],
    companies: ['Facebook', 'Amazon', 'Spotify'],
  },
  {
    title: 'Merge Intervals',
    description: 'Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals.',
    difficulty: 'Medium',
    categories: ['Arrays', 'Sorting'],
    companies: ['Google', 'Facebook', 'Uber'],
  },
  {
    title: '3Sum',
    description: 'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.',
    difficulty: 'Medium',
    categories: ['Arrays', 'Two Pointers'],
    companies: ['Amazon', 'Microsoft', 'Facebook'],
  },
  {
    title: 'Maximum Subarray',
    description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
    difficulty: 'Medium',
    categories: ['Arrays', 'Dynamic Programming'],
    companies: ['LinkedIn', 'Apple', 'Amazon'],
  },
  {
    title: 'Climbing Stairs',
    description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    difficulty: 'Easy',
    categories: ['Dynamic Programming', 'Math'],
    companies: ['Google', 'Apple', 'Adobe'],
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    description: 'Given a string s, find the length of the longest substring without repeating characters.',
    difficulty: 'Medium',
    categories: ['Strings', 'Sliding Window'],
    companies: ['Amazon', 'Netflix', 'Microsoft'],
  },
  {
    title: 'Valid Anagram',
    description: 'Given two strings s and t, return true if t is an anagram of s, and false otherwise.',
    difficulty: 'Easy',
    categories: ['Strings', 'Hash Table'],
    companies: ['Uber', 'Facebook', 'Goldman Sachs'],
  },
  {
    title: 'Group Anagrams',
    description: 'Given an array of strings strs, group the anagrams together. You can return the answer in any order.',
    difficulty: 'Medium',
    categories: ['Strings', 'Hash Table'],
    companies: ['Amazon', 'Microsoft', 'eBay'],
  },
  {
    title: 'Number of Islands',
    description: 'Given an m x n 2D binary grid grid which represents a map of 1s (land) and 0s (water), return the number of islands.',
    difficulty: 'Medium',
    categories: ['Graphs', 'DFS', 'BFS'],
    companies: ['Amazon', 'Google', 'Bloomberg'],
  },
  {
    title: 'Merge k Sorted Lists',
    description: 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list.',
    difficulty: 'Hard',
    categories: ['Linked Lists', 'Heaps', 'Divide and Conquer'],
    companies: ['Facebook', 'Google', 'Airbnb'],
  },
  {
    title: 'Trapping Rain Water',
    description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
    difficulty: 'Hard',
    categories: ['Arrays', 'Two Pointers', 'Stacks'],
    companies: ['Amazon', 'Google', 'Twitter'],
  },
  {
    title: 'Longest Palindromic Substring',
    description: 'Given a string s, return the longest palindromic substring in s.',
    difficulty: 'Medium',
    categories: ['Strings', 'Dynamic Programming'],
    companies: ['Amazon', 'Microsoft', 'Cisco'],
  },
  {
    title: 'Validate Binary Search Tree',
    description: 'Given the root of a binary tree, determine if it is a valid binary search tree (BST).',
    difficulty: 'Medium',
    categories: ['Trees', 'DFS'],
    companies: ['Facebook', 'Amazon', 'Visa'],
  },
  {
    title: 'Invert Binary Tree',
    description: 'Given the root of a binary tree, invert the tree, and return its root.',
    difficulty: 'Easy',
    categories: ['Trees', 'BFS'],
    companies: ['Google', 'Yelp'],
  },
  {
    title: 'Word Break',
    description: 'Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.',
    difficulty: 'Medium',
    categories: ['Strings', 'Dynamic Programming', 'Trie'],
    companies: ['Google', 'Facebook', 'Oracle'],
  },
  {
    title: 'LRU Cache',
    description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.',
    difficulty: 'Medium',
    categories: ['Design', 'Linked Lists', 'Hash Table'],
    companies: ['Amazon', 'Google', 'Palantir'],
  }
];

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing data safely
  await prisma.userProgress.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.company.deleteMany({});

  // 2. Loop through and create each question
  for (const q of questionsData) {
    await prisma.question.create({
      data: {
        title: q.title,
        description: q.description,
        difficulty: q.difficulty,
        categories: {
          connectOrCreate: q.categories.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
        companies: {
          connectOrCreate: q.companies.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
    });
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });