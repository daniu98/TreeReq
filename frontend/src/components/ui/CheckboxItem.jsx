import React, { useState } from 'react';

import checkedIcon from '../../assets/checked-checkbox.svg';
import uncheckedIcon from '../../assets/unchecked-checkbox.svg';
import hoveredIcon from '../../assets/hovered-checkbox.svg';

const CheckboxItem = ({ label, isChecked, onChange }) => {
  const [isHovered, setIsHovered] = useState(false);

  let currentIcon = uncheckedIcon;
  if (isChecked) {
    currentIcon = checkedIcon;
  } else if (isHovered) {
    currentIcon = hoveredIcon;
  }

  return (
    <label 
      className="flex items-center gap-3 cursor-pointer select-none w-max"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <input 
        type="checkbox" 
        className="hidden"
        checked={isChecked}
        onChange={onChange}
      />
      
      <img 
        src={currentIcon} 
        alt={isChecked ? "Checked box" : "Unchecked box"} 
        className="w-5 h-5" 
      />

      <span className={`
        text-base transition-colors
        ${isChecked ? 'font-bold text-[#83b441]' : 'font-normal text-gray-800'}
      `}>
        {label}
      </span>
      
    </label>
  );
};

export default CheckboxItem;
