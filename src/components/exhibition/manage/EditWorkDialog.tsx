'use client';

import WorkDialog from './WorkDialog';
import { ArtworkWithEmail } from '@/app/(exhibitions)/exhibitions/[id]/manage/page';

interface EditWorkDialogProps {
  work: ArtworkWithEmail;
}

export default function EditWorkDialog({ work }: EditWorkDialogProps) {
  return <WorkDialog mode="edit" work={work} />;
}
