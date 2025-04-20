
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Users, UserPlus, UserCheck, Filter } from 'lucide-react';
import { useWedding, Guest, GuestGroup } from '@/contexts/WeddingContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const GuestList = () => {
  const { weddingData, addGuest, updateGuest, deleteGuest, 
          addGuestGroup, updateGuestGroup, deleteGuestGroup } = useWedding();
  
  const [isGuestDialogOpen, setIsGuestDialogOpen] = useState(false);
  const [currentGuest, setCurrentGuest] = useState<Guest | null>(null);
  const [isEditingGuest, setIsEditingGuest] = useState(false);
  
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<GuestGroup | null>(null);
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  
  const [filterGroup, setFilterGroup] = useState<string | 'all'>('all');
  const [filterRsvp, setFilterRsvp] = useState<string | 'all'>('all');

  // Open guest dialog
  const openGuestDialog = (guest: Guest | null = null) => {
    if (guest) {
      setCurrentGuest(guest);
      setIsEditingGuest(true);
    } else {
      setCurrentGuest({
        id: '',
        name: '',
        phone: '',
        email: '',
        groupId: null,
        rsvpStatus: 'pending',
      });
      setIsEditingGuest(false);
    }
    setIsGuestDialogOpen(true);
  };

  // Open group dialog
  const openGroupDialog = (group: GuestGroup | null = null) => {
    if (group) {
      setCurrentGroup(group);
      setIsEditingGroup(true);
    } else {
      setCurrentGroup({
        id: '',
        name: '',
      });
      setIsEditingGroup(false);
    }
    setIsGroupDialogOpen(true);
  };

  // Save guest
  const handleSaveGuest = () => {
    if (!currentGuest || !currentGuest.name) return;
    
    if (isEditingGuest && currentGuest.id) {
      updateGuest(currentGuest);
    } else {
      const { id, ...guestWithoutId } = currentGuest;
      addGuest(guestWithoutId);
    }
    
    setIsGuestDialogOpen(false);
    setCurrentGuest(null);
  };

  // Save group
  const handleSaveGroup = () => {
    if (!currentGroup || !currentGroup.name) return;
    
    if (isEditingGroup && currentGroup.id) {
      updateGuestGroup(currentGroup.id, currentGroup.name);
    } else {
      addGuestGroup(currentGroup.name);
    }
    
    setIsGroupDialogOpen(false);
    setCurrentGroup(null);
  };

  // Helper to get group name by ID
  const getGroupName = (groupId: string | null) => {
    if (!groupId) return 'None';
    const group = weddingData.guestGroups.find(g => g.id === groupId);
    return group ? group.name : 'None';
  };

  // Get filtered guests
  const getFilteredGuests = () => {
    return weddingData.guests.filter(guest => {
      const groupMatch = filterGroup === 'all' || guest.groupId === filterGroup || (filterGroup === 'none' && !guest.groupId);
      const rsvpMatch = filterRsvp === 'all' || guest.rsvpStatus === filterRsvp;
      return groupMatch && rsvpMatch;
    });
  };

  // Get RSVP badge color
  const getRsvpBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-600">Confirmed</Badge>;
      case 'declined':
        return <Badge className="bg-wedding-red">Declined</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };

  // Get count of guests by RSVP status
  const getGuestCounts = () => {
    const all = weddingData.guests.length;
    const confirmed = weddingData.guests.filter(g => g.rsvpStatus === 'confirmed').length;
    const declined = weddingData.guests.filter(g => g.rsvpStatus === 'declined').length;
    const pending = weddingData.guests.filter(g => g.rsvpStatus === 'pending').length;
    
    return { all, confirmed, declined, pending };
  };

  const guestCounts = getGuestCounts();
  const filteredGuests = getFilteredGuests();

  return (
    <Layout title="Guest List">
      <Tabs defaultValue="guests" className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="guests" className="flex-1">Guests</TabsTrigger>
          <TabsTrigger value="groups" className="flex-1">Groups</TabsTrigger>
        </TabsList>
        
        {/* Guests Tab */}
        <TabsContent value="guests">
          <div className="space-y-6">
            {/* Guest Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 flex flex-col items-center">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-semibold">{guestCounts.all}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center">
                  <p className="text-sm text-gray-500">Confirmed</p>
                  <p className="text-2xl font-semibold text-green-600">{guestCounts.confirmed}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center">
                  <p className="text-sm text-gray-500">Declined</p>
                  <p className="text-2xl font-semibold text-wedding-red">{guestCounts.declined}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center">
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-semibold text-yellow-500">{guestCounts.pending}</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Filters and Add Guest Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="text-sm">Filters:</span>
                </div>
                
                <Select
                  value={filterGroup}
                  onValueChange={setFilterGroup}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Groups</SelectItem>
                    <SelectItem value="none">No Group</SelectItem>
                    {weddingData.guestGroups.map(group => (
                      <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={filterRsvp}
                  onValueChange={setFilterRsvp}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="RSVP" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All RSVP</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={() => openGuestDialog()} 
                className="wedding-btn-primary"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Guest
              </Button>
            </div>
            
            {/* Guest List */}
            <Card className="wedding-card">
              <CardHeader className="pb-2">
                <CardTitle>Guest List</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredGuests.length > 0 ? (
                  <div className="rounded-lg overflow-hidden border border-gray-200">
                    <table className="w-full border-collapse">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Name</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 hidden md:table-cell">Contact</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 hidden md:table-cell">Group</th>
                          <th className="px-4 py-2 text-center text-sm font-medium text-gray-500">RSVP</th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredGuests.map((guest) => (
                          <tr key={guest.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">{guest.name}</td>
                            <td className="px-4 py-3 text-sm hidden md:table-cell">
                              <div className="space-y-1">
                                {guest.phone && <div>{guest.phone}</div>}
                                {guest.email && <div className="text-gray-500">{guest.email}</div>}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm hidden md:table-cell">{getGroupName(guest.groupId)}</td>
                            <td className="px-4 py-3 text-center">
                              {getRsvpBadge(guest.rsvpStatus)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openGuestDialog(guest)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteGuest(guest.id)}
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
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    {weddingData.guests.length === 0 ? (
                      <>
                        <p className="text-gray-500 mb-4">No guests added yet</p>
                        <Button 
                          onClick={() => openGuestDialog()}
                          className="wedding-btn-primary"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Your First Guest
                        </Button>
                      </>
                    ) : (
                      <p className="text-gray-500">No guests match your filter criteria</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Groups Tab */}
        <TabsContent value="groups">
          <div className="space-y-6">
            {/* Add Group Button */}
            <div className="flex justify-end">
              <Button 
                onClick={() => openGroupDialog()} 
                className="wedding-btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Group
              </Button>
            </div>
            
            {/* Groups List */}
            <Card className="wedding-card">
              <CardHeader className="pb-2">
                <CardTitle>Guest Groups</CardTitle>
              </CardHeader>
              <CardContent>
                {weddingData.guestGroups.length > 0 ? (
                  <div className="rounded-lg overflow-hidden border border-gray-200">
                    <table className="w-full border-collapse">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Group Name</th>
                          <th className="px-4 py-2 text-center text-sm font-medium text-gray-500">Guest Count</th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {weddingData.guestGroups.map((group) => {
                          const guestCount = weddingData.guests.filter(g => g.groupId === group.id).length;
                          
                          return (
                            <tr key={group.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm">{group.name}</td>
                              <td className="px-4 py-3 text-sm text-center">{guestCount}</td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openGroupDialog(group)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteGuestGroup(group.id)}
                                    disabled={guestCount > 0}
                                    title={guestCount > 0 ? "Cannot delete group with guests" : "Delete group"}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 mb-4">No guest groups added yet</p>
                    <Button 
                      onClick={() => openGroupDialog()}
                      className="wedding-btn-primary"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Group
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Guest Dialog */}
      <Dialog open={isGuestDialogOpen} onOpenChange={setIsGuestDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditingGuest ? 'Edit Guest' : 'Add Guest'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Guest Name</label>
              <Input 
                placeholder="e.g., Rajesh Sharma"
                value={currentGuest?.name || ''}
                onChange={(e) => setCurrentGuest(prev => 
                  prev ? { ...prev, name: e.target.value } : prev
                )}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input 
                placeholder="e.g., +91 98765 43210"
                value={currentGuest?.phone || ''}
                onChange={(e) => setCurrentGuest(prev => 
                  prev ? { ...prev, phone: e.target.value } : prev
                )}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input 
                type="email"
                placeholder="e.g., example@email.com"
                value={currentGuest?.email || ''}
                onChange={(e) => setCurrentGuest(prev => 
                  prev ? { ...prev, email: e.target.value } : prev
                )}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Group</label>
              <Select
                value={currentGuest?.groupId || 'none'}
                onValueChange={(value) => setCurrentGuest(prev => 
                  prev ? { ...prev, groupId: value === 'none' ? null : value } : prev
                )}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Group</SelectItem>
                  {weddingData.guestGroups.map(group => (
                    <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">RSVP Status</label>
              <Select
                value={currentGuest?.rsvpStatus || 'pending'}
                onValueChange={(value) => setCurrentGuest(prev => 
                  prev ? { ...prev, rsvpStatus: value as 'pending' | 'confirmed' | 'declined' } : prev
                )}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select RSVP status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGuestDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveGuest}>
              {isEditingGuest ? 'Update' : 'Add'} Guest
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Group Dialog */}
      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditingGroup ? 'Edit Group' : 'Add Group'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Group Name</label>
              <Input 
                placeholder="e.g., Family, Friends, Colleagues"
                value={currentGroup?.name || ''}
                onChange={(e) => setCurrentGroup(prev => 
                  prev ? { ...prev, name: e.target.value } : prev
                )}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveGroup}>
              {isEditingGroup ? 'Update' : 'Add'} Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default GuestList;
