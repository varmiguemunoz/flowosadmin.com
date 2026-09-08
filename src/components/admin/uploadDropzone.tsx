"use client";

import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FiUploadCloud, FiFileText, FiX } from "react-icons/fi";

import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { knowledgeKeys, uploadDocument } from "@/lib/knowledge-api";
import {
  formatBytes,
  validateUploadFile,
  MAX_UPLOAD_MB,
} from "@/lib/knowledge-types";

export function UploadDropzone() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [dragging, setDragging] = useState(false);
  const [staged, setStaged] = useState<File | null>(null);
  const [rejected, setRejected] = useState<string | null>(null);

  // 0 to 1, or null when no upload is running. The file goes straight to
  // storage and can be 50 MB, so silence here reads as a hung page.
  const [progress, setProgress] = useState<number | null>(null);

  const upload = useMutation({
    mutationFn: (file: File) => uploadDocument(file, setProgress),
    onMutate: () => setProgress(0),
    onSettled: () => {
      setProgress(null);
      void queryClient.invalidateQueries({
        queryKey: knowledgeKeys.documents(),
      });
    },
    onSuccess: () => {
      setStaged(null);
      setRejected(null);
    },
  });

  function selectFile(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    // Only one document at a time — take the first file and ignore the rest.
    const file = fileList[0];
    const error = validateUploadFile(file);
    if (error) {
      setRejected(`${file.name} — ${error}`);
      setStaged(null);
      return;
    }

    setRejected(null);
    setStaged(file);
  }

  function openPicker() {
    inputRef.current?.click();
  }

  const uploading = upload.isPending;

  return (
    <div className="flex flex-col gap-4">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload a document"
        aria-disabled={uploading || undefined}
        onClick={() => {
          if (!uploading) openPicker();
        }}
        onKeyDown={(e) => {
          if (uploading) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!uploading) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!uploading) selectFile(e.dataTransfer.files);
        }}
        className={
          "group flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed px-6 py-14 text-center transition-colors duration-150 " +
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/70 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas " +
          (uploading
            ? "cursor-not-allowed border-line-strong opacity-60"
            : "cursor-pointer " +
              (dragging
                ? "border-signal bg-signal/5"
                : "border-line-strong hover:border-signal/60 hover:bg-surface/40"))
        }
      >
        <span
          aria-hidden="true"
          className={
            "grid size-12 place-items-center rounded-full border transition-colors duration-150 " +
            (dragging
              ? "border-signal/40 text-signal"
              : "border-line-strong text-ink-muted group-hover:text-signal")
          }
        >
          <FiUploadCloud className="size-6" />
        </span>

        <div className="flex flex-col gap-1">
          <p className="text-sm text-ink">
            <span className="font-medium text-signal">Click to browse</span> or
            drag a document here
          </p>
          <p className="font-mono text-[0.6875rem] tracking-wide text-ink-faint">
            PDF · up to {MAX_UPLOAD_MB} MB · one at a time
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            selectFile(e.target.files);
            // Reset so selecting the same file again re-triggers onChange.
            e.target.value = "";
          }}
        />
      </div>

      {rejected ? <Alert tone="danger">{rejected}</Alert> : null}

      {upload.isError ? (
        <Alert tone="danger">
          {upload.error instanceof Error
            ? upload.error.message
            : "The upload could not be completed."}
        </Alert>
      ) : null}

      {staged ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 rounded-2xl border border-line px-4 py-3">
            <span
              aria-hidden="true"
              className="grid size-8 shrink-0 place-items-center rounded-lg border border-line-strong text-ink-muted"
            >
              <FiFileText className="size-4" />
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm text-ink" title={staged.name}>
                {staged.name}
              </span>
              <span className="font-mono text-[0.6875rem] tracking-wide text-ink-faint tabular">
                {formatBytes(staged.size)}
              </span>
            </div>
            <button
              type="button"
              aria-label={`Remove ${staged.name}`}
              disabled={uploading}
              onClick={() => setStaged(null)}
              className="ml-auto grid size-7 shrink-0 place-items-center rounded-full border border-line-strong text-ink-muted transition-colors hover:border-danger/50 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/70 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiX className="size-4" aria-hidden="true" />
            </button>
          </div>

          {uploading ? <UploadProgress value={progress} /> : null}

          <div className="flex items-center justify-end">
            <div className="w-40">
              <Button
                type="button"
                loading={uploading}
                onClick={() => upload.mutate(staged)}
              >
                {uploading ? "Uploading…" : "Upload"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Upload progress. `value` is null while the file is being hashed and while the
 * server is being asked to index it — neither reports progress, so the bar is
 * indeterminate then rather than falsely sitting at 0 or 100.
 */
function UploadProgress({ value }: { value: number | null }) {
  const percent = value === null ? null : Math.round(value * 100);
  const complete = percent === 100;

  return (
    <div className="flex flex-col gap-2">
      <div
        role="progressbar"
        aria-label="Upload progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent ?? undefined}
        className="h-1 w-full overflow-hidden rounded-full bg-line"
      >
        <div
          className={
            "h-full rounded-full bg-signal transition-[width] duration-200 " +
            (percent === null ? "w-1/3 animate-pulse" : "")
          }
          style={percent === null ? undefined : { width: `${percent}%` }}
        />
      </div>
      <span className="font-mono text-[0.6875rem] tracking-wide text-ink-faint tabular">
        {percent === null
          ? "Preparing…"
          : complete
            ? "Indexing…"
            : `${percent}%`}
      </span>
    </div>
  );
}
