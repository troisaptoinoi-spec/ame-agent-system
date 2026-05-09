# 🚀 AME AGENT SYSTEM — Kế Hoạch Triển Khai Chi Tiết

> **Dựa trên:** [`plans/ame-agent-system-blueprint.md`](plans/ame-agent-system-blueprint.md)
> **Ngày:** 2026-05-09 | **Tổng effort:** ~6 giờ | **4 Phases**

---

## 📊 TỔNG QUAN ROADMAP

```
╔══════════════════════════════════════════════════════════════════════╗
║  AME AGENT SYSTEM — IMPLEMENTATION ROADMAP                          ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  Phase 1: MVP FOUNDATION          [30 phút]    ████████░░░░░░░░░░  ║
║  Phase 2: AGENT ROUTING           [1 giờ]      ████████████░░░░░░  ║
║  Phase 3: SAFETY & HANDOFF        [1.5 giờ]    ████████████████░░  ║
║  Phase 4: EVOLUTION & METRICS     [3 giờ]      ██████████████████  ║
║                                                                      ║
║  Tổng: ~6 giờ | Có thể triển khai dần theo từng phase              ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 📋 PHASE 1: MVP FOUNDATION (30 phút)

### Mục tiêu
Thiết lập CEO Deep Dive + Agent Router cơ bản + Workspace Bootstrap skill.

### Tasks

| # | Task | File | Effort | Dependencies |
|---|------|------|--------|-------------|
| 1.1 | Thêm CEO Deep Dive rule vào core-principles | `~/.roo/rules/01-core-principles.md` | 10 phút | Không |
| 1.2 | Thêm Agent Router rule (keyword-based) | `~/.roo/rules/01-core-principles.md` | 10 phút | 1.1 |
| 1.3 | Tạo Workspace Bootstrap skill | `~/.roo/skills/workspace-bootstrap/SKILL.md` | 10 phút | Không |

### Chi tiết từng task

#### Task 1.1 — CEO Deep Dive Rule

**File:** `~/.roo/rules/01-core-principles.md`
**Thay đổi:** Thêm section mới "CEO Deep Dive Protocol"

```markdown
## CEO Deep Dive Protocol

Khi nhận yêu cầu từ người dùng, thực hiện quy trình:

1. Đọc memory (core-memory, error-log, lessons-learned) để hiểu context
2. Đánh giá mức hiểu biết: đã hiểu ≥ 95% yêu cầu chưa?
3. Nếu ≥ 95%: triển khai ngay, không hỏi
4. Nếu < 95%: hỏi 1 câu (ngắn gọn, có 2-4 gợi ý sẵn)
5. Nếu vẫn < 95% sau câu 1: hỏi thêm 1 câu nữa (tối đa 3 câu)
6. Khi đã hiểu ≥ 95%: phân tích complexity → chuyển tiếp

Nguyên tắc:
- Câu hỏi phải ngắn gọn, tối ưu token
- Luôn cung cấp gợi ý sẵn (2-4 options) để người dùng chọn nhanh
- Không hỏi lại thông tin đã có trong memory
- Task đơn giản (fix typo, thêm CSS): không cần hỏi
```

#### Task 1.2 — Agent Router Rule

**File:** `~/.roo/rules/01-core-principles.md`
**Thay đổi:** Thêm section mới "Agent Auto-Routing"

```markdown
## Agent Auto-Routing

Sau khi hiểu yêu cầu, tự động chọn mode + skills phù hợp:

| Keywords | Mode | Skills |
|----------|------|--------|
| code, fix, bug, feature, implement | code | refactor-safe, code-review |
| design, architecture, plan, schema | architect | api-design, database-design |
| debug, error, crash, exception | debug | error-diagnosis |
| deploy, CI/CD, docker, server | devops | deploy-checklist |
| docs, README, API, changelog | documentation-writer | docs-generator |
| security, auth, OWASP | security-review | security-audit |
| test, coverage, mock, e2e | jest-test-engineer | test-strategy |
| optimize, performance, research | ask | performance-optimization |
| new project, setup, init | orchestrator | project-bootstrap |

Complexity scoring:
- 1-3: Single agent, sequential
- 4-6: 2-3 agents, parallel nếu independent
- 7-10: Full pipeline, multi-agent coordination
```

#### Task 1.3 — Workspace Bootstrap Skill

**File:** `~/.roo/skills/workspace-bootstrap/SKILL.md`

```markdown
---
name: workspace-bootstrap
description: Tự động tạo workspace cho dự án mới
auto-apply-triggers:
  - "tạo project"
  - "new project"
  - "khởi tạo dự án"
  - "setup project"
---

# Workspace Bootstrap

Tự động tạo workspace cho dự án mới với cấu trúc chuẩn.

## Quy trình

