import React, { useState, useEffect } from 'react';
import { FileText, Printer, User, History, Moon, Sun, MessageCircleQuestion } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context';
import { useNavigate, useLocation } from 'react-router-dom';
import QRCode from 'qrcode';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/animations/PageTransition';
import { cn } from '@/lib/utils';

interface Assignment {
  _id: string;
  title: string;
  pages: number;
  createdAt: string;
  query?: string;
}

interface Print {
  _id: string;
  title: string;
  pages: number;
  assignmentId: string;
  createdAt: string;
  status?: string;
}

export function StudentDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [prints, setPrints] = useState<Print[]>([]);
  const [historyPrints, setHistoryPrints] = useState<Print[]>([]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [upiUrl, setUpiUrl] = useState("");
  const [selectedAssignment, setSelectedAssignment] = useState<{id: string, title: string, pages: number} | null>(null);
  const [paymentAgreement, setPaymentAgreement] = useState(false);
  const [userUpiId, setUserUpiId] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<string | null>(null);

  const upiId = "aryan.chauhan@superyes";
  const userName = "AryanChauhan";

  const generateQRCode = async (pages: number) => {
    const amount = pages * 3;
    const upiUrl = `upi://pay?pa=${upiId}&pn=${userName}&am=${amount}&cu=INR`;
    setUpiUrl(upiUrl);

    try {
      const qrCode = await QRCode.toDataURL(upiUrl);
      setQrCodeUrl(qrCode);
    } catch (error) {
      console.error("Failed to generate QR code:", error);
      alert("Error generating QR code.");
    }
  };

  const fetchUserAssignments = async () => {
    if (!user || !user._id) {
      navigate('/login');
      return;
    }
    try {
      const response = await axios.get(`/api/assignments/userassignments/${user._id}`);
      const assignments = response.data;
      setHistoryPrints(assignments);
    } catch (error) {
      console.error('Error fetching user assignments:', error);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user?.print && user.print.length > 0) {
      setPrints(user.print);
    }
  }, [user, navigate]);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get('/api/assignments/adminassignments');
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  useEffect(() => {
    if (!user || !user._id) {
      navigate('/login');
      return;
    }

    fetchAssignments();
  }, [location?.pathname, user?._id, prints, navigate]);

  const handlePrintAssignment = async (assignmentId: string, title: string, pages: number) => {
    setSelectedAssignment({id: assignmentId, title, pages});
    await generateQRCode(pages);
    setShowQR(true);
  };

  const handlePaymentComplete = async () => {
    if (!selectedAssignment || !user || !user._id || !paymentAgreement || !userUpiId) {
      alert("Please agree to the payment terms and provide the UPI ID before proceeding");
      return;
    }
    setIsProcessing(selectedAssignment.id);

    if(prints.some(print => print._id === selectedAssignment.id)) {
      setIsProcessing(null);
      setShowQR(false);
      setSelectedAssignment(null);
      setPaymentAgreement(false);
      setUserUpiId("");
      alert("Assignment already printed");
      return;
    }
    
    try {
      const response = await axios.post('/api/assignments/add', { 
        userId: user._id, 
        title: selectedAssignment.title, 
        pages: selectedAssignment.pages,
        upiId: userUpiId
      });
      
      if (response.status === 201) {
        const response2 = await axios.post('/api/users/addprint', { 
          userId: user._id, 
          title: selectedAssignment.title, 
          pages: selectedAssignment.pages, 
          assignmentId: selectedAssignment.id,
          upiId: userUpiId
        });
        
        if (response2.status === 201) {
          const createdAt = new Date().toISOString();
          const newPrint = { 
            _id: selectedAssignment.id, 
            title: selectedAssignment.title, 
            pages: selectedAssignment.pages, 
            assignmentId: selectedAssignment.id, 
            createdAt, 
            status: 'Pending' 
          };
          
          setPrints(prev => [...prev, newPrint]);
          const updatedUser = {
            ...user,
            print: [...user.print, newPrint]
          };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setAssignments(prev => prev.filter(a => a._id !== selectedAssignment.id));
        }
      }
    } catch (error) {
      console.error('Error adding assignment:', error);
    } finally {
      setIsProcessing(null);
      setShowQR(false);
      setSelectedAssignment(null);
      setPaymentAgreement(false);
      setUserUpiId("");
    }
  };

  const getFilteredAssignments = () => {
    if (!assignments || !prints) return [];
    
    return assignments.filter(assignment => {
      return !prints.some(print => print._id === assignment._id);
    });
  };

  const handleShowQuery = (query: string) => {
    setSelectedQuery(query);
    setShowQueryModal(true);
  };

  if (showQR) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75"
      >
        <div className={cn("bg-white p-8 rounded-lg shadow-lg w-96", darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900")}>
          <h2 className="text-xl font-semibold mb-4">Payment Required</h2>
          <p className="text-red-500 mb-2 text-[12px]">Note: if you don't pay the amount, we won't print your assignment ( every payment is checked )</p>
          <p className="mb-4">Amount to pay: ₹{selectedAssignment ? selectedAssignment.pages * 3 : 0}</p>
          {qrCodeUrl && (
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-4 mb-2">
                <img src={qrCodeUrl} alt="UPI QR Code" className="" />
                <span className="-ml-1 mr-2">or</span>
                <a href={upiUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-500 text-white px-4 py-2 rounded-md">Pay</a>
              </div>
              <p className="mb-6 text-black/60 text-[10px]">Use the QR code above or the pay button to complete your payment</p>
              <div className="flex flex-col space-y-4 w-full">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={paymentAgreement}
                    onChange={(e) => setPaymentAgreement(e.target.checked)}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm">
                    I agree that I have paid the amount and understand that my account may be blocked if payment is not received
                  </span>
                </label>
                <label className="flex flex-col space-y-2 w-full">
                  <span className="text-sm">UPI ID used for payment</span>
                  <input
                    type="text"
                    value={userUpiId}
                    onChange={(e) => setUserUpiId(e.target.value)}
                    className="form-input mt-1 block w-full px-2 py-1 rounded-md"
                    placeholder="Enter your UPI ID"
                  />
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setShowQR(false);
                      setPaymentAgreement(false);
                      setUserUpiId("");
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePaymentComplete}
                    disabled={!paymentAgreement || !userUpiId || isProcessing !== null}
                    className={`${!paymentAgreement || !userUpiId || isProcessing !== null ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500'} text-white px-4 py-2 rounded-md`}
                  >
                    Payment Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  if (location.pathname === '/dashboard/history') {
    fetchUserAssignments();
    return (
      <PageTransition>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold">Print History</h1>
            <p className="mt-1 text-sm">Here is the history of your prints.</p>
          </div>
          <div className={cn("bg-white shadow rounded-lg", darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900")}>
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium">Your Prints</h2>
            </div>
            <div className="border-t border-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <div className="space-y-4">
                  {historyPrints.length === 0 ? (
                    <p className="text-sm text-center">Your Print History is empty</p>
                  ) : (
                    historyPrints.map((historyPrint, index) => (
                      <React.Fragment key={historyPrint._id}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium">{user && historyPrint && historyPrint.title}</p>
                              <p className="text-sm">{user && historyPrint && historyPrint.pages} pages</p>
                              <p className={`text-sm ${user && historyPrint && historyPrint.status === 'Completed' ? 'text-green-500' : 'text-yellow-500'}`}>
                                Status: {user && historyPrint && historyPrint.status}
                              </p>
                            </div>
                          </div>
                          <div className="text-sm">{user && historyPrint && new Date(historyPrint.createdAt).toLocaleString()}</div>
                        </div>
                        {index < historyPrints.length - 1 && <hr className="border-t border-gray-200 my-2" />}
                      </React.Fragment>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <p className="mt-1 text-sm">Welcome back! Here's an overview of your printing activities.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-8 w-8" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">{user?.username}</p>
              <p className="text-xs">{user?.rollnumber}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className={cn("bg-white overflow-hidden shadow rounded-lg", darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900")}>
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium truncate">Pending Assignments</dt>
                    <dd className="text-lg font-semibold">{getFilteredAssignments().length || "-"}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className={cn("bg-white overflow-hidden shadow rounded-lg", darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900")}>
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Printer className="h-6 w-6" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium truncate">Completed Assignments</dt>
                    <dd className="text-lg font-semibold">{prints.length || "-"}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={cn("bg-white shadow rounded-lg", darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900")}>
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium">Admin Assignments</h2>
          </div>
          <div className="border-t border-gray-200">
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-4">
                {getFilteredAssignments().length === 0 ? (
                  <p className="text-sm text-center">No admin assignments at this moment</p>
                ) : (
                  getFilteredAssignments().map((assignment, index) => (
                    <React.Fragment key={assignment._id}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium truncate sm:bold sm:whitespace-normal">{assignment.title}</p>
                            <p className="text-sm">{assignment.pages} pages</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-sm underline">{window.innerWidth < 460  ? new Date(assignment.createdAt).toLocaleString().split(',')[0] : new Date(assignment.createdAt).toLocaleString()}</div>
                          <button
                            onClick={() => handlePrintAssignment(assignment._id, assignment.title, assignment.pages)}
                            disabled={isProcessing !== null}
                            className={`${isProcessing !== null ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500'} text-white px-2 py-1 rounded-md`}
                          >
                            Print
                          </button>
                          <button
                            onClick={() => handleShowQuery(assignment.query || "Questions are not available yet !!!")}
                            className="bg-yellow-500 text-white px-2 py-1 rounded-md flex items-center"
                          >
                            <MessageCircleQuestion className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      {index < getFilteredAssignments().length - 1 && <hr className="border-t border-gray-200 my-2" />}
                    </React.Fragment>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showQueryModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
          <div className={cn("bg-white p-8 rounded-lg shadow-lg w-[90%] max-w-3xl max-h-full overflow-y-auto", darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900")}>
            <h2 className="text-xl font-semibold mb-4">Assignment Questions</h2>
            <p className="mb-4">{selectedQuery}</p>
            <button
              onClick={() => setShowQueryModal(false)}
              className="bg-red-500 text-white px-4 py-2 rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
