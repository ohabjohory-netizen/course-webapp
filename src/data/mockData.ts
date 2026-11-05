import { Course, Student, StudentProgress, Instructor } from '../types';

export const CURRENT_INSTRUCTOR: Instructor = {
  id: 'inst-1',
  name: 'Dr. Elena Vance',
  title: 'Lead Software Architect & Distinguished Instructor',
  avatar: '/src/assets/images/avatar_instructor_lead_1793900720101.jpg',
  bio: 'Former principal systems architect at high-scale distributed companies with 14+ years of engineering leadership. Passionate about empowering engineers to master architecture, high-performance systems, and developer ergonomics.',
};

export const CURRENT_STUDENT: Student = {
  id: 'student-alex',
  name: 'Alex Rivera',
  email: 'alex.rivera@example.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  role: 'student',
  enrolledCourseIds: ['course-1', 'course-2'],
  joinedAt: '2026-09-12',
};

export const SAMPLE_STUDENTS: Student[] = [
  CURRENT_STUDENT,
  {
    id: 'student-maya',
    name: 'Maya Lin',
    email: 'maya.lin@engineering.org',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    role: 'student',
    enrolledCourseIds: ['course-1', 'course-3'],
    joinedAt: '2026-10-01',
  },
  {
    id: 'student-marcus',
    name: 'Marcus Chen',
    email: 'm.chen@cloudsystems.io',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    role: 'student',
    enrolledCourseIds: ['course-1', 'course-4'],
    joinedAt: '2026-10-05',
  },
  {
    id: 'student-sophia',
    name: 'Sophia Patel',
    email: 'sophia.patel@biotechlabs.com',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    role: 'student',
    enrolledCourseIds: ['course-1', 'course-2', 'course-3'],
    joinedAt: '2026-08-20',
  },
  {
    id: 'student-user-email',
    name: 'Student Scholar',
    email: 'ohabjohory@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    role: 'student',
    enrolledCourseIds: ['course-1'],
    joinedAt: '2026-11-01',
  },
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-1',
    title: 'Full-Stack Web Engineering: Architecture to Production',
    slug: 'fullstack-web-engineering',
    tagline: 'Master modern full-stack systems, type-safe API boundaries, and resilient deployment pipelines.',
    description: 'An exhaustive masterclass for software developers transitioning to senior engineering roles. Covers end-to-end design patterns, concurrent state management, streaming protocols, relational query planning, and zero-downtime deployment pipelines.',
    category: 'Web Engineering',
    level: 'Advanced',
    durationHours: 18.5,
    price: 149,
    thumbnail: '/src/assets/images/course_fullstack_dev_1793900717844.jpg',
    instructor: CURRENT_INSTRUCTOR,
    enrolledCount: 348,
    rating: 4.9,
    ratingCount: 112,
    updatedAt: '2026-10-28',
    isPrivateCohort: true,
    allowedStudentEmails: [
      'ohabjohory@gmail.com',
      'alex.rivera@example.com',
      'maya.lin@engineering.org',
      'm.chen@cloudsystems.io',
      'sophia.patel@biotechlabs.com',
    ],
    learningObjectives: [
      'Design modular distributed frontends with type-safe backend integration',
      'Optimize database indexing, streaming endpoints, and memory budgets',
      'Architect robust testing pipelines and telemetry observability',
      'Ship zero-downtime containerized releases on automated CI/CD',
    ],
    prerequisites: [
      'Proficiency in JavaScript or TypeScript',
      'Fundamental understanding of client-server HTTP communication',
    ],
    modules: [
      {
        id: 'mod-1-1',
        title: 'Module 1: High-Performance Architecture Fundamentals',
        order: 1,
        lessons: [
          {
            id: 'les-1-1-1',
            title: '1.1 Principles of Resilient Application Architecture',
            description: 'Deconstruct modern system topologies, data flows, and trade-offs between monolithic modularity and event-driven services.',
            durationMinutes: 14,
            videoUrl: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
            videoType: 'youtube',
            youtubeVideoId: 'SqcY0GlETPk',
            isFreePreview: true,
            timestamps: [
              { timeSeconds: 0, label: '00:00 - Introduction & Core Constraints' },
              { timeSeconds: 120, label: '02:00 - Single-Source of Truth vs Replicated State' },
              { timeSeconds: 340, label: '05:40 - Network Boundaries & Serialization Latency' },
              { timeSeconds: 620, label: '10:20 - Event-Driven Microservices Trade-offs' },
            ],
            pdfLectureSheet: {
              title: 'Lecture Sheet 1.1: Distributed Invariants & Consistency Models',
              pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
              fileSize: '2.4 MB',
              pagesCount: 12,
              summary: 'Comprehensive reference notes covering high-concurrency architecture, CAP theorem compromises, Little\'s Law queuing calculations, and latency budgets.',
              keyTakeaways: [
                'Asynchronous worker queues isolate synchronous client requests from volatile processing spikes',
                'Event-driven topologies require strictly idempotent database consumer handlers',
                'Network boundaries must enforce contract-first schema verification before binary deserialization',
                'Read replicas require dynamic timeout fallback configurations (<= 250ms threshold)',
              ],
              sampleNotesContent: `DISTRIBUTED ARCHITECTURE CHEAT SHEET
=============================================
1. Queue & Latency Formulas:
   • Little's Law: L = λ × W
     (L = Concurrency depth, λ = Inbound req/sec, W = Residence duration)
   • Amdahl's Law Speedup: S(s) = 1 / ((1 - p) + (p / s))

2. Fault Tolerance Rules:
   • Circuit Breaker States: CLOSED (Healthy) -> OPEN (Tripped) -> HALF-OPEN (Testing)
   • Idempotency Header Standard: X-Idempotency-Key: UUIDv4 + Redis SETNX TTL: 86400s

3. Database Access Invariants:
   • Never execute unbounded SELECT * without pagination limit/cursor.
   • Connection Pool Sizing: Pool Size = (Core Count × 2) + Effective Spindle Count`,
            },
            resources: [
              { id: 'res-1', title: 'Lecture Sheet 1.1 (PDF)', fileType: 'pdf', size: '2.4 MB' },
              { id: 'res-2', title: 'System Architecture Checklist', fileType: 'pdf', size: '1.2 MB' },
            ],
            quiz: [
              {
                id: 'q-1-1-1',
                question: 'Which architecture pattern best guarantees predictable latencies under sudden traffic bursts?',
                options: [
                  'Synchronous cascading HTTP calls',
                  'Asynchronous queue-backed worker processing',
                  'Direct client database connections',
                  'In-memory unpersisted global variables',
                ],
                correctOptionIndex: 1,
                explanation: 'Asynchronous queues decouple client response time from heavy processing tasks, smoothing out sudden traffic spikes.',
              },
            ],
          },
          {
            id: 'les-1-1-2',
            title: '1.2 The JavaScript Event Loop & Asynchronous Runtimes',
            description: 'Exhaustive breakdown of microtasks, macrotasks, call stack execution, and non-blocking I/O patterns.',
            durationMinutes: 26,
            videoUrl: 'https://www.youtube.com/watch?v=8aGhZQkoFbQ',
            videoType: 'youtube',
            youtubeVideoId: '8aGhZQkoFbQ',
            timestamps: [
              { timeSeconds: 0, label: '00:00 - The Single-Threaded Myth' },
              { timeSeconds: 240, label: '04:00 - Call Stack & Web APIs' },
              { timeSeconds: 680, label: '11:20 - Microtask Queue vs Macrotask Queue' },
              { timeSeconds: 1100, label: '18:20 - Event Loop Starvation Prevention' },
            ],
            pdfLectureSheet: {
              title: 'Lecture Sheet 1.2: V8 Concurrency & Event Loop Mechanics',
              pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
              fileSize: '1.8 MB',
              pagesCount: 8,
              summary: 'Deep-dive reference diagrams on call stack execution order, Promise resolution pipelines, queue priorities, and preventing UI freezing.',
              keyTakeaways: [
                'Microtasks (Promises, queueMicrotask) execute immediately after the current script run, before any rendering phase',
                'Macrotasks (setTimeout, setInterval, I/O) yield control back to the event loop coordinator',
                'Recursive microtask queuing starves rendering cycles and locks browser execution',
              ],
              sampleNotesContent: `EVENT LOOP EXECUTION PRIORITY:
1. Current Synchronous Call Stack
2. Microtask Queue (process.nextTick, Promise.then, queueMicrotask)
3. Browser Render Step (Style -> Layout -> Paint)
4. Macrotask Queue (setTimeout, I/O, MessageChannel)

GOLDEN RULE: Never loop inside a microtask without yielding back to the task scheduler!`,
            },
            quiz: [
              {
                id: 'q-1-1-2',
                question: 'When does a Promise.then() callback execute relative to a setTimeout(..., 0) timer?',
                options: [
                  'Always before setTimeout because microtasks have higher priority than macrotasks',
                  'Always after setTimeout',
                  'Simultaneously on separate threads',
                  'In random order based on processor temperature',
                ],
                correctOptionIndex: 0,
                explanation: 'Promise handlers queue into the Microtask Queue, which is completely emptied before the engine picks the next macrotask.',
              },
            ],
          },
          {
            id: 'les-1-1-3',
            title: '1.3 Memory Profiling, Garbage Collection & Leak Mitigation',
            description: 'Diagnose memory leaks, optimize V8 generational garbage collection behavior, and structure thread pools for non-blocking I/O.',
            durationMinutes: 22,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            videoType: 'sample',
            timestamps: [
              { timeSeconds: 0, label: 'The Event Loop Execution Phasing' },
              { timeSeconds: 20, label: 'Heap Allocation Snapshots in Chrome DevTools' },
            ],
          },
        ],
      },
      {
        id: 'mod-1-2',
        title: 'Module 2: Resilient Data Layers & Query Strategy',
        order: 2,
        lessons: [
          {
            id: 'les-1-2-1',
            title: '2.1 Indexing Strategies & Query Planner Inspection',
            description: 'Deep dive into B-Trees, composite indexes, query execution trees, and analyzing slow query log outputs.',
            durationMinutes: 16,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            videoType: 'sample',
          },
        ],
      },
    ],
  },
  {
    id: 'course-2',
    title: 'Practical Data Science & Deep Learning Systems',
    slug: 'practical-data-science-systems',
    tagline: 'Build, evaluate, and operationalize high-performance predictive models and neural pipelines.',
    description: 'A hands-on, mathematically rigorous introduction to applied machine learning engineering. Learn feature engineering, loss landscape exploration, embedding indexers, vector search, and model evaluation telemetry.',
    category: 'Data Science',
    level: 'Intermediate',
    durationHours: 14.0,
    price: 119,
    thumbnail: '/src/assets/images/course_data_science_1793900720280.jpg',
    instructor: {
      id: 'inst-2',
      name: 'Dr. Aris Thorne',
      title: 'Head of Applied ML & Quantitative Research',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      bio: 'Published author in computer vision and neural compression. 10+ years deploying real-time statistical inference systems in production.',
    },
    enrolledCount: 284,
    rating: 4.8,
    ratingCount: 89,
    updatedAt: '2026-10-15',
    isPrivateCohort: true,
    allowedStudentEmails: [
      'ohabjohory@gmail.com',
      'alex.rivera@example.com',
      'david.kim@fintech-dev.net',
    ],
    learningObjectives: [
      'Master data preparation, normalization, and dimensional reduction',
      'Train gradient boosted ensembles and deep neural networks',
      'Implement approximate nearest neighbor vector similarity search',
      'Monitor model drift and prediction latency in production',
    ],
    prerequisites: ['Basic Python or TypeScript programming', 'Foundational linear algebra and probability'],
    modules: [
      {
        id: 'mod-2-1',
        title: 'Module 1: Vector Spaces & Embedding Geometry',
        order: 1,
        lessons: [
          {
            id: 'les-2-1-1',
            title: '1.1 Neural Networks & Vector Embeddings Explained Visually',
            description: 'Explore high-dimensional vector representations, matrix transformations, and dot-product attention mechanics.',
            durationMinutes: 19,
            videoUrl: 'https://www.youtube.com/watch?v=aircAruvnKk',
            videoType: 'youtube',
            youtubeVideoId: 'aircAruvnKk',
            pdfLectureSheet: {
              title: 'Lecture Sheet: Neural Embeddings & Vector Space Math',
              fileSize: '3.1 MB',
              pagesCount: 16,
              summary: 'Comprehensive mathematical formula sheet for dot-product attention, cosine angle calculations, and HNSW graphs.',
              keyTakeaways: [
                'Embeddings project complex multi-modal data onto dense continuous vector manifolds',
                'Cosine distance normalizes magnitude variances across tokens',
                'Hierarchical Navigable Small World (HNSW) graphs reduce vector search from O(N) to O(log N)',
              ],
            },
          },
        ],
      },
    ],
  },
  {
    id: 'course-3',
    title: 'Design Systems & Advanced UI/UX Architecture',
    slug: 'design-systems-advanced-ui-ux',
    tagline: 'Craft scalable component tokens, accessible interactions, and fluid micro-animations.',
    description: 'Transform chaotic interfaces into cohesive, atomic design systems. Master spatial math, color contrast ratios, accessible screen-reader trees, responsive fluid layouts, and ergonomic keyboard navigation.',
    category: 'Design Systems',
    level: 'Beginner',
    durationHours: 12.0,
    price: 89,
    thumbnail: '/src/assets/images/course_ui_ux_design_1793900718999.jpg',
    instructor: {
      id: 'inst-3',
      name: 'Camille Dubois',
      title: 'Principal Design Technologist',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      bio: 'Leading design systems lead with work featured across world-class digital design publications. Champion of WCAG AAA accessibility.',
    },
    enrolledCount: 412,
    rating: 5.0,
    ratingCount: 164,
    updatedAt: '2026-10-30',
    isPrivateCohort: false,
    allowedStudentEmails: [],
    learningObjectives: [
      'Construct hierarchical design token systems in Figma and CSS',
      'Enforce strict WCAG 2.2 AA accessibility and focus management',
      'Build composable, unstyled headless component architectures',
    ],
    prerequisites: ['Basic HTML/CSS understanding'],
    modules: [
      {
        id: 'mod-3-1',
        title: 'Module 1: Spatial Rhythms & Typographic Discipline',
        order: 1,
        lessons: [
          {
            id: 'les-3-1-1',
            title: '1.1 The Mathematical Basis of Spacing & Scale Ratios',
            description: 'Harmonize base-4/base-8 spacing systems with modular scale typography for natural visual hierarchy.',
            durationMinutes: 15,
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            videoType: 'sample',
          },
        ],
      },
    ],
  },
  {
    id: 'course-4',
    title: 'Cloud Infrastructure & Kubernetes at Scale',
    slug: 'cloud-infrastructure-kubernetes-scale',
    tagline: 'Automate container orchestration, service meshes, and observability pipelines.',
    description: 'Provision self-healing clusters, configure dynamic ingress controllers, automate blue-green deployments, and implement comprehensive distributed tracing across hybrid cloud providers.',
    category: 'Cloud & DevOps',
    level: 'Advanced',
    durationHours: 20.0,
    price: 179,
    thumbnail: '/src/assets/images/course_cloud_devops_1793900719607.jpg',
    instructor: CURRENT_INSTRUCTOR,
    enrolledCount: 195,
    rating: 4.9,
    ratingCount: 76,
    updatedAt: '2026-11-02',
    isPrivateCohort: true,
    allowedStudentEmails: [
      'ohabjohory@gmail.com',
      'm.chen@cloudsystems.io',
    ],
    learningObjectives: [
      'Configure production-grade Kubernetes worker pools and control planes',
      'Implement zero-trust mutual TLS with Envoy and Istio service mesh',
      'Instrument Prometheus metrics and OpenTelemetry distributed spans',
    ],
    prerequisites: ['Linux command line comfort', 'Docker container fundamentals'],
    modules: [
      {
        id: 'mod-4-1',
        title: 'Module 1: Pod Scheduling & Cluster Topologies',
        order: 1,
        lessons: [
          {
            id: 'les-4-1-1',
            title: '1.1 Kubernetes Architecture in 15 Minutes',
            description: 'Control plane breakdown: kube-apiserver, etcd quorum, kube-scheduler, and kubelet worker coordination.',
            durationMinutes: 15,
            videoUrl: 'https://www.youtube.com/watch?v=X48VuDVv0do',
            videoType: 'youtube',
            youtubeVideoId: 'X48VuDVv0do',
            pdfLectureSheet: {
              title: 'Lecture Sheet 1.1: Kubernetes Production Topology Blueprint',
              fileSize: '4.2 MB',
              pagesCount: 18,
              summary: 'Architecture topology diagrams showing multi-master etcd clustering, ingress controllers, network policies, and pod autoscaling formulas.',
              keyTakeaways: [
                'etcd requires an odd number of members (minimum 3) to sustain Raft consensus quorum',
                'Kubelet communicates exclusively with kube-apiserver, never directly with peers or etcd',
                'Resource requests dictate scheduling placement; limits dictate cgroup eviction thresholds',
              ],
            },
          },
        ],
      },
    ],
  },
];

