// Central shared problems catalog for KILN / DETOX Code
export const PROBLEMS = [
  {
    id: 142,
    slug: 'maximum-subarray-sum-modulo-k',
    title: 'Maximum Subarray Sum with Modulo K',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    tags: ['Prefix Sums', 'Balanced BST', 'Binary Search'],
    acceptance: '48.2%',
    solved: true,
    points: 50,
    timeLimit: '1,500 ms',
    memoryLimit: '256 MB',
    realWorld: 'Kafka partition ring buffer windowing & financial rate-limiting',
    description: `Given an integer array \`nums\` of size \`N\` and a positive integer \`K\`, find the maximum possible sum of a non-empty contiguous subarray modulo \`K\`.
Formally, you wish to maximize:
\`(∑ nums[i...j]) mod K\` for \`0 ≤ i ≤ j < N\`.`,
    examples: [
      {
        input: 'nums = [3, 3, 9, 9, 5], k = 7',
        output: '6',
        explanation: 'Subarray [3, 3] has sum 6, 6 % 7 = 6. Maximum possible modulo is 6.'
      },
      {
        input: 'nums = [1, 2, 3], k = 2',
        output: '1',
        explanation: 'Subarray [1] has sum 1 % 2 = 1.'
      }
    ],
    constraints: [
      '1 ≤ nums.length ≤ 200,000',
      '1 ≤ nums[i] ≤ 10^9',
      '1 ≤ k ≤ 10^14'
    ],
    starterCodes: {
      cpp: `#include <vector>
#include <algorithm>
#include <iostream>

using namespace std;

class Solution {
public:
    int maxSubarraySumModuloK(vector<int>& nums, long long k) {
        long long current_sum = 0;
        long long max_mod_sum = 0;
        for (int x : nums) {
            current_sum = (current_sum + x) % k;
            max_mod_sum = max(max_mod_sum, current_sum);
        }
        return max_mod_sum;
    }
};`,
      python: `from typing import List
import bisect

class Solution:
    def maxSubarraySumModuloK(self, nums: List[int], k: int) -> int:
        prefix_sums = [0]
        cur_sum = 0
        max_val = 0
        for num in nums:
            cur_sum = (cur_sum + num) % k
            idx = bisect.bisect_right(prefix_sums, cur_sum)
            if idx < len(prefix_sums):
                max_val = max(max_val, (cur_sum - prefix_sums[idx] + k) % k)
            else:
                max_val = max(max_val, cur_sum)
            bisect.insort(prefix_sums, cur_sum)
        return max_val`,
      java: `import java.util.*;

class Solution {
    public long maxSubarraySumModuloK(int[] nums, long k) {
        TreeSet<Long> set = new TreeSet<>();
        set.add(0L);
        long currentSum = 0;
        long maxVal = 0;
        for (int num : nums) {
            currentSum = (currentSum + num) % k;
            Long higher = set.higher(currentSum);
            if (higher != null) {
                maxVal = Math.max(maxVal, (currentSum - higher + k) % k);
            } else {
                maxVal = Math.max(maxVal, currentSum);
            }
            set.add(currentSum);
        }
        return maxVal;
    }
}`
    }
  },
  {
    id: 45,
    slug: 'two-sum',
    title: 'Two Sum Optimal Lookup',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    tags: ['Hash Table', 'Arrays'],
    acceptance: '53.1%',
    solved: true,
    points: 20,
    timeLimit: '1,000 ms',
    memoryLimit: '128 MB',
    realWorld: 'SQL hash join index acceleration and packet filtering',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.
You may assume that each input would have exactly one solution, and you may not use the same element twice.`,
    examples: [
      {
        input: 'nums = [2, 7, 11, 15], target = 9',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3, 2, 4], target = 6',
        output: '[1, 2]',
        explanation: 'nums[1] + nums[2] == 6.'
      }
    ],
    constraints: [
      '2 ≤ nums.length ≤ 10^4',
      '-10^9 ≤ nums[i] ≤ 10^9',
      '-10^9 ≤ target ≤ 10^9',
      'Only one valid answer exists.'
    ],
    starterCodes: {
      cpp: `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); ++i) {
            int complement = target - nums[i];
            if (seen.count(complement)) return {seen[complement], i};
            seen[nums[i]] = i;
        }
        return {};
    }
};`,
      python: `from typing import List

