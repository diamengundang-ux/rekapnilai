import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, BookOpen, School, FileText, LayoutDashboard, 
  Plus, Save, Trash, Pencil, Download, Printer, Search,
  Menu, X, ChevronRight, GraduationCap, Calculator, XCircle, LogOut, Lock, Mail, Upload,
  Star, CheckCircle, Crown, ArrowLeft, Copy, Smile, CreditCard, ChevronLeft, Building2, Phone, Globe, User, UserCheck, FileSpreadsheet
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, updateDoc, setDoc, getDoc, 
  deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp, writeBatch 
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
import * as XLSX from 'xlsx'; // Pastikan library ini aktif (tidak di-comment)

// --- KONEKSI KE FIREBASE ---
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

// --- COMPONENT: SETUP PROFILE MODAL ---
const SetupProfileModal = ({ user, onComplete }) => {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!phone || phone.length < 10) { alert("Mohon masukkan nomor WhatsApp yang valid."); return; }
        setLoading(true);
        try {
            await setDoc(doc(db, 'users', user.uid, 'settings', 'profile'), {
                phoneNumber: phone, email: user.email, displayName: user.displayName || '', isPremium: false, updatedAt: serverTimestamp()
            }, { merge: true });
            onComplete();
        } catch (error) { console.error("Error:", error); alert("Gagal menyimpan data."); } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 animate-fade-in backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
                <div className="mx-auto bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mb-6"><div className="bg-black text-green-400 rounded-full p-2"><Smile size={32} /></div></div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Satu Langkah Lagi!</h2>
                <p className="text-slate-500 mb-8 text-sm">Lengkapi profil Anda dengan nomor HP yang aktif.</p>
                <input type="tel" placeholder="Contoh: 081234567890" className="w-full border border-slate-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-green-500 mb-8" value={phone} onChange={e => setPhone(e.target.value)} autoFocus />
                <button onClick={handleSave} disabled={loading} className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg disabled:opacity-70">{loading ? 'Menyimpan...' : 'Simpan & Lanjutkan'}</button>
            </div>
        </div>
    );
};

