import { trpc } from "@/providers/trpc";
import { useCallback, useMemo } from "react";

export function useAuth() {
  const utils = trpc.useUtils();

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = trpc.auth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      localStorage.removeItem("alshifa_token");
      await utils.invalidate();
      window.location.reload();
    },
  });

  const logout = useCallback(() => {
    localStorage.removeItem("alshifa_token");
    logoutMutation.mutate();
    window.location.reload();
  }, [logoutMutation]);

  return useMemo(
    () => ({
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role as "admin" | "receptionist" | "lab_tech",
            phone: user.phone,
          }
        : null,
      isAuthenticated: !!user,
      isLoading: isLoading || logoutMutation.isPending,
      isAdmin: user?.role === "admin",
      isReceptionist: user?.role === "admin" || user?.role === "receptionist",
      isLabTech: user?.role === "admin" || user?.role === "lab_tech",
      error,
      logout,
      refresh: refetch,
    }),
    [user, isLoading, logoutMutation.isPending, error, logout, refetch],
  );
}
