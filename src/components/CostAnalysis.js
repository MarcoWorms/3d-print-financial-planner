import React, { useState, useEffect } from 'react';
import Input from './ui/Input';

function CostAnalysis({ globalConfig, printers, filaments, projects, channels }) {
  const [projectPrices, setProjectPrices] = useState(() => {
    const saved = localStorage.getItem('projectPrices');
    return saved ? JSON.parse(saved) : {};
  });

  const [expandedProjects, setExpandedProjects] = useState({});

  useEffect(() => {
    localStorage.setItem('projectPrices', JSON.stringify(projectPrices));
  }, [projectPrices]);

  const handleFinalPriceChange = (projectId, printerId, price) => {
    setProjectPrices({
      ...projectPrices,
      [`${projectId}-${printerId}`]: parseFloat(price) || 0
    });
  };

  const getFinalPrice = (projectId, printerId) => {
    return projectPrices[`${projectId}-${printerId}`] || 0;
  };

  const getPriceIndicators = (prices, finalPrice, channelName) => {
    if (!finalPrice) return { lower: null, higher: null };
    
    const channelPrices = prices.map(p => ({
      months: p.months,
      price: p.channelPrices.find(cp => cp.channelName === channelName).pricePerUnit
    })).sort((a, b) => a.price - b.price);

    const lower = channelPrices.filter(p => p.price <= finalPrice).pop();
    const higher = channelPrices.find(p => p.price > finalPrice);

    return { lower, higher };
  };
  
  const calculateCosts = (project, printer) => {
    // Calculate filament costs for all filaments
    let totalFilamentCost = 0;
    
    for (const projectFilament of project.filaments) {
      const filament = filaments.find(f => f.id === projectFilament.filamentId);
      if (!filament) continue;
      
      // Calculate individual filament cost
      totalFilamentCost += (projectFilament.grams / 1000) * filament.pricePerKg;
    }

    // Calculate total print time in hours
    const totalHours = project.printHours + (project.printMinutes / 60);
    
    // Calculate energy cost
    const energyCost = printer.powerConsumption * totalHours * globalConfig.energyCost;
    
    // Replace the old filament cost calculation with the new total
    const filamentCost = totalFilamentCost;
    
    // Calculate printer depreciation per print
    const calculateDepreciationCost = (months) => {
      const monthlyDepreciation = printer.cost / months;
      const monthlyPrintHours = printer.hoursPerDay * 30;
      return (monthlyDepreciation / monthlyPrintHours) * totalHours;
    };

    // Calculate maintenance cost per print
    const maintenanceCostPerPrint = 
      (printer.maintenanceCost / (printer.hoursPerDay * 365)) * totalHours;

    // Calculate base cost (materials + energy)
    const baseCost = energyCost + filamentCost;
    
    // Calculate total cost including maintenance
    const totalCost = baseCost + maintenanceCostPerPrint;

    // Calculate prices for different depreciation periods
    const prices = [3, 6, 9, 12, 24].map(months => {
      const depreciationCost = calculateDepreciationCost(months);
      const totalWithDepreciation = totalCost + depreciationCost + (project.packagingCost * (project.unitsProduced - project.unitsWasted));
      // Calculate prices for each channel
      const channelPrices = channels.map(channel => {
        const totalPrice = totalWithDepreciation / (1 - (channel.profitPercentage / 100));
        const pricePerUnit = totalPrice / (project.unitsProduced - project.unitsWasted);
        const channelCut = totalPrice * (channel.profitPercentage / 100);
        const sellerEarnings = totalPrice - channelCut;
        
        return {
          channelName: channel.name,
          price: totalPrice,
          pricePerUnit,
          channelCut,
          sellerEarnings
        };
      });

      return {
        months,
        depreciationCost,
        totalCost: totalWithDepreciation,
        channelPrices
      };
    });

    // Add margin calculation helper
    const calculateMargin = (sellingPrice, totalCost) => {
      if (!sellingPrice || !totalCost) return 0;
      return ((sellingPrice - totalCost) / sellingPrice) * 100;
    };

    return {
      energyCost,
      filamentCost,
      maintenanceCost: maintenanceCostPerPrint,
      baseCost,
      totalCost,
      prices,
      calculateMargin
    };
  };

  const toggleProject = (projectId) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        Cost Analysis
      </h2>

      {projects.map(project => {
        // Calculate summary costs for collapsed view
        const summaryData = printers.map(printer => {
          const costs = calculateCosts(project, printer);
          const finalPrice = getFinalPrice(project.id, printer.id);
          return {
            printer,
            costs,
            finalPrice
          };
        });

        return (
          <div key={project.id} className="bg-white rounded-lg shadow mb-6">
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleProject(project.id)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    License: {project.license || 'free'}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Summary info when collapsed */}
                  {!expandedProjects[project.id] && (
                    <div className="text-sm text-gray-600">
                      {summaryData
                        .filter(({ printer }) => 
                          !project.allowedPrinters || 
                          project.allowedPrinters.includes(printer.id)
                        )
                        .map(({ printer, costs, finalPrice }) => {
                          const basePrice = costs.baseCost / (project.unitsProduced - project.unitsWasted);
                          const margin = costs.calculateMargin(finalPrice, basePrice);
                          return (
                            <span key={printer.id} className="mr-4">
                              {printer.name}: ${finalPrice || basePrice.toFixed(2)}/unit
                              {finalPrice ? ` (${margin.toFixed(1)}% margin)` : ' (base)'}
                            </span>
                          );
                        })}
                    </div>
                  )}
                  <svg
                    className={`w-5 h-5 transform transition-transform ${
                      expandedProjects[project.id] ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Detailed view when expanded */}
            {expandedProjects[project.id] && (
              <div className="p-6 border-t border-gray-200">
                {/* Existing detailed content */}
                {printers
                  .filter(printer => 
                    !project.allowedPrinters || // Show all if allowedPrinters is not set
                    project.allowedPrinters.includes(printer.id)
                  )
                  .map(printer => {
                    const costs = calculateCosts(project, printer);
                    const finalPrice = getFinalPrice(project.id, printer.id);

                    return (
                      <div key={printer.id} className="mt-4">
                        <h4 className="text-md font-medium mb-2">
                          Printer: {printer.name}
                        </h4>
                        
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Cost Type
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Per Print
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Per Unit
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  Energy Cost
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                  ${costs.energyCost.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                  ${(costs.energyCost / (project.unitsProduced - project.unitsWasted)).toFixed(2)}
                                </td>
                              </tr>
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  Filament Cost
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                  ${costs.filamentCost.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                  ${(costs.filamentCost / (project.unitsProduced - project.unitsWasted)).toFixed(2)}
                                </td>
                              </tr>
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  Maintenance Cost
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                  ${costs.maintenanceCost.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                  ${(costs.maintenanceCost / (project.unitsProduced - project.unitsWasted)).toFixed(2)}
                                </td>
                              </tr>
                              <tr className="bg-gray-50 font-medium">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  Base Cost
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                  ${costs.baseCost.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                  ${(costs.baseCost / (project.unitsProduced - project.unitsWasted)).toFixed(2)}
                                </td>
                              </tr>
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  Packaging Cost
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                  ${(project.packagingCost * (project.unitsProduced - project.unitsWasted)).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                  ${project.packagingCost.toFixed(2)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <h5 className="text-sm font-medium text-gray-700 mt-6 mb-2">
                          Pricing Analysis
                        </h5>

                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Channel
                                </th>
                                {costs.prices.map(price => (
                                  <th key={price.months} className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {price.months}m
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {channels.map(channel => {
                                const { lower, higher } = getPriceIndicators(costs.prices, finalPrice, channel.name);
                                
                                return (
                                  <React.Fragment key={channel.name}>
                                    <tr className="bg-gray-50">
                                      <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                        {channel.name}
                                      </td>
                                      {costs.prices.map(price => {
                                        const channelPrice = price.channelPrices.find(cp => cp.channelName === channel.name);
                                        const isNearestLower = lower?.months === price.months;
                                        const isNearestHigher = higher?.months === price.months;
                                        
                                        return (
                                          <td key={price.months} className="px-4 py-2 text-sm text-right">
                                            <div className={`font-medium ${
                                              isNearestLower ? 'text-blue-600' :
                                              isNearestHigher ? '' :
                                              'text-gray-900'
                                            }`}>
                                              ${channelPrice.pricePerUnit.toFixed(2)}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                              Depreciation: ${(price.depreciationCost / (project.unitsProduced - project.unitsWasted)).toFixed(2)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              Fee: ${(channelPrice.channelCut / (project.unitsProduced - project.unitsWasted)).toFixed(2)}
                                            </div>
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  </React.Fragment>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-6 mb-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">
                            Selected Price
                          </h5>
                          <div className="flex items-center space-x-4">
                            <Input
                              label="Final Price Per Unit"
                              type="number"
                              value={finalPrice}
                              onChange={(e) => handleFinalPriceChange(project.id, printer.id, e.target.value)}
                              className="w-48"
                            />
                            {finalPrice > 0 && (
                              <div className="text-sm">
                                <span className="font-medium">
                                  Margin: {costs.calculateMargin(
                                    finalPrice,
                                    (costs.baseCost + costs.maintenanceCost + (project.packagingCost * (project.unitsProduced - project.unitsWasted))) / (project.unitsProduced - project.unitsWasted)
                                  ).toFixed(1)}%
                                </span>
                                <span className="text-gray-500 ml-2">
                                  (Base: ${((costs.baseCost + costs.maintenanceCost) / (project.unitsProduced - project.unitsWasted)).toFixed(2)}/unit)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                    );
                  })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default CostAnalysis; 