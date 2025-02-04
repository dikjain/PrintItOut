import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FileText, Printer, XCircle, CheckCircle, Trash2, RotateCcw, Users, MessageCircle, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import Switch from 'react-switch';
import { cn } from '@/lib/utils';

export function CustomPrint() {
  const [customPrints, setCustomPrints] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isPinModalOpen, setIsPinModalOpen] = useState(true);
  const [pin, setPin] = useState('');
  const { mode: darkMode } = useOutletContext();
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const getAllUsers = useCallback(async () => {
    const response = await axios.get('/api/users/allusers');
    setUsers(response.data);
  }, []);

  const fetchCustomPrints = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/customprint');
      // Ensure response.data is an array
      setCustomPrints(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching custom prints:', error);
      setCustomPrints([]); // Set to empty array on error
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
        fetchCustomPrints();
  }, [fetchCustomPrints]);

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  const handleDeletePrint = useCallback(async (printId) => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/customprint/${printId}`);
      await fetchCustomPrints(); // Refresh the prints list after deletion
    } catch (error) {
      console.error('Error deleting print:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchCustomPrints]);

  const handleChangePrintStatus = useCallback(async (printId, status) => {
    try {
      setIsLoading(true);
      await axios.put(`/api/customprint/${printId}`, { status });
      fetchCustomPrints();
    } catch (error) {
      console.error('Error changing print status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchCustomPrints]);

  const pendingPrintsCount = useMemo(() => 
    Array.isArray(customPrints) ? customPrints.filter(p => p.status === 'Pending').length : 0, 
    [customPrints]
  );

  const pagesCount = useMemo(() => {
    if (!Array.isArray(customPrints)) return 0;
    
    return showAll
      ? customPrints.filter(p => p.status === 'Completed').reduce((total, print) => total + print.pages, 0)
      : customPrints.filter(p => p.status === 'Pending').reduce((total, print) => total + print.pages, 0);
  }, [customPrints, showAll]);

  const handleUserModalOpen = useCallback((user) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsUserModalOpen(false);
    setSelectedUser(null);
  }, []);

  const filteredPrints = useMemo(() => {
    if (!Array.isArray(customPrints)) return [];
    return showAll ? customPrints : customPrints.filter(print => print.status === 'Pending');
  }, [customPrints, showAll]);

  return (
    <div className={`space-y-6 relative transition-colors duration-[500ms] min-h-screen p-6 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
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
                <label className="text-sm font-medium mb-1">Phone Number</label>
                <div className={cn("px-4 py-3 rounded-lg",
                  darkMode ? "bg-gray-700 text-white" : "bg-gray-50 text-gray-800")}>
                  {selectedUser.Phone}
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">UPI ID</label>
                <div className={cn("px-4 py-3 rounded-lg",
                  darkMode ? "bg-gray-700 text-white" : "bg-gray-50 text-gray-800")}>
                  {selectedUser.upiId}
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

      <div>
        <h1 className="text-2xl font-semibold">Custom Print Dashboard</h1>
        <p className={cn("mt-1 text-sm", darkMode ? "text-gray-300" : "text-gray-600")}>
          Monitor and manage custom print requests
        </p>
      </div>

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
                  <dt className="text-sm font-medium truncate">Pending Prints</dt>
                  <dd className="text-lg font-semibold">{pendingPrintsCount}</dd>
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
                  <dd className="text-lg font-semibold">{pagesCount}</dd>
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
          <h2 className="text-lg font-medium">{showAll ? 'All Custom Prints' : 'Pending Custom Prints'}</h2>
        </div>
        <div className={cn("border-t", darkMode ? "border-gray-700" : "border-gray-200")}>
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center">
                  <FaSpinner className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : !Array.isArray(filteredPrints) || filteredPrints.length === 0 ? (
                <p className="text-sm text-center">No custom prints at this moment</p>
              ) : (
                filteredPrints.map((print, i) => (
                  <div
                    key={i}
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between ${
                      print.status === 'Completed' ? 'bg-green-100' : 'bg-yellow-100'
                    } p-4 rounded-md`}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-800">{print.title}</p>
                        <p className="text-sm text-gray-500">{print.pages} pages × {print.copies || 1} copies</p>
                        <p className="text-sm text-gray-500">Roll No: {print.rollnumber}</p>
                        <p className="text-sm text-gray-500">Phone: {print.Phone}</p>
                        {print.message && (
                          <p className="text-sm text-gray-500">Message: {print.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                      <div className="text-sm text-gray-500">
                        {new Date(print.createdAt).toLocaleString()}
                      </div>
                      <a
                        href={print.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-500 text-white px-2 py-1 rounded-md flex items-center"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                      <button
                        onClick={() => handleDeletePrint(print._id)}
                        className="bg-red-500 text-white px-2 py-1 rounded-md flex items-center"
                        disabled={isLoading}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleUserModalOpen({
                          username: print.username,
                          rollnumber: print.rollnumber,
                          Phone: print.Phone,
                          upiId: print.upiId
                        })}
                        className="bg-blue-500 text-white px-2 py-1 rounded-md flex items-center"
                      >
                        <MessageCircle className="h-5 w-5" />
                      </button>
                      {print.status === 'Completed' ? (
                        <button
                          onClick={() => handleChangePrintStatus(print._id, 'Pending')}
                          className="bg-yellow-500 text-white px-2 py-1 rounded-md flex items-center"
                          disabled={isLoading}
                        >
                          <RotateCcw className="h-5 w-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleChangePrintStatus(print._id, 'Completed')}
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