class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in seen:
                return [seen[complement], i]
            seen[num] = i
        return []`,
      java: `import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int comp = target - nums[i];
            if (map.containsKey(comp)) return new int[] { map.get(comp), i };
            map.put(nums[i], i);
        }
        return new int[0];
    }
}`
    }
  },
  {
    id: 104,
    slug: 'container-with-most-water',
    title: 'Container With Most Water',
    difficulty: 'Medium',
    category: 'Two Pointers',
    tags: ['Two Pointers', 'Greedy', 'Arrays'],
    acceptance: '54.7%',
    solved: true,
    points: 40,
    timeLimit: '1,000 ms',
    memoryLimit: '128 MB',
    realWorld: 'Geometric histogram clipping in GPU rendering',
    description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i\`-th line are \`(i, 0)\` and \`(i, height[i])\`.
Find two lines that together with the x-axis form a container, such that the container contains the most water.
Return the maximum amount of water a container can store.`,
    examples: [
      {
        input: 'height = [1,8,6,2,5,4,8,3,7]',
        output: '49',
        explanation: 'The max area is formed between index 1 (height 8) and index 8 (height 7): min(8, 7) * (8 - 1) = 49.'
      }
    ],
    constraints: [
      'n == height.length',
      '2 ≤ n ≤ 10^5',
      '0 ≤ height[i] ≤ 10^4'
    ],
    starterCodes: {
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int maxArea(vector<int>& height) {
        int l = 0, r = height.size() - 1, maxA = 0;
        while (l < r) {
            maxA = max(maxA, min(height[l], height[r]) * (r - l));
            if (height[l] < height[r]) l++;
            else r--;
        }
        return maxA;
    }
};`,
      python: `from typing import List

