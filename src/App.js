import React, { useState, useEffect } from 'react';
import GlobalConfig from './components/GlobalConfig';
import PrinterManager from './components/PrinterManager';
import FilamentManager from './components/FilamentManager';
import ProjectManager from './components/ProjectManager';
import ChannelManager from './components/ChannelManager';
import CostAnalysis from './components/CostAnalysis';


function App() {
  const [activeTab, setActiveTab] = useState(0);
  
  // Load initial state from localStorage or use defaults
  const [globalConfig, setGlobalConfig] = useState(() => {
    const saved = localStorage.getItem('globalConfig');
    return saved ? JSON.parse(saved) : { energyCost: 0 };
  });
  
  const [printers, setPrinters] = useState(() => {
    const saved = localStorage.getItem('printers');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [filaments, setFilaments] = useState(() => {
    const saved = localStorage.getItem('filaments');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('projects');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [channels, setChannels] = useState(() => {
    const saved = localStorage.getItem('channels');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('globalConfig', JSON.stringify(globalConfig));
  }, [globalConfig]);

  useEffect(() => {
    localStorage.setItem('printers', JSON.stringify(printers));
  }, [printers]);

  useEffect(() => {
    localStorage.setItem('filaments', JSON.stringify(filaments));
  }, [filaments]);

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('channels', JSON.stringify(channels));
  }, [channels]);

  const tabs = [
    "Global Config",
    "Printers",
    "Filaments",
    "Projects",
    "Channels",
    "Cost Analysis"
  ];

  return (
    <div className="container mx-auto px-4">
      <div className="w-full">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab, index) => (
              <button
                key={tab}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === index
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab(index)}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
        
        {activeTab === 0 && (
          <GlobalConfig 
            config={globalConfig} 
            onConfigUpdate={setGlobalConfig}
            allData={{ globalConfig, printers, filaments, projects, channels }}
            onDataImport={(data) => {
              setGlobalConfig(data.globalConfig || {});
              setPrinters(data.printers || []);
              setFilaments(data.filaments || []);
              setProjects(data.projects || []);
              setChannels(data.channels || []);
            }}
          />
        )}
        {activeTab === 1 && (
          <PrinterManager 
            printers={printers} 
            onPrintersUpdate={setPrinters} 
          />
        )}
        {activeTab === 2 && (
          <FilamentManager 
            filaments={filaments} 
            onFilamentsUpdate={setFilaments} 
          />
        )}
        {activeTab === 3 && (
          <ProjectManager 
            projects={projects} 
            filaments={filaments}
            printers={printers}
            onProjectsUpdate={setProjects} 
          />
        )}
        {activeTab === 4 && (
          <ChannelManager 
            channels={channels} 
            onChannelsUpdate={setChannels} 
          />
        )}
        {activeTab === 5 && (
          <CostAnalysis 
            globalConfig={globalConfig}
            printers={printers}
            filaments={filaments}
            projects={projects}
            channels={channels}
          />
        )}
      </div>
    </div>
  );
}

export default App; 