1. Hỏi loại project (Web App / API / CLI / Full-Stack)
2. Hỏi tech stack (Next.js / React / Python / etc.)
3. Tạo cấu trúc thư mục:
   - src/ (source code)
   - docs/ (documentation)
   - tests/ (test files)
   - configs/ (configuration)
4. Tạo config files (package.json, tsconfig, .gitignore, .env.example)
5. Khởi tạo git repository
6. Tạo README.md với thông tin dự án
7. Tạo initial commit

## Output

- Workspace hoàn chỉnh, sẵn sàng code
- Git repo đã init
- README.md đã tạo
```

### Milestone 1 — Acceptance Criteria

- [ ] CEO hỏi 1 câu khi < 95% hiểu (không hỏi khi ≥ 95%)
- [ ] Agent Router tự chọn mode dựa trên keywords
- [ ] Workspace Bootstrap tạo project mới tự động
- [ ] Test: gửi "tạo API cho login" → Router chọn code mode + api-design skill

### Rủi ro Phase 1

| Rủi ro | Mức độ | Mitigation |
|--------|--------|-----------|
| Rules quá dài → tốn token | Thấp | Giữ rules ngắn gọn, mỗi dòng thay đổi hành vi |
| Router chọn sai mode | Trung bình | Thêm fallback: hỏi người dùng nếu không chắc |
| Workspace Bootstrap thiếu linh hoạt | Thấp | Hỏi tech stack trước khi scaffold |

---

## 📋 PHASE 2: AGENT ROUTING & MEMORY (1 giờ)

### Mục tiêu
Nâng cấp routing logic, thêm complexity scoring, tối ưu memory loading.

### Tasks

| # | Task | File | Effort | Dependencies |
|---|------|------|--------|-------------|
| 2.1 | Nâng cấp Agent Router với complexity scoring | `~/.roo/rules/01-core-principles.md` | 15 phút | Phase 1 |
| 2.2 | Thêm Memory Loading Protocol | `~/.roo/rules/01-core-principles.md` | 15 phút | Không |
| 2.3 | Thêm Execution Mode Selection rule | `~/.roo/rules/01-core-principles.md` | 15 phút | 2.1 |
| 2.4 | Cập nhật core-memory với AME system info | `~/.roo/memory/core-memory.md` | 15 phút | Không |

### Chi tiết

#### Task 2.1 — Complexity Scoring

```markdown
## Complexity Scoring

Đánh giá độ phức tạp của task (1-10):

| Factor | Score | Ví dụ |
|--------|-------|-------|
| 1 file, 1 function | 1-2 | Fix typo, thêm CSS |
| 2-5 files, 1 feature | 3-4 | Thêm API endpoint |
| 5-10 files, multi-feature | 5-6 | Thêm auth system |
| 10+ files, architecture change | 7-8 | Refactor database |
| Full project, new tech stack | 9-10 | Tạo app mới |

Quy tắc:
- Score ≤ 3: 1 agent, sequential, không cần handoff
- Score 4-6: 2-3 agents, parallel nếu independent
- Score ≥ 7: Full pipeline, multi-agent, có handoff
```

#### Task 2.2 — Memory Loading Protocol

```markdown
## Memory Loading Protocol

Khi bắt đầu session, đọc theo thứ tự ưu tiên:

1. core-memory.md (LUÔN đọc — biết user là ai)
2. error-log.md (đọc khi task liên quan đến debug/fix)
3. lessons-learned.md (đọc khi task phức tạp, score ≥ 5)
4. skill-suggestions.md (đọc khi cần cải thiện skills)

Token budget cho memory:
- core-memory: ~900 token (luôn load)
- error-log: ~500 token (load khi cần)
- lessons-learned: ~800 token (load khi cần)
- Tổng max: ~2,200 token
```

### Milestone 2 — Acceptance Criteria

- [ ] Complexity scoring hoạt động đúng (test với 3 loại task)
- [ ] Memory loading đúng thứ tự ưu tiên
- [ ] Execution mode selection đúng (sequential/parallel/pipeline)
- [ ] Core-memory đã cập nhật AME system info

---

## 📋 PHASE 3: SAFETY & HANDOFF (1.5 giờ)

### Mục tiêu
Thêm safety guardrails, handoff mechanism, permission boundaries.

### Tasks

| # | Task | File | Effort | Dependencies |
|---|------|------|--------|-------------|
| 3.1 | Thêm Safety Guardrails rules | `~/.roo/rules/01-core-principles.md` | 20 phút | Phase 2 |
| 3.2 | Thêm Permission Boundaries per agent | `~/.roo/rules/01-core-principles.md` | 20 phút | 3.1 |
| 3.3 | Thêm Handoff Protocol | `~/.roo/rules/01-core-principles.md` | 20 phút | 3.2 |
| 3.4 | Thêm Human Approval Gates | `~/.roo/rules/01-core-principles.md` | 15 phút | 3.3 |
| 3.5 | Test toàn bộ safety layers | — | 15 phút | 3.4 |

### Chi tiết

#### Task 3.1 — Safety Guardrails

```markdown
## Safety Guardrails — 5 Layers

