
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import { ArrowRight, Check, Search, AlertCircle, X } from 'lucide-react';

interface Topic {
    id: string;
    name: string;
    category: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface Section {
    title: string;
    topics: Topic[];
}


const SECTIONS: Section[] = [
    {
        title: 'Data Structures & Algorithms',
        topics: [
            // EASY
            { id: 'arrays', name: 'Arrays', category: 'DSA', difficulty: 'Easy' },
            { id: 'strings', name: 'Strings', category: 'DSA', difficulty: 'Easy' },
            { id: 'searching', name: 'Searching Algorithms (Linear, Binary)', category: 'DSA', difficulty: 'Easy' },
            { id: 'sorting', name: 'Sorting Algorithms (Bubble, Selection)', category: 'DSA', difficulty: 'Easy' },
            { id: 'hashing', name: 'Hashing (HashMap / HashSet)', category: 'DSA', difficulty: 'Easy' },
            { id: 'two-pointers', name: 'Two Pointers Technique', category: 'DSA', difficulty: 'Easy' },
            { id: 'prefix-sum', name: 'Prefix Sum', category: 'DSA', difficulty: 'Easy' },
            { id: 'stack', name: 'Stack', category: 'DSA', difficulty: 'Easy' },
            { id: 'queue', name: 'Queue', category: 'DSA', difficulty: 'Easy' },
            { id: 'recursion', name: 'Basic Recursion', category: 'DSA', difficulty: 'Easy' },
            { id: 'complexity', name: 'Time & Space Complexity', category: 'DSA', difficulty: 'Easy' },
            
            // MEDIUM
            { id: 'linked-list', name: 'Linked List', category: 'DSA', difficulty: 'Medium' },
            { id: 'sliding-window', name: 'Sliding Window Technique', category: 'DSA', difficulty: 'Medium' },
            { id: 'binary-search-answer', name: 'Binary Search on Answer', category: 'DSA', difficulty: 'Medium' },
            { id: 'greedy', name: 'Greedy Algorithms', category: 'DSA', difficulty: 'Medium' },
            { id: 'bit-manipulation', name: 'Bit Manipulation', category: 'DSA', difficulty: 'Medium' },
            { id: 'trees', name: 'Trees (Binary Tree Basics)', category: 'DSA', difficulty: 'Medium' },
            { id: 'tree-traversals', name: 'Tree Traversals (DFS, BFS)', category: 'DSA', difficulty: 'Medium' },
            { id: 'bst', name: 'Binary Search Tree (BST)', category: 'DSA', difficulty: 'Medium' },
            { id: 'heap', name: 'Heap / Priority Queue', category: 'DSA', difficulty: 'Medium' },
            { id: 'graph-rep', name: 'Graph Representation', category: 'DSA', difficulty: 'Medium' },
            { id: 'bfs', name: 'BFS', category: 'DSA', difficulty: 'Medium' },
            { id: 'dfs', name: 'DFS', category: 'DSA', difficulty: 'Medium' },
            { id: 'cycle-detection', name: 'Cycle Detection', category: 'DSA', difficulty: 'Medium' },
            { id: 'floyds-cycle', name: 'Floyd’s Cycle Detection', category: 'DSA', difficulty: 'Medium' },
            { id: 'kadanes', name: 'Kadane’s Algorithm', category: 'DSA', difficulty: 'Medium' },

            // HARD
            { id: 'backtracking', name: 'Backtracking', category: 'DSA', difficulty: 'Hard' },
            { id: 'divide-conquer', name: 'Divide and Conquer', category: 'DSA', difficulty: 'Hard' },
            { id: 'dp-basics', name: 'Dynamic Programming – Basics', category: 'DSA', difficulty: 'Hard' },
            { id: 'memo-tab', name: 'Memoization vs Tabulation', category: 'DSA', difficulty: 'Hard' },
            { id: 'dp-1d', name: '1D Dynamic Programming', category: 'DSA', difficulty: 'Hard' },
            { id: 'dp-2d', name: '2D Dynamic Programming', category: 'DSA', difficulty: 'Hard' },
            { id: 'knapsack', name: 'Knapsack Pattern', category: 'DSA', difficulty: 'Hard' },
            { id: 'subset-dp', name: 'Subset / Subsequence DP', category: 'DSA', difficulty: 'Hard' },
            { id: 'dp-strings', name: 'DP on Strings', category: 'DSA', difficulty: 'Hard' },
            { id: 'dp-trees', name: 'DP on Trees', category: 'DSA', difficulty: 'Hard' },
            { id: 'shortest-paths', name: 'Graph Shortest Paths', category: 'DSA', difficulty: 'Hard' },
            { id: 'topo-sort', name: 'Topological Sorting', category: 'DSA', difficulty: 'Hard' },
            { id: 'mst', name: 'Minimum Spanning Tree', category: 'DSA', difficulty: 'Hard' },
            { id: 'union-find', name: 'Union Find (Disjoint Set)', category: 'DSA', difficulty: 'Hard' },
            { id: 'monotonic-stack', name: 'Monotonic Stack', category: 'DSA', difficulty: 'Hard' },
            { id: 'monotonic-queue', name: 'Monotonic Queue', category: 'DSA', difficulty: 'Hard' },
            { id: 'advanced-trees', name: 'Advanced Tree Problems', category: 'DSA', difficulty: 'Hard' },
        ]
    },
    {
        title: 'System Design',
        topics: [
            // EASY
            { id: 'sys-design-basics', name: 'High-level vs Low-level Design', category: 'System Design', difficulty: 'Easy' },
            { id: 'client-server', name: 'Client–Server Architecture', category: 'System Design', difficulty: 'Easy' },
            { id: 'http-https', name: 'HTTP vs HTTPS', category: 'System Design', difficulty: 'Easy' },
            { id: 'rest-api-basics', name: 'REST APIs – Basics', category: 'System Design', difficulty: 'Easy' },
            { id: 'caching-basics', name: 'Caching Basics', category: 'System Design', difficulty: 'Easy' },
            { id: 'cdn', name: 'CDN (Content Delivery Network)', category: 'System Design', difficulty: 'Easy' },
            { id: 'sql-nosql', name: 'Databases: SQL vs NoSQL', category: 'System Design', difficulty: 'Easy' },
            { id: 'indexing', name: 'Basic Indexing', category: 'System Design', difficulty: 'Easy' },
            { id: 'scaling-vert-horiz', name: 'Vertical vs Horizontal Scaling', category: 'System Design', difficulty: 'Easy' },
            { id: 'monolith', name: 'Monolith Architecture', category: 'System Design', difficulty: 'Easy' },
            { id: 'stateless-stateful', name: 'Stateless vs Stateful Services', category: 'System Design', difficulty: 'Easy' },

            // MEDIUM
            { id: 'load-balancing', name: 'Load Balancing', category: 'System Design', difficulty: 'Medium' },
            { id: 'caching-strategies', name: 'Caching Strategies', category: 'System Design', difficulty: 'Medium' },
            { id: 'sharding', name: 'Database Sharding', category: 'System Design', difficulty: 'Medium' },
            { id: 'replication', name: 'Replication (Master-Slave)', category: 'System Design', difficulty: 'Medium' },
            { id: 'cap-theorem', name: 'CAP Theorem', category: 'System Design', difficulty: 'Medium' },
            { id: 'consistency-models', name: 'Consistency Models', category: 'System Design', difficulty: 'Medium' },
            { id: 'api-design-graphql', name: 'API Design (REST vs GraphQL)', category: 'System Design', difficulty: 'Medium' },
            { id: 'rate-limiting', name: 'Rate Limiting', category: 'System Design', difficulty: 'Medium' },
            { id: 'message-queues', name: 'Message Queues (Kafka/RabbitMQ)', category: 'System Design', difficulty: 'Medium' },
            { id: 'async-processing', name: 'Asynchronous Processing', category: 'System Design', difficulty: 'Medium' },
            { id: 'auth-design', name: 'Auth Design (JWT, OAuth)', category: 'System Design', difficulty: 'Medium' },
            { id: 'logging-monitoring', name: 'Logging, Monitoring & Metrics', category: 'System Design', difficulty: 'Medium' },
            { id: 'failure-handling', name: 'Failure Handling & Retries', category: 'System Design', difficulty: 'Medium' },

            // HARD
            { id: 'microservices', name: 'Microservices Architecture', category: 'System Design', difficulty: 'Hard' },
            { id: 'service-discovery', name: 'Service Discovery', category: 'System Design', difficulty: 'Hard' },
            { id: 'dist-systems', name: 'Distributed Systems Basics', category: 'System Design', difficulty: 'Hard' },
            { id: 'dist-transactions', name: 'Distributed Transactions (2PC, Saga)', category: 'System Design', difficulty: 'Hard' },
            { id: 'event-driven', name: 'Event-Driven Architecture', category: 'System Design', difficulty: 'Hard' },
            { id: 'data-consistency', name: 'Data Consistency in Distributed Systems', category: 'System Design', difficulty: 'Hard' },
            { id: 'db-scale', name: 'Database Design at Scale', category: 'System Design', difficulty: 'Hard' },
            { id: 'caching-scale', name: 'Caching at Scale (Redis Cluster)', category: 'System Design', difficulty: 'Hard' },
            { id: 'high-availability', name: 'High Availability & Fault Tolerance', category: 'System Design', difficulty: 'Hard' },
            { id: 'circuit-breaker', name: 'Circuit Breaker Pattern', category: 'System Design', difficulty: 'Hard' },
            { id: 'backpressure', name: 'Backpressure Handling', category: 'System Design', difficulty: 'Hard' },
            { id: 'idempotency', name: 'Idempotency in APIs', category: 'System Design', difficulty: 'Hard' },
            { id: 'design-scalability', name: 'Designing for Scalability', category: 'System Design', difficulty: 'Hard' },
            { id: 'design-reliability', name: 'Designing for Reliability', category: 'System Design', difficulty: 'Hard' },
            { id: 'security-scale', name: 'Security at Scale', category: 'System Design', difficulty: 'Hard' },
            { id: 'design-url-shortener', name: 'Design URL Shortener', category: 'System Design', difficulty: 'Hard' },
            { id: 'design-chat', name: 'Design Chat Application', category: 'System Design', difficulty: 'Hard' },
            { id: 'design-notification', name: 'Design Notification System', category: 'System Design', difficulty: 'Hard' },
            { id: 'design-storage', name: 'Design File Storage System', category: 'System Design', difficulty: 'Hard' },
            { id: 'design-news-feed', name: 'Design News Feed', category: 'System Design', difficulty: 'Hard' },
            { id: 'design-payment', name: 'Design Payment System', category: 'System Design', difficulty: 'Hard' },
        ]
    },
    {
        title: 'Core CS Subjects',
        topics: [
            // EASY
            { id: 'prog-basics', name: 'Programming Basics & Memory Model', category: 'CS Fundamentals', difficulty: 'Easy' },
            { id: 'oop', name: 'Object-Oriented Programming (OOP)', category: 'CS Fundamentals', difficulty: 'Easy' },
            { id: 'data-types', name: 'Data Types & Variables (Stack vs Heap)', category: 'CS Fundamentals', difficulty: 'Easy' },
            { id: 'process-thread', name: 'Process vs Thread', category: 'CS Fundamentals', difficulty: 'Easy' },
            { id: 'os-basics', name: 'Basics of Operating Systems', category: 'CS Fundamentals', difficulty: 'Easy' },
            { id: 'networks-basics', name: 'Basics of Computer Networks', category: 'CS Fundamentals', difficulty: 'Easy' },
            { id: 'http-https-model', name: 'HTTP, HTTPS & Request–Response', category: 'CS Fundamentals', difficulty: 'Easy' },

            // MEDIUM
            { id: 'dbms-fundamentals', name: 'DBMS Fundamentals', category: 'CS Fundamentals', difficulty: 'Medium' },
            { id: 'acid', name: 'Transactions & ACID Properties', category: 'CS Fundamentals', difficulty: 'Medium' },
            { id: 'indexing-concepts', name: 'Indexing (B-Tree, Hash Index)', category: 'CS Fundamentals', difficulty: 'Medium' },
            { id: 'deadlocks', name: 'Deadlocks (Conditions, Prevention)', category: 'CS Fundamentals', difficulty: 'Medium' },
            { id: 'concurrency', name: 'Concurrency & Synchronization', category: 'CS Fundamentals', difficulty: 'Medium' },
            { id: 'locks', name: 'Locks, Semaphores & Mutex', category: 'CS Fundamentals', difficulty: 'Medium' },
            { id: 'os-scheduling', name: 'OS Scheduling Algorithms', category: 'CS Fundamentals', difficulty: 'Medium' },
            { id: 'virtual-memory', name: 'Virtual Memory & Paging', category: 'CS Fundamentals', difficulty: 'Medium' },
            { id: 'tcp-ip', name: 'TCP/IP Model', category: 'CS Fundamentals', difficulty: 'Medium' },
            { id: 'dns-dhcp', name: 'DNS, DHCP, NAT', category: 'CS Fundamentals', difficulty: 'Medium' },
            { id: 'rest-soap', name: 'REST vs SOAP', category: 'CS Fundamentals', difficulty: 'Medium' },

            // HARD
            { id: 'isolation-levels', name: 'Database Isolation Levels', category: 'CS Fundamentals', difficulty: 'Hard' },
            { id: 'consistency-strong-eventual', name: 'Consistency Models (Strong vs Eventual)', category: 'CS Fundamentals', difficulty: 'Hard' },
            { id: 'cap-tradeoffs', name: 'CAP Theorem (Real-world Tradeoffs)', category: 'CS Fundamentals', difficulty: 'Hard' },
            { id: 'thread-safety', name: 'Thread Safety & Race Conditions', category: 'CS Fundamentals', difficulty: 'Hard' },
            { id: 'network-perf', name: 'Network Performance (Latency, Throughput)', category: 'CS Fundamentals', difficulty: 'Hard' },
            { id: 'os-bottlenecks', name: 'OS-Level Performance Bottlenecks', category: 'CS Fundamentals', difficulty: 'Hard' },
        ]
    },
    {
        title: 'Behavioral Interview',
        topics: [
            // EASY
            { id: 'intro-background', name: 'Self Introduction & Background', category: 'Behavioral', difficulty: 'Easy' },
            { id: 'strengths-weaknesses', name: 'Strengths & Weaknesses', category: 'Behavioral', difficulty: 'Easy' },
            { id: 'career-goals', name: 'Career Goals & Motivation', category: 'Behavioral', difficulty: 'Easy' },
            { id: 'company-values', name: 'Company Values & Culture Fit', category: 'Behavioral', difficulty: 'Easy' },
            { id: 'communication', name: 'Communication Skills', category: 'Behavioral', difficulty: 'Easy' },
            { id: 'teamwork', name: 'Teamwork & Collaboration', category: 'Behavioral', difficulty: 'Easy' },

            // MEDIUM
            { id: 'past-projects', name: 'Past Project Experience', category: 'Behavioral', difficulty: 'Medium' },
            { id: 'problem-solving', name: 'Problem Solving Under Pressure', category: 'Behavioral', difficulty: 'Medium' },
            { id: 'conflict', name: 'Conflict Resolution', category: 'Behavioral', difficulty: 'Medium' },
            { id: 'handling-failure', name: 'Handling Failure', category: 'Behavioral', difficulty: 'Medium' },
            { id: 'decision-making', name: 'Decision Making', category: 'Behavioral', difficulty: 'Medium' },
            { id: 'ownership', name: 'Ownership & Accountability', category: 'Behavioral', difficulty: 'Medium' },
            { id: 'time-mgmt', name: 'Time Management & Prioritization', category: 'Behavioral', difficulty: 'Medium' },
            { id: 'adaptability', name: 'Adaptability & Learning Ability', category: 'Behavioral', difficulty: 'Medium' },

            // HARD
            { id: 'leadership', name: 'Leadership & Influence', category: 'Behavioral', difficulty: 'Hard' },
            { id: 'ambiguity', name: 'Handling Ambiguity', category: 'Behavioral', difficulty: 'Hard' },
            { id: 'ethical-dilemmas', name: 'Ethical Dilemmas', category: 'Behavioral', difficulty: 'Hard' },
            { id: 'manager-disagreement', name: 'Disagreement with Manager / Team', category: 'Behavioral', difficulty: 'Hard' },
            { id: 'high-stakes', name: 'Handling High-Stakes Situations', category: 'Behavioral', difficulty: 'Hard' },
            { id: 'impact-results', name: 'Impact & Results (Measurable)', category: 'Behavioral', difficulty: 'Hard' },
        ]
    }
];

const StartInterviewPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [type, setType] = useState<'TECHNICAL' | 'HR'>('TECHNICAL');
    const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
    const [isCreating, setIsCreating] = useState(false);
    
