
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const NotesInspiration = () => {
  return (
    <Layout title="Notes & Inspiration">
      <Card className="wedding-card">
        <CardContent className="pt-6 text-center py-20">
          <FileText className="h-16 w-16 mx-auto mb-4 text-wedding-red/60" />
          <h2 className="text-2xl font-semibold mb-2">Wedding Notes & Inspiration</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            This feature is coming soon! You'll be able to save notes, ideas, and inspiration for your wedding planning.
          </p>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default NotesInspiration;
