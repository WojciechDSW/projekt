import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiLogOut } from 'react-icons/fi'; // Poprawny import ikon

const Tasks: React.FC = () => {
  const [lists, setLists] = useState<any[]>([]);
  const [newListName, setNewListName] = useState('');
  const [newTaskTitles, setNewTaskTitles] = useState<{ [key: number]: string }>({});
  const [newTaskPriorities, setNewTaskPriorities] = useState<{ [key: number]: string }>({});
  const [editingListId, setEditingListId] = useState<number | null>(null);
  const [editingListName, setEditingListName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLists = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const res = await axios.get('http://localhost:5000/lists', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLists(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error('Error fetching lists:', error);
        navigate('/login');
      }
    };
    fetchLists();
  }, [navigate]);

  const handleAddList = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const res = await axios.post(
        'http://localhost:5000/lists',
        { name: newListName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLists([...lists, { ...res.data, tasks: [] }]);
      setNewListName('');
    } catch (error) {
      console.error('Error adding list:', error);
      alert('Błąd podczas dodawania listy');
    }
  };

  const handleEditList = (listId: number, currentName: string) => {
    setEditingListId(listId);
    setEditingListName(currentName);
  };

  const handleSaveListName = async (listId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    if (!editingListName.trim()) {
      alert('Nazwa listy nie może być pusta');
      return;
    }
    try {
      const res = await axios.put(
        `http://localhost:5000/lists/${listId}`,
        { name: editingListName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLists(lists.map((list) => (list.id === listId ? res.data : list)));
      setEditingListId(null);
      setEditingListName('');
    } catch (error) {
      console.error('Error updating list name:', error);
      alert('Błąd podczas aktualizacji nazwy listy');
    }
  };

  const handleDeleteList = async (listId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/lists/${listId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLists(lists.filter((list) => list.id !== listId));
      setNewTaskTitles((prev) => {
        const updated = { ...prev };
        delete updated[listId];
        return updated;
      });
      setNewTaskPriorities((prev) => {
        const updated = { ...prev };
        delete updated[listId];
        return updated;
      });
    } catch (error) {
      console.error('Error deleting list:', error);
      alert('Błąd podczas usuwania listy');
    }
  };

  const handleAddTask = async (listId: number, e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const title = newTaskTitles[listId] || '';
    const priority = newTaskPriorities[listId] || 'Średni';
    console.log('Sending task to backend:', { title, listId, priority });
    if (!title.trim()) {
      alert('Tytuł zadania nie może być pusty');
      return;
    }
    try {
      const res = await axios.post(
        'http://localhost:5000/tasks',
        { title, listId, priority },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Task added successfully:', res.data);
      setLists(
        lists.map((list) =>
          list.id === listId ? { ...list, tasks: [...(list.tasks || []), res.data] } : list
        )
      );
      setNewTaskTitles((prev) => ({ ...prev, [listId]: '' }));
      setNewTaskPriorities((prev) => ({ ...prev, [listId]: 'Średni' }));
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Błąd podczas dodawania zadania');
    }
  };

  const handleToggleTask = async (listId: number, taskId: number, completed: boolean) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const res = await axios.put(
        `http://localhost:5000/tasks/${taskId}`,
        { completed: !completed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLists(
        lists.map((list) =>
          list.id === listId
            ? {
                ...list,
                tasks: list.tasks.map((task: any) =>
                  task.id === taskId ? res.data : task
                ),
              }
            : list
        )
      );
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Błąd podczas aktualizacji zadania');
    }
  };

  const handleDeleteTask = async (listId: number, taskId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLists(
        lists.map((list) =>
          list.id === listId
            ? { ...list, tasks: list.tasks.filter((task: any) => task.id !== taskId) }
            : list
        )
      );
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Błąd podczas usuwania zadania');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Nagłówek */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            CloudTasks
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
          >
            <FiLogOut />
            Wyloguj
          </button>
        </header>

        {/* Formularz dodawania listy */}
        <form onSubmit={handleAddList} className="mb-8 flex gap-4">
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="Nowa lista..."
            className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
          <button
            type="submit"
            className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 transition-all duration-200"
          >
            <FiPlus />
            Dodaj
          </button>
        </form>

        {/* Listy */}
        {lists.length > 0 ? (
          lists.map((list) => {
            const totalTasks = (list.tasks || []).length;
            const completedTasks = (list.tasks || []).filter((task: any) => task.completed).length;
            const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

            return (
              <div
                key={list.id}
                className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md transition-all duration-300 animate-fade-in"
              >
                {/* Nagłówek listy */}
                <div className="flex justify-between items-center mb-4">
                  {editingListId === list.id ? (
                    <div className="flex items-center gap-3 w-full">
                      <input
                        type="text"
                        value={editingListName}
                        onChange={(e) => setEditingListName(e.target.value)}
                        className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleSaveListName(list.id)}
                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200"
                      >
                        <FiSave />
                      </button>
                      <button
                        onClick={() => setEditingListId(null)}
                        className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                      >
                        <FiX />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-xl font-semibold">
                        {list.name}{' '}
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ({completedTasks}/{totalTasks})
                        </span>
                      </h2>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditList(list.id, list.name)}
                          className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all duration-200"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDeleteList(list.id)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Pasek postępu */}
                <div className="mb-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Ukończono: {Math.round(progress)}%
                  </p>
                </div>

                {/* Formularz dodawania zadania */}
                <form
                  onSubmit={(e) => handleAddTask(list.id, e)}
                  className="mb-4 flex gap-3"
                >
                  <input
                    type="text"
                    value={newTaskTitles[list.id] || ''}
                    onChange={(e) =>
                      setNewTaskTitles((prev) => ({ ...prev, [list.id]: e.target.value }))
                    }
                    placeholder="Nowe zadanie..."
                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={newTaskPriorities[list.id] || 'Średni'}
                    onChange={(e) =>
                      setNewTaskPriorities((prev) => ({ ...prev, [list.id]: e.target.value }))
                    }
                    className="px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Niski">Niski</option>
                    <option value="Średni">Średni</option>
                    <option value="Wysoki">Wysoki</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 transition-all duration-200"
                  >
                    <FiPlus />
                    Dodaj
                  </button>
                </form>

                {/* Lista zadań */}
                <ul className="space-y-3">
                  {(list.tasks || []).map((task: any) => (
                    <li
                      key={task.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleTask(list.id, task.id, task.completed)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 transition-all duration-200"
                      />
                      <span
                        className={`flex-1 text-base ${
                          task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''
                        } ${
                          task.priority === 'Wysoki'
                            ? 'text-red-500'
                            : task.priority === 'Niski'
                            ? 'text-green-500'
                            : 'text-yellow-500'
                        }`}
                      >
                        {task.title}{' '}
                        {task.priority && (
                          <span className="text-sm">({task.priority})</span>
                        )}
                      </span>
                      <button
                        onClick={() => handleDeleteTask(list.id, task.id)}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
                      >
                        <FiTrash2 />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">
            Brak list do wyświetlenia. Dodaj nową listę!
          </p>
        )}
      </div>
    </div>
  );
};

export default Tasks;