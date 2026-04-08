import { useState } from "react";
import { QrCode, Download, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const AdminQRCodes = () => {
  const [numTables, setNumTables] = useState(10);
  const [copied, setCopied] = useState<number | null>(null);

  const baseUrl = "https://maya-s-sweet.vercel.app";

  const getTableUrl = (table: number) => `${baseUrl}/?table=${table}#menu`;

  const getQRImageUrl = (table: number) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(getTableUrl(table))}`;

  const copyUrl = (table: number) => {
    navigator.clipboard.writeText(getTableUrl(table));
    setCopied(table);
    toast.success(`Lien table ${table} copié !`);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadQR = (table: number) => {
    const link = document.createElement("a");
    link.href = getQRImageUrl(table);
    link.download = `maya-table-${table}-qr.png`;
    link.click();
    toast.success(`QR code table ${table} téléchargé !`);
  };

  const downloadAll = () => {
    for (let i = 1; i <= numTables; i++) {
      setTimeout(() => downloadQR(i), i * 300);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-bold flex items-center gap-2">
            <QrCode className="h-5 w-5" /> QR Codes Tables
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Imprimez ces QR codes et placez-les sur vos tables
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Nombre de tables :</label>
          <input
            type="number"
            min={1}
            max={50}
            value={numTables}
            onChange={(e) => setNumTables(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-16 px-2 py-1 rounded-lg border border-border bg-background text-center text-sm"
          />
          <button
            onClick={downloadAll}
            className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5"
          >
            <Download className="h-4 w-4" /> Tout télécharger
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: numTables }, (_, i) => i + 1).map((table) => (
          <div key={table} className="bg-card border border-border rounded-xl p-3 flex flex-col items-center gap-2">
            <div className="bg-background rounded-lg p-2">
              <img
                src={getQRImageUrl(table)}
                alt={`QR Code Table ${table}`}
                className="w-full aspect-square"
                loading="lazy"
              />
            </div>
            <p className="font-heading font-bold text-lg">Table {table}</p>
            <p className="text-[10px] text-muted-foreground text-center break-all leading-tight">
              {getTableUrl(table)}
            </p>
            <div className="flex gap-1 w-full">
              <button
                onClick={() => copyUrl(table)}
                className="flex-1 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium flex items-center justify-center gap-1"
              >
                {copied === table ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied === table ? "Copié" : "Copier"}
              </button>
              <button
                onClick={() => downloadQR(table)}
                className="flex-1 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center gap-1"
              >
                <Download className="h-3 w-3" /> QR
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminQRCodes;
