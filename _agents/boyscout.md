# The Boy Scout Checklist

> Before merging any change, leave the codebase **clearer, safer, and more professional** than you found it.

---

## 1. Encapsulation & DRY

* Did I **reuse existing components, utilities, or patterns** instead of duplicating logic?
* Can any logic be **simplified, extracted, or centralized**?
* Does each function/module have **one clear responsibility**?
* Are variations handled through **configuration or composition**, not copy-paste?

## 2. Naming & Clarity

* Are names **clear, consistent, and intention-revealing**?
* Are public interfaces **small, explicit, and well-typed**?
* Is non-obvious logic explained with a brief **“why” comment**?

## 3. Consistency & Style

* Does this code follow **existing conventions** (structure, formatting, patterns)?
* Did I avoid introducing **one-off UI, styles, or behaviors**?
* Are visuals, interactions, and APIs consistent with the rest of the system?

## 4. Professionalism

* Are comments written **for other programmers**, not just for myself?
* Are comments **clear, neutral, and respectful** in tone?
* **Absolutely no emojis** in source code, comments, logs, or identifiers
* No jokes, snark, venting, or editorializing in code
* Temporary hacks are **explicitly marked and explained**, with a follow-up plan
* Debug artifacts (console prints, TODO spam) are commented out or removed

## 5. Observability & Safety

* Would future developers understand what’s happening if this fails?
* Are important operations **logged with useful context** (identifiers, timing, outcomes)?
* Are errors **handled explicitly**, not swallowed or hidden?

## 6. State & Side Effects

* Are state changes **intentional, minimal, and guarded**?
* Are side effects predictable, stable, and properly cleaned up?
* Could this change cause **loops, duplicate work, race conditions, or leaks**?

## 7. Tests Where It Matters

* Did I add or update tests for **new or changed behavior**?
* If not, was that a conscious decision with a **clear follow-up note**?

## 8. Production Readiness

* Would I feel comfortable deploying this **without supervision**?
* Does it fail gracefully under retries, partial failure, or latency?
* Did I avoid committing unnecessary generated or temporary artifacts?

---

### Final Gut Check

> Does this change make the codebase **more understandable, more reusable, and more respectful of the next person**?