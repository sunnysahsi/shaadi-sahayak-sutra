
import React, { useState, useRef } from 'react';
import { Plus, Edit, Trash2, Image, FileText, Calendar } from 'lucide-react';
import { useWedding, Note } from '@/contexts/WeddingContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const NotesInspiration = () => {
  const { weddingData, addNote, updateNote, deleteNote } = useWedding();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Open dialog
  const openDialog = (note: Note | null = null) => {
    if (note) {
      setCurrentNote(note);
      setIsEditing(true);
    } else {
      setCurrentNote({
        id: '',
        title: '',
        content: '',
        images: [],
        createdAt: '',
      });
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };

  // Save note
  const handleSaveNote = () => {
    if (!currentNote || !currentNote.title) return;
    
    if (isEditing && currentNote.id) {
      updateNote(currentNote);
    } else {
      const { id, createdAt, ...noteWithoutId } = currentNote;
      addNote(noteWithoutId);
    }
    
    setIsDialogOpen(false);
    setCurrentNote(null);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Handle image uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !currentNote) return;
    
    const maxSize = 5 * 1024 * 1024; // 5MB limit
    const newImages: string[] = [...currentNote.images];
    
    Array.from(files).forEach(file => {
      // Validate file size
      if (file.size > maxSize) {
        toast({
          title: "Image too large",
          description: `${file.name} exceeds the 5MB limit.`,
          variant: "destructive",
        });
        return;
      }
      
      // Read and convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          newImages.push(reader.result);
          setCurrentNote(prev => prev ? { ...prev, images: newImages } : prev);
        }
      };
      reader.readAsDataURL(file);
    });
    
    // Reset file input
    e.target.value = '';
  };

  // Remove image
  const removeImage = (index: number) => {
    if (!currentNote) return;
    
    const newImages = [...currentNote.images];
    newImages.splice(index, 1);
    setCurrentNote({ ...currentNote, images: newImages });
  };

  return (
    <Layout title="Notes & Inspiration">
      <div className="space-y-6">
        {/* Add Note Button */}
        <div className="flex justify-end">
          <Button 
            onClick={() => openDialog()} 
            className="wedding-btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {weddingData.notes.map((note) => (
            <Card key={note.id} className="wedding-card overflow-hidden">
              <div className="absolute top-0 right-0 p-2 flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openDialog(note)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteNote(note.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <CardContent className="pt-6">
                <div className="mb-2">
                  <h3 className="text-xl font-semibold">{note.title}</h3>
                  <p className="text-xs text-gray-500 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(note.createdAt)}
                  </p>
                </div>

                <p className="text-sm text-gray-600 mb-4">{note.content}</p>

                {note.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {note.images.map((img, index) => (
                      <div key={index} className="relative aspect-video rounded-md overflow-hidden">
                        <img 
                          src={img} 
                          alt={`Note image ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {weddingData.notes.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 mb-4">No notes or inspiration added yet</p>
            <Button 
              onClick={() => openDialog()}
              className="wedding-btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Note
            </Button>
          </div>
        )}
      </div>

      {/* Note Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Note' : 'Add Note'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input 
                placeholder="e.g., Wedding Dress Ideas"
                value={currentNote?.title || ''}
                onChange={(e) => setCurrentNote(prev => 
                  prev ? { ...prev, title: e.target.value } : prev
                )}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Textarea 
                placeholder="Write your notes or ideas here..."
                value={currentNote?.content || ''}
                onChange={(e) => setCurrentNote(prev => 
                  prev ? { ...prev, content: e.target.value } : prev
                )}
                rows={5}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Images</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
                multiple
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Image className="h-4 w-4 mr-2" />
                Add Images
              </Button>
              <p className="text-xs text-gray-500 mt-1">
                You can upload multiple images (max 5MB each).
              </p>
            </div>
            
            {currentNote?.images && currentNote.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {currentNote.images.map((img, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={img} 
                      alt={`Uploaded image ${index + 1}`} 
                      className="h-20 w-full object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNote}>
              {isEditing ? 'Update' : 'Add'} Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default NotesInspiration;
