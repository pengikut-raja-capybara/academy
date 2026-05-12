import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchModuleDetail } from "../features/learning/learningSlice";

/**
 * Hook to automatically fetch details (lessons) for modules that don't have them yet.
 * Used in Dashboard and Modules list to ensure progress calculation works.
 */
export function useModulePreloader() {
  const dispatch = useAppDispatch();
  const { allModules, status } = useAppSelector((state) => state.learning);

  useEffect(() => {
    // Only pre-load if we have modules but they might be missing lessons
    if (status === 'succeeded' || allModules.length > 0) {
      allModules.forEach((mod) => {
        if (!mod.lessons || mod.lessons.length === 0) {
          dispatch(fetchModuleDetail(mod.slug));
        }
      });
    }
  }, [allModules, status, dispatch]);
}
