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
        className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-300 shadow-md space-y-6 text-slate-900 font-sans"
      >
        {/* Receipt Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-xs">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight">CivicTrack</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              Official Grievance Registration Receipt • Municipal Wards
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Complaint Number
            </span>
            <span className="font-mono font-bold text-sm sm:text-base text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {issue.complaint_number}
            </span>
          </div>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Ward</span>
            <span className="font-bold text-slate-800 text-sm">{issue.zone_name}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Department</span>
            <span className="font-semibold text-slate-800">{issue.department}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Defect Category</span>
            <span className="font-semibold text-slate-800 capitalize">{issue.category.replace('_', ' ')}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">AI Confidence</span>
            <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              {(issue.ai_confidence * 100).toFixed(1)}% YOLOv8 Confirmed
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Reported Timestamp</span>
            <span className="font-mono text-slate-700">{new Date(issue.reported_at).toLocaleString()}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Target SLA Deadline</span>
            <span className="font-mono font-bold text-amber-700">
              {new Date(issue.deadline_at).toLocaleDateString()} (15 Days)
            </span>
          </div>
        </div>

        {/* Description Snippet */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Issue Description / Landmark
          </span>
          <p className="text-slate-700 leading-relaxed font-medium">{issue.description}</p>
        </div>

        {/* Bottom Verification Seal & QR Code */}
        <div className="pt-4 border-t-2 border-dashed border-slate-300 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5 text-emerald-700 font-bold text-xs">
              <CheckCircle className="w-4 h-4" />
              <span>Immutable Ticket Registered</span>
            </div>
            <p className="text-[10px] text-slate-400 max-w-[200px] leading-tight">
              Scan QR code on any mobile camera to verify live ticket status and timeline.
            </p>
          </div>

          {qrDataUrl && (
            <div className="p-1.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
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
        className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-2xl shadow-lg transition-colors flex items-center justify-center space-x-2"
      >
        <Download className="w-4 h-4" />
        <span>{isGeneratingPdf ? 'Generating Official PDF...' : 'Download Official PDF Receipt'}</span>
      </button>
    </div>
  );
}
