import React, { useState } from 'react';
import Input from './Input';

function SearchableList({ 
  items, 
  searchBy, 
  renderItem,
  className = "",
  gridClassName = "grid grid-cols-1 md:grid-cols-2 gap-4"
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = items.filter(item => 
    item[searchBy].toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={className}>
      <Input
        label="Search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
        placeholder={`Search by ${searchBy}...`}
      />
      
      <div className={gridClassName}>
        {filteredItems.map(renderItem)}
      </div>
    </div>
  );
}

export default SearchableList; 