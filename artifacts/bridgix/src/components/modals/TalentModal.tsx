import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TalentModalProps {
  open: boolean;
  onClose: () => void;
}

const ROLES = [
  "Select your primary role",
  "Full-Stack Engineer",
  "Backend Engineer",
  "Frontend Engineer",
  "AI / ML Engineer",
  "Mobile Engineer",
  "DevOps / Platform Engineer",
  "Engineering Lead / Manager",
  "Founding Engineer",
];

const EXPERIENCE = ["Select years", "1–2 years", "3–5 years", "6–9 years", "10+ years"];
const AVAILABILITY = ["Immediately", "Within 2 weeks", "Within a month", "1–3 months", "Not sure yet"];

function BridgixMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L14.5 4.5L17 3L18.5 5.5L21 5.5L21 8.5L23 10L21.5 12L23 14L21 15.5L21 18.5L18.5 18.5L17 21L14.5 19.5L12 22L9.5 19.5L7 21L5.5 18.5L3 18.5L3 15.5L1 14L2.5 12L1 10L3 8.5L3 5.5L5.5 5.5L7 3L9.5 4.5Z"
        stroke="#1A7A4A" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="3" stroke="#1A7A4A" strokeWidth="1.5" />
    </svg>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-[#0A0A0A]">{label}</label>
      {children}
      {error && <span className="text-[11px] text-[#E05050]">{error}</span>}
    </div>
  );
}

const inputStyle = (hasError?: boolean): React.CSSProperties => ({
  width: "100%",
  border: `1px solid ${hasError ? "#E05050" : "#E8E8E8"}`,
  borderRadius: 8,
  padding: "12px 16px",
  fontFamily: "Inter, sans-serif",
  fontSize: 14,
  color: "#0A0A0A",
  outline: "none",
  transition: "border-color 0.2s",
  background: "#FFFFFF",
  boxSizing: "border-box" as const,
});

