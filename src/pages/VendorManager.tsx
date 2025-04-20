
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Store, DollarSign } from 'lucide-react';
import { useWedding, Vendor } from '@/contexts/WeddingContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const VendorManager = () => {
  const { weddingData, addVendor, updateVendor, deleteVendor } = useWedding();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentVendor, setCurrentVendor] = useState<Vendor | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | 'all'>('all');
  
  // List of common vendor categories for Indian weddings
  const commonCategories = [
    'Venue',
    'Catering',
    'Decoration',
    'Photography',
    'Videography',
    'Makeup Artist',
    'Mehendi Artist',
    'Music',
    'Transportation',
    'Wedding Attire',
    'Jewelry',
    'Invitation Cards',
    'Event Planner',
    'Priest',
    'Other'
  ];

  // Open dialog
  const openDialog = (vendor: Vendor | null = null) => {
    if (vendor) {
      setCurrentVendor(vendor);
      setIsEditing(true);
    } else {
      setCurrentVendor({
        id: '',
        name: '',
        category: 'Venue',
        phone: '',
        email: '',
        cost: 0,
        notes: '',
      });
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };

  // Save vendor
  const handleSaveVendor = () => {
    if (!currentVendor || !currentVendor.name) return;
    
    if (isEditing && currentVendor.id) {
      updateVendor(currentVendor);
    } else {
      const { id, ...vendorWithoutId } = currentVendor;
      addVendor(vendorWithoutId);
    }
    
    setIsDialogOpen(false);
    setCurrentVendor(null);
  };

  // Format currency in Indian format
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get all vendor categories from the data
  const getVendorCategories = () => {
    const categories = new Set<string>();
    weddingData.vendors.forEach(vendor => {
      categories.add(vendor.category);
    });
    return Array.from(categories).sort();
  };

  // Get filtered vendors
  const getFilteredVendors = () => {
    if (categoryFilter === 'all') {
      return weddingData.vendors;
    }
    return weddingData.vendors.filter(vendor => vendor.category === categoryFilter);
  };

  // Group vendors by category
  const getVendorsByCategory = () => {
    const grouped: Record<string, Vendor[]> = {};
    
    weddingData.vendors.forEach(vendor => {
      if (!grouped[vendor.category]) {
        grouped[vendor.category] = [];
      }
      grouped[vendor.category].push(vendor);
    });
    
    return grouped;
  };

  const vendorCategories = getVendorCategories();
  const filteredVendors = getFilteredVendors();
  const vendorsByCategory = getVendorsByCategory();
  
  // Get total vendor cost
  const totalVendorCost = weddingData.vendors.reduce((sum, vendor) => sum + vendor.cost, 0);

  return (
    <Layout title="Vendor Manager">
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="list" className="flex-1">List View</TabsTrigger>
          <TabsTrigger value="category" className="flex-1">Category View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <div className="space-y-6">
            {/* Summary */}
            <Card className="wedding-card">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Total Vendors</p>
                    <p className="text-2xl font-semibold">{weddingData.vendors.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Cost</p>
                    <p className="text-2xl font-semibold">{formatCurrency(totalVendorCost)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Filters and Add Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {vendorCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                onClick={() => openDialog()} 
                className="wedding-btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Vendor
              </Button>
            </div>
            
            {/* Vendor List */}
            <Card className="wedding-card">
              <CardHeader className="pb-2">
                <CardTitle>Vendors</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredVendors.length > 0 ? (
                  <div className="rounded-lg overflow-hidden border border-gray-200">
                    <table className="w-full border-collapse">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Name</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Category</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 hidden md:table-cell">Contact</th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Cost</th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredVendors.map((vendor) => (
                          <tr key={vendor.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">{vendor.name}</td>
                            <td className="px-4 py-3 text-sm">{vendor.category}</td>
                            <td className="px-4 py-3 text-sm hidden md:table-cell">
                              <div className="space-y-1">
                                {vendor.phone && <div>{vendor.phone}</div>}
                                {vendor.email && <div className="text-gray-500">{vendor.email}</div>}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-right">{formatCurrency(vendor.cost)}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openDialog(vendor)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteVendor(vendor.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <Store className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    {weddingData.vendors.length === 0 ? (
                      <>
                        <p className="text-gray-500 mb-4">No vendors added yet</p>
                        <Button 
                          onClick={() => openDialog()}
                          className="wedding-btn-primary"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Vendor
                        </Button>
                      </>
                    ) : (
                      <p className="text-gray-500">No vendors in this category</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="category">
          <div className="space-y-6">
            {/* Add Button */}
            <div className="flex justify-end">
              <Button 
                onClick={() => openDialog()} 
                className="wedding-btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Vendor
              </Button>
            </div>
            
            {/* Vendor Categories */}
            {Object.keys(vendorsByCategory).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(vendorsByCategory).map(([category, vendors]) => (
                  <Card key={category} className="wedding-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex justify-between items-center">
                        <span>{category}</span>
                        <span className="text-sm font-normal text-gray-500">
                          {vendors.length} vendor{vendors.length !== 1 ? 's' : ''}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {vendors.map(vendor => (
                          <div key={vendor.id} className="p-4 border rounded-lg relative">
                            <div className="absolute top-2 right-2 flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDialog(vendor)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteVendor(vendor.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <h3 className="font-medium text-lg mb-2 pr-16">{vendor.name}</h3>
                            
                            <div className="flex items-center text-wedding-red mb-2">
                              <DollarSign className="h-4 w-4 mr-1" />
                              <span>{formatCurrency(vendor.cost)}</span>
                            </div>
                            
                            <div className="text-sm space-y-2">
                              {vendor.phone && (
                                <p>Phone: {vendor.phone}</p>
                              )}
                              {vendor.email && (
                                <p>Email: {vendor.email}</p>
                              )}
                              {vendor.notes && (
                                <div>
                                  <p className="font-medium mt-2">Notes:</p>
                                  <p className="text-gray-600">{vendor.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <Store className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500 mb-4">No vendors added yet</p>
                <Button 
                  onClick={() => openDialog()}
                  className="wedding-btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Vendor
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Vendor Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Vendor' : 'Add Vendor'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Vendor Name</label>
              <Input 
                placeholder="e.g., Grand Palace Hotel"
                value={currentVendor?.name || ''}
                onChange={(e) => setCurrentVendor(prev => 
                  prev ? { ...prev, name: e.target.value } : prev
                )}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={currentVendor?.category || ''}
                onValueChange={(value) => setCurrentVendor(prev => 
                  prev ? { ...prev, category: value } : prev
                )}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {commonCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input 
                placeholder="e.g., +91 98765 43210"
                value={currentVendor?.phone || ''}
                onChange={(e) => setCurrentVendor(prev => 
                  prev ? { ...prev, phone: e.target.value } : prev
                )}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input 
                type="email"
                placeholder="e.g., contact@vendor.com"
                value={currentVendor?.email || ''}
                onChange={(e) => setCurrentVendor(prev => 
                  prev ? { ...prev, email: e.target.value } : prev
                )}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Cost (₹)</label>
              <Input 
                type="number"
                placeholder="0"
                value={currentVendor?.cost || ''}
                onChange={(e) => setCurrentVendor(prev => 
                  prev ? { ...prev, cost: parseFloat(e.target.value) || 0 } : prev
                )}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea 
                placeholder="Add any details or notes here..."
                value={currentVendor?.notes || ''}
                onChange={(e) => setCurrentVendor(prev => 
                  prev ? { ...prev, notes: e.target.value } : prev
                )}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveVendor}>
              {isEditing ? 'Update' : 'Add'} Vendor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default VendorManager;
