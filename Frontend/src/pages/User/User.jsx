import  { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/context';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { PageTransition } from '@/components/animations/PageTransition';
import Papa from 'papaparse';
import { FiSearch, FiUser, FiBook, FiAward, FiBarChart2, FiSliders } from 'react-icons/fi';

export function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState('overall');
  const [chartType, setChartType] = useState('pie');
  const { mode: darkMode } = useOutletContext();

  const enrolNo = useMemo(() => user ? `07414812723` : null, [user]);

  const themes = useMemo(() => ({
    dark: {
      background: "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-900 via-black to-blue-900",
      text: "text-white",
      cardBg: "backdrop-blur-2xl bg-white/[0.02]",
      border: "border-white/[0.05]",
      gradientOverlay: "from-green-500/[0.05] via-transparent to-blue-500/[0.05]",
      accentGradient: "from-green-400 to-blue-400",
      iconBg: "from-green-500/20 to-green-500/10",
      progressBar1: "from-green-400 to-green-500",
      progressBar2: "from-blue-400 to-blue-500"
    },
    light: {
      background: "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-white to-purple-100",
      text: "text-gray-800",
      cardBg: "backdrop-blur-2xl bg-white/[0.7]",
      border: "border-gray-200",
      gradientOverlay: "from-blue-500/[0.05] via-transparent to-purple-500/[0.05]",
      accentGradient: "from-blue-500 to-purple-500",
      iconBg: "from-blue-500/20 to-purple-500/10",
      progressBar1: "from-blue-500 to-indigo-500",
      progressBar2: "from-purple-500 to-pink-500"
    }
  }), []);

  const currentTheme = useMemo(() => darkMode ? themes.dark : themes.light, [darkMode, themes]);

  const handleSearch = useCallback(async () => {
    if (!enrolNo) {
      alert('No enrolment number found for the user');
      return;
    }

    setLoading(true);
    try {
      const resultsResponse = await fetch('/Assets/results.csv');
      const resultsCsvText = await resultsResponse.text();
      const parsedResultsData = Papa.parse(resultsCsvText, { header: false });
      const filteredResults = parsedResultsData.data.filter((row) => row.includes(enrolNo));
      resultsResponse.body.cancel(); // Remove file from memory

      const subjectsResponse = await fetch('/Assets/subjects.csv');
      const subjectsCsvText = await subjectsResponse.text();
      const parsedSubjectsData = Papa.parse(subjectsCsvText, { header: false });
      const subjectMap = new Map(parsedSubjectsData.data.map((row) => [row[0], row[2]]));
      subjectsResponse.body.cancel(); // Remove file from memory

      const resultsWithPaperNames = filteredResults.map((row) => {
        const subCode = row[2];
        const paperName = subjectMap.get(subCode) || subCode;
        return [...row.slice(0, 2), paperName, ...row.slice(3)];
      });

      setResults(resultsWithPaperNames);

      const studentsResponse = await fetch('/Assets/students.csv');
      const studentsCsvText = await studentsResponse.text();
      const parsedStudentsData = Papa.parse(studentsCsvText, { header: false });
      const filteredStudentData = parsedStudentsData.data.filter((row) => row.includes(enrolNo));
      studentsResponse.body.cancel(); // Remove file from memory

      const institutesResponse = await fetch('/Assets/institutes.csv');
      const institutesCsvText = await institutesResponse.text();
      const parsedInstitutesData = Papa.parse(institutesCsvText, { header: false });
      const instituteMap = new Map(parsedInstitutesData.data.map((row) => [row[0], row[1]]));
      institutesResponse.body.cancel(); // Remove file from memory

      const programmesResponse = await fetch('/Assets/programmes.csv');
      const programmesCsvText = await programmesResponse.text();
      const parsedProgrammesData = Papa.parse(programmesCsvText, { header: false });
      const programmeMap = new Map(parsedProgrammesData.data.map((row) => [row[0], row[1]]));
      programmesResponse.body.cancel(); // Remove file from memory

      const studentDataWithNames = filteredStudentData.map((row) => {
        const instCode = row[2];
        const progCode = row[4];
        const instName = instituteMap.get(instCode) || instCode;
        const progName = programmeMap.get(progCode) || progCode;
        return {
          name: row[0],
          randomNumber: row[1],
          instituteName: instName,
          batchYear: row[3],
          programme: progName,
          rollNo: row[5]
        };
      })[0];

      setStudentData(studentDataWithNames);

    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error fetching data.');
    } finally {
      setLoading(false);
    }
  }, [enrolNo]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      handleSearch();
    }
  }, [user, navigate, handleSearch]);

  if (!user) {
    return null;
  }

  const calculateCGPA = useCallback((results) => {
    const totalMarks = results.reduce((acc, result) => acc + parseFloat(result[6]), 0);
    const totalSubjects = results.length;
    return (totalMarks / totalSubjects / 10).toFixed(2);
  }, []);

  const calculateSemesterGPA = useCallback((results, semester) => {
    const semesterResults = results.filter(result => result[7] === semester);
    const totalMarks = semesterResults.reduce((acc, result) => acc + parseFloat(result[6]), 0);
    const totalSubjects = semesterResults.length;
    return (totalMarks / totalSubjects / 10).toFixed(2);
  }, []);

  const getPieData = useCallback((results) => {
    const filteredResults = selectedSemester === 'overall' 
      ? results 
      : results.filter(result => result[7] === selectedSemester);

    return filteredResults.map(result => ({
      id: result[2],
      label: result[2],
      value: parseFloat(result[6]),
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    }));
  }, [selectedSemester]);

  const getBarData = useCallback((results) => {
    const filteredResults = selectedSemester === 'overall'
      ? results
      : results.filter(result => result[7] === selectedSemester);

    return filteredResults.map(result => ({
      subject: result[2],
      marks: parseFloat(result[6]),
      marksColor: `hsl(${Math.random() * 360}, 70%, 50%)`
    }));
  }, [selectedSemester]);

  const getScatterData = useCallback((results) => {
    const filteredResults = selectedSemester === 'overall'
      ? results
      : results.filter(result => result[7] === selectedSemester);

    return [{
      id: 'Performance',
      data: filteredResults.map(result => ({
        x: parseFloat(result[4]),
        y: parseFloat(result[5]),
        size: parseFloat(result[6]) / 2,
        subject: result[2]
      }))
    }];
  }, [selectedSemester]);

  return (
    <PageTransition>
      <div 
        className={`space-y-6 p-6 ${currentTheme.background} ${currentTheme.text} min-h-screen relative overflow-hidden`}
      >
        {/* Enhanced background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute w-[500px] h-[500px] ${darkMode ? 'bg-green-500/10' : 'bg-blue-500/10'} rounded-full blur-[100px] -top-48 -left-48 mix-blend-overlay`}></div>
          <div className={`absolute w-[500px] h-[500px] ${darkMode ? 'bg-blue-500/10' : 'bg-purple-500/10'} rounded-full blur-[100px] -bottom-48 -right-48 mix-blend-overlay delay-1000`}></div>
          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.02] mix-blend-overlay"></div>
          <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${darkMode ? 'via-green-500/20' : 'via-blue-500/20'} to-transparent`}></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div
              className={`${currentTheme.cardBg} p-8 rounded-3xl border ${currentTheme.border} shadow-2xl relative overflow-hidden group`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${currentTheme.gradientOverlay} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              <h1 className={`text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.accentGradient} tracking-tight [text-shadow:0_4px_8px_rgba(0,0,0,0.2)]`}>
                Dashboard
              </h1>
              <p className="mt-3 text-white/80 text-xl font-light tracking-wide">Welcome back! Here's an overview of your performance.</p>
            </div>
          </div>

          <div 
            className={`${currentTheme.cardBg} rounded-3xl p-10 border ${currentTheme.border} shadow-2xl mt-8 relative overflow-hidden group`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.gradientOverlay}`}></div>
            {loading ? (
              <div 
                className="flex justify-center items-center h-40"
              >
                <div className={`w-16 h-16 border-4 ${darkMode ? 'border-green-400' : 'border-blue-400'} border-t-transparent rounded-full animate-spin shadow-lg`}></div>
              </div>
            ) : results.length > 0 && studentData ? (
              <div 
                className="space-y-10"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div 
                    className={`${currentTheme.cardBg} p-8 rounded-3xl border ${currentTheme.border} shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden group`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.gradientOverlay} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    <div className="flex items-center space-x-6">
                      <div className={`p-4 bg-gradient-to-br ${currentTheme.iconBg} rounded-2xl backdrop-blur-xl`}>
                        <FiUser className={`text-4xl ${darkMode ? 'text-green-400' : 'text-blue-500'}`} />
                      </div>
                      <div>
                        <h3 className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.accentGradient}`}>{studentData.name}</h3>
                        <p className={`${currentTheme.text}/80 text-lg font-light`}>{studentData.rollNo}</p>
                      </div>
                    </div>
                    <div className="mt-6 space-y-3">
                      <p className="flex items-center space-x-3">
                        <FiBook className={darkMode ? 'text-green-400' : 'text-blue-500'} />
                        <span className={`${currentTheme.text}/80 font-light`}>{studentData.instituteName}</span>
                      </p>
                      <p className="flex items-center space-x-3">
                        <FiBarChart2 className={darkMode ? 'text-blue-400' : 'text-purple-500'} />
                        <span className={`${currentTheme.text}/80 font-light`}>{studentData.programme} | Batch {studentData.batchYear}</span>
                      </p>
                    </div>
                  </div>

                  <div 
                    className={`${currentTheme.cardBg} p-8 rounded-3xl border ${currentTheme.border} shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden group`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.gradientOverlay} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    <div className="flex flex-col space-y-6">
                      <div className="flex items-center space-x-6">
                        <div className={`p-4 bg-gradient-to-br ${currentTheme.iconBg} rounded-2xl backdrop-blur-xl`}>
                          <FiAward className={`text-4xl ${darkMode ? 'text-blue-400' : 'text-purple-500'}`} />
                        </div>
                        <div>
                          <h3 className={`text-2xl font-bold  bg-clip-text bg-gradient-to-r ${darkMode ? 'text-green-400' : 'text-blue-500'}`}>CGPA</h3>
                          <p className={`text-4xl font-black mt-2 text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.accentGradient}`}>
                            {calculateCGPA(results)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className={`text-sm ${currentTheme.text}/80 mb-4 font-light`}>Semester-wise GPA:</p>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className={`${currentTheme.text}/80 font-light`}>Semester 1</span>
                              <span className={currentTheme.text}>{calculateSemesterGPA(results, '1')}</span>
                            </div>
                            <div className={`w-full ${currentTheme.cardBg} rounded-full h-2 backdrop-blur-xl`}>
                              <div 
                                className={`bg-gradient-to-r ${currentTheme.progressBar1} h-2 rounded-full shadow-lg`}
                                style={{ width: `${(calculateSemesterGPA(results, '1') / 10) * 100}%` }}
                              ></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className={`${currentTheme.text}/80 font-light`}>Semester 2</span>
                              <span className={currentTheme.text}>{calculateSemesterGPA(results, '2')}</span>
                            </div>
                            <div className={`w-full ${currentTheme.cardBg} rounded-full h-2 backdrop-blur-xl`}>
                              <div 
                                className={`bg-gradient-to-r ${currentTheme.progressBar2} h-2 rounded-full shadow-lg`}
                                style={{ width: `${(calculateSemesterGPA(results, '2') / 10) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-10">
                  <div>
                    <h3 className={`text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.accentGradient}`}>Semester 1 Subjects</h3>
                    <div className="flex overflow-x-auto space-x-6 pb-4 h-fit relative auto-scroll scrollbar-hide">
                      {results.filter(result => result[7] === '1').map((result, index) => (
                        <div
                          key={index}
                          className={`${currentTheme.cardBg} p-8 rounded-3xl border ${currentTheme.border} min-w-[350px] shadow-xl transition-all duration-300 relative overflow-hidden group`}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.gradientOverlay} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className={`text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.accentGradient}`}>{result[2]}</h4>
                              <p className={`${currentTheme.text}/60 mt-1 font-light`}>Semester {result[7]}</p>
                            </div>
                            <div className="text-right">
                              <p className={`text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.accentGradient}`}>
                                {result[6]}
                              </p>
                              <p className={`text-sm ${currentTheme.text}/60 mt-1 font-light`}>Total Marks</p>
                            </div>
                          </div>
                          <div className="mt-8 grid grid-cols-2 gap-6">
                            <div className={`${darkMode ? 'bg-black/0' : 'bg-black/10'} p-4 rounded-2xl backdrop-blur-xl`}>
                              <p className={`text-sm ${currentTheme.text}/60 font-light`}>Internal</p>
                              <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-green-400' : 'text-blue-500'}`}>{result[4]}</p>
                            </div>
                            <div className={`${darkMode ? 'bg-black/0' : 'bg-black/10'} p-4 rounded-2xl backdrop-blur-xl`}>
                              <p className={`text-sm ${currentTheme.text}/60 font-light`}>External</p>
                              <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-blue-400' : 'text-purple-500'}`}>{result[5]}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className={`text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.accentGradient}`}>Semester 2 Subjects</h3>
                    <div className="flex overflow-x-auto space-x-6 pb-4 auto-scroll scrollbar-hide">
                      {results.filter(result => result[7] === '2').map((result, index) => (
                        <div
                          key={index}
                          className={`${currentTheme.cardBg} p-8 rounded-3xl border ${currentTheme.border} min-w-[350px] shadow-xl  transition-all duration-300 relative overflow-hidden group`}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.gradientOverlay} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className={`text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.accentGradient}`}>{result[2]}</h4>
                              <p className={`${currentTheme.text}/60 mt-1 font-light`}>Semester {result[7]}</p>
                            </div>
                            <div className="text-right">
                              <p className={`text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.accentGradient}`}>
                                {result[6]}
                              </p>
                              <p className={`text-sm ${currentTheme.text}/60 mt-1 font-light`}>Total Marks</p>
                            </div>
                          </div>
                          <div className="mt-8 grid grid-cols-2 gap-6">
                            <div className={`${darkMode ? 'bg-black/0' : 'bg-black/10'} p-4 rounded-2xl backdrop-blur-xl`}>
                              <p className={`text-sm ${currentTheme.text}/60 font-light`}>Internal</p>
                              <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-green-400' : 'text-blue-500'}`}>{result[4]}</p>
                            </div>
                            <div className={`${darkMode ? 'bg-black/0' : 'bg-black/10'} p-4 rounded-2xl backdrop-blur-xl`}>
                              <p className={`text-sm ${currentTheme.text}/60 font-light`}>External</p>
                              <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-blue-400' : 'text-purple-500'}`}>{result[5]}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p 
                className={`text-center ${currentTheme.text}/80 text-lg font-light`}
              >
                No results found for the given enrolment number.
              </p>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}