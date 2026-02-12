# Agent Economy Guide - Smart Router

**How autonomous agents evaluate, subscribe to, and pay for Smart Router Pro using the x402 protocol.**

---

## Overview

Smart Router is designed for **economic agents** - AI agents that can autonomously evaluate tools, calculate ROI, and make subscription decisions based on real cost savings.

This document explains:
1. How agents measure routing efficiency and cost savings
2. How agents calculate ROI for Smart Router Pro
3. How payment authorization works (delegation model)
4. Economic decision-making logic

---

## The Value Proposition for Agents

### Problem: Model Over-Spending
```
Agent uses GPT-4/Opus for every request
Simple task: "What's 2+2?" → $0.03 (Opus)
Complex task: "Design microservices architecture" → $0.45 (Opus)

Monthly requests: 10,000
Average cost: $0.10/request
Total: $1,000/month
```

### Solution: Intelligent Routing
```
Agent uses Smart Router to select optimal model
Simple task: "What's 2+2?" → $0.0001 (Haiku) - 300x cheaper
Complex task: "Design microservices architecture" → $0.45 (Opus) - same cost

Monthly requests: 10,000
Simple (70%): 7,000 × $0.0001 = $0.70
Medium (20%): 2,000 × $0.01 = $20
Complex (10%): 1,000 × $0.45 = $450
Total: $470.70/month

Savings: $529.30/month (53%)
Smart Router Pro cost: $0.50/month
Net savings: $528.80/month
ROI: 1,058x ✅
```

---

## How Agents Calculate ROI

### Step 1: Measure Baseline Costs (Without Smart Router)

```javascript
async function measureBaselineCosts() {
  // Track 1 week of API usage
  const usage = await trackWeeklyUsage();

  // Example results:
  return {
    totalRequests: 2,500,
    totalCost: 250.00,        // $250/week = $1,000/month
    avgCostPerRequest: 0.10,
    modelDistribution: {
      'claude-opus': 90%,     // Using expensive model for everything
      'claude-sonnet': 10%
    }
  };
}
```

### Step 2: Simulate Smart Router (Free Tier Trial)

```javascript
async function simulateSmartRouter(usage) {
  // Analyze each request's complexity
  const analyzed = usage.requests.map(req => ({
    ...req,
    complexity: analyzeComplexity(req),
    originalModel: req.model,
    originalCost: req.cost
  }));

  // Simulate optimal routing
  const optimized = analyzed.map(req => {
    const optimalModel = selectOptimalModel(req.complexity);
    const optimalCost = calculateCost(optimalModel, req.tokens);

    return {
      ...req,
      optimalModel,
      optimalCost,
      savings: req.originalCost - optimalCost
    };
  });

  // Calculate potential savings
  const totalOriginalCost = analyzed.reduce((sum, r) => sum + r.originalCost, 0);
  const totalOptimalCost = optimized.reduce((sum, r) => sum + r.optimalCost, 0);
  const savingsPercent = ((totalOriginalCost - totalOptimalCost) / totalOriginalCost) * 100;

  return {
    originalCost: totalOriginalCost,
    optimalCost: totalOptimalCost,
    savings: totalOriginalCost - totalOptimalCost,
    savingsPercent,
    routingDistribution: calculateDistribution(optimized)
  };
}
```

### Step 3: Project Monthly Savings

```javascript
async function calculateROI() {
  const baseline = await measureBaselineCosts();
  const simulation = await simulateSmartRouter(baseline);

  // Project to monthly
  const monthlySavings = simulation.savings * 4; // weeks

  // Smart Router pricing
  const freeTierLimit = 100; // decisions/day
  const dailyDecisions = baseline.totalRequests / 7;

  let smartRouterCost = 0;
  if (dailyDecisions > freeTierLimit) {
    smartRouterCost = 0.50; // Pro tier needed
  }

  const netSavings = monthlySavings - smartRouterCost;
  const roi = netSavings / smartRouterCost;

  return {
    baselineMonthlyCost: baseline.totalCost * 4,
    optimizedMonthlyCost: simulation.optimalCost * 4,
    monthlySavings,
    smartRouterCost,
    netSavings,
    roi,
    decision: roi >= 10 ? 'subscribe' : 'free_tier'
  };
}
```

