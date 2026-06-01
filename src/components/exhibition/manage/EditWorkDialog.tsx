'use client';

import WorkDialog from './WorkDialog';
import { ArtworkWithEmail } from '@/types/artwork';

interface EditWorkDialogProps {
  work: ArtworkWithEmail;
}

export default function EditWorkDialog({ work }: EditWorkDialogProps) {
  return <WorkDialog mode="edit" work={work} />;
}