    // Custom Alert State
    const [alert, setAlert] = useState<{ show: boolean, message: string }>({ show: false, message: '' });

    const [showAllDSA, setShowAllDSA] = useState(false);
    const [showAllSysDesign, setShowAllSysDesign] = useState(false);
    const [showAllCS, setShowAllCS] = useState(false);
    const [showAllBehavioral, setShowAllBehavioral] = useState(false);

    // Auto-dismiss alert after 2 seconds
    useEffect(() => {
        if (alert.show) {
            const timer = setTimeout(() => {
                setAlert({ show: false, message: '' });
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [alert.show]);

    // Handle global clicks to dismiss alert
    useEffect(() => {
        const handleGlobalClick = () => {
            if (alert.show) {
                setAlert({ show: false, message: '' });
            }
        };

        if (alert.show) {
            window.addEventListener('click', handleGlobalClick);
            return () => window.removeEventListener('click', handleGlobalClick);
        }
    }, [alert.show]);

    const filteredSections = useMemo(() => {
        if (!searchTerm.trim()) return SECTIONS;
        
        const term = searchTerm.toLowerCase();
        return SECTIONS.map(section => ({
            ...section,
            topics: section.topics.filter(topic => 
                topic.name.toLowerCase().includes(term) || 
                topic.category.toLowerCase().includes(term)
            )
        })).filter(section => section.topics.length > 0);
    }, [searchTerm]);

    const toggleTopic = (topicId: string) => {
        setSelectedTopics(prev => 
            prev.includes(topicId) 
                ? prev.filter(id => id !== topicId) 
                : [...prev, topicId]
        );
    };

    const handleStart = async () => {
        if (selectedTopics.length === 0 || isCreating) return;

        // Validation: All topics must be from the same domain
        const allTopicsList = SECTIONS.flatMap(s => s.topics);
        const selectedTopicObjects = selectedTopics.map(id => allTopicsList.find(t => t.id === id));
        const categories = Array.from(new Set(selectedTopicObjects.map(t => t?.category)));

        if (categories.length > 1) {
            setAlert({ show: true, message: 'Select topics from one domain to start the interview' });
            return;
        }

        const category = categories[0] || 'DSA';

        // Map frontend category to backend Domain enum
        const mapCategoryToDomain = (cat: string): string => {
            switch (cat) {
                case 'DSA': return 'DSA';
                case 'System Design': return 'SYSTEM_DESIGN';
                case 'CS Fundamentals': return 'CORE_CS';
                case 'Behavioral': return 'BEHAVIORAL';
                default: return 'DSA';
            }
        };

        const domain = mapCategoryToDomain(category);

        setIsCreating(true);
        try {
            const res = await client.post('/sessions', {
                type,
                difficulty,
                topics: selectedTopics,
                domain: domain
            });
            navigate(`/interview/${res.data.id}`);
        } catch (error) {
            console.error('Failed to create session', error);
            setAlert({ show: true, message: 'Failed to start interview. Please try again.' });
        } finally {
            setIsCreating(false);
        }
    };

    const isEmpty = filteredSections.length === 0;

    return (
        <div className="relative flex bg-slate-50 min-h-screen font-sans">
            <Sidebar />
            
            <main className="flex-1 ml-64 p-8 lg:p-12">
                <DashboardHeader searchValue={searchTerm} onSearchChange={setSearchTerm} />

                <div className="">
                    <div className="mb-12 flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Start Interview</h1>
                            <p className="text-slate-500 text-lg">Select topics you want to be interviewed on.</p>
                        </div>
                        <div className="text-xs font-black text-indigo-600 bg-indigo-50 px-5 py-2.5 rounded-2xl border border-indigo-100 uppercase tracking-widest shadow-sm">
                            {selectedTopics.length} Topics Selected
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Interview Type</label>
                            <div className="flex gap-3">
                                {['TECHNICAL', 'HR'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setType(t as 'TECHNICAL' | 'HR')}
                                        className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all ${
                                            type === t 
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                                                : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                        }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Difficulty Level</label>
                            <div className="flex gap-3">
                                {['EASY', 'MEDIUM', 'HARD'].map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setDifficulty(d as 'EASY' | 'MEDIUM' | 'HARD')}
                                        className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all ${
                                            difficulty === d 
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                                                : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                        }`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-12 pb-32">
                        {isEmpty ? (
                            <div className="bg-white rounded-[2.5rem] p-20 text-center shadow-xl shadow-slate-200/50 border border-slate-100">
                                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search className="text-slate-300 w-12 h-12" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">No topics found</h3>
                                <p className="text-slate-400 text-lg">Try searching for something else</p>
                            </div>
                        ) : (
                            filteredSections.map((section) => {
                                const isDSA = section.title === 'Data Structures & Algorithms';
                                const isSysDesign = section.title === 'System Design';
                                const isCS = section.title === 'Core CS Subjects';
                                const isBehavioral = section.title === 'Behavioral Interview';
                                
                                let visibleTopics = section.topics;

                                if (isDSA && !showAllDSA && !searchTerm) {
                                    visibleTopics = section.topics.slice(0, 6);
                                } else if (isSysDesign && !showAllSysDesign && !searchTerm) {
                                    visibleTopics = section.topics.slice(0, 6);
                                } else if (isCS && !showAllCS && !searchTerm) {
                                    visibleTopics = section.topics.slice(0, 6);
                                } else if (isBehavioral && !showAllBehavioral && !searchTerm) {
                                    visibleTopics = section.topics.slice(0, 6);
                                }

                                return (
                                    <div key={section.title}>
                                        <div className="flex items-center gap-4 mb-6 ml-1">
                                             <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                                             <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">
                                                {section.title}
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                            {visibleTopics.map((topic) => {
                                                const isSelected = selectedTopics.includes(topic.id);
                                                return (
                                                    <div 
                                                        key={topic.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleTopic(topic.id);
                                                        }}
                                                        className={`group flex items-center justify-between p-6 rounded-4xl cursor-pointer transition-all duration-300 border-2 ${
                                                            isSelected 
                                                                ? 'bg-white border-indigo-500 shadow-xl shadow-indigo-100/50 -translate-y-1' 
                                                                : 'bg-white border-transparent hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-0.5'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-6">
                                                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                                                isSelected 
                                                                    ? 'bg-indigo-600 scale-110 shadow-lg shadow-indigo-200' 
                                                                    : 'bg-slate-50 border-2 border-slate-100'
                                                            }`}>
                                                                {isSelected && <Check className="text-white w-4 h-4 stroke-3" />}
                                                            </div>
                                                            <div>
                                                                <h4 className={`text-lg font-bold transition-colors ${
                                                                    isSelected ? 'text-indigo-950' : 'text-slate-800'
                                                                }`}>
                                                                    {topic.name}
                                                                </h4>
                                                                <div className="flex items-center gap-3 mt-1.5">
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-50/50 px-2 py-0.5 rounded-lg border border-indigo-100/50">
                                                                        {topic.category}
                                                                    </span>
                                                                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                                                                        topic.difficulty === 'Easy' ? 'text-emerald-500' :
                                                                        topic.difficulty === 'Medium' ? 'text-amber-500' :
                                                                        'text-rose-500'
                                                                    }`}>
                                                                        {topic.difficulty}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {isSelected && (
                                                            <div className="bg-indigo-600 text-white px-5 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-right-4 shadow-lg shadow-indigo-200/50">
                                                                Selected
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {isDSA && !searchTerm && (
                                            <button 
                                                onClick={() => setShowAllDSA(!showAllDSA)}
                                                className="mt-6 w-full py-4 text-xs font-black uppercase tracking-widest text-indigo-500 bg-white border-2 border-dashed border-indigo-100 rounded-3xl hover:bg-indigo-50 hover:border-indigo-200 transition-all flex items-center justify-center gap-2"
                                            >
                                                {showAllDSA ? (
                                                    <>
                                                        Show Less Topics
                                                        <ArrowRight className="w-4 h-4 rotate-270" />
                                                    </>
                                                ) : (
                                                    <>
                                                        Show All {section.topics.length} Topics
                                                        <ArrowRight className="w-4 h-4 rotate-90" />
                                                    </>
                                                )}
                                            </button>
                                        )}
                                        {isSysDesign && !searchTerm && (
                                            <button 
                                                onClick={() => setShowAllSysDesign(!showAllSysDesign)}
                                                className="mt-6 w-full py-4 text-xs font-black uppercase tracking-widest text-indigo-500 bg-white border-2 border-dashed border-indigo-100 rounded-3xl hover:bg-indigo-50 hover:border-indigo-200 transition-all flex items-center justify-center gap-2"
                                            >
                                                {showAllSysDesign ? (
                                                    <>
                                                        Show Less Topics
                                                        <ArrowRight className="w-4 h-4 rotate-270" />
                                                    </>
                                                ) : (
                                                    <>
                                                        Show All {section.topics.length} Topics
                                                        <ArrowRight className="w-4 h-4 rotate-90" />
                                                    </>
                                                )}
                                            </button>
                                        )}
                                        {isCS && !searchTerm && (
                                            <button 
                                                onClick={() => setShowAllCS(!showAllCS)}
                                                className="mt-6 w-full py-4 text-xs font-black uppercase tracking-widest text-indigo-500 bg-white border-2 border-dashed border-indigo-100 rounded-3xl hover:bg-indigo-50 hover:border-indigo-200 transition-all flex items-center justify-center gap-2"
                                            >
                                                {showAllCS ? (
                                                    <>
                                                        Show Less Topics
                                                        <ArrowRight className="w-4 h-4 rotate-270" />
                                                    </>
                                                ) : (
                                                    <>
                                                        Show All {section.topics.length} Topics
                                                        <ArrowRight className="w-4 h-4 rotate-90" />
                                                    </>
                                                )}
                                            </button>
                                        )}
                                        {isBehavioral && !searchTerm && (
                                            <button 
                                                onClick={() => setShowAllBehavioral(!showAllBehavioral)}
                                                className="mt-6 w-full py-4 text-xs font-black uppercase tracking-widest text-indigo-500 bg-white border-2 border-dashed border-indigo-100 rounded-3xl hover:bg-indigo-50 hover:border-indigo-200 transition-all flex items-center justify-center gap-2"
                                            >
                                                {showAllBehavioral ? (
                                                    <>
                                                        Show Less Topics
                                                        <ArrowRight className="w-4 h-4 rotate-270" />
                                                    </>
                                                ) : (
                                                    <>
                                                        Show All {section.topics.length} Topics
                                                        <ArrowRight className="w-4 h-4 rotate-90" />
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Fixed/Sticky Action Button Container */}
                    <div className="fixed bottom-0 right-0 left-64 p-6 bg-linear-to-t from-slate-50 via-slate-50/90 to-transparent backdrop-blur-sm z-30">
                        <div className="w-full px-4">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleStart();
                                }}
                                disabled={selectedTopics.length === 0 || isCreating}
                                className={`w-full font-black text-xl py-6 rounded-[2.5rem] flex items-center justify-center gap-4 transition-all duration-500 shadow-2xl tracking-tight uppercase ${
                                    selectedTopics.length > 0 && !isCreating
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-300/50 hover:-translate-y-1'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                }`}
                            >
                                {isCreating ? 'Starting...' : 'Start Interview'}
                                <ArrowRight className="w-7 h-7" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Custom Alert Modal */}
            {alert.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300 backdrop-blur-md bg-slate-900/10">
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        className="bg-indigo-950 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-500/30 max-w-md w-full border border-indigo-500/30 animate-in zoom-in-95 duration-300 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-pulse"></div>
                        <div className="flex flex-col items-center text-center gap-6">
                            <div className="w-20 h-20 bg-indigo-500/20 rounded-3xl flex items-center justify-center border border-indigo-500/50 shadow-inner">
                                <AlertCircle className="text-indigo-400 w-10 h-10" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black mb-2 tracking-tight uppercase">Validation Error</h3>
                                <p className="text-indigo-200 font-medium leading-relaxed">{alert.message}</p>
                            </div>
                            <button 
                                onClick={() => setAlert({ show: false, message: '' })}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                Dismiss <X size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StartInterviewPage;
