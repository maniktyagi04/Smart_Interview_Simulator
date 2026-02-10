import axios from 'axios';
import { QuestionCategory, Difficulty, QuestionStatus, QuestionSource, InterviewType, Domain } from '@prisma/client';

export interface CodeforcesProblem {
  contestId: number;
  index: string;
  name: string;
  type: string;
  rating?: number;
  tags: string[];
}

export class CodeforcesService {
  private static API_URL = 'https://codeforces.com/api/problemset.problems';

  // Map Codeforces tags to our internal topics
  private static TAG_MAPPING: Record<string, string> = {
    'two pointers': 'Two Pointers',
    'dp': 'Dynamic Programming',
    'dynamic programming': 'Dynamic Programming',
    'greedy': 'Greedy',
    'graphs': 'Graphs',
    'dfs and similar': 'DFS/BFS',
    'trees': 'Trees',
    'implementation': 'Implementation',
    'data structures': 'Data Structures',
    'math': 'Math',
    'strings': 'Strings',
    'binary search': 'Binary Search',
    'sortings': 'Sorting',
    'brute force': 'Brute Force',
    'constructive algorithms': 'Constructive Algorithms',
    'number theory': 'Number Theory',
    'geometry': 'Geometry',
    'bitmasks': 'Bit Manipulation',
    'combinatorics': 'Combinatorics',
    'shortest paths': 'Shortest Paths',
    'dsu': 'Union Find',
    'divide and conquer': 'Divide and Conquer',
    'hashing': 'Hashing',
    'probabilities': 'Probability',
    'matrices': 'Matrices',
    'flows': 'Network Flow',
    'game theory': 'Game Theory',
  };

  /**
   * Fetch problems from Codeforces API
   */
  static async fetchProblems(tags: string[] = [], minRating?: number, maxRating?: number, limit: number = 20) {
    try {
      const response = await axios.get(this.API_URL);
      
      if (response.data.status !== 'OK') {
        throw new Error('Failed to fetch from Codeforces');
      }

      let problems: CodeforcesProblem[] = response.data.result.problems;

      // Filter by tags if provided
      if (tags.length > 0) {
        problems = problems.filter(p => 
          p.tags.some(t => tags.includes(t))
        );
      }

      // Filter by rating if provided
      if (minRating) {
        problems = problems.filter(p => (p.rating || 0) >= minRating);
      }
      if (maxRating) {
        problems = problems.filter(p => (p.rating || 0) <= maxRating);
      }

      // Map to our format and limit
      const mappedQuestions = problems
        .slice(0, limit)
        .map(p => this.mapToQuestion(p));

      return mappedQuestions;
    } catch (error) {
      console.error('Codeforces API Error:', error);
      throw new Error('Failed to import questions from Codeforces');
    }
  }

  /**
   * Map Codeforces problem to internal Question format
   */
  private static mapToQuestion(problem: CodeforcesProblem) {
    const difficulty = this.getDifficultyFromRating(problem.rating);
    const domain = Domain.DSA; // Codeforces is purely DSA
    
    // Find mapped topic or default to first tag
    const topic = problem.tags.find(t => this.TAG_MAPPING[t]) 
      ? this.TAG_MAPPING[problem.tags.find(t => this.TAG_MAPPING[t])!] 
      : (problem.tags[0] ? this.capitalize(problem.tags[0]) : 'General');

    // Construct external ID
    const externalId = `${problem.contestId}${problem.index}`;
    
    // Construct problem link
    const problemLink = `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`;

    return {
      title: problem.name,
      content: `Problem from Codeforces: ${problem.name}\n\nLink: ${problemLink}\n\nTags: ${problem.tags.join(', ')}`,
      problemStatement: `Solve the problem "${problem.name}" from Codeforces.\n\nYou can view the full problem statement here: ${problemLink}\n\nInput/Output format as specified in the link.`,
      idealAnswer: `Refer to the editorial or solution for ${problem.name} on Codeforces.`,
      keyConcepts: JSON.stringify(problem.tags),
      rubric: "Check for correctness against test cases (if available) or logical implementation of the required algorithm.",
      type: InterviewType.TECHNICAL,
      domain: domain,
      difficulty: difficulty,
      category: QuestionCategory.DSA,
      topic: topic,
      status: QuestionStatus.ACTIVE,
      source: QuestionSource.IMPORTED,
      externalId: externalId,
      externalSource: 'Codeforces',
      evaluationNotes: `Imported from Codeforces. Rating: ${problem.rating || 'N/A'}`
    };
  }

  private static getDifficultyFromRating(rating?: number): Difficulty {
    if (!rating) return Difficulty.MEDIUM;
    if (rating < 1200) return Difficulty.EASY;
    if (rating < 1600) return Difficulty.MEDIUM;
    return Difficulty.HARD;
  }

  private static capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
