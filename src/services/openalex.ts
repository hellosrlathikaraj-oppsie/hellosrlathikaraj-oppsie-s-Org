import { Professor, Publication, UserProfile } from '../types';
import { scoring } from './scoring';
import { storage } from './storage';

export const MOCK_PROFESSORS: Professor[] = [
  {
    id: 'prof-1',
    name: 'Dr. Sarah Mitchell',
    initials: 'SM',
    avatarBg: 'bg-indigo-600',
    title: 'Associate Professor of Computer Science',
    institution: 'Stanford University',
    department: 'Computer Systems Laboratory (CSL)',
    city: 'Stanford, CA',
    country: 'United States',
    hIndex: 44,
    totalCitations: 9820,
    primaryField: 'Computer Systems',
    researchTopics: [
      'Distributed Systems',
      'Disaggregated Memory',
      'CXL Interconnects',
      'Fault Tolerance',
      'Kernel Bypassing (RDMA)'
    ],
    bio: 'Leads the Scalable Systems Group at Stanford. Her research focuses on distributed operating systems, rack-scale memory disaggregation over CXL, and fault-tolerant consensus for extreme low-latency clusters.',
    email: 'smitchell@cs.stanford.edu',
    emailConfidence: 96,
    emailSource: 'Stanford Faculty Directory',
    googleScholarUrl: 'https://scholar.google.com',
    labWebsiteUrl: 'https://csl.stanford.edu/~smitchell',
    suggestedHookSnippet: 'Connecting memory tiering in heterogeneous CXL clusters with asynchronous replication logs.',
    matchingScore: 94,
    matchReasons: [
      'Shared research focus on Distributed Systems & Fault Tolerance',
      'Recent OSDI 2025 paper matches your Paxos and consensus background',
      'Active lab recruiting for upcoming academic year'
    ],
    recentPublications: [
      {
        id: 'pub-101',
        title: 'CXL-MemMesh: Seamless Disaggregated Memory Pooling with Zero-Copy Crash Consistency',
        venue: 'OSDI 2025',
        year: 2025,
        citations: 42,
        primaryTopic: 'Disaggregated Memory',
        abstractSnippet: 'Presents a hardware-cooperative memory pooling protocol that achieves 1.8x throughput over conventional RDMA page-fault schemes by exploiting CXL.mem transaction ordering primitives.'
      },
      {
        id: 'pub-102',
        title: 'Speculative Quorum Reconfiguration in Heterogeneous Datacenters',
        venue: 'SOSP 2024',
        year: 2024,
        citations: 88,
        primaryTopic: 'Consensus Protocols',
        abstractSnippet: 'Demonstrates a dynamic reconfiguration technique for Raft-based state machines that eliminates stop-the-world synchronization pauses during node churn.'
      },
      {
        id: 'pub-103',
        title: 'Demystifying Persistent Memory Latency Traps in Microsecond Systems',
        venue: 'EuroSys 2023',
        year: 2023,
        citations: 154,
        primaryTopic: 'Fault Tolerance',
        abstractSnippet: 'Analyzes cache-line flush behaviors in PCIe NVMe vs Optane arrays, proposing an epoch-based flush coalescer for microsecond durability guarantees.'
      }
    ]
  },
  {
    id: 'prof-2',
    name: 'Prof. David K. Reed',
    initials: 'DR',
    avatarBg: 'bg-emerald-600',
    title: 'Professor of Electrical Engineering & Computer Science',
    institution: 'MIT CSAIL',
    department: 'Parallel and Distributed Operating Systems (PDOS)',
    city: 'Cambridge, MA',
    country: 'United States',
    hIndex: 58,
    totalCitations: 18450,
    primaryField: 'Computer Systems',
    researchTopics: [
      'Consensus Protocols',
      'Byzantine Fault Tolerance',
      'Formal Verification',
      'Distributed Storage',
      'Rust Systems Programming'
    ],
    bio: 'Directs research on formally verified distributed systems and secure consensus protocols at MIT CSAIL. Co-developer of several foundational protocol verification frameworks.',
    email: 'dkreed@mit.edu',
    emailConfidence: 94,
    emailSource: 'MIT CSAIL Directory',
    googleScholarUrl: 'https://scholar.google.com',
    labWebsiteUrl: 'https://pdos.csail.mit.edu/~reed',
    suggestedHookSnippet: 'Formalizing dynamic leader election invariants using interactive theorem provers.',
    matchingScore: 91,
    matchReasons: [
      'High overlap in Consensus Protocols and Formal Verification (TLA+)',
      'Extensive Rust-based systems development in recent projects',
      'Recent SOSP 2024 best paper on verified BFT consensus'
    ],
    recentPublications: [
      {
        id: 'pub-201',
        title: 'VeriRaft: Mechanical Proofs of Asynchronous State Machine Replication in Dafny',
        venue: 'SOSP 2024',
        year: 2024,
        citations: 67,
        primaryTopic: 'Formal Verification',
        abstractSnippet: 'Constructs the first fully mechanized proof of Raft with joint consensus log compaction that executes directly on verified runtime binaries.'
      },
      {
        id: 'pub-202',
        title: 'Microsecond BFT: High-Throughput Ordering under Partially Synchronous Networks',
        venue: 'NSDI 2024',
        year: 2024,
        citations: 112,
        primaryTopic: 'Consensus Protocols',
        abstractSnippet: 'Introduces pipelined threshold signatures over QUIC streams to drive Byzantine fault-tolerant consensus down to sub-100-microsecond commit latencies.'
      },
      {
        id: 'pub-203',
        title: 'Towards Provably Crash-Safe Distributed Key-Value Engines',
        venue: 'FAST 2023',
        year: 2023,
        citations: 95,
        primaryTopic: 'Distributed Storage',
        abstractSnippet: 'Explores compositional verification for LSM-tree compaction pipelines under unexpected power cuts and partial write failures.'
      }
    ]
  },
  {
    id: 'prof-3',
    name: 'Dr. Elena Rostova',
    initials: 'ER',
    avatarBg: 'bg-amber-600',
    title: 'Associate Professor of Computer Science',
    institution: 'Carnegie Mellon University',
    department: 'Computer Science Department (CSD)',
    city: 'Pittsburgh, PA',
    country: 'United States',
    hIndex: 38,
    totalCitations: 7420,
    primaryField: 'Machine Learning Systems',
    researchTopics: [
      'ML Systems (LLM Serving)',
      'GPU Memory Paging',
      'Distributed Systems',
      'Mixture-of-Experts Serving',
      'Compiler Optimizations'
    ],
    bio: 'Her research bridges deep learning infrastructure and systems architecture, focusing on memory-efficient inference for trillion-parameter models, pipeline parallelism, and heterogeneous GPU clusters.',
    email: 'erostova@cs.cmu.edu',
    emailConfidence: 95,
    emailSource: 'CMU School of Computer Science',
    googleScholarUrl: 'https://scholar.google.com',
    labWebsiteUrl: 'https://csd.cmu.edu/~erostova',
    suggestedHookSnippet: 'Speculative paging for KV-cache offloading during long-context LLM generation.',
    matchingScore: 89,
    matchReasons: [
      'Direct match on ML Systems and LLM serving infrastructure',
      'Combines low-level C++ memory management with PyTorch runtime internals',
      'Leading contributor to open-source inference execution engines'
    ],
    recentPublications: [
      {
        id: 'pub-301',
        title: 'PagedAttention-Next: Zero-Fragment KV Cache Management for Trillion-Token Contexts',
        venue: 'MLSys 2025',
        year: 2025,
        citations: 180,
        primaryTopic: 'ML Systems (LLM Serving)',
        abstractSnippet: 'Addresses memory fragmentation and PCIe bottleneck in multi-turn conversational agents with a tree-structured virtual memory paging abstraction.'
      },
      {
        id: 'pub-302',
        title: 'Decentralized Mixture-of-Experts Routing over Bandwidth-Constrained Topologies',
        venue: 'NeurIPS 2024',
        year: 2024,
        citations: 135,
        primaryTopic: 'Mixture-of-Experts Serving',
        abstractSnippet: 'Formulates expert assignment as an online min-cost network flow problem, cutting cross-node communication overhead by 47%.'
      },
      {
        id: 'pub-303',
        title: 'Kernel-Fusion Compilers for Dynamic Precision Transformer Blocks',
        venue: 'ASPLOS 2024',
        year: 2024,
        citations: 78,
        primaryTopic: 'Compiler Optimizations',
        abstractSnippet: 'Presents an automatic JIT code generator that synthesizes fused matrix-multiply and normalization kernels tailored to FP8 and INT4 hardware.'
      }
    ]
  },
  {
    id: 'prof-4',
    name: 'Prof. Marcus Vance',
    initials: 'MV',
    avatarBg: 'bg-purple-600',
    title: 'Paul G. Allen Professor of Computer Science & Engineering',
    institution: 'University of Washington',
    department: 'Paul G. Allen School of CSE',
    city: 'Seattle, WA',
    country: 'United States',
    hIndex: 51,
    totalCitations: 14200,
    primaryField: 'Computer Systems & OS',
    researchTopics: [
      'Operating Systems',
      'Microkernels',
      'Formal Verification',
      'Capability-Based Security',
      'Hardware-Software Co-Design'
    ],
    bio: 'Focuses on designing high-assurance system software from bare metal up. Investigates capability-based microkernels, verified device drivers, and architectures that resist side-channel attacks.',
    email: 'mvance@cs.washington.edu',
    emailConfidence: 91,
    emailSource: 'UW Allen School Directory',
    googleScholarUrl: 'https://scholar.google.com',
    labWebsiteUrl: 'https://cs.washington.edu/people/faculty/mvance',
    suggestedHookSnippet: 'Hardware-enforced memory capabilities for microkernel IPC with verified Rust contracts.',
    matchingScore: 87,
    matchReasons: [
      'Strong match in Formal Verification and safe systems programming (Rust/C++)',
      'Pioneering work in capability-based capability architectures (CHERI)',
      'Consistent publication record in SOSP, OSDI, and PLDI'
    ],
    recentPublications: [
      {
        id: 'pub-401',
        title: 'VeriKernel: A Mechanically Verified Capability-Based OS in Rust',
        venue: 'OSDI 2025',
        year: 2025,
        citations: 54,
        primaryTopic: 'Microkernels',
        abstractSnippet: 'Introduces a microkernel architecture where all IPC capability transfers and scheduler safety properties are verified against temporal logic specifications.'
      },
      {
        id: 'pub-402',
        title: 'Zero-Overhead Memory Safety with Compartmentalized RISC-V Capabilities',
        venue: 'ISCA 2024',
        year: 2024,
        citations: 92,
        primaryTopic: 'Capability-Based Security',
        abstractSnippet: 'Evaluates architectural extensions that eliminate MMU page table walks for intra-process spatial memory safety isolation.'
      }
    ]
  },
  {
    id: 'prof-5',
    name: 'Dr. Jennifer Lin',
    initials: 'JL',
    avatarBg: 'bg-cyan-600',
    title: 'Assistant Professor of Computer Science & Engineering',
    institution: 'UC San Diego',
    department: 'Department of Computer Science & Engineering',
    city: 'La Jolla, CA',
    country: 'United States',
    hIndex: 26,
    totalCitations: 3180,
    primaryField: 'Storage & Database Systems',
    researchTopics: [
      'Distributed Storage',
      'Non-Volatile Memory',
      'Database Internals',
      'LSM-Trees',
      'Key-Value Stores'
    ],
    bio: 'Her lab designs high-performance database engines and persistent memory storage hierarchies. Works closely with industry partners on SSD firmware optimizations and RocksDB extensions.',
    email: 'jenniferlin@ucsd.edu',
    emailConfidence: 93,
    emailSource: 'UCSD CSE Directory',
    googleScholarUrl: 'https://scholar.google.com',
    labWebsiteUrl: 'https://cseweb.ucsd.edu/~jlin',
    suggestedHookSnippet: 'Dynamic write-amplification mitigation in tiered flash storage using learned bloom filters.',
    matchingScore: 86,
    matchReasons: [
      'Shared interest in distributed key-value stores and storage engine internals',
      'Experience in low-level C++ and concurrency control',
      'Mentors numerous undergraduate and master thesis researchers'
    ],
    recentPublications: [
      {
        id: 'pub-501',
        title: 'FlashTier: Adaptive Write-Amplification Mitigation across ZNS and CXL-SSDs',
        venue: 'FAST 2025',
        year: 2025,
        citations: 31,
        primaryTopic: 'Distributed Storage',
        abstractSnippet: 'Demonstrates a tiered write allocator that leverages zoned namespaces (ZNS) to avoid double buffering in high-concurrency log-structured databases.'
      },
      {
        id: 'pub-502',
        title: 'Learned Index Compaction in Multi-Tenant Key-Value Stores',
        venue: 'VLDB 2024',
        year: 2024,
        citations: 86,
        primaryTopic: 'Database Internals',
        abstractSnippet: 'Introduces a lightweight piecewise linear approximation model inside LSM SSTables to compress index blocks by 68% without hurting point lookup latency.'
      }
    ]
  },
  {
    id: 'prof-6',
    name: 'Dr. Robert Morris-Blake',
    initials: 'RM',
    avatarBg: 'bg-rose-600',
    title: 'Associate Professor of Computer Science',
    institution: 'UC Berkeley',
    department: 'EECS Department',
    city: 'Berkeley, CA',
    country: 'United States',
    hIndex: 41,
    totalCitations: 11200,
    primaryField: 'Robotics & Distributed Control',
    researchTopics: [
      'Robotics & RL',
      'Distributed Control Systems',
      'Real-Time Safety',
      'Formal Verification',
      'Autonomous Systems'
    ],
    bio: 'Investigates safety-critical autonomous systems, multi-agent consensus control, and reinforcement learning with formal guarantees for aerial and ground robotic swarms.',
    email: null, // INTENTIONALLY NULL to showcase "No email found, add manually" state!
    emailConfidence: 0,
    emailSource: 'Unlisted in public directory',
    googleScholarUrl: 'https://scholar.google.com',
    labWebsiteUrl: 'https://eecs.berkeley.edu/~rmb',
    suggestedHookSnippet: 'Safety certificates for multi-robot consensus using control barrier functions under intermittent network packet loss.',
    matchingScore: 82,
    matchReasons: [
      'Intersection of Distributed Consensus and Real-Time Control',
      'Formal verification applications in cyber-physical platforms',
      'Recent ICRA/IROS best paper nominee'
    ],
    recentPublications: [
      {
        id: 'pub-601',
        title: 'Safe Swarm Consensus under Asynchronous Delay and Packet Drops',
        venue: 'ICRA 2025',
        year: 2025,
        citations: 38,
        primaryTopic: 'Distributed Control Systems',
        abstractSnippet: 'Derives robust Lyapunov barrier certificates ensuring collision-free consensus among 50+ autonomous drones under lossy Wi-Fi links.'
      },
      {
        id: 'pub-602',
        title: 'Reinforcement Learning with Certified Control Barrier Functions',
        venue: 'CoRL 2024',
        year: 2024,
        citations: 104,
        primaryTopic: 'Robotics & RL',
        abstractSnippet: 'Integrates quadratic programming safety filters directly into policy gradients to guarantee zero physical boundary violations during training.'
      }
    ]
  },
  {
    id: 'prof-7',
    name: 'Prof. Amanda Patel',
    initials: 'AP',
    avatarBg: 'bg-teal-600',
    title: 'Professor of Computer Science',
    institution: 'Cornell University',
    department: 'Cornell Bowers CIS',
    city: 'Ithaca, NY',
    country: 'United States',
    hIndex: 47,
    totalCitations: 13900,
    primaryField: 'Computer Systems & Networks',
    researchTopics: [
      'Distributed Systems',
      'Edge Computing',
      'P2P Networks',
      'Fault Tolerance',
      'Decentralized Data'
    ],
    bio: 'Conducts research in large-scale decentralized systems, planet-scale peer-to-peer data distribution, and resilient edge compute fabrics for remote sensing applications.',
    email: 'apatel@cs.cornell.edu',
    emailConfidence: 94,
    emailSource: 'Cornell CIS Directory',
    googleScholarUrl: 'https://scholar.google.com',
    labWebsiteUrl: 'https://cs.cornell.edu/~apatel',
    suggestedHookSnippet: 'Hierarchical gossip protocols for consistency management across satellite-to-ground edge nodes.',
    matchingScore: 84,
    matchReasons: [
      'Distributed systems foundation in large-scale peer networks',
      'Fault tolerance mechanisms in high-churn environments',
      'Pioneered robust epidemic dissemination algorithms'
    ],
    recentPublications: [
      {
        id: 'pub-701',
        title: 'SatelliteMesh: Asynchronous Log Gossip for Constellation Relays',
        venue: 'MobiCom 2024',
        year: 2024,
        citations: 62,
        primaryTopic: 'P2P Networks',
        abstractSnippet: 'Solves intermittent orbital link synchronization by batching vector-clock summaries into scheduled low-earth-orbit laser downlink windows.'
      }
    ]
  },
  {
    id: 'prof-8',
    name: 'Dr. Thomas Craig',
    initials: 'TC',
    avatarBg: 'bg-blue-600',
    title: 'Associate Professor of Computer Science',
    institution: 'Princeton University',
    department: 'Department of Computer Science',
    city: 'Princeton, NJ',
    country: 'United States',
    hIndex: 35,
    totalCitations: 6100,
    primaryField: 'Computer Architecture & Systems',
    researchTopics: [
      'Disaggregated Memory',
      'Computer Architecture',
      'Hardware-Software Co-Design',
      'Heterogeneous Computing',
      'Fault Tolerance'
    ],
    bio: 'Designs memory hierarchies and accelerator interconnects for next-generation datacenters, with emphasis on optical switches and near-memory computing.',
    email: 'tcraig@princeton.edu',
    emailConfidence: 92,
    emailSource: 'Princeton CS Directory',
    googleScholarUrl: 'https://scholar.google.com',
    labWebsiteUrl: 'https://cs.princeton.edu/~tcraig',
    suggestedHookSnippet: 'Optical interconnect switching for sub-microsecond optical disaggregated memory pools.',
    matchingScore: 81,
    matchReasons: [
      'Hardware-software interface for disaggregated clusters',
      'Synergy with distributed memory research questions',
      'Active NSF sponsored testbed for graduate students'
    ],
    recentPublications: [
      {
        id: 'pub-801',
        title: 'OptiPool: Reconfigurable Optical Backplanes for Disaggregated Memory Racks',
        venue: 'MICRO 2024',
        year: 2024,
        citations: 74,
        primaryTopic: 'Disaggregated Memory',
        abstractSnippet: 'Evaluates silicon photonics switches that route memory bus packets with 10ns reconfiguration latency, bypassing electrical packet switch contention.'
      }
    ]
  }
];

