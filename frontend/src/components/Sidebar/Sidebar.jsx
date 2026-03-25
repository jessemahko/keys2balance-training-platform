import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  Megaphone, 
  User, 
  BookOpen, 
  Play, 
  MessageSquare, 
  Settings, 
  ChevronLeft, 
  PlusCircle, 
  Edit2, 
  Trash2, 
  MoreVertical 
} from 'lucide-react';
import logo from '../../assets/k2b-logo-purple.svg';

const Sidebar = ({ 
  isOpen, 
  onToggle, 
  course = null, 
  activeLessonId = null,
  onAddLesson,
  onEditLesson,
  onDeleteLesson
}) => {
  const [activeDropdownLessonId, setActiveDropdownLessonId] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !event.target.closest('.lesson-more-btn')) {
        setActiveDropdownLessonId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (e, lessonId) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveDropdownLessonId(prev => prev === lessonId ? null : lessonId);
  };

  const navLinkClass = "flex items-center px-4 py-3 text-gray-800 transition-colors font-medium rounded-lg hover:bg-[#514587]/10 hover:text-[#514587]";
  const activeNavLinkClass = "bg-[#514587] text-white shadow-[0_4px_10px_rgba(81,69,135,0.2)] hover:bg-[#514587] hover:text-white";

  const lessons = course ? [...(course.lessons || [])].sort((a, b) => Number(a.order_index ?? 0) - Number(b.order_index ?? 0)) : [];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[90] md:hidden transition-opacity duration-300" onClick={onToggle}></div>}
      
      <aside className={`bg-white border-r border-[#ecebea] flex flex-col py-6 shrink-0 z-[100] transition-all duration-300 ease-in-out h-full overflow-hidden ${isOpen ? 'w-[280px] translate-x-0' : 'w-0 -translate-x-full border-r-0'}`}>
        {/* Brand Header */}
        <div className={`px-6 pb-0 border-b border-[#ecebea] mb-4 w-[280px] transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
           <div className="flex justify-between items-center mb-4 w-full">
             <Link to="/dashboard" className="block transition-transform hover:scale-[1.02] mb-2 dashboard-brand text-[#514587]">
               <div className="flex items-center gap-3">
                 <img src={logo} alt="K2B Logo" className="w-10 h-10 object-contain" />
                 <div>
                    <p className='dashboard-brand-label' style={{ color: '#514587', fontSize: '14px' }}>Keys 2 Balance</p>
                    <span className='dashboard-brand-subtitle' style={{ color: '#7a7a7a', fontSize: '10px' }}>Participant portal</span>
                 </div>
               </div>
             </Link>
             <button 
               className="bg-transparent border-none cursor-pointer text-gray-500 flex items-center justify-center p-1 rounded transition hover:bg-[#514587]/10 hover:text-[#514587]" 
               onClick={onToggle}
               title="Close Sidebar"
             >
               <ChevronLeft size={18} />
             </button>
           </div>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* ---- COURSE CONTEXT SECTION ---- */}
          {course && (
            <>
              <div className="px-6 pb-3 text-xs uppercase tracking-widest text-[#7a7a7a] font-semibold w-[280px]">Course Overview</div>
              <ul className="list-none px-4 w-[280px] mb-6">
                <li className="mb-2 rounded-lg w-full">
                  <NavLink 
                    to={`/dashboard/courses/${course.course_id}`} 
                    end 
                    className={({ isActive }) => `${navLinkClass} ${isActive ? activeNavLinkClass : ''}`}
                  >
                    <span className="mr-3 flex items-center"><BookOpen size={18} /></span>
                    <span className="whitespace-nowrap overflow-hidden text-ellipsis">Curriculum Overview</span>
                  </NavLink>
                </li>
              </ul>

              <div className="flex items-center justify-between px-6 my-4 w-[280px]">
                <span className="text-xs uppercase tracking-widest text-[#7a7a7a] font-semibold">Lessons</span>
                {(onAddLesson) && (
                  <button 
                    className="bg-transparent border-none cursor-pointer text-gray-500 flex items-center justify-center p-1 rounded transition-colors hover:bg-[#514587]/10 hover:text-[#514587]" 
                    onClick={onAddLesson}
                    title="Add New Lesson"
                  >
                    <PlusCircle size={18} />
                  </button>
                )}
              </div>

              <ul className="list-none px-4 w-[280px] mb-6">
                {lessons.length === 0 ? (
                  <li className="px-4 py-6 text-center bg-[#f8f9fc] rounded-xl mx-2 mb-4">
                    <p className="text-gray-500 text-sm mb-3">No lessons yet</p>
                    {onAddLesson && (
                      <button className="bg-[#514587] text-white border-none py-2 px-4 rounded-full text-[0.85rem] font-semibold cursor-pointer inline-flex items-center transition-all shadow-sm hover:bg-[#3f356d] hover:-translate-y-[1px] hover:shadow-md" onClick={onAddLesson}>
                        <PlusCircle size={16} className="mr-2" />
                        Create Lesson
                      </button>
                    )}
                  </li>
                ) : (
                  lessons.map((lesson) => {
                    const isActive = lesson.lesson_id === activeLessonId;
                    
                    return (
                    <li key={lesson.lesson_id} className="mb-2 rounded-lg w-full">
                      <div className="flex items-center relative w-full overflow-visible group">
                        <NavLink 
                          to={`/dashboard/courses/${course.course_id}/lessons/${lesson.lesson_id}`}
                          className={({ isActive }) => `flex-1 min-w-0 pr-10 ${navLinkClass} ${isActive ? activeNavLinkClass : ''}`} 
                        >
                          <span className="mr-3 flex items-center shrink-0"><Play size={18} /></span>
                          <span className="whitespace-nowrap overflow-hidden text-ellipsis" title={lesson.title}>{lesson.title}</span>
                        </NavLink>
                        
                        {(onEditLesson || onDeleteLesson) && (
                          <button 
                            className={`lesson-more-btn absolute right-2 bg-transparent border-none cursor-pointer flex items-center justify-center p-1.5 rounded-full transition-colors z-[5] ${isActive ? 'text-white hover:bg-white/20' : 'text-gray-500 hover:bg-[#514587]/10 hover:text-[#514587] opacity-0 group-hover:opacity-100'} ${activeDropdownLessonId === lesson.lesson_id ? 'opacity-100' : ''}`}
                            onClick={(e) => toggleDropdown(e, lesson.lesson_id)}
                            title="Lesson Actions"
                          >
                            <MoreVertical size={18} />
                          </button>
                        )}

                        {activeDropdownLessonId === lesson.lesson_id && (
                          <div className="absolute top-[2.5rem] right-3 bg-white border border-[#ecebea] rounded-lg shadow-lg p-1.5 min-w-[180px] z-[100] flex flex-col gap-0.5" ref={dropdownRef}>
                            {onEditLesson && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); onEditLesson(lesson); setActiveDropdownLessonId(null); }}
                                className="flex items-center w-full px-3 py-2 bg-transparent border-none rounded-md cursor-pointer text-gray-800 text-sm font-medium transition-colors hover:bg-[#514587]/10 hover:text-[#514587]"
                              >
                                <Edit2 size={16} className="mr-2" /> Rename Lesson
                              </button>
                            )}
                            <div className="h-[1px] bg-[#ecebea] my-1"></div>
                            {onDeleteLesson && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteLesson(lesson.lesson_id); setActiveDropdownLessonId(null); }}
                                className="flex items-center w-full px-3 py-2 bg-transparent border-none rounded-md cursor-pointer text-red-500 text-sm font-medium transition-colors hover:bg-red-50"
                              >
                                <Trash2 size={16} className="mr-2" /> Delete Lesson
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  )})
                )}
              </ul>

              <div className="px-6 pb-3 text-xs uppercase tracking-widest text-[#7a7a7a] font-semibold w-[280px]">Community</div>
              <ul className="list-none px-4 w-[280px] mb-6">
                <li className="mb-2 rounded-lg w-full">
                    <NavLink to={`/courses/${course.course_id}/discussion`} className={({ isActive }) => `${navLinkClass} ${isActive ? activeNavLinkClass : ''}`}>
                       <span className="mr-3 flex items-center"><MessageSquare size={18} /></span>
                       <span className="whitespace-nowrap overflow-hidden text-ellipsis">Discussions</span>
                    </NavLink>
                 </li>
              </ul>
            </>
          )}

          {/* ---- MAIN MENU SECTION ---- */}
          <div className="px-6 pb-3 text-xs uppercase tracking-widest text-[#7a7a7a] font-semibold w-[280px]">Main Menu</div>
          <ul className="list-none px-4 w-[280px] mb-6 flex flex-col gap-1">
            <li className="rounded-lg w-full">
              <NavLink
                to="/dashboard/announcements"
                className={({ isActive }) => `${navLinkClass} ${isActive ? activeNavLinkClass : ''}`}
              >
                <span className="mr-3 flex items-center"><Megaphone size={18} /></span>
                <span className="whitespace-nowrap overflow-hidden text-ellipsis">Announcements</span>
              </NavLink>
            </li>
            <li className="rounded-lg w-full">
              <NavLink
                to="/dashboard/profile"
                className={({ isActive }) => `${navLinkClass} ${isActive ? activeNavLinkClass : ''}`}
              >
                <span className="mr-3 flex items-center"><User size={18} /></span>
                <span className="whitespace-nowrap overflow-hidden text-ellipsis">Profile</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