// --- COMPONENT: UPGRADE MODAL ---
const UpgradeModal = ({ isOpen, onClose, userEmail }) => {
    const [step, setStep] = useState(1);
    const [selectedPlan, setSelectedPlan] = useState(null);
    useEffect(() => { if(!isOpen) setStep(1); }, [isOpen]);
    if (!isOpen) return null;
    const BANK_ACCOUNTS = [
        { bank: 'BCA', number: '1234567890', name: 'ADMIN NILAIKU', color: 'text-blue-700', bg: 'bg-blue-50' },
        { bank: 'MANDIRI', number: '123000456000', name: 'ADMIN NILAIKU', color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { bank: 'BRI', number: '0987654321000', name: 'ADMIN NILAIKU', color: 'text-blue-500', bg: 'bg-blue-50' },
    ];
    const ADMIN_WA = "6281234567890"; 
    const handleSelectPlan = (planName, price) => { setSelectedPlan({ name: planName, price }); setStep(2); };
    const handleCopy = (text) => { navigator.clipboard.writeText(text); alert(`Disalin: ${text}`); };
    const handleConfirmWA = () => {
        const text = `Halo Admin NILAIKU, saya sudah transfer pembayaran.\n\n📧 Email Akun: ${userEmail}\n📦 Paket: ${selectedPlan.name}\n💰 Nominal: ${selectedPlan.price}\n\nMohon segera diproses aktivasinya. Terima kasih!`;
        window.open(`https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-fade-in backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden relative my-auto flex flex-col md:flex-row min-h-[600px]">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors z-20"><X size={20} className="text-slate-500" /></button>
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white md:w-2/5 flex flex-col justify-between">
                    <div>
                        <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4"><Crown size={28} className="text-yellow-300" /></div>
                        <h2 className="text-2xl font-bold mb-2">Upgrade Premium</h2>
                        <p className="opacity-90 mb-6 text-sm">Fitur "Input Nilai" adalah fitur Premium. Upgrade sekarang untuk mulai merekap nilai siswa.</p>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-300"/> <span>Buka Menu Input Nilai</span></li>
                            <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-300"/> <span>Hitung Rata-rata Otomatis</span></li>
                            <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-300"/> <span>Export Laporan ke Excel</span></li>
                            <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-300"/> <span>Simpan Data Tanpa Batas</span></li>
                        </ul>
                    </div>
                    <p className="text-xs opacity-60 mt-8 hidden md:block">© 2025 NILAIKU</p>
                </div>
                <div className="p-6 md:p-8 md:w-3/5 bg-slate-50 flex flex-col">
                    {step === 1 && (
                        <div className="animate-fade-in flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">Pilih Paket Terbaikmu</h3>
                            <div className="space-y-4 flex-1">
                                <div onClick={() => handleSelectPlan('Paket Semester', 'Rp 49.000')} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-500 cursor-pointer shadow-sm relative group">
                                    <div className="flex justify-between items-center mb-2"><h4 className="font-bold text-slate-700">Paket Semester</h4><span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-1 rounded-full font-bold">Populer</span></div>
                                    <div className="flex items-end gap-1"><span className="text-2xl font-bold text-blue-600">Rp 49.000</span><span className="text-xs text-slate-400 mb-1">/ 6 bulan</span></div>
                                </div>
                                <div onClick={() => handleSelectPlan('Paket Tahunan', 'Rp 79.000')} className="bg-white border-2 border-green-500 rounded-xl p-5 cursor-pointer shadow-md relative">
                                    <div className="absolute -top-3 right-4 bg-green-500 text-white text-[10px] px-3 py-1 rounded-full font-bold">HEMAT 50%</div>
                                    <div className="flex justify-between items-center mb-2"><h4 className="font-bold text-slate-800">Paket Tahunan</h4></div>
                                    <div className="flex items-end gap-1"><span className="text-2xl font-bold text-green-600">Rp 79.000</span><span className="text-xs text-slate-400 mb-1">/ tahun</span></div>
                                </div>
                            </div>
                        </div>
                    )}
                    {step === 2 && (
                        <div className="animate-fade-in h-full flex flex-col">
                            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-4"><ArrowLeft size={18}/> Kembali</button>
                            <div className="text-center mb-8">
                                <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide font-bold">Total Pembayaran</p>
                                <div className="bg-green-600 text-white font-bold text-3xl py-4 rounded-xl shadow-lg">
                                    {selectedPlan.price}
                                </div>
                            </div>
                            <p className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wide">Silakan transfer ke:</p>
                            <div className="space-y-3 overflow-y-auto max-h-[250px] pr-1 custom-scrollbar mb-4">
                                {BANK_ACCOUNTS.map((bank, idx) => (
                                    <div key={idx} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col gap-2">
                                        <div className="flex justify-between items-center">
                                            <div className={`flex items-center gap-2 px-2 py-1 rounded-md ${bank.bg}`}><Building2 size={16} className={bank.color} /><span className={`font-bold text-sm ${bank.color}`}>{bank.bank}</span></div>
                                            <button onClick={() => handleCopy(bank.number)} className="text-xs text-slate-400 flex items-center gap-1 hover:text-blue-600 active:text-blue-700"><Copy size={14}/></button>
                                        </div>
                                        <div className="flex justify-between items-end"><div><p className="text-lg font-mono font-bold text-slate-800 tracking-wider" onClick={() => handleCopy(bank.number)}>{bank.number}</p><p className="text-[10px] text-slate-400 uppercase font-medium mt-1">A.N. {bank.name}</p></div></div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-auto">
                                <button onClick={handleConfirmWA} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg flex items-center justify-center gap-2 text-lg active:scale-95"><img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-6 h-6" alt="WA"/> Konfirmasi Pembayaran</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- LOGIN COMPONENT ---
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
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="bg-blue-600 text-white p-3 rounded-xl inline-flex mb-4"><GraduationCap size={40} /></div>
          <h1 className="text-2xl font-bold text-slate-800">NILAIKU</h1>
          <p className="text-slate-500">Sistem Aplikasi Nilai Digital</p>
        </div>
        <button onClick={handleGoogleLogin} className="w-full bg-white border border-slate-300 py-3 rounded-lg font-bold flex justify-center gap-2 hover:bg-slate-50 transition-colors">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google"/> 
            <span className="text-sm md:text-base">Masuk dengan Google</span>
        </button>
        <div className="relative flex py-4 items-center"><div className="flex-grow border-t"></div><span className="mx-4 text-xs text-slate-400">ATAU EMAIL</span><div className="flex-grow border-t"></div></div>
        <form onSubmit={handleAuth} className="space-y-4">
            <input type="email" required className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/>
            <input type="password" required className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}/>
            {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-70">{loading ? '...' : (isRegistering ? 'Daftar Akun' : 'Masuk')}</button>
        </form>
        <div className="mt-4 text-center text-sm text-slate-600">{isRegistering ? 'Sudah punya akun?' : 'Belum punya akun?'} <button onClick={()=>{setIsRegistering(!isRegistering);setError('')}} className="text-blue-600 font-bold ml-1 hover:underline">{isRegistering ? 'Login' : 'Daftar'}</button></div>
      </div>
    </div>
  );
};

// --- DASHBOARD ---
const Dashboard = ({ user, students, subjects, grades, isPremium, onShowUpgrade }) => {
  const totalSiswa = students.length;
  const totalMapel = subjects.length;
  const totalNilai = grades.length;
  const totalLaki = students.filter(s => s.gender === 'L').length;
  const totalPerempuan = students.filter(s => s.gender === 'P').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
            <h1 className="text-xl md:text-2xl font-bold mb-2">Hallo Bapak/Ibu Guru! 👋</h1>
            <p className="opacity-90 mb-4 text-sm md:text-base">Anda login sebagai: <b>{user?.email}</b></p>
            <div className="flex flex-wrap gap-2">
                <span className={`text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 ${isPremium ? 'bg-yellow-400 text-yellow-900' : 'bg-slate-700 text-slate-300'}`}>{isPremium ? <><Crown size={12}/> PREMIUM USER</> : 'FREE USER'}</span>
                {!isPremium && (<button onClick={onShowUpgrade} className="text-xs bg-white text-blue-700 px-3 py-1 rounded-full font-bold hover:bg-blue-50 transition-colors animate-pulse">Upgrade Sekarang 🚀</button>)}
            </div>
        </div>
        <GraduationCap className="absolute -right-6 -bottom-6 text-white opacity-10 w-32 h-32 md:w-48 md:h-48" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4"><div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Users size={24} /></div><div><p className="text-xs text-slate-500 uppercase font-bold">Total Siswa</p><h3 className="text-2xl font-bold text-slate-800">{totalSiswa}</h3></div></div>
        
        {/* STATISTIK GENDER */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-500 rounded-lg"><User size={24} /></div>
            <div><p className="text-xs text-slate-500 uppercase font-bold">Laki-laki</p><h3 className="text-2xl font-bold text-slate-800">{totalLaki}</h3></div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
            <div className="p-3 bg-pink-50 text-pink-500 rounded-lg"><UserCheck size={24} /></div>
            <div><p className="text-xs text-slate-500 uppercase font-bold">Perempuan</p><h3 className="text-2xl font-bold text-slate-800">{totalPerempuan}</h3></div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4"><div className="p-3 bg-orange-100 text-orange-600 rounded-lg"><FileText size={24} /></div><div><p className="text-xs text-slate-500 uppercase font-bold">Nilai Masuk</p><h3 className="text-2xl font-bold text-slate-800">{totalNilai}</h3></div></div>
      </div>
    </div>
  );
};

// --- DATA SISWA (PAGINATION + BULK DELETE + EDIT) ---
const DataSiswa = ({ students, addStudent, updateStudent, deleteStudent, user }) => { 
  const [formData, setFormData] = useState({ nama: '', nisn: '', kelas: '', gender: 'L' });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null); 
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter Data
  const filteredStudents = students.filter(s => s.nama.toLowerCase().includes(searchTerm.toLowerCase()));

  // Pagination Logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const currentStudents = useMemo(() => {
      const start = (currentPage - 1) * itemsPerPage;
      return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage]);

  // Reset page when search changes
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const handleSubmit = (e) => { 
      e.preventDefault(); 
      if (editingId) { updateStudent(editingId, formData); alert("Data siswa berhasil diperbarui!"); } else { addStudent(formData); }
      setFormData({ nama: '', nisn: '', kelas: '', gender: 'L' }); setEditingId(null);
  };
  
  const handleEdit = (student) => {
      setFormData({ nama: student.nama, nisn: student.nisn, kelas: student.kelas, gender: student.gender || 'L' });
      setEditingId(student.id);
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const handleCancelEdit = () => { setFormData({ nama: '', nisn: '', kelas: '', gender: 'L' }); setEditingId(null); }

  const handleDownloadTemplate = () => {
      const templateData = [
          { "Nama": "Budi Santoso", "NISN": "1234567890", "Kelas": "1A", "Gender": "L" },
          { "Nama": "Siti Aminah", "NISN": "0987654321", "Kelas": "1B", "Gender": "P" }
      ];
      
      const xlsxLib = window.XLSX || XLSX;
      if (!xlsxLib) { alert("⚠️ Library Excel belum aktif. Pastikan kode 'import * as XLSX' sudah diaktifkan di GitHub."); return; }
      
      const ws = xlsxLib.utils.json_to_sheet(templateData);
      const wb = xlsxLib.utils.book_new();
      xlsxLib.utils.book_append_sheet(wb, ws, "Template");
      xlsxLib.writeFile(wb, "Template_Siswa_NILAIKU.xlsx");
  };

  const handleFileUpload = (e) => {
    const xlsxLib = window.XLSX || XLSX;
    if (!xlsxLib) { alert("⚠️ Library Excel belum diaktifkan."); return; }
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
        try {
            const bstr = evt.target.result; const wb = xlsxLib.read(bstr, { type: 'binary' }); const ws = wb.Sheets[wb.SheetNames[0]]; const data = xlsxLib.utils.sheet_to_json(ws);
            let count = 0; data.forEach(row => { 
                const nama = row.Nama || row.nama || row.NAMA;
                const kelas = row.Kelas || row.kelas || row.KELAS;
                const nisn = row.NISN || row.nisn || '-';
                const gender = row.Gender || row.gender || row.JK || 'L'; 
                if(nama && kelas) { addStudent({ nama, nisn, kelas: kelas.toString(), gender }); count++; } 
            });
            alert(`Berhasil mengimpor ${count} siswa!`);
        } catch (error) { console.error("Excel Error:", error); alert("Gagal membaca file Excel."); }
    };
    reader.readAsBinaryString(file);
  };

  // Bulk Delete Handlers
  const handleSelectAll = (e) => {
      if (e.target.checked) { setSelectedIds(currentStudents.map(s => s.id)); } else { setSelectedIds([]); }
  };
  const handleSelectOne = (id) => {
      if (selectedIds.includes(id)) { setSelectedIds(selectedIds.filter(sid => sid !== id)); } else { setSelectedIds([...selectedIds, id]); }
  };
  const handleBulkDelete = async () => {
      if(!window.confirm(`Yakin hapus ${selectedIds.length} siswa terpilih?`)) return;
      const db = getFirestore();
      const batch = writeBatch(db);
      selectedIds.forEach(id => {
          const ref = doc(db, 'users', user.uid, 'students', id);
          batch.delete(ref);
      });
      await batch.commit();
      setSelectedIds([]);
      alert("Siswa terpilih berhasil dihapus!");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h3 className="font-bold text-lg text-slate-800">{editingId ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}</h3>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
                {selectedIds.length > 0 && (
                    <button onClick={handleBulkDelete} className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors w-full md:w-auto"><Trash size={16}/> Hapus ({selectedIds.length})</button>
                )}
                <button onClick={handleDownloadTemplate} className="flex items-center justify-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors w-full md:w-auto"><FileSpreadsheet size={16}/> Template</button>
                <div className="relative w-full md:w-auto"><input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" id="excel-upload" /><label htmlFor="excel-upload" className="cursor-pointer flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors w-full md:w-auto"><Upload size={16}/> Import Excel</label></div>
            </div>
        </div>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <input placeholder="Nama Lengkap" value={formData.nama} onChange={e=>setFormData({...formData, nama:e.target.value})} className="border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2 w-full" required/>
            <input placeholder="NISN" value={formData.nisn} onChange={e=>setFormData({...formData, nisn:e.target.value})} className="border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 w-full" required/>
            <input placeholder="Kelas (misal: 1A)" value={formData.kelas} onChange={e=>setFormData({...formData, kelas:e.target.value})} className="border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 w-full" required/>
            
            <select value={formData.gender} onChange={e=>setFormData({...formData, gender:e.target.value})} className="border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 w-full bg-white"><option value="L">Laki-laki</option><option value="P">Perempuan</option></select>

            <button type="submit" className={`text-white p-2.5 rounded-lg flex justify-center items-center gap-2 font-medium transition-colors w-full ${editingId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {editingId ? <><Save size={18}/> Update</> : <><Plus size={18}/> Tambah</>}
            </button>
            {editingId && (<button type="button" onClick={handleCancelEdit} className="bg-slate-200 text-slate-700 p-2.5 rounded-lg hover:bg-slate-300">Batal</button>)}
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50"><h3 className="font-bold text-slate-800">Daftar Siswa ({filteredStudents.length})</h3><div className="relative w-full md:w-64"><Search className="absolute left-3 top-2.5 text-slate-400" size={18} /><input placeholder="Cari nama siswa..." className="pl-10 pr-4 py-2 border rounded-lg text-sm outline-none focus:border-blue-500 w-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div></div>
        
        {/* TABEL DATA */}
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
            <tr>
                <th className="p-4 w-10 text-center"><input type="checkbox" onChange={handleSelectAll} checked={selectedIds.length === currentStudents.length && currentStudents.length > 0} /></th>
                <th className="p-4 whitespace-nowrap">Nama Siswa</th><th className="p-4 whitespace-nowrap">NISN</th><th className="p-4 whitespace-nowrap">L/P</th><th className="p-4 whitespace-nowrap">Kelas</th><th className="p-4 text-center whitespace-nowrap">Aksi</th>
            </tr>
            </thead><tbody className="divide-y divide-slate-100">{currentStudents.map(s => (
                <tr key={s.id} className={`hover:bg-slate-50 transition-colors ${selectedIds.includes(s.id) ? 'bg-blue-50' : ''}`}>
                    <td className="p-4 text-center"><input type="checkbox" checked={selectedIds.includes(s.id)} onChange={() => handleSelectOne(s.id)} /></td>
                    <td className="p-4 font-medium text-slate-800 min-w-[150px]">{s.nama}</td><td className="p-4 text-slate-500">{s.nisn}</td><td className="p-4 text-slate-500">{s.gender || 'L'}</td><td className="p-4"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">{s.kelas}</span></td><td className="p-4 text-center flex justify-center gap-2">
            <button onClick={()=>handleEdit(s)} className="text-yellow-500 hover:text-yellow-700 p-2 rounded-full hover:bg-yellow-50" title="Edit"><Pencil size={18}/></button>
            <button onClick={()=>deleteStudent(s.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50" title="Hapus"><Trash size={18}/></button>
        </td></tr>))}</tbody></table></div>

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
            <div className="p-4 flex justify-between items-center bg-slate-50 border-t border-slate-200">
                <span className="text-xs text-slate-500">Hal. {currentPage} dari {totalPages}</span>
                <div className="flex gap-2">
                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 bg-white border border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-50">Sebelumnya</button>
                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 bg-white border border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-50">Selanjutnya</button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

// --- MATA PELAJARAN (FITUR EDIT) ---
const MataPelajaran = ({ subjects, addSubject, updateSubject, deleteSubject }) => {
    const [formData, setFormData] = useState({ nama: '', kkm: 75 });
    const [editingId, setEditingId] = useState(null);

    const handleSubmit = (e) => { 
        e.preventDefault(); 
        if(editingId) {
            updateSubject(editingId, { nama: formData.nama, kkm: parseInt(formData.kkm) });
            alert("Mapel berhasil diupdate!");
        } else {
            addSubject({ nama: formData.nama, kkm: parseInt(formData.kkm) }); 
        }
        setFormData({ nama: '', kkm: 75 }); 
        setEditingId(null);
    };

    const handleEdit = (s) => {
        setFormData({ nama: s.nama, kkm: s.kkm });
        setEditingId(s.id);
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-lg mb-4 text-slate-800">{editingId ? 'Edit Mapel' : 'Tambah Mapel'}</h3>
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
                    <input value={formData.nama} onChange={e=>setFormData({...formData, nama:e.target.value})} placeholder="Nama Mata Pelajaran" className="border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 flex-1" required/>
                    <input type="number" value={formData.kkm} onChange={e=>setFormData({...formData, kkm:e.target.value})} placeholder="KKM" className="border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 w-32" required/>
                    <button type="submit" className={`text-white px-6 py-2.5 rounded-lg font-medium ${editingId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'}`}>{editingId ? 'Update' : 'Simpan'}</button>
                    {editingId && <button type="button" onClick={()=>{setEditingId(null); setFormData({nama:'', kkm:75})}} className="bg-slate-200 text-slate-600 px-4 py-2.5 rounded-lg">Batal</button>}
                </form>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600 uppercase font-semibold"><tr><th className="p-4">Mapel</th><th className="p-4">KKM</th><th className="p-4 text-center">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100">{subjects.map(s => <tr key={s.id} className="hover:bg-slate-50"><td className="p-4 font-medium">{s.nama}</td><td className="p-4"><span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">{s.kkm}</span></td><td className="p-4 text-center flex justify-center gap-2">
                <button onClick={()=>handleEdit(s)} className="text-yellow-500 hover:bg-yellow-50 p-2 rounded-full"><Pencil size={18}/></button>
                <button onClick={()=>deleteSubject(s.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full"><Trash size={18}/></button>
            </td></tr>)}</tbody></table></div>
        </div>
    )
}

// --- SCORE DETAIL MODAL ---
const ScoreDetailModal = ({ isOpen, onClose, title, scores, onSave }) => {
    const [localScores, setLocalScores] = useState([]);
    useEffect(() => { if (Array.isArray(scores)) { setLocalScores([...scores]); } else if (scores) { setLocalScores([scores]); } else { setLocalScores([]); } }, [scores, isOpen]);
    const addScore = () => setLocalScores([...localScores, '']);
    const updateScore = (idx, val) => { const newScores = [...localScores]; newScores[idx] = val; setLocalScores(newScores); };
    const removeScore = (idx) => { const newScores = localScores.filter((_, i) => i !== idx); setLocalScores(newScores); };
    if (!isOpen) return null;
    const average = calculateAverage(localScores);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in backdrop-blur-sm overflow-y-auto"><div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden my-auto"><div className="bg-blue-600 p-4 flex justify-between items-center text-white"><h3 className="font-bold text-lg">{title}</h3><button onClick={onClose} className="hover:bg-blue-700 p-1 rounded"><X size={20}/></button></div><div className="p-6 max-h-[60vh] overflow-y-auto"><div className="flex justify-between items-center mb-4"><span className="text-slate-500 text-sm">Daftar Nilai Masuk</span><span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Rata-rata: {average}</span></div><div className="space-y-3">{localScores.map((score, idx) => (<div key={idx} className="flex gap-2 items-center"><span className="text-slate-400 w-6 text-sm font-mono">{idx + 1}.</span><input type="number" className="flex-1 border p-2 rounded outline-none" placeholder="0-100" value={score} onChange={(e) => updateScore(idx, e.target.value)} autoFocus={idx === localScores.length - 1}/><button onClick={() => removeScore(idx)} className="text-red-400 hover:text-red-600"><XCircle size={20}/></button></div>))}</div><button onClick={addScore} className="mt-4 w-full py-2 border-2 border-dashed border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 flex justify-center items-center gap-2 font-medium"><Plus size={16}/> Tambah Nilai</button></div><div className="p-4 border-t bg-slate-50 flex justify-end gap-2"><button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg">Batal</button><button onClick={() => onSave(localScores)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold">Simpan Nilai</button></div></div></div>
    );
};

// --- INPUT NILAI (FIX: BLANK SCREEN) ---
const InputNilai = ({ students, subjects, grades, saveGrade, deleteGrade, schoolProfile }) => {
  const availableClasses = useMemo(() => { const uniqueClasses = [...new Set(students.map(s => s.kelas))]; return uniqueClasses.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })); }, [students]);
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedMapel, setSelectedMapel] = useState(subjects[0]?.id || '');
  const [editingGrade, setEditingGrade] = useState({});
  const [modalConfig, setModalConfig] = useState({ isOpen: false, studentId: null, type: '', currentScores: [] });

  useEffect(() => { if (!selectedKelas && availableClasses.length > 0) setSelectedKelas(availableClasses[0]); }, [availableClasses]);
  useEffect(() => { if (!selectedMapel && subjects.length > 0) setSelectedMapel(subjects[0].id); }, [subjects]);

  // Safe check for mapel
  const filteredStudents = students.filter(s => s.kelas === selectedKelas);
  const currentMapelData = subjects.find(s => s.id === selectedMapel);
  const kkm = currentMapelData?.kkm || 75;

  // Safe check for schoolProfile to prevent blank screen
  const schoolName = schoolProfile?.nama || "NAMA SEKOLAH";
  const schoolAddress = schoolProfile?.alamat || "Alamat Sekolah";

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
  const handleModalSave = (newScores) => { const cleanedScores = newScores.filter(s => s !== ''); setEditingGrade(prev => ({ ...prev, [modalConfig.studentId]: { ...prev[modalConfig.studentId], [modalConfig.type]: cleanedScores } })); setModalConfig({ ...modalConfig, isOpen: false }); };
  const handleSaveToDB = async (studentId) => { const gradeData = getStudentGrade(studentId); await saveGrade({ studentId, subjectId: selectedMapel, harian: gradeData.harian, tugas: gradeData.tugas, uts: gradeData.uts, uas: gradeData.uas, kelas: selectedKelas }, gradeData.dbId); const newEditing = {...editingGrade}; delete newEditing[studentId]; setEditingGrade(newEditing); alert("Nilai berhasil disimpan!"); };
  const exportToCSV = () => { if (filteredStudents.length === 0) return alert("Tidak ada data siswa."); let csv = `Rekap Nilai ${currentMapelData?.nama || 'Mapel'} - Kelas ${selectedKelas}\nNo,Nama,NISN,Harian,Tugas,UTS,UAS,Akhir\n`; filteredStudents.forEach((s, i) => { const g = getStudentGrade(s.id); const h = calculateAverage(g.harian); const t = calculateAverage(g.tugas); const f = ((parseFloat(h)+parseFloat(t)+parseFloat(g.uts||0)+parseFloat(g.uas||0))/4).toFixed(2); csv += `${i+1},"${s.nama}","${s.nisn}",${h},${t},${g.uts},${g.uas},${f}\n`; }); const link = document.createElement("a"); link.setAttribute("href", encodeURI("data:text/csv;charset=utf-8,"+csv)); link.setAttribute("download", `Rekap_${selectedKelas}.csv`); document.body.appendChild(link); link.click(); };

  return (
    <div className="space-y-6">
      <ScoreDetailModal isOpen={modalConfig.isOpen} onClose={() => setModalConfig({...modalConfig, isOpen: false})} title={`Input ${modalConfig.type === 'harian' ? 'Nilai Harian' : 'Nilai Tugas'} - ${modalConfig.studentName}`} scores={modalConfig.currentScores} onSave={handleModalSave} />
      <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-end md:items-center no-print"><div className="flex flex-col md:flex-row gap-4 w-full md:w-auto"><div className="flex flex-col gap-1 w-full md:w-48"><label className="text-xs font-bold text-slate-500 uppercase">Kelas</label><select value={selectedKelas} onChange={e => setSelectedKelas(e.target.value)} className="border p-2 rounded-lg bg-slate-50 outline-none w-full">{availableClasses.length > 0 ? availableClasses.map(k => <option key={k} value={k}>{k}</option>) : <option>Belum ada kelas</option>}</select></div><div className="flex flex-col gap-1 w-full md:w-48"><label className="text-xs font-bold text-slate-500 uppercase">Mapel</label><select value={selectedMapel} onChange={e => setSelectedMapel(e.target.value)} className="border p-2 rounded-lg bg-slate-50 outline-none w-full">{subjects.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}</select></div></div><div className="flex gap-2 w-full md:w-auto"><button onClick={exportToCSV} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"><Download size={16} /> Excel</button><button onClick={() => window.print()} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900 text-sm font-medium"><Printer size={16} /> PDF</button></div></div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden print-area">
        <div className="hidden print-header p-8 text-center border-b-2 border-black mb-4"><h1 className="text-2xl font-bold uppercase">{schoolName}</h1><p>{schoolAddress}</p><hr className="my-4 border-black"/><h2 className="text-xl font-bold underline mb-4">REKAP NILAI SISWA</h2><div className="flex justify-between text-sm mb-4"><p>Kelas: {selectedKelas}</p><p>Mapel: {currentMapelData?.nama || '-'}</p><p>TA: {new Date().getFullYear()}</p></div></div>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b"><tr><th className="p-4 w-10">No</th><th className="p-4 min-w-[150px]">Nama Siswa</th><th className="p-4 w-28 text-center">Harian</th><th className="p-4 w-28 text-center">Tugas</th><th className="p-4 w-20 text-center">UTS</th><th className="p-4 w-20 text-center">UAS</th><th className="p-4 w-20 text-center">Akhir</th><th className="p-4 w-20 text-center no-print">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredStudents.map((s, idx) => { const g = getStudentGrade(s.id); const avgH = calculateAverage(g.harian); const avgT = calculateAverage(g.tugas); const final = ((parseFloat(avgH) + parseFloat(avgT) + parseFloat(g.uts||0) + parseFloat(g.uas||0))/4).toFixed(2); const isPassed = parseFloat(final) >= kkm; const unsaved = editingGrade[s.id]; return (<tr key={s.id} className={`transition-colors ${unsaved ? 'bg-yellow-50' : 'hover:bg-slate-50'}`}><td className="p-4 text-center text-slate-500">{idx + 1}</td><td className="p-4"><div className="font-medium text-slate-800">{s.nama}</div><div className="text-xs text-slate-400">{s.nisn}</div></td><td className="p-4 text-center"><div onClick={() => openDetailModal(s.id, 'harian', g.harian, s.nama)} className="border rounded p-2 cursor-pointer hover:bg-blue-50 flex justify-between items-center no-print-border"><span className="font-bold text-slate-700">{avgH}</span><Calculator size={14} className="text-blue-400"/></div><span className="hidden print-only">{avgH}</span></td><td className="p-4 text-center"><div onClick={() => openDetailModal(s.id, 'tugas', g.tugas, s.nama)} className="border rounded p-2 cursor-pointer hover:bg-blue-50 flex justify-between items-center no-print-border"><span className="font-bold text-slate-700">{avgT}</span><Calculator size={14} className="text-blue-400"/></div><span className="hidden print-only">{avgT}</span></td><td className="p-4 text-center"><input type="number" className="w-16 p-1 border rounded text-center outline-none no-print-border" value={g.uts} onChange={e => handleSimpleChange(s.id, 'uts', e.target.value)} placeholder="0"/><span className="hidden print-only">{g.uts}</span></td><td className="p-4 text-center"><input type="number" className="w-16 p-1 border rounded text-center outline-none no-print-border" value={g.uas} onChange={e => handleSimpleChange(s.id, 'uas', e.target.value)} placeholder="0"/><span className="hidden print-only">{g.uas}</span></td><td className="p-4 text-center"><span className={`font-bold px-2 py-1 rounded ${isPassed ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>{final}</span></td><td className="p-4 text-center no-print"><button onClick={() => handleSaveToDB(s.id)} className={`p-2 rounded-lg transition-colors ${unsaved ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md animate-pulse' : 'text-blue-600 bg-blue-50 hover:bg-blue-100'}`}><Save size={18} /></button></td></tr>); })} {filteredStudents.length === 0 && (<tr><td colSpan="8" className="p-8 text-center text-slate-400">Tidak ada siswa</td></tr>)}</tbody></table></div>
      </div>
    </div>
  );
};

// --- PROFIL SEKOLAH (FIX: KOLOM LENGKAP) ---
const ProfilSekolah = ({ profile, saveProfile }) => {
    const [formData, setFormData] = useState({ 
        nama: '', alamat: '', kepsek: '', nip: '', email: '', website: '', telepon: '', ...profile 
    });
    
    useEffect(() => { setFormData({ ...formData, ...profile }); }, [profile]);

    const handleSubmit = (e) => { 
        e.preventDefault(); 
        saveProfile(formData); 
        alert("Profil Sekolah Berhasil Disimpan!"); 
    };

    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><School className="text-blue-600"/> Edit Profil Sekolah</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Sekolah</label>
                <input value={formData.nama} onChange={e=>setFormData({...formData, nama:e.target.value})} className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contoh: SDN 01 Pagi"/>
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Lengkap</label>
                <textarea value={formData.alamat} onChange={e=>setFormData({...formData, alamat:e.target.value})} className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Jl. Raya No. 123..." rows="3"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Kepala Sekolah</label>
                <input value={formData.kepsek} onChange={e=>setFormData({...formData, kepsek:e.target.value})} className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Budi Santoso, M.Pd"/>
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">NIP Kepala Sekolah</label>
                <input value={formData.nip} onChange={e=>setFormData({...formData, nip:e.target.value})} className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="19800101 200501 1 001"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Telepon</label>
                <input value={formData.telepon} onChange={e=>setFormData({...formData, telepon:e.target.value})} className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="021-1234567"/>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Sekolah</label>
                <input value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="info@sekolah.sch.id"/>
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Website Sekolah</label>
                <input value={formData.website} onChange={e=>setFormData({...formData, website:e.target.value})} className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="www.sekolah.sch.id"/>
            </div>
            <div className="md:col-span-2 pt-4">
                <button type="submit" className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg">Simpan Perubahan</button>
            </div>
        </form>
      </div>
    );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [schoolProfile, setSchoolProfile] = useState({ nama: '', alamat: '', kepsek: '', telepon: '', email: '', website: '' });

  useEffect(() => { const unsubscribe = onAuthStateChanged(auth, async (currentUser) => { setUser(currentUser); if (currentUser) { try { const userRef = doc(db, 'users', currentUser.uid, 'settings', 'profile'); const docSnap = await getDoc(userRef); if (docSnap.exists()) { const data = docSnap.data(); setIsPremium(data.isPremium === true); if (!data.phoneNumber) { setNeedsSetup(true); } else { setNeedsSetup(false); } } else { setIsPremium(false); setNeedsSetup(true); } } catch (e) { console.log("Error checking user status", e); } } setLoading(false); }); return () => unsubscribe(); }, []);
  useEffect(() => { if (!user || needsSetup) return; const studentsRef = collection(db, 'users', user.uid, 'students'); const subjectsRef = collection(db, 'users', user.uid, 'subjects'); const gradesRef = collection(db, 'users', user.uid, 'grades'); const profileRef = collection(db, 'users', user.uid, 'schoolProfile'); const unsubStudents = onSnapshot(query(studentsRef, orderBy('nama')), (snap) => setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })))); const unsubSubjects = onSnapshot(query(subjectsRef, orderBy('nama')), (snap) => setSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() })))); const unsubGrades = onSnapshot(gradesRef, (snap) => setGrades(snap.docs.map(d => ({ id: d.id, ...d.data() })))); const unsubProfile = onSnapshot(profileRef, (snap) => { if(!snap.empty) setSchoolProfile(snap.docs[0].data()); }); return () => { unsubStudents(); unsubSubjects(); unsubGrades(); unsubProfile(); }; }, [user, needsSetup]);
  
  // Data Saving
  const addStudent = async (data) => user && await addDoc(collection(db, 'users', user.uid, 'students'), { ...data, createdAt: serverTimestamp() });
  const updateStudent = async (id, data) => user && await updateDoc(doc(db, 'users', user.uid, 'students', id), data); 
  const deleteStudent = async (id) => user && await deleteDoc(doc(db, 'users', user.uid, 'students', id));
  const addSubject = async (data) => user && await addDoc(collection(db, 'users', user.uid, 'subjects'), data);
  const updateSubject = async (id, data) => user && await updateDoc(doc(db, 'users', user.uid, 'subjects', id), data); 
  const deleteSubject = async (id) => user && await deleteDoc(doc(db, 'users', user.uid, 'subjects', id));
  const saveGrade = async (data, gradeId) => { if(user) gradeId ? await updateDoc(doc(db, 'users', user.uid, 'grades', gradeId), data) : await addDoc(collection(db, 'users', user.uid, 'grades'), data); };
  const saveProfile = async (data) => user && await setDoc(doc(db, 'users', user.uid, 'schoolProfile', 'main'), data); 
  const handleLogout = async () => { await signOut(auth); };

  const menuItems = [ { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, premium: false }, { id: 'sekolah', label: 'Profil Sekolah', icon: School, premium: false }, { id: 'siswa', label: 'Data Siswa', icon: Users, premium: false }, { id: 'mapel', label: 'Mata Pelajaran', icon: BookOpen, premium: false }, { id: 'nilai', label: 'Input Nilai', icon: Pencil, premium: true } ];
  const handleMenuClick = (item) => { if (item.premium && !isPremium) { setShowUpgradeModal(true); } else { setActiveTab(item.id); setIsMobileMenuOpen(false); } };
  
  if (loading) return <div className="h-screen flex items-center justify-center text-blue-600">Memuat...</div>;
  if (!user) return <LoginScreen />;
  if (needsSetup) return <SetupProfileModal user={user} onComplete={() => setNeedsSetup(false)} />;

  const renderContent = () => { switch (activeTab) { case 'dashboard': return <Dashboard user={user} students={students} subjects={subjects} grades={grades} isPremium={isPremium} onShowUpgrade={()=>setShowUpgradeModal(true)} />; case 'siswa': return <DataSiswa students={students} addStudent={addStudent} updateStudent={updateStudent} deleteStudent={deleteStudent} user={user} />; case 'mapel': return <MataPelajaran subjects={subjects} addSubject={addSubject} updateSubject={updateSubject} deleteSubject={deleteSubject} />; 
      // FIX HERE: Pass schoolProfile prop to InputNilai
      case 'nilai': return <InputNilai students={students} subjects={subjects} grades={grades} saveGrade={saveGrade} deleteGrade={()=>{}} schoolProfile={schoolProfile} />; 
      case 'sekolah': return <ProfilSekolah profile={schoolProfile} saveProfile={saveProfile} />; default: return <div className="p-8 text-center text-slate-500">Fitur ini hanya tersedia untuk member Premium.</div>; } };

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900 overflow-hidden">
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} userEmail={user.email} />
      
      {/* Mobile Sidebar Overlay (Backdrop) */}
      {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}
      
      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside className={`fixed md:relative inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Header Sidebar */}
        <div className="p-6 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm"><GraduationCap size={24} /></div>
                <div><h1 className="font-bold text-xl text-slate-800 tracking-tight">NILAIKU</h1><p className="text-xs text-slate-400 font-medium">Versi 2.4 (Final)</p></div>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-1 rounded-full hover:bg-slate-100 text-slate-400"><ChevronLeft size={24} /></button>
        </div>
        
        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <p className="text-xs font-bold text-slate-400 px-4 mb-2 mt-2 uppercase tracking-wider">Menu Utama</p>
            {menuItems.map((item) => {
                const isLocked = item.premium && !isPremium;
                const isActive = activeTab === item.id;
                return (
                    <button key={item.id} onClick={() => handleMenuClick(item)} className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100' : 'text-slate-600 hover:bg-slate-50'}`}>
                        <div className="flex items-center gap-3">
                            <item.icon size={20} className={`${isActive ? "text-blue-600" : isLocked ? "text-slate-400" : "text-slate-500"}`} />
                            <span className={`font-medium ${isActive ? "text-blue-700" : isLocked ? "text-slate-400" : "text-slate-600"}`}>{item.label}</span>
                        </div>
                        {isLocked ? (<Lock size={16} className="text-slate-300" />) : isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>}
                    </button>
                )
            })}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            {!isPremium && (
                <div onClick={() => setShowUpgradeModal(true)} className="mb-3 bg-gradient-to-r from-orange-400 to-pink-500 p-4 rounded-xl text-white cursor-pointer hover:shadow-lg transition-all relative overflow-hidden group">
                    <div className="relative z-10">
                        <h4 className="font-bold text-sm flex items-center gap-2"><Crown size={16} className="text-yellow-200"/> Upgrade Pro</h4>
                        <p className="text-xs mt-1 opacity-90 group-hover:underline">Buka semua fitur!</p>
                    </div>
                    <Star className="absolute -right-3 -bottom-3 text-white opacity-20 w-20 h-20 rotate-12 group-hover:rotate-45 transition-transform duration-500" />
                </div>
            )}
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-bold text-sm border border-transparent hover:border-red-100 mb-2">
                <LogOut size={18}/> Keluar Aplikasi
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative h-full w-full bg-slate-50">
        <div className="md:hidden bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-30">
            <div className="flex items-center gap-2 font-bold text-slate-800"><div className="bg-blue-600 text-white p-1.5 rounded-lg"><GraduationCap size={18} /></div>NILAIKU</div>
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100"><Menu /></button>
        </div>
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-2"><div><h2 className="text-2xl font-bold text-slate-900 capitalize">{activeTab.replace('-', ' ')}</h2><p className="text-slate-500 text-sm hidden md:block">Kelola data akademik sekolah Anda dengan mudah.</p></div></div>
             {renderContent()}
        </div>
      </main>
    </div>
  );
}