export const openalex = {
  /**
   * Search professors with optional query and filters, recalculating fit score dynamically
   * based on current user profile.
   */
  async searchProfessors(
    query = '',
    filters?: {
      field?: string;
      institution?: string;
      minScore?: number;
      sortBy?: 'fit' | 'citations' | 'hIndex';
    }
  ): Promise<Professor[]> {
    // Simulate slight async response
    await new Promise(resolve => setTimeout(resolve, 200));

    const profile = storage.getProfile();
    const q = query.trim().toLowerCase();

    let list = MOCK_PROFESSORS.map(prof => {
      // Recalculate dynamic fit score with current profile
      const scoringResult = scoring.calculateFitScore(prof, profile);
      // Check for manually saved email
      const customEmail = storage.getCustomEmail(prof.id);

      return {
        ...prof,
        email: customEmail || prof.email,
        matchingScore: scoringResult.totalScore,
        matchReasons: scoringResult.reasons,
      };
    });

    if (q) {
      list = list.filter(p => {
        return (
          p.name.toLowerCase().includes(q) ||
          p.institution.toLowerCase().includes(q) ||
          p.department.toLowerCase().includes(q) ||
          p.primaryField.toLowerCase().includes(q) ||
          p.researchTopics.some(t => t.toLowerCase().includes(q)) ||
          p.recentPublications.some(pub => pub.title.toLowerCase().includes(q))
        );
      });
    }

    if (filters?.field && filters.field !== 'All Fields') {
      list = list.filter(p => p.primaryField === filters.field || p.researchTopics.includes(filters.field!));
    }

    if (filters?.institution && filters.institution !== 'All Institutions') {
      list = list.filter(p => p.institution === filters.institution);
    }

    if (filters?.minScore) {
      list = list.filter(p => p.matchingScore >= filters.minScore!);
    }

    const sortBy = filters?.sortBy || 'fit';
    if (sortBy === 'fit') {
      list.sort((a, b) => b.matchingScore - a.matchingScore);
    } else if (sortBy === 'citations') {
      list.sort((a, b) => b.totalCitations - a.totalCitations);
    } else if (sortBy === 'hIndex') {
      list.sort((a, b) => b.hIndex - a.hIndex);
    }

    return list;
  },

  /**
   * Fetch single professor by ID
   */
  async getProfessorById(id: string): Promise<Professor | null> {
    await new Promise(resolve => setTimeout(resolve, 150));
    const found = MOCK_PROFESSORS.find(p => p.id === id);
    if (!found) return null;

    const profile = storage.getProfile();
    const scoringResult = scoring.calculateFitScore(found, profile);
    const customEmail = storage.getCustomEmail(found.id);

    return {
      ...found,
      email: customEmail || found.email,
      matchingScore: scoringResult.totalScore,
      matchReasons: scoringResult.reasons,
    };
  },

  getInstitutions(): string[] {
    const set = new Set<string>();
    MOCK_PROFESSORS.forEach(p => set.add(p.institution));
    return ['All Institutions', ...Array.from(set)];
  },

  getResearchFields(): string[] {
    const set = new Set<string>();
    MOCK_PROFESSORS.forEach(p => {
      set.add(p.primaryField);
      p.researchTopics.forEach(t => set.add(t));
    });
    return ['All Fields', 'Distributed Systems', 'Consensus Protocols', 'ML Systems (LLM Serving)', 'Formal Verification', 'Disaggregated Memory'];
  },

  /**
   * Generates a tailored cold outreach email draft and hook rationale.
   */
  generateEmailHook(
    professor: Professor,
    studentProfile: UserProfile,
    templateType: 'phd' | 'internship' | 'collaboration' = 'phd'
  ): {
    subject: string;
    hookRationale: string;
    body: string;
  } {
    const profLastName = professor.name.split(' ').slice(-1)[0];
    const topPaper = professor.recentPublications[0] || {
      title: 'Recent research on ' + professor.researchTopics[0],
      venue: 'recent publications',
      year: 2024
    };

    let subject = '';
    let goalStatement = '';

    if (templateType === 'phd') {
      subject = `Prospective PhD Applicant (${studentProfile.targetOpportunity || 'Fall 2027'}) - Research Inquiry on ${professor.researchTopics[0] || 'Distributed Systems'}`;
      goalStatement = `I am preparing applications for PhD programs in Computer Science for ${studentProfile.targetOpportunity || 'the upcoming academic cycle'} and would love to explore potential alignment with your lab's ongoing research directions.`;
    } else if (templateType === 'internship') {
      subject = `Research Internship Inquiry: ${studentProfile.fullName} (${studentProfile.currentInstitution || 'Undergraduate'}) - ${professor.researchTopics[0]}`;
      goalStatement = `I am writing to inquire about potential research assistantship or summer visiting student opportunities within your research group.`;
    } else {
      subject = `Inquiry regarding collaboration & paper on ${topPaper.title.slice(0, 45)}...`;
      goalStatement = `I have been studying your work on ${topPaper.title} and am reaching out to discuss potential collaboration and master's thesis research.`;
    }

    const hookRationale = `Connects your hands-on background in ${studentProfile.primaryInterests[0] || 'Distributed Systems'} and ${studentProfile.technicalSkills[0] || 'low-level systems'} directly with Dr. ${profLastName}'s ${topPaper.venue} paper ("${topPaper.title}"). It establishes immediate credibility through concrete technical grounding rather than generic flattery.`;

    const body = `Dear Dr. ${profLastName},

I hope this email finds you well.

My name is ${studentProfile.fullName || 'Alex Chen'}, and I am currently a ${studentProfile.currentDegree || 'Computer Science student'} at ${studentProfile.currentInstitution || 'UC Berkeley'}. ${goalStatement}

I recently read your ${topPaper.venue} paper, "${topPaper.title}," with great interest. In particular, I was fascinated by your approach to ${topPaper.primaryTopic || 'handling consistency and performance trade-offs'}. In my recent work, I built and verified an asynchronous consensus log, which sparked my deep interest in ${professor.researchTopics[0] || 'distributed systems'} and ${professor.researchTopics[1] || 'fault tolerance'}. 

Specifically, I would love to explore how your team plans to extend this approach to address ${professor.suggestedHookSnippet.toLowerCase()}

Given your group's leadership in this space, I would be deeply grateful for the opportunity to contribute to your research. I have attached my CV (${studentProfile.cvUrl || 'attached'}) and code repositories for your review.

If your schedule permits in the coming weeks, would you be open to a brief 10-15 minute conversation to discuss if my background might align with opportunities in your group?

Thank you very much for your time, consideration, and inspiring research.

Sincerely,

${studentProfile.fullName || 'Alex Chen'}
${studentProfile.currentInstitution || 'UC Berkeley'} | ${studentProfile.currentDegree || 'Computer Science'}
${studentProfile.email || 'alex.chen@cs.university.edu'}
${studentProfile.githubUrl ? `GitHub: ${studentProfile.githubUrl}` : ''}
${studentProfile.portfolioUrl ? `Portfolio: ${studentProfile.portfolioUrl}` : ''}`.trim();

    return {
      subject,
      hookRationale,
      body,
    };
  }
};
