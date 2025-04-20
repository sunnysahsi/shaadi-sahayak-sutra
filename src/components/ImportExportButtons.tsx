
import React from 'react';
import { Button } from "@/components/ui/button";
import { useWedding } from '@/contexts/WeddingContext';
import { Download, Upload } from 'lucide-react';

import PDFExportModal from './PDFExportModal';
import ResetDataDialog from './ResetDataDialog';

interface ImportExportButtonsProps {
  openImportModal: () => void;
}

const ImportExportButtons = ({ openImportModal }: ImportExportButtonsProps) => {
  const { exportData } = useWedding();

  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={exportData}
      >
        <Download className="h-4 w-4 mr-2" />
        Export Data
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={openImportModal}
      >
        <Upload className="h-4 w-4 mr-2" />
        Import Data
      </Button>
      
      <PDFExportModal />
      
      <ResetDataDialog />
    </div>
  );
};

export default ImportExportButtons;
