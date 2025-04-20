
import React, { useState } from 'react';
import { useWedding } from '@/contexts/WeddingContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

type ImportExportModalProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const ImportExportModal: React.FC<ImportExportModalProps> = ({ isOpen, setIsOpen }) => {
  const { exportData, importData } = useWedding();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleExport = () => {
    exportData();
    setIsOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleImport = () => {
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a file to import.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        const success = importData(event.target.result);
        if (success) {
          setIsOpen(false);
          setSelectedFile(null);
        }
      }
    };
    reader.onerror = () => {
      toast({
        variant: "destructive",
        title: "Read error",
        description: "Failed to read the file.",
      });
    };
    reader.readAsText(selectedFile);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Wedding Planner Data</DialogTitle>
          <DialogDescription>
            Import or export your wedding planning data.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>
          
          <TabsContent value="export" className="py-4">
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Export all your wedding planning data to a JSON file. You can use this file to back up your data or transfer it to another device.
              </p>
              <Button 
                onClick={handleExport}
                className="wedding-btn-primary w-full"
              >
                Download Data
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="import" className="py-4">
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Import wedding planning data from a JSON file. This will replace all your current data.
              </p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                {selectedFile ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Click to select a JSON file</p>
                    <label className="wedding-btn-secondary inline-block cursor-pointer">
                      Select File
                      <input
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                )}
              </div>
              
              <Button 
                onClick={handleImport}
                className="wedding-btn-primary w-full"
                disabled={!selectedFile}
              >
                Import Data
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ImportExportModal;
