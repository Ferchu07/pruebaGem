import { CompanyOption } from "./types";

export function toYmd(d: any): string | undefined {
  if (d == null) return undefined;
  if (d instanceof Date) return d.toISOString().split("T")[0];
  if (typeof d === "string") return d.includes("T") ? d.split("T")[0] : d;
  return String(d);
}

export const normalizeText = (value: string): string =>
  (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();

export const mapCompanyOptionsFromAuthCompanies = (companies: any[] | null | undefined): CompanyOption[] => {
  if (!Array.isArray(companies)) return [];

  const uniqueCompanies = new Map<string, CompanyOption>();
  for (const rawCompany of companies) {
    const company = rawCompany?.company ?? rawCompany;
    const companyId = company?.id ?? null;
    if (!companyId) continue;

    const companyName = company?.name ?? `Empresa ${companyId}`;
    const companyCif = company?.cif ?? null;
    const label = companyCif ? `${companyName} - ${companyCif}` : companyName;

    if (!uniqueCompanies.has(String(companyId))) {
      uniqueCompanies.set(String(companyId), {
        value: String(companyId),
        label,
      });
    }
  }

  return Array.from(uniqueCompanies.values());
};

export const resolveUserId = (user: any): string | null => {
  const rawId = user?.id ?? user?.userId ?? user?.user?.id ?? null;
  if (rawId === null || rawId === undefined) return null;
  const parsedId = String(rawId).trim();
  return parsedId !== "" ? parsedId : null;
};

export const resolveCompanyId = (company: any): string | null => {
  const rawId = company?.id ?? company?.company?.id ?? company?.companyId ?? company ?? null;
  if (rawId === null || rawId === undefined) return null;
  const parsedId = String(rawId).trim();
  return parsedId !== "" ? parsedId : null;
};

export const userBelongsToCompany = (user: any, companyId: string | null): boolean => {
  if (!companyId) return true;

  const normalizedCompanyId = String(companyId);
  const directCompanyId = resolveCompanyId(user?.company ?? user?.companyId ?? user?.loggedCompany);
  if (directCompanyId === normalizedCompanyId) return true;

  const candidateCollections = [user?.companies, user?.userCompanies, user?.roles, user?.userRoles];
  for (const collection of candidateCollections) {
    if (!Array.isArray(collection)) continue;
    const hasCompany = collection.some((item: any) => {
      const companyInItem = item?.company ?? item;
      return resolveCompanyId(companyInItem) === normalizedCompanyId;
    });
    if (hasCompany) return true;
  }

  return false;
};

