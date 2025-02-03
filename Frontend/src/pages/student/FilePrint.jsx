import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Printer, Upload, CreditCard } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context';
import { useNavigate, useOutletContext } from 'react-router-dom';
import QRCode from 'qrcode';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/animations/PageTransition';
import { cn } from '@/lib/utils';

export function FilePrint() {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState(0);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState(''); // Added message state
  const [showQR, setShowQR] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [upiUrl, setUpiUrl] = useState('');
  const [paymentAgreement, setPaymentAgreement] = useState(false);
  const [userUpiId, setUserUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [customPrints, setCustomPrints] = useState([]);
  const [fileUrl, setFileUrl] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { mode: darkMode } = useOutletContext();

  const upiId = "aryan.chauhan@superyes";
  const userName = "AryanChauhan";
  const HANDLING_CHARGES = 5;

  const themes = useMemo(() => ({
    dark: {
      background: "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-900 via-black to-blue-900",
      text: "text-white",
      cardBg: "backdrop-blur-2xl bg-white/[0.02]",
      border: "border-white/[0.05]",
      gradientOverlay: "from-green-500/[0.05] via-transparent to-blue-500/[0.05]",
      accentGradient: "from-green-400 to-blue-400",
      iconBg: "from-green-500/20 to-green-500/10",
      progressBar: "from-green-400 to-blue-400"
    },
    light: {
      background: "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-white to-purple-100",
      text: "text-gray-800", 
      cardBg: "backdrop-blur-2xl bg-white/[0.7]",
      border: "border-gray-200",
      gradientOverlay: "from-blue-500/[0.05] via-transparent to-purple-500/[0.05]",
      accentGradient: "from-blue-500 to-purple-500",
      iconBg: "from-blue-500/20 to-purple-500/10",
      progressBar: "from-blue-400 to-purple-400"
    }
  }), []);

  const currentTheme = useMemo(() => darkMode ? themes.dark : themes.light, [darkMode, themes]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCustomPrints();
  }, [user, navigate]);

  const calculatePdfPages = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function(event) {
        try {
          const typedarray = new Uint8Array(event.target.result);
          
          let pdf = '';
          const chunkSize = 8192;
          for(let i = 0; i < typedarray.length; i += chunkSize) {
            pdf += String.fromCharCode.apply(null, 
              typedarray.subarray(i, Math.min(i + chunkSize, typedarray.length))
            );
          }
          
          const patterns = [
            /\/N\s+(\d+)/,
            /\/Count\s+(\d+)/,
            /Pages.*?(\d+)/,
            /Type\s*\/Pages[^>]*?Count\s+(\d+)/
          ];
          
          for (const regex of patterns) {
            const match = regex.exec(pdf);
            if (match && match[1]) {
              const pageCount = parseInt(match[1]);
              if (pageCount > 0) {
                resolve(pageCount);
                return;
              }
            }
          }
          
          const pageMatches = pdf.match(/\/Type\s*\/Page[^s]/g);
          if (pageMatches) {
            resolve(pageMatches.length);
            return;
          }
          
          reject(new Error('Could not determine page count'));
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const uploadPdfToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "chat-app");

    try {
      const response = await axios.post("https://api.cloudinary.com/v1_1/ddtkuyiwb/raw/upload", formData);

      if (!response.data?.secure_url) {
        throw new Error('Upload failed - no secure URL returned');
      }

      console.log("Uploaded PDF URL:", response.data.secure_url);
      return response.data.secure_url;
    } catch (error) {
      console.error("Upload error:", error);
      throw new Error('Failed to upload file to Cloudinary');
    }
  };

  const fetchCustomPrints = async () => {
    if (!user?._id) {
      console.error('No user ID available');
      return;
    }

    try {
      const response = await axios.get(`/api/customprint/${user._id}`);
      if (!response?.data) {
        throw new Error('No data received from API');
      }

      const prints = Array.isArray(response.data) ? response.data : [];
      setCustomPrints(prints);
    } catch (error) {
      console.error('Error fetching custom prints:', error);
      setCustomPrints([]);
      throw new Error('Failed to fetch custom prints');
    }
  };

  const generateQRCode = async () => {
    const printingCost = pages * 2;
    const totalAmount = printingCost + HANDLING_CHARGES;
    const upiUrl = `upi://pay?pa=${upiId}&pn=${userName}&am=${totalAmount}&cu=INR`;
    setUpiUrl(upiUrl);

    try {
      const qrCode = await QRCode.toDataURL(upiUrl);
      setQrCodeUrl(qrCode);
    } catch (error) {
      console.error("Failed to generate QR code:", error);
      alert("Error generating QR code.");
    }
  };

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    console.log(user);
    if (!file || !title) {
      alert('Please fill all fields');
      return;
    }

    try {
      const uploadedFileUrl = await uploadPdfToCloudinary(file);
      setFileUrl(uploadedFileUrl);
      await generateQRCode();
      setShowQR(true);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    }
  };

  const handlePaymentComplete = async () => {
    if (!paymentAgreement || !userUpiId) {
      alert("Please agree to the payment terms and provide the UPI ID");
      return;
    }

    setIsProcessing(true);

    try {
      await axios.post('/api/customprint/add', {
        fileUrl,
        title,
        pages,
        rollnumber : user.rollnumber,
        Phone : user.phone,
        userId: user._id,
        username: user.username,
        upiId: userUpiId,
        message

      });
      

      setShowQR(false);
      setFile(null);
      setPages(0);
      setTitle('');
      setMessage('');
      setPaymentAgreement(false);
      setUserUpiId('');
      setFileUrl('');
      fetchCustomPrints();

    } catch (error) {
      console.error('Error submitting print:', error);
      alert('Error submitting print request');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PageTransition>
      <div className={`space-y-6 p-6 ${currentTheme.background} ${currentTheme.text} rounded-3xl relative overflow-hidden`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute w-[500px] h-[500px] ${darkMode ? 'bg-green-500/10' : 'bg-blue-500/10'} rounded-full blur-[100px] -top-48 -left-48 mix-blend-overlay`}></div>
          <div className={`absolute w-[500px] h-[500px] ${darkMode ? 'bg-blue-500/10' : 'bg-purple-500/10'} rounded-full blur-[100px] -bottom-48 -right-48 mix-blend-overlay`}></div>
          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.02] mix-blend-overlay"></div>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={cn("p-6 rounded-3xl shadow-2xl", currentTheme.cardBg, currentTheme.text, currentTheme.border)}>
            <div className="flex items-center space-x-4 mb-6">
              <div className={`p-3 bg-gradient-to-br ${currentTheme.iconBg} rounded-2xl`}>
                <Upload className={`h-6 w-6 ${darkMode ? 'text-green-400' : 'text-blue-500'}`} />
              </div>
              <h2 className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${currentTheme.accentGradient}`}>
                Custom Print Request
              </h2>
            </div>

            <form onSubmit={handleFileSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 font-medium">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full p-3 rounded-xl border ${currentTheme.border} bg-white/90 text-black backdrop-blur-xl`}
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Message (Optional - max 250 characters)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 250))}
                  maxLength={250}
                  className={`w-full p-3 rounded-xl border ${currentTheme.border} bg-white/90 text-black backdrop-blur-xl`}
                  rows={3}
                  placeholder="Add any special instructions or notes here..."
                />
                <div className="text-sm text-right mt-1">
                  {message.length}/250 characters
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium">File</label>
                <div className={`w-full p-4 rounded-xl border-2 border-dashed ${currentTheme.border} text-center cursor-pointer hover:border-opacity-50 transition-all duration-300`}>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={async (e) => {
                      const selectedFile = e.target.files[0];
                      if (selectedFile) {
                        try {
                          const pageCount = await calculatePdfPages(selectedFile);
                          setPages(pageCount);
                          setFile(selectedFile);
                        } catch (error) {
                          console.error('Error calculating pages:', error);
                          alert('Error calculating PDF pages');
                        }
                      }
                    }}
                    className="hidden"
                    id="file-upload"
                    required
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <FileText className="h-8 w-8 mx-auto mb-2" />
                    <p>Drop your PDF here or click to browse</p>
                  </label>
                </div>
              </div>

              {pages > 0 && (
                <div className={`p-4 rounded-xl ${currentTheme.cardBg} space-y-3`}>
                  <div className="flex justify-between items-center">
                    <span>Number of Pages:</span>
                    <span className="font-semibold">{pages}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Printing Cost (₹2/page):</span>
                    <span className="font-semibold">₹{pages * 2}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Handling Charges:</span>
                    <span className="font-semibold">₹{HANDLING_CHARGES}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className={`text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.accentGradient}`}>
                      ₹{(pages * 2) + HANDLING_CHARGES}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r ${currentTheme.accentGradient} hover:opacity-90 transition-opacity duration-300 flex items-center justify-center space-x-2`}
                disabled={isProcessing}
              >
                <Printer className="h-5 w-5" />
                <span>Submit Print Request</span>
              </button>
            </form>
          </div>

          <div className={cn("p-6 rounded-3xl shadow-2xl h-[85vh] overflow-y-auto", currentTheme.cardBg, currentTheme.text, currentTheme.border)}>
            <div className="flex items-center space-x-4 mb-6">
              <div className={`p-3 bg-gradient-to-br ${currentTheme.iconBg} rounded-2xl`}>
                <FileText className={`h-6 w-6 ${darkMode ? 'text-green-400' : 'text-blue-500'}`} />
              </div>
              <h2 className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${currentTheme.accentGradient}`}>
                Print History
              </h2>
            </div>

            <div className="space-y-4">
              {customPrints.length === 0 ? (
                <div className={`p-6 rounded-xl ${currentTheme.cardBg} text-center`}>
                  <p className="text-gray-400">No print history available</p>
                </div>
              ) : (
                customPrints.map((print) => (
                  <motion.div
                    key={print._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl ${currentTheme.cardBg} border ${currentTheme.border} hover:border-opacity-50 transition-all duration-300`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className={`h-5 w-5 ${darkMode ? 'text-green-400' : 'text-blue-500'}`} />
                        <div>
                          <h3 className="font-semibold">{print.title}</h3>
                          <p className="text-sm text-gray-400">{print.pages} pages</p>
                          {print.message && (
                            <p className="text-sm text-gray-400 mt-1">{print.message}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          print.status === 'Completed' 
                            ? 'bg-green-500/20 text-green-500' 
                            : 'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {print.status}
                        </span>
                        <p className="text-sm text-gray-400 mt-1">
                          {new Date(print.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 flex items-center justify-center bg-black/75 backdrop-blur-sm z-50"
          >
            <div className={cn("p-8 rounded-3xl shadow-2xl w-96", currentTheme.cardBg, currentTheme.text)}>
              <div className="flex items-center space-x-4 mb-6">
                <div className={`p-3 bg-gradient-to-br ${currentTheme.iconBg} rounded-2xl`}>
                  <CreditCard className={`h-6 w-6 ${darkMode ? 'text-green-400' : 'text-blue-500'}`} />
                </div>
                <h2 className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${currentTheme.accentGradient}`}>
                  Payment Required
                </h2>
              </div>

              <p className="text-red-500 text-sm mb-4">Note: if you don't pay the amount, we won't print your file</p>

              <div className={`p-4 rounded-xl ${currentTheme.cardBg} space-y-3 mb-6`}>
                <div className="flex justify-between items-center">
                  <span>Printing Cost (₹2/page):</span>
                  <span className="font-semibold">₹{pages * 2}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Handling Charges:</span>
                  <span className="font-semibold">₹{HANDLING_CHARGES}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className={`text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.accentGradient}`}>
                    ₹{(pages * 2) + HANDLING_CHARGES}
                  </span>
                </div>
              </div>

              {qrCodeUrl && (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <img src={qrCodeUrl} alt="UPI QR Code" className="w-48 h-48" />
                  </div>

                  <a 
                    href={upiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full py-3 rounded-xl text-white text-center font-semibold bg-gradient-to-r ${currentTheme.accentGradient} hover:opacity-90 transition-opacity duration-300`}
                  >
                    Pay Now
                  </a>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={paymentAgreement}
                      onChange={(e) => setPaymentAgreement(e.target.checked)}
                      className="form-checkbox h-4 w-4"
                    />
                    <span className="text-sm">I confirm I have made the payment</span>
                  </label>

                  <input
                    type="text"
                    value={userUpiId}
                    onChange={(e) => setUserUpiId(e.target.value)}
                    placeholder="Enter your UPI ID used for payment"
                    className={`w-full p-3 rounded-xl border ${currentTheme.border} bg-white/90 text-black`}
                  />

                  <div className="flex space-x-4">
                    <button
                      onClick={() => setShowQR(false)}
                      className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePaymentComplete}
                      disabled={!paymentAgreement || !userUpiId || isProcessing}
                      className={`flex-1 py-3 rounded-xl text-white font-semibold bg-gradient-to-r ${currentTheme.accentGradient} hover:opacity-90 transition-opacity duration-300 disabled:opacity-50`}
                    >
                      {isProcessing ? 'Processing...' : 'Confirm'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}

export default FilePrint;