import React, { useState } from 'react';
import { Button, Input, Select, Card, Badge, Modal } from './index';
import type { FilterOption, SavedFilter, AdvancedFiltersProps } from '../types';

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  title = 'Gelişmiş Filtreler',
  filterOptions,
  onFiltersChange,
  savedFilters = [],
  onSaveFilter,
  showSaveFilters = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, string | string[] | boolean | { start?: string; end?: string } | { min?: string; max?: string }>>({});
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState('');
  const [activeFilterPreset, setActiveFilterPreset] = useState<string | null>(null);

  const handleFilterChange = (
    filterId: string,
    value: string | string[] | boolean | { start?: string; end?: string } | { min?: string; max?: string }
  ) => {
    const newFilters = { ...filters, [filterId]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
    setActiveFilterPreset(null); // Clear preset when manually changing filters
  };

  const handleClearFilters = () => {
    setFilters({});
    onFiltersChange({});
    setActiveFilterPreset(null);
  };

  const handleSaveFilter = () => {
    if (saveFilterName.trim() && onSaveFilter) {
      const newFilter: SavedFilter = {
        id: `filter_${Date.now()}`,
        name: saveFilterName.trim(),
        filters: { ...filters }
      };
      onSaveFilter(newFilter);
      setSaveFilterName('');
      setIsSaveModalOpen(false);
    }
  };

  const handleLoadFilter = (savedFilter: SavedFilter) => {
    setFilters(savedFilter.filters);
    onFiltersChange(savedFilter.filters);
    setActiveFilterPreset(savedFilter.id);
    setIsOpen(false);
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim() !== '';
      return value !== null && value !== undefined && value !== '';
    }).length;
  };

  const renderFilterInput = (option: FilterOption) => {
    const value = filters[option.id];

    switch (option.type) {
      case 'text':
        return (
          <Input
            placeholder={`${option.label} ara...`}
            value={value || ''}
            onChange={(e) => handleFilterChange(option.id, e.target.value)}
          />
        );

      case 'number':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-sm)' }}>
            <Input
              type="number"
              placeholder="Min"
              value={value?.min || ''}
              onChange={(e) => handleFilterChange(option.id, { ...value, min: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Max"
              value={value?.max || ''}
              onChange={(e) => handleFilterChange(option.id, { ...value, max: e.target.value })}
            />
          </div>
        );

      case 'select':
        return (
          <Select
            value={value || ''}
            onChange={(newValue) => handleFilterChange(option.id, newValue)}
            options={[
              { value: '', label: `Tüm ${option.label}` },
              ...(option.options || [])
            ]}
          />
        );

      case 'multiSelect':
        return (
          <div>
            <Select
              value=""
              onChange={(newValue) => {
                if (newValue) {
                  const currentValues = value || [];
                  if (!currentValues.includes(newValue)) {
                    handleFilterChange(option.id, [...currentValues, newValue]);
                  }
                }
              }}
              options={[
                { value: '', label: `${option.label} seç...` },
                ...(option.options || []).filter(opt => !(value || []).includes(opt.value))
              ]}
            />
            {value && value.length > 0 && (
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 'var(--spacing-xs)', 
                marginTop: 'var(--spacing-sm)' 
              }}>
                {value.map((val: string) => {
                  const filterOption = filterOptions.find(f => f.id === option.id);
                  const optionLabel = filterOption?.options?.find(o => o.value === val)?.label;
                  return (
                    <div
                      key={val}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-xs)',
                        padding: '4px 8px',
                        backgroundColor: 'var(--primary-color)',
                        color: 'var(--white)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleFilterChange(option.id, value.filter((v: string) => v !== val))}
                    >
                      {optionLabel || val} ×
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'dateRange':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-sm)' }}>
            <Input
              type="date"
              placeholder="Başlangıç"
              value={value?.start || ''}
              onChange={(e) => handleFilterChange(option.id, { ...value, start: e.target.value })}
            />
            <Input
              type="date"
              placeholder="Bitiş"
              value={value?.end || ''}
              onChange={(e) => handleFilterChange(option.id, { ...value, end: e.target.value })}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const filterPresets = [
    {
      id: 'recent',
      name: 'Son 7 Gün',
      filters: {
        dateRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0]
        }
      }
    },
    {
      id: 'thisMonth',
      name: 'Bu Ay',
      filters: {
        dateRange: {
          start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0]
        }
      }
    },
    {
      id: 'highPriority',
      name: 'Yüksek Öncelik',
      filters: {
        priority: ['high', 'urgent']
      }
    }
  ];

  return (
    <div style={{ position: 'relative' }}>
      {/* Filter Trigger Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-sm)'
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>
        </svg>
        {title}
        
        {getActiveFilterCount() > 0 && (
          <Badge variant="primary" size="sm">
            {getActiveFilterCount()}
          </Badge>
        )}
      </Button>

      {/* Filter Panel */}
      {isOpen && (
        <Card
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            width: '400px',
            maxHeight: '500px',
            overflowY: 'auto',
            zIndex: 1000,
            marginTop: 'var(--spacing-sm)',
            padding: 'var(--spacing-lg)'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--spacing-lg)',
            paddingBottom: 'var(--spacing-md)',
            borderBottom: '1px solid var(--gray-200)'
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>
              {title}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                color: 'var(--gray-500)',
                fontSize: '18px'
              }}
            >
              ×
            </button>
          </div>

          {/* Quick Filter Presets */}
          {(filterPresets.length > 0 || savedFilters.length > 0) && (
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>
                Hızlı Filtreler
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
                {filterPresets.map((preset) => (
                  <Button
                    key={preset.id}
                    variant={activeFilterPreset === preset.id ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => handleLoadFilter(preset as SavedFilter)}
                  >
                    {preset.name}
                  </Button>
                ))}
                {savedFilters.map((savedFilter) => (
                  <Button
                    key={savedFilter.id}
                    variant={activeFilterPreset === savedFilter.id ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => handleLoadFilter(savedFilter)}
                  >
                    {savedFilter.name}
                    {savedFilter.isDefault && ' ⭐'}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Filter Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {filterOptions.map((option) => (
              <div key={option.id}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  marginBottom: 'var(--spacing-sm)',
                  color: 'var(--gray-700)'
                }}>
                  {option.label}
                </label>
                {renderFilterInput(option)}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 'var(--spacing-lg)',
            paddingTop: 'var(--spacing-lg)',
            borderTop: '1px solid var(--gray-200)'
          }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
              >
                Temizle
              </Button>
              {showSaveFilters && getActiveFilterCount() > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSaveModalOpen(true)}
                >
                  Kaydet
                </Button>
              )}
            </div>
            
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Uygula
            </Button>
          </div>
        </Card>
      )}

      {/* Save Filter Modal */}
      <Modal
        isOpen={isSaveModalOpen}
        onClose={() => {
          setIsSaveModalOpen(false);
          setSaveFilterName('');
        }}
        title="Filtreyi Kaydet"
        size="sm"
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
            <Button
              variant="ghost"
              onClick={() => {
                setIsSaveModalOpen(false);
                setSaveFilterName('');
              }}
            >
              İptal
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveFilter}
              disabled={!saveFilterName.trim()}
            >
              Kaydet
            </Button>
          </div>
        }
      >
        <div style={{ padding: 'var(--spacing-lg)' }}>
          <Input
            label="Filtre Adı"
            value={saveFilterName}
            onChange={(e) => setSaveFilterName(e.target.value)}
            placeholder="Filtreye bir ad verin"
            autoFocus
          />
        </div>
      </Modal>
    </div>
  );
}; 