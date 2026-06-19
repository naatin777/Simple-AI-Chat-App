import { useShallow } from "zustand/react/shallow";

import { useDirectorySelectionStore } from "@/stores/directory-selection-store";

export function useDirectorySelection() {
  return useDirectorySelectionStore(
    useShallow((state) => ({
      items: state.items,
      checkedFileKeys: state.checkedFileKeys,
      referenceInput: state.referenceInput,
      isManualSelection: state.isManualSelection,
      registerItem: state.registerItem,
      unregisterDirectory: state.unregisterDirectory,
      setFileChecked: state.setFileChecked,
      setDirectoryFilesChecked: state.setDirectoryFilesChecked,
      setRootDirectoryFilesChecked: state.setRootDirectoryFilesChecked,
      registerDirectoryFiles: state.registerDirectoryFiles,
      registerSubtreeFiles: state.registerSubtreeFiles,
      applyAutocompleteSelection: state.applyAutocompleteSelection,
      applySlashCommand: state.applySlashCommand,
      isFileChecked: state.isFileChecked,
      getDirectoryCheckboxState: state.getDirectoryCheckboxState,
      getRootCheckboxState: state.getRootCheckboxState,
      applyInputReferences: state.applyInputReferences,
      syncAutomaticSelection: state.syncAutomaticSelection,
      reset: state.reset,
    })),
  );
}
