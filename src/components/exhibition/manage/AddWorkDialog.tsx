'use client';

import WorkDialog from './WorkDialog';

interface AddWorkDialogProps {
  triggerLabel?: string;
  triggerClassName?: string;
}

export default function AddWorkDialog(props: AddWorkDialogProps) {
  return <WorkDialog mode="add" {...props} />;
}
