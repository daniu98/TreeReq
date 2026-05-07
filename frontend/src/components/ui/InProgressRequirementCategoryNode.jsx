import React from 'react';
import icon from '../../assets/in-progress-category.svg'; 

const InProgressRequirementCategory = ({ categoryName, percentage }) => {
  return (
    <div className="relative flex items-center justify-center w-[200px] h-[200px]">
      <img src={icon} alt="Category background" className="absolute inset-0 w-full h-full object-contain pointer-events-none"/>
      <span className="relative z-10 text-white font-bold text-center text-xl leading-tight px-6 drop-shadow-sm">
        {categoryName}
      </span>
      <span className="text-white text-base font-normal mt-1">
        {percentage}% complete
      </span>
      
    </div>
  );
};

export default InProgressRequirementCategory;
