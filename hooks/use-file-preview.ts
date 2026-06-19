import { useFilePreviewStore } from "@/stores/file-preview-store";

export function useFilePreview() {
  return useFilePreviewStore();
}
