import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";

interface FindEngineerChoiceModalProps {
  open: boolean;
  onClose: () => void;
  onChooseForm: () => void;
  onChooseChat: () => void;
}

export function FindEngineerChoiceModal({ open, onClose, onChooseForm, onChooseChat }: FindEngineerChoiceModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-6"
          style={{ background: "rgba(10, 10, 10, 0.42)", backdropFilter: "blur(6px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full max-w-[760px] rounded-[28px] border border-[#ECEBE7] bg-white p-6 shadow-[0_20px_80px_rgba(0,0,0,0.16)] md:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1A7A4A]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Start here
                </p>
                <h2 className="text-[clamp(24px,2.4vw,32px)] font-medium tracking-[-0.03em] text-[#0A0A0A]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Find your engineer
                </h2>
                <p className="mt-2 max-w-[560px] text-[14px] leading-[1.65] text-[#6B6B6B]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Pick the path that feels most natural for you.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E8E8E8] bg-white text-[#6B6B6B] transition-colors duration-200 hover:border-[#0A0A0A] hover:text-[#0A0A0A]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  onChooseForm();
                  onClose();
                }}
                className="group rounded-[20px] border border-[#E8E8E8] bg-[#FAFAF8] p-6 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#1A7A4A] hover:shadow-[0_16px_40px_rgba(26,122,74,0.12)]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#1A7A4A] text-white">
                  <span className="text-[14px] font-semibold">1</span>
                </div>
                <h3 className="text-[18px] font-medium tracking-[-0.02em] text-[#0A0A0A]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Fill out a form
                </h3>
                <p className="mt-2 text-[14px] leading-[1.6] text-[#6B6B6B]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Answer a few quick questions at your own pace.
                </p>
                <div className="mt-5 inline-flex items-center gap-2 text-[13px] font-medium text-[#1A7A4A]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Continue
                  <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onChooseChat();
                  onClose();
                }}
                className="group rounded-[20px] border border-[#E8E8E8] bg-[#FFFFFF] p-6 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#1A7A4A] hover:shadow-[0_16px_40px_rgba(26,122,74,0.12)]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#0A0A0A] text-white">
                  <span className="text-[14px] font-semibold">2</span>
                </div>
                <h3 className="text-[18px] font-medium tracking-[-0.02em] text-[#0A0A0A]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Talk it through with us
                </h3>
                <p className="mt-2 text-[14px] leading-[1.6] text-[#6B6B6B]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Have a live conversation and we'll figure out the details together.
                </p>
                <div className="mt-5 inline-flex items-center gap-2 text-[13px] font-medium text-[#1A7A4A]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Continue
                  <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </div>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
