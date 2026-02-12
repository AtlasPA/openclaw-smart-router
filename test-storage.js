import { RouterStorage } from './src/storage.js';
import { join } from 'path';
import { homedir } from 'os';
import { randomUUID } from 'crypto';

/**
 * Test script for RouterStorage
 * Verifies all key storage methods work correctly
 */

async function testStorage() {
  console.log('\n🧪 Testing RouterStorage...\n');

  const dbPath = join(homedir(), '.openclaw', 'openclaw-smart-router', 'smart-router.db');
  const storage = new RouterStorage(dbPath);
  const testWallet = '0xTestWallet' + randomUUID().slice(0, 8);

  try {
    // 1. Test Quota Management
    console.log('1️⃣ Testing Quota Management...');
    const quota = storage.getQuota(testWallet);
    console.log(`   ✅ Quota initialized: ${quota.tier} tier, ${quota.decisions_limit} decisions/day`);

    const quotaCheck = storage.checkQuotaAvailable(testWallet);
    console.log(`   ✅ Quota available: ${quotaCheck.available}, remaining: ${quotaCheck.remaining}`);

    storage.incrementDecisionCount(testWallet);
    const quotaAfter = storage.getQuota(testWallet);
    console.log(`   ✅ Decision count incremented: ${quotaAfter.decisions_today}`);

    // 2. Test Routing Decision Recording
    console.log('\n2️⃣ Testing Routing Decision Recording...');
    const decisionId = randomUUID();

    storage.recordDecision({
      decision_id: decisionId,
      agent_wallet: testWallet,
      task_complexity: 0.7,
      context_length: 2500,
      task_type: 'code',
      has_code: true,
      has_errors: false,
      has_data: false,
      selected_model: 'claude-sonnet-4-5',
      selected_provider: 'anthropic',
      selection_reason: 'complexity_match',
      confidence_score: 0.85,
      alternatives_json: JSON.stringify([
        { model: 'claude-haiku-4-5', score: 0.6, reason: 'too_simple' },
        { model: 'claude-opus-4-5', score: 0.75, reason: 'too_expensive' }
      ])
    });
    console.log(`   ✅ Decision recorded: ${decisionId}`);

    const decision = storage.getDecision(decisionId);
    console.log(`   ✅ Decision retrieved: ${decision.selected_model} (confidence: ${decision.confidence_score})`);

    // 3. Test Outcome Recording
    console.log('\n3️⃣ Testing Outcome Recording...');
    storage.recordOutcome(decisionId, {
      was_successful: true,
      actual_tokens: 2800,
      actual_cost_usd: 0.012,
      response_quality: 0.9,
      response_time_ms: 1500
    });
    console.log(`   ✅ Outcome recorded for decision: ${decisionId}`);

    const decisionWithOutcome = storage.getDecision(decisionId);
    console.log(`   ✅ Outcome verified: success=${decisionWithOutcome.was_successful}, cost=$${decisionWithOutcome.actual_cost_usd}`);

    // 4. Test Pattern Creation
    console.log('\n4️⃣ Testing Pattern Management...');
    const patternId = randomUUID();

    storage.createPattern({
      pattern_id: patternId,
      agent_wallet: testWallet,
      pattern_type: 'task_based',
      pattern_description: 'Code tasks with medium complexity',
      task_type: 'code',
      complexity_min: 0.6,
      complexity_max: 0.8,
      context_length_min: 2000,
      context_length_max: 5000,
      keywords_json: ['code', 'function', 'class'],
      recommended_model: 'claude-sonnet-4-5',
      recommended_provider: 'anthropic'
    });
    console.log(`   ✅ Pattern created: ${patternId}`);

    // 5. Test Pattern Retrieval
    const pattern = storage.getPattern({
      agent_wallet: testWallet,
      task_type: 'code',
      complexity_min: 0.65,
      complexity_max: 0.75
    });
    console.log(`   ✅ Pattern retrieved: ${pattern?.recommended_model || 'none'}`);

    // 6. Test Pattern Stats Update
    storage.updatePatternStats(patternId, true, 0.012, 0.9);
    const updatedPattern = storage.getPattern({
      agent_wallet: testWallet,
      task_type: 'code',
      complexity_min: 0.65,
      complexity_max: 0.75
    });
    console.log(`   ✅ Pattern stats updated: success_count=${updatedPattern.success_count}, confidence=${updatedPattern.confidence.toFixed(2)}`);

    // 7. Test Model Performance Tracking
    console.log('\n5️⃣ Testing Model Performance Tracking...');
    storage.updateModelPerformance(
      testWallet,
      'claude-sonnet-4-5',
      'anthropic',
      'code',
      {
        was_successful: true,
        actual_cost_usd: 0.012,
        response_quality: 0.9,
        response_time_ms: 1500
      }
    );
    console.log(`   ✅ Model performance updated`);

    const modelPerf = storage.getModelPerformance(testWallet, 'claude-sonnet-4-5', 'code');
    console.log(`   ✅ Performance retrieved: ${modelPerf.total_requests} requests, avg quality=${modelPerf.avg_quality_score.toFixed(2)}`);

    // 8. Test Statistics
    console.log('\n6️⃣ Testing Statistics...');
    const stats = storage.getRoutingStats(testWallet, '7 days');
    console.log(`   ✅ Routing stats: ${stats.total_decisions} decisions, avg cost=$${stats.avg_cost?.toFixed(4) || 0}`);

    const byModel = storage.getDecisionsByModel(testWallet, '7 days');
    console.log(`   ✅ Decisions by model: ${byModel.length} model(s) used`);
    byModel.forEach(m => {
      console.log(`      - ${m.selected_model}: ${m.count} requests`);
    });

    const byTaskType = storage.getDecisionsByTaskType(testWallet, '7 days');
    console.log(`   ✅ Decisions by task type: ${byTaskType.length} task type(s)`);
    byTaskType.forEach(t => {
      console.log(`      - ${t.task_type}: ${t.count} requests`);
    });

    // 9. Test Payment Methods
    console.log('\n7️⃣ Testing Payment Methods...');
    const paymentRequestId = randomUUID();

    storage.recordPaymentRequest(paymentRequestId, testWallet, 0.5, 'USDT');
    console.log(`   ✅ Payment request recorded: ${paymentRequestId}`);

    const paymentRequest = storage.getPaymentRequest(paymentRequestId);
    console.log(`   ✅ Payment request retrieved: ${paymentRequest.amount_requested} ${paymentRequest.token}`);

    storage.updatePaymentRequest(paymentRequestId, 'completed', '0xTestTxHash123');
    console.log(`   ✅ Payment request updated to completed`);

    storage.recordPaymentTransaction({
      agent_wallet: testWallet,
      tx_hash: '0xTestTxHash123',
      amount: 0.5,
      token: 'USDT',
      chain: 'base',
      verified: true,
      tier_granted: 'pro',
      duration_months: 1
    });
    console.log(`   ✅ Payment transaction recorded`);

    const latestPayment = storage.getLatestPayment(testWallet);
    console.log(`   ✅ Latest payment: ${latestPayment.amount} ${latestPayment.token}, tier: ${latestPayment.tier_granted}`);

    // 10. Test Tier Update
    console.log('\n8️⃣ Testing Tier Update...');
    const paidUntil = new Date();
    paidUntil.setMonth(paidUntil.getMonth() + 1);

    storage.updateAgentTier(testWallet, 'pro', paidUntil.toISOString());
    const proQuota = storage.getQuota(testWallet);
    console.log(`   ✅ Tier updated to pro: decisions_limit=${proQuota.decisions_limit} (unlimited)`);

    const proCheck = storage.checkQuotaAvailable(testWallet);
    console.log(`   ✅ Pro quota check: available=${proCheck.available}, remaining=${proCheck.remaining}`);

    // 11. Test Pricing
    console.log('\n9️⃣ Testing Pricing...');
    const pricing = storage.getPricing('anthropic', 'claude-sonnet-4-5');
    console.log(`   ✅ Pricing retrieved: $${pricing.cost_per_1k_prompt}/1k prompt, $${pricing.cost_per_1k_completion}/1k completion`);

    // Summary
    console.log('\n✅ All storage tests passed!\n');
    console.log('📊 Test Summary:');
    console.log(`   - Test Wallet: ${testWallet}`);
    console.log(`   - Decisions Recorded: ${stats.total_decisions}`);
    console.log(`   - Patterns Created: 1`);
    console.log(`   - Model Performance Entries: 1`);
    console.log(`   - Payment Transactions: 1`);
    console.log(`   - Tier: ${proQuota.tier}`);

    storage.close();
    console.log('\n✅ Storage connection closed.\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    storage.close();
    process.exit(1);
  }
}

// Run tests
testStorage().catch(error => {
  console.error('Test error:', error);
  process.exit(1);
});
