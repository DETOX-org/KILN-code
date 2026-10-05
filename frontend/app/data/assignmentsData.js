// Assignments mock & structured data
export const ASSIGNMENTS = [
  {
    id: 'dsa-assignment-1',
    title: 'DSA Assignment 1: Linear Arrays & Two Pointers',
    course: 'Data Structures & Algorithms Foundations',
    instructor: 'Prof. Alan Vance',
    dueDate: 'Oct 05, 2026',
    progress: '6/10 Solved',
    completedCount: 6,
    totalCount: 10,
    instructions: 'Submit verified O(N) solutions for array traversal, sliding windows, and two-pointer geometric invariants. Ensure all hidden test cases pass.',
    problems: [
      { id: 45, slug: 'two-sum', title: 'Two Sum Optimal Lookup', difficulty: 'Easy', points: 20, status: 'Solved' },
      { id: 104, slug: 'container-with-most-water', title: 'Container With Most Water', difficulty: 'Medium', points: 40, status: 'Solved' },
      { id: 142, slug: 'maximum-subarray-sum-modulo-k', title: 'Maximum Subarray Sum with Modulo K', difficulty: 'Medium', points: 50, status: 'Solved' },
      { id: 215, slug: 'kth-largest-element', title: 'Kth Largest Element in an Array', difficulty: 'Medium', points: 45, status: 'Attempted' },
      { id: 88, slug: 'shortest-path-dag', title: 'Shortest Path in Directed Acyclic Graph', difficulty: 'Hard', points: 75, status: 'Unsolved' }
    ]
  },
  {
    id: 'algorithms-2',
    title: 'Algorithms 2: Dynamic Programming & Graphs',
    course: 'CS Systems & Algorithms',
    instructor: 'Dr. Maya Lin',
    dueDate: 'Oct 10, 2026',
    progress: '3/8 Solved',
    completedCount: 3,
    totalCount: 8,
    instructions: 'Analyze state transition recurrence relations and graph topological traversals. Submissions are checked for time complexity invariants.',
    problems: [
      { id: 88, slug: 'shortest-path-dag', title: 'Shortest Path in Directed Acyclic Graph', difficulty: 'Hard', points: 75, status: 'Solved' },
      { id: 312, slug: 'burst-balloons', title: 'Burst Balloons Optimal Matrix', difficulty: 'Hard', points: 90, status: 'Attempted' },
      { id: 142, slug: 'maximum-subarray-sum-modulo-k', title: 'Maximum Subarray Sum with Modulo K', difficulty: 'Medium', points: 50, status: 'Solved' },
      { id: 201, slug: 'lru-cache-eviction', title: 'LRU Cache Eviction Architecture', difficulty: 'Medium', points: 60, status: 'Unsolved' }
    ]
  },
  {
    id: 'python-basics',
    title: 'Systems & OS Architecture Laboratory',
    course: 'Operating Systems & Distributed Architecture',
    instructor: 'Eng. Marcus Reed',
    dueDate: 'Oct 15, 2026',
    progress: '10/10 Solved',
    completedCount: 10,
    totalCount: 10,
    instructions: 'Implement LRU page replacement, virtual memory cache line simulation, and event loop concurrency tests.',
    problems: [
      { id: 201, slug: 'lru-cache-eviction', title: 'LRU Cache Eviction Architecture', difficulty: 'Medium', points: 60, status: 'Solved' },
      { id: 520, slug: 'distributed-consensus-paxos', title: 'Distributed Consensus & Paxos Log Replication', difficulty: 'Expert', points: 150, status: 'Solved' }
    ]
  }
];

export function getAssignmentById(id) {
  return ASSIGNMENTS.find(a => a.id === id) || ASSIGNMENTS[0];
}
