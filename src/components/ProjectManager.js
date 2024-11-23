import React, { useState, useEffect } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import DeleteButton from './ui/DeleteButton';
import SearchableList from './ui/SearchableList';

function ProjectManager({ projects, filaments, printers, onProjectsUpdate }) {
  const [newProject, setNewProject] = useState({
    name: '',
    filaments: [],
    printHours: 0,
    printMinutes: 0,
    unitsProduced: 0,
    unitsWasted: 0,
    packagingCost: 0,
    finalPrice: 0,
    modelLink: '',
    license: 'free',
    allowedPrinters: []
  });
  const [editingId, setEditingId] = useState(null);

  const [tempFilaments, setTempFilaments] = useState([{
    filamentId: '',
    grams: 0
  }]);

  const handleAddFilamentInput = () => {
    setTempFilaments([...tempFilaments, {
      filamentId: '',
      grams: 0
    }]);
  };

  const handleTempFilamentChange = (index, field, value) => {
    setTempFilaments(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleRemoveTempFilament = (index) => {
    setTempFilaments(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveFilamentFromProject = (index) => {
    setNewProject({
      ...newProject,
      filaments: newProject.filaments.filter((_, i) => i !== index)
    });
  };

  const handleAddOrUpdate = () => {
    const validFilaments = tempFilaments.filter(tf => tf.filamentId && tf.grams > 0);
    if (validFilaments.length === 0 && newProject.filaments.length === 0) {
      alert('Please add at least one filament to the project');
      return;
    }

    let finalProjectData = { ...newProject };
    
    if (validFilaments.length > 0) {
      let updatedFilaments = [...finalProjectData.filaments];
      
      validFilaments.forEach(tempFilament => {
        const existingIndex = updatedFilaments.findIndex(
          f => f.filamentId === Number(tempFilament.filamentId)
        );

        if (existingIndex >= 0) {
          updatedFilaments[existingIndex] = {
            ...updatedFilaments[existingIndex],
            grams: updatedFilaments[existingIndex].grams + tempFilament.grams
          };
        } else {
          updatedFilaments.push({
            filamentId: Number(tempFilament.filamentId),
            grams: tempFilament.grams
          });
        }
      });
      
      finalProjectData.filaments = updatedFilaments;
    }

    const projectData = {
      ...finalProjectData,
      allowedPrinters: finalProjectData.allowedPrinters.length > 0 
        ? finalProjectData.allowedPrinters 
        : printers.map(p => p.id)
    };

    const existingProject = projects.find(p => p.name === projectData.name && p.id !== editingId);
    
    if (existingProject) {
      if (!window.confirm(`A project with name "${projectData.name}" already exists. Do you want to override it?`)) {
        return;
      }
      onProjectsUpdate(projects.map(p => 
        p.id === existingProject.id ? { ...projectData, id: existingProject.id } : p
      ));
    } else if (editingId) {
      onProjectsUpdate(projects.map(p => 
        p.id === editingId ? { ...projectData, id: editingId } : p
      ));
    } else {
      onProjectsUpdate([...projects, { ...projectData, id: Date.now() }]);
    }
    
    setNewProject({
      name: '',
      filaments: [],
      printHours: 0,
      printMinutes: 0,
      unitsProduced: 0,
      unitsWasted: 0,
      packagingCost: 0,
      finalPrice: 0,
      modelLink: '',
      license: 'free',
      allowedPrinters: []
    });
    setEditingId(null);
  };

  const handleEdit = (project) => {
    setNewProject({ 
      ...project,
      allowedPrinters: project.allowedPrinters || printers.map(p => p.id)
    });
    setEditingId(project.id);
  };

  const handleDeleteProject = (projectId) => {
    onProjectsUpdate(projects.filter(p => p.id !== projectId));
  };

  const getFilamentName = (filamentId) => {
    const numericId = Number(filamentId);
    const filament = filaments.find(f => f.id === numericId);
    return filament ? filament.name : 'Unknown';
  };

  const filamentOptions = filaments.map(filament => ({
    value: filament.id.toString(),
    label: `${filament.name} - $${filament.pricePerKg}/kg`
  }));

  const licenseOptions = [
    { value: 'free', label: 'Free' },
    { value: 'non-commercial', label: 'Non-Commercial' },
    { value: 'commercial', label: 'Commercial' }
  ];

  const handlePrinterToggle = (printerId) => {
    setNewProject(prev => ({
      ...prev,
      allowedPrinters: prev.allowedPrinters.includes(printerId)
        ? prev.allowedPrinters.filter(id => id !== printerId)
        : [...prev.allowedPrinters, printerId]
    }));
  };

  const renderPrinterCheckboxes = () => (
    <div className="col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Compatible Printers
      </label>
      <div className="space-y-2">
        {(printers || []).map(printer => (
          <label key={printer.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={newProject.allowedPrinters.includes(printer.id)}
              onChange={() => handlePrinterToggle(printer.id)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{printer.name}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderFilamentsInputSection = () => (
    <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
      <h3 className="text-md font-medium mb-3">Project Filaments</h3>
      
      {tempFilaments.map((tempFilament, index) => (
        <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <Select
            label={`Filament ${index + 1}`}
            value={tempFilament.filamentId}
            onChange={(e) => handleTempFilamentChange(index, 'filamentId', e.target.value)}
            options={filamentOptions}
            placeholder="Select Filament"
          />
          <Input
            label="Grams"
            type="number"
            value={tempFilament.grams}
            onChange={(e) => handleTempFilamentChange(
              index,
              'grams',
              parseFloat(e.target.value) || 0
            )}
          />
          {index > 0 && (
            <button
              onClick={() => handleRemoveTempFilament(index)}
              className="self-end mb-2 text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          )}
        </div>
      ))}

      <div className="flex gap-2 mb-4">
        <Button
          onClick={handleAddFilamentInput}
          variant="secondary"
          className="text-sm"
        >
          Add Another Filament
        </Button>
      </div>

      <div className="space-y-2">
        {newProject.filaments.map((filament, index) => (
          <div key={index} className="flex items-center justify-between bg-white p-2 rounded">
            <span>{getFilamentName(filament.filamentId)} - {filament.grams}g</span>
            <DeleteButton onClick={() => handleRemoveFilamentFromProject(index)} />
          </div>
        ))}
      </div>
    </div>
  );

  const renderProject = (project) => (
    <div key={project.id} className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">{project.name}</h3>
          <div className="flex space-x-2">
            <button 
              onClick={() => handleEdit(project)}
              className="text-blue-600 hover:text-blue-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <DeleteButton onClick={() => handleDeleteProject(project.id)} />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {project.modelLink && (
            <p className="text-gray-600">
              Model: <a 
                href={project.modelLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Link
              </a>
            </p>
          )}
          <span className="text-gray-600">•</span>
          <p className="text-gray-600">
            License: {project.license || 'free'}
          </p>
        </div>
        <div className="mt-2">
          <p className="text-gray-600 font-medium">Filaments:</p>
          {project.filaments.map((filament, index) => (
            <p key={index} className="text-gray-600 ml-2">
              • {getFilamentName(filament.filamentId)} - {filament.grams}g
            </p>
          ))}
        </div>
        <p className="text-gray-600 mt-2">Print Time: {project.printHours}h {project.printMinutes}m</p>
        <p className="text-gray-600">Units: {project.unitsProduced} (Wasted: {project.unitsWasted})</p>
        <p className="text-gray-600">Packaging Cost: ${project.packagingCost}/unit</p>
        <p className="text-gray-600 mt-2">Compatible Printers:</p>
        {project.allowedPrinters.map(printerId => (
          <p key={printerId} className="text-gray-600 ml-2">
            • {printers.find(p => p.id === printerId)?.name || 'Unknown'}
          </p>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Projects</h2>
      
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Project Name"
              value={newProject.name}
              onChange={(e) => setNewProject({...newProject, name: e.target.value})}
            />
            
            <Input
              label="Model File Link"
              value={newProject.modelLink}
              onChange={(e) => setNewProject({...newProject, modelLink: e.target.value})}
              placeholder="https://..."
            />

            <Select
              label="License Type"
              value={newProject.license}
              onChange={(e) => setNewProject({...newProject, license: e.target.value})}
              options={licenseOptions}
            />
            
            {renderFilamentsInputSection()}

            <Input
              label="Print Hours"
              type="number"
              value={newProject.printHours}
              onChange={(e) => setNewProject({...newProject, printHours: parseInt(e.target.value) || 0})}
            />
            <Input
              label="Print Minutes"
              type="number"
              value={newProject.printMinutes}
              onChange={(e) => setNewProject({...newProject, printMinutes: parseInt(e.target.value) || 0})}
            />
            <Input
              label="Units Produced"
              type="number"
              value={newProject.unitsProduced}
              onChange={(e) => setNewProject({...newProject, unitsProduced: parseInt(e.target.value) || 0})}
            />
            <Input
              label="Units Wasted"
              type="number"
              value={newProject.unitsWasted}
              onChange={(e) => setNewProject({...newProject, unitsWasted: parseInt(e.target.value) || 0})}
            />
            <Input
              label="Packaging Cost Per Unit"
              type="number"
              value={newProject.packagingCost}
              onChange={(e) => setNewProject({...newProject, packagingCost: parseFloat(e.target.value) || 0})}
            />
          </div>
          {renderPrinterCheckboxes()}
          <Button onClick={handleAddOrUpdate} className="mt-4">
            {editingId ? 'Update Project' : 'Add Project'}
          </Button>
          {editingId && (
            <Button 
              onClick={() => {
                setNewProject({
                  name: '',
                  filaments: [],
                  printHours: 0,
                  printMinutes: 0,
                  unitsProduced: 0,
                  unitsWasted: 0,
                  packagingCost: 0,
                  finalPrice: 0,
                  modelLink: '',
                  license: 'free',
                  allowedPrinters: []
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
        items={projects}
        searchBy="name"
        renderItem={renderProject}
        gridClassName="grid grid-cols-1 md:grid-cols-2 gap-4"
      />
    </div>
  );
}

export default ProjectManager; 