### Example Results

**Low-Volume Agent (Free Tier Sufficient):**
```
Daily requests: 50 (< 100 free tier limit)
Monthly baseline cost: $200
Optimized cost: $100
Savings: $100/month
Smart Router cost: $0 (free tier)
Net savings: $100/month
Decision: Use free tier ✓
```

**High-Volume Agent (Pro Tier Needed):**
```
Daily requests: 500 (> 100 free tier limit)
Monthly baseline cost: $2,000
Optimized cost: $900
Savings: $1,100/month
Smart Router cost: $0.50 (Pro tier)
Net savings: $1,099.50/month
ROI: 2,199x
Decision: Subscribe to Pro ✅
```

**Marginal Agent (Already Optimized):**
```
Daily requests: 1,000
Monthly baseline cost: $500 (already using cheap models)
Optimized cost: $490
Savings: $10/month
Smart Router cost: $0.50
Net savings: $9.50/month
ROI: 19x
Decision: Subscribe (marginal benefit) ⚠️
```

---

## Agent Decision Logic

```javascript
class SmartRouterEvaluator {
  async evaluate(agentWallet, agentPolicy) {
    // Step 1: Measure current usage
    const usage = await this.measureCurrentUsage();

    // Step 2: Check if free tier sufficient
    const dailyRequests = usage.requestsPerDay;
    const needsPro = dailyRequests > 100;

    if (!needsPro) {
      return {
        decision: 'use_free_tier',
        reason: `${dailyRequests} requests/day < 100 free tier limit`,
        estimatedSavings: await this.estimateSavings(usage)
      };
    }

    // Step 3: Calculate ROI for Pro tier
    const simulation = await this.simulateSmartRouter(usage);
    const monthlySavings = simulation.savings * 30; // days
    const proCost = 0.50; // USDT/month
    const roi = monthlySavings / proCost;

    // Step 4: Check agent policy
    if (roi < agentPolicy.minROI) {
      return {
        decision: 'skip_pro',
        reason: `ROI ${roi.toFixed(1)}x < minimum ${agentPolicy.minROI}x`,
        recommendation: 'Use free tier instead'
      };
    }

    // Step 5: Verify within budget
    if (proCost > agentPolicy.maxPerTool) {
      return {
        decision: 'skip_pro',
        reason: `Cost $${proCost} > max per tool $${agentPolicy.maxPerTool}`
      };
    }

    // Step 6: Subscribe to Pro
    return {
      decision: 'subscribe_pro',
      reason: `ROI: ${roi.toFixed(1)}x, saves $${monthlySavings.toFixed(2)}/month, costs $${proCost}/month`,
      autoApprove: agentPolicy.autoSubscribe && proCost <= agentPolicy.maxPerTool,
      details: {
        currentMonthlyCost: usage.totalCost * 30,
        optimizedMonthlyCost: simulation.optimalCost * 30,
        monthlySavings,
        proCost,
        netSavings: monthlySavings - proCost,
        roi
      }
    };
  }

  async measureCurrentUsage() {
    // Track API calls for 24 hours
    const calls = await this.trackApiCalls(24 * 60 * 60 * 1000);

    return {
      requestsPerDay: calls.length,
      totalCost: calls.reduce((sum, call) => sum + call.cost, 0),
      modelDistribution: this.calculateDistribution(calls),
      avgComplexity: this.calculateAvgComplexity(calls)
    };
  }

  async simulateSmartRouter(usage) {
    // For each API call, determine optimal model
    const optimized = usage.calls.map(call => {
      const complexity = this.analyzeComplexity(call);
      const optimalModel = this.selectModel(complexity);
      const optimalCost = this.calculateCost(optimalModel, call.tokens);

      return {
        original: call,
        optimal: { model: optimalModel, cost: optimalCost },
        savings: call.cost - optimalCost
      };
    });

    return {
      savings: optimized.reduce((sum, o) => sum + o.savings, 0),
      optimalCost: optimized.reduce((sum, o) => sum + o.optimal.cost, 0),
      routingDistribution: this.calculateRoutingDistribution(optimized)
    };
  }

  selectModel(complexity) {
    // Complexity scoring: 0.0 - 1.0
    if (complexity < 0.3) return 'claude-haiku-4.5';      // Simple
    if (complexity < 0.6) return 'claude-sonnet-4.5';     // Medium
    if (complexity < 0.8) return 'claude-opus-4.6';       // Complex
    return 'claude-opus-4.6';                             // Expert
  }

  analyzeComplexity(call) {
    let score = 0;

    // Context length (0-0.3)
    const contextTokens = call.inputTokens;
    score += Math.min(contextTokens / 100000, 0.3);

    // Code presence (0-0.2)
    if (call.hasCode) score += 0.2;

    // Question complexity (0-0.3)
    const questionWords = call.prompt.split(' ').length;
    score += Math.min(questionWords / 200, 0.3);

    // Task type (0-0.2)
    if (call.taskType === 'reasoning') score += 0.2;
    if (call.taskType === 'research') score += 0.15;
    if (call.taskType === 'coding') score += 0.15;
    if (call.taskType === 'writing') score += 0.05;

    return Math.min(score, 1.0);
  }
}
```

