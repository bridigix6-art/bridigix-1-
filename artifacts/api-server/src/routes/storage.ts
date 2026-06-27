import { Router } from "express";
import { supabaseAdmin } from "../lib/supabase";
import { pool } from "@workspace/db";

const router = Router();

const BUCKET = "conversation-records";

// ─── Upload artifact (screenshot or PDF) ─────────────────────────────────────
// Accepts multipart/form-data with: file (binary), sessionId, type ("screenshot"|"pdf")
router.post("/upload-artifact", async (req, res) => {
  try {
    const { sessionId, type, dataUrl } = req.body as {
      sessionId?: string;
      type?: "screenshot" | "pdf";
      dataUrl?: string;
    };

    if (!sessionId || !type || !dataUrl) {
      res.status(400).json({ error: "sessionId, type, and dataUrl are required" });
      return;
    }

    if (type !== "screenshot" && type !== "pdf") {
      res.status(400).json({ error: "type must be 'screenshot' or 'pdf'" });
      return;
    }

    const isScreenshot = type === "screenshot";
    const mimeType = isScreenshot ? "image/png" : "application/pdf";
    const fileName = isScreenshot ? "screenshot.png" : "hiring-brief.pdf";
    const filePath = `${sessionId}/${fileName}`;

    // Parse base64 data URL → Buffer
    const base64Match = dataUrl.match(/^data:[^;]+;base64,(.+)$/);
    if (!base64Match) {
      res.status(400).json({ error: "dataUrl must be a valid base64 data URL" });
      return;
    }

    const buffer = Buffer.from(base64Match[1], "base64");

    // Validate minimum file sizes — reject blank/empty uploads
    const MIN_SIZES = { screenshot: 2000, pdf: 5000 };
    const minSize = isScreenshot ? MIN_SIZES.screenshot : MIN_SIZES.pdf;
    if (buffer.length < minSize) {
      req.log.warn({ type, size: buffer.length, minSize }, "Artifact rejected: below minimum size threshold");
      res.status(422).json({ error: `${isScreenshot ? "Screenshot" : "PDF"} content appears blank or incomplete (${buffer.length} bytes, minimum ${minSize}). Regenerate and retry.` });
      return;
    }

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      req.log.error({ error }, "Storage upload error");
      res.status(500).json({ error: "Upload failed", detail: error.message });
      return;
    }

    // Generate a signed URL valid for 10 years (max allowed ~315360000s ≈ 10yr)
    const { data: urlData, error: urlError } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrl(filePath, 315360000);

    if (urlError || !urlData?.signedUrl) {
      req.log.warn({ urlError }, "Could not generate signed URL");
      res.json({ ok: true, path: data.path, url: null });
      return;
    }

    res.json({ ok: true, path: data.path, url: urlData.signedUrl });
  } catch (err) {
    req.log.error({ err }, "Unexpected upload-artifact error");
    res.status(500).json({ error: "Upload failed" });
  }
});

// ─── Record completed intake (links sessionId → screenshot + PDF URLs) ────────
router.post("/complete-intake", async (req, res) => {
  try {
    const { sessionId, email, screenshotUrl, pdfUrl } = req.body as {
      sessionId?: string;
      email?: string;
      screenshotUrl?: string;
      pdfUrl?: string;
    };

    if (!sessionId) {
      res.status(400).json({ error: "sessionId is required" });
      return;
    }

    // Use raw SQL via the pg pool to bypass PostgREST schema cache issues
    await pool.query(
      `INSERT INTO completed_intakes (session_id, email, screenshot_url, pdf_url, stage, confirmed_at)
       VALUES ($1, $2, $3, $4, 'complete', NOW())
       ON CONFLICT (session_id) DO UPDATE SET
         email = EXCLUDED.email,
         screenshot_url = COALESCE(EXCLUDED.screenshot_url, completed_intakes.screenshot_url),
         pdf_url = COALESCE(EXCLUDED.pdf_url, completed_intakes.pdf_url),
         confirmed_at = NOW()`,
      [
        sessionId,
        email?.toLowerCase().trim() ?? null,
        screenshotUrl ?? null,
        pdfUrl ?? null,
      ]
    );

    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Unexpected complete-intake error");
    res.status(500).json({ error: "Failed to record intake" });
  }
});

export default router;
