
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

// Types for our wedding data
export type BudgetItem = {
  id: string;
  name: string;
  estimatedCost: number;
  actualCost: number;
  isPaid: boolean;
  notes: string;
};

export type BudgetCategory = {
  id: string;
  name: string;
  items: BudgetItem[];
};

export type Event = {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  notes: string;
};

export type GuestGroup = {
  id: string;
  name: string;
};

export type Guest = {
  id: string;
  name: string;
  phone: string;
  email: string;
  groupId: string | null;
  rsvpStatus: 'pending' | 'confirmed' | 'declined';
};

export type Vendor = {
  id: string;
  name: string;
  category: string;
  phone: string;
  email: string;
  cost: number;
  notes: string;
};

export type TodoItem = {
  id: string;
  task: string;
  dueDate: string | null;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
};

export type Note = {
  id: string;
  title: string;
  content: string;
  images: string[]; // base64 encoded images
  createdAt: string;
};

export type WeddingData = {
  totalBudget: number;
  budgetCategories: BudgetCategory[];
  events: Event[];
  guestGroups: GuestGroup[];
  guests: Guest[];
  vendors: Vendor[];
  todos: TodoItem[];
  notes: Note[];
  lastUpdated: string;
};

// Default data
const defaultWeddingData: WeddingData = {
  totalBudget: 1000000, // 10 Lakh INR
  budgetCategories: [
    {
      id: '1',
      name: 'Venue',
      items: [
        {
          id: '1-1',
          name: 'Wedding Hall',
          estimatedCost: 200000,
          actualCost: 0,
          isPaid: false,
          notes: '',
        },
      ],
    },
    {
      id: '2',
      name: 'Catering',
      items: [
        {
          id: '2-1',
          name: 'Food & Beverages',
          estimatedCost: 150000,
          actualCost: 0,
          isPaid: false,
          notes: '',
        },
      ],
    },
    {
      id: '3',
      name: 'Decoration',
      items: [
        {
          id: '3-1',
          name: 'Flowers & Mandap',
          estimatedCost: 80000,
          actualCost: 0,
          isPaid: false,
          notes: '',
        },
      ],
    },
  ],
  events: [
    {
      id: '1',
      title: 'Haldi Ceremony',
      date: '',
      time: '10:00',
      venue: '',
      notes: '',
    },
    {
      id: '2',
      title: 'Mehendi Ceremony',
      date: '',
      time: '16:00',
      venue: '',
      notes: '',
    },
    {
      id: '3',
      title: 'Sangeet Ceremony',
      date: '',
      time: '19:00',
      venue: '',
      notes: '',
    },
    {
      id: '4',
      title: 'Wedding Ceremony',
      date: '',
      time: '11:00',
      venue: '',
      notes: '',
    },
    {
      id: '5',
      title: 'Reception',
      date: '',
      time: '19:00',
      venue: '',
      notes: '',
    },
  ],
  guestGroups: [
    {
      id: '1',
      name: 'Family',
    },
    {
      id: '2',
      name: 'Friends',
    },
    {
      id: '3',
      name: 'Colleagues',
    },
  ],
  guests: [],
  vendors: [],
  todos: [
    {
      id: '1',
      task: 'Book wedding venue',
      dueDate: null,
      isCompleted: false,
      priority: 'high',
    },
    {
      id: '2',
      task: 'Send invitations',
      dueDate: null,
      isCompleted: false,
      priority: 'medium',
    },
    {
      id: '3',
      task: 'Book photographer',
      dueDate: null,
      isCompleted: false,
      priority: 'medium',
    },
  ],
  notes: [],
  lastUpdated: new Date().toISOString(),
};

// Create context
type WeddingContextType = {
  weddingData: WeddingData;
  isLoading: boolean;
  setWeddingData: React.Dispatch<React.SetStateAction<WeddingData>>;
  updateTotalBudget: (amount: number) => void;
  addBudgetCategory: (name: string) => void;
  updateBudgetCategory: (id: string, name: string) => void;
  deleteBudgetCategory: (id: string) => void;
  addBudgetItem: (categoryId: string, item: Omit<BudgetItem, 'id'>) => void;
  updateBudgetItem: (categoryId: string, item: BudgetItem) => void;
  deleteBudgetItem: (categoryId: string, itemId: string) => void;
  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
  addGuestGroup: (name: string) => void;
  updateGuestGroup: (id: string, name: string) => void;
  deleteGuestGroup: (id: string) => void;
  addGuest: (guest: Omit<Guest, 'id'>) => void;
  updateGuest: (guest: Guest) => void;
  deleteGuest: (id: string) => void;
  addVendor: (vendor: Omit<Vendor, 'id'>) => void;
  updateVendor: (vendor: Vendor) => void;
  deleteVendor: (id: string) => void;
  addTodo: (todo: Omit<TodoItem, 'id'>) => void;
  updateTodo: (todo: TodoItem) => void;
  deleteTodo: (id: string) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  exportData: () => void;
  importData: (jsonData: string) => boolean;
};

