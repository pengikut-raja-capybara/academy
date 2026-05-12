import { useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { importProgress as importProgressAction } from "../features/learning/learningSlice";
import { useToast } from "../context/ToastContext";

export function useDataManagement() {
  const progress = useAppSelector((state) => state.learning.progress);
  const userName = useAppSelector((state) => state.learning.userName);
  const dispatch = useAppDispatch();
  const { addToast } = useToast();

  const [exportDialog, setExportDialog] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importProgressPct, setImportProgressPct] = useState(0);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const confirmExport = useCallback(() => {
    const exportData = {
      _info: "Backup file progres belajar PRC Academy. Jangan ubah isi file ini.",
      _website: "https://pengikut-raja-capybara.github.io/academy",
      progress,
      userName,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData));
    const dt = new Date();
    const nameTag = userName ? `${userName.toLowerCase()}-` : "";
    const dateStr = dt.toISOString().split("T")[0];
    const filename = `backup-${nameTag}prc-academy-${dateStr}.json`;
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    setExportDialog(false);
    addToast("success", "Ekspor Berhasil!", `File ${filename} telah diunduh ke perangkatmu.`);
  }, [progress, userName, addToast]);

  const handleFileImport = useCallback((file: File) => {
    if (!file) return;

    setImportLoading(true);
    setImportProgressPct(0);

    const reader = new FileReader();

    // Simulate progress
    const progressInterval = setInterval(() => {
      setImportProgressPct((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 30;
      });
    }, 100);

    reader.onload = (event) => {
      clearInterval(progressInterval);

      try {
        const importedProgress = JSON.parse(event.target?.result as string);

        if (typeof importedProgress === "object" && importedProgress !== null) {
          setImportProgressPct(100);

          setTimeout(() => {
            dispatch(importProgressAction(importedProgress));
            setImportLoading(false);
            setImportProgressPct(0);
            addToast("success", "Impor Berhasil!", "Progres berhasil dimuat. Memuat ulang halaman...");
            setTimeout(() => window.location.reload(), 1000);
          }, 500);
        } else {
          setImportLoading(false);
          setImportProgressPct(0);
          addToast("error", "Format File Tidak Valid", "Pastikan file yang dipilih adalah file JSON progress yang benar.");
        }
      } catch {
        setImportLoading(false);
        setImportProgressPct(0);
        addToast("error", "Gagal Membaca File", "Ada kesalahan saat membaca file. Coba file lain atau buat file baru.");
      }
    };

    reader.onerror = () => {
      clearInterval(progressInterval);
      setImportLoading(false);
      setImportProgressPct(0);
      addToast("error", "Gagal Membaca File", "Terjadi kesalahan saat membaca file. Silakan coba lagi.");
    };

    reader.readAsText(file);
  }, [dispatch, addToast]);

  return {
    exportDialog,
    setExportDialog,
    importLoading,
    importProgressPct,
    importDialogOpen,
    setImportDialogOpen,
    confirmExport,
    handleFileImport,
  };
}
