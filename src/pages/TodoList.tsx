
import React, { useState } from 'react';
import { Check, Calendar, Plus, Edit, Trash2, ListChecks } from 'lucide-react';
import { useWedding, TodoItem } from '@/contexts/WeddingContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const TodoList = () => {
  const { weddingData, addTodo, updateTodo, deleteTodo } = useWedding();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTodo, setCurrentTodo] = useState<TodoItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate'>('priority');

  // Open dialog
  const openDialog = (todo: TodoItem | null = null) => {
    if (todo) {
      setCurrentTodo(todo);
      setIsEditing(true);
    } else {
      setCurrentTodo({
        id: '',
        task: '',
        dueDate: null,
        isCompleted: false,
        priority: 'medium',
      });
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };

  // Save todo
  const handleSaveTodo = () => {
    if (!currentTodo || !currentTodo.task) return;
    
    if (isEditing && currentTodo.id) {
      updateTodo(currentTodo);
    } else {
      const { id, ...todoWithoutId } = currentTodo;
      addTodo(todoWithoutId);
    }
    
    setIsDialogOpen(false);
    setCurrentTodo(null);
  };

  // Toggle completion
  const toggleTodoCompletion = (todo: TodoItem) => {
    updateTodo({
      ...todo,
      isCompleted: !todo.isCompleted,
    });
  };

  // Sort todos
  const getSortedTodos = () => {
    const todos = [...weddingData.todos];
    
    if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return todos.sort((a, b) => {
        if (a.isCompleted === b.isCompleted) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return a.isCompleted ? 1 : -1;
      });
    } else {
      return todos.sort((a, b) => {
        if (a.isCompleted === b.isCompleted) {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return a.isCompleted ? 1 : -1;
      });
    }
  };

  // Format date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get priority badge color
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-wedding-red">High</Badge>;
      case 'medium':
        return <Badge className="bg-orange-500">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-600">Low</Badge>;
      default:
        return <Badge>Medium</Badge>;
    }
  };

  const sortedTodos = getSortedTodos();

  return (
    <Layout title="To-Do List">
      <div className="space-y-6">
        {/* Header with add button and sort controls */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Sort by:</span>
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as 'priority' | 'dueDate')}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="dueDate">Due Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={() => openDialog()} 
            className="wedding-btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Todo list */}
        <Card className="wedding-card">
          <CardHeader className="pb-2">
            <CardTitle>Wedding Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sortedTodos.map((todo) => (
                <div 
                  key={todo.id} 
                  className={`flex items-center justify-between p-3 rounded-md border ${
                    todo.isCompleted ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      checked={todo.isCompleted}
                      onCheckedChange={() => toggleTodoCompletion(todo)}
                      className={todo.isCompleted ? 'bg-green-600 text-white' : ''}
                    />
                    <div className={`space-y-1 ${todo.isCompleted ? 'line-through text-gray-500' : ''}`}>
                      <p className="font-medium">{todo.task}</p>
                      <div className="flex items-center space-x-2 text-sm">
                        {getPriorityBadge(todo.priority)}
                        {todo.dueDate && (
                          <div className="flex items-center text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{formatDate(todo.dueDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => openDialog(todo)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => deleteTodo(todo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {sortedTodos.length === 0 && (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                  <ListChecks className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500 mb-4">No tasks added yet</p>
                  <Button 
                    onClick={() => openDialog()}
                    className="wedding-btn-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Task
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Todo Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Task' : 'Add Task'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Task</label>
              <Input 
                placeholder="e.g., Book wedding venue"
                value={currentTodo?.task || ''}
                onChange={(e) => setCurrentTodo(prev => 
                  prev ? { ...prev, task: e.target.value } : prev
                )}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Due Date (Optional)</label>
              <Input 
                type="date"
                value={currentTodo?.dueDate || ''}
                onChange={(e) => setCurrentTodo(prev => 
                  prev ? { ...prev, dueDate: e.target.value || null } : prev
                )}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={currentTodo?.priority || 'medium'}
                onValueChange={(value) => setCurrentTodo(prev => 
                  prev ? { ...prev, priority: value as 'high' | 'medium' | 'low' } : prev
                )}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="completed"
                checked={currentTodo?.isCompleted || false}
                onCheckedChange={(checked) => setCurrentTodo(prev => 
                  prev ? { ...prev, isCompleted: checked === true } : prev
                )}
              />
              <label htmlFor="completed" className="text-sm font-medium">Mark as completed</label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTodo}>
              {isEditing ? 'Update' : 'Add'} Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default TodoList;
