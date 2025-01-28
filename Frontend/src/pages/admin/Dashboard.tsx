import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FileText, Printer, XCircle, CheckCircle, Trash2, RotateCcw, Users, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import Switch from 'react-switch';
import { cn } from '@/lib/utils';
import { User } from '@/types';

interface Assignment {
  _id: string;
  title: string;
  pages: number;
  createdAt: string;
  status: string;
  user: User;
  upiId: string;
}

interface ContextType { 
  mode: boolean;
}




export function AdminDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [assignmentName, setAssignmentName] = useState('');
  const [pages, setPages] = useState(0);
  const [amount, setAmount] = useState(0);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [adminAssignments, setAdminAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isPinModalOpen, setIsPinModalOpen] = useState(true);
  const [pin, setPin] = useState('');
  const [upiId, setUpiId] = useState('');
  const [question, setQuestion] = useState('');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const { mode: darkMode } = useOutletContext<ContextType>();

  const getAllUsers = useCallback(async () => {
    const response = await axios.get('/api/users/allusers');
    setUsers(response.data);
  }, []);

  const fetchAssignments = useCallback(async () => {
    try {
      setIsLoading(true);
      const endpoint = showAll ? '/api/assignments/all' : '/api/assignments/pending';
      const response = await axios.get(endpoint);
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [showAll]);

  const fetchAdminAssignments = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/assignments/adminassignments');
      setAdminAssignments(response.data);
    } catch (error) {
      console.error('Error fetching admin assignments:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      try {
        const localUser = localStorage.getItem('user');
        if (localUser) {
          setUser(JSON.parse(localUser));
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    }
  }, [user, navigate, setUser]);

  useEffect(() => {
    fetchAssignments();
  }, [showAll, fetchAssignments]);

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  const handleAddAssignment = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleAdminModalOpen = useCallback(() => {
    fetchAdminAssignments();
    setIsAdminModalOpen(true);
  }, [fetchAdminAssignments]);

  const handleUserModalOpen = useCallback((user: User) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  }, []);

  const handleQuestionModalOpen = useCallback(async () => {
    setIsLoading(true);
    await fetchAdminAssignments();
    setIsLoading(false);
    setIsQuestionModalOpen(true);
  }, [fetchAdminAssignments]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setIsAdminModalOpen(false);
    setIsUserModalOpen(false);
    setIsQuestionModalOpen(false);
    setAssignmentName('');
    setPages(0);
    setUpiId('');
    setAmount(0);
    setSelectedUser(null);
    setSelectedAssignmentId('');
    setQuestion('');
  }, []);

  const handlePagesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const pagesValue = parseInt(e.target.value, 10);
    setPages(pagesValue);
    setAmount(pagesValue * 2);
  }, []);

  const handleAddAssignmentSubmit = useCallback(async () => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }
      setIsLoading(true);
      const response = await axios.post('/api/assignments/add', {
        title: assignmentName,
        userId: user?._id,
        isAdmin: true,
        pages: pages,
      });
      if (response.status === 201) {
        handleModalClose();
        fetchAssignments();
      } else {
        console.error('Error adding assignment:', response.data);
      }
    } catch (error) {
      console.error('Error adding assignment:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, assignmentName, pages, navigate, handleModalClose, fetchAssignments]);

  const handleDeleteAssignment = useCallback(async (assignmentId: string) => {
    try {
      setIsLoading(true);
      const response = await axios.delete(`/api/assignments/delete/${assignmentId}`);
      if (response.status === 200) {
        fetchAssignments();
        fetchAdminAssignments();
      } else {
        console.error('Error deleting assignment:', response.data);
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchAssignments, fetchAdminAssignments]);

  const handleChangeAssignmentStatus = useCallback(async (assignmentId: string, status: string) => {
    try {
      setIsLoading(true);
      const response = await axios.put(`/api/assignments/changeStatus`, {
        assignmentId: assignmentId,
        status: status,
      });
      if (response.status === 200) {
        fetchAssignments();
      } else {
        console.error('Error changing assignment status:', response.data);
      }
    } catch (error) {
      console.error('Error changing assignment status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchAssignments]);

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  const handlePinSubmit = useCallback(() => {
    if (pin === '1289') {
      setIsPinModalOpen(false);
    } else {
      navigate('/login');
    }
  }, [pin, navigate]);

  const handleQuestionSubmit = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.post('/api/assignments/addQuestion', {
        assignmentId: selectedAssignmentId,
        question: question,
      });
      if (response.status === 200) {
        handleModalClose();
      } else {
        console.error('Error adding question:', response.data);
      }
    } catch (error) {
      console.error('Error adding question:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAssignmentId, question, handleModalClose]);

  const pendingAssignmentsCount = useMemo(() => assignments.filter(a => a.status === 'Pending').length, [assignments]);
  const pagesCount = useMemo(() => {
    return showAll
      ? assignments.filter(a => a.status === 'Completed').reduce((total, assignment) => total + assignment.pages, 0)
      : assignments.filter(a => a.status === 'Pending').reduce((total, assignment) => total + assignment.pages, 0);
  }, [assignments, showAll]);

  if (isPinModalOpen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
        <div className={cn("p-8 rounded-lg shadow-lg w-96", darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900")}>
          <h2 className={cn("text-xl font-semibold", darkMode ? "text-white" : "text-gray-900")}>Enter PIN</h2>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">PIN</label>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className={cn("mt-1 block w-full border px-3 py-2 rounded-md shadow-sm", 
                darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 bg-white")}
            />
          </div>
          <div className="pt-4">
            <button
              onClick={handlePinSubmit}
              className={cn("w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2",
                darkMode ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-indigo-500 hover:bg-indigo-600 text-white")}
            >
              <CheckCircle className="h-5 w-5" />
              <span>Submit</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 relative transition-colors duration-[500ms] min-h-screen p-6 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      <div>
        <h1 className="text-2xl font-semibold">
          Admin Dashboard
        </h1>
        <p className={cn("mt-1 text-sm", darkMode ? "text-gray-300" : "text-gray-600")}>
          Monitor and manage print requests across the system.
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleAddAssignment}
          className={cn("px-4 py-2 rounded-md", 
            darkMode ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-indigo-500 hover:bg-indigo-600 text-white")}
        >
          Add Assignment
        </button>

        <button
          onClick={handleAdminModalOpen}
          className={cn("px-4 py-2 rounded-md",
            darkMode ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-emerald-500 hover:bg-emerald-600 text-white")}
        >
          View Admin Assignments
        </button>

        <button
          onClick={handleQuestionModalOpen}
          className={cn("px-4 py-2 rounded-md",
            darkMode ? "bg-violet-600 hover:bg-violet-700 text-white" : "bg-violet-500 hover:bg-violet-600 text-white")}
        >
          Add Question
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
          <div className={cn("p-8 rounded-lg shadow-lg w-full max-w-3xl mx-4", 
            darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900")}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Add Assignment</h2>
              <button onClick={handleModalClose}>
                <XCircle className={cn("h-6 w-6", darkMode ? "text-gray-400" : "text-gray-500")} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Assignment Name</label>
                <input
                  type="text"
                  value={assignmentName}
                  onChange={(e) => setAssignmentName(e.target.value)}
                  className={cn("mt-1 block w-full border px-3 py-2 rounded-md shadow-sm",
                    darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 bg-white")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Number of Pages</label>
                <input
                  type="number"
                  value={pages}
                  onChange={handlePagesChange}
                  className={cn("mt-1 block w-full border px-3 py-2 rounded-md shadow-sm",
                    darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 bg-white")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Amount to be Paid</label>
                <input
                  type="text"
                  value={amount}
                  readOnly
                  className={cn("mt-1 block w-full border px-3 py-2 rounded-md shadow-sm",
                    darkMode ? "bg-gray-600 border-gray-500 text-gray-300" : "bg-gray-100 border-gray-200")}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleModalClose}
                  className={cn("px-4 py-2 rounded-md flex items-center",
                    darkMode ? "bg-red-600 hover:bg-red-700 text-white" : "bg-red-500 hover:bg-red-600 text-white")}
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  Close
                </button>
                <button
                  onClick={handleAddAssignmentSubmit}
                  className={cn("px-4 py-2 rounded-md flex items-center",
                    darkMode ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-emerald-500 hover:bg-emerald-600 text-white")}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <FaSpinner className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-5 w-5 mr-2" />
                  )}
                  {isLoading ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAdminModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 overflow-auto z-50">
          <div className={cn("p-8 rounded-lg shadow-lg w-full max-w-3xl mx-4 max-h-full overflow-y-auto",
            darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900")}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Admin Assignments</h2>
              <button onClick={handleModalClose}>
                <XCircle className={cn("h-6 w-6", darkMode ? "text-gray-400" : "text-gray-500")} />
              </button>
            </div>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center">
                  <FaSpinner className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : adminAssignments.length === 0 ? (
                <p className={cn("text-sm text-center", darkMode ? "text-gray-400" : "text-gray-500")}>
                  No admin assignments at this moment
                </p>
              ) : (
                adminAssignments.map((assignment, i) => (
                  <div
                    key={i}
                    className={cn("flex items-center justify-between p-4 rounded-md",
                      assignment.status === 'Completed' 
                        ? darkMode ? "bg-green-900/30" : "bg-green-100"
                        : darkMode ? "bg-yellow-900/30" : "bg-yellow-100"
                    )}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FileText className={cn("h-5 w-5", darkMode ? "text-gray-300" : "text-gray-400")} />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium">{assignment.title}</p>
                        <p className={cn("text-sm", darkMode ? "text-gray-400" : "text-gray-500")}>
                          {assignment.pages} pages
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className={cn("text-sm", darkMode ? "text-gray-400" : "text-gray-500")}>
                        {new Date(assignment.createdAt).toLocaleString()}
                      </div>
                      <button
                        onClick={() => handleDeleteAssignment(assignment._id)}
                        className={cn("px-2 py-1 rounded-md flex items-center",
                          darkMode ? "bg-red-600 hover:bg-red-700 text-white" : "bg-red-500 hover:bg-red-600 text-white")}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {isUserModalOpen && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
          <div className={cn("p-8 rounded-lg shadow-lg w-full max-w-md mx-4",
            darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900")}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">User Profile</h2>
              <button 
                onClick={handleModalClose}
                className={cn("transition-colors",
                  darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-400 hover:text-gray-500")}
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Full Name</label>
                <div className={cn("px-4 py-3 rounded-lg",
                  darkMode ? "bg-gray-700 text-white" : "bg-gray-50 text-gray-800")}>
                  {selectedUser.username}
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Roll Number</label>
                <div className={cn("px-4 py-3 rounded-lg",
                  darkMode ? "bg-gray-700 text-white" : "bg-gray-50 text-gray-800")}>
                  {selectedUser.rollnumber}
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Email Address</label>
                <div className={cn("px-4 py-3 rounded-lg break-all",
                  darkMode ? "bg-gray-700 text-white" : "bg-gray-50 text-gray-800")}>
                  {selectedUser.email}
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Phone Number</label>
                <div className={cn("px-4 py-3 rounded-lg",
                  darkMode ? "bg-gray-700 text-white" : "bg-gray-50 text-gray-800")}>
                  {selectedUser.phone}
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">UPI ID</label>
                <div className={cn("px-4 py-3 rounded-lg",
                  darkMode ? "bg-gray-700 text-white" : "bg-gray-50 text-gray-800")}>
                  {upiId || 'N/A'}
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleModalClose}
                  className={cn("w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2",
                    darkMode ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-indigo-500 hover:bg-indigo-600 text-white")}
                >
                  <XCircle className="h-5 w-5" />
                  <span>Close Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isQuestionModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
          <div className={cn("p-8 rounded-lg shadow-lg w-full max-w-3xl mx-4 min-w-[350px] max-h-full overflow-y-auto",
            darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900")}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Add Question</h2>
              <button 
                onClick={handleModalClose}
                className={cn("transition-colors",
                  darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-400 hover:text-gray-500")}
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {isLoading ? (
              <div className="flex justify-center">
                <FaSpinner className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-1">Question</label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className={cn("mt-1 block text-start w-full h-[400px] border-2 px-3 py-2 rounded-md shadow-sm",
                      darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 bg-white")}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-1">Select Assignment</label>
                  <select
                    value={selectedAssignmentId}
                    onChange={(e) => setSelectedAssignmentId(e.target.value)}
                    className={cn("mt-1 block w-full border px-3 py-2 rounded-md shadow-sm",
                      darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-300 bg-white")}
                  >
                    <option value="">Select an assignment</option>
                    {adminAssignments.map((assignment) => (
                      <option key={assignment._id} value={assignment._id}>
                        {assignment.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleQuestionSubmit}
                    className={cn("w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2",
                      darkMode ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-indigo-500 hover:bg-indigo-600 text-white")}
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>Submit</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end mb-4">
        <Switch
          onChange={() => setShowAll(!showAll)}
          checked={showAll}
          onColor="#4f46e5"
          onHandleColor="#312e81"
          handleDiameter={30}
          uncheckedIcon={false}
          checkedIcon={false}
          boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
          activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
          height={20}
          width={48}
          className="react-switch z-0"
        />
        <span className="ml-2 text-sm">{showAll ? 'Show All' : 'Show Pending'}</span>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className={cn("overflow-hidden shadow rounded-lg",
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900")}>
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className={cn("h-6 w-6", darkMode ? "text-gray-300" : "text-gray-400")} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium truncate">Pending Assignments</dt>
                  <dd className="text-lg font-semibold">{pendingAssignmentsCount}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className={cn("overflow-hidden shadow rounded-lg",
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900")}>
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Printer className={cn("h-6 w-6", darkMode ? "text-gray-300" : "text-gray-400")} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium truncate">
                    {showAll ? 'Pages Printed' : 'Pages to be Printed'}
                  </dt>
                  <dd className="text-lg font-semibold">
                    {pagesCount}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className={cn("overflow-hidden shadow rounded-lg",
          darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900")}>
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className={cn("h-6 w-6", darkMode ? "text-gray-300" : "text-gray-400")} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium truncate">Users</dt>
                  <dd className="text-lg font-semibold">{users.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={cn("shadow rounded-lg",
        darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900")}>
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium">{showAll ? 'All Assignments' : 'Pending Assignments'}</h2>
        </div>
        <div className={cn("border-t", darkMode ? "border-gray-700" : "border-gray-200")}>
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center">
                  <FaSpinner className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : assignments.length === 0 ? (
                <p className="text-sm text-center">No assignments at this moment</p>
              ) : (
                assignments.map((assignment, i) => (
                  <div
                    key={i}
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between ${assignment.status === 'Completed' ? 'bg-green-100' : 'bg-yellow-100'} p-4 rounded-md`}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium">{assignment.title}</p>
                        <p className="text-sm text-gray-500">{assignment.pages} pages</p>
                        <p className="text-sm text-gray-500">{assignment.user.username} (Roll No: {assignment.user.rollnumber})</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                      <div className="text-sm text-gray-500">{new Date(assignment.createdAt).toLocaleString()}</div>
                      <button
                        onClick={() => handleDeleteAssignment(assignment._id)}
                        className="bg-red-500 text-white px-2 py-1 rounded-md flex items-center"
                        disabled={isLoading}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => { handleUserModalOpen(assignment.user); setUpiId(assignment.upiId) }}
                        className="bg-blue-500 text-white px-2 py-1 rounded-md flex items-center"
                      >
                        <MessageCircle className="h-5 w-5" />
                      </button>
                      {assignment.status === 'Completed' ? (
                        <button
                          onClick={() => handleChangeAssignmentStatus(assignment._id, 'Pending')}
                          className="bg-yellow-500 text-white px-2 py-1 rounded-md flex items-center"
                          disabled={isLoading}
                        >
                          <RotateCcw className="h-5 w-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleChangeAssignmentStatus(assignment._id, 'Completed')}
                          className="bg-green-500 text-white px-2 py-1 rounded-md flex items-center"
                          disabled={isLoading}
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}