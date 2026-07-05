import { describe, it, expect } from 'vitest';

interface EvalScore {
  dimension: string;
  score: number;
  rationale: string;
}

function evaluateOutput(output: string, rubric: string[]): EvalScore[] {
  return rubric.map((dimension) => {
    const hasContent = output.trim().length > 0;
    const hasNumbers = /\d+/.test(output);
    const hasActionable = /should|must|recommend|consider|could/i.test(output);

    let score = 1;
    let rationale = '';

    if (dimension === 'intent_satisfaction') {
      score = hasActionable ? 4 : hasContent ? 2 : 1;
      rationale = hasActionable ? 'Output provides actionable recommendations' : 'Output lacks actionable guidance';
    } else if (dimension === 'functional_correctness') {
      score = hasNumbers ? 4 : hasContent ? 2 : 1;
      rationale = hasNumbers ? 'Output contains specific numerical data' : 'Output lacks numerical specificity';
    } else if (dimension === 'trajectory_quality') {
      score = output.includes('---') ? 4 : hasContent ? 3 : 1;
      rationale = output.includes('---') ? 'Output has clear structural sections' : 'Output structure could be improved';
    } else if (dimension === 'cost_efficiency') {
      const words = output.split(/\s+/).length;
      score = words < 300 ? 5 : words < 500 ? 3 : 2;
      rationale = `${words} words — ${words < 300 ? 'efficient' : 'could be more concise'}`;
    }

    return { dimension, score, rationale };
  });
}

describe('Agent Evaluation Engine', () => {
  it('scores output across all dimensions', () => {
    const output = 'We recommend reducing costs by 15%. You should negotiate with suppliers. Consider bulk buying. R5000 monthly savings possible.';
    const rubric = ['intent_satisfaction', 'functional_correctness', 'trajectory_quality', 'cost_efficiency'];
    const scores = evaluateOutput(output, rubric);

    expect(scores).toHaveLength(4);
    scores.forEach(s => {
      expect(s.score).toBeGreaterThanOrEqual(1);
      expect(s.score).toBeLessThanOrEqual(5);
    });
  });

  it('scores empty output poorly', () => {
    const scores = evaluateOutput('', ['intent_satisfaction']);
    expect(scores[0].score).toBeLessThanOrEqual(2);
  });

  it('scores concise output higher for cost efficiency', () => {
    const concise = evaluateOutput('Short output.', ['cost_efficiency']);
    const verbose = evaluateOutput(
      Array(500).fill('word').join(' '),
      ['cost_efficiency']
    );
    expect(concise[0].score).toBeGreaterThan(verbose[0].score);
  });

  it('detects actionable language in output', () => {
    const hasActionable = evaluateOutput('You should reduce supplier costs by 15%.', ['intent_satisfaction']);
    const noActionable = evaluateOutput('Business has some challenges.', ['intent_satisfaction']);
    expect(hasActionable[0].score).toBeGreaterThan(noActionable[0].score);
  });

  it('detects numerical data in output', () => {
    const hasNumbers = evaluateOutput('Your margin is 35%. Break-even is R200/day.', ['functional_correctness']);
    const noNumbers = evaluateOutput('Your margin is healthy.', ['functional_correctness']);
    expect(hasNumbers[0].score).toBeGreaterThan(noNumbers[0].score);
  });
});