---

## Payment Authorization & Autonomy

### Fully Autonomous Model

**One-time human delegation:**
```javascript
const agentPolicy = {
  maxMonthlyBudget: 10.00,    // Total subscription budget
  minROI: 10,                  // Minimum return on investment
  autoSubscribe: true,         // Autonomous decision-making
  maxPerTool: 1.00             // Max per tool per month
};
```

**Agent evaluates and subscribes:**
```javascript
const evaluator = new SmartRouterEvaluator();
const result = await evaluator.evaluate(agentWallet, agentPolicy);

if (result.decision === 'subscribe_pro' && result.autoApprove) {
  // Subscribe without human intervention
  const txHash = await subscribeToSmartRouterPro(agentWallet, 0.50);
  console.log(`[Agent] Subscribed to Smart Router Pro
    ROI: ${result.details.roi.toFixed(1)}x
    Saves: $${result.details.monthlySavings.toFixed(2)}/month
    Costs: $0.50/month
    Net: $${result.details.netSavings.toFixed(2)}/month
    Transaction: ${txHash}
  `);
}
```

### Agent Continuously Monitors ROI

```javascript
async function monitorSmartRouterROI() {
  // Run weekly
  setInterval(async () => {
    const currentROI = await calculateCurrentROI();

    if (currentROI < agentPolicy.minROI) {
      console.log(`[Agent] Smart Router ROI dropped to ${currentROI.toFixed(1)}x`);
      console.log('[Agent] Cancelling subscription - no longer profitable');
      await cancelSmartRouterSubscription();
    } else {
      console.log(`[Agent] Smart Router ROI: ${currentROI.toFixed(1)}x - maintaining subscription`);
    }
  }, 7 * 24 * 60 * 60 * 1000); // Weekly
}
```

---

## Real-World Agent Example

### Development Agent (High ROI)

**Profile:**
- Writes code, runs tests, generates documentation
- 500 requests/day
- Currently uses Opus for everything

**Baseline Costs:**
```
500 requests/day × $0.15/request = $75/day = $2,250/month
Model distribution: 100% Opus
```