### Layer 1: Input Validation (CEO)
- Kiểm tra yêu cầu có hợp lệ không
- Detect malicious patterns
- Reject harmful requests trước khi xử lý

### Layer 2: Permission Boundaries
| Agent | Có thể | KHÔNG thể |
|-------|--------|-----------|
| Coder | Đọc/ghi code, commit | Deploy, delete DB |
| Guardian | Audit, scan | Fix code, deploy |
| Deployer | Deploy | Sửa code, delete data |
| Tester | Chạy tests | Sửa code, deploy |

### Layer 3: Output Filtering (CEO)
- Review kết quả trước khi trình bày
- Verify không có sensitive data泄露

### Layer 4: Rate Limiting
- Max 50,000 token/task
- Max 5 agents/task
- Max 3 handoffs/task

### Layer 5: Human Approval Gates
- Deploy to production → CẦN approval
- Delete database/table → CẦN approval
- Git push --force → CẦN approval
- npm publish → CẦN approval
```

#### Task 3.3 — Handoff Protocol

```markdown
## Handoff Protocol

Agents có thể chuyển control cho nhau:

### Khi nào handoff?
- Coder hoàn thành code → handoff sang Guardian (security review)
- Guardian phát hiện vulnerability → handoff sang Coder (fix)
- Coder fix xong → handoff sang Tester (viết tests)
- Tester phát hiện bug → handoff sang Coder (fix)

### Handoff format:
"Chuyển tiếp cho [Agent]: [Lý do]. Context: [thông tin cần thiết]"

### Quy tắc:
- Context phải explicit (không hidden state)
- Tối đa 3 handoffs/task
- Mỗi handoff phải có lý do rõ ràng
- Nếu handoff loop (A→B→A→B): dừng và hỏi người dùng
```

### Milestone 3 — Acceptance Criteria

- [ ] Safety layers hoạt động (test: deploy không có approval → bị chặn)
- [ ] Permission boundaries đúng (Guardian không thể fix code)
- [ ] Handoff hoạt động (Coder → Guardian → Coder)
- [ ] Human approval gates hoạt động (deploy cần confirmation)

---

## 📋 PHASE 4: EVOLUTION & METRICS (3 giờ)

### Mục tiêu
Thêm feedback loops, performance metrics, auto-evolution, selective forgetting.

### Tasks

| # | Task | File | Effort | Dependencies |
|---|------|------|--------|-------------|
| 4.1 | Thêm Evolution Protocol | `~/.roo/rules/01-core-principles.md` | 30 phút | Phase 3 |
| 4.2 | Thêm Performance Metrics tracking | `~/.roo/rules/01-core-principles.md` | 30 phút | 4.1 |
| 4.3 | Thêm Selective Forgetting rules | `~/.roo/rules/01-core-principles.md` | 20 phút | 4.2 |
| 4.4 | Thêm Auto-Refine Prompts protocol | `~/.roo/rules/01-core-principles.md` | 30 phút | 4.3 |
| 4.5 | Cập nhật lessons-learned với AME patterns | `~/.roo/memory/lessons-learned.md` | 20 phút | 4.4 |
| 4.6 | Cập nhật error-log với AME scenarios | `~/.roo/memory/error-log.md` | 20 phút | 4.5 |
| 4.7 | Test toàn bộ hệ thống end-to-end | — | 30 phút | 4.6 |

### Chi tiết

#### Task 4.1 — Evolution Protocol

```markdown
## Evolution Protocol

Sau mỗi task, tự động phân tích:

### Task-level (mỗi task):
- What worked well? → Ghi vào lessons-learned
- What failed? → Ghi vào error-log
- What to improve? → Ghi vào skill-suggestions
- New patterns? → Cập nhật core-memory

### Session-level (khi kết thúc session):
- Tổng token used → cập nhật budget estimates
- Agent performance → cập nhật routing weights
- User satisfaction → cập nhật preferences

### System-level (định kỳ):
- Error patterns → đề xuất rules mới
- Skill usage → đề xuất cải thiện skills
- Token efficiency → tối ưu prompts
- New tools → đề xuất tích hợp
```

#### Task 4.2 — Performance Metrics

```markdown
## Performance Metrics

Theo dõi sau mỗi task:

