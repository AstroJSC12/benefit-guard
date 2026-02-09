/**
 * Knowledge Base Seed Data
 *
 * Each entry gets embedded and stored in the KnowledgeBase table for RAG retrieval.
 * sourceUrl uses Text Fragment syntax (#:~:text=) where possible so links jump
 * directly to the relevant section on the official government page.
 */

export interface KBEntry {
  category: string;
  title: string;
  content: string;
  sourceUrl: string | null;
  state: string | null;
}

export const knowledgeBaseEntries: KBEntry[] = [
  // ═══════════════════════════════════════════════════
  // FEDERAL LAW
  // ═══════════════════════════════════════════════════

  {
    category: "Federal Law",
    title: "No Surprises Act – Emergency Services Protection",
    content: `The No Surprises Act (effective January 1, 2022) protects you from surprise medical bills for emergency services.

**What's protected:**
- Emergency room visits at ANY facility — in-network or out-of-network
- You can only be charged your plan's in-network cost-sharing (copay, coinsurance, deductible)
- The emergency department cannot require prior authorization
- This protection applies from the moment you arrive until you are stabilized

**After stabilization:**
- Once stabilized, an out-of-network facility must give you written notice and get your consent before providing additional non-emergency services at out-of-network rates
- You have the right to refuse and request a transfer to an in-network facility

**How to use this right:**
- If you receive a surprise bill for emergency services, tell the provider: "This is covered under the No Surprises Act. I should only owe my in-network cost-sharing amount."
- File a complaint at cms.gov/nosurprises or call 1-800-985-3059

**Key detail**: This applies to BOTH insured and uninsured patients. Uninsured patients have the right to a Good Faith Estimate before receiving care.`,
    sourceUrl: "https://www.cms.gov/nosurprises/consumers/protections-against-surprise-billing#:~:text=Emergency%20services,in-network%20cost%20sharing",
    state: null,
  },

  {
    category: "Federal Law",
    title: "No Surprises Act – Balance Billing Ban at In-Network Facilities",
    content: `Under the No Surprises Act, you are protected from balance billing when you receive care from an out-of-network provider at an in-network facility.

**The problem this solves:**
You go to an in-network hospital for surgery. The hospital is in-network, but the anesthesiologist turns out to be out-of-network. Previously, that anesthesiologist could bill you the full difference. That's "balance billing."

**Your protection:**
- Out-of-network providers at in-network facilities cannot balance bill you
- You only pay your in-network cost-sharing amount
- This applies to: anesthesiologists, radiologists, pathologists, neonatologists, assistant surgeons, and other specialists you didn't choose

**Exception – written consent:**
- A provider CAN bill out-of-network rates if they give you written notice at least 72 hours before the service AND you sign a consent form
- This does NOT apply to emergency services or ancillary providers — you're always protected there
- You can NEVER be asked to waive your rights for emergency care

**If you get a surprise bill:** Don't pay it. Contact your insurer and file a complaint at cms.gov/nosurprises.`,
    sourceUrl: "https://www.cms.gov/nosurprises/consumers/protections-against-surprise-billing#:~:text=Non-emergency%20services,at%20in-network%20facilities",
    state: null,
  },

  {
    category: "Federal Law",
    title: "No Surprises Act – Good Faith Estimates for Uninsured & Self-Pay",
    content: `If you are uninsured or choose to pay out-of-pocket (self-pay), you have the right to a Good Faith Estimate under the No Surprises Act.

**Your rights:**
- Any healthcare provider must give you a written Good Faith Estimate of expected charges BEFORE you receive care
- You should receive it when you schedule a service, or when you ask for one
- The estimate must include charges for all related items and services, including co-providers

**If the final bill is significantly higher:**
- If the actual bill is at least $400 more than the Good Faith Estimate, you can dispute it
- You use the Patient-Provider Dispute Resolution (PPDR) process
- You must initiate the dispute within 120 calendar days of receiving the bill

**How to request:**
- Ask your provider: "I'd like a Good Faith Estimate for this service under the No Surprises Act."
- They must provide it within 1 business day for services scheduled 3+ days out, or within 3 business days for services scheduled 10+ days out

**Important**: Keep your Good Faith Estimate — you'll need it if you need to dispute the final bill.`,
    sourceUrl: "https://www.cms.gov/nosurprises/consumers/understanding-costs-in-advance#:~:text=Good%20Faith%20Estimate",
    state: null,
  },

  {
    category: "Federal Law",
    title: "No Surprises Act – Independent Dispute Resolution (IDR)",
    content: `The Independent Dispute Resolution (IDR) process resolves payment disputes between providers and insurers. As a patient, you are held harmless.

**How it works:**
1. You receive a surprise bill or your insurer sends an EOB showing out-of-network charges
2. Your insurer pays the provider an initial amount
3. If the provider disagrees, either party can initiate IDR
4. An independent arbitrator picks a payment amount
5. The decision is binding — and it does NOT affect what you owe

**What this means for you:**
- Your cost-sharing is based on a "qualifying payment amount" (median in-network rate)
- You pay your in-network cost-sharing amount — period
- The provider and insurer resolve the rest between themselves

**Timeline:**
- Open negotiation: 30 business days
- If no agreement, IDR arbitrator selected within 3 business days
- Decision within 30 business days of arbitrator selection

**Your action**: If you receive a surprise bill, notify your insurer. They handle IDR. You just pay your in-network share.`,
    sourceUrl: "https://www.cms.gov/nosurprises/help-resolve-payment-disputes/payment-disputes-between-providers-and-health-plans#:~:text=independent%20dispute%20resolution",
    state: null,
  },

  {
    category: "Federal Law",
    title: "Affordable Care Act (ACA) – Essential Health Benefits & Protections",
    content: `The Affordable Care Act provides critical consumer protections for marketplace and most employer plans.

**Pre-existing Conditions**: Insurers cannot deny coverage or charge more based on any pre-existing condition — pregnancy, diabetes, cancer history, mental health, anything.

**10 Essential Health Benefits** — all marketplace plans must cover:
1. Ambulatory patient services (outpatient care)
2. Emergency services
3. Hospitalization
4. Maternity and newborn care
5. Mental health and substance use disorder services
6. Prescription drugs
7. Rehabilitative and habilitative services
8. Laboratory services
9. Preventive and wellness services
10. Pediatric services, including dental and vision

**No Annual or Lifetime Limits**: Plans cannot set dollar limits on essential health benefits.

**Preventive Care at No Cost**: In-network preventive services (screenings, vaccinations, wellness visits) must be covered with zero cost-sharing.

**Dependent Coverage to Age 26**: You can stay on a parent's plan until age 26, regardless of student or marital status.

**Appeals Process**: You have the right to appeal any coverage decision and request an external review by an independent third party.`,
    sourceUrl: "https://www.healthcare.gov/health-care-law-protections/#:~:text=Rights%20and%20protections",
    state: null,
  },

  {
    category: "Federal Law",
    title: "ACA – Preventive Services Covered at No Cost",
    content: `Under the ACA, certain preventive services must be covered at no cost when provided by an in-network provider. No copay, no coinsurance, no deductible.

**For All Adults:**
- Blood pressure, cholesterol, diabetes, depression, HIV screening
- Colorectal cancer screening (age 45+)
- Lung cancer screening (age 50-80 with smoking history)
- Immunizations: Flu, COVID-19, Hepatitis A & B, HPV, Tdap, MMR, Varicella
- Obesity screening and counseling
- STI screening and counseling

**For Women:**
- Mammography (every 1-2 years for women 40+)
- Cervical cancer screening, contraception (FDA-approved methods)
- Breastfeeding support and supplies
- Domestic violence screening, osteoporosis screening (60+)
- Well-woman visits

**For Children:**
- Autism, developmental, hearing, and vision screening
- All recommended immunizations
- Obesity screening

**Important**: If the visit goes beyond preventive care (e.g., doctor finds and treats a problem during a wellness visit), the treatment portion may be billed separately with cost-sharing.`,
    sourceUrl: "https://www.healthcare.gov/preventive-care-adults/#:~:text=Covered%20preventive%20services",
    state: null,
  },

  {
    category: "Federal Law",
    title: "HIPAA – Your Rights to Access and Protect Health Information",
    content: `HIPAA gives you important rights over your health information.

**Right to Access Your Records:**
- Request copies from any provider; they must respond within 30 days
- They can charge a reasonable fee but cannot refuse access
- You can request records in electronic format

**Right to Corrections:**
- Request corrections to errors; provider must respond within 60 days
- If refused, you can submit a statement of disagreement

**Right to Know Who Has Your Data:**
- Request an "accounting of disclosures" covering the previous 6 years

**Right to Restrict Sharing:**
- If you pay entirely out of pocket, you can prevent the provider from sharing that info with your insurer

**Breach Notification:**
- Organizations must notify you within 60 days if your health data is compromised

**Filing a Complaint**: HHS Office for Civil Rights at hhs.gov/ocr/complaints or 1-800-368-1019. File within 180 days of the violation.`,
    sourceUrl: "https://www.hhs.gov/hipaa/for-individuals/guidance-materials-for-consumers/index.html#:~:text=Your%20Health%20Information%2C%20Your%20Rights",
    state: null,
  },

  {
    category: "Federal Law",
    title: "ERISA – Rights for Employer-Sponsored Health Plans",
    content: `If you get health insurance through your employer, ERISA provides important protections.

**Claims Timeframes — Your Insurer Must Decide Quickly:**
- Urgent care claims: 72 hours
- Pre-service claims (prior auth): 15 days (one 15-day extension)
- Post-service claims: 30 days (one 15-day extension)

**Your Appeal Rights:**
- At least 180 days to file an appeal after a denial
- Can submit new evidence and arguments
- Must be reviewed by someone NOT involved in the original denial
- Decision within 30 days (urgent) or 60 days (non-urgent)
- After internal appeal, you have the right to external review

**Full and Fair Review:**
- Review ALL documents the plan used for its decision
- Plan must cite specific reasons and plan provisions for denial
- If based on medical necessity, they must explain clinical rationale

**Contact**: Department of Labor EBSA — 1-866-444-3272 or askebsa.dol.gov.`,
    sourceUrl: "https://www.dol.gov/agencies/ebsa/about-ebsa/our-activities/resource-center/faqs/claims-and-appeals#:~:text=filing%20a%20claim",
    state: null,
  },

  {
    category: "Federal Law",
    title: "Mental Health Parity and Addiction Equity Act (MHPAEA)",
    content: `The MHPAEA requires health plans to cover mental health and substance use disorder benefits at the same level as medical/surgical benefits.

**What "parity" means in practice:**
- If your medical specialist copay is $40, your mental health specialist copay cannot be higher
- If your medical deductible is $1,500, there cannot be a separate, higher mental health deductible
- If the plan doesn't limit medical office visits per year, it cannot limit therapy sessions
- If medical claims only sometimes need prior auth, mental health cannot require it more often

**What's covered:**
- Outpatient mental health (therapy, psychiatry)
- Inpatient mental health treatment
- Substance use disorder treatment (including medication-assisted treatment)
- Eating disorder treatment

**Common violations to watch for:**
- Separate, higher deductibles for mental health
- Session limits on therapy with no equivalent medical limits
- More restrictive prior auth for mental health
- Narrower provider networks for mental health
- "Fail first" requirements only for mental health medications

**If your plan violates parity**: File a complaint with your state insurance commissioner or the Department of Labor (for employer plans). Also contact CMS at 1-877-267-2323.`,
    sourceUrl: "https://www.cms.gov/marketplace/private-health-insurance/mental-health-parity#:~:text=Mental%20health%20parity",
    state: null,
  },

  {
    category: "Federal Law",
    title: "COBRA – Continuing Coverage After Leaving a Job",
    content: `COBRA lets you keep your employer's health insurance after certain life events, but you pay the full premium.

**Who qualifies:**
- Employees who lose their job (except for gross misconduct) or have hours reduced
- Spouses/dependents when the employee dies, divorces, or becomes Medicare-eligible
- Dependents who age out of the plan

**Key details:**
- 18 months coverage for job loss/hour reduction
- 36 months for death, divorce, or Medicare eligibility
- You pay 100% of the premium PLUS up to 2% admin fee
- This is often 3-5x what you paid as an employee

**Cost example**: If total plan cost was $1,800/month and you paid $400, COBRA costs up to $1,836/month.

**Alternatives to consider:**
- Healthcare.gov marketplace (losing coverage is a qualifying event for special enrollment)
- Spouse's employer plan
- Medicaid (if income qualifies)

**Critical deadline**: You have only 60 days to elect COBRA. Miss it and you lose the option permanently.`,
    sourceUrl: "https://www.dol.gov/agencies/ebsa/about-ebsa/our-activities/resource-center/faqs/cobra-continuation-health-coverage-consumer#:~:text=What%20is%20COBRA",
    state: null,
  },

  {
    category: "Federal Law",
    title: "Newborns' and Mothers' Health Protection Act",
    content: `This federal law sets minimum hospital stay coverage for childbirth.

**Your rights:**
- Plans must cover at least 48 hours after vaginal delivery
- At least 96 hours (4 days) after cesarean section
- The attending provider (not the insurer) decides when you're ready for discharge
- Plans cannot require prior authorization for these minimum stays
- Plans cannot offer incentives to shorten stays

**This does NOT mean you must stay** — you and your provider can decide to leave earlier. The law sets a minimum that insurance must COVER, not a mandatory stay.

**If you feel pressured to leave early**: Cite this law to your insurer.`,
    sourceUrl: "https://www.cms.gov/marketplace/private-health-insurance/newborns-mothers-health-protection#:~:text=Newborns%27%20and%20Mothers%27%20Health%20Protection",
    state: null,
  },

  {
    category: "Federal Law",
    title: "Women's Health and Cancer Rights Act (WHCRA)",
    content: `If your health plan covers mastectomy, it must also cover related reconstruction under the WHCRA.

**Required coverage after mastectomy:**
- Reconstruction of the breast on which mastectomy was performed
- Surgery on the other breast to produce symmetrical appearance
- Prostheses (implants or external)
- Treatment of physical complications, including lymphedema

**Key protections:**
- Cannot have separate/different deductibles or cost-sharing vs other medical services
- Cannot impose penalties for choosing reconstruction
- You can choose reconstruction at any time — not just immediately after mastectomy

**If denied**: This is a federal law violation. File with DOL (employer plans) or state insurance commissioner (individual plans).`,
    sourceUrl: "https://www.cms.gov/marketplace/private-health-insurance/womens-health-and-cancer-rights#:~:text=Women%27s%20Health%20and%20Cancer%20Rights",
    state: null,
  },

  // ═══════════════════════════════════════════════════
  // CONSUMER GUIDES
  // ═══════════════════════════════════════════════════

  {
    category: "Consumer Guide",
    title: "Understanding Your Summary of Benefits and Coverage (SBC)",
    content: `The SBC is a standardized document that helps you compare health plans.

**Key Sections:**
1. **Important Questions**: Deductibles, out-of-pocket maximum, network requirements
2. **Common Medical Events**: What you'll pay for doctor visits, tests, hospital stays, prescriptions
3. **Coverage Examples**: Typical costs for having a baby and managing Type 2 diabetes

**Key Terms:**
- **Premium**: Monthly payment to have insurance
- **Deductible**: Amount you pay before insurance kicks in
- **Copayment**: Fixed amount for a service ($20 for a doctor visit)
- **Coinsurance**: Percentage you pay after deductible (20% of costs)
- **Out-of-Pocket Maximum**: Most you'll pay in a year; after this, insurance pays 100%

**Reading tips:**
- "Not covered" = you pay 100%, does NOT count toward OOP max
- "No charge" = plan pays 100%
- "Not applicable" for deductible = deductible doesn't apply to that service
- Always check for "prior authorization required"`,
    sourceUrl: "https://www.cms.gov/marketplace/private-health-insurance/summary-of-benefits-and-coverage#:~:text=Summary%20of%20Benefits%20and%20Coverage",
    state: null,
  },

  {
    category: "Consumer Guide",
    title: "How to Read an Explanation of Benefits (EOB)",
    content: `An EOB is a statement from your insurer AFTER a claim is processed. It is NOT a bill — but it's critical for understanding what you owe.

**Key sections:**
1. **Patient & Provider Info**: Who received care and from whom
2. **Date of Service**: When care was provided
3. **Service / CPT Code**: What was done (each service has a code)
4. **Amount Billed**: What the provider charged
5. **Plan Discount**: Negotiated reduction (in-network discount)
6. **Amount Allowed**: Maximum your plan pays for this service
7. **What Plan Paid**: How much your insurer paid the provider
8. **What You Owe**: Your responsibility — deductible, copay, coinsurance

**How to use your EOB:**
1. Compare it to the bill from your provider — amounts should match
2. Check that services listed are ones you actually received
3. Verify the provider is listed as in-network
4. If "denied" — read the reason code and consider appealing

**Common denial reason codes:**
- "Not medically necessary" — appeal with a letter from your doctor
- "Prior authorization not obtained" — provider may request retroactive auth
- "Out-of-network" — check if the No Surprises Act applies
- "Duplicate claim" — provider may need to resubmit with corrections

**Keep every EOB.** If a bill doesn't match, do NOT pay until resolved.`,
    sourceUrl: "https://www.healthcare.gov/glossary/explanation-of-benefits/#:~:text=Explanation%20of%20Benefits",
    state: null,
  },

  {
    category: "Consumer Guide",
    title: "How to Appeal a Denied Claim — Step by Step",
    content: `If your insurance denies a claim, you have the legal right to appeal. Most denials can be overturned.

**Step 1: Understand the Denial (Day 1-3)**
- Read the denial letter carefully; note the exact reason and plan provision cited
- Note the deadline for appeal (usually 180 days)
- Call and ask for a detailed explanation

**Step 2: Gather Evidence (Day 3-14)**
- Medical records for the treatment in question
- Letter from your doctor explaining medical necessity
- Published clinical guidelines supporting the treatment
- The specific plan document section that you believe covers the service

**Step 3: Submit Internal Appeal (Day 14-30)**
- Reference claim number and date of service
- State clearly why the denial is wrong
- Cite specific plan provisions supporting coverage
- Include all documentation; send via certified mail
- KEEP COPIES OF EVERYTHING

**Step 4: Await Decision**
- Pre-service: 30 days; Post-service: 60 days; Urgent: 72 hours

**Step 5: External Review (if internal appeal denied)**
- 4 months to request; independent reviewer examines your case
- Decision is BINDING on the insurance company
- Free to you

**Success rates**: 40-60% of denied claims are overturned on appeal. Don't give up.`,
    sourceUrl: "https://www.healthcare.gov/appeal-insurance-company-decision/appeals/#:~:text=How%20to%20appeal",
    state: null,
  },

  {
    category: "Consumer Guide",
    title: "Understanding Medical Bills and Spotting Errors",
    content: `Studies show up to 80% of medical bills have mistakes. Always review before paying.

**Always request an itemized bill** — not a summary. You want every charge with date, CPT code, description, and amount.

**Common billing errors:**
- **Balance Billing**: Charged the difference between provider's charge and insurance payment. Often illegal under the No Surprises Act.
- **Duplicate Charges**: Same service billed twice (common with lab work)
- **Upcoding**: Billed for a more expensive procedure than performed
- **Unbundling**: One procedure split into multiple separate charges
- **Incorrect Codes**: Wrong CPT or ICD codes
- **Charges for Services Not Received**: Medications or supplies you never got

**Steps to take:**
1. Get the itemized bill AND your EOB
2. Compare line by line
3. Google CPT codes to verify they match what you received
4. Call billing department and reference specific line items
5. If unresolved, file a complaint with your state insurance commissioner

**If you can't pay:**
- Ask about financial assistance/charity care (non-profit hospitals must have these)
- Negotiate — offer lump sum for 40-60% of total
- Request interest-free payment plan
- Ask for "self-pay" or "cash rate" — often 50-70% less`,
    sourceUrl: null,
    state: null,
  },

  {
    category: "Consumer Guide",
    title: "Emergency Room vs Urgent Care — When to Go Where",
    content: `Choosing the right level of care saves money and gets faster treatment.

**Emergency Room for:**
- Chest pain, difficulty breathing
- Severe bleeding that won't stop
- Head injury with loss of consciousness or confusion
- Stroke symptoms (numbness, weakness, slurred speech — call 911)
- Severe allergic reactions (throat swelling, can't breathe)
- Broken bones with visible deformity
- High fever (103°F+) with stiff neck or confusion
- Seizures, severe burns, poisoning, overdose

**Urgent Care for:**
- Minor cuts needing stitches, sprains and strains
- Minor infections (UTI, ear, sinus)
- Flu symptoms (not severe), minor burns, rashes
- Minor fractures (fingers, toes), pink eye, sore throat

**Cost difference:**
- ER copay: $150-$500+ (some plans waive if admitted)
- Urgent care copay: $25-$75
- No Surprises Act: emergency services covered at in-network rates even at out-of-network facilities

**When in doubt**: If it might be life-threatening, go to the ER or call 911.`,
    sourceUrl: null,
    state: null,
  },

  {
    category: "Consumer Guide",
    title: "Understanding Prescription Drug Coverage and Formularies",
    content: `Your drug coverage is organized by a formulary — a list of covered drugs in cost tiers.

**Typical formulary tiers:**
- **Tier 1 (Preferred Generic)**: $5-$15 copay
- **Tier 2 (Non-Preferred Generic)**: $15-$30 copay
- **Tier 3 (Preferred Brand)**: $30-$60 copay or 20-30% coinsurance
- **Tier 4 (Non-Preferred Brand)**: $50-$100+ or 30-50% coinsurance
- **Tier 5 (Specialty)**: 20-40% coinsurance, may have a maximum

**Prior authorization for meds:**
- Some drugs require your doctor to get approval first
- Common for brand-name drugs when a generic exists and specialty medications

**Step therapy ("fail first"):**
- Some plans require trying a cheaper drug first before covering an expensive one
- Your doctor can request an exception

**Saving money:**
- Ask "Is there a generic available?"
- Use your plan's preferred pharmacy (mail-order is often cheapest for maintenance drugs)
- 90-day supplies are often cheaper per pill than 30-day
- GoodRx or discount programs can sometimes beat insurance copays
- Check manufacturer copay cards or patient assistance programs`,
    sourceUrl: "https://www.healthcare.gov/glossary/formulary/#:~:text=Formulary",
    state: null,
  },

  {
    category: "Consumer Guide",
    title: "Special Enrollment Periods — Changing Plans Outside Open Enrollment",
    content: `Certain life events trigger a Special Enrollment Period (SEP) giving you 60 days to enroll or switch plans.

**Qualifying events:**
- **Losing coverage**: Job loss, COBRA ending, aging off parent's plan, moving, losing Medicaid/CHIP
- **Gaining a dependent**: Marriage, birth, adoption, foster care
- **Moving**: New state or ZIP code with different plan options
- **Household changes**: Divorce, legal separation, death of dependent
- **Other**: Becoming a citizen, release from incarceration, income change affecting subsidies

**NOT qualifying:**
- Voluntarily dropping coverage
- Not liking your current plan
- Missing open enrollment

**Timeline:**
- Generally 60 days from the event
- For losing coverage: can start 60 days BEFORE the loss
- For birth/adoption: starts on the event date

**Where to enroll:**
- Healthcare.gov or your state marketplace
- Employer plan (if eligible)
- Medicaid/CHIP (no enrollment period — available year-round)

**Document your event** — you may need proof (marriage certificate, termination letter, etc.).`,
    sourceUrl: "https://www.healthcare.gov/glossary/special-enrollment-period/#:~:text=Special%20Enrollment%20Period",
    state: null,
  },

  {
    category: "Consumer Guide",
    title: "Coordination of Benefits — When You Have Two Insurance Plans",
    content: `If covered by two plans (e.g., your employer plan plus your spouse's), coordination of benefits determines which pays first.

**Primary vs secondary:**
- **Your employer plan**: Primary for you, secondary for your spouse
- **Spouse's plan**: Primary for spouse, secondary for you
- **Children**: "Birthday rule" — parent whose birthday comes first in the calendar year has primary plan (NOT the older parent)
- **Divorced parents**: Usually custodial parent's plan is primary; check divorce decree
- **Medicare + employer**: 20+ employees → employer primary. Under 20 → Medicare primary.

**Process:**
1. Tell both insurers about the other coverage
2. Submit claims to primary first
3. Send primary's EOB to secondary
4. Secondary pays based on what primary left unpaid

**Common mistake**: Not disclosing dual coverage. This causes delays, denials, or excess charges.`,
    sourceUrl: null,
    state: null,
  },

  // ═══════════════════════════════════════════════════
  // INSURANCE TERMS
  // ═══════════════════════════════════════════════════

  {
    category: "Insurance Terms",
    title: "Core Insurance Terms Glossary",
    content: `**Premium**: Monthly payment to maintain coverage, regardless of whether you use services. Like a subscription fee.

**Deductible**: Amount you pay out of pocket before insurance starts sharing costs. Example: $2,000 deductible means you pay the first $2,000. Some services (preventive care) are covered before meeting the deductible.

**Copayment (Copay)**: Fixed dollar amount for a specific service. Example: $30 for primary care, $50 for specialist. Paid at time of service.

**Coinsurance**: Your percentage share AFTER meeting the deductible. Example: 20% coinsurance = you pay 20%, plan pays 80%. Continues until you hit OOP max.

**Out-of-Pocket Maximum (OOP Max)**: The most you'll pay for covered in-network services in a year. After this, plan pays 100%. Includes deductibles, copays, coinsurance. Does NOT include premiums or out-of-network costs.

**In-Network vs Out-of-Network**: In-network providers agreed to negotiated rates (you pay less). Out-of-network haven't — you may pay much more. Many plans have separate, higher deductibles and OOP max for out-of-network.

**Prior Authorization**: Insurer approval required BEFORE certain services. Without it, your claim may be denied even if normally covered.

**Explanation of Benefits (EOB)**: Statement from insurer after processing a claim. Shows what was billed, what they paid, what you owe. It is NOT a bill.

**Formulary**: List of covered prescription drugs organized in cost tiers.`,
    sourceUrl: "https://www.healthcare.gov/glossary/#:~:text=Glossary",
    state: null,
  },

  {
    category: "Insurance Terms",
    title: "HMO vs PPO vs EPO vs POS — Plan Types Explained",
    content: `Health plans come in different types affecting which doctors you can see and costs.

**HMO (Health Maintenance Organization):**
- Must choose a Primary Care Physician (PCP)
- Need referral from PCP to see specialists
- Generally ONLY in-network coverage (except emergencies)
- Usually lowest premiums and copays
- Best for: people who want lower costs and don't mind referrals

**PPO (Preferred Provider Organization):**
- No PCP required, no referrals for specialists
- Out-of-network coverage available at higher cost
- Higher premiums than HMO
- Best for: people who want flexibility and will pay more for it

**EPO (Exclusive Provider Organization):**
- No referrals needed for specialists
- ONLY in-network coverage (like HMO) except emergencies
- No PCP requirement
- Best for: specialist access without referrals, don't need out-of-network

**POS (Point of Service):**
- Choose a PCP (like HMO), need referrals (like HMO)
- BUT can go out-of-network at higher cost (like PPO)
- Best for: want coordinated care with option for out-of-network

**Key question**: Do you have doctors you want to keep? Check if they're in-network BEFORE choosing a plan.`,
    sourceUrl: "https://www.healthcare.gov/choose-a-plan/plan-types/#:~:text=Types%20of%20plans",
    state: null,
  },

  // ═══════════════════════════════════════════════════
  // CALL SCRIPTS
  // ═══════════════════════════════════════════════════

  {
    category: "Call Script",
    title: "Script: Calling Your Insurer About a Denied Claim",
    content: `Use this when calling your insurance company about a denied claim.

**Have ready:** Insurance ID card, denial letter/EOB, claim number, date of service, pen and paper.

**The call:**

"Hello, my name is [YOUR NAME], member ID [NUMBER]. I'm calling about a denied claim.

The claim number is [NUMBER] for a service on [DATE]. The denial reason says [READ EXACT REASON].

I'd like to understand:
1. What specific plan provision was this denial based on?
2. What documentation would overturn this decision?
3. What is the deadline for filing an appeal?
4. Can you send me the denial in writing with the specific policy language cited?

[IF THEY SAY NOT MEDICALLY NECESSARY:]
My doctor, Dr. [NAME], has determined this is medically necessary. I'd like to file a formal appeal. Can you tell me:
- Where to send the appeal?
- What format (letter, form, online)?
- Can my doctor do a peer-to-peer review with your medical director?"

**End:** "Can I get your name and a reference number for this call?" [WRITE IT DOWN.]

**Always document**: Who you spoke to, date, time, reference number, what was said.`,
    sourceUrl: null,
    state: null,
  },

  {
    category: "Call Script",
    title: "Script: Disputing a Surprise Medical Bill",
    content: `Use this when you receive a bill you believe violates the No Surprises Act.

**Have ready:** The bill, any EOB, insurance card, date/location of service.

**Calling the billing department:**

"Hello, I received a bill for $[AMOUNT] for services on [DATE] at [FACILITY]. I believe this is subject to the No Surprises Act.

[FOR EMERGENCY SERVICES:]
These were emergency services. Under the No Surprises Act, I can only be charged my in-network cost-sharing, regardless of network status. My in-network amount is approximately $[AMOUNT].

[FOR OUT-OF-NETWORK PROVIDER AT IN-NETWORK FACILITY:]
I received care at [IN-NETWORK FACILITY] from an out-of-network provider I did not choose. Under the No Surprises Act Section 2799A-1, I'm protected from balance billing. I should only owe my in-network cost-sharing.

[IF THEY PUSH BACK:]
I'd like to formally dispute this bill. Please:
1. Reprocess under No Surprises Act protections
2. Adjust my balance to in-network cost-sharing only
3. If you disagree, initiate IDR with my insurer — I should not be responsible during the dispute

I will file a complaint with CMS at cms.gov/nosurprises if this is not resolved."

**Write down**: Name, date, time, what they said. Follow up in writing.`,
    sourceUrl: "https://www.cms.gov/nosurprises/consumers#:~:text=What%20to%20do%20if%20you%20get%20a%20surprise%20medical%20bill",
    state: null,
  },

  {
    category: "Call Script",
    title: "Script: Requesting and Following Up on Prior Authorization",
    content: `Use this when your doctor recommends a service requiring prior authorization.

**Note:** Your doctor's office usually submits the request, but you should follow up.

**Checking on a prior auth:**

"Hello, my name is [YOUR NAME], member ID [NUMBER]. My doctor, Dr. [NAME], is requesting prior authorization for [SERVICE/MEDICATION].

Can you tell me:
1. Has the request been received?
2. What is the status?
3. What is the reference/tracking number?
4. Expected timeline for a decision?
5. Is additional info needed from my doctor?"

**If prior auth is denied:**

"I'd like to understand:
1. What is the specific clinical reason for denial?
2. What criteria does my plan use for medical necessity for this service?
3. Can my doctor request a peer-to-peer review with your medical director?
4. What is the deadline and process for appeal?"

**Key timelines (ERISA/ACA):**
- Urgent care: decision within 72 hours
- Non-urgent: 15 calendar days (one 15-day extension)
- If plan misses the deadline, the request is deemed approved

**If urgent:** Tell them "this is an urgent/expedited request" — faster timelines and your doctor can request expedited external review.`,
    sourceUrl: null,
    state: null,
  },

  // ═══════════════════════════════════════════════════
  // STATE LAWS
  // ═══════════════════════════════════════════════════

  {
    category: "State Law",
    title: "California – Consumer Health Insurance Protections",
    content: `California has some of the strongest health insurance protections through DMHC and CDI.

**Independent Medical Review (IMR):**
- Free appeal process for denied, delayed, or modified services
- Available for medical necessity and experimental treatment denials
- Decisions are binding on the plan
- File within 6 months; decisions within 30 days (72 hours if urgent)

**Timely Access to Care:**
- Urgent care: within 48 hours
- Non-urgent primary care: within 10 business days
- Non-urgent specialist: within 15 business days
- Mental health non-urgent: within 10 business days
- If plan can't meet timelines, you may see out-of-network at in-network rates

**Additional California Protections:**
- Plans must respond to grievances within 30 days
- Emergency services cannot require prior authorization
- Mental health parity — equal coverage for mental health services
- Continuity of care when providers leave networks

**Contact DMHC:** 1-888-466-2219 or dmhc.ca.gov`,
    sourceUrl: "https://www.dmhc.ca.gov/FileaComplaint.aspx#:~:text=File%20a%20Complaint",
    state: "CA",
  },

  {
    category: "State Law",
    title: "New York – Surprise Bill and Consumer Protections",
    content: `New York's Emergency Services and Surprise Bills law provides strong protections.

**Surprise Bill Protections:**
- Emergency services: only in-network cost-sharing, regardless of provider network status
- Out-of-network providers at in-network hospitals cannot balance bill you (unless you chose them and got required disclosures)
- Assignment of benefits: you can assign benefits to the out-of-network provider who then bills insurer directly
- IDR for payment disputes; patients held harmless

**Additional NY Rights:**
- Out-of-network referral disclosure requirements
- Network adequacy standards
- Continuity of care when providers leave networks
- External appeal rights through DFS

**Contact:** NY Dept of Financial Services — 1-800-342-3736 or dfs.ny.gov`,
    sourceUrl: "https://www.dfs.ny.gov/consumers/health_insurance/surprise_medical_bills#:~:text=Surprise%20Medical%20Bills",
    state: "NY",
  },

  {
    category: "State Law",
    title: "Texas – Balance Billing and Surprise Bill Protections",
    content: `Texas SB 1264 protects patients from surprise medical bills.

**Who is protected:**
- Patients with state-regulated plans (individual, small group, large group)
- HMO and PPO members
- Note: Self-funded employer plans may not be covered (check your plan)

**Protected situations:**
1. Emergency care at any facility
2. Out-of-network provider at in-network facility when you had no choice or didn't get required disclosures

**Your responsibility:** Only your in-network cost-sharing. The rest is resolved between provider and insurer through mediation/arbitration.

**If you receive a surprise bill:**
- Contact Texas Dept of Insurance: 1-800-252-3439, tdi.texas.gov
- Filing deadline: 90 days from receiving the bill`,
    sourceUrl: "https://www.tdi.texas.gov/consumer/cpmbalancebilling.html#:~:text=Balance%20Billing",
    state: "TX",
  },

  {
    category: "State Law",
    title: "Florida – Health Insurance Consumer Protections",
    content: `Florida provides consumer protections through the Office of Insurance Regulation (OIR) and Department of Financial Services.

**Key Protections:**
- **Balance Billing (HMO plans)**: Florida law prohibits HMO providers from balance billing patients for covered services
- **Emergency Services**: HMO plans must cover emergency services without prior authorization, including out-of-network
- **External Review**: You can request an independent external review of coverage denials
- **Prompt Payment**: Insurers must pay clean claims within 20 days (electronic) or 40 days (paper)

**Managed Care Protections:**
- Right to choose your own pharmacy
- Standing referrals for ongoing specialist care
- Access to emergency services 24/7
- Continuity of care provisions

**Filing a Complaint:**
- FL Dept of Financial Services: 1-877-693-5236
- Online: myfloridacfo.com/Division/Consumers
- FL Office of Insurance Regulation: floir.com

**Note**: Florida has NOT expanded Medicaid under the ACA. If you earn too much for Medicaid but not enough for marketplace subsidies, you may fall in the "coverage gap."`,
    sourceUrl: "https://www.floir.com/consumers#:~:text=Consumer",
    state: "FL",
  },

  {
    category: "State Law",
    title: "Illinois – Health Insurance Consumer Protections",
    content: `Illinois provides robust consumer protections through the Department of Insurance (DOI).

**Surprise Billing Protections (SB 1840):**
- Emergency services at out-of-network facilities: you only pay in-network cost-sharing
- Out-of-network providers at in-network facilities: protected from balance billing
- Applies to state-regulated plans (individual, small group, large group)

**External Review Rights:**
- Available for denials based on medical necessity, experimental treatments, or clinical trial coverage
- Must request within 4 months of final internal appeal decision
- Independent reviewer's decision is binding on the insurer
- Expedited review available for urgent situations (decision within 72 hours)

**Additional Illinois Protections:**
- Mental health parity — coverage must be equivalent to medical/surgical
- Continuity of care: 90 days of continued coverage when provider leaves network
- Prompt payment: 30 days for clean electronic claims
- Telehealth parity: insurers must cover telehealth at same rates as in-person

**Filing a Complaint:**
- IL Dept of Insurance: 1-866-445-5364
- Online: insurance.illinois.gov/Complaints

**Note**: Illinois has its own health insurance marketplace — Get Covered Illinois (getcovered.illinois.gov).`,
    sourceUrl: "https://insurance.illinois.gov/Healthinsurance.html#:~:text=Health%20Insurance",
    state: "IL",
  },

  {
    category: "State Law",
    title: "Pennsylvania – Health Insurance Consumer Protections",
    content: `Pennsylvania provides consumer protections through the Insurance Department (PID).

**Key Protections:**
- **Balance Billing**: PA Act 112 prohibits balance billing for emergency services at out-of-network facilities and for services by out-of-network providers at in-network facilities
- **External Review (Act 68)**: Available for HMO and PPO plan denials; independent review organization makes binding decision
- **Prompt Payment**: Insurers must pay clean claims within 45 days

**Appeals Process in PA:**
- Internal appeal: must be filed within 180 days of denial
- First-level review: 30 days for decision
- Second-level review: 45 days for decision
- External review: available after exhausting internal appeals (or immediately for urgent cases)
- External review decisions are binding on the insurer

**Additional Protections:**
- Network adequacy requirements
- Women's preventive health: direct access to OB/GYN without referral
- Mental health parity enforcement
- Continuity of care provisions

**Filing a Complaint:**
- PA Insurance Department: 1-877-881-6388
- Online: insurance.pa.gov
- Consumer hotline available Monday-Friday 8am-5pm`,
    sourceUrl: "https://www.insurance.pa.gov/Consumers/Pages/default.aspx#:~:text=Consumer",
    state: "PA",
  },

  {
    category: "State Law",
    title: "Ohio – Health Insurance Consumer Protections",
    content: `Ohio provides consumer protections through the Department of Insurance (ODI).

**Key Protections:**
- **External Review**: Ohio law provides independent external review for denied claims based on medical necessity or experimental treatment
- **Prompt Payment**: Insurers must pay clean claims within 30 days
- **Network Adequacy**: Plans must maintain adequate provider networks

**HMO-Specific Rights:**
- Direct access to OB/GYN without referral
- Standing referrals for chronic conditions
- Emergency services coverage without prior auth
- Point-of-service option must be offered

**Appeals Process:**
- Internal appeal: file within 180 days of denial
- Decision within 30 days (non-urgent) or 72 hours (urgent)
- External review: available after internal appeal is denied
- Must request within 60 days of final internal decision
- External reviewer decides within 30 days (7 days for expedited)

**Filing a Complaint:**
- OH Dept of Insurance: 1-800-686-1526
- Online: insurance.ohio.gov
- Consumer Services Division handles complaints and inquiries

**Note**: Ohio has a federally-facilitated marketplace (healthcare.gov). Residents may qualify for premium subsidies and cost-sharing reductions.`,
    sourceUrl: "https://insurance.ohio.gov/consumers#:~:text=Consumer",
    state: "OH",
  },

  {
    category: "State Law",
    title: "Georgia – Health Insurance Consumer Protections",
    content: `Georgia provides consumer protections through the Office of Insurance and Safety Fire Commissioner.

**Key Protections:**
- **Surprise Billing (HB 888)**: Prohibits balance billing for emergency services and out-of-network providers at in-network facilities for state-regulated plans
- **External Review**: Available for denials based on medical necessity; decisions are binding
- **Prompt Payment**: Insurers must pay clean claims within 15 working days

**Consumer Rights:**
- Right to file complaints with the Insurance Commissioner
- Right to appeal denied claims (internal and external)
- Right to request information about plan benefits and network providers
- Right to continuity of care when transitioning between plans

**Appeals Process:**
- Internal appeal: follow plan's process, typically 180 days to file
- External review: available after exhausting internal appeals
- Must request within 4 months of final internal decision
- Expedited review for urgent situations

**Filing a Complaint:**
- GA Insurance Commissioner: 1-800-656-2298
- Online: oci.georgia.gov
- Complaints can be filed by phone, mail, or online

**Note**: Georgia uses the federal marketplace (healthcare.gov). The state has NOT expanded Medicaid under the ACA, though limited Medicaid pathways exist.`,
    sourceUrl: "https://oci.georgia.gov/consumers#:~:text=Consumer",
    state: "GA",
  },
];
