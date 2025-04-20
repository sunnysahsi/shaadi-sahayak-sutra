
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { useWedding } from '@/contexts/WeddingContext';
import { 
  generateBudgetPDF, 
  generateEventsPDF, 
  generateGuestListPDF, 
  generateVendorsPDF,
  generateTodosPDF,
  generateNotesPDF,
  generateAllPDF
} from '@/utils/pdfGenerator';

const PDFExportModal = () => {
  const { weddingData } = useWedding();
  const [open, setOpen] = React.useState(false);

  const handleExportBudget = () => {
    generateBudgetPDF({
      totalBudget: weddingData.totalBudget,
      budgetCategories: weddingData.budgetCategories
    });
    setOpen(false);
  };

  const handleExportEvents = () => {
    generateEventsPDF(weddingData.events);
    setOpen(false);
  };

  const handleExportGuestList = () => {
    generateGuestListPDF(weddingData.guests, weddingData.guestGroups);
    setOpen(false);
  };

  const handleExportVendors = () => {
    generateVendorsPDF(weddingData.vendors);
    setOpen(false);
  };

  const handleExportTodos = () => {
    generateTodosPDF(weddingData.todos);
    setOpen(false);
  };

  const handleExportNotes = () => {
    generateNotesPDF(weddingData.notes);
    setOpen(false);
  };

  const handleExportAll = () => {
    generateAllPDF(weddingData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export to PDF</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button onClick={handleExportBudget} variant="outline" className="justify-start">
            <FileText className="h-4 w-4 mr-2" />
            Budget Planner
          </Button>
          <Button onClick={handleExportEvents} variant="outline" className="justify-start">
            <FileText className="h-4 w-4 mr-2" />
            Events Schedule
          </Button>
          <Button onClick={handleExportGuestList} variant="outline" className="justify-start">
            <FileText className="h-4 w-4 mr-2" />
            Guest List
          </Button>
          <Button onClick={handleExportVendors} variant="outline" className="justify-start">
            <FileText className="h-4 w-4 mr-2" />
            Vendors
          </Button>
          <Button onClick={handleExportTodos} variant="outline" className="justify-start">
            <FileText className="h-4 w-4 mr-2" />
            To-Do List
          </Button>
          <Button onClick={handleExportNotes} variant="outline" className="justify-start">
            <FileText className="h-4 w-4 mr-2" />
            Notes & Ideas
          </Button>
          <Button onClick={handleExportAll} className="col-span-2 bg-wedding-red hover:bg-wedding-red/90">
            <FileText className="h-4 w-4 mr-2" />
            Export Complete Planner
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFExportModal;
