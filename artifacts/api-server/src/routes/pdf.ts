import { Router } from "express";
import PDFDocument from "pdfkit";

const router = Router();

interface HiringBrief {
  companyContext: string;
  hiringMotivation: string;
  role: string;
  seniorityOwnership: string;
  reportingStructure: string;
  successMetrics: string;
  mustHaves: string;
  niceToHaves: string;
  dealBreakers: string;
  technicalRequirements: string;
  workStyleCulture: string;
  compensationModel: string;
  interviewProcess: string;
  decisionChain: string;
  candidatePitch: string;
  recruitingStrategy: string;
  riskRegister: string;
  assumptionLog: string;
  pastHiringSignal: string;
  timeline: string;
  budget: string;
  contact: string;
  openFlags?: string;
  rawIntake?: string;
}

// ─── Completeness gate ─────────────────────────────────────────────────────────

const REQUIRED_FIELDS: (keyof HiringBrief)[] = [
  "companyContext",
  "hiringMotivation",
  "role",
  "seniorityOwnership",
  "successMetrics",
  "mustHaves",
  "dealBreakers",
  "workStyleCulture",
  "compensationModel",
  "interviewProcess",
  "decisionChain",
  "candidatePitch",
  "contact",
];

function validateBrief(brief: Partial<HiringBrief>): string[] {
  return REQUIRED_FIELDS.filter(
    (k) => !brief[k] || String(brief[k]).trim().length < 10
  );
}

function extractCompanyName(brief: Partial<HiringBrief>): string {
  const ctx = brief.companyContext ?? "";
  const first = ctx.split(/[.,\n]/)[0] ?? "";
  return first.trim().slice(0, 60) || "Company";
}

// ─── PDF layout helpers ────────────────────────────────────────────────────────

const BRAND_DARK = "#111111";
const BRAND_GREEN = "#1A7A4A";
const MUTED = "#6B6B6B";
const RULE_COLOR = "#E8E8E8";

function drawPageRule(doc: InstanceType<typeof PDFDocument>) {
  doc.save()
    .strokeColor(RULE_COLOR)
    .lineWidth(0.5)
    .moveTo(50, doc.y)
    .lineTo(doc.page.width - 50, doc.y)
    .stroke()
    .restore();
  doc.moveDown(0.6);
}

function sectionHeader(
  doc: InstanceType<typeof PDFDocument>,
  groupLabel: string
) {
  doc.moveDown(0.4);
  doc.save()
    .fontSize(7)
    .font("Helvetica-Bold")
    .fillColor(BRAND_GREEN)
    .text(groupLabel.toUpperCase(), { characterSpacing: 1.4 })
    .restore();
  doc.save()
    .strokeColor(BRAND_GREEN)
    .lineWidth(1)
    .moveTo(50, doc.y + 2)
    .lineTo(doc.page.width - 50, doc.y + 2)
    .stroke()
    .restore();
  doc.moveDown(0.55);
}

function field(
  doc: InstanceType<typeof PDFDocument>,
  label: string,
  content: string | undefined,
  gap = 0.7
) {
  if (!content?.trim()) return;
  doc.save()
    .fontSize(7.5)
    .font("Helvetica-Bold")
    .fillColor(MUTED)
    .text(label.toUpperCase(), { characterSpacing: 0.8 })
    .restore();
  doc.moveDown(0.15);
  doc.save()
    .fontSize(9.5)
    .font("Helvetica")
    .fillColor(BRAND_DARK)
    .text(content.trim(), { align: "left", lineGap: 2.5 })
    .restore();
  doc.moveDown(gap);
}

// ─── Generate PDF ──────────────────────────────────────────────────────────────

