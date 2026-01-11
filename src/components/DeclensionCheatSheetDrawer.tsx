import { CheatSheetDrawer } from './CheatSheetDrawer';
import { DeclensionCheatSheet } from './DeclensionCheatSheet';
import { allTables } from '../data/declensionPatterns';

interface DeclensionCheatSheetDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function DeclensionCheatSheetDrawer({
  open,
  onClose,
}: DeclensionCheatSheetDrawerProps) {
  return (
    <CheatSheetDrawer open={open} onClose={onClose} title="Declension Cheat Sheet">
      <DeclensionCheatSheet tables={allTables} />
    </CheatSheetDrawer>
  );
}
