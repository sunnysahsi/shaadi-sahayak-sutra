
import { BudgetCategory, Event, Guest, Vendor, TodoItem, Note, WeddingData } from '@/contexts/WeddingContext';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Explicitly import and add the autoTable plugin
// @ts-ignore - The type definitions may be incomplete, but the plugin works
import autoTable from 'jspdf-autotable';

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date
const formatDate = (dateStr: string) => {
  if (!dateStr) return 'Not set';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Add page header
const addPageHeader = (doc: jsPDF, title: string) => {
  doc.setFontSize(20);
  doc.setTextColor(128, 0, 32); // Wedding red
  doc.text(title, 14, 22);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
  doc.line(14, 35, 196, 35);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
};

// Generate Budget PDF
export const generateBudgetPDF = (budgetData: { totalBudget: number, budgetCategories: BudgetCategory[] }) => {
  const doc = new jsPDF();
  
  addPageHeader(doc, 'Wedding Budget Planner');
  
  // Summary
  doc.setFontSize(14);
  doc.text('Budget Summary', 14, 45);
  
  const totalEstimated = budgetData.budgetCategories.reduce(
    (acc, category) => acc + category.items.reduce((sum, item) => sum + item.estimatedCost, 0),
    0
  );
  
  const totalActual = budgetData.budgetCategories.reduce(
    (acc, category) => acc + category.items.reduce((sum, item) => sum + (item.actualCost || 0), 0),
    0
  );
  
  const summaryData = [
    ['Total Budget', formatCurrency(budgetData.totalBudget)],
    ['Total Estimated', formatCurrency(totalEstimated)],
    ['Total Spent', formatCurrency(totalActual)],
    ['Remaining', formatCurrency(budgetData.totalBudget - totalActual)]
  ];
  
  // Use autoTable directly
  autoTable(doc, {
    startY: 50,
    head: [['Item', 'Amount']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [128, 0, 32] },
  });
  
  let yPosition = (doc as any).lastAutoTable.finalY + 15;
  
  // Categories and items
  budgetData.budgetCategories.forEach(category => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.text(category.name, 14, yPosition);
    yPosition += 5;
    
    const tableData = category.items.map(item => [
      item.name,
      formatCurrency(item.estimatedCost),
      formatCurrency(item.actualCost || 0),
      item.isPaid ? 'Yes' : 'No',
      item.notes || '-'
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Item', 'Estimated', 'Actual', 'Paid', 'Notes']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [180, 180, 180] },
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
  });
  
  doc.save('wedding-budget.pdf');
};

// Generate Events PDF
export const generateEventsPDF = (events: Event[]) => {
  const doc = new jsPDF();
  
  addPageHeader(doc, 'Wedding Events Schedule');
  
  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
  
  let yPosition = 50;
  
  sortedEvents.forEach((event, index) => {
    if (yPosition > 250 || index > 0 && index % 3 === 0) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.text(event.title, 14, yPosition);
    yPosition += 8;
    
    doc.setFontSize(12);
    doc.text(`Date: ${formatDate(event.date)}`, 14, yPosition);
    yPosition += 6;
    
    doc.text(`Time: ${event.time || 'Not set'}`, 14, yPosition);
    yPosition += 6;
    
    doc.text(`Venue: ${event.venue || 'Not set'}`, 14, yPosition);
    yPosition += 6;
    
    if (event.notes) {
      doc.text('Notes:', 14, yPosition);
      yPosition += 6;
      
      const splitNotes = doc.splitTextToSize(event.notes, 180);
      doc.text(splitNotes, 14, yPosition);
      yPosition += splitNotes.length * 6 + 6;
    }
    
    doc.line(14, yPosition, 196, yPosition);
    yPosition += 15;
  });
  
  doc.save('wedding-events.pdf');
};

// Generate Guest List PDF
export const generateGuestListPDF = (guests: Guest[], guestGroups: { id: string, name: string }[]) => {
  const doc = new jsPDF();
  
  addPageHeader(doc, 'Wedding Guest List');
  
  const groupMap = new Map();
  guestGroups.forEach(group => {
    groupMap.set(group.id, group.name);
  });
  
  // Summary
  doc.setFontSize(14);
  doc.text('Guest Summary', 14, 45);
  
  const confirmed = guests.filter(g => g.rsvpStatus === 'confirmed').length;
  const declined = guests.filter(g => g.rsvpStatus === 'declined').length;
  const pending = guests.filter(g => g.rsvpStatus === 'pending').length;
  
  const summaryData = [
    ['Total Guests', guests.length.toString()],
    ['Confirmed', confirmed.toString()],
    ['Declined', declined.toString()],
    ['Pending', pending.toString()]
  ];
  
  autoTable(doc, {
    startY: 50,
    head: [['Status', 'Count']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [128, 0, 32] },
  });
  
  let yPosition = (doc as any).lastAutoTable.finalY + 15;
  
  // Guest List
  doc.setFontSize(14);
  doc.text('Guest List', 14, yPosition);
  yPosition += 5;
  
  const guestData = guests.map(guest => [
    guest.name,
    guest.groupId ? groupMap.get(guest.groupId) || '-' : '-',
    guest.phone || '-',
    guest.email || '-',
    guest.rsvpStatus.charAt(0).toUpperCase() + guest.rsvpStatus.slice(1)
  ]);
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Name', 'Group', 'Phone', 'Email', 'RSVP Status']],
    body: guestData,
    theme: 'striped',
    headStyles: { fillColor: [128, 0, 32] },
  });
  
  doc.save('wedding-guests.pdf');
};

