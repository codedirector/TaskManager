'use client'

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useMemo } from "react";
import {
  fetchTasks,
  createTask,
  updateTaskThunk,
  deleteTaskThunk,
  clearError,
  selectFilteredTasks,
  TASK_STATUS,
  TASK_PRIORITY
} from "@/redux/tasksSlice";
import { TaskEditor } from "./TaskEditor";

export default function TasksUI({ listId }) {
  const dispatch = useDispatch();

  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedTag, setSelectedTag] = useState('all');
  const [editingTask, setEditingTask] = useState(null);
  const [showTaskEditor, setShowTaskEditor] = useState(false);
  const [activeSection, setActiveSection] = useState('all'); // 'all' or 'dueSoon'

  const tasksState = useSelector(s => s.tasks);
  const { status, error, operationStatus } = tasksState;

  const allTasks = useSelector(state =>
    selectFilteredTasks(state, {
      listId,
      status: 'all',
      tag: 'all',
      sortBy: 'dueDate',
      sortOrder: 'asc'
    })
  );

  const filteredTasks = useSelector(state =>
    selectFilteredTasks(state, {
      listId,
      status: filter,
      tag: selectedTag,
      sortBy,
      sortOrder
    })
  );
  const dueSoonTasks = useMemo(() => {
    const now = new Date();
    const limit = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    return allTasks.filter(task => {
      if (!task.dueDate) return false;
      if (task.status === TASK_STATUS.DONE) return false;
      const d = new Date(task.dueDate);
      return d >= now && d <= limit;
    });
  }, [allTasks]);

  
  const currentTasks = activeSection === 'dueSoon' ? dueSoonTasks : filteredTasks;

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: TASK_PRIORITY.MEDIUM,
    status: TASK_STATUS.TODO,
    tags: []
  });

  const allTags = useMemo(() => {
    const tagSet = new Set();
    allTasks.forEach(task => {
      (task.tags || []).forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [allTasks]);

  useEffect(() => {
    if (listId) {
      dispatch(fetchTasks(listId));
    }
  }, [dispatch, listId]);


  useEffect(() => {
    if (!showTaskEditor) {
      setEditingTask(null);
      setNewTask({
        title: '',
        description: '',
        dueDate: '',
        priority: TASK_PRIORITY.MEDIUM,
        status: TASK_STATUS.TODO,
        tags: []
      });
    }
  }, [showTaskEditor]);

  const validateTask = (task) => {
    if (!task.title || !task.title.trim()) {
      alert("Title is required");
      return false;
    }
    if (task.dueDate) {
      const due = new Date(task.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (due < today && !window.confirm("Due date is in the past. Continue?")) {
        return false;
      }
    }
    return true;
  };

  const handleCreateTask = () => {
    if (!validateTask(newTask)) return;
    const taskData = {
      ...newTask,
      listId,
      createdAt: new Date().toISOString(),
      dueDate: newTask.dueDate || null
    };
    dispatch(createTask({ listId, task: taskData }))
      .then(() => setShowTaskEditor(false));
  };

  const handleUpdateTask = () => {
    if (!validateTask(editingTask)) return;
    dispatch(updateTaskThunk({
      listId,
      task: { ...editingTask, dueDate: editingTask.dueDate || null }
    }))
    .then(() => setShowTaskEditor(false));
  };

  const handleToggleStatus = (task) => {
    let nextStatus = TASK_STATUS.TODO;
    if (task.status === TASK_STATUS.TODO) nextStatus = TASK_STATUS.IN_PROGRESS;
    else if (task.status === TASK_STATUS.IN_PROGRESS) nextStatus = TASK_STATUS.DONE;
    dispatch(updateTaskThunk({
      listId,
      task: { ...task, status: nextStatus }
    }));
  };

  const handleDeleteTask = (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      dispatch(deleteTaskThunk({ listId, id }));
    }
  };

  const handleEditTask = (task) => {
    setEditingTask({ ...task });
    setShowTaskEditor(true);
  };

  const handleTagToggle = (tag) => {
    const base = editingTask ? editingTask : newTask;
    const tags = base.tags || [];
    const newTags = tags.includes(tag)
      ? tags.filter(t => t !== tag)
      : [...tags, tag];
    if (editingTask) {
      setEditingTask({ ...editingTask, tags: newTags });
    } else {
      setNewTask({ ...newTask, tags: newTags });
    }
  };

  const getStatusColor = (status) => {
    if (status === TASK_STATUS.TODO) return 'bg-red-100 text-red-800 border-red-300';
    if (status === TASK_STATUS.IN_PROGRESS) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (status === TASK_STATUS.DONE) return 'bg-green-100 text-green-800 border-green-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };
  const getPriorityColor = (prio) => {
    if (prio === TASK_PRIORITY.HIGH) return 'bg-red-500 ring-red-200';
    if (prio === TASK_PRIORITY.MEDIUM) return 'bg-yellow-500 ring-yellow-200';
    if (prio === TASK_PRIORITY.LOW) return 'bg-green-500 ring-green-200';
    return 'bg-gray-500 ring-gray-200';
  };
  const getPriorityBorderColor = (prio) => {
    if (prio === TASK_PRIORITY.HIGH) return 'border-l-red-500';
    if (prio === TASK_PRIORITY.MEDIUM) return 'border-l-yellow-500';
    if (prio === TASK_PRIORITY.LOW) return 'border-l-green-500';
    return 'border-l-gray-500';
  };
  const getStatusText = (status) => {
    if (status === TASK_STATUS.TODO) return 'To Do';
    if (status === TASK_STATUS.IN_PROGRESS) return 'In Progress';
    if (status === TASK_STATUS.DONE) return 'Completed';
    return status;
  };
  const getPriorityText = (prio) => {
    if (prio === TASK_PRIORITY.HIGH) return 'High Priority';
    if (prio === TASK_PRIORITY.MEDIUM) return 'Medium Priority';
    if (prio === TASK_PRIORITY.LOW) return 'Low Priority';
    return prio;
  };
  const getTimeUntilDue = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due - now;
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffH < 1) {
      const diffM = Math.floor(diffMs / (1000 * 60));
      return `${diffM} minute${diffM !== 1 ? 's' : ''}`;
    } else if (diffH < 24) {
      return `${diffH} hour${diffH !== 1 ? 's' : ''}`;
    } else {
      const diffD = Math.floor(diffH / 24);
      return `${diffD} day${diffD !== 1 ? 's' : ''}`;
    }
  };
  const getUrgencyColor = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffH = Math.floor((due - now) / (1000 * 60 * 60));
    if (diffH < 6) return 'bg-red-100 text-red-800 border-red-300';
    if (diffH < 24) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  };

  if (status === "loading" && allTasks.length === 0) {
    return (
      <div className="p-6 border rounded bg-gray-50">
        <p>Loading tasks…</p>
      </div>
    );
  }

 return (
    <div className="p-4 sm:p-6 border rounded bg-black shadow text-white border-white/30 max-w-4xl mx-auto">
   
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-2 sm:gap-0">
        <h2 className="text-2xl font-bold font-mono">Tasks</h2>
        <div className="font-mono text-gray-300">Total: {allTasks.length}</div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-800 text-white rounded flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => dispatch(clearError())}
            className="ml-4 text-white font-bold hover:text-red-400"
          >
            x
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-6 font-mono">
        <button
          onClick={() => setActiveSection('all')}
          className={`px-3 py-2 rounded ${
            activeSection === 'all' ? 'bg-white text-black font-bold' : 'bg-white/10 text-gray-300'
          } hover:bg-white hover:text-black transition w-full sm:w-auto`}
        >
          All Tasks ({allTasks.length})
        </button>
        <button
          onClick={() => setActiveSection('dueSoon')}
          className={`px-3 py-2 rounded ${
            activeSection === 'dueSoon' ? 'bg-white text-black font-bold' : 'bg-white/10 text-gray-300'
          } hover:bg-white hover:text-black transition w-full sm:w-auto`}
        >
          Due Soon ({dueSoonTasks.length})
        </button>
        <button
          onClick={() => setShowTaskEditor(true)}
          className="px-3 py-2 rounded bg-white/20 hover:bg-white/40 transition w-full sm:w-auto"
        >
          + Add Task
        </button>
      </div>

          {activeSection === 'all' && (
        <div className="mb-6 space-y-4 font-mono">
          <div>
            <label className="block mb-1">Status:</label>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="bg-black border border-white/30 text-white p-2 rounded w-full"
            >
              <option value="all">All</option>
              <option value={TASK_STATUS.TODO}>To Do</option>
              <option value={TASK_STATUS.IN_PROGRESS}>In Progress</option>
              <option value={TASK_STATUS.DONE}>Completed</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Tag:</label>
            <select
              value={selectedTag}
              onChange={e => setSelectedTag(e.target.value)}
              className="bg-black border border-white/30 text-white p-2 rounded w-full"
            >
              <option value="all">All</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">Sort by:</label>
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-black border border-white/30 text-white p-2 rounded flex-grow w-full sm:w-auto"
              >
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="createdAt">Created</option>
                <option value="title">Title</option>
              </select>
              <button
                onClick={() => setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'))}
                className="bg-white/10 text-white px-3 py-2 rounded hover:bg-white/30 transition w-full sm:w-auto"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      )}

      {currentTasks.length === 0 ? (
        <div className="py-16 text-center text-gray-400 font-mono">
          {activeSection === 'dueSoon' ? 'No tasks due soon.' : 'No tasks found.'}
        </div>
      ) : (
        <div className="space-y-4">
          {currentTasks.map(task => (
            <div
              key={task.id}
              className={`p-4 border-l-4 ${getPriorityBorderColor(task.priority)} bg-gray-900 rounded shadow-sm`}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}></span>
                    <h3 className={task.status === TASK_STATUS.DONE ? 'line-through text-gray-500' : 'text-white'}>
                      {task.title}
                    </h3>
                    {activeSection === 'dueSoon' && task.dueDate && (
                      <span
                        className={`ml-2 px-2 py-1 text-xs rounded ${getUrgencyColor(task.dueDate)}`}
                      >
                        Due in {getTimeUntilDue(task.dueDate)}
                      </span>
                    )}
                  </div>
                  {task.description && <p className="text-gray-400">{task.description}</p>}
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-300">
                    <span className={`px-2 py-1 rounded ${getStatusColor(task.status)}`}>
                      {getStatusText(task.status)}
                    </span>
                    {task.dueDate && (
                      <span>📅 {new Date(task.dueDate).toLocaleDateString()}</span>
                    )}
                    {task.tags && task.tags.length > 0 && (
                      <span>Tags: {task.tags.join(', ')}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap sm:flex-col gap-2">
                  <button
                    className="text-white bg-white/10 hover:bg-white/30 rounded px-3 py-1 min-w-[80px]"
                    onClick={() => handleToggleStatus(task)}
                  >
                    {task.status === TASK_STATUS.DONE
                      ? 'Undo'
                      : task.status === TASK_STATUS.IN_PROGRESS
                      ? 'Complete'
                      : 'Start'}
                  </button>
                  <button
                    className="text-white bg-white/10 hover:bg-white/30 rounded px-3 py-1 min-w-[80px]"
                    onClick={() => handleEditTask(task)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-400 hover:text-red-600 rounded px-3 py-1 min-w-[80px]"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      
      {status === "loading" && allTasks.length > 0 && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <div className="px-4 py-2 bg-white text-black rounded shadow">Refreshing…</div>
        </div>
      )}

      {/* Task Editor */}
      {showTaskEditor && (
        <TaskEditor
          task={editingTask}
          listId={listId}
          onClose={() => setShowTaskEditor(false)}
        />
      )}
    </div>
  );
}
