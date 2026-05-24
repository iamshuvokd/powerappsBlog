import { useQuery } from "@tanstack/react-query";
import { fetchPosts, fetchTags } from "@/lib/api";
import { toArticle } from "@/lib/adapters";

// All published articles, adapted to the card shape. Client-side search/filter
// is then applied by the existing components (preserves current UX).
export function useArticles() {
  return useQuery({
    queryKey: ["articles"],
    queryFn: async () => {
      const data = await fetchPosts({ pageSize: 100 });
      return data.posts.map(toArticle);
    },
    staleTime: 60_000,
  });
}

export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => (await fetchTags()).tags,
    staleTime: 60_000,
  });
}
