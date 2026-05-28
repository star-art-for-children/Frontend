'use client';
import { useCallback, useRef, useState } from 'react';
import { downloadFile } from '@/lib/utils/downloadFile';

export const useImageDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const downloadingRef = useRef(false);

  const download = useCallback(async (url: string, filename: string) => {
    if (downloadingRef.current) return;
    downloadingRef.current = true;
    setIsDownloading(true);
    try {
      await downloadFile(url, filename);
    } finally {
      downloadingRef.current = false;
      setIsDownloading(false);
    }
  }, []);

  return { download, isDownloading };
};
