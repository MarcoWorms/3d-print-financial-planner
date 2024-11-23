import React, { useState } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import DeleteButton from './ui/DeleteButton';
import SearchableList from './ui/SearchableList';

function ChannelManager({ channels, onChannelsUpdate }) {
  const [newChannel, setNewChannel] = useState({
    name: '',
    profitPercentage: 0
  });
  const [editingId, setEditingId] = useState(null);

  const handleAddOrUpdate = () => {
    const existingChannel = channels.find(c => c.name === newChannel.name && c.id !== editingId);
    
    if (existingChannel) {
      if (!window.confirm(`A channel with name "${newChannel.name}" already exists. Do you want to override it?`)) {
        return;
      }
      onChannelsUpdate(channels.map(c => 
        c.id === existingChannel.id ? { ...newChannel, id: existingChannel.id } : c
      ));
    } else if (editingId) {
      onChannelsUpdate(channels.map(c => 
        c.id === editingId ? { ...newChannel, id: editingId } : c
      ));
    } else {
      onChannelsUpdate([...channels, { ...newChannel, id: Date.now() }]);
    }
    
    setNewChannel({ name: '', profitPercentage: 0 });
    setEditingId(null);
  };

  const handleEdit = (channel) => {
    setNewChannel({ 
      name: channel.name,
      profitPercentage: channel.profitPercentage
    });
    setEditingId(channel.id);
  };

  const handleDeleteChannel = (channelId) => {
    onChannelsUpdate(channels.filter(c => c.id !== channelId));
  };

  const renderChannel = (channel) => (
    <div key={channel.id} className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">{channel.name}</h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => handleEdit(channel)}
              className="text-blue-600 hover:text-blue-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <DeleteButton onClick={() => handleDeleteChannel(channel.id)} />
          </div>
        </div>
        <p className="text-gray-600">Platform Fee: {channel.profitPercentage}%</p>
        <p className="text-gray-600">You Receive: {100 - channel.profitPercentage}%</p>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Distribution Channels</h2>
      
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Channel Name"
              value={newChannel.name}
              onChange={(e) => setNewChannel({...newChannel, name: e.target.value})}
            />
            <Input
              label="Profit Percentage"
              type="number"
              min="0"
              max="100"
              value={newChannel.profitPercentage}
              onChange={(e) => setNewChannel({...newChannel, profitPercentage: parseFloat(e.target.value) || 0})}
            />
          </div>
          <Button onClick={handleAddOrUpdate} className="mt-4">
            {editingId ? 'Update Channel' : 'Add Channel'}
          </Button>
          {editingId && (
            <Button 
              onClick={() => {
                setNewChannel({ name: '', profitPercentage: 0 });
                setEditingId(null);
              }} 
              className="mt-4 ml-2"
              variant="secondary"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      <SearchableList
        items={channels}
        searchBy="name"
        renderItem={renderChannel}
        gridClassName="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
      />
    </div>
  );
}

export default ChannelManager; 