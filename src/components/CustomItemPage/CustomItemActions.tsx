import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ActionCell } from './styles';

interface CustomItemActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  editLabel?: string;
  deleteLabel?: string;
}

export function CustomItemActions({
  onEdit,
  onDelete,
  editLabel = 'edit',
  deleteLabel = 'delete',
}: CustomItemActionsProps) {
  return (
    <ActionCell>
      <IconButton size="small" onClick={onEdit} aria-label={editLabel}>
        <EditIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        onClick={onDelete}
        aria-label={deleteLabel}
        sx={{ color: 'error.main' }}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </ActionCell>
  );
}
