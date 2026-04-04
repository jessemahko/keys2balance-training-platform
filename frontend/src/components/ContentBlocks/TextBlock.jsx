import React from 'react';

const TextBlock = ({ block }) => {
  return (
    <div 
      className="text-gray-800 break-words overflow-hidden [&_h1]:text-3xl [&_h1]:text-primary [&_h1]:mb-4 [&_h1]:font-bold [&_h2]:text-2xl [&_h2]:text-primary [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:font-semibold [&_p]:mb-4 [&_p]:text-[1.05rem] [&_p]:leading-relaxed [&_ul]:ml-6 [&_ul]:mb-4 [&_ul]:list-disc [&_ol]:ml-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_li]:mb-2"
      dangerouslySetInnerHTML={{ __html: block.data.content }}
    />
  );
};

export default TextBlock;