export const INITIAL_PROGRESS: Record<string, StudentProgress> = {
  'student-alex_course-1': {
    courseId: 'course-1',
    studentId: 'student-alex',
    enrolledAt: '2026-10-10',
    lastActiveAt: '2026-11-04 18:32',
    completedLessonIds: ['les-1-1-1', 'les-1-1-2'],
    currentLessonId: 'les-1-1-3',
    videoWatchSeconds: {
      'les-1-1-1': 14,
      'les-1-1-2': 19,
      'les-1-1-3': 7,
    },
    quizScores: {
      'les-1-1-1': 100,
      'les-1-1-2': 100,
    },
    notes: [
      {
        id: 'note-1',
        courseId: 'course-1',
        lessonId: 'les-1-1-1',
        timestampSeconds: 120,
        text: 'Queue-based workers decouple HTTP clients from spiky background processing.',
        createdAt: '2026-10-12 14:22',
      },
      {
        id: 'note-2',
        courseId: 'course-1',
        lessonId: 'les-1-1-2',
        timestampSeconds: 680,
        text: 'Microtasks (Promises) always clear before macrotasks (setTimeout).',
        createdAt: '2026-10-14 09:15',
      },
    ],
    isCompleted: false,
  },
  'student-user-email_course-1': {
    courseId: 'course-1',
    studentId: 'student-user-email',
    enrolledAt: '2026-11-01',
    lastActiveAt: '2026-11-05 09:30',
    completedLessonIds: ['les-1-1-1'],
    currentLessonId: 'les-1-1-2',
    videoWatchSeconds: {
      'les-1-1-1': 840,
    },
    quizScores: {
      'les-1-1-1': 100,
    },
    notes: [
      {
        id: 'note-user-1',
        courseId: 'course-1',
        lessonId: 'les-1-1-1',
        timestampSeconds: 340,
        text: 'Review the Little\'s Law queuing formulas before the distributed systems exam.',
        createdAt: '2026-11-02 11:20',
      },
    ],
    isCompleted: false,
  },
};
