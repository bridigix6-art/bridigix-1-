import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Navigation } from "@/components/sections/Navigation";
import { apiEndpoint } from "@/lib/api";

const employmentOptions = ["Full-time", "Part-time", "Contract", "Internship"];
const locationOptions = ["Remote", "Hybrid", "Onsite"];
const experienceOptions = ["0-1", "1-3", "3-5", "5-10", "10+"];
const seniorityOptions = ["Junior", "Mid", "Senior", "Lead", "Principal"];
const urgencyOptions = ["ASAP", "Within 30 days", "Within 90 days", "Flexible"];
const interviewRoundsOptions = ["1", "2", "3", "4+"];
const sponsorshipOptions = ["Yes", "No", "Case-by-case"];
const yesNoOptions = ["Yes", "No"];
const currencyOptions = ["USD", "CAD", "EUR", "INR"];
const sectionTitleClass = "text-[20px] sm:text-[22px] font-semibold tracking-[-0.02em] text-[#0A0A0A]";

function formatSalaryString(value: string) {
  const digits = value.replace(/[^0-9]/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function Field({ label, error, optional, children }: { label: string; error?: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <label className="text-[13px] md:text-[14px] font-medium leading-[1.35] text-[#1F1F1F]" style={{ fontFamily: "'Inter', sans-serif" }}>{label}</label>
        {optional && (
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#A7A7A7]" style={{ fontFamily: "'Inter', sans-serif" }}>optional</span>
        )}
      </div>
      {children}
      {error && <span className="text-[11px] text-[#E05050]" style={{ fontFamily: "'Inter', sans-serif" }}>{error}</span>}
    </div>
  );
}

const inputStyle = (hasError?: boolean): React.CSSProperties => ({
  width: "100%",
  border: `1px solid ${hasError ? "#E05050" : "#E8E8E8"}`,
  borderRadius: 10,
  padding: "13px 16px",
  fontFamily: "Inter, sans-serif",
  fontSize: 14,
  color: "#0A0A0A",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
  background: "#FAFAF8",
  boxSizing: "border-box" as const,
  boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
});

function SelectField({ options, value, onChange, placeholder, error }: { options: string[]; value: string; onChange: (v: string) => void; placeholder?: string; error?: boolean }) {
  const [open, setOpen] = useState(false);
  const filtered = options.filter((option) => option !== placeholder && option !== options[0]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="w-full text-left cursor-pointer transition-all duration-150"
        style={{
          ...inputStyle(error),
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: !value || value === options[0] ? "#9B9B9B" : "#0A0A0A",
          borderColor: open ? "#1A7A4A" : error ? "#E05050" : "#E8E8E8",
          boxShadow: open ? "0 0 0 3px rgba(26,122,74,0.08)" : "none",
        }}
      >
        <span>{!value || value === options[0] ? placeholder ?? options[0] : value}</span>
        <svg style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }} width="12" height="8" viewBox="0 0 12 8" fill="none">
          <path d="M1 1.5L6 6.5L11 1.5" stroke="#6B6B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-1 z-20 overflow-hidden rounded-[12px] border border-[#E8E8E8] bg-white shadow-[0_8px_28px_rgba(0,0,0,0.12)]"
          >
            {filtered.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-[13px] transition-colors"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  color: value === option ? "#1A7A4A" : "#0A0A0A",
                  background: value === option ? "rgba(26,122,74,0.05)" : "none",
                  border: "none",
                  fontWeight: value === option ? 500 : 400,
                }}
              >
                {option}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {open && <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />}
    </div>
  );
}

