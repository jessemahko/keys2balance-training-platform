import React from 'react';
import { FileText, Download } from 'lucide-react';

const FileBlock = ({ block }) => {
  const { title, files } = block.data;

  return (
    <div className="bg-white border border-border-color rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 bg-primary/5 border-b border-border-color">
         <FileText size={20} className="text-primary" />
         <h3 className="text-lg text-primary font-semibold">{title || 'Attached Files'}</h3>
      </div>
      
      {files && files.length > 0 && (
        <ul className="list-none p-0 m-0">
          {files.map((file, idx) => (
            <li key={idx} className="flex justify-between items-center px-5 py-4 border-b border-border-color border-opacity-50 last:border-b-0">
              <span className="font-medium text-gray-800">{file.name}</span>
              <a 
                href={file.url} 
                download 
                className="text-primary-light p-2 rounded-lg bg-primary/5 hover:text-primary hover:bg-primary/15 transition-colors"
                title={`Download ${file.name}`}
              >
                <Download size={16} />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FileBlock;
