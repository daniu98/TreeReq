import React from 'react';
import icon from '../../assets/blank-category.svg'; 

const RequirementCategory = ({ text }) => {
  return (
    <div className="relative flex items-center justify-center w-[200px] h-[200px]">
      <img src={icon} alt="Category background" className="absolute inset-0 w-full h-full object-contain pointer-events-none"/>
      <span className="relative z-10 text-white font-bold text-center text-xl leading-tight px-6 drop-shadow-sm">
        {text}
      </span>
      
    </div>
  );
};

export default RequirementCategory;
