import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, BookOpen, School, FileText, LayoutDashboard, 
  Plus, Save, Trash, Pencil, Download, Printer, Search,
  Menu, X, ChevronRight, GraduationCap, Calculator, XCircle, LogOut, Lock, Mail, Upload,
  Star, CheckCircle, Crown, ArrowLeft, Copy, Smile, CreditCard
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, updateDoc, setDoc, getDoc, 
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
// Removed 'import * as XLSX from 'xlsx';' to fix build error. We will load it via CDN.

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

// --- COMPONENT: SETUP PROFILE MODAL (WAJIB ISI WA) ---
const SetupProfileModal = ({ user, onComplete }) => {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!phone || phone.length < 10) {
            alert("Mohon masukkan nomor WhatsApp yang valid.");
            return;
        }
        setLoading(true);
        try {
            await setDoc(doc(db, 'users', user.uid, 'settings', 'profile'), {
                phoneNumber: phone,
                email: user.email,
                displayName: user.displayName || '',
                isPremium: false, // Default Free
                updatedAt: serverTimestamp()
            }, { merge: true });
            onComplete();
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Gagal menyimpan data. Silakan coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 animate-fade-in backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center relative overflow-hidden">
                <div className="mx-auto bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                    <div className="bg-black text-green-400 rounded-full p-2"><Smile size={32} /></div>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Satu Langkah Lagi!</h2>
                <p className="text-slate-500 mb-8 text-sm leading-relaxed">Untuk pengalaman terbaik, harap lengkapi profil Anda dengan nomor HP yang aktif.</p>
                <div className="text-left mb-8">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nomor HP (WhatsApp)</label>
                    <input type="tel" placeholder="Contoh: 081234567890" className="w-full border border-slate-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-green-500 transition-all" value={phone} onChange={e => setPhone(e.target.value)} autoFocus />
                    <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1"><CheckCircle size={10} /> Notifikasi aktivasi akun akan dikirim ke nomor ini.</p>
                </div>
                <button onClick={handleSave} disabled={loading} className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg disabled:opacity-70">{loading ? 'Menyimpan...' : 'Simpan & Lanjutkan'}</button>
            </div>
        </div>
    );
};

