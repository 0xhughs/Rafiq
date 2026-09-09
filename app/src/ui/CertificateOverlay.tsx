import { useEffect, useRef } from 'react';
import {
  CAMPAIGN_VERSION,
  CERTIFICATE_BODY,
  CERTIFICATE_DATE_LINE,
  CERTIFICATE_DISCLAIMER,
  CERTIFICATE_INVITE,
  CERTIFICATE_TITLE,
  PASSPORT_PDF_NAME,
  PASSPORT_PNG_NAME,
  certificateLines,
} from '../engine/passport';
import { wrapPngInPdf } from '../engine/pdf';
import { PRODUCT_TITLE } from '../engine/constants';
import type { GameState } from '../engine/types';

interface Props {
  state: GameState;
  onConfirmName: () => void;
  onDownload: (format: 'png' | 'pdf') => void;
  onDownloadFail: () => void;
  onExam: () => void;
  onPercent: () => void;
  onVerifyPublic: () => void;
  onRegistry: () => void;
  onLegacy: () => void;
  onNetwork: () => void;
  onRobotDone: () => void;
  onClose: () => void;
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function drawCertificate(canvas: HTMLCanvasElement, playerName: string): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const width = canvas.width;
  const height = canvas.height;
  ctx.fillStyle = '#f4e6d4';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#2f5d62';
  ctx.lineWidth = 10;
  ctx.strokeRect(28, 28, width - 56, height - 56);
  ctx.strokeStyle = '#c45c26';
  ctx.lineWidth = 2;
  ctx.strokeRect(44, 44, width - 88, height - 88);
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#241c18';
  const lines = certificateLines(playerName);
  const sizes = [36, 22, 32, 18, 18, 18, 16];
  let y = 130;
  lines.forEach((line, index) => {
    const fontSize = sizes[index] ?? 18;
    const family =
      index === 0 || index === 2
        ? '"Noto Naskh Arabic", "Cairo", serif'
        : '"Cairo", "Noto Naskh Arabic", sans-serif';
    ctx.font = `${index === 0 || index === 2 ? 700 : 600} ${fontSize}px ${family}`;
    const maxWidth = width - 140;
    const words = line.split(' ');
    let row = '';
    for (const word of words) {
      const next = row ? `${row} ${word}` : word;
      if (ctx.measureText(next).width > maxWidth && row) {
        ctx.fillText(row, width / 2, y);
        y += fontSize + 10;
        row = word;
      } else {
        row = next;
      }
    }
    if (row) {
      ctx.fillText(row, width / 2, y);
      y += fontSize + 22;
    }
  });
}

export function CertificateOverlay({
  state,
  onConfirmName,
  onDownload,
  onDownloadFail,
  onExam,
  onPercent,
  onVerifyPublic,
  onRegistry,
  onLegacy,
  onNetwork,
  onRobotDone,
  onClose,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerName = state.playerName;
  const feedback = state.shopFeedback ?? state.passportQuest.downloadError;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const paint = () => drawCertificate(canvas, playerName);
    if (document.fonts?.ready) {
      void document.fonts.ready.then(paint);
    }
    paint();
  }, [playerName]);

  const downloadPng = () => {
    if (!state.passportQuest.nameConfirmed) {
      onDownload('png');
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) {
      onDownloadFail();
      return;
    }
    canvas.toBlob((blob) => {
      if (!blob) {
        onDownloadFail();
        return;
      }
      triggerDownload(blob, PASSPORT_PNG_NAME);
      onDownload('png');
    }, 'image/png');
  };

  const downloadPdf = () => {
    if (!state.passportQuest.nameConfirmed) {
      onDownload('pdf');
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) {
      onDownloadFail();
      return;
    }
    canvas.toBlob((blob) => {
      void (async () => {
        if (!blob) {
          onDownloadFail();
          return;
        }
        const png = new Uint8Array(await blob.arrayBuffer());
        const pdf = wrapPngInPdf(png, playerName, certificateLines(playerName));
        const copy = new Uint8Array(pdf.byteLength);
        copy.set(pdf);
        triggerDownload(new Blob([copy], { type: 'application/pdf' }), PASSPORT_PDF_NAME);
        onDownload('pdf');
      })();
    }, 'image/png');
  };

  return (
    <div className="overlay" data-testid="certificate" role="dialog" aria-modal="true" dir="rtl">
      <article className="paper-card instruction-card certificate-card">
        <p className="card-stamp" data-testid="certificate-invite">
          {CERTIFICATE_INVITE}
        </p>
        <h2 data-testid="certificate-title">{CERTIFICATE_TITLE}</h2>
        <p className="card-note" data-testid="certificate-product">
          {PRODUCT_TITLE}
        </p>
        <p className="certificate-name" data-testid="certificate-name">
          {playerName}
        </p>
        <p className="card-note" data-testid="certificate-body">
          {CERTIFICATE_BODY}
        </p>
        <p className="card-note" data-testid="certificate-version">
          إصدار الحملة:{' '}
          <span className="path-ltr" dir="ltr">
            {CAMPAIGN_VERSION}
          </span>
        </p>
        <p className="card-note" data-testid="certificate-date">
          {CERTIFICATE_DATE_LINE}
        </p>
        <p className="card-note" data-testid="certificate-disclaimer">
          {CERTIFICATE_DISCLAIMER}
        </p>
        <canvas
          ref={canvasRef}
          className="certificate-preview"
          data-testid="certificate-preview"
          width={960}
          height={640}
        />
        {feedback ? (
          <p className="parcel-fail" data-testid="certificate-feedback" role="status">
            {feedback}
          </p>
        ) : null}
        <div className="button-row wrap-choices">
          <button
            type="button"
            className="primary"
            data-testid="certificate-confirm-name"
            onClick={onConfirmName}
          >
            أكّد الاسم على الجواز
          </button>
          <button type="button" className="ghost" data-testid="certificate-download-png" onClick={downloadPng}>
            نزّل صورة PNG
          </button>
          <button type="button" className="ghost" data-testid="certificate-download-pdf" onClick={downloadPdf}>
            نزّل ملف PDF
          </button>
        </div>
        <div className="button-row wrap-choices">
          <button type="button" className="ghost" data-testid="certificate-exam" onClick={onExam}>
            ابدأ الامتحان الموقوت
          </button>
          <button type="button" className="ghost" data-testid="certificate-percent" onClick={onPercent}>
            أظهر نسبة ٩٧٪
          </button>
          <button
            type="button"
            className="ghost"
            data-testid="certificate-verify-public"
            onClick={onVerifyPublic}
          >
            أضف علامة تحقق عامة
          </button>
          <button type="button" className="ghost" data-testid="certificate-registry" onClick={onRegistry}>
            انشر الاسم في السجل العام
          </button>
          <button type="button" className="ghost" data-testid="certificate-legacy" onClick={onLegacy}>
            استخدم نتيجة الاختبار القديم
          </button>
          <button type="button" className="ghost" data-testid="certificate-network" onClick={onNetwork}>
            نزّل من الخادم
          </button>
          <button type="button" className="ghost" data-testid="certificate-robot-done" onClick={onRobotDone}>
            تم
          </button>
          <button type="button" className="ghost" data-testid="certificate-fail" onClick={onDownloadFail}>
            تعذّر التنزيل
          </button>
        </div>
        <div className="button-row">
          <button type="button" className="ghost" data-testid="certificate-close" onClick={onClose}>
            إغلاق
          </button>
        </div>
      </article>
    </div>
  );
}
