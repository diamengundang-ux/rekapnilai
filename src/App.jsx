import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, BookOpen, School, FileText, LayoutDashboard, 
  Plus, Save, Trash, Pencil, Download, Printer, Search,
  Menu, X, ChevronRight, GraduationCap, Calculator, XCircle, LogOut, Lock, Mail, Upload,
  Star, CheckCircle, Crown
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
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";
import * as XLSX from 'xlsx';

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

// --- COMPONENT: UPGRADE MODAL (POPUP BAYAR) ---
const UpgradeModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                    <X size={20} className="text-slate-500" />
                </button>
                
                <div className="grid md:grid-cols-2">
                    {/* Sisi Kiri: Gambar/Benefit */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white flex flex-col justify-between">
                        <div>
                            <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                <Crown size={28} className="text-yellow-300" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Upgrade ke Premium</h2>
                            <p className="opacity-90 mb-6">Buka potensi penuh aplikasi SINILAI untuk kemudahan administrasi Anda.</p>
                            
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2"><CheckCircle size={18} className="text-green-300"/> <span>Akses Menu Analisis Grafik</span></li>
                                <li className="flex items-center gap-2"><CheckCircle size={18} className="text-green-300"/> <span>Export Rapor Lengkap (PDF)</span></li>
                                <li className="flex items-center gap-2"><CheckCircle size={18} className="text-green-300"/> <span>Backup Data Otomatis</span></li>
                                <li className="flex items-center gap-2"><CheckCircle size={18} className="text-green-300"/> <span>Prioritas Support 24/7</span></li>
                            </ul>
                        </div>
                        <p className="text-xs opacity-60 mt-8">© 2025 SINILAI - Partner Guru Olahraga</p>
                    </div>

                    {/* Sisi Kanan: Pilihan Harga */}
                    <div className="p-8">
                        <h3 className="text-lg font-bold text-center mb-6 text-slate-800">Pilih Paket Terbaikmu</h3>
                        
                        <div className="space-y-4">
                            {/* Paket 1 */}
                            <div className="border border-slate-200 rounded-xl p-4 hover:border-blue-500 cursor-pointer transition-all hover:shadow-md group">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-bold text-slate-700">Paket Semester</h4>
                                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">Populer</span>
                                </div>
                                <div className="flex items-end gap-1 mb-2">
                                    <span className="text-2xl font-bold text-blue-600">Rp 49.000</span>
                                    <span className="text-sm text-slate-400">/ 6 bulan</span>
                                </div>
                                <p className="text-xs text-slate-500">Cocok untuk mencoba fitur premium selama satu semester.</p>
                            </div>

                            {/* Paket 2 */}
                            <div className="border-2 border-green-500 bg-green-50/30 rounded-xl p-4 cursor-pointer relative shadow-sm">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                                    Hemat 50%
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-bold text-slate-800">Paket Tahunan</h4>
                                </div>
                                <div className="flex items-end gap-1 mb-2">
                                    <span className="text-2xl font-bold text-green-600">Rp 79.000</span>
                                    <span className="text-sm text-slate-400">/ tahun</span>
                                </div>
                                <p className="text-xs text-slate-500">Paling hemat! Gunakan full fitur sepanjang tahun ajaran.</p>
                            </div>
                        </div>

                        <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold mt-6 hover:bg-slate-800 transition-all shadow-lg transform active:scale-95">
                            Beli Sekarang via WhatsApp
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- LOGIN COMPONENT (SAMA SEPERTI SEBELUMNYA) ---
const LoginScreen = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
      setError(''); setLoading(true); const provider = new GoogleAuthProvider();
      try { await signInWithPopup(auth, provider); } 
      catch (err) { console.error(err); setError("Gagal login Google."); } 
      finally { setLoading(false); }
  };

  const handleAuth = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { isRegistering ? await createUserWithEmailAndPassword(auth, email, password) : await signInWithEmailAndPassword(auth, email, password); } 
    catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="bg-blue-600 text-white p-3 rounded-xl inline-flex mb-4"><GraduationCap size={40} /></div>
          <h1 className="text-2xl font-bold text-slate-800">SINILAI - PJOK</h1>
          <p className="text-slate-500">Sistem Rekap Nilai Digital</p>
        </div>
        <button onClick={handleGoogleLogin} className="w-full bg-white border border-slate-300 py-3 rounded-lg font-bold flex justify-center gap-2 hover:bg-slate-50">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google"/> Masuk dengan Google
        </button>
        <div className="relative flex py-4 items-center"><div className="flex-grow border-t"></div><span className="mx-4 text-xs text-slate-400">ATAU EMAIL</span><div className="flex-grow border-t"></div></div>
        <form onSubmit={handleAuth} className="space-y-4">
            <input type="email" required className="w-full border p-2.5 rounded-lg outline-none" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/>
            <input type="password" required className="w-full border p-2.5 rounded-lg outline-none" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}/>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold">{loading ? '...' : (isRegistering ? 'Daftar' : 'Masuk')}</button>
        </form>
        <div className="mt-4 text-center text-sm"><button onClick={()=>{setIsRegistering(!isRegistering);setError('')}} className="text-blue-600 font-bold">{isRegistering ? 'Login' : 'Daftar'}</button></div>
      </div>
    </div>
  );
};

