import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../api/axiosInstance";
import { saveCategory } from "./categoryApis";

export const useCategories = (params) => {
    console.log(params)
    return useQuery({
        queryKey: ["categories", params ],
        queryFn: async () => {
          const res = await api.get("/admin/categories", {
            params:{...params,limit:2},
          });
          return res.data;
        },
        keepPreviousData: true,
      });
}

export const useSaveCategoryMutation = ()=>{
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn:saveCategory,
    onSuccess:()=>{
      queryClient.invalidateQueries(["categories"])
    }
  })
}