class Solution:
    def maxArea(self, height: List[int]) -> int:
        l, r = 0, len(height) - 1
        max_a = 0
        while l < r:
            max_a = max(max_a, min(height[l], height[r]) * (r - l))
            if height[l] < height[r]:
                l += 1
            else:
                r -= 1
        return max_a`,
      java: `class Solution {
    public int maxArea(int[] height) {
        int l = 0, r = height.length - 1, max = 0;
        while (l < r) {
            max = Math.max(max, Math.min(height[l], height[r]) * (r - l));
            if (height[l] < height[r]) l++;
            else r--;
        }
        return max;
    }
}`
    }
  },
  {
    id: 88,
    slug: 'shortest-path-dag',
    title: 'Shortest Path in Directed Acyclic Graph',
    difficulty: 'Hard',
    category: 'Graphs',
    tags: ['Topological Sort', 'DAG', 'Dynamic Programming'],
    acceptance: '32.1%',
    solved: false,
    attempted: true,
    points: 75,
    timeLimit: '2,000 ms',
    memoryLimit: '256 MB',
    realWorld: 'Build dependency DAG execution in Turbo/Bazel & package resolution',
    description: `Given a weighted Directed Acyclic Graph (DAG) with \`V\` vertices and \`E\` edges, find the shortest path from a source vertex \`src\` to all other vertices.
Vertices are 0-indexed. If a vertex is unreachable from \`src\`, assign distance \`-1\`.`,
    examples: [
      {
        input: 'V = 6, E = 7, src = 0, edges = [[0,1,2],[0,4,1],[1,2,3],[4,2,2],[4,5,4],[2,3,6],[5,3,1]]',
        output: '[0, 2, 3, 6, 1, 5]',
        explanation: 'Topological order enables O(V + E) relaxation.'
      }
    ],
    constraints: [
      '1 ≤ V ≤ 10^5',
      '0 ≤ E ≤ 2 × 10^5',
      'Weights can be negative or positive.'
    ],
    starterCodes: {
      cpp: `#include <vector>
#include <queue>
using namespace std;

class Solution {
public:
    vector<int> shortestPathDAG(int V, int E, int src, vector<vector<int>>& edges) {
        // Implement topological sort + relaxation
        return {};
    }
};`,
      python: `from typing import List

class Solution:
    def shortestPathDAG(self, V: int, E: int, src: int, edges: List[List[int]]) -> List[int]:
        # Implement topological sort + relaxation
        return []`,
      java: `import java.util.*;

class Solution {
    public int[] shortestPathDAG(int V, int E, int src, int[][] edges) {
        return new int[V];
    }
}`
    }
  },
  {
    id: 201,
    slug: 'lru-cache-eviction',
    title: 'LRU Cache Eviction Architecture',
    difficulty: 'Medium',
    category: 'CS Systems',
    tags: ['Hash Map', 'Doubly Linked List', 'System Design'],
    acceptance: '41.5%',
    solved: true,
    points: 60,
    timeLimit: '1,500 ms',
    memoryLimit: '256 MB',
    realWorld: 'Redis memory maxmemory eviction policies and CPU cache hierarchy',
    description: `Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.
Implement the \`LRUCache\` class:
- \`LRUCache(int capacity)\` Initialize the LRU cache with positive size capacity.
- \`int get(int key)\` Return the value of the key if the key exists, otherwise return -1.
- \`void put(int key, int value)\` Update or insert key-value pair. If keys exceed capacity, evict the least recently used key.
Both functions must each run in \`O(1)\` average time complexity.`,
    examples: [
      {
        input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]',
        output: '[null, null, null, 1, null, -1, null, -1, 3, 4]',
        explanation: 'Key 2 is evicted on capacity overflow.'
      }
    ],
    constraints: [
      '1 ≤ capacity ≤ 3000',
      '0 ≤ key ≤ 10^4',
      '0 ≤ value ≤ 10^5',
      'At most 2 × 10^5 calls to get and put'
    ],
    starterCodes: {
      cpp: `#include <unordered_map>
using namespace std;

class LRUCache {
public:
    LRUCache(int capacity) {}
    int get(int key) { return -1; }
    void put(int key, int value) {}
};`,
      python: `class LRUCache:
    def __init__(self, capacity: int):
        pass
    def get(self, key: int) -> int:
        return -1
    def put(self, key: int, value: int) -> None:
        pass`,
      java: `class LRUCache {
    public LRUCache(int capacity) {}
    public int get(int key) { return -1; }
    public void put(int key, int value) {}
}`
    }
  },
  {
    id: 312,
    slug: 'burst-balloons',
    title: 'Burst Balloons Optimal Matrix',
    difficulty: 'Hard',
    category: 'Dynamic Programming',
    tags: ['Interval DP', 'Memoization'],
    acceptance: '28.4%',
    solved: false,
    points: 90,
    timeLimit: '2,000 ms',
    memoryLimit: '256 MB',
    realWorld: 'Compiler AST register allocation optimization',
    description: `You are given \`n\` balloons, indexed from \`0\` to \`n - 1\`. Each balloon is painted with a number on it represented by an array \`nums\`. You are asked to burst all the balloons.
If you burst the \`i\`-th balloon, you will get \`nums[i - 1] * nums[i] * nums[i + 1]\` coins. If \`i - 1\` or \`i + 1\` goes out of bounds of the array, then treat it as if there is a balloon with a \`1\` painted on it.
Return the maximum coins you can collect by bursting the balloons wisely.`,
    examples: [
      {
        input: 'nums = [3, 1, 5, 8]',
        output: '167',
        explanation: 'nums = [3,1,5,8] --> [3,5,8] --> [3,8] --> [8] --> []\ncoins = 3*1*5 + 3*5*8 + 1*3*8 + 1*8*1 = 167'
      }
    ],
    constraints: [
      'n == nums.length',
      '1 ≤ n ≤ 300',
      '0 ≤ nums[i] ≤ 100'
    ],
    starterCodes: {
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    int maxCoins(vector<int>& nums) {
        return 0;
    }
};`,
      python: `from typing import List

class Solution:
    def maxCoins(self, nums: List[int]) -> int:
        return 0`,
      java: `class Solution {
    public int maxCoins(int[] nums) {
        return 0;
    }
}`
    }
  }
];

export function getProblemBySlug(slug) {
  return PROBLEMS.find(p => p.slug === slug || String(p.id) === slug) || PROBLEMS[0];
}