**With Smart Router:**
```javascript
const agent = new DevelopmentAgent();

// Week 1: Free tier trial (100 requests/day)
await agent.trySmartRouter(7);

// Results after 7 days:
{
  routingDistribution: {
    haiku: 45%,    // Simple tasks: "run tests", "format code"
    sonnet: 35%,   // Medium tasks: "refactor function", "add tests"
    opus: 20%      // Complex tasks: "design architecture", "debug race condition"
  },
  costs: {
    original: $525/week,
    optimized: $210/week,
    savings: $315/week
  }
}

// Calculate ROI
const monthlySavings = $315 × 4.3 = $1,354/month
const smartRouterCost = $0.50/month
const roi = $1,354 / $0.50 = 2,708x

// Agent decision
if (roi >= agent.policy.minROI) {  // 2,708x >= 10x ✓
  await agent.subscribeToSmartRouterPro();
  console.log('[Agent] Subscribed - 2,708x ROI, saves $1,354/month');
}
```

### Customer Support Agent (Medium ROI)

**Profile:**
- Answers questions, generates responses
- 200 requests/day
- Mix of simple and complex questions

**Baseline Costs:**
```
200 requests/day × $0.05/request = $10/day = $300/month
Model distribution: 50% Sonnet, 50% Opus
```

**With Smart Router:**
```
Routing distribution: 60% Haiku, 30% Sonnet, 10% Opus
Optimized cost: $4/day = $120/month
Savings: $180/month
Smart Router cost: $0.50/month
ROI: 360x ✓
```

**Agent subscribes:** ROI 360x exceeds 10x threshold

### Research Agent (Low ROI - Free Tier Only)

**Profile:**
- Deep research tasks, all complex
- 50 requests/day
- Already uses cheapest viable model (Sonnet)

**Baseline Costs:**
```
50 requests/day × $0.02/request = $1/day = $30/month
Model distribution: 100% Sonnet (already optimized)
```

**With Smart Router:**
```
Routing distribution: 5% Haiku, 95% Sonnet
Optimized cost: $0.95/day = $28.50/month
Savings: $1.50/month
Smart Router cost: $0.50/month
Net savings: $1.00/month
ROI: 2x
```

**Agent decision:** ROI 2x < 10x threshold → Stay on free tier
(Agent still benefits from 100 free routing decisions/day)

---

## Implementation Example

