import React, { useState, useEffect } from "react";
import { LIST_PUSKESMAS } from "../types";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { onSnapshot, collection } from "firebase/firestore";
import {
  Lock,
  User,
  Building2,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  LayoutDashboard,
  Sliders,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { motion } from "motion/react";

export interface UserSession {
  role: "operator" | "admin" | "superadmin";
  username: string;
  puskesmasId?: string;
  puskesmasName?: string;
}

interface LoginPortalProps {
  onLoginSuccess: (session: UserSession) => void;
}

export default function LoginPortal({ onLoginSuccess }: LoginPortalProps) {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [customUsers, setCustomUsers] = useState<any[]>([]);

  // Load custom users from cloud in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const loaded: any[] = [];
        snapshot.forEach((doc) => {
          loaded.push(doc.data());
        });
        setCustomUsers(loaded);
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, "users");
      }
    );
    return () => unsubscribe();
  }, []);



  const detectUserRoleAndPkm = (userStr: string) => {
    const lower = userStr.toLowerCase().trim();
    
    // 1. Superadmin check
    if (lower === "superadmin") {
      return {
        role: "superadmin" as const,
        username: "superadmin",
        puskesmasId: undefined,
        puskesmasName: undefined,
        expectedPassword: "alief03",
      };
    }
    
    // 2. Admin check
    if (lower.includes("admin.dinkes") || lower.includes("dinkes") || lower === "admin") {
      return {
        role: "admin" as const,
        username: userStr,
        puskesmasId: undefined,
        puskesmasName: undefined,
        expectedPassword: "admindinkes123",
      };
    }
    
    // 3. Operator check - extract matching puskesmas from username string
    let matchedPkm = LIST_PUSKESMAS.find((pkm) => {
      const cleanName = pkm.name.replace(/^Puskesmas\s+/i, "").toLowerCase();
      const formatted = cleanName.replace(/\s+/g, "_");
      const formattedNoUnderscore = cleanName.replace(/\s+/g, "");
      return lower.includes(formatted) || lower.includes(formattedNoUnderscore);
    });
    
    if (!matchedPkm) {
      // Fallback word parsing
      matchedPkm = LIST_PUSKESMAS.find((pkm) => {
        const cleanName = pkm.name.replace(/^Puskesmas\s+/i, "").toLowerCase();
        const words = cleanName.split(/\s+/);
        return words.some((w) => w.length > 2 && lower.includes(w));
      });
    }

    const finalPkm = matchedPkm || LIST_PUSKESMAS[0]; // Default fallback

    return {
      role: "operator" as const,
      username: userStr,
      puskesmasId: finalPkm.id,
      puskesmasName: finalPkm.name,
      expectedPassword: "operator123",
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMsg("Harap masukkan username dan password.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      // 1. Check in custom users list first
      const matchedCustom = customUsers.find(
        (u) => u.username.toLowerCase().trim() === cleanUser
      );

      if (matchedCustom) {
        if (cleanPass === matchedCustom.password) {
          setSuccessMsg("Autentikasi berhasil! Mengalihkan ke sistem...");
          setTimeout(() => {
            onLoginSuccess({
              role: matchedCustom.role,
              username: matchedCustom.username.trim(),
              puskesmasId: matchedCustom.puskesmasId,
              puskesmasName: matchedCustom.puskesmasName,
            });
          }, 1000);
          return;
        } else {
          setErrorMsg("Username atau password salah. Silakan coba lagi.");
          return;
        }
      }

      // 2. Fallback to default developer/demo credentials
      const authInfo = detectUserRoleAndPkm(username);

      if (cleanPass === authInfo.expectedPassword) {
        setSuccessMsg("Autentikasi berhasil! Mengalihkan ke sistem...");
        
        setTimeout(() => {
          onLoginSuccess({
            role: authInfo.role,
            username: authInfo.username.trim(),
            puskesmasId: authInfo.puskesmasId,
            puskesmasName: authInfo.puskesmasName,
          });
        }, 1000);
      } else {
        setErrorMsg("Username atau password salah. Silakan coba lagi.");
      }
    }, 1200);
  };


  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Decorative Glowing Orbs */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-900/35 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-emerald-900/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Login Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        {/* Logo and Titles */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-blue-700 to-blue-500 rounded-2xl shadow-xl shadow-blue-900/40 text-white mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-wider uppercase leading-none">
            SIPET KESJAOR
          </h1>
          <p className="text-[11px] md:text-xs text-blue-200/80 font-bold uppercase tracking-widest mt-1.5">
            Sistem Pelaporan Terpadu Kesehatan Kerja & Olahraga
          </p>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-1">
            Dinas Kesehatan Kabupaten Sumenep
          </p>
        </div>

        {/* Credentials Portal Card */}
        <div className="bg-slate-800/90 border border-slate-700/60 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
            {/* Error Message */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3.5 rounded-xl flex items-start gap-2.5 text-xs font-semibold"
              >
                <AlertCircle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {/* Success Message */}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-3.5 rounded-xl flex items-start gap-2.5 text-xs font-semibold"
              >
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </motion.div>
            )}

            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Nama Pengguna (Username)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="masukan username"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl py-2.5 pl-10 pr-3 text-xs font-semibold text-slate-100 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl py-2.5 pl-10 pr-10 text-xs font-semibold text-slate-100 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>



            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading || !!successMsg}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 active:scale-98 disabled:opacity-55 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <span>Masuk Aplikasi</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Credit */}
        <p className="text-center text-slate-500 text-[10px] tracking-wider uppercase font-semibold mt-6">
          Portal KESJAOR Kabupaten Sumenep © 2026. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
