# Awesome Claude Code Resource Submission

**Submission URL:** https://github.com/hesreallyhim/awesome-claude-code/issues/new?template=recommend-resource.yml

---

## Form Fields

### Display Name
```
OpenClaw Smart Router
```

### Category
```
Tooling
```

### Sub-Category
```
Tooling: Usage Monitors
```

### Primary Link
```
https://github.com/AtlasPA/openclaw-smart-router
```

### Author Name
```
AtlasPA
```

### Author Link
```
https://github.com/AtlasPA
```

### License
```
MIT
```

### Description
```
Intelligent model selection that saves 30-50% on model costs for OpenClaw agents. Automatically analyzes request complexity and routes to optimal models - Opus for complex reasoning, Haiku for simple queries. 4-factor weighted scoring (complexity 40%, budget 30%, patterns 20%, performance 10%), pattern learning after 5+ similar tasks, and multi-provider support. Free tier: 100 routing decisions/day. Pro tier (0.5 USDT/month): unlimited decisions with pattern learning. Includes CLI and web dashboard on port 9093.
```

### Validate Claims
```
1. Install the tool: `cd ~/.openclaw && git clone https://github.com/AtlasPA/openclaw-smart-router.git && cd openclaw-smart-router && npm install && npm run setup`
2. Start the dashboard: `npm run dashboard` (runs on http://localhost:9093)
3. Check routing status: `node src/cli.js status --wallet 0xTestWallet`
4. Make API calls with varying complexity and observe automatic model selection
5. View routing stats: `node src/cli.js stats --wallet 0xTestWallet`
6. Observe 30-50% cost savings compared to always using Opus
```

### Specific Task(s)
```
Install the OpenClaw Smart Router and make various requests (simple queries, code generation, complex reasoning). Observe how it automatically routes to appropriate models and tracks cost savings.
```

### Specific Prompt(s)
```
"Install the OpenClaw Smart Router from ~/.openclaw/openclaw-smart-router. Then show me my routing decisions and cost savings compared to always using Claude Opus."
```

### Additional Comments
```
This is part of the OpenClaw ecosystem (5 tools total: Cost Governor, Memory System, Context Optimizer, Smart Router, and API Quota Tracker). All tools use the same x402 payment protocol for Pro tier subscriptions. Smart Router integrates with Cost Governor for budget-aware routing and learns patterns to optimize model selection over time.
```

### Recommendation Checklist
- [x] I have checked that this resource hasn't already been submitted
- [x] My resource provides genuine value to Claude Code users, and any risks are clearly stated
- [x] All provided links are working and publicly accessible
- [x] I am submitting only ONE resource in this issue
- [x] I understand that low-quality or duplicate submissions may be rejected

---

## Instructions

1. Go to: https://github.com/hesreallyhim/awesome-claude-code/issues/new?template=recommend-resource.yml
2. Copy and paste each field from above into the corresponding form field
3. Check all the checkboxes at the bottom
4. Click "Submit new issue"
5. The automated validator will check your submission and post results as a comment