// --- COMPONENT: UPGRADE MODAL (ALUR PEMBAYARAN STEP-BY-STEP) ---
const UpgradeModal = ({ isOpen, onClose, userEmail }) => {
    const [step, setStep] = useState(1); // 1: Pilih Paket, 2: Info Pembayaran
    const [selectedPlan, setSelectedPlan] = useState(null);

    useEffect(() => { if(!isOpen) setStep(1); }, [isOpen]);

    if (!isOpen) return null;

    // DATA REKENING ADMIN
    const BANK_ACCOUNTS = [
        { bank: 'BCA', number: '0461416518', name: 'ARDIKA YUDHA GUNANTARA' },
        { bank: 'MANDIRI', number: '1550011606632', name: 'ARDIKA YUDHA GUNANTARA' },
    ];
    const ADMIN_WA = "6281234567890"; 

    const handleSelectPlan = (planName, price) => {
        setSelectedPlan({ name: planName, price });
        setStep(2);
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        alert(`Disalin: ${text}`);
    };

    const handleConfirmWA = () => {
        const text = `Halo Admin NILAIKU, saya sudah transfer pembayaran.\n\n` +
                     `📧 Email Akun: ${userEmail}\n` +
                     `📦 Paket: ${selectedPlan.name}\n` +
                     `💰 Nominal: ${selectedPlan.price}\n\n` +
                     `Mohon segera diproses aktivasinya. Terima kasih!`;
        const url = `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-fade-in backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden relative my-auto flex flex-col md:flex-row min-h-[550px]">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors z-20"><X size={20} className="text-slate-500" /></button>
                
                {/* SISI KIRI: BANNER */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white md:w-2/5 flex flex-col justify-between">
                    <div>
                        <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4"><Crown size={28} className="text-yellow-300" /></div>
                        <h2 className="text-2xl font-bold mb-2">NILAIKU Premium</h2>
                        <p className="opacity-90 mb-6 text-sm leading-relaxed">Fitur "Input Nilai" terkunci untuk user Free. Upgrade sekarang untuk akses penuh.</p>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-300"/> <span>Buka Gembok Input Nilai</span></li>
                            <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-300"/> <span>Hitung Rata-rata Otomatis</span></li>
                            <li className="flex items-center gap-2"><CheckCircle size={16} className="text-green-300"/> <span>Export Excel & PDF</span></li>
                        </ul>
                    </div>
                    <p className="text-xs opacity-60 mt-8">© 2025 NILAIKU</p>
                </div>

                {/* SISI KANAN: KONTEN DINAMIS */}
                <div className="p-6 md:p-8 md:w-3/5 bg-slate-50 flex flex-col">
                    
                    {/* STEP 1: PILIH PAKET */}
                    {step === 1 && (
                        <div className="animate-fade-in flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-slate-800 mb-1 text-center">Pilih Paket Terbaik</h3>
                            <p className="text-slate-500 text-center text-sm mb-6">Investasi hemat untuk administrasi yang rapi.</p>
                            
                            <div className="space-y-4 flex-1">
                                <div onClick={() => handleSelectPlan('Paket Semester', 'Rp 49.000')} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-500 cursor-pointer transition-all hover:shadow-md group relative">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="font-bold text-slate-700">Paket Semester</h4>
                                        <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">Populer</span>
                                    </div>
                                    <div className="flex items-end gap-1"><span className="text-2xl font-bold text-blue-600">Rp 49.000</span><span className="text-xs text-slate-400 mb-1">/ 6 bulan</span></div>
                                    <p className="text-xs text-slate-400 mt-2">Akses penuh selama satu semester.</p>
                                </div>

                                <div onClick={() => handleSelectPlan('Paket Tahunan', 'Rp 79.000')} className="bg-white border-2 border-green-500 rounded-xl p-4 cursor-pointer relative shadow-sm hover:shadow-md transition-all">
                                    <div className="absolute -top-3 right-4 bg-green-500 text-white text-[10px] px-3 py-0.5 rounded-full font-bold uppercase tracking-wider">Hemat 50%</div>
                                    <div className="flex justify-between items-center mb-1"><h4 className="font-bold text-slate-800">Paket Tahunan</h4></div>
                                    <div className="flex items-end gap-1"><span className="text-2xl font-bold text-green-600">Rp 79.000</span><span className="text-xs text-slate-400 mb-1">/ tahun</span></div>
                                    <p className="text-xs text-slate-500 mt-2">Paling hemat! Solusi jangka panjang.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: INFO REKENING & KONFIRMASI */}
                    {step === 2 && (
                        <div className="animate-fade-in h-full flex flex-col">
                            <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-4"><ArrowLeft size={16}/> Kembali</button>
                            
                            <div className="text-center mb-6">
                                <h3 className="font-bold text-slate-800">Selesaikan Pembayaran</h3>
                                <p className="text-sm text-slate-500">Silakan transfer sejumlah:</p>
                                <div className="bg-green-100 text-green-800 font-bold text-2xl py-3 rounded-lg mt-2 border border-green-200 cursor-pointer hover:bg-green-200 transition-colors" onClick={() => handleCopy(selectedPlan.price)}>
                                    {selectedPlan.price}
                                </div>
                            </div>

                            <div className="space-y-3 overflow-y-auto max-h-[180px] pr-1 custom-scrollbar mb-4">
                                {BANK_ACCOUNTS.map((bank, idx) => (
                                    <div key={idx} className="bg-white border p-3 rounded-lg flex justify-between items-center">
                                        <div><p className="font-bold text-slate-700 text-sm">{bank.bank}</p><p className="text-xs text-slate-400">{bank.name}</p></div>
                                        <div className="text-right"><p className="font-mono font-bold text-slate-600">{bank.number}</p><button onClick={() => handleCopy(bank.number)} className="text-[10px] text-blue-600 hover:underline flex items-center justify-end gap-1"><Copy size={10}/> Salin</button></div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto">
                                <button onClick={handleConfirmWA} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg flex items-center justify-center gap-2">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" className="w-5 h-5" alt="WA"/> Konfirmasi Pembayaran
                                </button>
                                <p className="text-[10px] text-center text-slate-400 mt-2">Bukti transfer akan dikirim ke WhatsApp Admin</p>
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
      catch (err) { console.error(err); setError("Gagal login Google. Periksa koneksi atau konfigurasi Firebase."); } 
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4"><div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Users size={24} /></div><div><p className="text-xs text-slate-500 uppercase font-bold">Total Siswa</p><h3 className="text-2xl font-bold text-slate-800">{totalSiswa}</h3></div></div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4"><div className="p-3 bg-green-100 text-green-600 rounded-lg"><BookOpen size={24} /></div><div><p className="text-xs text-slate-500 uppercase font-bold">Mata Pelajaran</p><h3 className="text-2xl font-bold text-slate-800">{totalMapel}</h3></div></div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4"><div className="p-3 bg-orange-100 text-orange-600 rounded-lg"><FileText size={24} /></div><div><p className="text-xs text-slate-500 uppercase font-bold">Nilai Masuk</p><h3 className="text-2xl font-bold text-slate-800">{totalNilai}</h3></div></div>
      </div>
    </div>
  );
};

// --- DATA SISWA ---
const DataSiswa = ({ students, addStudent, deleteStudent }) => {
  const [formData, setFormData] = useState({ nama: '', nisn: '', kelas: '', gender: 'L' });
  const [searchTerm, setSearchTerm] = useState('');
  const handleSubmit = (e) => { e.preventDefault(); addStudent(formData); setFormData({ nama: '', nisn: '', kelas: '', gender: 'L' }); };
  
  const handleFileUpload = (e) => {
    // --- UPDATED: Use window.XLSX instead of import ---
    const XLSX = window.XLSX;
    if (!XLSX) { alert("⚠️ Library Excel sedang dimuat. Mohon tunggu sebentar lalu coba lagi."); return; }
    
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
        try {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(ws);
            let count = 0;
            data.forEach(row => { if(row.Nama && row.Kelas) { addStudent({ nama: row.Nama, nisn: row.NISN || '-', kelas: row.Kelas.toString(), gender: row.Gender || 'L' }); count++; } });
            alert(`Berhasil mengimpor ${count} siswa!`);
        } catch (error) { console.error("Excel Error:", error); alert("Gagal membaca file Excel."); }
    };
    reader.readAsBinaryString(file);
  };

  const filteredStudents = students.filter(s => s.nama.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6"><h3 className="font-bold text-lg text-slate-800">Tambah Siswa Baru</h3><div className="relative w-full md:w-auto"><input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" id="excel-upload" /><label htmlFor="excel-upload" className="cursor-pointer flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors w-full md:w-auto"><Upload size={16}/> Import Excel</label></div></div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input placeholder="Nama Lengkap" value={formData.nama} onChange={e=>setFormData({...formData, nama:e.target.value})} className="border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2 w-full" required/>
            <input placeholder="NISN" value={formData.nisn} onChange={e=>setFormData({...formData, nisn:e.target.value})} className="border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 w-full" required/>
            <input placeholder="Kelas (misal: 1A)" value={formData.kelas} onChange={e=>setFormData({...formData, kelas:e.target.value})} className="border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 w-full" required/>
            <button type="submit" className="bg-blue-600 text-white p-2.5 rounded-lg flex justify-center items-center gap-2 hover:bg-blue-700 font-medium transition-colors w-full"><Plus size={18}/> Tambah</button>
        </form>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50"><h3 className="font-bold text-slate-800">Daftar Siswa ({filteredStudents.length})</h3><div className="relative w-full md:w-64"><Search className="absolute left-3 top-2.5 text-slate-400" size={18} /><input placeholder="Cari nama siswa..." className="pl-10 pr-4 py-2 border rounded-lg text-sm outline-none focus:border-blue-500 w-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div></div>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600 uppercase font-semibold"><tr><th className="p-4 whitespace-nowrap">Nama Siswa</th><th className="p-4 whitespace-nowrap">NISN</th><th className="p-4 whitespace-nowrap">Kelas</th><th className="p-4 text-center whitespace-nowrap">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredStudents.map(s => (<tr key={s.id} className="hover:bg-slate-50 transition-colors"><td className="p-4 font-medium text-slate-800 min-w-[150px]">{s.nama}</td><td className="p-4 text-slate-500">{s.nisn}</td><td className="p-4"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">{s.kelas}</span></td><td className="p-4 text-center"><button onClick={()=>deleteStudent(s.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"><Trash size={18}/></button></td></tr>))}</tbody></table></div>
      </div>
    </div>
  );
};

// --- MATA PELAJARAN ---
const MataPelajaran = ({ subjects, addSubject, deleteSubject }) => {
    const [newMapel, setNewMapel] = useState('');
    const handleSubmit = (e) => { e.preventDefault(); addSubject({ nama: newMapel, kkm: 75 }); setNewMapel(''); };
    return (
        <div className="space-y-6">
            <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-slate-100"><h3 className="font-bold text-lg mb-4 text-slate-800">Tambah Mapel</h3><form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4"><input value={newMapel} onChange={e=>setNewMapel(e.target.value)} placeholder="Nama Mata Pelajaran" className="border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 flex-1" required/><button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium">Simpan</button></form></div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600 uppercase font-semibold"><tr><th className="p-4">Mapel</th><th className="p-4">KKM</th><th className="p-4 text-right">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100">{subjects.map(s => <tr key={s.id} className="hover:bg-slate-50"><td className="p-4 font-medium">{s.nama}</td><td className="p-4"><span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">{s.kkm}</span></td><td className="p-4 text-right"><button onClick={()=>deleteSubject(s.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full"><Trash size={18}/></button></td></tr>)}</tbody></table></div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in backdrop-blur-sm overflow-y-auto z-[70]">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden my-auto">
                <div className="bg-blue-600 p-4 flex justify-between items-center text-white"><h3 className="font-bold text-lg">{title}</h3><button onClick={onClose} className="hover:bg-blue-700 p-1 rounded"><X size={20}/></button></div>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4"><span className="text-slate-500 text-sm">Daftar Nilai Masuk</span><span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Rata-rata: {average}</span></div>
                    <div className="space-y-3">{localScores.map((score, idx) => (<div key={idx} className="flex gap-2 items-center"><span className="text-slate-400 w-6 text-sm font-mono">{idx + 1}.</span><input type="number" className="flex-1 border p-2 rounded outline-none" placeholder="0-100" value={score} onChange={(e) => updateScore(idx, e.target.value)} autoFocus={idx === localScores.length - 1}/><button onClick={() => removeScore(idx)} className="text-red-400 hover:text-red-600"><XCircle size={20}/></button></div>))}</div>
                    <button onClick={addScore} className="mt-4 w-full py-2 border-2 border-dashed border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 flex justify-center items-center gap-2 font-medium"><Plus size={16}/> Tambah Nilai</button>
                </div>
                <div className="p-4 border-t bg-slate-50 flex justify-end gap-2"><button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg">Batal</button><button onClick={() => onSave(localScores)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold">Simpan Nilai</button></div>
            </div>
        </div>
    );
};

// --- INPUT NILAI ---
const InputNilai = ({ students, subjects, grades, saveGrade, deleteGrade, schoolProfile }) => {
  const availableClasses = useMemo(() => { const uniqueClasses = [...new Set(students.map(s => s.kelas))]; return uniqueClasses.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })); }, [students]);
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedMapel, setSelectedMapel] = useState(subjects[0]?.id || '');
  const [editingGrade, setEditingGrade] = useState({});
  const [modalConfig, setModalConfig] = useState({ isOpen: false, studentId: null, type: '', currentScores: [] });

  useEffect(() => { if (!selectedKelas && availableClasses.length > 0) setSelectedKelas(availableClasses[0]); }, [availableClasses]);
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
  const handleModalSave = (newScores) => { const cleanedScores = newScores.filter(s => s !== ''); setEditingGrade(prev => ({ ...prev, [modalConfig.studentId]: { ...prev[modalConfig.studentId], [modalConfig.type]: cleanedScores } })); setModalConfig({ ...modalConfig, isOpen: false }); };
  const handleSaveToDB = async (studentId) => { const gradeData = getStudentGrade(studentId); await saveGrade({ studentId, subjectId: selectedMapel, harian: gradeData.harian, tugas: gradeData.tugas, uts: gradeData.uts, uas: gradeData.uas, kelas: selectedKelas }, gradeData.dbId); const newEditing = {...editingGrade}; delete newEditing[studentId]; setEditingGrade(newEditing); alert("Nilai berhasil disimpan!"); };
  
  const exportToCSV = () => {
    if (filteredStudents.length === 0) return alert("Tidak ada data siswa.");
    let csv = `Rekap Nilai ${currentMapelData?.nama} - Kelas ${selectedKelas}\nNo,Nama,NISN,Harian,Tugas,UTS,UAS,Akhir\n`;
    filteredStudents.forEach((s, i) => { const g = getStudentGrade(s.id); const h = calculateAverage(g.harian); const t = calculateAverage(g.tugas); const f = ((parseFloat(h)+parseFloat(t)+parseFloat(g.uts||0)+parseFloat(g.uas||0))/4).toFixed(2); csv += `${i+1},"${s.nama}","${s.nisn}",${h},${t},${g.uts},${g.uas},${f}\n`; });
    const link = document.createElement("a"); link.setAttribute("href", encodeURI("data:text/csv;charset=utf-8,"+csv)); link.setAttribute("download", `Rekap_${selectedKelas}.csv`); document.body.appendChild(link); link.click();
  };

  return (
    <div className="space-y-6">
      <ScoreDetailModal isOpen={modalConfig.isOpen} onClose={() => setModalConfig({...modalConfig, isOpen: false})} title={`Input ${modalConfig.type === 'harian' ? 'Nilai Harian' : 'Nilai Tugas'} - ${modalConfig.studentName}`} scores={modalConfig.currentScores} onSave={handleModalSave} />
      <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-end md:items-center no-print">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="flex flex-col gap-1 w-full md:w-48"><label className="text-xs font-bold text-slate-500 uppercase">Kelas</label><select value={selectedKelas} onChange={e => setSelectedKelas(e.target.value)} className="border p-2 rounded-lg bg-slate-50 outline-none w-full">{availableClasses.length > 0 ? availableClasses.map(k => <option key={k} value={k}>{k}</option>) : <option>Belum ada kelas</option>}</select></div>
          <div className="flex flex-col gap-1 w-full md:w-48"><label className="text-xs font-bold text-slate-500 uppercase">Mapel</label><select value={selectedMapel} onChange={e => setSelectedMapel(e.target.value)} className="border p-2 rounded-lg bg-slate-50 outline-none w-full">{subjects.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}</select></div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <button onClick={exportToCSV} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"><Download size={16} /> Excel</button>
           <button onClick={() => window.print()} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900 text-sm font-medium"><Printer size={16} /> PDF</button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden print-area">
        <div className="hidden print-header p-8 text-center border-b-2 border-black mb-4"><h1 className="text-2xl font-bold uppercase">{schoolProfile.nama}</h1><p>{schoolProfile.alamat}</p><hr className="my-4 border-black"/><h2 className="text-xl font-bold underline mb-4">REKAP NILAI SISWA</h2><div className="flex justify-between text-sm mb-4"><p>Kelas: {selectedKelas}</p><p>Mapel: {currentMapelData?.nama}</p><p>TA: {new Date().getFullYear()}</p></div></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b">
              <tr><th className="p-4 w-10">No</th><th className="p-4 min-w-[150px]">Nama Siswa</th><th className="p-4 w-28 text-center">Harian</th><th className="p-4 w-28 text-center">Tugas</th><th className="p-4 w-20 text-center">UTS</th><th className="p-4 w-20 text-center">UAS</th><th className="p-4 w-20 text-center">Akhir</th><th className="p-4 w-20 text-center no-print">Aksi</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s, idx) => {
                const g = getStudentGrade(s.id);
                const avgH = calculateAverage(g.harian); const avgT = calculateAverage(g.tugas);
                const final = ((parseFloat(avgH) + parseFloat(avgT) + parseFloat(g.uts||0) + parseFloat(g.uas||0))/4).toFixed(2);
                const isPassed = parseFloat(final) >= kkm; const unsaved = editingGrade[s.id];
                return (
                  <tr key={s.id} className={`transition-colors ${unsaved ? 'bg-yellow-50' : 'hover:bg-slate-50'}`}>
                    <td className="p-4 text-center text-slate-500">{idx + 1}</td>
                    <td className="p-4"><div className="font-medium text-slate-800">{s.nama}</div><div className="text-xs text-slate-400">{s.nisn}</div></td>
                    <td className="p-4 text-center"><div onClick={() => openDetailModal(s.id, 'harian', g.harian, s.nama)} className="border rounded p-2 cursor-pointer hover:bg-blue-50 flex justify-between items-center no-print-border"><span className="font-bold text-slate-700">{avgH}</span><Calculator size={14} className="text-blue-400"/></div><span className="hidden print-only">{avgH}</span></td>
                    <td className="p-4 text-center"><div onClick={() => openDetailModal(s.id, 'tugas', g.tugas, s.nama)} className="border rounded p-2 cursor-pointer hover:bg-blue-50 flex justify-between items-center no-print-border"><span className="font-bold text-slate-700">{avgT}</span><Calculator size={14} className="text-blue-400"/></div><span className="hidden print-only">{avgT}</span></td>
                    <td className="p-4 text-center"><input type="number" className="w-16 p-1 border rounded text-center outline-none no-print-border" value={g.uts} onChange={e => handleSimpleChange(s.id, 'uts', e.target.value)} placeholder="0"/><span className="hidden print-only">{g.uts}</span></td>
                    <td className="p-4 text-center"><input type="number" className="w-16 p-1 border rounded text-center outline-none no-print-border" value={g.uas} onChange={e => handleSimpleChange(s.id, 'uas', e.target.value)} placeholder="0"/><span className="hidden print-only">{g.uas}</span></td>
                    <td className="p-4 text-center"><span className={`font-bold px-2 py-1 rounded ${isPassed ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>{final}</span></td>
                    <td className="p-4 text-center no-print"><button onClick={() => handleSaveToDB(s.id)} className={`p-2 rounded-lg transition-colors ${unsaved ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md animate-pulse' : 'text-blue-600 bg-blue-50 hover:bg-blue-100'}`}><Save size={18} /></button></td>
                  </tr>
                );
              })}
              {filteredStudents.length === 0 && (<tr><td colSpan="8" className="p-8 text-center text-slate-400">Tidak ada siswa</td></tr>)}
            </tbody>
          </table>
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
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><School className="text-blue-600"/> Edit Profil Sekolah</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <input value={formData.nama} onChange={e=>setFormData({...formData, nama:e.target.value})} className="w-full border p-2 rounded" placeholder="Nama Sekolah"/>
            <textarea value={formData.alamat} onChange={e=>setFormData({...formData, alamat:e.target.value})} className="w-full border p-2 rounded" placeholder="Alamat"/>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded w-full font-bold">Simpan</button>
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
  const [schoolProfile, setSchoolProfile] = useState({ nama: 'SDN Contoh', alamat: 'Jl. Contoh', npsn: '-', kodepos: '-', kepsek: '-', nip: '-' });

  useEffect(() => {
    // --- ADDED: Dynamic script loading for SheetJS (xlsx) ---
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.async = true;
    document.body.appendChild(script);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
          try {
            const userRef = doc(db, 'users', currentUser.uid, 'settings', 'profile');
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setIsPremium(data.isPremium === true);
                if (!data.phoneNumber) { setNeedsSetup(true); } else { setNeedsSetup(false); }
            } else {
                setIsPremium(false); setNeedsSetup(true);
            }
          } catch (e) { console.log("Error checking user status", e); }
      }
      setLoading(false);
    });
    
    // Cleanup script on unmount
    return () => {
      unsubscribe();
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (!user || needsSetup) return;
    const studentsRef = collection(db, 'users', user.uid, 'students');
    const subjectsRef = collection(db, 'users', user.uid, 'subjects');
    const gradesRef = collection(db, 'users', user.uid, 'grades');
    const profileRef = collection(db, 'users', user.uid, 'schoolProfile');
    const unsubStudents = onSnapshot(query(studentsRef, orderBy('nama')), (snap) => setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubSubjects = onSnapshot(query(subjectsRef, orderBy('nama')), (snap) => setSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubGrades = onSnapshot(gradesRef, (snap) => setGrades(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubProfile = onSnapshot(profileRef, (snap) => { if(!snap.empty) setSchoolProfile(snap.docs[0].data()); });
    return () => { unsubStudents(); unsubSubjects(); unsubGrades(); unsubProfile(); };
  }, [user, needsSetup]);

  const addStudent = async (data) => user && await addDoc(collection(db, 'users', user.uid, 'students'), { ...data, createdAt: serverTimestamp() });
  const deleteStudent = async (id) => user && await deleteDoc(doc(db, 'users', user.uid, 'students', id));
  const addSubject = async (data) => user && await addDoc(collection(db, 'users', user.uid, 'subjects'), data);
  const deleteSubject = async (id) => user && await deleteDoc(doc(db, 'users', user.uid, 'subjects', id));
  const saveGrade = async (data, gradeId) => { if(user) gradeId ? await updateDoc(doc(db, 'users', user.uid, 'grades', gradeId), data) : await addDoc(collection(db, 'users', user.uid, 'grades'), data); };
  const saveProfile = async (data) => user && await addDoc(collection(db, 'users', user.uid, 'schoolProfile'), data);
  const handleLogout = async () => { await signOut(auth); };

  // MENU UTAMA
  const menuItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, premium: false },
      { id: 'sekolah', label: 'Profil Sekolah', icon: School, premium: false },
      { id: 'siswa', label: 'Data Siswa', icon: Users, premium: false },
      { id: 'mapel', label: 'Mata Pelajaran', icon: BookOpen, premium: false },
      { id: 'nilai', label: 'Input Nilai', icon: Pencil, premium: true }, // MENU INI DIKUNCI
  ];

  const handleMenuClick = (item) => {
      if (item.premium && !isPremium) { setShowUpgradeModal(true); } 
      else { setActiveTab(item.id); setIsMobileMenuOpen(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-blue-600">Memuat...</div>;
  if (!user) return <LoginScreen />;
  if (needsSetup) return <SetupProfileModal user={user} onComplete={() => setNeedsSetup(false)} />;

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
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} userEmail={user.email} />
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shadow-xl z-10">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
            <div className="bg-blue-600 text-white p-2 rounded-lg"><GraduationCap size={24} /></div>
            <div><h1 className="font-bold text-lg text-slate-800 tracking-tight">NILAIKU</h1><p className="text-xs text-slate-500">Sistem Aplikasi Nilai Digital</p></div>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
                const isLocked = item.premium && !isPremium;
                return (
                    <button key={item.id} onClick={() => handleMenuClick(item)} className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${activeTab === item.id ? 'bg-blue-50 text-blue-700 font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                        <div className="flex items-center gap-3"><item.icon size={20} className={isLocked ? "text-slate-400" : ""} /><span className={isLocked ? "text-slate-400" : ""}>{item.label}</span></div>
                        {isLocked ? (<Lock size={16} className="text-slate-400" />) : (activeTab === item.id && <ChevronRight size={16} />)}
                    </button>
                )
            })}
        </nav>
        <div className="p-4 border-t border-slate-100">
            {!isPremium && (
                <div onClick={() => setShowUpgradeModal(true)} className="mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-xl text-white cursor-pointer hover:shadow-lg transition-shadow relative overflow-hidden">
                    <div className="relative z-10"><h4 className="font-bold text-sm flex items-center gap-2"><Crown size={14}/> Upgrade Pro</h4><p className="text-xs mt-1 opacity-90">Buka semua fitur!</p></div>
                    <Star className="absolute -right-2 -bottom-2 text-white opacity-20 w-16 h-16 rotate-12" />
                </div>
            )}
            <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-bold"><LogOut size={20}/> Logout</button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto relative h-full w-full">
        <div className="md:hidden bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-20 w-full">
            <div className="flex items-center gap-2 font-bold text-slate-800"><div className="bg-blue-600 text-white p-1.5 rounded-lg"><GraduationCap size={18} /></div>NILAIKU</div>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 bg-slate-50 rounded-lg">{isMobileMenuOpen ? <X /> : <Menu />}</button>
        </div>
        {isMobileMenuOpen && (
            <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="absolute top-16 left-0 w-full bg-white shadow-xl border-b border-slate-200 p-4 space-y-2 animate-fade-in-down" onClick={e => e.stopPropagation()}>
                    {menuItems.map((item) => (
                        <button key={item.id} onClick={() => handleMenuClick(item)} className="w-full flex items-center justify-between p-3 rounded-lg text-slate-600 hover:bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-3"><item.icon size={20} /> {item.label}</div>
                            {item.premium && !isPremium && <Lock size={16} className="text-slate-400" />}
                        </button>
                    ))}
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-red-600 font-bold border-t mt-2 pt-4"><LogOut size={20}/> Logout</button>
                </div>
            </div>
        )}
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-2"><div><h2 className="text-2xl font-bold text-slate-900 capitalize">{activeTab.replace('-', ' ')}</h2><p className="text-slate-500 text-sm hidden md:block">Kelola data akademik sekolah Anda dengan mudah.</p></div></div>
             {renderContent()}
        </div>
      </main>
    </div>
  );
}
