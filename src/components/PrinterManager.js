import React, { useState } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import DeleteButton from './ui/DeleteButton';
import SearchableList from './ui/SearchableList';

function PrinterManager({ printers, onPrintersUpdate }) {
  const [newPrinter, setNewPrinter] = useState({
    name: '',
    powerConsumption: 0,
    cost: 0,
    maintenanceCost: 0,
    hoursPerDay: 0
  });
  const [editingId, setEditingId] = useState(null);

  const handleAddOrUpdate = () => {
    const existingPrinter = printers.find(p => p.name === newPrinter.name && p.id !== editingId);
    
    if (existingPrinter) {
      if (!window.confirm(`A printer with name "${newPrinter.name}" already exists. Do you want to override it?`)) {
        return;
      }
      onPrintersUpdate(printers.map(p => 
        p.id === existingPrinter.id ? { ...newPrinter, id: existingPrinter.id } : p
      ));
    } else if (editingId) {
      onPrintersUpdate(printers.map(p => 
        p.id === editingId ? { ...newPrinter, id: editingId } : p
      ));
    } else {
      onPrintersUpdate([...printers, { ...newPrinter, id: Date.now() }]);
    }
    
    setNewPrinter({
      name: '',
      powerConsumption: 0,
      cost: 0,
      maintenanceCost: 0,
      hoursPerDay: 0
    });
    setEditingId(null);
  };

  const handleEdit = (printer) => {
    setNewPrinter({ 
      name: printer.name,
      powerConsumption: printer.powerConsumption,
      cost: printer.cost,
      maintenanceCost: printer.maintenanceCost,
      hoursPerDay: printer.hoursPerDay
    });
    setEditingId(printer.id);
  };

  const handleDeletePrinter = (printerId) => {
    onPrintersUpdate(printers.filter(p => p.id !== printerId));
  };

  const renderPrinter = (printer) => (
    <div key={printer.id} className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">{printer.name}</h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => handleEdit(printer)}
              className="text-blue-600 hover:text-blue-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <DeleteButton onClick={() => handleDeletePrinter(printer.id)} />
          </div>
        </div>
        <p className="text-gray-600">Power: {printer.powerConsumption} kW/h</p>
        <p className="text-gray-600">Cost: ${printer.cost}</p>
        <p className="text-gray-600">Maintenance: ${printer.maintenanceCost}/year</p>
        <p className="text-gray-600">Hours/Day: {printer.hoursPerDay}</p>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Printers</h2>
      
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Printer Name"
              value={newPrinter.name}
              onChange={(e) => setNewPrinter({...newPrinter, name: e.target.value})}
            />
            <Input
              label="Power Consumption (kW/h)"
              type="number"
              value={newPrinter.powerConsumption}
              onChange={(e) => setNewPrinter({...newPrinter, powerConsumption: parseFloat(e.target.value) || 0})}
            />
            <Input
              label="Printer Cost"
              type="number"
              value={newPrinter.cost}
              onChange={(e) => setNewPrinter({...newPrinter, cost: parseFloat(e.target.value) || 0})}
            />
            <Input
              label="Yearly Maintenance Cost"
              type="number"
              value={newPrinter.maintenanceCost}
              onChange={(e) => setNewPrinter({...newPrinter, maintenanceCost: parseFloat(e.target.value) || 0})}
            />
            <Input
              label="Hours Up/Day"
              type="number"
              value={newPrinter.hoursPerDay}
              onChange={(e) => setNewPrinter({...newPrinter, hoursPerDay: parseFloat(e.target.value) || 0})}
            />
          </div>
          <Button onClick={handleAddOrUpdate} className="mt-4">
            {editingId ? 'Update Printer' : 'Add Printer'}
          </Button>
          {editingId && (
            <Button 
              onClick={() => {
                setNewPrinter({
                  name: '',
                  powerConsumption: 0,
                  cost: 0,
                  maintenanceCost: 0,
                  hoursPerDay: 0
                });
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
        items={printers}
        searchBy="name"
        renderItem={renderPrinter}
      />
    </div>
  );
}

export default PrinterManager; 