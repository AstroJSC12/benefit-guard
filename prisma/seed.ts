import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });
  return response.data[0].embedding;
}

const knowledgeBaseEntries = [
  {
    category: "Federal Law",
    title: "No Surprises Act Overview",
    content: `The No Surprises Act (effective January 1, 2022) protects patients from unexpected medical bills in certain situations:

1. **Emergency Services**: You cannot be charged more than in-network cost-sharing for emergency services, even at out-of-network facilities.

2. **Non-Emergency Services at In-Network Facilities**: If you receive care from an out-of-network provider at an in-network facility, you're protected from balance billing unless you gave written consent.

3. **Air Ambulance Services**: You only pay in-network rates for air ambulance services, even from out-of-network providers.

4. **Good Faith Estimates**: Uninsured or self-pay patients have the right to receive a Good Faith Estimate of expected charges before receiving care.

5. **Independent Dispute Resolution (IDR)**: If you receive a surprise bill, there's a process to dispute the charge.

**Your Rights**: You can file a complaint with the Centers for Medicare & Medicaid Services (CMS) if you believe your rights under this law have been violated. Visit cms.gov/nosurprises or call 1-800-985-3059.`,
    sourceUrl: "https://www.cms.gov/nosurprises",
    state: null,
  },
  {
    category: "Federal Law",
    title: "Affordable Care Act (ACA) Consumer Protections",
    content: `The Affordable Care Act provides essential consumer protections:

1. **Pre-existing Conditions**: Insurance companies cannot deny coverage or charge more based on pre-existing conditions.

2. **Essential Health Benefits**: All marketplace plans must cover:
   - Ambulatory patient services
   - Emergency services
   - Hospitalization
   - Maternity and newborn care
   - Mental health and substance use disorder services
   - Prescription drugs
   - Rehabilitative services
   - Laboratory services
   - Preventive and wellness services
   - Pediatric services including dental and vision

3. **Preventive Care**: Preventive services must be covered at no cost when provided by in-network providers.

4. **No Annual or Lifetime Limits**: Plans cannot set dollar limits on essential health benefits.

5. **Appeals Process**: You have the right to appeal coverage decisions and have an external review.

6. **Summary of Benefits and Coverage (SBC)**: Insurers must provide easy-to-understand summaries of coverage.`,
    sourceUrl: "https://www.healthcare.gov/health-care-law-protections/",
    state: null,
  },
  {
    category: "Federal Law",
    title: "HIPAA Consumer Rights",
    content: `HIPAA (Health Insurance Portability and Accountability Act) gives you important rights regarding your health information:

1. **Access to Records**: You have the right to see and get copies of your health records within 30 days of request.

2. **Corrections**: You can request corrections to your health records if you believe they contain errors.

3. **Notice of Privacy Practices**: Healthcare providers must give you a notice explaining how they use and share your health information.

4. **Restrictions**: You can ask your provider to restrict how your health information is used or shared.

5. **Confidential Communications**: You can request that providers communicate with you in specific ways (e.g., by mail instead of phone).

6. **Accounting of Disclosures**: You can get a list of where your health information has been shared.

7. **Breach Notification**: If your health information is compromised, the organization must notify you.

**Filing a Complaint**: If you believe your HIPAA rights have been violated, file a complaint with the Office for Civil Rights at hhs.gov/ocr/complaints.`,
    sourceUrl: "https://www.hhs.gov/hipaa/for-individuals/",
    state: null,
  },
  {
    category: "Federal Law",
    title: "ERISA Rights for Employer-Sponsored Plans",
    content: `If you have health insurance through your employer, ERISA (Employee Retirement Income Security Act) provides important protections:

1. **Plan Information**: You have the right to receive a Summary Plan Description (SPD) explaining your benefits.

2. **Claims and Appeals**: 
   - Claims must be decided within specific timeframes (usually 30 days for pre-service claims)
   - You have at least 180 days to appeal a denial
   - You have the right to an external review for denied claims

3. **Full and Fair Review**: When appealing a denial, you have the right to:
   - Review all documents used to make the decision
   - Submit additional evidence
   - Receive a detailed explanation of the denial reason

4. **Fiduciary Duty**: Plan administrators must act in your best interest.

5. **Non-Discrimination**: Plans cannot discriminate based on health status.

**Important**: ERISA plans are governed by federal law, which may preempt some state insurance regulations. Contact the Department of Labor at 1-866-444-3272 for assistance.`,
    sourceUrl: "https://www.dol.gov/agencies/ebsa/about-ebsa/our-activities/resource-center/faqs/health-plans-and-benefits-faqs",
    state: null,
  },
  {
    category: "Consumer Guide",
    title: "Understanding Your Summary of Benefits and Coverage (SBC)",
    content: `The Summary of Benefits and Coverage (SBC) is a standardized document that helps you compare health plans. Here's how to read it:

**Key Sections:**

1. **Important Questions**: Basic plan info like deductibles, out-of-pocket maximum, and network requirements.

2. **Common Medical Events**: Shows what you'll pay for common situations like:
   - Doctor visits
   - Tests and imaging
   - Hospital stays
   - Prescriptions

3. **Coverage Examples**: Two examples showing typical costs for:
   - Having a baby (normal delivery)
   - Managing Type 2 diabetes

**Key Terms to Understand:**

- **Premium**: Your monthly payment to have insurance
- **Deductible**: Amount you pay before insurance kicks in
- **Copayment**: Fixed amount for a service ($20 for a doctor visit)
- **Coinsurance**: Percentage you pay after deductible (20% of costs)
- **Out-of-Pocket Maximum**: Most you'll pay in a year; after this, insurance pays 100%

**Pro Tip**: Always check if a service requires prior authorization and whether your provider is in-network.`,
    sourceUrl: "https://www.cms.gov/CCIIO/Programs-and-Initiatives/Consumer-Support-and-Information/Summary-of-Benefits-and-Coverage-and-Uniform-Glossary",
    state: null,
  },
  {
    category: "Consumer Guide",
    title: "How to Appeal a Denied Claim",
    content: `If your insurance denies a claim, you have the right to appeal. Here's a step-by-step process:

**Step 1: Understand the Denial**
- Request the denial in writing if you haven't received it
- Note the specific reason for denial
- Check deadlines for filing an appeal (usually 180 days)

**Step 2: Gather Documentation**
- Medical records supporting the treatment
- Letter from your doctor explaining medical necessity
- Any relevant guidelines or studies

**Step 3: Internal Appeal**
- Submit a written appeal to your insurance company
- Include all supporting documentation
- Keep copies of everything
- Request a response deadline in writing

**Step 4: External Review**
- If the internal appeal is denied, you have the right to an external review
- An independent third party reviews your case
- The decision is binding on the insurance company

**Tips for Success:**
- Be persistent and document all communications
- Ask your doctor to help with the appeal
- Use specific policy language and medical codes
- Stay calm and professional in all communications
- Consider getting help from a patient advocate`,
    sourceUrl: "https://www.healthcare.gov/appeal-insurance-company-decision/",
    state: null,
  },
  {
    category: "Consumer Guide",
    title: "Understanding Medical Bills",
    content: `Medical bills can be confusing. Here's how to review and address them:

**Key Documents:**

1. **Explanation of Benefits (EOB)**: From your insurance, shows what was billed, what insurance paid, and what you owe. This is NOT a bill.

2. **Medical Bill**: From the provider, shows the actual amount you need to pay.

**Common Issues to Watch For:**

- **Balance Billing**: Being billed for the difference between what the provider charged and what insurance paid (may be illegal under No Surprises Act)
- **Duplicate Charges**: Same service billed twice
- **Incorrect Codes**: Wrong procedure or diagnosis codes
- **Unbundling**: Services that should be billed together being billed separately

**Steps to Take:**

1. Compare your EOB to your bill
2. Request an itemized bill
3. Check for errors in dates, services, and codes
4. Verify in-network status of all providers
5. Don't pay until you understand what you're paying for

**If You Can't Pay:**
- Ask about payment plans
- Inquire about financial assistance programs
- Negotiate the bill (especially if you're uninsured)
- Ask for the "cash pay" or "self-pay" rate`,
    sourceUrl: null,
    state: null,
  },
  {
    category: "Consumer Guide",
    title: "Emergency Room vs Urgent Care",
    content: `Knowing when to go to the ER vs. urgent care can save money and time:

**Go to Emergency Room For:**
- Chest pain or difficulty breathing
- Severe bleeding that won't stop
- Head injuries with loss of consciousness
- Sudden numbness, weakness, or confusion (stroke symptoms)
- Severe allergic reactions
- Broken bones with visible deformity
- High fever with stiff neck
- Seizures
- Severe burns
- Poisoning or overdose

**Urgent Care is Appropriate For:**
- Minor cuts needing stitches
- Sprains and strains
- Minor infections (UTI, ear infections)
- Mild to moderate flu symptoms
- Minor burns
- Rashes
- Minor fractures (fingers, toes)

**Insurance Considerations:**
- ER visits typically have higher copays ($150-$500+)
- Urgent care copays are usually lower ($25-$75)
- Under the No Surprises Act, emergency services must be covered at in-network rates even at out-of-network facilities
- Some plans require notification within 24-48 hours of ER visit

**When in Doubt**: If you're experiencing a life-threatening emergency, always go to the ER. Your health comes first.`,
    sourceUrl: null,
    state: null,
  },
  {
    category: "State Law",
    title: "California External Review Rights",
    content: `California provides additional consumer protections through the Department of Managed Health Care (DMHC):

**Independent Medical Review (IMR):**
- Free process to appeal denied, delayed, or modified healthcare services
- Available when your health plan denies a service as not medically necessary
- Also available for experimental/investigational treatment denials
- Decisions are binding on the health plan

**How to File:**
1. First complete your health plan's internal grievance process (or file concurrently in urgent situations)
2. Submit an IMR application within 6 months of the grievance decision
3. DMHC will notify you of the decision, typically within 30 days (72 hours for urgent cases)

**Contact DMHC:**
- Phone: 1-888-466-2219
- Website: dmhc.ca.gov

**Additional California Rights:**
- Plans must respond to grievances within 30 days
- Coverage for emergency services cannot require prior authorization
- Mental health parity laws require equal coverage for mental health services`,
    sourceUrl: "https://www.dmhc.ca.gov/FileaComplaint.aspx",
    state: "CA",
  },
  {
    category: "State Law",
    title: "New York Surprise Bill Protections",
    content: `New York has strong surprise bill protections through its Emergency Services and Surprise Bills law:

**Key Protections:**

1. **Emergency Services**: You pay only in-network cost-sharing for emergency services, regardless of whether the provider is in-network.

2. **Surprise Bills**: You're protected from bills from out-of-network providers at in-network hospitals when:
   - You didn't choose the out-of-network provider
   - The provider didn't give you required disclosures
   - You didn't provide written consent

3. **Assignment of Benefits**: You can assign your benefits to the out-of-network provider, who then bills the insurer directly.

4. **Independent Dispute Resolution**: Providers and insurers must use IDR for payment disputes; patients are held harmless.

**How to Get Help:**
- NY Department of Financial Services: 1-800-342-3736
- File a complaint at: dfs.ny.gov

**Additional NY Rights:**
- Out-of-network referral disclosure requirements
- Network adequacy standards
- Continuity of care protections when providers leave networks`,
    sourceUrl: "https://www.dfs.ny.gov/consumers/health_insurance/surprise_medical_bills",
    state: "NY",
  },
  {
    category: "State Law",
    title: "Texas Balance Billing Protections",
    content: `Texas law protects patients from surprise medical bills through Senate Bill 1264:

**Who is Protected:**
- Patients with state-regulated insurance plans (individual, small group, large group)
- HMO and PPO members
- Note: Self-funded employer plans may not be covered (check with your plan)

**Protected Situations:**
1. Emergency care at any facility
2. Services at an in-network facility by an out-of-network provider when:
   - You had no choice of provider
   - You received emergency care
   - The out-of-network provider did not provide required disclosures

**Your Responsibilities:**
- You only pay your in-network cost-sharing amount
- The rest is resolved between the provider and insurer through mediation or arbitration

**If You Receive a Surprise Bill:**
- Contact the Texas Department of Insurance
- Phone: 1-800-252-3439
- Website: tdi.texas.gov

**Filing Deadline**: File a complaint within 90 days of receiving the bill.`,
    sourceUrl: "https://www.tdi.texas.gov/consumer/cpmbalancebilling.html",
    state: "TX",
  },
  {
    category: "Insurance Terms",
    title: "Common Insurance Terms Glossary",
    content: `**Premium**: The monthly amount you pay to maintain your health insurance coverage, regardless of whether you use medical services.

**Deductible**: The amount you pay for covered healthcare services before your insurance plan starts to pay. For example, with a $2,000 deductible, you pay the first $2,000 of covered services yourself.

**Copayment (Copay)**: A fixed amount you pay for a covered healthcare service after you've paid your deductible. Example: $20 for a primary care visit.

**Coinsurance**: Your share of the costs of a covered service, calculated as a percentage. Example: If your coinsurance is 20%, you pay 20% and your plan pays 80%.

**Out-of-Pocket Maximum**: The most you have to pay for covered services in a plan year. After you reach this amount, your plan pays 100% of covered benefits.

**In-Network**: Providers or facilities that have a contract with your health plan to provide services at negotiated rates. You typically pay less for in-network care.

**Out-of-Network**: Providers without a contract with your plan. You may pay more or the full cost for out-of-network care.

**Prior Authorization**: Approval from your insurance plan required before certain services to confirm they're medically necessary.

**Explanation of Benefits (EOB)**: A statement from your insurer showing what was billed, what they paid, and what you owe. It's not a bill.

**Formulary**: A list of prescription drugs covered by your plan, often organized in tiers with different cost-sharing amounts.`,
    sourceUrl: "https://www.healthcare.gov/glossary/",
    state: null,
  },
];

async function main() {
  console.log("Starting knowledge base seed...");

  for (const entry of knowledgeBaseEntries) {
    console.log(`Processing: ${entry.title}`);

    try {
      const embedding = await generateEmbedding(entry.content);
      const embeddingStr = `[${embedding.join(",")}]`;

      await prisma.$executeRaw`
        INSERT INTO "KnowledgeBase" (id, category, title, content, embedding, "sourceUrl", state, "lastUpdated", "createdAt")
        VALUES (
          ${`kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`},
          ${entry.category},
          ${entry.title},
          ${entry.content},
          ${embeddingStr}::vector,
          ${entry.sourceUrl},
          ${entry.state},
          NOW(),
          NOW()
        )
        ON CONFLICT DO NOTHING
      `;

      console.log(`✓ Added: ${entry.title}`);
    } catch (error) {
      console.error(`✗ Failed: ${entry.title}`, error);
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("Knowledge base seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
