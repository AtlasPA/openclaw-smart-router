/**
 * Test script for TaskAnalyzer and ModelSelector
 * Verifies that the implementations work correctly
 */

import { RouterStorage } from './src/storage.js';
import { TaskAnalyzer } from './src/analyzer.js';
import { ModelSelector } from './src/selector.js';
import { join } from 'path';
import { homedir } from 'os';
import { mkdirSync, existsSync, unlinkSync } from 'fs';

// Setup test database
const testDir = join(homedir(), '.openclaw', 'openclaw-smart-router', 'test');
if (!existsSync(testDir)) {
  mkdirSync(testDir, { recursive: true });
}

const testDbPath = join(testDir, 'test.db');

// Remove existing test db
if (existsSync(testDbPath)) {
  unlinkSync(testDbPath);
}

console.log('=== Smart Router Test ===\n');

// Initialize components
const storage = new RouterStorage(testDbPath);
storage.initialize();

const analyzer = new TaskAnalyzer(storage);
const selector = new ModelSelector(storage);

console.log('✓ Initialized storage, analyzer, and selector\n');

// Test cases
const testCases = [
  {
    name: 'Simple Query',
    request: {
      prompt: 'What is JavaScript?',
      context: ''
    },
    expectedType: 'query',
    expectedComplexityRange: [0.0, 0.4]
  },
  {
    name: 'Code Task',
    request: {
      prompt: 'Write a function to calculate fibonacci numbers',
      context: '```javascript\nfunction fibonacci(n) {\n  // TODO: implement\n}\n```'
    },
    expectedType: 'code',
    expectedComplexityRange: [0.5, 0.9]
  },
  {
    name: 'Debugging Task',
    request: {
      prompt: 'Fix this error: TypeError: Cannot read property of undefined',
      context: 'Error occurred at line 42 in main.js'
    },
    expectedType: 'debugging',
    expectedComplexityRange: [0.6, 1.0]
  },
  {
    name: 'Reasoning Task',
    request: {
      prompt: 'Analyze the tradeoffs between SQL and NoSQL databases. Consider scalability, consistency, and query complexity.',
      context: 'For a financial application handling 10M transactions daily'
    },
    expectedType: 'reasoning',
    expectedComplexityRange: [0.6, 0.9]
  },
  {
    name: 'Writing Task',
    request: {
      prompt: 'Write a README.md for this project',
      context: ''
    },
    expectedType: 'writing',
    expectedComplexityRange: [0.3, 0.6]
  }
];

// Run tests
async function runTests() {
  const agentWallet = 'test-agent-wallet-123';

  for (const testCase of testCases) {
    console.log(`Test: ${testCase.name}`);
    console.log('─'.repeat(50));

    // Analyze task
    const analysis = await analyzer.analyzeTask(testCase.request);

    console.log(`Complexity: ${analysis.complexity_score.toFixed(3)}`);
    console.log(`Task Type: ${analysis.task_type}`);
    console.log(`Estimated Tokens: ${analysis.estimated_tokens}`);
    console.log(`Has Code: ${analysis.has_code}`);
    console.log(`Has Errors: ${analysis.has_errors}`);
    console.log(`Has Reasoning: ${analysis.has_reasoning}`);

    // Verify expectations
    const complexityOk = analysis.complexity_score >= testCase.expectedComplexityRange[0] &&
                         analysis.complexity_score <= testCase.expectedComplexityRange[1];
    const typeOk = analysis.task_type === testCase.expectedType;

    console.log(`✓ Type Match: ${typeOk ? 'PASS' : 'FAIL (expected ' + testCase.expectedType + ')'}`);
    console.log(`✓ Complexity Range: ${complexityOk ? 'PASS' : 'FAIL (expected ' + testCase.expectedComplexityRange.join('-') + ')'}`);

    // Select model
    const selection = await selector.selectModel(analysis, agentWallet);

    console.log(`\nSelected Model: ${selection.model}`);
    console.log(`Provider: ${selection.provider}`);
    console.log(`Reason: ${selection.reason}`);
    console.log(`Confidence: ${selection.confidence.toFixed(3)}`);
    console.log(`Estimated Cost: $${selection.estimated_cost.toFixed(6)}`);

    if (selection.score_breakdown) {
      console.log('\nScore Breakdown:');
      console.log(`  Complexity Match: ${selection.score_breakdown.complexity_match.toFixed(3)}`);
      console.log(`  Budget Constraint: ${selection.score_breakdown.budget_constraint.toFixed(3)}`);
      console.log(`  Pattern Match: ${selection.score_breakdown.pattern_match.toFixed(3)}`);
      console.log(`  Performance: ${selection.score_breakdown.performance.toFixed(3)}`);
      console.log(`  Total: ${selection.score_breakdown.total.toFixed(3)}`);
    }

    if (selection.alternatives && selection.alternatives.length > 0) {
      console.log('\nAlternatives:');
      for (const alt of selection.alternatives) {
        console.log(`  - ${alt.model}: ${alt.score.toFixed(3)} ($${alt.estimated_cost.toFixed(6)})`);
      }
    }

    console.log('\n' + '='.repeat(50) + '\n');
  }

  console.log('All tests completed!');

  // Cleanup
  storage.close();
  console.log('\n✓ Test database closed');
}

// Run the tests
runTests().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});
