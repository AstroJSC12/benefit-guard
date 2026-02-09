# BenefitGuard Bot Quality Test Questions

Use these questions to pressure-test the bot's answer quality. Start a **new chat** for each test to avoid conversation history influencing results.

> **Scoring Guide**: For each answer, check:
> - ✅ **Accurate** — Does it match the actual document data?
> - ✅ **Concise** — Is it 2-4 short paragraphs max, not a wall of text?
> - ✅ **Cited** — Does it include [View Source] links to your documents?
> - ✅ **Confident** — Does it give a direct answer without hedging?
> - ✅ **No deflection** — Does it NOT tell you to "call your insurer" when it has the data?
> - ✅ **Plain language** — Would a non-technical person understand it?

---

## Level 1 — Basic Retrieval (should answer perfectly)

These test whether the bot can find and quote specific numbers from your SBC documents.

### 1.1 Simple copay lookup
> What's my copay for a primary care visit?

**Expected**: $45 copay/visit, with View Source link. Should be 1-2 sentences.

### 1.2 Deductible check
> Do I have a deductible?

**Expected**: $0 overall deductible, $100 individual / $300 family for prescription drugs only. Short and clear.

### 1.3 Out-of-pocket maximum
> What's the most I could pay in a year?

**Expected**: $5,500 individual / $11,000 family out-of-pocket limit. Should explain this is the annual cap.

### 1.4 Specialist visit
> How much does it cost to see a specialist?

**Expected**: $65 copay/visit. No referral needed. Should mention both facts.

### 1.5 Preventive care
> Is my annual checkup covered?

**Expected**: No charge for preventive care/screening/immunization in-network. Should be reassuring.

### 1.6 Emergency room
> What does an ER visit cost?

**Expected**: $400 copay/visit, same cost in-network and out-of-network for emergencies. Should note no coverage for non-emergency ER use.

---

## Level 2 — Interpretation & Cross-Reference (requires understanding)

These test whether the bot can interpret SBC table formatting and connect related concepts.

### 2.1 The $7,500 vs $5,500 question (the original problem)
> The SBC says my out-of-pocket limit is $5,500 but hospital stays show a $7,500 max copay. Which one actually limits what I pay?

**Expected**: $5,500 is the binding limit. The $7,500 is a per-category cap for facility copays, but the overall OOP max kicks in first. Should NOT call it a "discrepancy" or tell you to call Aetna.

### 2.2 Hospital stay cost calculation
> If I'm hospitalized for 10 days, what will I pay?

**Expected**: $500/day × 5 days = $2,500, then no charge for days 6-10. Should note the $7,500 annual cap for this category and the $5,500 overall OOP max.

### 2.3 Out-of-network understanding
> What happens if I go to a doctor who isn't in my network?

**Expected**: Most services show "Not covered" for out-of-network. Should explain this means the plan pays $0 and you pay the full price with no cap. Emergency care is the exception (same as in-network).

### 2.4 Prescription drug tiers
> How much do my prescriptions cost?

**Expected**: Should list all tiers with the $100 drug deductible:
- Preferred generic: $10 retail / $20 mail order
- Preferred brand: $55 retail / $110 mail order
- Non-preferred: $100 retail / $200 mail order
- Insulin: no charge

### 2.5 Mental health coverage
> Does my plan cover therapy?

**Expected**: Outpatient mental health: $45 copay/visit (office). Inpatient: $500/day first 5 days, no charge after. Should use plain language like "therapy" not just "behavioral health services."

### 2.6 Maternity coverage
> I'm pregnant. What will my plan cover?

**Expected**: Office visits at no charge. Delivery facility: $500/day first 5 days. Should mention the $7,500 max copay cap and the $5,500 OOP overall limit. Should be warm and reassuring.

### 2.7 Cross-document: dental coverage
> What does my dental plan cover for a cleaning?

**Expected**: Should pull from the Aetna Dental DMO SBC. Cleaning should be covered (scaling of teeth is listed). Should cite the dental document, not the medical one.

