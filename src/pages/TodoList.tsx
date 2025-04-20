
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { ListChecks } from 'lucide-react';

const TodoList = () => {
  return (
    <Layout title="To-Do List">
      <Card className="wedding-card">
        <CardContent className="pt-6 text-center py-20">
          <ListChecks className="h-16 w-16 mx-auto mb-4 text-wedding-red/60" />
          <h2 className="text-2xl font-semibold mb-2">Wedding To-Do List</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            This feature is coming soon! You'll be able to track all your wedding tasks, set priorities, and mark them as complete.
          </p>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default TodoList;
