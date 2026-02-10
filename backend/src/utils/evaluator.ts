export interface EvaluationResult {
  score: number;
  keywordScore: number;
  conceptScore: number;
  clarityScore: number;
  strengths: string[];
  weaknesses: string[];
  improvementTips: string[];
  breakdown: string;
}

export class Evaluator {
  static evaluate(
    userAnswer: string,
    idealAnswer: string,
    rubric: string,
    keyConcepts: string
  ): EvaluationResult {
    const concepts = keyConcepts.split(',').map(c => c.trim().toLowerCase());
    const userWords = userAnswer.toLowerCase();

    // 1. Keyword/Concept Coverage
    let matchedConcepts = 0;
    concepts.forEach(concept => {
      if (userWords.includes(concept)) {
        matchedConcepts++;
      }
    });

    const conceptScore = (matchedConcepts / concepts.length) * 100;

    // 2. Keyword score (more granular than concepts)
    // For MVP, we'll use a subset of common tech keywords if not provided
    const keywordScore = conceptScore; // Simplified for MVP

    // 3. Clarity Score (Basic heuristics)
    // Factors: Length (too short is bad), Sentence structure (mocked)
    let clarityScore = 0;
    const wordCount = userAnswer.trim().split(/\s+/).length;
    if (wordCount > 50) clarityScore = 100;
    else if (wordCount > 20) clarityScore = 60;
    else clarityScore = 30;

    // 4. Weighted Final Score
    const finalScore = (0.5 * conceptScore) + (0.3 * keywordScore) + (0.2 * clarityScore);

    // 5. Strengths & Weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const improvementTips: string[] = [];

    if (conceptScore > 80) {
      strengths.push('Excellent coverage of key technical concepts.');
    } else if (conceptScore > 50) {
      strengths.push('Good understanding of core concepts but missing some details.');
      weaknesses.push('Missing specific technical details or keywords.');
      improvementTips.push('Try to incorporate more specific terminology related to the topic.');
    } else {
      weaknesses.push('Limited understanding of the required concepts.');
      improvementTips.push('Review the fundamental principles of this topic.');
    }

    if (clarityScore < 50) {
      weaknesses.push('Answer is too brief and lacks depth.');
      improvementTips.push('Provide more descriptive explanations and examples in your response.');
    }

    return {
      score: Math.round(finalScore),
      keywordScore: Math.round(keywordScore),
      conceptScore: Math.round(conceptScore),
      clarityScore: Math.round(clarityScore),
      strengths,
      weaknesses,
      improvementTips,
      breakdown: `Concept Coverage: ${matchedConcepts}/${concepts.length}`,
    };
  }
}
