
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { useWedding, Event } from '@/contexts/WeddingContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const EventSchedule = () => {
  const { weddingData, addEvent, updateEvent, deleteEvent } = useWedding();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Open dialog
  const openDialog = (event: Event | null = null) => {
    if (event) {
      setCurrentEvent(event);
      setIsEditing(true);
    } else {
      setCurrentEvent({
        id: '',
        title: '',
        date: '',
        time: '',
        venue: '',
        notes: '',
      });
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };

  // Save event
  const handleSaveEvent = () => {
    if (!currentEvent || !currentEvent.title) return;
    
    if (isEditing && currentEvent.id) {
      updateEvent(currentEvent);
    } else {
      const { id, ...eventWithoutId } = currentEvent;
      addEvent(eventWithoutId);
    }
    
    setIsDialogOpen(false);
    setCurrentEvent(null);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Date not set';
    
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Sort events by date
  const sortedEvents = [...weddingData.events].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return (
    <Layout title="Event Schedule">
      <div className="space-y-6">
        {/* Add Event Button */}
        <div className="flex justify-end">
          <Button 
            onClick={() => openDialog()}
            className="wedding-btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>

        {/* Events List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedEvents.map((event) => (
            <Card key={event.id} className="wedding-card overflow-hidden">
              <div className="absolute top-0 right-0 p-2 flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openDialog(event)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteEvent(event.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-wedding-red/10 p-3 rounded-full">
                    <Calendar className="h-5 w-5 text-wedding-red" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{event.title}</h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(event.date)} - {event.time || 'Time not set'}
                    </p>
                  </div>
                </div>

                {event.venue && (
                  <div className="mb-2">
                    <p className="text-sm font-medium">Venue:</p>
                    <p>{event.venue}</p>
                  </div>
                )}

                {event.notes && (
                  <div>
                    <p className="text-sm font-medium">Notes:</p>
                    <p className="text-sm text-gray-600">{event.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {sortedEvents.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-4">No events scheduled yet</p>
            <Button 
              onClick={() => openDialog()}
              className="wedding-btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Event
            </Button>
          </div>
        )}
      </div>

      {/* Event Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Event' : 'Add Event'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Title</label>
              <Input 
                placeholder="e.g., Wedding Ceremony"
                value={currentEvent?.title || ''}
                onChange={(e) => setCurrentEvent(prev => 
                  prev ? { ...prev, title: e.target.value } : prev
                )}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input 
                type="date"
                value={currentEvent?.date || ''}
                onChange={(e) => setCurrentEvent(prev => 
                  prev ? { ...prev, date: e.target.value } : prev
                )}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Time</label>
              <Input 
                type="time"
                value={currentEvent?.time || ''}
                onChange={(e) => setCurrentEvent(prev => 
                  prev ? { ...prev, time: e.target.value } : prev
                )}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Venue</label>
              <Input 
                placeholder="e.g., Grand Ballroom"
                value={currentEvent?.venue || ''}
                onChange={(e) => setCurrentEvent(prev => 
                  prev ? { ...prev, venue: e.target.value } : prev
                )}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea 
                placeholder="Add any details or notes here..."
                value={currentEvent?.notes || ''}
                onChange={(e) => setCurrentEvent(prev => 
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
            <Button onClick={handleSaveEvent}>
              {isEditing ? 'Update' : 'Add'} Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default EventSchedule;
