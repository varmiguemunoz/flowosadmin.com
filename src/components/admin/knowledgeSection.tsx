"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { DocumentGrid } from "@/components/admin/documentGrid";
import { Alert } from "@/components/ui/alert";
import {
  deleteDocument,
  knowledgeKeys,
  listDocuments,
} from "@/lib/knowledge-api";
import { toDocumentItem } from "@/lib/knowledge-types";

export function KnowledgeSection() {
  const queryClient = useQueryClient();

  const documentsQuery = useQuery({
    queryKey: knowledgeKeys.documents(),
    queryFn: listDocuments,
  });

  const remove = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: knowledgeKeys.documents() }),
  });

  const documents = (documentsQuery.data?.items ?? []).map((row) =>
    toDocumentItem(row),
  );

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between border-b border-line pb-3">
        <h2 className="text-sm font-medium text-ink">Documents</h2>
        <span className="microlabel tabular">
          {/* isFetching, not isPending: a refetch of already-cached data leaves
              isPending false, so a retry would otherwise show no sign of life. */}
          {documentsQuery.isFetching
            ? "Loading"
            : `${documentsQuery.data?.total ?? documents.length} total`}
        </span>
      </div>

      {remove.isError ? (
        <Alert tone="danger">
          {remove.error instanceof Error
            ? remove.error.message
            : "The document could not be deleted."}
        </Alert>
      ) : null}

      {documentsQuery.isPending ? (
        <DocumentGridSkeleton />
      ) : documentsQuery.isError ? (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-line p-6">
          <Alert tone="danger">
            {documentsQuery.error instanceof Error
              ? documentsQuery.error.message
              : "The documents could not be loaded."}
          </Alert>
          <button
            type="button"
            onClick={() => void documentsQuery.refetch()}
            disabled={documentsQuery.isFetching}
            className="h-8 rounded-[var(--radius-control)] border border-line-strong px-3 text-xs text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/70 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {documentsQuery.isFetching ? "Retrying…" : "Try again"}
          </button>
        </div>
      ) : (
        <DocumentGrid
          documents={documents}
          onDelete={(id) => remove.mutate(id)}
          deletingId={remove.isPending ? remove.variables : null}
        />
      )}
    </section>
  );
}

/** Matches the real grid's shape so the layout does not jump on load. */
function DocumentGridSkeleton() {
  return (
    <ul
      aria-hidden="true"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {Array.from({ length: 4 }, (_, index) => (
        <li key={index}>
          <div className="h-[9.5rem] animate-pulse rounded-2xl border border-line bg-surface" />
        </li>
      ))}
    </ul>
  );
}
