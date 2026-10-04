// Central Courses Catalog
export const COURSES = [
  {
    id: 'dsa-core',
    title: 'Data Structures & Algorithms Foundations',
    subtitle: 'Complete roadmap from linear arrays to dynamic programming with real-world system mappings',
    progress: 68,
    xpTotal: 2400,
    modules: [
      {
        id: 'module-1',
        name: 'Module 1: Linear Structures & Two-Pointer Windows',
        lessons: [
          { id: '1.1', title: 'Array Contiguity & Memory Cache Locality (L1/L2 Cache)', duration: '20 mins', completed: true },
          { id: '1.2', title: 'Two-Pointer Technique & Container With Most Water', duration: '25 mins', completed: true },
          { id: '1.3', title: 'Sliding Window Invariants & Maximum Subarray Modulo K', duration: '35 mins', completed: true },
          { id: '1.4', title: 'Prefix Sum Hash Lookup Optimization', duration: '30 mins', completed: false }
        ]
      },
      {
        id: 'module-2',
        name: 'Module 2: Trees, Heaps & Balanced BSTs',
        lessons: [
          { id: '2.1', title: 'Binary Trees & Recursion Call Stacks', duration: '25 mins', completed: true },
          { id: '2.2', title: 'Self-Balancing Red-Black Trees vs AVL Rotations', duration: '40 mins', completed: false },
          { id: '2.3', title: 'Priority Queues & CPU Kernel Task Schedulers', duration: '30 mins', completed: false },
          { id: '2.4', title: 'Segment Trees & Dynamic Range Query Trees', duration: '45 mins', completed: false }
        ]
      },
      {
        id: 'module-3',
        name: 'Module 3: Graph Traversal & Shortest Paths',
        lessons: [
          { id: '3.1', title: 'Breadth-First Search & Unweighted Shortest Path', duration: '30 mins', completed: false },
          { id: '3.2', title: 'Dijkstra & A* Heuristic Search in Transit Routing', duration: '40 mins', completed: false },
          { id: '3.3', title: 'Topological Sort & Compiler Dependency Resolution DAGs', duration: '35 mins', completed: false }
        ]
      }
    ]
  },
  {
    id: 'system-design',
    title: 'CS Systems & Distributed Architecture',
    subtitle: 'From operating system internals to distributed consensus and high-throughput caches',
    progress: 42,
    xpTotal: 3200,
    modules: [
      {
        id: 'module-1',
        name: 'Module 1: Operating Systems & Low-Level Memory',
        lessons: [
          { id: '1.1', title: 'Virtual Memory, Page Faults, and Linux cgroups', duration: '30 mins', completed: true },
          { id: '1.2', title: 'LRU Cache Eviction Architecture & Memory Pinning', duration: '40 mins', completed: true },
          { id: '1.3', title: 'Event-driven Async I/O (epoll & kqueue) Internals', duration: '35 mins', completed: false }
        ]
      },
      {
        id: 'module-2',
        name: 'Module 2: Distributed Consensus & Replication',
        lessons: [
          { id: '2.1', title: 'CAP Theorem & Quorum Consistency Guarantees', duration: '30 mins', completed: false },
          { id: '2.2', title: 'Raft & Paxos Log Replication Algorithms', duration: '45 mins', completed: false },
          { id: '2.3', title: 'Vector Clocks & Dynamo-style Conflict Resolution', duration: '40 mins', completed: false }
        ]
      }
    ]
  }
];

export function getCourseById(id) {
  return COURSES.find(c => c.id === id) || COURSES[0];
}
