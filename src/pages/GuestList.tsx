
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

const GuestList = () => {
  return (
    <Layout title="Guest List">
      <Card className="wedding-card">
        <CardContent className="pt-6 text-center py-20">
          <Users className="h-16 w-16 mx-auto mb-4 text-wedding-red/60" />
          <h2 className="text-2xl font-semibold mb-2">Guest List Management</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            This feature is coming soon! You'll be able to manage your guest list, track RSVPs, and organize guests by groups.
          </p>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default GuestList;
