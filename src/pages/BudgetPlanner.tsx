import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, Edit, Trash2, Check, X, FileText } from 'lucide-react';
import { useWedding } from '@/contexts/WeddingContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import PDFExportModal from '@/components/PDFExportModal';
import ResetDataDialog from '@/components/ResetDataDialog';

const BudgetPlanner = () => {
  const { weddingData, updateTotalBudget, addBudgetCategory, updateBudgetCategory, 
          deleteBudgetCategory, addBudgetItem, updateBudgetItem, deleteBudgetItem } = useWedding();
  
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [newTotalBudget, setNewTotalBudget] = useState(weddingData.totalBudget.toString());
  
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null);
  const [currentItem, setCurrentItem] = useState<BudgetItem | null>(null);
  const [isEditingItem, setIsEditingItem] = useState(false);

  const totalBudget = weddingData.totalBudget;
  const estimatedTotal = weddingData.budgetCategories.reduce(
    (acc, category) => 
      acc + category.items.reduce((sum, item) => sum + item.estimatedCost, 0),
    0
  );
  const actualTotal = weddingData.budgetCategories.reduce(
    (acc, category) => 
      acc + category.items.reduce((sum, item) => sum + (item.actualCost || 0), 0),
    0
  );
  const remainingBudget = totalBudget - actualTotal;
  const budgetProgress = (actualTotal / totalBudget) * 100;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSaveTotalBudget = () => {
    const newTotal = parseFloat(newTotalBudget);
    if (!isNaN(newTotal)) {
      updateTotalBudget(newTotal);
    }
    setIsEditingTotal(false);
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addBudgetCategory(newCategoryName.trim());
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  const handleUpdateCategory = (id: string) => {
    if (editingCategoryName.trim()) {
      updateBudgetCategory(id, editingCategoryName.trim());
      setEditingCategoryId(null);
      setEditingCategoryName('');
    }
  };

  const chartData = weddingData.budgetCategories.map((category) => {
    const total = category.items.reduce((sum, item) => sum + (item.actualCost || 0), 0);
    return {
      name: category.name,
      value: total,
    };
  }).filter(item => item.value > 0);

  const COLORS = ['#D32F2F', '#E6A817', '#9C27B0', '#00796B', '#FF5722', '#800020', '#FF69B4'];

  const openItemDialog = (categoryId: string, item: BudgetItem | null = null) => {
    setCurrentCategoryId(categoryId);
    if (item) {
      setCurrentItem(item);
      setIsEditingItem(true);
    } else {
      setCurrentItem({
        id: '',
        name: '',
        estimatedCost: 0,
        actualCost: 0,
        isPaid: false,
        notes: '',
      });
      setIsEditingItem(false);
    }
    setIsItemDialogOpen(true);
  };

  const handleSaveItem = () => {
    if (!currentCategoryId || !currentItem || !currentItem.name) return;
    
    if (isEditingItem && currentItem.id) {
      updateBudgetItem(currentCategoryId, currentItem);
    } else {
      const { id, ...itemWithoutId } = currentItem;
      addBudgetItem(currentCategoryId, itemWithoutId);
    }
    
    setIsItemDialogOpen(false);
    setCurrentCategoryId(null);
    setCurrentItem(null);
  };

  return (
    <Layout title="Budget Planner">
      <div className="space-y-6">
        <Card className="wedding-card relative">
          <CardHeader className="pb-2">
            <CardTitle className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-2">
                <span>Budget Summary</span>
                {isEditingTotal ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={newTotalBudget}
                      onChange={(e) => setNewTotalBudget(e.target.value)}
                      className="w-32"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={handleSaveTotalBudget}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setIsEditingTotal(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setIsEditingTotal(true)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <PDFExportModal />
                <ResetDataDialog />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <p className="text-sm text-gray-500">Total Budget</p>
                <p className="text-xl font-semibold">{formatCurrency(totalBudget)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <p className="text-sm text-gray-500">Spent So Far</p>
                <p className="text-xl font-semibold">{formatCurrency(actualTotal)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md text-center">
                <p className="text-sm text-gray-500">Remaining</p>
                <p className={`text-xl font-semibold ${remainingBudget < 0 ? 'text-wedding-red' : ''}`}>
                  {formatCurrency(remainingBudget)}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Budget Used</span>
                <span>{budgetProgress.toFixed(1)}%</span>
              </div>
              <Progress value={budgetProgress} className="h-2" />
            </div>

            {chartData.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium mb-4">Expense Breakdown</h3>
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="wedding-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex justify-between items-center">
              <span>Budget Categories</span>
              {isAddingCategory ? (
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Category Name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-40"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleAddCategory}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setIsAddingCategory(false);
                      setNewCategoryName('');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsAddingCategory(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="space-y-4">
              {weddingData.budgetCategories.map((category) => {
                const categoryTotal = category.items.reduce(
                  (sum, item) => sum + (item.actualCost || 0),
                  0
                );
                
                return (
                  <AccordionItem 
                    key={category.id} 
                    value={category.id}
                    className="border-2 rounded-md px-4 overflow-hidden"
                  >
                    <AccordionTrigger className="py-4 hover:no-underline">
                      <div className="flex-1 flex justify-between items-center pr-4">
                        {editingCategoryId === category.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editingCategoryName}
                              onChange={(e) => setEditingCategoryName(e.target.value)}
                              className="w-40"
                            />
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleUpdateCategory(category.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setEditingCategoryId(null);
                                setEditingCategoryName('');
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <span className="font-medium">{category.name}</span>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingCategoryId(category.id);
                                  setEditingCategoryName(category.name);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteBudgetCategory(category.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                        <span className="text-sm font-medium">
                          {formatCurrency(categoryTotal)}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pb-4">
                      <div className="rounded-lg overflow-hidden">
                        <table className="w-full border-collapse">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Item</th>
                              <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Estimated</th>
                              <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Actual</th>
                              <th className="px-4 py-2 text-center text-sm font-medium text-gray-500">Paid</th>
                              <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {category.items.map((item) => (
                              <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm">{item.name}</td>
                                <td className="px-4 py-3 text-sm text-right">
                                  {formatCurrency(item.estimatedCost)}
                                </td>
                                <td className="px-4 py-3 text-sm text-right">
                                  {formatCurrency(item.actualCost || 0)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <Checkbox
                                    checked={item.isPaid}
                                    onCheckedChange={(checked) => {
                                      updateBudgetItem(category.id, {
                                        ...item,
                                        isPaid: checked === true,
                                      });
                                    }}
                                  />
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => openItemDialog(category.id, item)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => deleteBudgetItem(category.id, item.id)}
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
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openItemDialog(category.id)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>

            {weddingData.budgetCategories.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <p className="text-gray-500 mb-2">No budget categories yet</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsAddingCategory(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Category
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditingItem ? 'Edit Budget Item' : 'Add Budget Item'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Item Name</label>
              <Input 
                placeholder="e.g., Venue Booking"
                value={currentItem?.name || ''}
                onChange={(e) => setCurrentItem(prev => 
                  prev ? { ...prev, name: e.target.value } : prev
                )}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Estimated Cost (���)</label>
              <Input 
                type="number"
                placeholder="0"
                value={currentItem?.estimatedCost || ''}
                onChange={(e) => setCurrentItem(prev => 
                  prev ? { ...prev, estimatedCost: parseFloat(e.target.value) || 0 } : prev
                )}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Actual Cost (₹)</label>
              <Input 
                type="number"
                placeholder="0"
                value={currentItem?.actualCost || ''}
                onChange={(e) => setCurrentItem(prev => 
                  prev ? { ...prev, actualCost: parseFloat(e.target.value) || 0 } : prev
                )}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox 
                id="paid"
                checked={currentItem?.isPaid || false}
                onCheckedChange={(checked) => setCurrentItem(prev => 
                  prev ? { ...prev, isPaid: checked === true } : prev
                )}
              />
              <label htmlFor="paid" className="text-sm font-medium">Paid</label>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea 
                placeholder="Add any details or notes here..."
                value={currentItem?.notes || ''}
                onChange={(e) => setCurrentItem(prev => 
                  prev ? { ...prev, notes: e.target.value } : prev
                )}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsItemDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveItem}>
              {isEditingItem ? 'Update' : 'Add'} Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default BudgetPlanner;
