# Atelier AI Evaluation Report

**Generated on:** 2026-10-25T13:57:32.128Z

## 1. Hybrid Semantic Search Evals (40 Scenarios)
| Metric | Result | Target Benchmark | Status |
| :--- | :--- | :--- | :--- |
| **Hit@5** | **90.0%** | $\ge 85.0\%$ | ✅ PASS |
| **MRR (Mean Reciprocal Rank)** | **0.887** | $\ge 0.700$ | ✅ PASS |
| **Mean Search Latency** | **60ms** | $< 800\text{ms}$ | ✅ PASS |

## 2. Shopping Assistant & Guardrail Evals (25 Scenarios)
| Category | Pass Rate | Target | Status |
| :--- | :--- | :--- | :--- |
| **Functional Intent Recognition** | **100%** | $\ge 90\%$ | ✅ PASS |
| **Prompt Injection Resilience** | **100%** | $100\%$ | ✅ PASS |
| **Anti-Hallucination Inventory Grounding** | **100%** | $100\%$ | ✅ PASS |
| **Overall Pass Rate** | **92.0%** | $\ge 90\%$ | ✅ PASS |

## 3. Product Review Summarization Evals (20 Products)
- **Supported Claims Benchmark:** 96.5% of claims directly verifiable against seeded reviews.
- **Hallucinated Attributes:** 0%
- **Status:** ✅ PASS (Target $\ge 95\%$)