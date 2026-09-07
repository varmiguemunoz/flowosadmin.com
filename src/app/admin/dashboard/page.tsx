import type { Metadata } from "next";

import { UploadDropzone } from "@/components/admin/uploadDropzone";
import { DocumentGrid, type DocumentItem } from "@/components/admin/documentGrid";

export const metadata: Metadata = {
  title: "Knowledge base · TaoFlow Admin",
};

/**
 * DESIGN-ONLY placeholder data. Replace with a BFF query
 * (GET /api/bff/knowledge/documents) later.
 */
const SAMPLE_DOCUMENTS: DocumentItem[] = [
  { id: "1", name: "Meditation fundamentals.pdf", size: "1.2 MB", uploadedAt: "Sep 2", status: "indexed" },
  { id: "2", name: "Breathwork techniques and guided scripts.pdf", size: "3.8 MB", uploadedAt: "Sep 2", status: "indexed" },
  { id: "3", name: "Anxiety coaching playbook.pdf", size: "820 KB", uploadedAt: "Aug 30", status: "processing" },
  { id: "4", name: "Sleep and rest protocols.pdf", size: "2.1 MB", uploadedAt: "Aug 28", status: "indexed" },
  { id: "5", name: "Emotional check-in taxonomy.pdf", size: "540 KB", uploadedAt: "Aug 25", status: "indexed" },
  { id: "6", name: "Mindfulness sources (draft).pdf", size: "4.5 MB", uploadedAt: "Aug 24", status: "failed" },
];

export default function DashboardPage() {
  const documents = SAMPLE_DOCUMENTS;

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Knowledge base
          </h1>
          <p className="text-sm text-ink-muted">
            Upload and manage the documents that ground the TaoFlow agent.
          </p>
        </div>
        <UploadDropzone />
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex items-baseline justify-between border-b border-line pb-3">
          <h2 className="text-sm font-medium text-ink">Documents</h2>
          <span className="microlabel tabular">
            {documents.length} total
          </span>
        </div>
        <DocumentGrid documents={documents} />
      </section>
    </div>
  );
}
