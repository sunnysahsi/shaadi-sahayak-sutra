
import React from 'react';
import { useWedding } from '@/contexts/WeddingContext';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

const ResetDataDialog = () => {
  const { setWeddingData } = useWedding();
  const { toast } = useToast();

  const handleResetData = () => {
    // Reset data to empty state with initial defaults
    setWeddingData({
      totalBudget: 1000000,
      budgetCategories: [],
      events: [],
      guestGroups: [],
      guests: [],
      vendors: [],
      todos: [],
      notes: [],
      lastUpdated: new Date().toISOString(),
    });

    toast({
      title: "Data cleared",
      description: "All wedding planning data has been reset.",
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Reset All Data
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will permanently delete all your wedding planning data, including budget, events, guest list, and more.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleResetData} className="bg-wedding-red hover:bg-wedding-red/90">
            Yes, reset everything
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ResetDataDialog;
