'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Download, Shield, CheckCircle, ExternalLink, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { CivicIssue } from '../lib/types';

interface ReceiptCardProps {
  issue: CivicIssue;
}

export default function ReceiptCard({ issue }: ReceiptCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate QR code pointing to ticket tracking page URL
    const trackingUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/track/${issue.complaint_number}`
      : `https://civictrack.org/track/${issue.complaint_number}`;

    QRCode.toDataURL(trackingUrl, {
      width: 140,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    }).then((url: string) => setQrDataUrl(url));
  }, [issue.complaint_number]);

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      if (!receiptRef.current) return;

      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Receipt_${issue.complaint_number}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Printable Receipt Container */}
      <div
        ref={receiptRef}
        className="glass-card rounded-3xl p-6 sm:p-8 border border-[#C9C4BA] shadow-xl space-y-6 text-[#1E2328] font-sans"
      >
        {/* Receipt Header */}
        <div className="flex items-start justify-between border-b border-[#C9C4BA] pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-[#D95F02] flex items-center justify-center text-slate-950 font-bold text-xs">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">CivicTrack</span>
            </div>
            <p className="text-[10px] text-[#6B6860] font-medium">
              Official Grievance Registration Receipt â€¢ Municipal Wards
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#6B6860] block tracking-wider">
              Complaint Number
            </span>
            <span className="font-mono-data font-bold text-sm sm:text-base text-[#D95F02] bg-[#F0EEE9] px-2.5 py-0.5 rounded-lg border border-[#C9C4BA]">
              {issue.complaint_number}
            </span>
          </div>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#6B6860] block">Assigned Ward</span>
            <span className="font-bold text-[#1E2328] text-sm">{issue.zone_name}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[#6B6860] block">Department</span>
            <span className="font-semibold text-[#1A56A4]">{issue.department}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[#6B6860] block">Defect Category</span>
            <span className="font-semibold text-[#2D3340] capitalize">{issue.category.replace('_', ' ')}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[#6B6860] block">AI Confidence</span>
            <span className="font-mono-data font-bold text-[#176B3A] bg-[#EDFBF0] border border-[#176B3A] px-2 py-0.5 rounded-md">
              {(issue.ai_confidence * 100).toFixed(1)}% YOLOv8 Confirmed
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[#6B6860] block">Reported Timestamp</span>
            <span className="font-mono-data text-[#4B5563]">{new Date(issue.reported_at).toLocaleString()}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[#6B6860] block">Target SLA Deadline</span>
            <span className="font-mono-data font-bold text-[#D95F02]">
              {new Date(issue.deadline_at).toLocaleDateString()} (15 Days)
            </span>
          </div>
        </div>

        {/* Description Snippet */}
        <div className="bg-[#F0EEE9]/80 p-3.5 rounded-xl border border-[#C9C4BA] text-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#6B6860] block tracking-wider">
            Issue Description / Landmark
          </span>
          <p className="text-[#4B5563] leading-relaxed font-medium">{issue.description}</p>
        </div>

        {/* Bottom Verification Seal & QR Code */}
        <div className="pt-4 border-t border-dashed border-[#C9C4BA] flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5 text-[#176B3A] font-bold text-xs">
              <CheckCircle className="w-4 h-4 text-[#176B3A]" />
              <span>Immutable Ticket Registered</span>
            </div>
            <p className="text-[10px] text-[#6B6860] max-w-[200px] leading-tight">
              Scan QR code on any mobile camera to verify live ticket status and timeline.
            </p>
          </div>

          {qrDataUrl && (
            <div className="p-1.5 bg-white border border-[#C9C4BA] rounded-xl shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="Ticket QR" className="w-20 h-20" />
            </div>
          )}
        </div>
      </div>

      {/* PDF Download Button */}
      <button
        type="button"
        onClick={handleDownloadPdf}
        disabled={isGeneratingPdf}
        className="w-full py-3.5 px-4 bg-[#D95F02] hover:bg-[#D95F02] text-slate-950 text-xs font-extrabold rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center space-x-2"
      >
        <Download className="w-4 h-4 text-slate-950" />
        <span>{isGeneratingPdf ? 'Generating Official PDF...' : 'Download Official PDF Receipt'}</span>
      </button>
    </div>
  );
}
