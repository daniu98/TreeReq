import React from 'react';
import icon from '../../assets/complete-category.svg'; 

const CompleteRequirementCategory = ({ text }) => {
  return (
    <div className="relative flex items-center justify-center w-[200px] h-[200px]">
      <img src={icon} alt="Category background" className="absolute inset-0 w-full h-full object-contain pointer-events-none"/>
      <span className="relative z-10 text-white font-bold text-center text-xl leading-tight px-6 drop-shadow-sm">
        {text}
      </span>
      <span className="text-white text-base font-normal mt-1">
        100% complete
      </span>
      
    </div>
  );
};

export default CompleteRequirementCategory;
