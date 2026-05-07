import React from 'react';
import icon from '../../assets/in-progress-icon.svg'; 

const InProgressCourseNode = ({ courseName }) => {
  return (
    <div className="flex items-center w-[237px] h-[85px] border-2 border-[#4A8563] rounded-[50px] px-4 bg-white box-border">
      <div className="flex-shrink-0 mr-3">
        <img 
          src={icon} 
          alt="Completed status icon" 
          className="w-12 h-12" 
        />
      </div>
      <div className="flex flex-col justify-center">
        <span className="text-[22px] font-bold text-black leading-none mb-1">
          {courseName}
        </span>
        <span className="text-[18px] text-gray-500 font-normal leading-none">
          In Progress
        </span>
      </div>

    </div>
  );
};

export default InProgressCourseNode;