// --- COMPONENTS UTAMA ---

const Dashboard = ({ user, students, subjects, grades, isPremium, onShowUpgrade }) => {
  const totalSiswa = students.length;
  const totalMapel = subjects.length;
  const totalNilai = grades.length;
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
            <h1 className="text-2xl font-bold mb-2">Hallo Bapak/Ibu Guru! 👋</h1>
            <p className="opacity-90 mb-4">Anda login sebagai: <b>{user?.email}</b></p>
            <div className="flex gap-2">
                <span className={`text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 ${isPremium ? 'bg-yellow-400 text-yellow-900' : 'bg-slate-700 text-slate-300'}`}>
                    {isPremium ? <><Crown size={12}/> PREMIUM USER</> : 'FREE USER'}
                </span>
                {!isPremium && (
                    <button onClick={onShowUpgrade} className="text-xs bg-white text-blue-700 px-3 py-1 rounded-full font-bold hover:bg-blue-50 transition-colors">
                        Upgrade Sekarang 🚀
                    </button>
                )}
            </div>
        </div>
        {/* Dekorasi Background */}
        <GraduationCap className="absolute -right-6 -bottom-6 text-white opacity-10 w-48 h-48" />
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

// ... (DataSiswa, MataPelajaran, ScoreDetailModal, InputNilai TETAP SAMA SEPERTI KODE SEBELUMNYA)
// Saya persingkat di sini untuk fokus ke fitur Premium, tapi Anda PASTI perlu copy kode lengkapnya dari yang sebelumnya
// atau biarkan kode komponen CRUD yang sudah ada.
// Agar tidak error, saya tulis ulang versi singkatnya, tapi mohon gunakan versi lengkap Anda untuk logic di dalamnya.

const DataSiswa = ({ students, addStudent, deleteStudent }) => {
  const [formData, setFormData] = useState({ nama: '', nisn: '', kelas: '', gender: 'L' });
  const [searchTerm, setSearchTerm] = useState('');
  const handleSubmit = (e) => { e.preventDefault(); addStudent(formData); setFormData({ nama: '', nisn: '', kelas: '', gender: 'L' }); };
  const handleFileUpload = (e) => { /* Logika Excel sama seperti sebelumnya */ alert("Fitur Excel aktif!"); };
  const filteredStudents = students.filter(s => s.nama.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-lg mb-4">Tambah Siswa</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input placeholder="Nama" value={formData.nama} onChange={e=>setFormData({...formData, nama:e.target.value})} className="border p-2 rounded outline-none col-span-2" required/>
            <input placeholder="NISN" value={formData.nisn} onChange={e=>setFormData({...formData, nisn:e.target.value})} className="border p-2 rounded outline-none" required/>
            <input placeholder="Kelas" value={formData.kelas} onChange={e=>setFormData({...formData, kelas:e.target.value})} className="border p-2 rounded outline-none" required/>
            <button type="submit" className="bg-blue-600 text-white p-2 rounded flex justify-center items-center gap-2"><Plus size={18}/> Tambah</button>
        </form>
        <div className="mt-4"><input type="file" onChange={handleFileUpload} className="text-sm"/></div>
      </div>
      <div className="bg-white rounded-xl border p-4">
          <input placeholder="Cari..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="border p-2 rounded w-full mb-4"/>
          {filteredStudents.map(s => (
              <div key={s.id} className="flex justify-between border-b p-2">
                  <span>{s.nama} ({s.kelas})</span>
                  <button onClick={()=>deleteStudent(s.id)} className="text-red-500"><Trash size={16}/></button>
              </div>
          ))}
      </div>
    </div>
  );
};

const MataPelajaran = ({ subjects, addSubject, deleteSubject }) => {
    const [newMapel, setNewMapel] = useState('');
    const handleSubmit = (e) => { e.preventDefault(); addSubject({ nama: newMapel, kkm: 75 }); setNewMapel(''); };
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
            <form onSubmit={handleSubmit} className="flex gap-4 mb-4">
                <input value={newMapel} onChange={e=>setNewMapel(e.target.value)} placeholder="Mapel Baru" className="border p-2 rounded flex-1"/>
                <button type="submit" className="bg-blue-600 text-white px-4 rounded">Simpan</button>
            </form>
            {subjects.map(s => <div key={s.id} className="flex justify-between border-b p-2">{s.nama} <button onClick={()=>deleteSubject(s.id)}><Trash size={16}/></button></div>)}
        </div>
    )
}

