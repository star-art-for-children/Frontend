'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Check, Copy, Share2 } from 'lucide-react';
import { DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import AppDialog from '@/components/shared/AppDialog';

interface ShareDialogProps {
  exhibitionId: string;
  title: string;
}

export default function ShareDialog({ exhibitionId, title }: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // window는 클라이언트에서만 접근 가능하므로 열리는 시점에 URL 생성
  const handleOpenChange = (v: boolean) => {
    if (v) setShareUrl(`${window.location.origin}/exhibitions/${exhibitionId}`);
    setOpen(v);
  };

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Clipboard API는 보안 컨텍스트(HTTPS/localhost) 전용이라
        // HTTP(로컬 IP 접속 등) 환경에서는 구식 방식으로 복사
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      setCopied(true);
    } catch (e) {
      console.error('clipboard copy fail', e);
    }
  };

  const trigger = (
    <DialogTrigger
      render={
        <Button
          size="lg"
          className="text-secondary/60 hover:bg-primary/20 rounded-xl bg-[#FAF7F2] transition-colors"
        />
      }
    >
      <Share2 className="h-4 w-4" />
      공유
    </DialogTrigger>
  );

  return (
    <AppDialog
      open={open}
      onOpenChange={handleOpenChange}
      trigger={trigger}
      title="전시회 공유하기"
      className="max-w-sm"
    >
      <div className="flex flex-col items-center gap-5 py-2">
        <p className="text-secondary/60 text-center text-sm">
          QR코드를 스캔하거나 링크를 복사해
          <br />
          <span className="text-secondary font-semibold">{title}</span> 전시회를
          공유해보세요!
        </p>

        {/* QR코드 */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_1px_4px_rgba(44,40,38,0.06)]">
          {shareUrl && <QRCodeSVG value={shareUrl} size={160} marginSize={1} />}
        </div>

        {/* 링크 복사 */}
        <div className="flex w-full items-center gap-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="text-secondary/70 bg-surface w-full truncate rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none"
          />
          <Button
            onClick={handleCopy}
            className="shrink-0 rounded-xl px-4 py-2.5"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                복사됨
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                복사
              </>
            )}
          </Button>
        </div>
      </div>
    </AppDialog>
  );
}
