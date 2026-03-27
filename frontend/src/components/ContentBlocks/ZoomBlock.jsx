import React from 'react';
import { Video, Calendar, Clock, ExternalLink } from 'lucide-react';

const ZoomBlock = ({ block }) => {
  const { title, date, time, join_link } = block.data;

  return (
    <div className="bg-gradient-to-br from-white to-[#fbfbfe] border border-primary/10 rounded-xl p-6">
      <div className="flex items-center mb-5">
        <div className="bg-success p-3 rounded-xl">
          <Video size={24} color="#ffffff" />
        </div>
        <h3 className="text-xl text-primary font-semibold ml-4">{title || 'Live Meeting'}</h3>
      </div>
      
      <div className="flex gap-6 mb-6 p-4 bg-primary/5 rounded-lg">
        {date && (
            <div className="flex items-center gap-2 text-gray-800 font-medium">
              <Calendar size={18} />
              <span>{date}</span>
            </div>
        )}
        {time && (
            <div className="flex items-center gap-2 text-gray-800 font-medium">
              <Clock size={18} />
              <span>{time}</span>
            </div>
        )}
      </div>

      <a 
        href={join_link} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="inline-flex items-center justify-center gap-2 w-full p-3 bg-primary text-white rounded-lg font-semibold hover:-translate-y-0.5 transition-transform"
      >
        <span>Join Meeting</span>
        <ExternalLink size={18} />
      </a>
    </div>
  );
};

export default ZoomBlock;
