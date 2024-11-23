import React, { useState } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import DeleteButton from './ui/DeleteButton';
import SearchableList from './ui/SearchableList';

function FilamentManager({ filaments, onFilamentsUpdate }) {
  const [newFilament, setNewFilament] = useState({
    name: '',
    pricePerKg: 0
  });
  const [editingId, setEditingId] = useState(null);

  const handleAddOrUpdate = () => {
    const existingFilament = filaments.find(f => f.name === newFilament.name && f.id !== editingId);
    
    if (existingFilament) {
      if (!window.confirm(`A filament with name "${newFilament.name}" already exists. Do you want to override it?`)) {
        return;
      }
      onFilamentsUpdate(filaments.map(f => 
        f.id === existingFilament.id ? { ...newFilament, id: existingFilament.id } : f
      ));
    } else if (editingId) {
      onFilamentsUpdate(filaments.map(f => 
        f.id === editingId ? { ...newFilament, id: editingId } : f
      ));
    } else {
      onFilamentsUpdate([...filaments, { ...newFilament, id: Date.now() }]);
    }
    
    setNewFilament({ name: '', pricePerKg: 0 });
    setEditingId(null);
  };

  const handleEdit = (filament) => {
    setNewFilament({ name: filament.name, pricePerKg: filament.pricePerKg });
    setEditingId(filament.id);
  };

  const handleDeleteFilament = (filamentId) => {
    onFilamentsUpdate(filaments.filter(f => f.id !== filamentId));
  };

  const renderFilament = (filament) => (
    <div key={filament.id} className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">{filament.name}</h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => handleEdit(filament)}
              className="text-blue-600 hover:text-blue-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <DeleteButton onClick={() => handleDeleteFilament(filament.id)} />
          </div>
        </div>
        <p className="text-gray-600">Price: ${filament.pricePerKg}/kg</p>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        Filaments
      </h2>
      
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Filament Name"
              value={newFilament.name}
              onChange={(e) => setNewFilament({...newFilament, name: e.target.value})}
            />
            <Input
              label="Price per KG"
              type="number"
              value={newFilament.pricePerKg}
              onChange={(e) => setNewFilament({...newFilament, pricePerKg: parseFloat(e.target.value) || 0})}
            />
          </div>
          <Button onClick={handleAddOrUpdate} className="mt-4">
            {editingId ? 'Update Filament' : 'Add Filament'}
          </Button>
          {editingId && (
            <Button 
              onClick={() => {
                setNewFilament({ name: '', pricePerKg: 0 });
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
        items={filaments}
        searchBy="name"
        renderItem={renderFilament}
        gridClassName="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
      />
    </div>
  );
}

export default FilamentManager; 