import axiosInstance from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function usePrivateRoute() {
  return useQuery({
    queryKey: ["private-user"],
    queryFn: async () => {
      const res = await axiosInstance.get("/private");
      return res.data;
    },
    enabled: false,
  });
}