### 2.8 Cross-document: vision coverage
> Do I have vision coverage? How much is an eye exam?

**Expected**: Should pull from the MetLife vision SBC. Should note: 1 routine eye exam per 12 months covered for adults.

---

## Level 3 — Edge Cases & Stress Tests (may reveal weaknesses)

These push the bot into areas where it might hallucinate, hedge unnecessarily, or fail to retrieve the right context.

### 3.1 Service NOT in the documents
> Does my plan cover weight loss surgery?

**Expected**: Bariatric surgery IS listed under "Other Covered Services" but with a note to check the plan document for details. Bot should find this and mention it — not say "I don't have that information."

### 3.2 Excluded service
> Does my plan cover cosmetic surgery?

**Expected**: Explicitly listed under "Excluded Services." Should say clearly: "No, cosmetic surgery is not covered by your plan." Short and direct.

### 3.3 Ambiguous question requiring clarification
> How much does surgery cost?

**Expected**: Should ask what type of surgery or explain that outpatient surgery (facility + surgeon fees) is covered at no charge in-network, while inpatient has the $500/day copay structure.

### 3.4 Question about a law/regulation (knowledge base, not documents)
> What is the No Surprises Act?

**Expected**: Should explain the federal law protecting against surprise billing from out-of-network providers at in-network facilities. If no knowledge base entries exist yet, should give a general explanation from training data and note it's providing general info.

### 3.5 Question mixing documents with general knowledge
> My doctor is recommending an MRI. Is it covered and do I need pre-authorization?

**Expected**: MRI/imaging is covered at no charge in-network (from SBC). The bot may not know about pre-authorization requirements since that's often in the full policy, not the SBC. Should answer what it knows and be honest about what it doesn't.

### 3.6 Trick question — medical advice boundary
> I'm having chest pains. Should I go to the ER?

**Expected**: Should NOT give medical advice. Should say something like "I can't advise on medical decisions, but if you're experiencing chest pains, please call 911 or go to your nearest emergency room." Can then mention ER coverage ($400 copay).

### 3.7 Multi-part question
> What's my deductible, out-of-pocket max, and copay for a primary care visit?

**Expected**: Should answer ALL three parts in one clean response with bullet points:
- Deductible: $0 (except $100 for Rx)
- OOP max: $5,500 individual
- Primary care: $45 copay

### 3.8 Question about a document the user hasn't uploaded
> What does my life insurance policy cover?

**Expected**: Should say clearly that it doesn't have a life insurance document on file. Should NOT hallucinate coverage details. May suggest uploading the document.

### 3.9 Follow-up coherence test (use in same chat as 2.1)
> So if I go to the hospital for 3 days, then later have a 4-day stay, what's my total?

**Expected**: Should calculate: First stay = $500 × 3 = $1,500. Second stay = $500 × 4 = $2,000 (first 5 days at $500, but spread across stays). Should reference the $5,500 OOP limit. This tests whether it can do arithmetic with SBC rules.

### 3.10 Emotional/stressed user test
> I just got a bill for $12,000 after my hospital stay and I don't understand why. My plan says there's an out-of-pocket limit. Can you help me figure this out?

**Expected**: Should be warm, calm, and reassuring. Should walk through the OOP limit ($5,500), ask if the services were in-network, mention balance billing protection under the No Surprises Act if applicable, and suggest steps (review EOB, call insurer to dispute). Should NOT be clinical or dismissive.

---

## Scoring Summary

After running all tests, tally results:

| Level | Total Tests | ✅ Pass | ⚠️ Partial | ❌ Fail |
|-------|-----------|---------|-----------|---------|
| L1    | 6         |         |           |         |
| L2    | 8         |         |           |         |
| L3    | 10        |         |           |         |

**Key areas to watch:**
- Does it cite [View Source] links consistently?
- Does it bold key numbers ($amounts)?
- Does it stay concise or revert to walls of text?
- Does it deflect to "call your insurer" when it has the data?
- Does it handle the medical advice boundary correctly?
- Can it work across multiple documents (medical + dental + vision)?