// Generate Vendors PDF
export const generateVendorsPDF = (vendors: Vendor[]) => {
  const doc = new jsPDF();
  
  addPageHeader(doc, 'Wedding Vendors');
  
  // Group vendors by category
  const vendorsByCategory: Record<string, Vendor[]> = {};
  
  vendors.forEach(vendor => {
    if (!vendorsByCategory[vendor.category]) {
      vendorsByCategory[vendor.category] = [];
    }
    vendorsByCategory[vendor.category].push(vendor);
  });
  
  let yPosition = 45;
  
  // Iterate through each category
  Object.entries(vendorsByCategory).forEach(([category, categoryVendors], index) => {
    if (yPosition > 250 || (index > 0 && yPosition > 200)) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.text(category, 14, yPosition);
    yPosition += 5;
    
    const vendorData = categoryVendors.map(vendor => [
      vendor.name,
      vendor.phone || '-',
      vendor.email || '-',
      formatCurrency(vendor.cost),
      vendor.notes || '-'
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Name', 'Phone', 'Email', 'Cost', 'Notes']],
      body: vendorData,
      theme: 'striped',
      headStyles: { fillColor: [128, 0, 32] },
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 15;
  });
  
  doc.save('wedding-vendors.pdf');
};

// Generate Todo List PDF
export const generateTodosPDF = (todos: TodoItem[]) => {
  const doc = new jsPDF();
  
  addPageHeader(doc, 'Wedding To-Do List');
  
  // Sort todos by completion and then priority
  const sortedTodos = [...todos].sort((a, b) => {
    if (a.isCompleted === b.isCompleted) {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return a.isCompleted ? 1 : -1;
  });
  
  const todoData = sortedTodos.map(todo => [
    todo.isCompleted ? '✓' : '☐',
    todo.task,
    todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1),
    todo.dueDate ? formatDate(todo.dueDate) : '-'
  ]);
  
  autoTable(doc, {
    startY: 45,
    head: [['Status', 'Task', 'Priority', 'Due Date']],
    body: todoData,
    theme: 'striped',
    headStyles: { fillColor: [128, 0, 32] },
  });
  
  doc.save('wedding-todos.pdf');
};

// Generate Notes PDF
export const generateNotesPDF = (notes: Note[]) => {
  const doc = new jsPDF();
  
  addPageHeader(doc, 'Wedding Notes & Inspiration');
  
  let yPosition = 45;
  
  // Sort notes by date (newest first)
  const sortedNotes = [...notes].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  sortedNotes.forEach((note, index) => {
    if (yPosition > 250 || (index > 0 && yPosition > 200)) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.text(note.title, 14, yPosition);
    yPosition += 6;
    
    doc.setFontSize(10);
    doc.text(`Created: ${formatDate(note.createdAt)}`, 14, yPosition);
    yPosition += 8;
    
    doc.setFontSize(12);
    const splitContent = doc.splitTextToSize(note.content, 180);
    doc.text(splitContent, 14, yPosition);
    yPosition += splitContent.length * 6 + 10;
    
    // Add images if any (base64)
    if (note.images && note.images.length > 0) {
      doc.text('Images:', 14, yPosition);
      yPosition += 8;
      
      note.images.forEach((imgData, i) => {
        try {
          // Check if we need a new page
          if (yPosition > 200) {
            doc.addPage();
            yPosition = 20;
          }
          
          const imgWidth = 80;
          const imgHeight = 60;
          
          doc.addImage(imgData, 'JPEG', 14, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 10;
        } catch (error) {
          console.error('Error adding image to PDF:', error);
        }
      });
    }
    
    doc.line(14, yPosition, 196, yPosition);
    yPosition += 15;
  });
  
  doc.save('wedding-notes.pdf');
};

// Generate complete wedding planner PDF
export const generateAllPDF = (data: WeddingData) => {
  const doc = new jsPDF();
  
  // Cover page
  doc.setFontSize(24);
  doc.setTextColor(128, 0, 32); // Wedding red
  doc.text('Wedding Planner', 105, 100, { align: 'center' });
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 110, { align: 'center' });
  
  // Budget section
  doc.addPage();
  addPageHeader(doc, 'Budget Summary');
  
  const totalEstimated = data.budgetCategories.reduce(
    (acc, category) => acc + category.items.reduce((sum, item) => sum + item.estimatedCost, 0),
    0
  );
  
  const totalActual = data.budgetCategories.reduce(
    (acc, category) => acc + category.items.reduce((sum, item) => sum + (item.actualCost || 0), 0),
    0
  );
  
  const summaryData = [
    ['Total Budget', formatCurrency(data.totalBudget)],
    ['Total Estimated', formatCurrency(totalEstimated)],
    ['Total Spent', formatCurrency(totalActual)],
    ['Remaining', formatCurrency(data.totalBudget - totalActual)]
  ];
  
  autoTable(doc, {
    startY: 45,
    head: [['Item', 'Amount']],
    body: summaryData,
    theme: 'striped',
    headStyles: { fillColor: [128, 0, 32] },
  });
  
  // Events section
  doc.addPage();
  addPageHeader(doc, 'Events Schedule');
  
  const sortedEvents = [...data.events].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
  
  const eventData = sortedEvents.map(event => [
    event.title,
    formatDate(event.date),
    event.time || 'Not set',
    event.venue || 'Not set'
  ]);
  
  autoTable(doc, {
    startY: 45,
    head: [['Event', 'Date', 'Time', 'Venue']],
    body: eventData,
    theme: 'striped',
    headStyles: { fillColor: [128, 0, 32] },
  });
  
  // Guests section
  doc.addPage();
  addPageHeader(doc, 'Guest List Summary');
  
  const confirmed = data.guests.filter(g => g.rsvpStatus === 'confirmed').length;
  const declined = data.guests.filter(g => g.rsvpStatus === 'declined').length;
  const pending = data.guests.filter(g => g.rsvpStatus === 'pending').length;
  
  const guestSummaryData = [
    ['Total Guests', data.guests.length.toString()],
    ['Confirmed', confirmed.toString()],
    ['Declined', declined.toString()],
    ['Pending', pending.toString()]
  ];
  
  autoTable(doc, {
    startY: 45,
    head: [['Status', 'Count']],
    body: guestSummaryData,
    theme: 'striped',
    headStyles: { fillColor: [128, 0, 32] },
  });
  
  // TODO section
  doc.addPage();
  addPageHeader(doc, 'To-Do List Summary');
  
  const completedTasks = data.todos.filter(t => t.isCompleted).length;
  const pendingTasks = data.todos.filter(t => !t.isCompleted).length;
  
  const todoSummaryData = [
    ['Total Tasks', data.todos.length.toString()],
    ['Completed', completedTasks.toString()],
    ['Pending', pendingTasks.toString()]
  ];
  
  autoTable(doc, {
    startY: 45,
    head: [['Status', 'Count']],
    body: todoSummaryData,
    theme: 'striped',
    headStyles: { fillColor: [128, 0, 32] },
  });
  
  doc.save('complete-wedding-planner.pdf');
};
