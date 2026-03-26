import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { PlusCircle } from 'lucide-react';

import { getLessonById, addBlock, updateBlock, deleteBlock } from '../../services/lessons';

import BlockContainer from '../../components/BlockEditor/BlockContainer';
import BlockEditorModal from '../../components/BlockEditor/BlockEditorModal';
import TextBlock from '../../components/ContentBlocks/TextBlock';
import ZoomBlock from '../../components/ContentBlocks/ZoomBlock';
import AssessmentBlock from '../../components/ContentBlocks/AssessmentBlock';
import FileBlock from '../../components/ContentBlocks/FileBlock';
import LinkEmbedBlock from '../../components/ContentBlocks/LinkEmbedBlock';

const LessonPage = () => {
  const { courseId, lessonId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user);
  const courses = useSelector((state) => state.course);
  const activeCourse = courses.find(c => String(c.course_id) === String(courseId));
  
  const [lesson, setLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [insertAfterId, setInsertAfterId] = useState(null);

  const userRole = user?.role || '';
  const isCourseOwner = String(activeCourse?.teacher_id) === String(user?.id);
  const canEdit = userRole === 'admin' || (userRole === 'trainer' && isCourseOwner);

  useEffect(() => {
    const loadLesson = async () => {
      setIsLoading(true);
      try {
        const data = await getLessonById(lessonId);
        setLesson(data);
      } catch (error) {
        console.error("Failed to load lesson:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (lessonId) {
      loadLesson();
    }
  }, [lessonId]);

  const handleEditClick = (block) => {
    setEditingBlock(block);
    setInsertAfterId(null);
    setIsEditorOpen(true);
  };

  const handleAddClick = (afterBlockId = null) => {
    setEditingBlock(null);
    setInsertAfterId(afterBlockId);
    setIsEditorOpen(true);
  };

  const handleDeleteClick = async (blockId) => {
    if (window.confirm('Are you sure you want to delete this block?')) {
      try {
        const updatedLesson = await deleteBlock(lessonId, blockId);
        setLesson(updatedLesson);
      } catch (error) {
        console.error("Failed to delete block:", error);
      }
    }
  };

  const handleSaveBlock = async (blockData) => {
    try {
      let updatedLesson;
      if (editingBlock) {
        updatedLesson = await updateBlock(lessonId, editingBlock.block_id, blockData);
      } else {
        updatedLesson = await addBlock(lessonId, blockData);
      }
      setLesson(updatedLesson);
      setIsEditorOpen(false);
    } catch (error) {
      console.error("Failed to save block:", error);
    }
  };

  const renderBlockContent = (block) => {
    switch (block.type) {
      case 'text': return <TextBlock block={block} />;
      case 'zoom_card': return <ZoomBlock block={block} />;
      case 'assessment_form': return <AssessmentBlock block={block} />;
      case 'file_attachment': return <FileBlock block={block} />;
      case 'recording_link': return <LinkEmbedBlock block={block} />;
      default: return <div className="p-4 bg-red-50 text-red-600 rounded-lg">Unknown Block Type: {block.type}</div>;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full text-gray-500">Loading lesson content...</div>;
  }

  if (!lesson) {
    return <div className="flex items-center justify-center h-full text-gray-500">Lesson not found.</div>;
  }

  const blocks = lesson.content_data || [];

  return (
    <div className="flex flex-col items-center w-full min-h-full">
      <header className="w-full bg-white px-8 md:px-16 py-10 border-b border-[#ecebea] flex items-center justify-between">
         <div className="flex items-center gap-6">
            <div>
               <div className="text-[0.85rem] text-gray-500 uppercase tracking-wide font-semibold mb-1">
                   {activeCourse?.title || 'Course'} / {lesson.title}
               </div>
               <h1 className="text-4xl text-[#514587] font-bold tracking-tight">{lesson.title}</h1>
            </div>
         </div>
      </header>

      <div className="max-w-[1000px] w-full mx-auto px-5 py-10 pb-24">
        {blocks.length === 0 && (
           <div className="text-center p-16 bg-white rounded-2xl border-2 border-dashed border-[#ecebea] text-gray-500">
              <p className="mb-6 font-medium text-lg">This lesson is currently empty. Add your first content block!</p>
              {canEdit && (
                <button onClick={() => handleAddClick(null)} className="inline-flex items-center justify-center bg-[#514587] text-white py-3 px-6 rounded-xl border-none font-semibold cursor-pointer transition-all shadow-md hover:bg-[#3f356d] hover:shadow-lg hover:-translate-y-[1px]">
                  <PlusCircle size={20} className="mr-2" /> Start Building
                </button>
              )}
           </div>
        )}

        {blocks.length > 0 && canEdit && (
          <div className="flex justify-center mb-6">
            <button 
                className="bg-white border border-[#9484b4] text-[#514587] rounded-full w-10 h-10 flex items-center justify-center cursor-pointer shadow-sm transition-all hover:bg-[#514587] hover:text-white hover:scale-110 hover:shadow-md"
                onClick={() => handleAddClick(null)}
                title="Add a block at the very top"
            >
                <PlusCircle size={24} />
            </button>
          </div>
        )}

        <div className="flex flex-col">
           {blocks.map((block) => (
              <BlockContainer 
                key={block.block_id} 
                block={block} 
                canEdit={canEdit}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onAddBelow={handleAddClick}
              >
                {renderBlockContent(block)}
              </BlockContainer>
           ))}
        </div>
      </div>

      <BlockEditorModal 
         isOpen={isEditorOpen}
         onClose={() => setIsEditorOpen(false)}
         onSave={handleSaveBlock}
         initialData={editingBlock}
         isNew={!editingBlock}
      />
    </div>
  );
};

export default LessonPage;
