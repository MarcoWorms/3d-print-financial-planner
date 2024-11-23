import React from 'react';
import Button from './ui/Button';
import Input from './ui/Input';

function GlobalConfig({ config, onConfigUpdate, allData, onDataImport }) {
  const handleEnergyChange = (event) => {
    onConfigUpdate({
      ...config,
      energyCost: parseFloat(event.target.value) || 0
    });
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '3d-printer-calculator-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          onDataImport(importedData);
        } catch (error) {
          alert('Error importing file: Invalid format');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        Global Configuration
      </h2>
      <div className="mb-4">
        <Input
          label="Energy Cost (per kWh)"
          type="number"
          min="0"
          step="0.01"
          value={config.energyCost}
          onChange={handleEnergyChange}
        />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          Data Management
        </h2>
        <div className="space-x-4">
          <label className="inline-block">
            <Button variant="primary">
              Import Data From File
              <input
                type="file"
                className="hidden"
                accept=".json"
                onChange={handleImport}
              />
            </Button>
          </label>

          <Button onClick={handleExport}>
            Export Data To File
          </Button>
        </div>
      </div>
    </div>
  );
}

export default GlobalConfig; 