function generateBriefPdf(
  doc: InstanceType<typeof PDFDocument>,
  brief: Partial<HiringBrief>
) {
  const W = doc.page.width;
  const company = extractCompanyName(brief);
  const now = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ── Cover header bar ──
  doc.save()
    .rect(0, 0, W, 90)
    .fill(BRAND_DARK)
    .restore();

  // Bridgix wordmark
  doc.save()
    .fontSize(9)
    .font("Helvetica-Bold")
    .fillColor("#FFFFFF")
    .text("BRIDGIX", 50, 22, { characterSpacing: 3 })
    .restore();

  // Title
  doc.save()
    .fontSize(22)
    .font("Helvetica-Bold")
    .fillColor("#FFFFFF")
    .text("Hiring Brief", 50, 38)
    .restore();

  // Company + date
  doc.save()
    .fontSize(9)
    .font("Helvetica")
    .fillColor("rgba(255,255,255,0.65)")
    .text(`${company}   ·   ${now}`, 50, 68)
    .restore();

  // Confidentiality note
  doc.save()
    .fontSize(7.5)
    .font("Helvetica")
    .fillColor("rgba(255,255,255,0.4)")
    .text("CONFIDENTIAL — FOR RECRUITER USE ONLY", W - 260, 78)
    .restore();

  doc.y = 110;

  // ── COMPANY & ROLE ──────────────────────────────────────────────────────────
  sectionHeader(doc, "Company & Role");
  field(doc, "Company Context", brief.companyContext);
  field(doc, "Hiring Motivation", brief.hiringMotivation);
  field(doc, "The Role", brief.role);
  field(doc, "Seniority & Ownership", brief.seniorityOwnership);
  field(doc, "Reporting Structure", brief.reportingStructure);

  // ── CANDIDATE PROFILE ───────────────────────────────────────────────────────
  sectionHeader(doc, "Candidate Profile");
  field(doc, "Must-Haves", brief.mustHaves);
  field(doc, "Nice-to-Haves", brief.niceToHaves);
  field(doc, "Deal Breakers", brief.dealBreakers);
  field(doc, "Technical Requirements", brief.technicalRequirements);

  // ── SUCCESS & STRUCTURE ─────────────────────────────────────────────────────
  sectionHeader(doc, "Success & Structure");
  field(doc, "Success Metrics (30 / 60 / 90 / 365 Days)", brief.successMetrics);
  field(doc, "Interview Process", brief.interviewProcess);
  field(doc, "Decision Chain", brief.decisionChain);

  // ── CULTURE & COMPENSATION ──────────────────────────────────────────────────
  sectionHeader(doc, "Culture & Compensation");
  field(doc, "Work Style & Culture", brief.workStyleCulture);
  field(doc, "Compensation Model", brief.compensationModel);

  // ── RECRUITING INTELLIGENCE ─────────────────────────────────────────────────
  sectionHeader(doc, "Recruiting Intelligence");
  field(doc, "Candidate Pitch", brief.candidatePitch);
  field(doc, "Recruiting Strategy", brief.recruitingStrategy);
  field(doc, "Risk Register", brief.riskRegister);
  field(doc, "Assumption Log", brief.assumptionLog);

  // ── HISTORY & LOGISTICS ─────────────────────────────────────────────────────
  sectionHeader(doc, "History & Logistics");
  field(doc, "Past Hiring Signal", brief.pastHiringSignal);
  field(doc, "Timeline", brief.timeline);
  field(doc, "Budget", brief.budget);
  field(doc, "Contact", brief.contact);
  if (brief.openFlags?.trim()) {
    drawPageRule(doc);
    field(doc, "Open Flags", brief.openFlags, 0.4);
  }

  // ── Footer on every page ────────────────────────────────────────────────────
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.save()
      .fontSize(7)
      .font("Helvetica")
      .fillColor(MUTED)
      .text(
        `Bridgix Hiring Brief  ·  ${company}  ·  Page ${i - range.start + 1} of ${range.count}`,
        50,
        doc.page.height - 35,
        { align: "left" }
      )
      .restore();
  }
}

// ─── Route ─────────────────────────────────────────────────────────────────────

router.post("/generate-pdf", (req, res) => {
  const { brief } = req.body as { brief?: Partial<HiringBrief> };

  if (!brief || typeof brief !== "object") {
    res.status(400).json({ error: "brief is required" });
    return;
  }

  // Completeness gate — block PDF if required sections are missing
  const missing = validateBrief(brief);
  if (missing.length > 0) {
    res.status(422).json({
      error: "incomplete_brief",
      message: "Cannot generate PDF: required sections are incomplete.",
      missing,
    });
    return;
  }

  const company = extractCompanyName(brief);
  const safeFilename = company.replace(/[^a-zA-Z0-9-_]/g, "-").replace(/-+/g, "-").toLowerCase();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="hiring-brief-${safeFilename}.pdf"`
  );

  const doc = new PDFDocument({
    size: "LETTER",
    margin: 50,
    bufferPages: true,
    info: {
      Title: `Hiring Brief — ${company}`,
      Author: "Bridgix",
      Subject: "Hiring Brief",
      Keywords: "hiring, recruiter, brief",
    },
  });

  doc.pipe(res);
  generateBriefPdf(doc, brief);
  doc.end();
});

export default router;