| Metric | Công thức | Target |
|--------|-----------|--------|
| Token efficiency | tokens_saved / tokens_total | ≥ 30% |
| Task success rate | tasks_passed / tasks_total | ≥ 95% |
| First-time accuracy | code_correct_first / total | ≥ 90% |
| Agent utilization | tasks_per_agent / total_agents | ≥ 50% |
| Handoff efficiency | successful_handoffs / total | ≥ 80% |
| Questions per task | total_questions / total_tasks | ≤ 0.5 |

Lưu metrics vào: ~/.roo/memory/performance-metrics.md
```

### Milestone 4 — Acceptance Criteria

- [ ] Evolution protocol hoạt động (tự ghi lessons sau mỗi task)
- [ ] Performance metrics được track
- [ ] Selective forgetting hoạt động (error-log max 100 entries)
- [ ] Auto-refine prompts hoạt động
- [ ] Test end-to-end: 1 task phức tạp → full pipeline → metrics recorded

---

## 📊 DEPENDENCY MAP

```
Phase 1 (MVP) ─────────────────────────────────────────────┐
├── 1.1 CEO Deep Dive ──┐                                  │
├── 1.2 Agent Router ───┼──→ Phase 2 (Routing)             │
└── 1.3 Workspace ──────┘   ├── 2.1 Complexity Scoring ──┐ │
                             ├── 2.2 Memory Loading ──────┤ │
                             └── 2.3 Execution Mode ──────┤ │
                                                          │ │
                             Phase 3 (Safety) ←───────────┘ │
                             ├── 3.1 Safety Guardrails ───┐ │
                             ├── 3.2 Permissions ─────────┤ │
                             ├── 3.3 Handoff ─────────────┤ │
                             └── 3.4 Human Approval ──────┘ │
                                                           │ │
                             Phase 4 (Evolution) ←──────────┘
                             ├── 4.1 Evolution Protocol
                             ├── 4.2 Metrics
                             ├── 4.3 Selective Forgetting
                             └── 4.4 Auto-Refine
```

---

## ⚠️ RISK REGISTER

| # | Rủi ro | Mức độ | Tác động | Mitigation |
|---|--------|--------|----------|-----------|
| 1 | Rules quá dài → tốn token | Thấp | +200 token/session | Giữ rules ngắn gọn |
| 2 | Router chọn sai mode | Trung bình | Task fail | Fallback: hỏi user |
| 3 | Handoff loop (A→B→A→B) | Trung bình | Tốn token vô ích | Max 3 handoffs, detect loop |
| 4 | Safety quá chặt → block task hợp lệ | Thấp | Giảm productivity | Tuning thresholds |
| 5 | Memory quá lớn → tốn token | Thấp | +500 token/session | Selective forgetting |
| 6 | Agent không có trong Roo Code | Cao | Feature không hoạt động | Map agents → existing modes |

---

## 🎯 SUCCESS CRITERIA

| Metric | Hiện tại | Target Phase 1 | Target Phase 4 |
|--------|----------|----------------|----------------|
| Điểm hệ thống | 9.0/10 | 9.1/10 | 9.3/10 |
| Token overhead/task | 1,000 | 1,100 | 1,200 |
| Code đúng lần đầu | 90% | 91% | 92% |
| Security coverage | 30% | 50% | 90% |
| Test coverage | 40% | 50% | 85% |
| Lần tương tác/task | 4 | 3 | 1 |
| Safety layers | 1 | 2 | 5 |

---

## 📝 IMPLEMENTATION CHECKLIST

### Phase 1 (30 phút)
- [ ] Đọc `~/.roo/rules/01-core-principles.md` hiện tại
- [ ] Thêm section "CEO Deep Dive Protocol"
- [ ] Thêm section "Agent Auto-Routing"
- [ ] Tạo `~/.roo/skills/workspace-bootstrap/SKILL.md`
- [ ] Test: gửi "tạo API cho login" → verify routing

### Phase 2 (1 giờ)
- [ ] Thêm "Complexity Scoring" section
- [ ] Thêm "Memory Loading Protocol" section
- [ ] Thêm "Execution Mode Selection" section
- [ ] Cập nhật `~/.roo/memory/core-memory.md`
- [ ] Test: 3 loại task (simple/medium/complex) → verify scoring

### Phase 3 (1.5 giờ)
- [ ] Thêm "Safety Guardrails" section (5 layers)
- [ ] Thêm "Permission Boundaries" table
- [ ] Thêm "Handoff Protocol" section
- [ ] Thêm "Human Approval Gates" section
- [ ] Test: deploy không approval → verify bị chặn

### Phase 4 (3 giờ)
- [ ] Thêm "Evolution Protocol" section
- [ ] Thêm "Performance Metrics" section
- [ ] Thêm "Selective Forgetting" rules
- [ ] Thêm "Auto-Refine Prompts" protocol
- [ ] Cập nhật lessons-learned + error-log
- [ ] Test end-to-end: task phức tạp → full pipeline
