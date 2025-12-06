import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, School, FileText, LayoutDashboard, 
  Plus, Save, Trash2, Edit2, Download, Printer, Search,
  Menu, X, ChevronRight, GraduationCap, Calculator, XCircle, LogOut, Lock, Mail, User
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, updateDoc, 
  deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp 
} from 'firebase/firestore';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider, // Import Provider Google
  signInWithPopup     // Import Popup Login
} from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

// --- KONEKSI KE FIREBASE PRIBADI BAPAK ---
const firebaseConfig = {
  apiKey: "AIzaSyC2fMCm9mLc_I0qsCctOwlw8Rn9wyHoWSc",
  authDomain: "nilai-siswa-1e92c.firebaseapp.com",
  projectId: "nilai-siswa-1e92c",
  storageBucket: "nilai-siswa-1e92c.firebasestorage.app",
  messagingSenderId: "247329613812",
  appId: "1:247329613812:web:e892da30290dc009787ba1",
  measurementId: "G-C1WCENHJLY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics;
try { analytics = getAnalytics(app); } catch (e) { console.log("Analytics not supported"); }

const auth = getAuth(app);
const db = getFirestore(app);

// --- HELPER FUNCTIONS ---
const calculateAverage = (value) => {
    if (!value) return 0;
    if (Array.isArray(value)) {
        if (value.length === 0) return 0;
        const sum = value.reduce((a, b) => a + (parseFloat(b) || 0), 0);
        return (sum / value.length).toFixed(1);
    }
    return parseFloat(value) || 0;
};

// --- LOGIN COMPONENT (UPDATED WITH GOOGLE) ---
const LoginScreen = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fungsi Login Google
  const handleGoogleLogin = async () => {
      setError('');
      setLoading(true);
      const provider = new GoogleAuthProvider();
      try {
          await signInWithPopup(auth, provider);
          // Berhasil login, onAuthStateChanged di App akan menangani sisanya
      } catch (err) {
          console.error("Google Login Error:", err);
          
          // PENANGANAN ERROR SPESIFIK AGAR USER TAHU SOLUSINYA
          if (err.code === 'auth/unauthorized-domain') {
            setError(`⚠️ KEAMANAN: Domain ini belum diizinkan. 
            Buka Firebase Console -> Authentication -> Settings -> Authorized Domains.
            Lalu tambahkan domain ini: ${window.location.hostname}`);
          } else if (err.code === 'auth/popup-closed-by-user') {
            setError("Login dibatalkan.");
          } else if (err.code === 'auth/operation-not-allowed') {
            setError("Provider Google belum diaktifkan di Firebase Console.");
          } else {
            setError(`Gagal login: ${err.message}`);
          }
      } finally {
          setLoading(false);
      }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="bg-blue-600 text-white p-3 rounded-xl inline-flex mb-4">
            <GraduationCap size={40} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">SINILAI - PJOK</h1>
          <p className="text-slate-500">Sistem Rekap Nilai Digital</p>
        </div>

        <div className="space-y-4">
            {/* TOMBOL GOOGLE UTAMA */}
            <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white border border-slate-300 text-slate-700 py-3 rounded-lg font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Masuk dengan Google
            </button>

            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-xs">ATAU EMAIL</span>
                <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                    type="email" required 
                    className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="guru@sekolah.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                    type="password" required 
                    className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="******"
                    value={password} onChange={e => setPassword(e.target.value)}
                />
                </div>
            </div>

            {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg whitespace-pre-line">{error}</div>}

            <button 
                type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
                {loading ? 'Memproses...' : (isRegistering ? 'Daftar Akun Baru' : 'Masuk dengan Email')}
            </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600">
            {isRegistering ? 'Sudah punya akun?' : 'Belum punya akun?'}
            <button 
                onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                className="ml-2 text-blue-600 font-bold hover:underline"
            >
                {isRegistering ? 'Login disini' : 'Daftar sekarang'}
            </button>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTS ---

const Dashboard = ({ user, students, subjects, grades }) => {
  const totalSiswa = students.length;
  const totalMapel = subjects.length;
  const totalNilai = grades.length;
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Halo, Pak Guru!</h1>
        <p className="opacity-90">Anda login sebagai: <b>{user?.email}</b></p>
        <div className="mt-2 text-xs bg-white/20 inline-block px-2 py-1 rounded">
            🔒 Data Anda Terenkripsi & Privat
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Users size={24} /></div>
          <div><p className="text-sm text-slate-500">Total Siswa</p><h3 className="text-2xl font-bold text-slate-800">{totalSiswa}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg"><BookOpen size={24} /></div>
          <div><p className="text-sm text-slate-500">Mata Pelajaran</p><h3 className="text-2xl font-bold text-slate-800">{totalMapel}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-lg"><FileText size={24} /></div>
          <div><p className="text-sm text-slate-500">Nilai Masuk</p><h3 className="text-2xl font-bold text-slate-800">{totalNilai}</h3></div>
        </div>
      </div>
    </div>
  );
};

const DataSiswa = ({ students, addStudent, deleteStudent }) => {
  const [formData, setFormData] = useState({ nama: '', nisn: '', kelas: '1A', gender: 'L' });
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    addStudent(formData);
    setFormData({ nama: '', nisn: '', kelas: '1A', gender: 'L' });
  };

  const filteredStudents = students.filter(s => 
    s.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.nisn.includes(searchTerm) ||
    s.kelas.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-lg mb-4 text-slate-800">Tambah Siswa Baru</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input type="text" placeholder="Nama Lengkap" required className="border p-2 rounded-lg outline-none md:col-span-2" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} />
          <input type="text" placeholder="NISN" required className="border p-2 rounded-lg outline-none" value={formData.nisn} onChange={e => setFormData({...formData, nisn: e.target.value})} />
          <select className="border p-2 rounded-lg outline-none" value={formData.kelas} onChange={e => setFormData({...formData, kelas: e.target.value})}>
            {['1A','1B','2A','2B','3A','3B','4A','4B','5A','5B','6A','6B'].map(k => <option key={k} value={k}>Kelas {k}</option>)}
          </select>
          <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 flex justify-center items-center gap-2"><Plus size={18} /> Tambah</button>
        </form>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800">Daftar Siswa ({filteredStudents.length})</h3>
            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input type="text" placeholder="Cari Siswa..." className="pl-10 pr-4 py-2 border rounded-lg text-sm outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
              <tr><th className="p-4">Nama Siswa</th><th className="p-4">NISN</th><th className="p-4">Kelas</th><th className="p-4 text-center">Aksi</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{s.nama}</td><td className="p-4 text-slate-500">{s.nisn}</td>
                  <td className="p-4"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">{s.kelas}</span></td>
                  <td className="p-4 text-center"><button onClick={() => deleteStudent(s.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"><Trash2 size={18} /></button></td>
                </tr>
              )) : (<tr><td colSpan="4" className="p-8 text-center text-slate-400">Belum ada data siswa</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const MataPelajaran = ({ subjects, addSubject, deleteSubject }) => {
  const [newMapel, setNewMapel] = useState('');
  const [kkm, setKkm] = useState(75);
  const handleSubmit = (e) => { e.preventDefault(); addSubject({ nama: newMapel, kkm: parseInt(kkm) }); setNewMapel(''); setKkm(75); };
  return (
    <div className="space-y-6">
       <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-lg mb-4 text-slate-800">Tambah Mata Pelajaran</h3>
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input type="text" placeholder="Nama Mapel" required className="flex-1 border p-2 rounded-lg outline-none" value={newMapel} onChange={e => setNewMapel(e.target.value)} />
           <div className="w-32"><input type="number" placeholder="KKM" required className="w-full border p-2 rounded-lg outline-none" value={kkm} onChange={e => setKkm(e.target.value)} /></div>
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium">Simpan</button>
        </form>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
            <tr><th className="p-4">Mata Pelajaran</th><th className="p-4">KKM</th><th className="p-4 text-right">Aksi</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {subjects.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50"><td className="p-4 font-medium text-slate-800">{s.nama}</td><td className="p-4"><span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">{s.kkm}</span></td><td className="p-4 text-right"><button onClick={() => deleteSubject(s.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full"><Trash2 size={18} /></button></td></tr>
            ))}
            {subjects.length === 0 && (<tr><td colSpan="3" className="p-6 text-center text-slate-400">Belum ada mata pelajaran</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ScoreDetailModal = ({ isOpen, onClose, title, scores, onSave }) => {
    const [localScores, setLocalScores] = useState([]);
    useEffect(() => {
        if (Array.isArray(scores)) { setLocalScores([...scores]); } else if (scores !== '' && scores !== undefined && scores !== null) { setLocalScores([scores]); } else { setLocalScores([]); }
    }, [scores, isOpen]);

    const addScore = () => setLocalScores([...localScores, '']);
    const updateScore = (idx, val) => { const newScores = [...localScores]; newScores[idx] = val; setLocalScores(newScores); };
    const removeScore = (idx) => { const newScores = localScores.filter((_, i) => i !== idx); setLocalScores(newScores); };

    if (!isOpen) return null;
    const average = calculateAverage(localScores);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-blue-600 p-4 flex justify-between items-center text-white"><h3 className="font-bold text-lg">{title}</h3><button onClick={onClose} className="hover:bg-blue-700 p-1 rounded"><X size={20}/></button></div>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4"><span className="text-slate-500 text-sm">Daftar Nilai Masuk</span><span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Rata-rata: {average}</span></div>
                    <div className="space-y-3">
                        {localScores.map((score, idx) => (
                            <div key={idx} className="flex gap-2 items-center"><span className="text-slate-400 w-6 text-sm font-mono">{idx + 1}.</span><input type="number" className="flex-1 border p-2 rounded outline-none" placeholder="0-100" value={score} onChange={(e) => updateScore(idx, e.target.value)} autoFocus={idx === localScores.length - 1}/><button onClick={() => removeScore(idx)} className="text-red-400 hover:text-red-600"><XCircle size={20}/></button></div>
                        ))}
                    </div>
                    {localScores.length === 0 && <p className="text-center text-slate-400 py-4 italic">Belum ada nilai diinput</p>}
                    <button onClick={addScore} className="mt-4 w-full py-2 border-2 border-dashed border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 flex justify-center items-center gap-2 font-medium"><Plus size={16}/> Tambah Nilai</button>
                </div>
                <div className="p-4 border-t bg-slate-50 flex justify-end gap-2"><button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg">Batal</button><button onClick={() => onSave(localScores)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold">Simpan Nilai</button></div>
            </div>
        </div>
    );
};

const InputNilai = ({ students, subjects, grades, saveGrade, deleteGrade, schoolProfile }) => {
  const [selectedKelas, setSelectedKelas] = useState('5A');
  const [selectedMapel, setSelectedMapel] = useState(subjects[0]?.id || '');
  const [editingGrade, setEditingGrade] = useState({});
  const [modalConfig, setModalConfig] = useState({ isOpen: false, studentId: null, type: '', currentScores: [] });

  useEffect(() => { if (!selectedMapel && subjects.length > 0) setSelectedMapel(subjects[0].id); }, [subjects]);

  const filteredStudents = students.filter(s => s.kelas === selectedKelas);
  const currentMapelData = subjects.find(s => s.id === selectedMapel);
  const kkm = currentMapelData?.kkm || 75;

  const getStudentGrade = (studentId) => {
    const dbGrade = grades.find(g => g.studentId === studentId && g.subjectId === selectedMapel);
    const localGrade = editingGrade[studentId] || {};
    return {
      harian: localGrade.harian !== undefined ? localGrade.harian : (dbGrade?.harian || []),
      tugas: localGrade.tugas !== undefined ? localGrade.tugas : (dbGrade?.tugas || []),
      uts: localGrade.uts !== undefined ? localGrade.uts : (dbGrade?.uts || ''),
      uas: localGrade.uas !== undefined ? localGrade.uas : (dbGrade?.uas || ''),
      dbId: dbGrade?.id
    };
  };

  const handleSimpleChange = (studentId, field, value) => { setEditingGrade(prev => ({ ...prev, [studentId]: { ...prev[studentId], [field]: value } })); };
  const openDetailModal = (studentId, type, currentScores, studentName) => { setModalConfig({ isOpen: true, studentId, type, currentScores, studentName }); };
  const handleModalSave = (newScores) => {
      const cleanedScores = newScores.filter(s => s !== '');
      setEditingGrade(prev => ({ ...prev, [modalConfig.studentId]: { ...prev[modalConfig.studentId], [modalConfig.type]: cleanedScores } }));
      setModalConfig({ ...modalConfig, isOpen: false });
  };

  const handleSaveToDB = async (studentId) => {
    const gradeData = getStudentGrade(studentId);
    await saveGrade({ studentId, subjectId: selectedMapel, harian: gradeData.harian, tugas: gradeData.tugas, uts: gradeData.uts, uas: gradeData.uas, kelas: selectedKelas }, gradeData.dbId);
    const newEditing = {...editingGrade}; delete newEditing[studentId]; setEditingGrade(newEditing);
    alert("Nilai berhasil disimpan!");
  };

  const exportToCSV = () => {
    if (filteredStudents.length === 0) return alert("Tidak ada data siswa untuk diexport");
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `Rekap Nilai ${currentMapelData?.nama} - Kelas ${selectedKelas}\nNo,Nama Siswa,NISN,Rata2 Harian,Rata2 Tugas,UTS,UAS,Nilai Akhir,Keterangan\n`;
    filteredStudents.forEach((student, index) => {
      const g = getStudentGrade(student.id);
      const avgHarian = calculateAverage(g.harian); const avgTugas = calculateAverage(g.tugas);
      const final = ((parseFloat(avgHarian) + parseFloat(avgTugas) + parseFloat(g.uts||0) + parseFloat(g.uas||0))/4).toFixed(2);
      const ket = final >= kkm ? "Tuntas" : "Belum Tuntas";
      csvContent += `${index + 1},"${student.nama}",'${student.nisn},${avgHarian},${avgTugas},${g.uts},${g.uas},${final},${ket}\n`;
    });
    const link = document.createElement("a"); link.setAttribute("href", encodeURI(csvContent)); link.setAttribute("download", `Rekap_${selectedKelas}_${currentMapelData?.nama}.csv`); document.body.appendChild(link); link.click();
  };

  return (
    <div className="space-y-6">
      <ScoreDetailModal isOpen={modalConfig.isOpen} onClose={() => setModalConfig({...modalConfig, isOpen: false})} title={`Input ${modalConfig.type === 'harian' ? 'Nilai Harian' : 'Nilai Tugas'} - ${modalConfig.studentName}`} scores={modalConfig.currentScores} onSave={handleModalSave} />
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-end md:items-center no-print">
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-500 uppercase">Kelas</label><select value={selectedKelas} onChange={e => setSelectedKelas(e.target.value)} className="border p-2 rounded-lg bg-slate-50 min-w-[120px] outline-none">{['1A','1B','2A','2B','3A','3B','4A','4B','5A','5B','6A','6B'].map(k => <option key={k} value={k}>{k}</option>)}</select></div>
          <div className="flex flex-col gap-1"><label className="text-xs font-bold text-slate-500 uppercase">Mapel</label><select value={selectedMapel} onChange={e => setSelectedMapel(e.target.value)} className="border p-2 rounded-lg bg-slate-50 min-w-[150px] outline-none">{subjects.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}</select></div>
        </div>
        <div className="flex gap-2">
           <button onClick={exportToCSV} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"><Download size={18} /> Excel</button>
           <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900"><Printer size={18} /> PDF</button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden print-area">
        <div className="hidden print-header p-8 text-center border-b-2 border-black mb-4">
            <h1 className="text-2xl font-bold uppercase">{schoolProfile.nama}</h1><p>{schoolProfile.alamat}</p><hr className="my-4 border-black"/><h2 className="text-xl font-bold underline mb-4">REKAP NILAI SISWA</h2>
            <div className="flex justify-between text-sm mb-4"><p>Kelas: {selectedKelas}</p><p>Mapel: {currentMapelData?.nama}</p><p>TA: {new Date().getFullYear()}/{new Date().getFullYear()+1}</p></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b">
              <tr><th className="p-4 w-10">No</th><th className="p-4 min-w-[200px]">Nama Siswa</th><th className="p-4 w-32 text-center">Harian</th><th className="p-4 w-32 text-center">Tugas</th><th className="p-4 w-24 text-center">UTS</th><th className="p-4 w-24 text-center">UAS</th><th className="p-4 w-24 text-center">Akhir</th><th className="p-4 w-24 text-center no-print">Aksi</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? filteredStudents.map((s, idx) => {
                const g = getStudentGrade(s.id);
                const avgHarian = calculateAverage(g.harian); const avgTugas = calculateAverage(g.tugas);
                const final = ((parseFloat(avgHarian) + parseFloat(avgTugas) + parseFloat(g.uts||0) + parseFloat(g.uas||0))/4).toFixed(2);
                const isPassed = parseFloat(final) >= kkm; const unsaved = editingGrade[s.id];
                return (
                  <tr key={s.id} className={`transition-colors ${unsaved ? 'bg-yellow-50' : 'hover:bg-slate-50'}`}>
                    <td className="p-4 text-center text-slate-500">{idx + 1}</td><td className="p-4"><div className="font-medium text-slate-800">{s.nama}</div><div className="text-xs text-slate-400">{s.nisn}</div></td>
                    <td className="p-4 text-center"><div onClick={() => openDetailModal(s.id, 'harian', g.harian, s.nama)} className="border rounded p-2 cursor-pointer hover:bg-blue-50 flex justify-between items-center group relative no-print-border"><span className="font-bold text-slate-700">{avgHarian}</span><Calculator size={14} className="text-blue-400 opacity-0 group-hover:opacity-100"/>{Array.isArray(g.harian) && g.harian.length > 1 && (<span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">{g.harian.length}</span>)}</div><span className="hidden print-only">{avgHarian}</span></td>
                    <td className="p-4 text-center"><div onClick={() => openDetailModal(s.id, 'tugas', g.tugas, s.nama)} className="border rounded p-2 cursor-pointer hover:bg-blue-50 flex justify-between items-center group relative no-print-border"><span className="font-bold text-slate-700">{avgTugas}</span><Calculator size={14} className="text-blue-400 opacity-0 group-hover:opacity-100"/>{Array.isArray(g.tugas) && g.tugas.length > 1 && (<span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">{g.tugas.length}</span>)}</div><span className="hidden print-only">{avgTugas}</span></td>
                    <td className="p-4 text-center"><input type="number" className="w-16 p-1 border rounded text-center outline-none no-print-border" value={g.uts} onChange={e => handleSimpleChange(s.id, 'uts', e.target.value)} placeholder="0"/><span className="hidden print-only">{g.uts || '-'}</span></td>
                    <td className="p-4 text-center"><input type="number" className="w-16 p-1 border rounded text-center outline-none no-print-border" value={g.uas} onChange={e => handleSimpleChange(s.id, 'uas', e.target.value)} placeholder="0"/><span className="hidden print-only">{g.uas || '-'}</span></td>
                    <td className="p-4 text-center"><span className={`font-bold px-2 py-1 rounded ${isPassed ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>{final}</span></td>
                    <td className="p-4 text-center no-print"><button onClick={() => handleSaveToDB(s.id)} className={`p-2 rounded-lg transition-colors ${unsaved ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md animate-pulse' : 'text-blue-600 bg-blue-50 hover:bg-blue-100'}`} title="Simpan Nilai"><Save size={18} /></button></td>
                  </tr>
                );
              }) : (<tr><td colSpan="8" className="p-8 text-center text-slate-400">Tidak ada siswa di kelas {selectedKelas}</td></tr>)}
            </tbody>
          </table>
        </div>
        <div className="hidden print-footer p-8 mt-8 flex justify-between">
           <div className="text-center"><p>Mengetahui,</p><p>Kepala Sekolah</p><br/><br/><br/><p className="font-bold underline">{schoolProfile.kepsek}</p><p>NIP. {schoolProfile.nip}</p></div>
           <div className="text-center"><p>{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p><p>Guru Mata Pelajaran</p><br/><br/><br/><p className="font-bold underline">Pak Guru PJOK</p><p>NIP. .......................</p></div>
        </div>
      </div>
    </div>
  );
};

const ProfilSekolah = ({ profile, saveProfile }) => {
    const [formData, setFormData] = useState(profile);
    useEffect(() => { setFormData(profile); }, [profile]);
    const handleSubmit = (e) => { e.preventDefault(); saveProfile(formData); alert("Disimpan!"); };
    return (
      <div className="max-w-2xl bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><School className="text-blue-600"/> Edit Profil Sekolah</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm text-slate-600 mb-1">Nama Sekolah</label><input type="text" value={formData.nama} onChange={e=>setFormData({...formData, nama:e.target.value})} className="w-full border p-2 rounded outline-none"/></div>
            <div><label className="block text-sm text-slate-600 mb-1">Alamat</label><textarea value={formData.alamat} onChange={e=>setFormData({...formData, alamat:e.target.value})} className="w-full border p-2 rounded outline-none"></textarea></div>
            <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-slate-600 mb-1">NPSN</label><input type="text" value={formData.npsn} onChange={e=>setFormData({...formData, npsn:e.target.value})} className="w-full border p-2 rounded outline-none"/></div>
                <div><label className="block text-sm text-slate-600 mb-1">Kode Pos</label><input type="text" value={formData.kodepos} onChange={e=>setFormData({...formData, kodepos:e.target.value})} className="w-full border p-2 rounded outline-none"/></div>
            </div>
            <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-slate-800 mb-4">Data Kepala Sekolah</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm text-slate-600 mb-1">Nama Kepsek</label><input type="text" value={formData.kepsek} onChange={e=>setFormData({...formData, kepsek:e.target.value})} className="w-full border p-2 rounded outline-none"/></div>
                    <div><label className="block text-sm text-slate-600 mb-1">NIP</label><input type="text" value={formData.nip} onChange={e=>setFormData({...formData, nip:e.target.value})} className="w-full border p-2 rounded outline-none"/></div>
                </div>
            </div>
            <div className="pt-4"><button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded w-full font-bold flex justify-center items-center gap-2"><Save size={18}/> Simpan Profil</button></div>
        </form>
      </div>
    );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [schoolProfile, setSchoolProfile] = useState({ nama: 'SDN Contoh', alamat: 'Jl. Contoh', npsn: '-', kodepos: '-', kepsek: '-', nip: '-' });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ISOLATED DATA FETCHING: Only fetch data for the LOGGED IN user
  useEffect(() => {
    if (!user) {
        setStudents([]); setSubjects([]); setGrades([]);
        return;
    }
    // Path: users/{uid}/students
    const studentsRef = collection(db, 'users', user.uid, 'students');
    const subjectsRef = collection(db, 'users', user.uid, 'subjects');
    const gradesRef = collection(db, 'users', user.uid, 'grades');
    const profileRef = collection(db, 'users', user.uid, 'schoolProfile');

    const unsubStudents = onSnapshot(query(studentsRef, orderBy('nama')), (snap) => setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubSubjects = onSnapshot(query(subjectsRef, orderBy('nama')), (snap) => setSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubGrades = onSnapshot(gradesRef, (snap) => setGrades(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubProfile = onSnapshot(profileRef, (snap) => { if(!snap.empty) setSchoolProfile(snap.docs[0].data()); });

    return () => { unsubStudents(); unsubSubjects(); unsubGrades(); unsubProfile(); };
  }, [user]);

  // ISOLATED DATA SAVING: Save to users/{uid}/...
  const addStudent = async (data) => user && await addDoc(collection(db, 'users', user.uid, 'students'), { ...data, createdAt: serverTimestamp() });
  const deleteStudent = async (id) => user && await deleteDoc(doc(db, 'users', user.uid, 'students', id));
  const addSubject = async (data) => user && await addDoc(collection(db, 'users', user.uid, 'subjects'), data);
  const deleteSubject = async (id) => user && await deleteDoc(doc(db, 'users', user.uid, 'subjects', id));
  const saveGrade = async (data, gradeId) => { 
      if(user) gradeId ? await updateDoc(doc(db, 'users', user.uid, 'grades', gradeId), data) : await addDoc(collection(db, 'users', user.uid, 'grades'), data); 
  };
  const saveProfile = async (data) => user && await addDoc(collection(db, 'users', user.uid, 'schoolProfile'), data);
  const handleLogout = async () => { await signOut(auth); };

  if (loading) return <div className="h-screen flex items-center justify-center text-blue-600">Memuat...</div>;
  if (!user) return <LoginScreen />;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard user={user} students={students} subjects={subjects} grades={grades} />;
      case 'siswa': return <DataSiswa students={students} addStudent={addStudent} deleteStudent={deleteStudent} />;
      case 'mapel': return <MataPelajaran subjects={subjects} addSubject={addSubject} deleteSubject={deleteSubject} />;
      case 'nilai': return <InputNilai students={students} subjects={subjects} grades={grades} saveGrade={saveGrade} schoolProfile={schoolProfile}/>;
      case 'sekolah': return <ProfilSekolah profile={schoolProfile} saveProfile={saveProfile} />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900">
      <style>{`@media print { .no-print { display: none !important; } .print-area { position: absolute; top: 0; left: 0; width: 100%; margin: 0; padding: 20px; background: white; border: none; } .print-header, .print-footer { display: block !important; } .print-only { display: inline !important; } input { border: none !important; text-align: center; } body { background: white; } }`}</style>
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shadow-xl z-10">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100"><div className="bg-blue-600 text-white p-2 rounded-lg"><GraduationCap size={24} /></div><div><h1 className="font-bold text-lg text-slate-800 tracking-tight">SINILAI</h1><p className="text-xs text-slate-500">Sistem Rekap PJOK</p></div></div>
        <nav className="flex-1 p-4 space-y-2">
            {[{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'sekolah', label: 'Profil Sekolah', icon: School }, { id: 'siswa', label: 'Data Siswa', icon: Users }, { id: 'mapel', label: 'Mata Pelajaran', icon: BookOpen }, { id: 'nilai', label: 'Input Nilai', icon: Edit2 }].map((item) => (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${activeTab === item.id ? 'bg-blue-50 text-blue-700 font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}><div className="flex items-center gap-3"><item.icon size={20} /><span>{item.label}</span></div>{activeTab === item.id && <ChevronRight size={16} />}</button>
            ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors mb-4 font-bold"><LogOut size={20}/> Logout</button>
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 text-white"><p className="text-xs opacity-70 mb-1">Versi Aplikasi</p><p className="font-bold text-sm">v2.0 (SaaS Edition)</p><p className="text-xs mt-2 opacity-50">© 2025 Guru Developer</p></div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto relative">
        <div className="md:hidden bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-20"><div className="flex items-center gap-2 font-bold text-slate-800"><div className="bg-blue-600 text-white p-1.5 rounded-lg"><GraduationCap size={18} /></div>SINILAI</div><button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">{isMobileMenuOpen ? <X /> : <Menu />}</button></div>
        {isMobileMenuOpen && (<div className="md:hidden absolute top-16 left-0 w-full bg-white shadow-xl z-20 border-b border-slate-200 p-4 space-y-2 animate-fade-in-down">{[{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'sekolah', label: 'Profil Sekolah', icon: School }, { id: 'siswa', label: 'Data Siswa', icon: Users }, { id: 'mapel', label: 'Mata Pelajaran', icon: BookOpen }, { id: 'nilai', label: 'Input Nilai', icon: Edit2 }].map((item) => (<button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 p-3 rounded-lg ${activeTab === item.id ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600'}`}><item.icon size={20} /> {item.label}</button>))} <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-red-600 font-bold border-t mt-2"><LogOut size={20}/> Logout</button></div>)}
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
             <div className="flex justify-between items-center mb-8"><div><h2 className="text-2xl font-bold text-slate-900 capitalize">{activeTab.replace('-', ' ')}</h2><p className="text-slate-500 text-sm hidden md:block">{activeTab === 'dashboard' && 'Ringkasan data akademik sekolah Anda.'}{activeTab === 'siswa' && 'Kelola data siswa, tambah, atau hapus siswa.'}{activeTab === 'nilai' && 'Input nilai harian, UTS, dan UAS siswa.'}</p></div><div className="hidden md:flex items-center gap-3"><div className="bg-white px-4 py-2 rounded-full border shadow-sm text-sm font-medium text-slate-600">Tahun Ajaran: <span className="text-blue-600 font-bold">2025/2026</span></div></div></div>
             {renderContent()}
        </div>
      </main>
    </div>
  );
}
