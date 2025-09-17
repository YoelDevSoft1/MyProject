import React from 'react';

interface MedicalRecordSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  canCreateRecord: boolean;
}

export const MedicalRecordSearch: React.FC<MedicalRecordSearchProps> = ({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  canCreateRecord
}) => {
  const filterOptions = [
    { value: 'all', label: 'Todos los tipos' },
    { value: 'consultation', label: 'Consulta' },
    { value: 'follow_up', label: 'Seguimiento' },
    { value: 'emergency', label: 'Emergencia' },
    { value: 'procedure', label: 'Procedimiento' },
    { value: 'vaccination', label: 'Vacunación' }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Buscar registros
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por paciente, diagnóstico o doctor..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Filter Dropdown */}
        <div className="md:w-64">
          <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de registro
          </label>
          <select
            id="filter"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Actions */}
        {canCreateRecord && (
          <div className="flex items-end">
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
              <span>📊</span>
              <span>Reportes</span>
            </button>
          </div>
        )}
      </div>

      {/* Search Results Summary */}
      {searchTerm && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            Buscando: <span className="font-medium">"{searchTerm}"</span>
            {filterType !== 'all' && (
              <span> • Tipo: <span className="font-medium">
                {filterOptions.find(opt => opt.value === filterType)?.label}
              </span></span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};
