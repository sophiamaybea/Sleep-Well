import { useQuery } from "@tanstack/react-query";

interface SiteContentRow {
  id: string;
  pageKey: string;
  sectionKey: string;
  content: string;
  contentType: string;
  label: string;
  groupLabel: string | null;
  sortOrder: number | null;
  updatedBy: string | null;
  updatedAt: string | null;
  createdAt: string | null;
}

export function useSiteContent(pageKey: string) {
  const { data, isLoading } = useQuery<SiteContentRow[]>({
    queryKey: ["/api/site-content", pageKey],
    queryFn: async () => {
      const res = await fetch(`/api/site-content/${pageKey}`);
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const getContent = (sectionKey: string, fallback: string): string => {
    if (!data) return fallback;
    const row = data.find((r) => r.sectionKey === sectionKey);
    return row?.content ?? fallback;
  };

  return { getContent, isLoading, data };
}
