"use client";

import { useRef, useState } from "react";
import { FiUploadCloud } from "react-icons/fi";

/**
 * Upload dropzone — DESIGN-ONLY. Shows the default and drag-over states and
 * opens the file picker, but does not process files yet. Wire the actual
 * upload to the BFF later.
 */
export function UploadDropzone() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function openPicker() {
    inputRef.current?.click();
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload documents"
      onClick={openPicker}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openPicker();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        // Design-only: files are intentionally not handled yet.
      }}
      className={
        "group flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border border-dashed px-6 py-14 text-center transition-colors duration-150 " +
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/70 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas " +
        (dragging
          ? "border-signal bg-signal/5"
          : "border-line-strong hover:border-signal/60 hover:bg-surface/40")
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
          drag documents here
        </p>
        <p className="font-mono text-[0.6875rem] tracking-wide text-ink-faint">
          PDF · up to 25 MB each · multiple allowed
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="application/pdf"
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}
