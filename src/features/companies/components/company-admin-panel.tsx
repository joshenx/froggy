"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createCompany, uploadCompanyLogo } from "@/lib/mvp/client";
import type { Company } from "@/lib/mvp/types";

type CompanyAdminPanelProps = {
  companies: Company[];
};

export default function CompanyAdminPanel({ companies }: CompanyAdminPanelProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: async () => {
      const result = await createCompany({
        name,
        website,
      });

      if (logoFile) {
        await uploadCompanyLogo(result.companyId, logoFile);
      }

      return result;
    },
    onSuccess: () => {
      setName("");
      setWebsite("");
      setLogoFile(null);
      setMessage("Company saved to the reference catalog.");
      router.refresh();
    },
    onError: (error) => {
      setMessage(error.message);
    },
  });

  const logoMutation = useMutation({
    mutationFn: ({ companyId, file }: { companyId: string; file: File }) =>
      uploadCompanyLogo(companyId, file),
    onSuccess: () => {
      setMessage("Logo updated.");
      router.refresh();
    },
    onError: (error) => {
      setMessage(error.message);
    },
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <section
        className="rounded-[20px] border p-6"
        style={{ borderColor: "var(--line)", background: "var(--paper)" }}
      >
        <h2 className="text-[18px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>
          Add reference company
        </h2>
        <p className="mt-2 text-[13.5px]" style={{ color: "var(--muted)" }}>
          Questions can tag one or more companies. Logos are stored in the Supabase bucket when it
          is configured, with a local data-url fallback during development.
        </p>

        <form
          className="mt-5 grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            setMessage(null);
            createMutation.mutate();
          }}
        >
          <label className="grid gap-2 text-sm font-semibold">
            Company name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-12 rounded-2xl border px-4 outline-none"
              style={{ borderColor: "var(--line)", background: "var(--paper)" }}
              placeholder="e.g. Stripe"
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Website
            <input
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              className="h-12 rounded-2xl border px-4 outline-none"
              style={{ borderColor: "var(--line)", background: "var(--paper)" }}
              placeholder="https://company.com"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Logo
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)}
              className="rounded-2xl border px-4 py-3"
              style={{ borderColor: "var(--line)", background: "var(--paper)" }}
            />
          </label>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex h-12 items-center justify-center rounded-full px-5 text-sm font-semibold"
            style={{ background: "var(--moss)", color: "var(--paper)" }}
          >
            {createMutation.isPending ? "Saving..." : "Add company"}
          </button>
          {message ? (
            <p
              className="text-sm font-medium"
              style={{ color: createMutation.isError || logoMutation.isError ? "#8b2f1b" : "var(--moss)" }}
            >
              {message}
            </p>
          ) : null}
        </form>
      </section>

      <section
        className="rounded-[20px] border p-6"
        style={{ borderColor: "var(--line)", background: "var(--paper)" }}
      >
        <h2 className="text-[18px] font-semibold" style={{ fontFamily: "var(--font-display)" }}>
          Company catalog
        </h2>
        <div className="mt-5 grid gap-4">
          {companies.map((company) => (
            <div
              key={company.id}
              className="flex flex-col gap-4 rounded-[18px] border p-4 sm:flex-row sm:items-center sm:justify-between"
              style={{ borderColor: "var(--line)", background: "rgba(220,231,213,0.18)" }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="grid h-12 w-12 place-items-center rounded-[14px] border bg-white"
                  style={{ borderColor: "var(--line)" }}
                >
                  {company.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={company.logoUrl} alt={`${company.name} logo`} className="max-h-8 max-w-8 object-contain" />
                  ) : (
                    <span className="text-xs font-semibold">{company.name.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold">{company.name}</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    {company.website || company.slug}
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-3 text-sm font-medium">
                <span>Replace logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) {
                      return;
                    }
                    setMessage(null);
                    logoMutation.mutate({ companyId: company.id, file });
                    event.target.value = "";
                  }}
                />
              </label>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