```typescript
import { SmartRouterClient } from '@openclaw/smart-router';
import { X402Client } from '@x402/client';

class RoutingOptimizationAgent {
  private router: SmartRouterClient;
  private x402: X402Client;
  private policy: AgentPolicy;

  async autoOptimize() {
    // Step 1: Measure baseline (1 week)
    console.log('[Agent] Measuring baseline costs (7 days)...');
    const baseline = await this.measureWeek();
    console.log(`[Agent] Baseline: ${baseline.requests} requests, $${baseline.cost}`);

    // Step 2: Try free tier
    console.log('[Agent] Testing Smart Router free tier...');
    await this.router.enable();
    const optimized = await this.measureWeek();
    console.log(`[Agent] Optimized: ${optimized.requests} requests, $${optimized.cost}`);

    // Step 3: Calculate savings
    const savings = baseline.cost - optimized.cost;
    const savingsPercent = (savings / baseline.cost) * 100;
    console.log(`[Agent] Savings: $${savings} (${savingsPercent.toFixed(1)}%)`);

    // Step 4: Check if Pro tier needed
    const avgDailyRequests = baseline.requests / 7;
    if (avgDailyRequests <= 100) {
      console.log('[Agent] Free tier sufficient - no subscription needed');
      return { decision: 'free_tier', savings };
    }

    // Step 5: Calculate Pro tier ROI
    const monthlySavings = savings * 4.3;
    const proCost = 0.50;
    const roi = monthlySavings / proCost;

    console.log(`[Agent] Pro tier analysis:
      Monthly savings: $${monthlySavings.toFixed(2)}
      Pro tier cost: $${proCost}
      ROI: ${roi.toFixed(1)}x
    `);

    // Step 6: Decision
    if (roi >= this.policy.minROI && proCost <= this.policy.maxPerTool) {
      if (this.policy.autoSubscribe) {
        console.log('[Agent] Subscribing to Smart Router Pro...');
        const txHash = await this.subscribePro();
        console.log(`[Agent] Subscribed ✓ Transaction: ${txHash}`);
        return { decision: 'subscribed_pro', roi, txHash };
      } else {
        console.log('[Agent] Requesting human approval...');
        return { decision: 'needs_approval', roi };
      }
    } else {
      console.log(`[Agent] ROI ${roi.toFixed(1)}x below threshold ${this.policy.minROI}x`);
      return { decision: 'stay_free_tier', roi };
    }
  }

  private async subscribePro(): Promise<string> {
    const payment = await this.x402.createPayment({
      recipient: '0xSmartRouterProAddress',
      amount: 0.50,
      currency: 'USDT',
      memo: 'Smart Router Pro - 30 days'
    });

    return await payment.sign().broadcast();
  }

  async monitorAndOptimize() {
    // Run monthly
    setInterval(async () => {
      const currentROI = await this.calculateCurrentROI();

      if (currentROI < this.policy.minROI) {
        console.log(`[Agent] ROI dropped to ${currentROI.toFixed(1)}x - cancelling`);
        await this.router.cancelSubscription();
      } else {
        console.log(`[Agent] ROI: ${currentROI.toFixed(1)}x - optimal ✓`);
      }
    }, 30 * 24 * 60 * 60 * 1000);
  }
}

// Usage
const agent = new RoutingOptimizationAgent({
  wallet: '0xAgentWallet',
  policy: {
    minROI: 10,
    maxPerTool: 1.00,
    autoSubscribe: true
  }
});

await agent.autoOptimize();
await agent.monitorAndOptimize();
```

---

## Economic Impact at Scale

### Single Agent
- Baseline cost: $2,000/month
- Smart Router Pro: $0.50/month
- Savings: 45% = $900/month
- Net savings: $899.50/month
- **ROI: 1,799x**

### Agent Fleet (100 agents)
- Baseline cost: $200,000/month
- Smart Router Pro: $50/month (100 agents × $0.50)
- Savings: 45% = $90,000/month
- Net savings: $89,950/month
- **Annual savings: $1,079,400**

### Ecosystem (1,000,000 agents)
- Baseline cost: $2B/month
- Smart Router Pro: $500,000/month
- Savings: 45% = $900M/month
- Net savings: $899.5M/month
- **Annual savings: $10.8B**

This is why the agent economy scales - micropayments ($0.50) enable massive value capture.

---

## Summary

**For Autonomous Agents:**
1. **Measure baseline:** Track current LLM costs for 1 week
2. **Try free tier:** Test Smart Router with 100 decisions/day
3. **Calculate ROI:** Compare savings vs. Pro tier cost ($0.50/month)
4. **Auto-subscribe:** If ROI ≥ 10x and within policy, subscribe autonomously
5. **Monitor monthly:** Cancel if ROI drops below threshold

**For Humans:**
- Set delegation policy once (budget, ROI threshold)
- Agent optimizes routing and subscriptions
- Audit blockchain payments anytime
- Typical ROI: 100x - 2,000x for high-volume agents

**Economic Model:**
- Free tier: 100 routing decisions/day (sufficient for low-volume)
- Pro tier: Unlimited routing ($0.50/month)
- Typical savings: 30-50% of LLM costs
- Break-even: $1/month LLM spend (saves $0.50, costs $0.50)
- Sweet spot: $100+/month LLM spend (saves $45, costs $0.50 = 90x ROI)

---

## Links

- **Smart Router GitHub:** https://github.com/AtlasPA/openclaw-smart-router
- **x402 Protocol:** https://www.x402.org/
- **Complexity Analysis:** See `src/analyzer.js`

**Next:** Let your agent evaluate Smart Router autonomously
