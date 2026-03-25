import React from 'react';
import { ClipboardList, CheckCircle, ChevronRight } from 'lucide-react';

const AssessmentBlock = ({ block }) => {
  const { title, description, status } = block.data;
  const isCompleted = status === 'completed';

  return (
    <div className={`flex justify-between items-center p-6 bg-white border border-border-color rounded-xl shadow-sm ${isCompleted ? 'border-l-4 border-l-success' : 'border-l-4 border-l-secondary'}`}>
      <div className="flex items-center gap-5">
        <div className="shrink-0">
           {isCompleted ? <CheckCircle size={28} className="text-success" /> : <ClipboardList size={28} className="text-primary" />}
        </div>
        <div>
          <h3 className="text-lg text-primary mb-1 font-semibold">{title}</h3>
          {description && <p className="text-gray-500 text-sm">{description}</p>}
        </div>
      </div>
      
      <button className="flex items-center shrink-0 gap-2 px-4 py-2 bg-transparent border border-border-color rounded-full text-gray-800 font-medium hover:bg-sidebar-bg hover:border-primary-light hover:text-primary transition-colors">
        <span>{isCompleted ? 'Your Submission' : 'Start Quiz'}</span>
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default AssessmentBlock;
