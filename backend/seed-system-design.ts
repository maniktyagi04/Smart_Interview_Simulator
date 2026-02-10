import { PrismaClient, QuestionCategory, InterviewType, Domain, Difficulty, QuestionStatus, QuestionSource } from '@prisma/client';

const prisma = new PrismaClient();

const questions = [
  {
    title: "What is System Design? (HLD vs LLD)",
    problemStatement: "Design a system and explain which components belong to High-Level Design and which belong to Low-Level Design. How do responsibilities differ between the two?",
    topic: "System Design Basics",
    category: QuestionCategory.SYSTEM_DESIGN,
    type: InterviewType.TECHNICAL,
    domain: Domain.SYSTEM_DESIGN,
    difficulty: Difficulty.EASY,
    rubric: "Evaluate based on: Concept clarity, Separation of concerns, Communication skills",
    idealAnswer: "High-Level Design (HLD) focuses on system architecture, component interactions, scalability, and technology stack choices. Low-Level Design (LLD) details class diagrams, database schema, algorithms, and implementation logic.",
    keyConcepts: "HLD, LLD, Architecture, Components",
    content: "Design a system and explain which components belong to High-Level Design and which belong to Low-Level Design. How do responsibilities differ between the two?"
  },
  {
    title: "Client–Server Architecture",
    problemStatement: "Design a client–server architecture for an interview platform where thousands of students can start interviews simultaneously. What responsibilities stay on the client vs the server?",
    topic: "Architecture Patterns",
    category: QuestionCategory.SYSTEM_DESIGN,
    type: InterviewType.TECHNICAL,
    domain: Domain.SYSTEM_DESIGN,
    difficulty: Difficulty.MEDIUM,
    rubric: "Evaluate based on: Concept clarity, Separation of concerns, Communication skills",
    idealAnswer: "Client handles UI rendering, input validation, and local state. Server handles authentication, business logic, data persistence, and concurrency management.",
    keyConcepts: "Client-Server, Scalability, Concurrency",
    content: "Design a client–server architecture for an interview platform where thousands of students can start interviews simultaneously. What responsibilities stay on the client vs the server?"
  },
  {
    title: "HTTP vs HTTPS",
    problemStatement: "Design a secure API for a hiring platform. Explain how HTTPS works internally and what risks would exist if only HTTP were used.",
    topic: "Security",
    category: QuestionCategory.SYSTEM_DESIGN,
    type: InterviewType.TECHNICAL,
    domain: Domain.SYSTEM_DESIGN,
    difficulty: Difficulty.MEDIUM,
    rubric: "Evaluate based on: Concept clarity, Separation of concerns, Communication skills",
    idealAnswer: "HTTPS uses TLS/SSL to encrypt data in transit. HTTP sends data in plaintext, risking Man-in-the-Middle attacks and data interception.",
    keyConcepts: "HTTPS, SSL/TLS, Encryption, Security",
    content: "Design a secure API for a hiring platform. Explain how HTTPS works internally and what risks would exist if only HTTP were used."
  },
  {
    title: "REST APIs – Basics",
    problemStatement: "Design REST APIs for managing interview sessions. How would you structure endpoints, HTTP methods, and response codes?",
    topic: "API Design",
    category: QuestionCategory.SYSTEM_DESIGN,
    type: InterviewType.TECHNICAL,
    domain: Domain.SYSTEM_DESIGN,
    difficulty: Difficulty.MEDIUM,
    rubric: "Evaluate based on: Concept clarity, Separation of concerns, Communication skills",
    idealAnswer: "Use standard HTTP methods (GET, POST, PUT, DELETE). Resource-oriented URLs (e.g., /interviews, /interviews/:id). Proper status codes (200, 201, 400, 404, 500).",
    keyConcepts: "REST, API Design, HTTP Methods, Status Codes",
    content: "Design REST APIs for managing interview sessions. How would you structure endpoints, HTTP methods, and response codes?"
  },
  {
    title: "Vertical vs Horizontal Scaling",
    problemStatement: "Your interview system is facing traffic spikes during campus placement season. How would you scale the system? Compare vertical and horizontal scaling with trade-offs.",
    topic: "Scalability",
    category: QuestionCategory.SYSTEM_DESIGN,
    type: InterviewType.TECHNICAL,
    domain: Domain.SYSTEM_DESIGN,
    difficulty: Difficulty.MEDIUM,
    rubric: "Evaluate based on: Concept clarity, Separation of concerns, Communication skills",
    idealAnswer: "Vertical Scaling (Scale Up): Add more power (CPU, RAM) to existing server. Limit: hardware capacity. Horizontal Scaling (Scale Out): Add more servers. Infinite scale but requires load balancing and distributed systems complexity.",
    keyConcepts: "Scalability, Vertical Scaling, Horizontal Scaling",
    content: "Your interview system is facing traffic spikes during campus placement season. How would you scale the system? Compare vertical and horizontal scaling with trade-offs."
  },
  {
    title: "Load Balancing",
    problemStatement: "Design a load-balancing strategy for routing interview requests across multiple backend servers. What metrics would you consider?",
    topic: "Scalability",
    category: QuestionCategory.SYSTEM_DESIGN,
    type: InterviewType.TECHNICAL,
    domain: Domain.SYSTEM_DESIGN,
    difficulty: Difficulty.MEDIUM,
    rubric: "Evaluate based on: Concept clarity, Separation of concerns, Communication skills",
    idealAnswer: "Use Round Robin, Least Connections, or Weighted Round Robin. Consider metrics like server health, CPU load, and active connections.",
    keyConcepts: "Load Balancing, Routing Algorithms, Health Checks",
    content: "Design a load-balancing strategy for routing interview requests across multiple backend servers. What metrics would you consider?"
  },
  {
    title: "Caching Basics",
    problemStatement: "Design a caching layer for frequently accessed interview questions. What data should be cached and what should not?",
    topic: "Performance",
    category: QuestionCategory.SYSTEM_DESIGN,
    type: InterviewType.TECHNICAL,
    domain: Domain.SYSTEM_DESIGN,
    difficulty: Difficulty.MEDIUM,
    rubric: "Evaluate based on: Concept clarity, Separation of concerns, Communication skills",
    idealAnswer: "Cache read-heavy, static data like question details. Do not cache frequent writes or real-time data like chat history unless necessary. Use Redis or Memcached.",
    keyConcepts: "Caching, Redis, Cache Invalidation",
    content: "Design a caching layer for frequently accessed interview questions. What data should be cached and what should not?"
  },
  {
    title: "Rate Limiting",
    problemStatement: "Design a rate-limiting system to prevent abuse of the “Start Interview” API. How would you handle legitimate high traffic vs malicious users?",
    topic: "Security",
    category: QuestionCategory.SYSTEM_DESIGN,
    type: InterviewType.TECHNICAL,
    domain: Domain.SYSTEM_DESIGN,
    difficulty: Difficulty.HARD,
    rubric: "Evaluate based on: Concept clarity, Separation of concerns, Communication skills",
    idealAnswer: "Implement Token Bucket or Leaky Bucket algorithm. Rate limit by IP or User ID. Return 429 Too Many Requests.",
    keyConcepts: "Rate Limiting, Throttling, API Security",
    content: "Design a rate-limiting system to prevent abuse of the “Start Interview” API. How would you handle legitimate high traffic vs malicious users?"
  },
  {
    title: "SQL vs NoSQL",
    problemStatement: "Your system stores users, interviews, and questions. Which data would you store in SQL and which in NoSQL? Justify your choices.",
    topic: "Databases",
    category: QuestionCategory.SYSTEM_DESIGN,
    type: InterviewType.TECHNICAL,
    domain: Domain.SYSTEM_DESIGN,
    difficulty: Difficulty.MEDIUM,
    rubric: "Evaluate based on: Concept clarity, Separation of concerns, Communication skills",
    idealAnswer: "SQL (Relational) for structured data like Users, Transactions. NoSQL (Document/Key-Value) for unstructured data like chat logs, session metadata, or flexible question schemas.",
    keyConcepts: "SQL, NoSQL, Database Selection, ACID vs BASE",
    content: "Your system stores users, interviews, and questions. Which data would you store in SQL and which in NoSQL? Justify your choices."
  },
  {
    title: "Database Sharding",
    problemStatement: "Design a sharding strategy for storing interview results when the system grows to millions of users.",
    topic: "Databases",
    category: QuestionCategory.SYSTEM_DESIGN,
    type: InterviewType.TECHNICAL,
    domain: Domain.SYSTEM_DESIGN,
    difficulty: Difficulty.HARD,
    rubric: "Evaluate based on: Concept clarity, Separation of concerns, Communication skills",
    idealAnswer: "Shard by User ID or Region. Use Consistent Hashing to minimize data movement when resizing.",
    keyConcepts: "Sharding, Partitioning, Consistent Hashing",
    content: "Design a sharding strategy for storing interview results when the system grows to millions of users."
  },
  {
    title: "Replication",
    problemStatement: "Explain how database replication improves availability in an interview platform. What happens if the primary database goes down?",
    topic: "Databases",
    category: QuestionCategory.SYSTEM_DESIGN,
    type: InterviewType.TECHNICAL,
    domain: Domain.SYSTEM_DESIGN,
    difficulty: Difficulty.MEDIUM,
    rubric: "Evaluate based on: Concept clarity, Separation of concerns, Communication skills",
    idealAnswer: "Replication copies data to secondary nodes. Read replicas scale reads. If Primary fails, a Secondary is promoted (Failover). Improves fault tolerance and read performance.",
    keyConcepts: "Replication, Master-Slave, Failover, Availability",
    content: "Explain how database replication improves availability in an interview platform. What happens if the primary database goes down?"
  },
  {
    title: "CAP Theorem",
    problemStatement: "Your interview platform must always be available during placement drives. Which CAP properties would you prioritize and why?",
    topic: "Distributed Systems",
    category: QuestionCategory.SYSTEM_DESIGN,
    type: InterviewType.TECHNICAL,
    domain: Domain.SYSTEM_DESIGN,
    difficulty: Difficulty.HARD,
    rubric: "Evaluate based on: Concept clarity, Separation of concerns, Communication skills",
    idealAnswer: "Prioritize Availability (A) and Partition Tolerance (P) => AP system. Accept eventual consistency for features like likes/views, but strong consistency might be needed for interview scheduling (CP).",
    keyConcepts: "CAP Theorem, Consistency, Availability, Partition Tolerance",
    content: "Your interview platform must always be available during placement drives. Which CAP properties would you prioritize and why?"
  },
  {
    title: "Message Queues & Async Processing",
    problemStatement: "Design an asynchronous system for generating interview feedback reports after an interview ends.",
    topic: "Distributed Systems",
    category: QuestionCategory.SYSTEM_DESIGN,
    type: InterviewType.TECHNICAL,
    domain: Domain.SYSTEM_DESIGN,
    difficulty: Difficulty.MEDIUM,
    rubric: "Evaluate based on: Concept clarity, Separation of concerns, Communication skills",
    idealAnswer: "Use a Message Queue (RabbitMQ, Kafka) to decouple submission from report generation. Worker services consume events and generate reports asynchronously.",
    keyConcepts: "Message Queues, Async Processing, Decoupling",
    content: "Design an asynchronous system for generating interview feedback reports after an interview ends."
  },
  {
    title: "Failure Handling & Retries",
    problemStatement: "Design a retry mechanism for interview submission APIs. How do you prevent duplicate submissions?",
    topic: "Reliability",
    category: QuestionCategory.SYSTEM_DESIGN,
    type: InterviewType.TECHNICAL,
    domain: Domain.SYSTEM_DESIGN,
    difficulty: Difficulty.MEDIUM,
    rubric: "Evaluate based on: Concept clarity, Separation of concerns, Communication skills",
    idealAnswer: "Implement Exponential Backoff for retries. Use Idempotency Keys to prevent duplicate processing of the same request.",
    keyConcepts: "Retries, Exponential Backoff, Idempotency",
    content: "Design a retry mechanism for interview submission APIs. How do you prevent duplicate submissions?"
  },
  {
    title: "High Availability & Fault Tolerance",
    problemStatement: "Design the system so that interviews continue even if one service or region goes down.",
    topic: "Reliability",
    category: QuestionCategory.SYSTEM_DESIGN,
    type: InterviewType.TECHNICAL,
    domain: Domain.SYSTEM_DESIGN,
    difficulty: Difficulty.HARD,
    rubric: "Evaluate based on: Concept clarity, Separation of concerns, Communication skills",
    idealAnswer: "Deploy across multiple Availability Zones (AZs) or Regions. Use Load Balancers with health checks. Implement Circuit Breakers.",
    keyConcepts: "High Availability, Fault Tolerance, Multi-Region, Circuit Breaker",
    content: "Design the system so that interviews continue even if one service or region goes down."
  },
  {
    title: "Design URL Shortener",
    problemStatement: "Design a URL shortening service like bit.ly. Discuss scalability, collision handling, and data storage.",
    topic: "System Design Case Study",
    category: QuestionCategory.SYSTEM_DESIGN,
    type: InterviewType.TECHNICAL,
    domain: Domain.SYSTEM_DESIGN,
    difficulty: Difficulty.MEDIUM,
    rubric: "Evaluate based on: Concept clarity, Separation of concerns, Communication skills",
    idealAnswer: "Use a specialized Key Generation Service (KGS) or base62 encoding of database ID. value NoSQL/Key-Value store for fast lookups.",
    keyConcepts: "URL Shortener, Hashing, Base62, Database Design",
    content: "Design a URL shortening service like bit.ly. Discuss scalability, collision handling, and data storage."
  },
  {
    title: "Design Chat Application",
    problemStatement: "Design a real-time chat system for interviewer–candidate communication during interviews.",
    topic: "System Design Case Study",
    category: QuestionCategory.SYSTEM_DESIGN,
    type: InterviewType.TECHNICAL,
    domain: Domain.SYSTEM_DESIGN,
    difficulty: Difficulty.MEDIUM,
    rubric: "Evaluate based on: Concept clarity, Separation of concerns, Communication skills",
    idealAnswer: "Use WebSockets for real-time bi-directional communication. Store chat history in Cassandra or HBase/MongoDB for high write throughput.",
    keyConcepts: "Chat System, WebSockets, Real-time Communication, DB Choice",
    content: "Design a real-time chat system for interviewer–candidate communication during interviews."
  },
  {
    title: "Design Notification System",
    problemStatement: "Design a notification system to send interview reminders via email and push notifications.",
    topic: "System Design Case Study",
    category: QuestionCategory.SYSTEM_DESIGN,
    type: InterviewType.TECHNICAL,
    domain: Domain.SYSTEM_DESIGN,
    difficulty: Difficulty.MEDIUM,
    rubric: "Evaluate based on: Concept clarity, Separation of concerns, Communication skills",
    idealAnswer: "Service decouples notification type (email, SMS, push) from trigger. Use queues to buffer requests. Plug-in architecture for different providers (SendGrid, Twilio).",
    keyConcepts: "Notification Service, Pub/Sub, Provider Abstraction",
    content: "Design a notification system to send interview reminders via email and push notifications."
  },
  {
    title: "Design File Storage System",
    problemStatement: "Design a file storage system similar to Google Drive for storing interview recordings and documents.",
    topic: "System Design Case Study",
    category: QuestionCategory.SYSTEM_DESIGN,
    type: InterviewType.TECHNICAL,
    domain: Domain.SYSTEM_DESIGN,
    difficulty: Difficulty.HARD,
    rubric: "Evaluate based on: Concept clarity, Separation of concerns, Communication skills",
    idealAnswer: "Separate metadata (DB) from block storage (S3/Object Store). Chunk files for upload handling. Deduplication strategies.",
    keyConcepts: "File Storage, Block Storage, Metadata Management, Chunking",
    content: "Design a file storage system similar to Google Drive for storing interview recordings and documents."
  },
  {
    title: "Design Payment System (High-Level)",
    problemStatement: "Design a high-level payment system for paid mock interviews. Focus on security and reliability, not implementation details.",
    topic: "System Design Case Study",
    category: QuestionCategory.SYSTEM_DESIGN,
    type: InterviewType.TECHNICAL,
    domain: Domain.SYSTEM_DESIGN,
    difficulty: Difficulty.HARD,
    rubric: "Evaluate based on: Concept clarity, Separation of concerns, Communication skills",
    idealAnswer: "ACID transactions are critical. Idempotency is mandatory. PCI DSS compliance. Reconciliation process.",
    keyConcepts: "Payment Gateway, ACID, Idempotency, Security, Reconciliation",
    content: "Design a high-level payment system for paid mock interviews. Focus on security and reliability, not implementation details."
  }
];

async function main() {
  console.log('Seeding System Design questions...');
  
  for (const q of questions) {
    // Upsert to prevent duplicates if run multiple times
    // We'll trust title uniqueness roughly or just create new ones 
    // Since we don't have constraints on title, let's just create if not exists
    const existing = await prisma.question.findFirst({
        where: { title: q.title }
    });

    if (!existing) {
        await prisma.question.create({
            data: {
                ...q,
                status: QuestionStatus.ACTIVE,
                source: QuestionSource.ADMIN
            }
        });
        console.log(`Created: ${q.title}`);
    } else {
        console.log(`Skipped (exists): ${q.title}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
