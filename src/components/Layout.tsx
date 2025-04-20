
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, ListChecks, Users, FileText, DollarSign, BookOpen, Menu, X } from 'lucide-react';
import ImportExportModal from './ImportExportModal';

type LayoutProps = {
  children: React.ReactNode;
  title: string;
};

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when changing routes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { path: '/', label: 'Home', icon: <BookOpen className="w-5 h-5" /> },
    { path: '/budget', label: 'Budget', icon: <DollarSign className="w-5 h-5" /> },
    { path: '/events', label: 'Events', icon: <Calendar className="w-5 h-5" /> },
    { path: '/todos', label: 'To-Do List', icon: <ListChecks className="w-5 h-5" /> },
    { path: '/guests', label: 'Guest List', icon: <Users className="w-5 h-5" /> },
    { path: '/vendors', label: 'Vendors', icon: <Users className="w-5 h-5" /> },
    { path: '/notes', label: 'Notes & Ideas', icon: <FileText className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-wedding-red text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl md:text-2xl font-semibold">शादी सहायक सूत्र</span>
            <span className="text-lg md:text-xl">(Shaadi Sahayak Sutra)</span>
          </Link>
          
          <div className="hidden md:flex space-x-4 items-center">
            <button 
              onClick={() => setIsImportExportModalOpen(true)} 
              className="wedding-btn-secondary text-sm"
            >
              Import/Export
            </button>
            
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-wedding-red/90"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-full hover:bg-wedding-red/90"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:block w-64 bg-gray-50 border-r shadow-sm">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-md transition-colors ${
                  location.pathname === item.path
                    ? 'bg-wedding-red/10 text-wedding-red font-medium'
                    : 'hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}

            <button 
              onClick={() => setIsImportExportModalOpen(true)}
              className="w-full mt-6 text-left flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 transition-colors"
            >
              <FileText className="w-5 h-5" />
              <span>Import/Export Data</span>
            </button>
          </nav>
        </aside>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
            <div className="bg-white h-full w-64 shadow-xl transform transition-transform duration-300 ease-in-out">
              <div className="p-4 border-b">
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="p-4 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 p-3 rounded-md transition-colors ${
                      location.pathname === item.path
                        ? 'bg-wedding-red/10 text-wedding-red font-medium'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}

                <button 
                  onClick={() => {
                    setIsImportExportModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full mt-6 text-left flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  <span>Import/Export Data</span>
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="container mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">{title}</h1>
            {children}
          </div>
        </main>
      </div>

      {/* Import/Export Modal */}
      <ImportExportModal 
        isOpen={isImportExportModalOpen} 
        setIsOpen={setIsImportExportModalOpen} 
      />
    </div>
  );
};

export default Layout;