export default function RecruiterIntakePage() {
  const [, setLocation] = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    jobTitle: "",
    employmentType: "",
    locationType: "",
    locationCity: "",
    roleDescription: "",
    responsibilities: "",
    requiredSkills: "",
    niceToHaveSkills: "",
    experience: "",
    seniority: "",
    headcount: "",
    urgency: "",
    salaryCurrency: "CAD",
    salaryMin: "",
    salaryMax: "",
    keepSalaryConfidential: false,
    interviewRounds: "",
    redFlags: "",
    culture: "",
    visaSponsorship: "",
    referralBonus: "",
    contactName: "",
    contactEmail: "",
    companyName: "",
    companyWebsite: "",
  });

  const updateField = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = event.target;
    const value = target instanceof HTMLInputElement && target.type === "checkbox" ? target.checked : target.value;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.contactName.trim()) nextErrors.contactName = "Required";
    if (!form.contactEmail.trim()) {
      nextErrors.contactEmail = "Required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail.trim())) {
      nextErrors.contactEmail = "Enter a valid email";
    }
    if (!form.companyName.trim()) nextErrors.companyName = "Required";
    if (!form.jobTitle.trim()) nextErrors.jobTitle = "Required";
    if (!form.employmentType) nextErrors.employmentType = "Required";
    if (!form.locationType) nextErrors.locationType = "Required";
    if (form.locationType === "Hybrid" || form.locationType === "Onsite") {
      if (!form.locationCity.trim()) nextErrors.locationCity = "Required";
    }
    if (!form.roleDescription.trim()) nextErrors.roleDescription = "Required";
    if (!form.responsibilities.trim()) nextErrors.responsibilities = "Required";
    if (!form.requiredSkills.trim()) nextErrors.requiredSkills = "Required";
    if (!form.experience) nextErrors.experience = "Required";
    if (!form.seniority) nextErrors.seniority = "Required";
    if (!form.headcount.trim()) nextErrors.headcount = "Required";
    if (!form.urgency) nextErrors.urgency = "Required";
    if (!form.interviewRounds) nextErrors.interviewRounds = "Required";
    if (!form.visaSponsorship) nextErrors.visaSponsorship = "Required";
    if (!form.referralBonus) nextErrors.referralBonus = "Required";
    return nextErrors;
  };

  const updateSalaryField = (key: "salaryMin" | "salaryMax") => (event: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSalaryString(event.target.value);
    setForm((current) => ({ ...current, [key]: formatted }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        contactName: form.contactName,
        contactEmail: form.contactEmail.toLowerCase(),
        companyName: form.companyName,
        companyWebsite: form.companyWebsite,
        jobTitle: form.jobTitle,
        employmentType: form.employmentType,
        locationType: form.locationType,
        locationCity: form.locationCity,
        roleDescription: form.roleDescription,
        responsibilities: form.responsibilities,
        requiredSkills: form.requiredSkills,
        niceToHaveSkills: form.niceToHaveSkills,
        experience: form.experience,
        seniority: form.seniority,
        headcount: form.headcount,
        urgency: form.urgency,
        salaryCurrency: form.salaryCurrency,
        salaryMin: form.salaryMin.replace(/,/g, ""),
        salaryMax: form.salaryMax.replace(/,/g, ""),
        keepSalaryConfidential: form.keepSalaryConfidential,
        interviewRounds: form.interviewRounds,
        redFlags: form.redFlags,
        culture: form.culture,
        visaSponsorship: form.visaSponsorship,
        referralBonus: form.referralBonus,
      };

      const response = await fetch(apiEndpoint("/api/recruiter-intake"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message = body?.error || response.statusText || "Failed to submit recruiter intake.";
        throw new Error(`${response.status}: ${message}`);
      }

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Recruiter intake submission error:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Something went wrong submitting the form. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen" style={{ background: "#FAFAF8" }}>
        <Navigation />
        <main className="px-4 pb-[80px] pt-[120px]">
          <div className="mx-auto max-w-[760px] rounded-[24px] border border-[#F0F0EE] bg-white p-8 shadow-[0_4px_32px_rgba(0,0,0,0.05)] md:p-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#DDF4E7] bg-[#F0FBF5] px-3 py-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#1A7A4A]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1A7A4A]" style={{ fontFamily: "'Inter', sans-serif" }}>
                Intake received
              </span>
            </div>
            <h1 className="text-[clamp(30px,3.2vw,44px)] font-medium tracking-[-0.04em] text-[#0A0A0A]" style={{ fontFamily: "'Inter', sans-serif" }}>
              Thanks for sharing the role.
            </h1>
            <p className="mt-4 max-w-[620px] text-[15px] leading-[1.75] text-[#4A4A4A]" style={{ fontFamily: "'Inter', sans-serif" }}>
              We’ll review your intake and follow up with the next steps.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setLocation("/")}
                className="rounded-[12px] border border-[#E8E8E8] px-5 py-3 text-[14px] font-medium text-[#0A0A0A] transition-colors duration-200 hover:border-[#0A0A0A]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Back home
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#FAFAF8" }}>
      <Navigation />
      <main className="px-4 pb-[80px] pt-[120px]">
        <div className="mx-auto max-w-[860px]">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6">
            <button type="button" onClick={() => setLocation("/")} className="flex items-center gap-2 text-[13px] text-[#6B6B6B] transition-colors duration-200 hover:text-[#0A0A0A]" style={{ fontFamily: "'Inter', sans-serif" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10 text-center">
            <h1 className="text-[36px] font-semibold tracking-[-0.04em] text-[#0A0A0A]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Recruiter Intake Form
            </h1>
            <p className="mx-auto mt-3 max-w-[640px] text-[15px] leading-[1.65] text-[#6B6B6B]" style={{ fontFamily: "'Inter', sans-serif" }}>
              Share the role details and we’ll use them to find the right engineer fit.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6 rounded-[24px] border border-[#F0F0EE] bg-white p-6 shadow-[0_4px_32px_rgba(0,0,0,0.05)] md:p-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className={`${sectionTitleClass}`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>Role basics</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <Field label="What's the job title for this role?" error={errors.jobTitle}>
                    <input value={form.jobTitle} onChange={updateField("jobTitle")} placeholder="Senior Frontend Engineer" style={inputStyle(!!errors.jobTitle)} />
                  </Field>
                  <Field label="What type of employment is this?" error={errors.employmentType}>
                    <SelectField options={["Select employment type", ...employmentOptions]} value={form.employmentType} onChange={(value) => setForm((current) => ({ ...current, employmentType: value }))} placeholder="Select employment type" error={!!errors.employmentType} />
                  </Field>
                </div>
                <Field label="Where will this role be based?" error={errors.locationType}>
                  <SelectField options={["Select location type", ...locationOptions]} value={form.locationType} onChange={(value) => setForm((current) => ({ ...current, locationType: value }))} placeholder="Select location type" error={!!errors.locationType} />
                </Field>
                {(form.locationType === "Hybrid" || form.locationType === "Onsite") && (
                  <Field label="Which city?" error={errors.locationCity}>
                    <input value={form.locationCity} onChange={updateField("locationCity")} placeholder="London, UK" style={inputStyle(!!errors.locationCity)} />
                  </Field>
                )}
              </div>

              <div className="space-y-6">
                <h2 className={`${sectionTitleClass} mt-8 border-t border-[#ECEBE8] pt-8`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>The role itself</h2>
                <Field label="In one or two sentences, how would you describe this role?" error={errors.roleDescription}>
                  <textarea value={form.roleDescription} onChange={updateField("roleDescription")} rows={3} placeholder="Describe the role in one or two sentences." style={{ ...inputStyle(!!errors.roleDescription), resize: "vertical", minHeight: 90 }} />
                </Field>
                <Field label="What are the key responsibilities for this position?" error={errors.responsibilities}>
                  <textarea value={form.responsibilities} onChange={updateField("responsibilities")} rows={4} placeholder="List the core responsibilities." style={{ ...inputStyle(!!errors.responsibilities), resize: "vertical", minHeight: 110 }} />
                </Field>
                <Field label="What skills or qualifications are absolutely required for this role?" error={errors.requiredSkills}>
                  <textarea value={form.requiredSkills} onChange={updateField("requiredSkills")} rows={4} placeholder="List the must-have experience and skills." style={{ ...inputStyle(!!errors.requiredSkills), resize: "vertical", minHeight: 110 }} />
                </Field>
                <div className="grid gap-6 md:grid-cols-2">
                  <Field label="How many years of experience should candidates have?" error={errors.experience}>
                    <SelectField options={["Select experience", ...experienceOptions]} value={form.experience} onChange={(value) => setForm((current) => ({ ...current, experience: value }))} placeholder="Select experience" error={!!errors.experience} />
                  </Field>
                  <Field label="What seniority level is this role?" error={errors.seniority}>
                    <SelectField options={["Select seniority", ...seniorityOptions]} value={form.seniority} onChange={(value) => setForm((current) => ({ ...current, seniority: value }))} placeholder="Select seniority" error={!!errors.seniority} />
                  </Field>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className={`${sectionTitleClass} mt-8 border-t border-[#ECEBE8] pt-8`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>Logistics</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  <Field label="How many positions are you looking to fill?" error={errors.headcount}>
                    <input type="number" min="1" value={form.headcount} onChange={updateField("headcount")} placeholder="1" style={inputStyle(!!errors.headcount)} />
                  </Field>
                  <Field label="How soon do you need this role filled?" error={errors.urgency}>
                    <SelectField options={["Select urgency", ...urgencyOptions]} value={form.urgency} onChange={(value) => setForm((current) => ({ ...current, urgency: value }))} placeholder="Select urgency" error={!!errors.urgency} />
                  </Field>
                </div>
                <Field label="What's the salary range for this role?">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[12px] text-[#6B6B6B]" style={{ fontFamily: "'Inter', sans-serif" }}>Salary currency</span>
                      <select
                        value={form.salaryCurrency}
                        onChange={(event) => setForm((current) => ({ ...current, salaryCurrency: event.target.value }))}
                        style={{ ...inputStyle(), maxWidth: 140, appearance: "none" as const }}
                      >
                        {currencyOptions.map((currency) => (
                          <option key={currency} value={currency}>{currency}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      <Field label="Min">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9,]*"
                          value={form.salaryMin}
                          onChange={updateSalaryField("salaryMin")}
                          placeholder="Enter min salary"
                          style={inputStyle()}
                          disabled={form.keepSalaryConfidential}
                        />
                      </Field>
                      <Field label="Max">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9,]*"
                          value={form.salaryMax}
                          onChange={updateSalaryField("salaryMax")}
                          placeholder="Enter max salary"
                          style={inputStyle()}
                          disabled={form.keepSalaryConfidential}
                        />
                      </Field>
                    </div>
                  </div>
                  <label className="mt-2 flex items-center gap-2 text-[13px] text-[#0A0A0A]" style={{ fontFamily: "'Inter', sans-serif" }}>
                    <input type="checkbox" checked={form.keepSalaryConfidential} onChange={updateField("keepSalaryConfidential")} className="h-4 w-4 rounded border-[#D9D9D9]" />
                    Keep confidential
                  </label>
                </Field>
                <Field label="How many interview rounds do you expect for this role?" error={errors.interviewRounds}>
                  <SelectField options={["Select interview rounds", ...interviewRoundsOptions]} value={form.interviewRounds} onChange={(value) => setForm((current) => ({ ...current, interviewRounds: value }))} placeholder="Select interview rounds" error={!!errors.interviewRounds} />
                </Field>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className={`${sectionTitleClass} mt-8 border-t border-[#ECEBE8] pt-8`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>Optional context</h2>
              <Field label="Is there anything about your team's culture or working style candidates should know?" optional>
                <div className="rounded-[14px] border border-dashed border-[#E8E5DB] bg-[#FCFCFA] p-4 md:p-5">
                  <textarea value={form.culture} onChange={updateField("culture")} rows={3} placeholder="Optional team context or working style." style={{ ...inputStyle(), resize: "vertical", minHeight: 88, background: "#FCFCFA" }} />
                </div>
              </Field>
              <Field label="Are there any dealbreakers or red flags we should screen for?" optional>
                <textarea value={form.redFlags} onChange={updateField("redFlags")} rows={3} placeholder="Optional red flags or blockers." style={{ ...inputStyle(), resize: "vertical", minHeight: 88 }} />
              </Field>
              <Field label="Are there any nice-to-have skills that would set a candidate apart?" optional>
                <textarea value={form.niceToHaveSkills} onChange={updateField("niceToHaveSkills")} rows={4} placeholder="Optional detail for standout candidates." style={{ ...inputStyle(), resize: "vertical", minHeight: 110 }} />
              </Field>
              <div className="grid gap-6 md:grid-cols-2">
                <Field label="Does this role offer visa sponsorship?" error={errors.visaSponsorship}>
                  <SelectField options={["Select option", ...sponsorshipOptions]} value={form.visaSponsorship} onChange={(value) => setForm((current) => ({ ...current, visaSponsorship: value }))} placeholder="Select option" error={!!errors.visaSponsorship} />
                </Field>
                <Field label="Is this role eligible for an internal referral bonus?" error={errors.referralBonus}>
                  <SelectField options={["Select option", ...yesNoOptions]} value={form.referralBonus} onChange={(value) => setForm((current) => ({ ...current, referralBonus: value }))} placeholder="Select option" error={!!errors.referralBonus} />
                </Field>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className={`${sectionTitleClass} mt-8 border-t border-[#ECEBE8] pt-8`} style={{ fontFamily: "'Cormorant Garamond', serif" }}>Contact info</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <Field label="Your full name" error={errors.contactName}>
                  <input value={form.contactName} onChange={updateField("contactName")} placeholder="Alex Morgan" style={inputStyle(!!errors.contactName)} />
                </Field>
                <Field label="Work email" error={errors.contactEmail}>
                  <input type="email" value={form.contactEmail} onChange={updateField("contactEmail")} placeholder="alex@company.com" style={inputStyle(!!errors.contactEmail)} />
                </Field>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <Field label="Company name" error={errors.companyName}>
                  <input value={form.companyName} onChange={updateField("companyName")} placeholder="Enter company name" style={inputStyle(!!errors.companyName)} />
                </Field>
                <Field label="Company website" optional>
                  <input value={form.companyWebsite} onChange={updateField("companyWebsite")} placeholder="Enter company website" style={inputStyle()} />
                </Field>
              </div>
            </div>

            {submitError && (
              <div className="rounded-[10px] border border-[#F0C5C5] bg-[#FFF6F6] px-4 py-3">
                <p className="text-[13px] text-[#E05050]" style={{ fontFamily: "'Inter', sans-serif" }}>{submitError}</p>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setLocation("/")} className="rounded-[12px] border border-[#E8E8E8] px-5 py-3 text-[14px] font-medium text-[#6B6B6B] transition-colors duration-200 hover:border-[#0A0A0A] hover:text-[#0A0A0A]" style={{ fontFamily: "'Inter', sans-serif" }}>
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="rounded-[12px] bg-[#1A7A4A] px-5 py-3 text-[14px] font-medium text-white transition-all duration-200 hover:bg-[#0A0A0A] disabled:cursor-wait disabled:bg-[#9B9B9B]" style={{ fontFamily: "'Inter', sans-serif" }}>
                {submitting ? "Submitting..." : "Submit intake →"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