const WeddingContext = createContext<WeddingContextType | undefined>(undefined);

export const useWedding = () => {
  const context = useContext(WeddingContext);
  if (context === undefined) {
    throw new Error('useWedding must be used within a WeddingProvider');
  }
  return context;
};

export default function WeddingProvider({ children }: { children: React.ReactNode }) {
  const [weddingData, setWeddingData] = useState<WeddingData>(defaultWeddingData);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const savedData = localStorage.getItem('weddingData');
        if (savedData) {
          setWeddingData(JSON.parse(savedData));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      const updatedData = {
        ...weddingData,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem('weddingData', JSON.stringify(updatedData));
    }
  }, [weddingData, isLoading]);

  // Generate unique ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Budget functions
  const updateTotalBudget = (amount: number) => {
    setWeddingData((prev) => ({ ...prev, totalBudget: amount }));
  };

  const addBudgetCategory = (name: string) => {
    const newCategory: BudgetCategory = {
      id: generateId(),
      name,
      items: [],
    };
    setWeddingData((prev) => ({
      ...prev,
      budgetCategories: [...prev.budgetCategories, newCategory],
    }));
  };

  const updateBudgetCategory = (id: string, name: string) => {
    setWeddingData((prev) => ({
      ...prev,
      budgetCategories: prev.budgetCategories.map((cat) =>
        cat.id === id ? { ...cat, name } : cat
      ),
    }));
  };

  const deleteBudgetCategory = (id: string) => {
    setWeddingData((prev) => ({
      ...prev,
      budgetCategories: prev.budgetCategories.filter((cat) => cat.id !== id),
    }));
  };

  const addBudgetItem = (categoryId: string, item: Omit<BudgetItem, 'id'>) => {
    const newItem: BudgetItem = {
      id: generateId(),
      ...item,
    };
    setWeddingData((prev) => ({
      ...prev,
      budgetCategories: prev.budgetCategories.map((cat) =>
        cat.id === categoryId
          ? { ...cat, items: [...cat.items, newItem] }
          : cat
      ),
    }));
  };

  const updateBudgetItem = (categoryId: string, item: BudgetItem) => {
    setWeddingData((prev) => ({
      ...prev,
      budgetCategories: prev.budgetCategories.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map((i) => (i.id === item.id ? item : i)),
            }
          : cat
      ),
    }));
  };

  const deleteBudgetItem = (categoryId: string, itemId: string) => {
    setWeddingData((prev) => ({
      ...prev,
      budgetCategories: prev.budgetCategories.map((cat) =>
        cat.id === categoryId
          ? { ...cat, items: cat.items.filter((i) => i.id !== itemId) }
          : cat
      ),
    }));
  };

  // Event functions
  const addEvent = (event: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      id: generateId(),
      ...event,
    };
    setWeddingData((prev) => ({
      ...prev,
      events: [...prev.events, newEvent],
    }));
  };

  const updateEvent = (event: Event) => {
    setWeddingData((prev) => ({
      ...prev,
      events: prev.events.map((e) => (e.id === event.id ? event : e)),
    }));
  };

  const deleteEvent = (id: string) => {
    setWeddingData((prev) => ({
      ...prev,
      events: prev.events.filter((e) => e.id !== id),
    }));
  };

  // Guest Group functions
  const addGuestGroup = (name: string) => {
    const newGroup: GuestGroup = {
      id: generateId(),
      name,
    };
    setWeddingData((prev) => ({
      ...prev,
      guestGroups: [...prev.guestGroups, newGroup],
    }));
  };

  const updateGuestGroup = (id: string, name: string) => {
    setWeddingData((prev) => ({
      ...prev,
      guestGroups: prev.guestGroups.map((g) =>
        g.id === id ? { ...g, name } : g
      ),
    }));
  };

  const deleteGuestGroup = (id: string) => {
    setWeddingData((prev) => ({
      ...prev,
      guestGroups: prev.guestGroups.filter((g) => g.id !== id),
      guests: prev.guests.map((g) =>
        g.groupId === id ? { ...g, groupId: null } : g
      ),
    }));
  };

  // Guest functions
  const addGuest = (guest: Omit<Guest, 'id'>) => {
    const newGuest: Guest = {
      id: generateId(),
      ...guest,
    };
    setWeddingData((prev) => ({
      ...prev,
      guests: [...prev.guests, newGuest],
    }));
  };

  const updateGuest = (guest: Guest) => {
    setWeddingData((prev) => ({
      ...prev,
      guests: prev.guests.map((g) => (g.id === guest.id ? guest : g)),
    }));
  };

  const deleteGuest = (id: string) => {
    setWeddingData((prev) => ({
      ...prev,
      guests: prev.guests.filter((g) => g.id !== id),
    }));
  };

  // Vendor functions
  const addVendor = (vendor: Omit<Vendor, 'id'>) => {
    const newVendor: Vendor = {
      id: generateId(),
      ...vendor,
    };
    setWeddingData((prev) => ({
      ...prev,
      vendors: [...prev.vendors, newVendor],
    }));
  };

  const updateVendor = (vendor: Vendor) => {
    setWeddingData((prev) => ({
      ...prev,
      vendors: prev.vendors.map((v) => (v.id === vendor.id ? vendor : v)),
    }));
  };

  const deleteVendor = (id: string) => {
    setWeddingData((prev) => ({
      ...prev,
      vendors: prev.vendors.filter((v) => v.id !== id),
    }));
  };

  // Todo functions
  const addTodo = (todo: Omit<TodoItem, 'id'>) => {
    const newTodo: TodoItem = {
      id: generateId(),
      ...todo,
    };
    setWeddingData((prev) => ({
      ...prev,
      todos: [...prev.todos, newTodo],
    }));
  };

  const updateTodo = (todo: TodoItem) => {
    setWeddingData((prev) => ({
      ...prev,
      todos: prev.todos.map((t) => (t.id === todo.id ? todo : t)),
    }));
  };

  const deleteTodo = (id: string) => {
    setWeddingData((prev) => ({
      ...prev,
      todos: prev.todos.filter((t) => t.id !== id),
    }));
  };

  // Note functions
  const addNote = (note: Omit<Note, 'id' | 'createdAt'>) => {
    const newNote: Note = {
      id: generateId(),
      ...note,
      createdAt: new Date().toISOString(),
    };
    setWeddingData((prev) => ({
      ...prev,
      notes: [...prev.notes, newNote],
    }));
  };

  const updateNote = (note: Note) => {
    setWeddingData((prev) => ({
      ...prev,
      notes: prev.notes.map((n) => (n.id === note.id ? note : n)),
    }));
  };

  const deleteNote = (id: string) => {
    setWeddingData((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== id),
    }));
  };

  // Export data
  const exportData = () => {
    try {
      const dataStr = JSON.stringify(weddingData, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileDefaultName = `wedding-planner-export-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "Export successful",
        description: "Your wedding planning data has been exported.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "There was an error exporting your data.",
      });
    }
  };

  // Import data
  const importData = (jsonData: string): boolean => {
    try {
      const parsedData = JSON.parse(jsonData) as WeddingData;
      
      // Basic validation
      if (!parsedData.budgetCategories || !parsedData.events || !parsedData.guests) {
        throw new Error('Invalid data format');
      }
      
      setWeddingData(parsedData);
      
      toast({
        title: "Import successful",
        description: "Your wedding planning data has been imported.",
      });
      
      return true;
    } catch (error) {
      console.error('Import error:', error);
      
      toast({
        variant: "destructive",
        title: "Import failed",
        description: "The file you provided is not valid wedding planning data.",
      });
      
      return false;
    }
  };

  return (
    <WeddingContext.Provider
      value={{
        weddingData,
        isLoading,
        setWeddingData,
        updateTotalBudget,
        addBudgetCategory,
        updateBudgetCategory,
        deleteBudgetCategory,
        addBudgetItem,
        updateBudgetItem,
        deleteBudgetItem,
        addEvent,
        updateEvent,
        deleteEvent,
        addGuestGroup,
        updateGuestGroup,
        deleteGuestGroup,
        addGuest,
        updateGuest,
        deleteGuest,
        addVendor,
        updateVendor,
        deleteVendor,
        addTodo,
        updateTodo,
        deleteTodo,
        addNote,
        updateNote,
        deleteNote,
        exportData,
        importData,
      }}
    >
      {children}
    </WeddingContext.Provider>
  );
}