function PillToggle({
  options, value, onChange,
}: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className="cursor-pointer transition-all duration-150"
          style={{
            border: `1px solid ${value === opt ? "#0A0A0A" : "#E8E8E8"}`,
            borderRadius: 100,
            padding: "8px 18px",
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            background: value === opt ? "#0A0A0A" : "transparent",
            color: value === opt ? "#FFFFFF" : "#0A0A0A",
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function TalentModal({ open, onClose }: TalentModalProps) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: "", email: "", location: "", role: ROLES[0], experience: EXPERIENCE[0],
    skills: "", github: "", linkedin: "", project: "", environment: "",
    status: "", availability: AVAILABILITY[0], workType: "", salary: "", notes: "",
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));
  const setPill = (key: string) => (v: string) => setForm(f => ({ ...f, [key]: v }));

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "This field is required";
    if (!form.email.trim()) e.email = "This field is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address";
    if (form.role === ROLES[0]) e.role = "This field is required";
    return e;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!form.skills.trim()) e.skills = "This field is required";
    return e;
  };

  const validateStep3 = () => {
    const e: Record<string, string> = {};
    if (!form.status) e.status = "This field is required";
    return e;
  };

  const handleNext = () => {
    const e = step === 1 ? validateStep1() : validateStep2();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep(s => s + 1);
  };

  const handleSubmit = () => {
    const e = validateStep3();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setSubmitted(true);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => { setStep(1); setSubmitted(false); setErrors({}); }, 300);
  };

  const stepLabels = ["You", "Your Work", "Availability"];
  const completedStep = step - 1;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 cursor-pointer"
            style={{ background: "rgba(0,0,0,0.7)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
          />
          <motion.div
            className="relative z-10 bg-white rounded-[20px] overflow-y-auto"
            style={{ maxWidth: 560, width: "90vw", maxHeight: "90vh", padding: 48, boxSizing: "border-box" }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute cursor-pointer transition-colors duration-150"
              style={{ top: 20, right: 24, fontSize: 20, color: "#6B6B6B", background: "none", border: "none", lineHeight: 1 }}
              onMouseEnter={e => (e.currentTarget.style.color = "#0A0A0A")}
              onMouseLeave={e => (e.currentTarget.style.color = "#6B6B6B")}
            >
              ×
            </button>

            {!submitted ? (
              <>
                {/* Logo + heading */}
                <div className="flex flex-col items-center mb-8">
                  <BridgixMark size={36} />
                  <h2 className="mt-4 text-[24px] font-semibold text-[#0A0A0A] text-center" style={{ letterSpacing: "-0.03em" }}>
                    Join the Bridigix Network
                  </h2>
                  <p className="mt-2 text-[14px] text-[#6B6B6B] text-center leading-[1.6] max-w-[380px]">
                    We only work with the top 5%. Apply and we'll be in touch within 48 hours.
                  </p>
                </div>

                {/* Progress indicator */}
                <div className="flex items-center justify-center mb-8 gap-0">
                  {stepLabels.map((label, i) => {
                    const n = i + 1;
                    const isActive = n === step;
                    const isDone = n < step;
                    return (
                      <div key={label} className="flex flex-col items-center" style={{ flex: i < 2 ? "1 1 0" : undefined }}>
                        <div className="flex items-center w-full">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{
                              background: isDone ? "#1A7A4A" : isActive ? "#0A0A0A" : "transparent",
                              border: isActive ? "none" : isDone ? "none" : "1.5px solid #E8E8E8",
                              width: 8, height: 8,
                            }}
                          />
                          {i < 2 && (
                            <div className="flex-1 h-px" style={{ background: isDone ? "#1A7A4A" : "#E8E8E8" }} />
                          )}
                        </div>
                        <span className="text-[11px] text-[#6B6B6B] mt-1.5" style={{ fontFamily: "Inter, sans-serif" }}>
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Step 1 */}
                {step === 1 && (
                  <div className="flex flex-col gap-5">
                    <Field label="Full Name" error={errors.name}>
                      <input
                        value={form.name} onChange={set("name")}
                        placeholder="Your full name"
                        style={inputStyle(!!errors.name)}
                        onFocus={e => (e.target.style.borderColor = "#0A0A0A")}
                        onBlur={e => (e.target.style.borderColor = errors.name ? "#E05050" : "#E8E8E8")}
                      />
                    </Field>
                    <Field label="Email" error={errors.email}>
                      <input
                        type="email" value={form.email} onChange={set("email")}
                        placeholder="your@email.com"
                        style={inputStyle(!!errors.email)}
                        onFocus={e => (e.target.style.borderColor = "#0A0A0A")}
                        onBlur={e => (e.target.style.borderColor = errors.email ? "#E05050" : "#E8E8E8")}
                      />
                    </Field>
                    <Field label="Location">
                      <input
                        value={form.location} onChange={set("location")}
                        placeholder="City, Country"
                        style={inputStyle()}
                        onFocus={e => (e.target.style.borderColor = "#0A0A0A")}
                        onBlur={e => (e.target.style.borderColor = "#E8E8E8")}
                      />
                    </Field>
                    <Field label="Primary Role" error={errors.role}>
                      <div className="relative">
                        <select
                          value={form.role} onChange={set("role")}
                          style={{ ...inputStyle(!!errors.role), appearance: "none", WebkitAppearance: "none", paddingRight: 40, cursor: "pointer" }}
                          onFocus={e => (e.target.style.borderColor = "#0A0A0A")}
                          onBlur={e => (e.target.style.borderColor = errors.role ? "#E05050" : "#E8E8E8")}
                        >
                          {ROLES.map(r => <option key={r}>{r}</option>)}
                        </select>
                        <svg className="absolute pointer-events-none" style={{ right: 14, top: "50%", transform: "translateY(-50%)" }} width="12" height="8" viewBox="0 0 12 8" fill="none">
                          <path d="M1 1.5L6 6.5L11 1.5" stroke="#6B6B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </Field>
                    <Field label="Years of Experience">
                      <div className="relative">
                        <select
                          value={form.experience} onChange={set("experience")}
                          style={{ ...inputStyle(), appearance: "none", WebkitAppearance: "none", paddingRight: 40, cursor: "pointer" }}
                          onFocus={e => (e.target.style.borderColor = "#0A0A0A")}
                          onBlur={e => (e.target.style.borderColor = "#E8E8E8")}
                        >
                          {EXPERIENCE.map(e => <option key={e}>{e}</option>)}
                        </select>
                        <svg className="absolute pointer-events-none" style={{ right: 14, top: "50%", transform: "translateY(-50%)" }} width="12" height="8" viewBox="0 0 12 8" fill="none">
                          <path d="M1 1.5L6 6.5L11 1.5" stroke="#6B6B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </Field>
                    <NextBtn onClick={handleNext} />
                  </div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <div className="flex flex-col gap-5">
                    <Field label="Core Skills" error={errors.skills}>
                      <input
                        value={form.skills} onChange={set("skills")}
                        placeholder="e.g. React, Node.js, TypeScript, AWS (comma separated)"
                        style={inputStyle(!!errors.skills)}
                        onFocus={e => (e.target.style.borderColor = "#0A0A0A")}
                        onBlur={e => (e.target.style.borderColor = errors.skills ? "#E05050" : "#E8E8E8")}
                      />
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#6B6B6B" }}>
                        List 3–6 technologies you work with most
                      </span>
                    </Field>
                    <Field label="GitHub or Portfolio">
                      <input value={form.github} onChange={set("github")}
                        placeholder="github.com/yourhandle or yoursite.com"
                        style={inputStyle()}
                        onFocus={e => (e.target.style.borderColor = "#0A0A0A")}
                        onBlur={e => (e.target.style.borderColor = "#E8E8E8")} />
                    </Field>
                    <Field label="LinkedIn">
                      <input value={form.linkedin} onChange={set("linkedin")}
                        placeholder="linkedin.com/in/yourprofile"
                        style={inputStyle()}
                        onFocus={e => (e.target.style.borderColor = "#0A0A0A")}
                        onBlur={e => (e.target.style.borderColor = "#E8E8E8")} />
                    </Field>
                    <Field label="Tell us about your best project">
                      <textarea
                        value={form.project} onChange={set("project")}
                        placeholder="What did you build, what was your role, and what impact did it have?"
                        rows={4}
                        style={{ ...inputStyle(), resize: "none", height: 120 }}
                        onFocus={e => (e.target.style.borderColor = "#0A0A0A")}
                        onBlur={e => (e.target.style.borderColor = "#E8E8E8")}
                      />
                    </Field>
                    <Field label="What kind of environment do you thrive in?">
                      <PillToggle
                        options={["Early-stage startup", "Growth-stage startup", "Scale-up", "Any"]}
                        value={form.environment}
                        onChange={setPill("environment")}
                      />
                    </Field>
                    <div className="flex items-center justify-between mt-1">
                      <BackBtn onClick={() => { setErrors({}); setStep(1); }} />
                      <NextBtn onClick={handleNext} />
                    </div>
                  </div>
                )}

                {/* Step 3 */}
                {step === 3 && (
                  <div className="flex flex-col gap-5">
                    <Field label="Current Status" error={errors.status}>
                      <PillToggle
                        options={["Open to opportunities", "Actively looking", "Employed but open", "Not currently looking"]}
                        value={form.status}
                        onChange={setPill("status")}
                      />
                      {errors.status && <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#E05050" }}>{errors.status}</span>}
                    </Field>
                    <Field label="Availability to start">
                      <div className="relative">
                        <select
                          value={form.availability} onChange={set("availability")}
                          style={{ ...inputStyle(), appearance: "none", WebkitAppearance: "none", paddingRight: 40, cursor: "pointer" }}
                          onFocus={e => (e.target.style.borderColor = "#0A0A0A")}
                          onBlur={e => (e.target.style.borderColor = "#E8E8E8")}
                        >
                          {AVAILABILITY.map(a => <option key={a}>{a}</option>)}
                        </select>
                        <svg className="absolute pointer-events-none" style={{ right: 14, top: "50%", transform: "translateY(-50%)" }} width="12" height="8" viewBox="0 0 12 8" fill="none">
                          <path d="M1 1.5L6 6.5L11 1.5" stroke="#6B6B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </Field>
                    <Field label="Preferred work type">
                      <PillToggle
                        options={["Full-time", "Contract", "Either"]}
                        value={form.workType}
                        onChange={setPill("workType")}
                      />
                    </Field>
                    <Field label="Salary expectation">
                      <input value={form.salary} onChange={set("salary")}
                        placeholder="e.g. £70,000–£90,000 or $120k+"
                        style={inputStyle()}
                        onFocus={e => (e.target.style.borderColor = "#0A0A0A")}
                        onBlur={e => (e.target.style.borderColor = "#E8E8E8")} />
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#6B6B6B" }}>
                        This stays confidential. It helps us match you to the right roles.
                      </span>
                    </Field>
                    <Field label="Anything else you want us to know?">
                      <textarea
                        value={form.notes} onChange={set("notes")}
                        placeholder="Optional — previous companies, what you're looking for in your next role, anything relevant."
                        rows={3}
                        style={{ ...inputStyle(), resize: "none", height: 80 }}
                        onFocus={e => (e.target.style.borderColor = "#0A0A0A")}
                        onBlur={e => (e.target.style.borderColor = "#E8E8E8")}
                      />
                    </Field>
                    <div className="flex items-center justify-between mt-1">
                      <BackBtn onClick={() => { setErrors({}); setStep(2); }} />
                      <button
                        type="button" onClick={handleSubmit}
                        className="cursor-pointer transition-all duration-200"
                        style={{
                          background: "#1A7A4A", color: "#FFFFFF", borderRadius: 10,
                          padding: "14px 28px", fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 15,
                          border: "none",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#155E39")}
                        onMouseLeave={e => (e.currentTarget.style.background = "#1A7A4A")}
                      >
                        Submit Application
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Submission success state */
              <div className="flex flex-col items-center py-4">
                <div style={{ animation: "pulse-mark 2s ease infinite" }}>
                  <BridgixMark size={48} />
                </div>
                <h2 className="mt-5 text-[22px] font-semibold text-[#0A0A0A] text-center" style={{ letterSpacing: "-0.02em" }}>
                  Application received.
                </h2>
                <p className="mt-3 text-[14px] text-[#6B6B6B] text-center leading-[1.7]" style={{ maxWidth: 380 }}>
                  We review every application personally. If you're a fit for our network, you'll hear from us within 48 hours.
                </p>
                <div className="w-full h-px bg-[#F0F0EE] my-6" />
                <p className="text-[13px] text-[#6B6B6B] text-center">
                  Questions?{" "}
                  <a href="mailto:hareem@bridgix.org" className="text-[#1A7A4A] underline underline-offset-2">
                    hareem@bridgix.org
                  </a>
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function NextBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button" onClick={onClick}
      className="cursor-pointer transition-all duration-200"
      style={{
        background: "#0A0A0A", color: "#FFFFFF", borderRadius: 10,
        padding: "14px 28px", fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 15,
        border: "none", width: "auto",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "#1A7A4A")}
      onMouseLeave={e => (e.currentTarget.style.background = "#0A0A0A")}
    >
      Continue →
    </button>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button" onClick={onClick}
      style={{
        background: "none", border: "none", fontFamily: "Inter, sans-serif",
        fontSize: 13, color: "#6B6B6B", cursor: "pointer", padding: 0,
      }}
    >
      ← Back
    </button>
  );
}
