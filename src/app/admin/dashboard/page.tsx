import type { Metadata } from "next";

import { UploadDropzone } from "@/components/admin/uploadDropzone";
import { KnowledgeSection } from "@/components/admin/knowledgeSection";

export const metadata: Metadata = {
  title: "Knowledge base · TaoFlow Admin",
};

export default function DashboardPage() {
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

      <KnowledgeSection />
    </div>
  );
}
