import {
  checkForUpdates,
  getBlogFiles,
  invalidateBlogFilesCache,
} from "@/lib/github";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useCheckBlogUpdates(interval = 900000) {
  // 15 minutes par défaut
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkUpdates = async () => {
      const hasUpdates = await checkForUpdates();
      if (hasUpdates) {
        invalidateBlogFilesCache();
        const updatedFiles = await getBlogFiles(true);
        queryClient.setQueryData(["blogFiles"], updatedFiles);
      }
    };

    const intervalId = setInterval(checkUpdates, interval);
    return () => clearInterval(intervalId);
  }, [queryClient, interval]);
}
