import React, { useState } from 'react';
import './StatusDropdown.css';

import completedIcon from '../../assets/completed-icon.svg';
import inProgressIcon from '../../assets/in-progress-icon.svg';
import plannedIcon from '../../assets/planned-icon.svg';
import unfulfilledIcon from '../../assets/unfulfilled-icon.svg';
import downArrowIcon from '../../assets/down-arrow-icon.svg';

const STATUS_OPTIONS = [
  { 
    id: 'completed', label: 'Completed', icon: completedIcon, 
    activeBg: 'bg-[#eaf1ec]', activeText: 'text-[#358162]', activeBorder: 'border-[#358162]', activeDot: 'bg-[#358162]',
    hoverBg: 'hover:bg-[#eaf1ec]', hoverText: 'group-hover:text-[#358162]', hoverBorder: 'group-hover:border-[#358162]'
  },
  { 
    id: 'in-progress', label: 'In progress', icon: inProgressIcon, 
    activeBg: 'bg-[#f4f8ec]', activeText: 'text-[#83b441]', activeBorder: 'border-[#83b441]', activeDot: 'bg-[#83b441]',
    hoverBg: 'hover:bg-[#f4f8ec]', hoverText: 'group-hover:text-[#83b441]', hoverBorder: 'group-hover:border-[#83b441]'
  },
  { 
    id: 'planned', label: 'Planned', icon: plannedIcon, 
    activeBg: 'bg-[#eff7f3]', activeText: 'text-[#8cc1a4]', activeBorder: 'border-[#8cc1a4]', activeDot: 'bg-[#8cc1a4]',
    hoverBg: 'hover:bg-[#eff7f3]', hoverText: 'group-hover:text-[#8cc1a4]', hoverBorder: 'group-hover:border-[#8cc1a4]'
  },
  { 
    id: 'unfulfilled', label: 'Unfulfilled', icon: unfulfilledIcon, 
    activeBg: 'bg-[#f2f2f2]', activeText: 'text-[#808080]', activeBorder: 'border-[#808080]', activeDot: 'bg-[#808080]',
    hoverBg: 'hover:bg-[#f2f2f2]', hoverText: 'group-hover:text-[#808080]', hoverBorder: 'group-hover:border-[#808080]'
  },
];

const StatusDropdown = ({ initialStatus = 'completed', onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(initialStatus);
  const [hoveredId, setHoveredId] = useState(null);
  const currentStatus = STATUS_OPTIONS.find(option => option.id === selectedId);

  const handleSelect = (id) => {
    setSelectedId(id);
    setIsOpen(false);
    if (onChange) onChange(id);
  };

  return (
    <div className="relative inline-block w-[160px] font-sans">
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <img src={currentStatus.icon} alt="" className="w-5 h-5" />
          <span className={`text-sm font-medium ${currentStatus.activeText}`}>
            {currentStatus.label}
          </span>
        </div>
        <img 
          src={downArrowIcon} 
          alt="toggle" 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden py-1">
          {STATUS_OPTIONS.map((option) => {
            const isSelected = option.id === selectedId;
            
            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                className={`group flex items-center gap-3 w-[calc(100%-16px)] mx-2 my-1 px-3 py-2 text-left text-sm transition-colors rounded-full
                  ${isSelected ? option.activeBg : `bg-transparent ${option.hoverBg}`}
                `}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors
                  ${isSelected ? option.activeBorder : `border-gray-300 ${option.hoverBorder}`}
                `}>
                  {isSelected && (
                    <div className={`w-2 h-2 rounded-full ${option.activeDot}`} />
                  )}
                </div>
                
                <span className={`font-medium transition-colors
                  ${isSelected ? option.activeText : `text-gray-500 ${option.hoverText}`}
                `}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default StatusDropdown;
