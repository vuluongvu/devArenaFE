import { Injectable } from '@angular/core';
import { Problem } from '../models/problem.model';
import { SubmissionHistoryItem } from '../models/submission.model';
import { LearningPath, UserStats, TopicProgress } from '../models/progress.model';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  readonly categories: string[] = [
    'Arrays & Hashing',
    'Two Pointers',
    'Sliding Window',
    'Stack',
    'Binary Search',
    'Linked List',
    'Trees',
    'Dynamic Programming'
  ];

  readonly problems: Problem[] = [
    {
      id: 1,
      slug: 'two-sum',
      title: 'Two Sum',
      difficulty: 'EASY',
      category: 'Arrays & Hashing',
      acceptanceRate: 52.4,
      userStatus: 'SOLVED',
      timeLimitMs: 1000,
      memoryLimitMb: 128,
      tags: ['Array', 'Hash Table'],
      statement: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.

### Constraints:
- \`2 <= nums.length <= 10^4\`
- \`-10^9 <= nums[i] <= 10^9\`
- \`-10^9 <= target <= 10^9\`
- **Only one valid answer exists.**`,
      sampleTestCases: [
        {
          id: 1,
          input: 'nums = [2,7,11,15], target = 9',
          expectedOutput: '[0,1]',
          explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
          isSample: true
        },
        {
          id: 2,
          input: 'nums = [3,2,4], target = 6',
          expectedOutput: '[1,2]',
          explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].',
          isSample: true
        },
        {
          id: 3,
          input: 'nums = [3,3], target = 6',
          expectedOutput: '[0,1]',
          explanation: 'Both elements at index 0 and 1 equal 3, sum to 6.',
          isSample: true
        }
      ],
      allTestCases: [
        { id: 1, input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0,1]', isSample: true },
        { id: 2, input: 'nums = [3,2,4], target = 6', expectedOutput: '[1,2]', isSample: true },
        { id: 3, input: 'nums = [3,3], target = 6', expectedOutput: '[0,1]', isSample: true },
        { id: 4, input: 'nums = [-1,-2,-3,-4,-5], target = -8', expectedOutput: '[2,4]', isSample: false },
        { id: 5, input: 'nums = [0,4,3,0], target = 0', expectedOutput: '[0,3]', isSample: false }
      ],
      starterCode: {
        'TypeScript': `/**
 * Single-pass hash map solution for Two Sum
 */
type IndexMap = Map<number, number>;

function twoSum(nums: number[], target: number): number[] {
    const map: IndexMap = new Map<number, number>();
    const strategy: string = "single-pass";

    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement)!, i];
        }
        map.set(nums[i], i);
    }
    return [];
}`,
        'JavaScript': `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`,
        'Python': `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in seen:
                return [seen[complement], i]
            seen[num] = i
        return []`,
        'C++': `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); ++i) {
            int complement = target - nums[i];
            if (seen.count(complement)) {
                return {seen[complement], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};`,
        'Java': `import java.util.HashMap;
import java.util.Map;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (seen.containsKey(complement)) {
                return new int[] { seen.get(complement), i };
            }
            seen.put(nums[i], i);
        }
        return new int[0];
    }
}`,
        'C': `/**
 * Note: The returned array must be malloced, assume caller calls free().
 */
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    *returnSize = 2;
    int* result = (int*)malloc(2 * sizeof(int));
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[i] + nums[j] == target) {
                result[0] = i;
                result[1] = j;
                return result;
            }
        }
    }
    *returnSize = 0;
    return NULL;
}`
      },
      solutionEditorial: {
        summary: 'Use a hash map to look up the required complement in O(1) average time per element.',
        approach: 'Iterate through the array while maintaining a hash map of previously seen values to their indices. For each element `nums[i]`, compute `complement = target - nums[i]`. If the complement exists in our map, we have found the unique pair. Otherwise, insert `nums[i]` with index `i`.',
        timeComplexity: 'O(N) — Single pass through the array with O(1) hash map operations.',
        spaceComplexity: 'O(N) — Up to N elements stored in the hash table.',
        code: {
          'TypeScript': `function twoSum(nums: number[], target: number): number[] {
    const seen = new Map<number, number>();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (seen.has(complement)) {
            return [seen.get(complement)!, i];
        }
        seen.set(nums[i], i);
    }
    return [];
}`,
          'JavaScript': `function twoSum(nums, target) {
    const seen = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (seen.has(complement)) {
            return [seen.get(complement), i];
        }
        seen.set(nums[i], i);
    }
    return [];
}`,
          'Python': `def twoSum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, x in enumerate(nums):
        diff = target - x
        if diff in seen:
            return [seen[diff], i]
        seen[x] = i
    return []`,
          'C++': `vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> mp;
    for (int i = 0; i < nums.size(); ++i) {
        int diff = target - nums[i];
        if (mp.find(diff) != mp.end()) return {mp[diff], i};
        mp[nums[i]] = i;
    }
    return {};
}`,
          'Java': `public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int diff = target - nums[i];
        if (map.containsKey(diff)) return new int[]{map.get(diff), i};
        map.put(nums[i], i);
    }
    return new int[]{};
}`,
          'C': `int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    *returnSize = 2;
    int* result = (int*)malloc(2 * sizeof(int));
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[i] + nums[j] == target) {
                result[0] = i;
                result[1] = j;
                return result;
            }
        }
    }
    *returnSize = 0;
    return NULL;
}`
        }
      }
    },
    {
      id: 2,
      slug: 'valid-anagram',
      title: 'Valid Anagram',
      difficulty: 'EASY',
      category: 'Arrays & Hashing',
      acceptanceRate: 64.2,
      userStatus: 'SOLVED',
      timeLimitMs: 1000,
      memoryLimitMb: 128,
      tags: ['Hash Table', 'String', 'Sorting'],
      statement: `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`, and \`false\` otherwise.

An **Anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.

### Constraints:
- \`1 <= s.length, t.length <= 5 * 10^4\`
- \`s\` and \`t\` consist of lowercase English letters.`,
      sampleTestCases: [
        { id: 1, input: 's = "anagram", t = "nagaram"', expectedOutput: 'true', isSample: true },
        { id: 2, input: 's = "rat", t = "car"', expectedOutput: 'false', isSample: true }
      ],
      allTestCases: [
        { id: 1, input: 's = "anagram", t = "nagaram"', expectedOutput: 'true', isSample: true },
        { id: 2, input: 's = "rat", t = "car"', expectedOutput: 'false', isSample: true },
        { id: 3, input: 's = "a", t = "ab"', expectedOutput: 'false', isSample: false }
      ],
      starterCode: {
        'TypeScript': `function isAnagram(s: string, t: string): boolean {
    if (s.length !== t.length) return false;
    const counts = new Map<string, number>();
    for (const char of s) {
        counts.set(char, (counts.get(char) || 0) + 1);
    }
    for (const char of t) {
        if (!counts.has(char) || counts.get(char)! === 0) return false;
        counts.set(char, counts.get(char)! - 1);
    }
    return true;
}`,
        'JavaScript': `function isAnagram(s, t) {
    if (s.length !== t.length) return false;
    const count = {};
    for (let c of s) count[c] = (count[c] || 0) + 1;
    for (let c of t) {
        if (!count[c]) return false;
        count[c]--;
    }
    return true;
}`,
        'Python': `class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        if len(s) != len(t):
            return False
        from collections import Counter
        return Counter(s) == Counter(t)`,
        'C++': `#include <string>
#include <vector>
using namespace std;

class Solution {
public:
    bool isAnagram(string s, string t) {
        if (s.length() != t.length()) return false;
        vector<int> count(26, 0);
        for (char c : s) count[c - 'a']++;
        for (char c : t) {
            if (--count[c - 'a'] < 0) return false;
        }
        return true;
    }
};`,
        'Java': `class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        int[] counts = new int[26];
        for (char c : s.toCharArray()) counts[c - 'a']++;
        for (char c : t.toCharArray()) {
            if (--counts[c - 'a'] < 0) return false;
        }
        return true;
    }
}`
      }
    },
    {
      id: 3,
      slug: 'group-anagrams',
      title: 'Group Anagrams',
      difficulty: 'MEDIUM',
      category: 'Arrays & Hashing',
      acceptanceRate: 67.5,
      userStatus: 'TODO',
      timeLimitMs: 1500,
      memoryLimitMb: 256,
      tags: ['Array', 'Hash Table', 'String'],
      statement: `Given an array of strings \`strs\`, group **the anagrams** together. You can return the answer in **any order**.

### Constraints:
- \`1 <= strs.length <= 10^4\`
- \`0 <= strs[i].length <= 100\`
- \`strs[i]\` consists of lowercase English letters.`,
      sampleTestCases: [
        {
          id: 1,
          input: 'strs = ["eat","tea","tan","ate","nat","bat"]',
          expectedOutput: '[["bat"],["nat","tan"],["ate","eat","tea"]]',
          isSample: true
        },
        { id: 2, input: 'strs = [""]', expectedOutput: '[[""]]', isSample: true }
      ],
      starterCode: {
        'TypeScript': `function groupAnagrams(strs: string[]): string[][] {
    const map = new Map<string, string[]>();
    for (const str of strs) {
        const key = str.split('').sort().join('');
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(str);
    }
    return Array.from(map.values());
}`,
        'JavaScript': `function groupAnagrams(strs) {
    const map = new Map();
    for (const str of strs) {
        const key = str.split('').sort().join('');
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(str);
    }
    return Array.from(map.values());
}`,
        'Python': `from collections import defaultdict

class Solution:
    def groupAnagrams(self, strs: list[str]) -> list[list[str]]:
        ans = defaultdict(list)
        for s in strs:
            ans[tuple(sorted(s))].append(s)
        return list(ans.values())`,
        'C++': `#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>
using namespace std;

class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string, vector<string>> mp;
        for (const string& s : strs) {
            string key = s;
            sort(key.begin(), key.end());
            mp[key].push_back(s);
        }
        vector<vector<string>> result;
        for (auto& pair : mp) result.push_back(move(pair.second));
        return result;
    }
};`,
        'Java': `import java.util.*;

class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> map = new HashMap<>();
        for (String s : strs) {
            char[] chars = s.toCharArray();
            Arrays.sort(chars);
            String key = String.valueOf(chars);
            map.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
        }
        return new ArrayList<>(map.values());
    }
}`
      }
    },
    {
      id: 4,
      slug: 'valid-palindrome',
      title: 'Valid Palindrome',
      difficulty: 'EASY',
      category: 'Two Pointers',
      acceptanceRate: 46.1,
      userStatus: 'SOLVED',
      timeLimitMs: 1000,
      memoryLimitMb: 128,
      tags: ['Two Pointers', 'String'],
      statement: `A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Given a string \`s\`, return \`true\` *if it is a palindrome, or* \`false\` *otherwise*.

### Constraints:
- \`1 <= s.length <= 2 * 10^5\`
- \`s\` consists only of printable ASCII characters.`,
      sampleTestCases: [
        {
          id: 1,
          input: 's = "A man, a plan, a canal: Panama"',
          expectedOutput: 'true',
          explanation: '"amanaplanacanalpanama" is a palindrome.',
          isSample: true
        },
        {
          id: 2,
          input: 's = "race a car"',
          expectedOutput: 'false',
          explanation: '"raceacar" is not a palindrome.',
          isSample: true
        }
      ],
      starterCode: {
        'TypeScript': `function isPalindrome(s: string): boolean {
    const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    let left = 0;
    let right = cleaned.length - 1;
    while (left < right) {
        if (cleaned[left] !== cleaned[right]) return false;
        left++;
        right--;
    }
    return true;
}`,
        'JavaScript': `function isPalindrome(s) {
    const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    let l = 0, r = cleaned.length - 1;
    while (l < r) {
        if (cleaned[l] !== cleaned[r]) return false;
        l++;
        r--;
    }
    return true;
}`,
        'Python': `class Solution:
    def isPalindrome(self, s: str) -> bool:
        l, r = 0, len(s) - 1
        while l < r:
            while l < r and not s[l].isalnum():
                l += 1
            while l < r and not s[r].isalnum():
                r -= 1
            if s[l].lower() != s[r].lower():
                return False
            l += 1
            r -= 1
        return True`,
        'C++': `#include <string>
#include <cctype>
using namespace std;

class Solution {
public:
    bool isPalindrome(string s) {
        int l = 0, r = s.length() - 1;
        while (l < r) {
            while (l < r && !isalnum(s[l])) l++;
            while (l < r && !isalnum(s[r])) r--;
            if (tolower(s[l]) != tolower(s[r])) return false;
            l++;
            r--;
        }
        return true;
    }
};`,
        'Java': `class Solution {
    public boolean isPalindrome(String s) {
        int l = 0, r = s.length() - 1;
        while (l < r) {
            while (l < r && !Character.isLetterOrDigit(s.charAt(l))) l++;
            while (l < r && !Character.isLetterOrDigit(s.charAt(r))) r--;
            if (Character.toLowerCase(s.charAt(l)) != Character.toLowerCase(s.charAt(r))) return false;
            l++;
            r--;
        }
        return true;
    }
}`
      }
    },
    {
      id: 5,
      slug: '3sum',
      title: '3Sum',
      difficulty: 'MEDIUM',
      category: 'Two Pointers',
      acceptanceRate: 34.1,
      userStatus: 'ATTEMPTED',
      timeLimitMs: 2000,
      memoryLimitMb: 256,
      tags: ['Array', 'Two Pointers', 'Sorting'],
      statement: `Given an integer array \`nums\`, return all the triplets \`[nums[i], nums[j], nums[k]]\` such that \`i != j\`, \`i != k\`, and \`j != k\`, and \`nums[i] + nums[j] + nums[k] == 0\`.

Notice that the solution set must not contain duplicate triplets.

### Constraints:
- \`3 <= nums.length <= 3000\`
- \`-10^5 <= nums[i] <= 10^5\``,
      sampleTestCases: [
        {
          id: 1,
          input: 'nums = [-1,0,1,2,-1,-4]',
          expectedOutput: '[[-1,-1,2],[-1,0,1]]',
          isSample: true
        },
        {
          id: 2,
          input: 'nums = [0,1,1]',
          expectedOutput: '[]',
          isSample: true
        }
      ],
      starterCode: {
        'TypeScript': `function threeSum(nums: number[]): number[][] {
    nums.sort((a, b) => a - b);
    const res: number[][] = [];
    for (let i = 0; i < nums.length - 2; i++) {
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        let l = i + 1, r = nums.length - 1;
        while (l < r) {
            const sum = nums[i] + nums[l] + nums[r];
            if (sum === 0) {
                res.push([nums[i], nums[l], nums[r]]);
                while (l < r && nums[l] === nums[l + 1]) l++;
                while (l < r && nums[r] === nums[r - 1]) r--;
                l++;
                r--;
            } else if (sum < 0) {
                l++;
            } else {
                r--;
            }
        }
    }
    return res;
}`,
        'JavaScript': `function threeSum(nums) {
    nums.sort((a, b) => a - b);
    const res = [];
    for (let i = 0; i < nums.length - 2; i++) {
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        let l = i + 1, r = nums.length - 1;
        while (l < r) {
            const sum = nums[i] + nums[l] + nums[r];
            if (sum === 0) {
                res.push([nums[i], nums[l], nums[r]]);
                while (l < r && nums[l] === nums[l + 1]) l++;
                while (l < r && nums[r] === nums[r - 1]) r--;
                l++;
                r--;
            } else if (sum < 0) {
                l++;
            } else {
                r--;
            }
        }
    }
    return res;
}`,
        'Python': `class Solution:
    def threeSum(self, nums: list[int]) -> list[list[int]]:
        nums.sort()
        res = []
        for i in range(len(nums) - 2):
            if i > 0 and nums[i] == nums[i - 1]:
                continue
            l, r = i + 1, len(nums) - 1
            while l < r:
                s = nums[i] + nums[l] + nums[r]
                if s == 0:
                    res.append([nums[i], nums[l], nums[r]])
                    while l < r and nums[l] == nums[l + 1]:
                        l += 1
                    while l < r and nums[r] == nums[r - 1]:
                        r -= 1
                    l += 1
                    r -= 1
                elif s < 0:
                    l += 1
                else:
                    r -= 1
        return res`,
        'C++': `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        sort(nums.begin(), nums.end());
        vector<vector<int>> res;
        for (int i = 0; i < (int)nums.size() - 2; ++i) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int l = i + 1, r = nums.size() - 1;
            while (l < r) {
                int s = nums[i] + nums[l] + nums[r];
                if (s == 0) {
                    res.push_back({nums[i], nums[l], nums[r]});
                    while (l < r && nums[l] == nums[l + 1]) l++;
                    while (l < r && nums[r] == nums[r - 1]) r--;
                    l++; r--;
                } else if (s < 0) l++;
                else r--;
            }
        }
        return res;
    }
};`,
        'Java': `import java.util.*;

class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> res = new ArrayList<>();
        for (int i = 0; i < nums.length - 2; i++) {
            if (i > 0 && nums[i] == nums[i - 1]) continue;
            int l = i + 1, r = nums.length - 1;
            while (l < r) {
                int sum = nums[i] + nums[l] + nums[r];
                if (sum == 0) {
                    res.add(Arrays.asList(nums[i], nums[l], nums[r]));
                    while (l < r && nums[l] == nums[l + 1]) l++;
                    while (l < r && nums[r] == nums[r - 1]) r--;
                    l++; r--;
                } else if (sum < 0) l++;
                else r--;
            }
        }
        return res;
    }
}`
      }
    },
    {
      id: 6,
      slug: 'trapping-rain-water',
      title: 'Trapping Rain Water',
      difficulty: 'HARD',
      category: 'Two Pointers',
      acceptanceRate: 61.2,
      userStatus: 'TODO',
      timeLimitMs: 1500,
      memoryLimitMb: 256,
      tags: ['Array', 'Two Pointers', 'Dynamic Programming', 'Stack'],
      statement: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.

### Constraints:
- \`n == height.length\`
- \`1 <= n <= 2 * 10^4\`
- \`0 <= height[i] <= 10^5\``,
      sampleTestCases: [
        {
          id: 1,
          input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]',
          expectedOutput: '6',
          explanation: 'The elevation map traps 6 units of rain water.',
          isSample: true
        },
        {
          id: 2,
          input: 'height = [4,2,0,3,2,5]',
          expectedOutput: '9',
          isSample: true
        }
      ],
      starterCode: {
        'TypeScript': `function trap(height: number[]): number {
    let left = 0, right = height.length - 1;
    let leftMax = 0, rightMax = 0;
    let water = 0;

    while (left < right) {
        if (height[left] <= height[right]) {
            if (height[left] >= leftMax) {
                leftMax = height[left];
            } else {
                water += leftMax - height[left];
            }
            left++;
        } else {
            if (height[right] >= rightMax) {
                rightMax = height[right];
            } else {
                water += rightMax - height[right];
            }
            right--;
        }
    }
    return water;
}`,
        'JavaScript': `function trap(height) {
    let l = 0, r = height.length - 1;
    let lMax = 0, rMax = 0, water = 0;
    while (l < r) {
        if (height[l] <= height[r]) {
            height[l] >= lMax ? lMax = height[l] : water += lMax - height[l];
            l++;
        } else {
            height[r] >= rMax ? rMax = height[r] : water += rMax - height[r];
            r--;
        }
    }
    return water;
}`,
        'Python': `class Solution:
    def trap(self, height: list[int]) -> int:
        if not height:
            return 0
        l, r = 0, len(height) - 1
        l_max, r_max = 0, 0
        water = 0
        while l < r:
            if height[l] < height[r]:
                if height[l] >= l_max:
                    l_max = height[l]
                else:
                    water += l_max - height[l]
                l += 1
            else:
                if height[r] >= r_max:
                    r_max = height[r]
                else:
                    water += r_max - height[r]
                r -= 1
        return water`,
        'C++': `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int trap(vector<int>& height) {
        int l = 0, r = height.size() - 1;
        int lMax = 0, rMax = 0, water = 0;
        while (l < r) {
            if (height[l] <= height[r]) {
                if (height[l] >= lMax) lMax = height[l];
                else water += lMax - height[l];
                l++;
            } else {
                if (height[r] >= rMax) rMax = height[r];
                else water += rMax - height[r];
                r--;
            }
        }
        return water;
    }
};`,
        'Java': `class Solution {
    public int trap(int[] height) {
        int l = 0, r = height.length - 1;
        int lMax = 0, rMax = 0, water = 0;
        while (l < r) {
            if (height[l] <= height[r]) {
                if (height[l] >= lMax) lMax = height[l];
                else water += lMax - height[l];
                l++;
            } else {
                if (height[r] >= rMax) rMax = height[r];
                else water += rMax - height[r];
                r--;
            }
        }
        return water;
    }
}`
      }
    },
    {
      id: 7,
      slug: 'longest-substring-without-repeating-characters',
      title: 'Longest Substring Without Repeating Characters',
      difficulty: 'MEDIUM',
      category: 'Sliding Window',
      acceptanceRate: 34.8,
      userStatus: 'TODO',
      timeLimitMs: 1000,
      memoryLimitMb: 128,
      tags: ['Hash Table', 'String', 'Sliding Window'],
      statement: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.

### Constraints:
- \`0 <= s.length <= 5 * 10^4\`
- \`s\` consists of English letters, digits, symbols and spaces.`,
      sampleTestCases: [
        {
          id: 1,
          input: 's = "abcabcbb"',
          expectedOutput: '3',
          explanation: 'The answer is "abc", with the length of 3.',
          isSample: true
        },
        {
          id: 2,
          input: 's = "bbbbb"',
          expectedOutput: '1',
          explanation: 'The answer is "b", with the length of 1.',
          isSample: true
        }
      ],
      starterCode: {
        'TypeScript': `function lengthOfLongestSubstring(s: string): number {
    const seen = new Map<string, number>();
    let maxLen = 0;
    let start = 0;
    for (let end = 0; end < s.length; end++) {
        if (seen.has(s[end])) {
            start = Math.max(start, seen.get(s[end])! + 1);
        }
        seen.set(s[end], end);
        maxLen = Math.max(maxLen, end - start + 1);
    }
    return maxLen;
}`,
        'JavaScript': `function lengthOfLongestSubstring(s) {
    const seen = new Map();
    let maxLen = 0, start = 0;
    for (let end = 0; end < s.length; end++) {
        if (seen.has(s[end])) {
            start = Math.max(start, seen.get(s[end]) + 1);
        }
        seen.set(s[end], end);
        maxLen = Math.max(maxLen, end - start + 1);
    }
    return maxLen;
}`,
        'Python': `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        seen = {}
        max_len = 0
        start = 0
        for end, char in enumerate(s):
            if char in seen and seen[char] >= start:
                start = seen[char] + 1
            seen[char] = end
            max_len = max(max_len, end - start + 1)
        return max_len`,
        'C++': `#include <string>
#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        vector<int> last(256, -1);
        int maxLen = 0, start = 0;
        for (int i = 0; i < s.length(); ++i) {
            if (last[(unsigned char)s[i]] >= start) {
                start = last[(unsigned char)s[i]] + 1;
            }
            last[(unsigned char)s[i]] = i;
            maxLen = max(maxLen, i - start + 1);
        }
        return maxLen;
    }
};`,
        'Java': `import java.util.*;

class Solution {
    public int lengthOfLongestSubstring(String s) {
        Map<Character, Integer> seen = new HashMap<>();
        int maxLen = 0, start = 0;
        for (int end = 0; end < s.length(); end++) {
            char c = s.charAt(end);
            if (seen.containsKey(c) && seen.get(c) >= start) {
                start = seen.get(c) + 1;
            }
            seen.put(c, end);
            maxLen = Math.max(maxLen, end - start + 1);
        }
        return maxLen;
    }
}`
      }
    },
    {
      id: 8,
      slug: 'valid-parentheses',
      title: 'Valid Parentheses',
      difficulty: 'EASY',
      category: 'Stack',
      acceptanceRate: 40.5,
      userStatus: 'SOLVED',
      timeLimitMs: 1000,
      memoryLimitMb: 128,
      tags: ['String', 'Stack'],
      statement: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

### Constraints:
- \`1 <= s.length <= 10^4\`
- \`s\` consists of parentheses only \`'()[]{}'.\``,
      sampleTestCases: [
        { id: 1, input: 's = "()"', expectedOutput: 'true', isSample: true },
        { id: 2, input: 's = "()[]{}"', expectedOutput: 'true', isSample: true },
        { id: 3, input: 's = "(]"', expectedOutput: 'false', isSample: true }
      ],
      starterCode: {
        'TypeScript': `function isValid(s: string): boolean {
    const stack: string[] = [];
    const map: Record<string, string> = { ')': '(', '}': '{', ']': '[' };
    for (const char of s) {
        if (map[char]) {
            if (stack.pop() !== map[char]) return false;
        } else {
            stack.push(char);
        }
    }
    return stack.length === 0;
}`,
        'JavaScript': `function isValid(s) {
    const stack = [];
    const pairs = { ')': '(', '}': '{', ']': '[' };
    for (let c of s) {
        if (pairs[c]) {
            if (stack.pop() !== pairs[c]) return false;
        } else {
            stack.push(c);
        }
    }
    return stack.length === 0;
}`,
        'Python': `class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        mapping = {")": "(", "}": "{", "]": "["}
        for char in s:
            if char in mapping:
                top = stack.pop() if stack else '#'
                if mapping[char] != top:
                    return False
            else:
                stack.append(char)
        return not stack`,
        'C++': `#include <string>
#include <stack>
#include <unordered_map>
using namespace std;

class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        unordered_map<char, char> mp = {{')', '('}, {'}', '{'}, {']', '['}};
        for (char c : s) {
            if (mp.count(c)) {
                if (st.empty() || st.top() != mp[c]) return false;
                st.pop();
            } else {
                st.push(c);
            }
        }
        return st.empty();
    }
};`,
        'Java': `import java.util.*;

class Solution {
    public boolean isValid(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}`
      }
    },
    {
      id: 9,
      slug: 'binary-search',
      title: 'Binary Search',
      difficulty: 'EASY',
      category: 'Binary Search',
      acceptanceRate: 57.3,
      userStatus: 'SOLVED',
      timeLimitMs: 1000,
      memoryLimitMb: 128,
      tags: ['Array', 'Binary Search'],
      statement: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, then return its index. Otherwise, return \`-1\`.

You must write an algorithm with \`O(log n)\` runtime complexity.

### Constraints:
- \`1 <= nums.length <= 10^4\`
- \`-10^4 < nums[i], target < 10^4\`
- All the integers in \`nums\` are **unique**.
- \`nums\` is sorted in ascending order.`,
      sampleTestCases: [
        {
          id: 1,
          input: 'nums = [-1,0,3,5,9,12], target = 9',
          expectedOutput: '4',
          explanation: '9 exists in nums and its index is 4',
          isSample: true
        },
        {
          id: 2,
          input: 'nums = [-1,0,3,5,9,12], target = 2',
          expectedOutput: '-1',
          explanation: '2 does not exist in nums so return -1',
          isSample: true
        }
      ],
      starterCode: {
        'TypeScript': `function search(nums: number[], target: number): number {
    let low = 0, high = nums.length - 1;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (nums[mid] === target) return mid;
        if (nums[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
        'JavaScript': `function search(nums, target) {
    let low = 0, high = nums.length - 1;
    while (low <= high) {
        const mid = (low + high) >> 1;
        if (nums[mid] === target) return mid;
        if (nums[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
        'Python': `class Solution:
    def search(self, nums: list[int], target: int) -> int:
        l, r = 0, len(nums) - 1
        while l <= r:
            mid = (l + r) // 2
            if nums[mid] == target:
                return mid
            elif nums[mid] < target:
                l = mid + 1
            else:
                r = mid - 1
        return -1`,
        'C++': `#include <vector>
using namespace std;

class Solution {
public:
    int search(vector<int>& nums, int target) {
        int l = 0, r = nums.size() - 1;
        while (l <= r) {
            int mid = l + (r - l) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) l = mid + 1;
            else r = mid - 1;
        }
        return -1;
    }
};`,
        'Java': `class Solution {
    public int search(int[] nums, int target) {
        int l = 0, r = nums.length - 1;
        while (l <= r) {
            int mid = l + (r - l) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) l = mid + 1;
            else r = mid - 1;
        }
        return -1;
    }
}`
      }
    },
    {
      id: 10,
      slug: 'coin-change',
      title: 'Coin Change',
      difficulty: 'MEDIUM',
      category: 'Dynamic Programming',
      acceptanceRate: 43.8,
      userStatus: 'TODO',
      timeLimitMs: 2000,
      memoryLimitMb: 256,
      tags: ['Array', 'Dynamic Programming', 'Breadth-First Search'],
      statement: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return *the fewest number of coins that you need to make up that amount*. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.

You may assume that you have an infinite number of each kind of coin.

### Constraints:
- \`1 <= coins.length <= 12\`
- \`1 <= coins[i] <= 2^31 - 1\`
- \`0 <= amount <= 10^4\``,
      sampleTestCases: [
        {
          id: 1,
          input: 'coins = [1,2,5], amount = 11',
          expectedOutput: '3',
          explanation: '11 = 5 + 5 + 1',
          isSample: true
        },
        {
          id: 2,
          input: 'coins = [2], amount = 3',
          expectedOutput: '-1',
          isSample: true
        }
      ],
      starterCode: {
        'TypeScript': `function coinChange(coins: number[], amount: number): number {
    const dp = new Array(amount + 1).fill(Infinity);
    dp[0] = 0;
    for (let i = 1; i <= amount; i++) {
        for (const coin of coins) {
            if (i - coin >= 0) {
                dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }
    }
    return dp[amount] === Infinity ? -1 : dp[amount];
}`,
        'JavaScript': `function coinChange(coins, amount) {
    const dp = new Array(amount + 1).fill(Infinity);
    dp[0] = 0;
    for (let i = 1; i <= amount; i++) {
        for (const coin of coins) {
            if (i - coin >= 0) {
                dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }
    }
    return dp[amount] === Infinity ? -1 : dp[amount];
}`,
        'Python': `class Solution:
    def coinChange(self, coins: list[int], amount: int) -> int:
        dp = [float('inf')] * (amount + 1)
        dp[0] = 0
        for i in range(1, amount + 1):
            for c in coins:
                if i - c >= 0:
                    dp[i] = min(dp[i], dp[i - c] + 1)
        return dp[amount] if dp[amount] != float('inf') else -1`,
        'C++': `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        vector<int> dp(amount + 1, amount + 1);
        dp[0] = 0;
        for (int i = 1; i <= amount; ++i) {
            for (int c : coins) {
                if (i - c >= 0) dp[i] = min(dp[i], dp[i - c] + 1);
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
};`,
        'Java': `import java.util.Arrays;

class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int i = 1; i <= amount; i++) {
            for (int coin : coins) {
                if (i - coin >= 0) dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
}`
      }
    }
  ];

  readonly recentSubmissions: SubmissionHistoryItem[] = [
    {
      id: 101,
      problemId: 1,
      problemSlug: 'two-sum',
      problemTitle: 'Two Sum',
      difficulty: 'EASY',
      language: 'TypeScript',
      status: 'ACCEPTED',
      passedTestCases: 5,
      totalTestCases: 5,
      executionTimeMs: 42,
      memoryUsedKb: 38400,
      submittedAt: '12 minutes ago',
      sourceCode: `function twoSum(nums: number[], target: number): number[] {
    const map = new Map<number, number>();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement)!, i];
        }
        map.set(nums[i], i);
    }
    return [];
}`
    },
    {
      id: 102,
      problemId: 2,
      problemSlug: 'valid-anagram',
      problemTitle: 'Valid Anagram',
      difficulty: 'EASY',
      language: 'TypeScript',
      status: 'ACCEPTED',
      passedTestCases: 3,
      totalTestCases: 3,
      executionTimeMs: 58,
      memoryUsedKb: 39100,
      submittedAt: '2 hours ago',
      sourceCode: `function isAnagram(s: string, t: string): boolean {
    if (s.length !== t.length) return false;
    const counts = new Array(26).fill(0);
    for (let i = 0; i < s.length; i++) {
        counts[s.charCodeAt(i) - 97]++;
        counts[t.charCodeAt(i) - 97]--;
    }
    return counts.every(c => c === 0);
}`
    },
    {
      id: 103,
      problemId: 5,
      problemSlug: '3sum',
      problemTitle: '3Sum',
      difficulty: 'MEDIUM',
      language: 'TypeScript',
      status: 'WRONG ANSWER',
      passedTestCases: 1,
      totalTestCases: 2,
      executionTimeMs: 110,
      memoryUsedKb: 45200,
      submittedAt: 'Yesterday',
      sourceCode: `function threeSum(nums: number[]): number[][] {
    nums.sort((a, b) => a - b);
    const result: number[][] = [];
    for (let i = 0; i < nums.length - 2; i++) {
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        let left = i + 1;
        let right = nums.length - 1;
        while (left < right) {
            const sum = nums[i] + nums[left] + nums[right];
            if (sum === 0) {
                result.push([nums[i], nums[left], nums[right]]);
                left++;
                right--;
            } else if (sum < 0) {
                left++;
            } else {
                right--;
            }
        }
    }
    return result;
}`
    },
    {
      id: 104,
      problemId: 8,
      problemSlug: 'valid-parentheses',
      problemTitle: 'Valid Parentheses',
      difficulty: 'EASY',
      language: 'TypeScript',
      status: 'ACCEPTED',
      passedTestCases: 3,
      totalTestCases: 3,
      executionTimeMs: 38,
      memoryUsedKb: 37800,
      submittedAt: '3 days ago',
      sourceCode: `function isValid(s: string): boolean {
    const stack: string[] = [];
    const map: Record<string, string> = { ')': '(', '}': '{', ']': '[' };
    for (const char of s) {
        if (char === '(' || char === '{' || char === '[') {
            stack.push(char);
        } else if (stack.pop() !== map[char]) {
            return false;
        }
    }
    return stack.length === 0;
}`
    },
    {
      id: 105,
      problemId: 9,
      problemSlug: 'binary-search',
      problemTitle: 'Binary Search',
      difficulty: 'EASY',
      language: 'TypeScript',
      status: 'ACCEPTED',
      passedTestCases: 2,
      totalTestCases: 2,
      executionTimeMs: 29,
      memoryUsedKb: 36500,
      submittedAt: '5 days ago',
      sourceCode: `function search(nums: number[], target: number): number {
    let left = 0;
    let right = nums.length - 1;
    while (left <= right) {
        const mid = Math.floor(left + (right - left) / 2);
        if (nums[mid] === target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}`
    }
  ];

  readonly learningPaths: LearningPath[] = [
    {
      id: 'alg-fundamentals',
      slug: 'algorithm-fundamentals',
      title: 'Algorithmic Problem-Solving Core',
      description: 'Master the fundamental algorithmic patterns used in FAANG interviews and competitive programming.',
      level: 'Beginner',
      difficulty: 'EASY',
      totalModules: 4,
      completedModules: 3,
      estimatedHours: 18,
      topics: [
        {
          name: 'Hash Maps & Fast Lookups',
          description: 'Convert O(N^2) brute forces into O(N) linear solutions with hash sets and key-value mapping.',
          problemsCount: 4,
          completedCount: 3,
          problems: [
            { slug: 'two-sum', title: 'Two Sum', difficulty: 'EASY', solved: true },
            { slug: 'valid-anagram', title: 'Valid Anagram', difficulty: 'EASY', solved: true },
            { slug: 'group-anagrams', title: 'Group Anagrams', difficulty: 'MEDIUM', solved: false }
          ]
        },
        {
          name: 'Two Pointers & In-Place Processing',
          description: 'Techniques for sorted arrays, palindrome checking, and boundary shrinking.',
          problemsCount: 3,
          completedCount: 1,
          problems: [
            { slug: 'valid-palindrome', title: 'Valid Palindrome', difficulty: 'EASY', solved: true },
            { slug: '3sum', title: '3Sum', difficulty: 'MEDIUM', solved: false },
            { slug: 'trapping-rain-water', title: 'Trapping Rain Water', difficulty: 'HARD', solved: false }
          ]
        },
        {
          name: 'Sliding Window',
          description: 'Fixed and dynamic length window strategies to solve substring and subarray problems.',
          problemsCount: 2,
          completedCount: 0,
          problems: [
            { slug: 'longest-substring-without-repeating-characters', title: 'Longest Substring Without Repeating Characters', difficulty: 'MEDIUM', solved: false }
          ]
        },
        {
          name: 'Stack Invariants & Monotonic Structures',
          description: 'LIFO parsing, matching delimiters, and monotonic stack algorithms.',
          problemsCount: 2,
          completedCount: 1,
          problems: [
            { slug: 'valid-parentheses', title: 'Valid Parentheses', difficulty: 'EASY', solved: true }
          ]
        }
      ]
    },
    {
      id: 'data-structures',
      slug: 'essential-data-structures',
      title: 'Data Structures Mastery',
      description: 'In-depth mastery of linear and non-linear memory representations, recursion, and tree traversals.',
      level: 'Intermediate',
      difficulty: 'MEDIUM',
      totalModules: 5,
      completedModules: 1,
      estimatedHours: 24,
      topics: [
        {
          name: 'Binary Search & Monotonic Predicates',
          description: 'Divide-and-conquer on sorted ranges and search-space reduction.',
          problemsCount: 3,
          completedCount: 1,
          problems: [
            { slug: 'binary-search', title: 'Binary Search', difficulty: 'EASY', solved: true }
          ]
        },
        {
          name: 'Dynamic Programming Foundations',
          description: 'Subproblems, recurrence relations, memoization, and bottom-up tabulation.',
          problemsCount: 4,
          completedCount: 0,
          problems: [
            { slug: 'coin-change', title: 'Coin Change', difficulty: 'MEDIUM', solved: false }
          ]
        }
      ]
    }
  ];

  getUserStats(): UserStats {
    return {
      totalSolved: 5,
      totalProblems: 10,
      solvedByDifficulty: {
        easy: 4,
        totalEasy: 5,
        medium: 1,
        totalMedium: 4,
        hard: 0,
        totalHard: 1
      },
      acceptanceRate: 80.0,
      currentStreakDays: 4,
      totalSubmissions: 12
    };
  }

  getTopicProgress(): TopicProgress[] {
    return [
      { category: 'Arrays & Hashing', solved: 2, total: 3, percentage: 66 },
      { category: 'Two Pointers', solved: 1, total: 3, percentage: 33 },
      { category: 'Sliding Window', solved: 0, total: 1, percentage: 0 },
      { category: 'Stack', solved: 1, total: 1, percentage: 100 },
      { category: 'Binary Search', solved: 1, total: 1, percentage: 100 },
      { category: 'Dynamic Programming', solved: 0, total: 1, percentage: 0 }
    ];
  }
}
