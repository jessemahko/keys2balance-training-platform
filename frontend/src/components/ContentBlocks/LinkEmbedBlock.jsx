import React from 'react';
import { Link as LinkIcon, ExternalLink } from 'lucide-react';

const LinkEmbedBlock = ({ block }) => {
  const { title, url, description } = block.data;

  return (
    <div className="flex gap-5 p-6 bg-white border border-border-color rounded-xl">
      <div className="bg-secondary/10 p-4 rounded-xl flex items-center justify-center shrink-0">
         <LinkIcon size={24} className="text-secondary" />
      </div>
      <div className="flex flex-col justify-center">
        <h3 className="text-lg text-primary mb-2 font-semibold">{title}</h3>
        {description && <p className="text-gray-500 text-sm mb-3">{description}</p>}
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-success font-medium inline-flex items-center hover:underline"
        >
          {url}
          <ExternalLink size={14} className="ml-1.5" />
        </a>
      </div>
    </div>
  );
};

export default LinkEmbedBlock;
