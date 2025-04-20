
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, ListChecks, DollarSign, FileText } from 'lucide-react';
import { useWedding } from '@/contexts/WeddingContext';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Layout from '@/components/Layout';

const Index = () => {
  const { weddingData, isLoading } = useWedding();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 w-16 h-16 border-4 border-wedding-red border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg">Loading your wedding planner...</p>
        </div>
      </div>
    );
  }

  // Calculate budget statistics
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

  // Calculate task statistics
  const totalTasks = weddingData.todos.length;
  const completedTasks = weddingData.todos.filter(todo => todo.isCompleted).length;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Format currency in Indian format
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Layout title="Wedding Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Budget Summary Card */}
        <Card className="wedding-card col-span-1 md:col-span-2">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-wedding-red" />
                Budget Summary
              </h2>
              <Link to="/budget" className="text-sm text-wedding-red hover:underline">
                Manage Budget →
              </Link>
            </div>
            
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
          </CardContent>
        </Card>

        {/* Events Card */}
        <Card className="wedding-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-wedding-red" />
                Upcoming Events
              </h2>
              <Link to="/events" className="text-sm text-wedding-red hover:underline">
                View All →
              </Link>
            </div>
            
            <div className="space-y-3">
              {weddingData.events
                .filter(event => event.date) // Only show events with dates
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 3)
                .map(event => (
                  <div key={event.id} className="bg-gray-50 p-3 rounded-md">
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-gray-500">
                      {event.date ? new Date(event.date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Date not set'} - {event.time}
                    </div>
                    {event.venue && <div className="text-sm">{event.venue}</div>}
                  </div>
                ))}
              
              {weddingData.events.filter(event => event.date).length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                  <p>No events scheduled yet</p>
                  <Link to="/events" className="text-wedding-red text-sm hover:underline inline-block mt-2">
                    Add your first event
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* To-Do List Card */}
        <Card className="wedding-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-wedding-red" />
                To-Do List
              </h2>
              <Link to="/todos" className="text-sm text-wedding-red hover:underline">
                View All →
              </Link>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Tasks Completed</span>
                <span>{completedTasks} of {totalTasks}</span>
              </div>
              <Progress value={taskProgress} className="h-2" />
            </div>
            
            <div className="space-y-2">
              {weddingData.todos
                .filter(todo => !todo.isCompleted)
                .slice(0, 4)
                .map(todo => (
                  <div key={todo.id} className="flex items-center gap-2 p-2 border-b">
                    <div className="w-3 h-3 rounded-full bg-wedding-red opacity-80"></div>
                    <span className="text-sm">{todo.task}</span>
                    {todo.priority === 'high' && (
                      <span className="ml-auto text-xs px-2 py-0.5 bg-wedding-red/10 text-wedding-red rounded-full">
                        High
                      </span>
                    )}
                  </div>
                ))}
                
              {weddingData.todos.filter(todo => !todo.isCompleted).length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <p>All tasks completed!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Guest List Card */}
        <Card className="wedding-card">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-wedding-red" />
                Guest List
              </h2>
              <Link to="/guests" className="text-sm text-wedding-red hover:underline">
                Manage Guests →
              </Link>
            </div>
            
            <div className="text-center py-3">
              <div className="text-3xl font-bold text-wedding-red">{weddingData.guests.length}</div>
              <div className="text-sm text-gray-500">Total Guests</div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="bg-gray-50 p-2 rounded-md text-center">
                <div className="text-lg font-semibold">
                  {weddingData.guests.filter(g => g.rsvpStatus === 'confirmed').length}
                </div>
                <div className="text-xs text-gray-500">Confirmed</div>
              </div>
              <div className="bg-gray-50 p-2 rounded-md text-center">
                <div className="text-lg font-semibold">
                  {weddingData.guests.filter(g => g.rsvpStatus === 'pending').length}
                </div>
                <div className="text-xs text-gray-500">Pending</div>
              </div>
              <div className="bg-gray-50 p-2 rounded-md text-center">
                <div className="text-lg font-semibold">
                  {weddingData.guests.filter(g => g.rsvpStatus === 'declined').length}
                </div>
                <div className="text-xs text-gray-500">Declined</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Quick Actions Card */}
        <Card className="wedding-card col-span-1 md:col-span-2">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <Link to="/budget" className="bg-gray-50 p-4 rounded-md text-center hover:bg-gray-100 transition-colors">
                <DollarSign className="w-6 h-6 mx-auto mb-2 text-wedding-red" />
                <span className="text-sm font-medium">Budget</span>
              </Link>
              
              <Link to="/events" className="bg-gray-50 p-4 rounded-md text-center hover:bg-gray-100 transition-colors">
                <Calendar className="w-6 h-6 mx-auto mb-2 text-wedding-red" />
                <span className="text-sm font-medium">Events</span>
              </Link>
              
              <Link to="/todos" className="bg-gray-50 p-4 rounded-md text-center hover:bg-gray-100 transition-colors">
                <ListChecks className="w-6 h-6 mx-auto mb-2 text-wedding-red" />
                <span className="text-sm font-medium">To-Do</span>
              </Link>
              
              <Link to="/guests" className="bg-gray-50 p-4 rounded-md text-center hover:bg-gray-100 transition-colors">
                <Users className="w-6 h-6 mx-auto mb-2 text-wedding-red" />
                <span className="text-sm font-medium">Guests</span>
              </Link>
              
              <Link to="/notes" className="bg-gray-50 p-4 rounded-md text-center hover:bg-gray-100 transition-colors">
                <FileText className="w-6 h-6 mx-auto mb-2 text-wedding-red" />
                <span className="text-sm font-medium">Notes</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;
