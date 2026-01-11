import { CheatSheetDrawer } from './CheatSheetDrawer';
import { ConsonantsCheatSheet } from './ConsonantsCheatSheet';

interface ConsonantsCheatSheetDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function ConsonantsCheatSheetDrawer({
  open,
  onClose,
}: ConsonantsCheatSheetDrawerProps) {
  return (
    <CheatSheetDrawer open={open} onClose={onClose} title="Consonants Cheat Sheet">
      <ConsonantsCheatSheet />
    </CheatSheetDrawer>
  );
}