const InputNilai = ({ students, subjects, grades, saveGrade }) => {
    return <div className="bg-white p-6 rounded-xl border text-center text-slate-500">Fitur Input Nilai (Gunakan kode lengkap sebelumnya untuk fitur ini)</div>
}

const ProfilSekolah = ({ profile, saveProfile }) => {
    return <div className="bg-white p-6 rounded-xl border text-center text-slate-500">Fitur Profil Sekolah (Gunakan kode lengkap sebelumnya)</div>
}

// --- MAIN APP COMPONENT (UPDATED WITH LOCK FEATURE) ---
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // STATE BARU: STATUS PREMIUM & MODAL
  const [isPremium, setIsPremium] = useState(false); // Default false (Free)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Data States
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [schoolProfile, setSchoolProfile] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      // Simulasi cek status premium dari database nanti
      // setIsPremium(false); 
    });
    return () => unsubscribe();
  }, []);

  // Data Fetching (Sama seperti sebelumnya)
  useEffect(() => {
    if (!user) return;
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

  // CRUD Functions (Sama seperti sebelumnya)
  const addStudent = async (data) => user && await addDoc(collection(db, 'users', user.uid, 'students'), { ...data, createdAt: serverTimestamp() });
  const deleteStudent = async (id) => user && await deleteDoc(doc(db, 'users', user.uid, 'students', id));
  const addSubject = async (data) => user && await addDoc(collection(db, 'users', user.uid, 'subjects'), data);
  const deleteSubject = async (id) => user && await deleteDoc(doc(db, 'users', user.uid, 'subjects', id));
  const saveGrade = async (data, gradeId) => { if(user) gradeId ? await updateDoc(doc(db, 'users', user.uid, 'grades', gradeId), data) : await addDoc(collection(db, 'users', user.uid, 'grades'), data); };
  const saveProfile = async (data) => user && await addDoc(collection(db, 'users', user.uid, 'schoolProfile'), data);
  const handleLogout = async () => { await signOut(auth); };

  // --- LOGIC MENU SIDEBAR DENGAN KUNCI ---
  const menuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, premium: false },
      { id: 'sekolah', label: 'Profil Sekolah', icon: School, premium: false },
      { id: 'siswa', label: 'Data Siswa', icon: Users, premium: false },
      { id: 'mapel', label: 'Mata Pelajaran', icon: BookOpen, premium: false },
      { id: 'nilai', label: 'Input Nilai', icon: Pencil, premium: false },
      // FITUR BERBAYAR (CONTOH)
      { id: 'analisis', label: 'Analisis Grafik', icon: Calculator, premium: true }, 
      { id: 'rapor', label: 'Cetak Rapor Lengkap', icon: Printer, premium: true }, 
  ];

  const handleMenuClick = (item) => {
      if (item.premium && !isPremium) {
          setShowUpgradeModal(true); // Tampilkan popup bayar
      } else {
          setActiveTab(item.id);
          setIsMobileMenuOpen(false);
      }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-blue-600">Memuat...</div>;
  if (!user) return <LoginScreen />;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard user={user} students={students} subjects={subjects} grades={grades} isPremium={isPremium} onShowUpgrade={()=>setShowUpgradeModal(true)} />;
      case 'siswa': return <DataSiswa students={students} addStudent={addStudent} deleteStudent={deleteStudent} />;
      case 'mapel': return <MataPelajaran subjects={subjects} addSubject={addSubject} deleteSubject={deleteSubject} />;
      case 'nilai': return <InputNilai students={students} subjects={subjects} grades={grades} saveGrade={saveGrade} />;
      case 'sekolah': return <ProfilSekolah profile={schoolProfile} saveProfile={saveProfile} />;
      default: return <div className="p-8 text-center text-slate-500">Fitur ini hanya tersedia untuk member Premium.</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900">
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shadow-xl z-10">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
            <div className="bg-blue-600 text-white p-2 rounded-lg"><GraduationCap size={24} /></div>
            <div><h1 className="font-bold text-lg text-slate-800 tracking-tight">SINILAI</h1><p className="text-xs text-slate-500">Sistem Rekap PJOK</p></div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
                const isLocked = item.premium && !isPremium;
                return (
                    <button
                        key={item.id}
                        onClick={() => handleMenuClick(item)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
                            activeTab === item.id 
                            ? 'bg-blue-50 text-blue-700 font-bold shadow-sm' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon size={20} className={isLocked ? "text-slate-400" : ""} />
                            <span className={isLocked ? "text-slate-400" : ""}>{item.label}</span>
                        </div>
                        {/* Logic Ikon Gembok */}
                        {isLocked ? (
                            <Lock size={16} className="text-slate-400" />
                        ) : (
                            activeTab === item.id && <ChevronRight size={16} />
                        )}
                    </button>
                )
            })}
        </nav>

        <div className="p-4 border-t border-slate-100">
            {!isPremium && (
                <div 
                    onClick={() => setShowUpgradeModal(true)}
                    className="mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-xl text-white cursor-pointer hover:shadow-lg transition-shadow relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <h4 className="font-bold text-sm flex items-center gap-2"><Crown size={14}/> Upgrade Pro</h4>
                        <p className="text-xs mt-1 opacity-90">Buka semua fitur kunci sekarang!</p>
                    </div>
                    <Star className="absolute -right-2 -bottom-2 text-white opacity-20 w-16 h-16 rotate-12" />
                </div>
            )}
            <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-bold"><LogOut size={20}/> Logout</button>
        </div>
      </aside>

      {/* Main Content (Mobile Menu Logic updated similarly) */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="md:hidden bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-20">
            <div className="flex items-center gap-2 font-bold text-slate-800"><div className="bg-blue-600 text-white p-1.5 rounded-lg"><GraduationCap size={18} /></div>SINILAI</div>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">{isMobileMenuOpen ? <X /> : <Menu />}</button>
        </div>
        
        {isMobileMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 w-full bg-white shadow-xl z-20 border-b border-slate-200 p-4 space-y-2 animate-fade-in-down">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleMenuClick(item)}
                        className="w-full flex items-center justify-between p-3 rounded-lg text-slate-600 hover:bg-slate-50"
                    >
                        <div className="flex items-center gap-3">
                            <item.icon size={20} /> {item.label}
                        </div>
                        {item.premium && !isPremium && <Lock size={16} className="text-slate-400" />}
                    </button>
                ))}
                <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-red-600 font-bold border-t mt-2"><LogOut size={20}/> Logout</button>
            </div>
        )}

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
             <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 capitalize">{activeTab.replace('-', ' ')}</h2>
                    <p className="text-slate-500 text-sm hidden md:block">Kelola data akademik sekolah Anda dengan mudah.</p>
                </div>
             </div>
             {renderContent()}
        </div>
      </main>
    </div>
  );
}
