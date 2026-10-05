// Structured contests catalog
export const CONTESTS = [
  {
    id: 'c0000000-0000-0000-0000-000000000014',
    title: 'DETOX Global Championship: Division 1 & 2',
    status: 'Live',
    startTime: 'Today, 20:00 UTC',
    duration: '2 hours',
    participantsCount: 428,
    rules: 'Strict Server-Authoritative Clock, Fullscreen Lock, Reverse-Clipboard Paste Purge, 3-Strike Disqualification.',
    description: 'Premier timed community coding contest featuring 4 algorithmic subtasks evaluated inside isolated sandboxes.',
    problems: [
      { id: 'A', slug: 'maximum-subarray-sum-modulo-k', title: 'Dynamic Prefix Range Sum', points: 100, solvedCount: 412 },
      { id: 'B', slug: 'shortest-path-dag', title: 'Topological DAG Dependency Scheduler', points: 250, solvedCount: 184 },
      { id: 'C', slug: 'container-with-most-water', title: 'Geometric Invariant Water Volume', points: 500, solvedCount: 42 },
      { id: 'D', slug: 'burst-balloons', title: 'Persistent Treap Matrix Interval', points: 750, solvedCount: 8 }
    ]
  },
  {
    id: 'detox-weekly-round-42',
    title: 'DETOX Weekly Speed Sprint #42',
    status: 'Upcoming',
    startTime: 'Tomorrow, 15:00 UTC',
    duration: '90 mins',
    participantsCount: 186,
    rules: 'Rapid-fire algorithmic sprint with decaying point curves and attempt penalties.',
    description: 'Weekly community contest to maintain ICPC/IOI contest sharpness and ladder rankings.',
    problems: [
      { id: 'A', slug: 'two-sum', title: 'Two Sum Fast Hashing', points: 100, solvedCount: 0 },
      { id: 'B', slug: 'container-with-most-water', title: 'Container With Most Water', points: 250, solvedCount: 0 },
      { id: 'C', slug: 'lru-cache-eviction', title: 'LRU Cache Design', points: 500, solvedCount: 0 }
    ]
  },
  {
    id: 'icpc-regional-qualifier-2026',
    title: 'ICPC Regional Simulation 2026',
    status: 'Completed',
    startTime: 'Sep 26, 2026',
    duration: '5 hours',
    participantsCount: 892,
    rules: 'Full ICPC scoring rules: 1 freeze hour, penalty time calculations, and multi-test case verification.',
    description: 'Official collegiate simulation contested by top student teams across 42 institutions.',
    problems: [
      { id: 'A', slug: 'two-sum', title: 'Warmup Hashing', points: 100, solvedCount: 780 },
      { id: 'B', slug: 'maximum-subarray-sum-modulo-k', title: 'Modular Prefix Arithmetic', points: 300, solvedCount: 410 },
      { id: 'C', slug: 'shortest-path-dag', title: 'DAG Shortest Path', points: 500, solvedCount: 215 },
      { id: 'D', slug: 'burst-balloons', title: 'Matrix Burst DP', points: 800, solvedCount: 64 }
    ]
  }
];

export function getContestById(id) {
  return CONTESTS.find(c => c.id === id) || CONTESTS[0];
}
