
'use client';
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { createTask, updateTaskThunk, TASK_STATUS, TASK_PRIORITY } from "@/redux/tasksSlice";

export const TaskEditor = ({ task, listId, onClose }) => {
  const dispatch = useDispatch();
  const isCreating = !task || !task.id;
  const { operationStatus } = useSelector(state => state.tasks);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: TASK_PRIORITY.MEDIUM,
    status: TASK_STATUS.TODO,
    tags: [],
  });

  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (task) {
      let dueDate = '';
      if (task.dueDate) {
        const d = new Date(task.dueDate);
        if (!isNaN(d)) {
          dueDate = d.toISOString().substring(0, 10);
        }
      }

      setFormData({
        title: task.title || '',
        description: task.description || '',
        dueDate,
        priority: task.priority || TASK_PRIORITY.MEDIUM,
        status: task.status || TASK_STATUS.TODO,
        tags: task.tags || [],
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'title') {
      setValidationError('');
    }
  };

  const handleTagToggle = (tag) => {
    setFormData(prev => {
      const tags = prev.tags || [];
      if (tags.includes(tag)) {
        return { ...prev, tags: tags.filter(t => t !== tag) };
      } else {
        return { ...prev, tags: [...tags, tag] };
      }
    });
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!formData.title.trim()) {
      setValidationError('Task title is required.');
      return;
    }

    if (formData.dueDate) {
      const dueDateObj = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (dueDateObj < today && !window.confirm('The due date is in the past. Save anyway?')) {
        return;
      }
    }

    const finalTask = {
      ...formData,
      dueDate: formData.dueDate || null,
      listId,
      ...(isCreating ? { createdAt: new Date().toISOString() } : { id: task.id }),
    };

    const action = isCreating
      ? createTask({ listId, task: finalTask })
      : updateTaskThunk({ listId, task: finalTask });

    dispatch(action).unwrap()
      .then(() => onClose())
      .catch(() => setValidationError('Failed to save task. Please try again.'));
  };

  const availableTags = ['work', 'personal', 'urgent', 'shopping', 'health', 'learning'];
return (
  <div className="fixed inset-0 bg-black bg-opacity-95 flex justify-center items-center p-6 overflow-y-auto z-50 text-white font-mono">
    <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
      
     
      <div className="flex justify-between items-center px-7 py-5 border-b border-white/30 text-white text-3xl font-bold underline font-mono select-none">
        {isCreating ? 'Create New Task' : 'Edit Task'}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="text-white text-4xl leading-none hover:text-gray-300 transition-colors duration-300"
        >
          ×
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="px-7 py-7 flex flex-col gap-6 overflow-y-auto flex-grow"
      >
        {validationError && (
          <div className="bg-red-600 bg-opacity-20 text-red-400 font-semibold p-4 rounded-lg border border-red-500">
            {validationError}
          </div>
        )}

        {/* Title */}
        <div className="flex flex-col">
          <label htmlFor="title" className="font-semibold mb-2 text-lg">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Task title"
            required
            className="w-full p-4 rounded-xl border border-white/50 bg-black bg-opacity-70 text-white text-lg placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-blue-500 caret-white transition-shadow duration-300"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col">
          <label htmlFor="description" className="font-semibold mb-2 text-lg">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Task details"
            className="w-full p-4 rounded-xl border border-white/50 bg-black bg-opacity-70 text-white text-lg resize-y
              focus:outline-none focus:ring-2 focus:ring-blue-500 caret-white transition-shadow duration-300"
          />
        </div>
        <div className="flex flex-wrap gap-6">
          <div className="flex flex-col flex-1 min-w-[140px]">
            <label htmlFor="priority" className="font-semibold mb-2 text-lg">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="p-4 rounded-xl border border-white/50 bg-black bg-opacity-70 text-white text-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-300"
            >
              <option value={TASK_PRIORITY.LOW}>Low</option>
              <option value={TASK_PRIORITY.MEDIUM}>Medium</option>
              <option value={TASK_PRIORITY.HIGH}>High</option>
            </select>
          </div>

          <div className="flex flex-col flex-1 min-w-[140px]">
            <label htmlFor="dueDate" className="font-semibold mb-2 text-lg">
              Due Date
            </label>
            <input
              id="dueDate"
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="p-4 rounded-xl border border-white/50 bg-black bg-opacity-70 text-white text-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-300"
            />
          </div>
        </div>

        {/* Status */}
        <div className="flex flex-col">
          <label htmlFor="status" className="font-semibold mb-2 text-lg">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="p-4 rounded-xl border border-white/50 bg-black bg-opacity-70 text-white text-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-300"
          >
            <option value={TASK_STATUS.TODO}>To Do</option>
            <option value={TASK_STATUS.IN_PROGRESS}>In Progress</option>
            <option value={TASK_STATUS.DONE}>Done</option>
          </select>
        </div>

        {/* Tags */}
        <div className="flex flex-col">
          <label className="font-semibold mb-3 text-lg">Tags</label>
          <div className="flex flex-wrap gap-3">
            {availableTags.map((tag) => {
              const isSelected = formData.tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer select-none
                    transition-colors duration-300
                    ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-black bg-opacity-20 text-white hover:bg-blue-600 hover:text-white'
                    }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl border border-white/50 bg-transparent text-white font-semibold cursor-pointer
              transition-colors duration-300 hover:bg-white hover:text-black"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              !formData.title.trim() || operationStatus.creating || operationStatus.updating
            }
            className={`w-full py-3 rounded-xl border font-semibold
              ${
                !formData.title.trim() || operationStatus.creating || operationStatus.updating
                  ? 'bg-white bg-opacity-30 border-white/30 text-white cursor-not-allowed'
                  : 'bg-white text-black border-white cursor-pointer hover:bg-black hover:text-white'
              }
              transition-colors duration-300`}
          >
            {isCreating ? 'Create Task' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  </div>
);

};
