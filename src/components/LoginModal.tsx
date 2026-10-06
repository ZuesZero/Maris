import React, { useState, useRef } from 'react';
import { X, Mail, Lock, User as UserIcon, Phone, Eye, EyeOff, CheckCircle2, LogOut, ShieldCheck, ArrowRight, Camera, Upload, Link, Check, RefreshCw, UserCheck, Sparkles, KeyRound } from 'lucide-react';
import { User } from '../types';
import { Language } from '../data/translations';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLogin: (user: User) => void;
  onLogout: () => void;
  language: Language;
  initialMode?: 'login' | 'register';
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300'
];

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  language,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError('');
    }
  }, [isOpen, initialMode]);

  // Close on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [cellphone, setCellphone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [adminNotice, setAdminNotice] = useState('');
  const [adminPasswordPrompt, setAdminPasswordPrompt] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Avatar Edit State
  const [avatarInputUrl, setAvatarInputUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isEs = language === 'es';
  const isDevAdmin = currentUser?.email?.toLowerCase().trim() === 'luis.delarosacosio@gmail.com';
  const isGuestUser = currentUser?.email?.toLowerCase().trim() === 'guest@marisatelier.com' || (currentUser?.profile !== 'Developer' && !isDevAdmin);

  const getPersistedAvatar = (userEmail: string, fallback: string) => {
    try {
      const clean = userEmail.toLowerCase().trim();
      const saved = localStorage.getItem(`maris_avatar_${clean}`) || localStorage.getItem(`ales_avatar_${clean}`);
      if (saved) return saved;
    } catch (e) {}
    return fallback;
  };

  const persistAvatar = (userEmail: string, avatarUrl: string) => {
    try {
      const clean = userEmail.toLowerCase().trim();
      localStorage.setItem(`maris_avatar_${clean}`, avatarUrl);
      localStorage.setItem(`ales_avatar_${clean}`, avatarUrl);
    } catch (e) {}
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError(isEs ? 'Por favor ingresa un correo válido.' : 'Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError(isEs ? 'La contraseña debe tener al menos 6 caracteres.' : 'Password must be at least 6 characters.');
      return;
    }

    if (mode === 'register' && !name.trim()) {
      setError(isEs ? 'Por favor ingresa tu nombre completo.' : 'Please enter your full name.');
      return;
    }

    if (mode === 'register' && !cellphone.trim()) {
      setError(isEs ? 'Por favor ingresa tu teléfono celular.' : 'Please enter your cellphone number.');
      return;
    }

    const userName = mode === 'register' ? name.trim() : email.split('@')[0].replace('.', ' ');
    const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);
    const cleanEmail = email.trim();
    const isDev = cleanEmail.toLowerCase() === 'luis.delarosacosio@gmail.com';

    if (isDev && password !== 'Luisml02028801*') {
      setError(
        isEs
          ? 'Contraseña de administrador incorrecta. Acceso denegado.'
          : 'Incorrect administrator password. Access denied.'
      );
      return;
    }

    const defaultAvatar = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200`;
    const userAvatar = getPersistedAvatar(cleanEmail, defaultAvatar);

    const loggedUser: User = {
      id: 'usr-' + Date.now(),
      name: formattedName,
      email: cleanEmail,
      cellphone: cellphone.trim() || '',
      profile: isDev ? 'Developer' : 'User',
      memberTier: isDev ? 'Lead Developer' : (isEs ? 'Miembro Atelier Privé' : 'Atelier Privé Member'),
      avatar: userAvatar
    };

    onLogin(loggedUser);
    setSuccessMessage(mode === 'login' 
      ? (isEs ? `¡Bienvenido de nuevo, ${formattedName}!` : `Welcome back, ${formattedName}!`)
      : (isEs ? `Cuenta creada exitosamente.` : `Account created successfully.`)
    );

    setTimeout(() => {
      setSuccessMessage('');
      onClose();
    }, 1200);
  };

  const handleSelectAdmin = () => {
    if (isDevAdmin) {
      setSuccessMessage(isEs ? 'Modo Administrador ya está activo (Luis delarosacosio)' : 'Administrator mode already active (Luis delarosacosio)');
      setTimeout(() => setSuccessMessage(''), 2000);
      return;
    }

    if (currentUser) {
      // User is currently logged in as Guest or another user.
      // Request administrator email and password to switch/grant permissions.
      setAdminPasswordPrompt(true);
      setAdminEmailInput('');
      setAdminPasswordInput('');
      setAdminPasswordError('');
    } else {
      // User is not logged in: request logging access (email and password)
      setEmail('');
      setMode('login');
      setError('');
      setAdminNotice(
        isEs
          ? 'Acceso de Administrador: Por favor ingresa el correo y la contraseña autorizados para iniciar sesión con permisos de Administrador.'
          : 'Administrator Access: Please enter your authorized email and password to sign in with Administrator permissions.'
      );
      setTimeout(() => {
        const emailInput = document.getElementById('input-login-email');
        if (emailInput) emailInput.focus();
      }, 100);
    }
  };

  const handleAdminPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = adminEmailInput.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAdminPasswordError(
        isEs
          ? 'Por favor ingresa un correo electrónico de administrador válido.'
          : 'Please enter a valid administrator email address.'
      );
      return;
    }

    if (cleanEmail !== 'luis.delarosacosio@gmail.com') {
      setAdminPasswordError(
        isEs
          ? 'El correo ingresado no cuenta con permisos de Administrador.'
          : 'The entered email does not have Administrator permissions.'
      );
      return;
    }

    if (adminPasswordInput !== 'Luisml02028801*') {
      setAdminPasswordError(
        isEs
          ? 'Contraseña de administrador incorrecta. Acceso denegado.'
          : 'Incorrect administrator password. Access denied.'
      );
      return;
    }

    const adminEmail = 'luis.delarosacosio@gmail.com';
    const fallbackAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200';
    const currentAdminAvatar = currentUser?.email?.toLowerCase().trim() === adminEmail ? currentUser.avatar : '';
    const adminAvatar = currentAdminAvatar || getPersistedAvatar(adminEmail, fallbackAvatar);

    const adminUser: User = {
      id: 'usr-dev-1',
      name: 'Luis delarosacosio',
      email: adminEmail,
      cellphone: '',
      profile: 'Developer',
      memberTier: 'Lead Developer',
      avatar: adminAvatar
    };

    onLogin(adminUser);
    setAdminPasswordPrompt(false);
    setAdminEmailInput('');
    setAdminPasswordInput('');
    setAdminPasswordError('');
    setSuccessMessage(
      isEs
        ? 'Autenticado con éxito. Permisos de Administrador activados.'
        : 'Authenticated successfully. Administrator permissions enabled.'
    );
    setTimeout(() => {
      setSuccessMessage('');
      onClose();
    }, 1500);
  };

  const handleSelectGuest = () => {
    const guestEmail = 'guest@marisatelier.com';
    const fallbackAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
    const currentGuestAvatar = currentUser?.email?.toLowerCase().trim() === guestEmail ? currentUser.avatar : '';
    const guestAvatar = currentGuestAvatar || getPersistedAvatar(guestEmail, fallbackAvatar);

    const guestUser: User = {
      id: 'usr-guest-' + Date.now(),
      name: isEs ? 'Invitado Atelier' : 'Atelier Guest',
      email: guestEmail,
      cellphone: '+1 (555) 019-2831',
      profile: 'User',
      memberTier: isEs ? 'Cliente Invitado' : 'Guest Customer',
      avatar: guestAvatar
    };
    onLogin(guestUser);
    setSuccessMessage(isEs ? 'Modo Invitado activado (Exploración y Compras)' : 'Guest mode enabled (Browsing & Shopping)');
    setTimeout(() => setSuccessMessage(''), 2200);
  };

  const updateAvatar = (newAvatarUrl: string) => {
    if (!currentUser) return;
    persistAvatar(currentUser.email, newAvatarUrl);
    const updatedUser = {
      ...currentUser,
      avatar: newAvatarUrl
    };
    onLogin(updatedUser);
    setSuccessMessage(isEs ? 'Foto de perfil guardada permanentemente.' : 'Profile picture saved permanently.');
    setTimeout(() => setSuccessMessage(''), 2200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError(isEs ? 'La imagen debe ser menor a 5MB' : 'Image must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          updateAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 animate-fadeIn overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-[#FBF9F5] border border-[#E8E2D9] rounded-none shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />

        {/* Header bar */}
        <div className="bg-[#1C1B20] text-[#F4F0EA] px-6 py-4 sm:py-5 flex items-center justify-between border-b border-[#323038] shrink-0">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#B88A58]" />
            <span className="font-serif text-lg tracking-[0.15em] uppercase text-[#F4F0EA]">
              Mari's <span className="text-[#B88A58] italic font-normal">Atelier</span>
            </span>
            <span className="hidden sm:inline-block h-3.5 w-px bg-[#44424A] mx-1"></span>
            <span className="hidden sm:inline-block text-[11px] uppercase tracking-wider text-[#A8A09B]">
              {currentUser
                ? (isEs ? 'Centro de Cuenta y Permisos' : 'Account & Access Center')
                : (isEs ? 'Portal de Acceso' : 'Access Portal')}
            </span>
          </div>
          <button
            id="btn-close-login-modal"
            onClick={onClose}
            className="text-[#A8A09B] hover:text-white transition-colors p-1 rounded-sm cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert Overlay */}
        {successMessage && (
          <div className="bg-[#B88A58] text-white py-2.5 px-6 text-xs font-medium text-center flex items-center justify-center gap-2 animate-fadeIn shrink-0 shadow-inner">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* LOGGED IN VIEW - WIDE 2-COLUMN VIEW IN ONE SHOT */}
        {currentUser ? (
          <div className="p-5 sm:p-7 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
              
              {/* LEFT COLUMN: Profile Overview & Admin vs Guest Selector */}
              <div className="md:col-span-6 space-y-5">
                
                {/* User Identity Card */}
                <div className="bg-white border border-[#E8E2D9] p-5 rounded-xs shadow-2xs space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <img
                        src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                        alt={currentUser.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#B88A58] shadow-sm"
                      />
                      <span className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 border-2 border-white rounded-full ${isDevAdmin ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] font-bold rounded-xs ${
                          isDevAdmin 
                            ? 'bg-[#1C1B20] text-[#E8D0B5] border border-[#B88A58]/50' 
                            : 'bg-[#FAF6F0] text-[#8C6D3B] border border-[#D8C7B0]'
                        }`}>
                          {isDevAdmin ? 'LEAD DEVELOPER' : (currentUser.memberTier || 'ATELIER GUEST')}
                        </span>
                      </div>
                      <h3 className="font-serif text-lg sm:text-xl text-[#1C1B20] font-medium truncate mt-1">
                        {currentUser.name}
                      </h3>
                      <p className="text-xs text-[#8C9083] font-mono truncate">{currentUser.email}</p>
                    </div>
                  </div>
                </div>

                {/* SELECTOR: Authorized Admin vs Guest Option */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#1C1B20] flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-[#B88A58]" />
                      <span>{isEs ? 'SELECCIONAR MODO DE ACCESO' : 'SELECT ACCESS MODE'}</span>
                    </label>
                    <span className="text-[10px] text-[#8C9083]">
                      {isEs ? 'Cambio instantáneo' : 'Instant toggle'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Option 1: Authorized Admin */}
                    <button
                      id="btn-select-authorized-admin"
                      type="button"
                      onClick={handleSelectAdmin}
                      className={`p-3.5 text-left border rounded-xs transition-all cursor-pointer relative flex flex-col justify-between ${
                        isDevAdmin
                          ? 'border-[#B88A58] bg-[#1C1B20] text-white shadow-sm ring-1 ring-[#B88A58]'
                          : 'border-[#D1C9BD] bg-white hover:border-[#B88A58] hover:bg-[#FAF8F5] text-[#1C1B20]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-2xs ${
                            isDevAdmin ? 'bg-[#B88A58] text-[#1C1B20]' : 'bg-[#EFEAE1] text-[#66635B]'
                          }`}>
                            {isEs ? 'ADMINISTRADOR' : 'AUTHORIZED ADMIN'}
                          </span>
                          {isDevAdmin ? (
                            <CheckCircle2 className="w-4 h-4 text-[#B88A58] shrink-0" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-[#B88A58] shrink-0" />
                          )}
                        </div>
                        {isDevAdmin ? (
                          <>
                            <p className="text-xs font-serif font-bold text-white">
                              Luis delarosacosio
                            </p>
                            <p className="text-[10px] font-mono truncate mt-0.5 text-[#D5CEBF]">
                              luis.delarosacosio@gmail.com
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-xs font-serif font-bold text-[#1C1B20]">
                              {isEs ? 'Cuenta de Administrador' : 'Administrator Account'}
                            </p>
                            <p className="text-[10px] font-mono truncate mt-0.5 text-[#88847C]">
                              {isEs ? 'Acceso Privado' : 'Private Access'}
                            </p>
                          </>
                        )}
                      </div>
                      <div className="pt-2 mt-2 border-t border-white/10 text-[10px]">
                        <span className={isDevAdmin ? 'text-[#E8D0B5]' : 'text-[#8C9083]'}>
                          {isDevAdmin 
                            ? (isEs ? '✓ Control total, subir prendas y stock' : '✓ Full control, upload items & stock')
                            : (isEs ? '🔒 Requiere correo y contraseña' : '🔒 Email and password required')}
                        </span>
                      </div>
                    </button>

                    {/* Option 2: Guest */}
                    <button
                      id="btn-select-guest-mode"
                      type="button"
                      onClick={handleSelectGuest}
                      className={`p-3.5 text-left border rounded-xs transition-all cursor-pointer relative flex flex-col justify-between ${
                        isGuestUser
                          ? 'border-[#B88A58] bg-[#1C1B20] text-white shadow-sm ring-1 ring-[#B88A58]'
                          : 'border-[#D1C9BD] bg-white hover:border-[#B88A58] hover:bg-[#FAF8F5] text-[#1C1B20]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-2xs ${
                            isGuestUser ? 'bg-[#B88A58] text-[#1C1B20]' : 'bg-[#EFEAE1] text-[#66635B]'
                          }`}>
                            {isEs ? 'INVITADO' : 'GUEST'}
                          </span>
                          {isGuestUser && (
                            <CheckCircle2 className="w-4 h-4 text-[#B88A58] shrink-0" />
                          )}
                        </div>
                        <p className={`text-xs font-serif font-bold ${isGuestUser ? 'text-white' : 'text-[#1C1B20]'}`}>
                          {isEs ? 'Invitado Atelier' : 'Atelier Guest'}
                        </p>
                        <p className={`text-[10px] font-mono truncate mt-0.5 ${isGuestUser ? 'text-[#D5CEBF]' : 'text-[#88847C]'}`}>
                          guest@marisatelier.com
                        </p>
                      </div>
                      <div className="pt-2 mt-2 border-t border-white/10 text-[10px]">
                        <span className={isGuestUser ? 'text-[#E8D0B5]' : 'text-[#8C9083]'}>
                          {isEs ? '✓ Experiencia de compra boutique' : '✓ Standard boutique shopping'}
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Inline Admin Password Prompt */}
                  {adminPasswordPrompt && (
                    <div className="p-4 bg-[#1C1B20] text-white border border-[#B88A58] rounded-xs space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E8D0B5]">
                          <Lock className="w-3.5 h-3.5 text-[#B88A58]" />
                          <span>{isEs ? 'Inicio de Sesión de Administrador Requerido' : 'Administrator Sign In Required'}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setAdminPasswordPrompt(false); setAdminPasswordError(''); }}
                          className="text-[#A8A09B] hover:text-white cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-[11px] text-[#D5CEBF] leading-relaxed">
                        {isEs 
                          ? 'Para otorgar permisos de Administrador, ingresa tu correo y contraseña autorizados:' 
                          : 'To grant Administrator permissions, enter your authorized email and password:'}
                      </p>

                      {adminPasswordError && (
                        <div className="p-2 bg-rose-950/80 border border-rose-500 text-rose-200 text-xs">
                          {adminPasswordError}
                        </div>
                      )}

                      <form onSubmit={handleAdminPasswordSubmit} className="space-y-2.5">
                        {/* Email Input */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-wider text-[#A8A09B] font-semibold block">
                            {isEs ? 'Correo Electrónico de Administrador' : 'Administrator Email'}
                          </label>
                          <div className="relative">
                            <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C9083]" />
                            <input
                              type="email"
                              value={adminEmailInput}
                              onChange={(e) => { setAdminEmailInput(e.target.value); setAdminPasswordError(''); }}
                              placeholder={isEs ? 'ej. correo@ejemplo.com' : 'e.g. email@example.com'}
                              autoFocus
                              className="w-full pl-9 pr-3 py-2 bg-[#2A292F] border border-[#44424A] text-white text-xs placeholder:text-[#7A7672] focus:border-[#B88A58] focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-wider text-[#A8A09B] font-semibold block">
                            {isEs ? 'Contraseña' : 'Password'}
                          </label>
                          <div className="relative">
                            <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C9083]" />
                            <input
                              type={showAdminPassword ? 'text' : 'password'}
                              value={adminPasswordInput}
                              onChange={(e) => { setAdminPasswordInput(e.target.value); setAdminPasswordError(''); }}
                              placeholder={isEs ? 'Contraseña (mín. 6 caracteres)' : 'Password (min. 6 chars)'}
                              className="w-full pl-9 pr-9 py-2 bg-[#2A292F] border border-[#44424A] text-white text-xs placeholder:text-[#7A7672] focus:border-[#B88A58] focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowAdminPassword(!showAdminPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C9083] hover:text-white cursor-pointer"
                            >
                              {showAdminPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            type="submit"
                            className="flex-1 py-2 bg-[#B88A58] hover:bg-[#a17849] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            {isEs ? 'Verificar e Iniciar Sesión' : 'Verify & Sign In'}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setAdminPasswordPrompt(false); setAdminPasswordError(''); }}
                            className="px-3 py-2 bg-[#2A292F] hover:bg-[#38363F] text-[#A8A09B] text-xs transition-colors cursor-pointer"
                          >
                            {isEs ? 'Cancelar' : 'Cancel'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>

                {/* Account Status / Perks Box */}
                <div className="bg-[#FAF8F5] border border-[#E8E2D9] p-3.5 rounded-xs space-y-2 text-xs text-[#4A4947]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#66635B]">{isEs ? 'Estado de la cuenta' : 'Account Status'}</span>
                    <span className="font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      {isEs ? 'Activa y Verificada' : 'Active & Verified'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#66635B]">{isEs ? 'Nivel de Permisos' : 'Permission Level'}</span>
                    <span className="text-[#B88A58] font-bold">
                      {isDevAdmin 
                        ? (isEs ? 'Administrador Maestro (Dev)' : 'Master Admin (Dev)') 
                        : (isEs ? 'Invitado de Compras' : 'Shopping Guest')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#66635B]">{isEs ? 'Beneficios Atelier' : 'Atelier Perks'}</span>
                    <span className="text-[#1C1B20] font-medium">{isEs ? 'Envío Exprés de Cortesía' : 'Complimentary Express Shipping'}</span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-1">
                  <button
                    id="btn-logout"
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="w-full py-2.5 border border-[#1C1B20] text-[#1C1B20] hover:bg-[#1C1B20] hover:text-white transition-all text-xs uppercase tracking-[0.18em] font-bold flex items-center justify-center gap-2 cursor-pointer rounded-xs"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{isEs ? 'Cerrar Sesión' : 'Sign Out'}</span>
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: Profile Picture Customization (Visible in one shot) */}
              <div className="md:col-span-6 bg-[#F4F0EA] border border-[#D8D1C5] p-5 rounded-xs space-y-4 text-left">
                <div className="flex items-center justify-between border-b border-[#D8D1C5] pb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1C1B20] flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#B88A58]" />
                    {isEs ? 'CAMBIAR FOTO DE PERFIL' : 'CHANGE PROFILE PICTURE'}
                  </span>
                  <span className="text-[10px] text-[#8C9083]">
                    {isEs ? 'Vista en directo' : 'Live preview'}
                  </span>
                </div>

                {/* Option 1: File Upload */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#4A4947] block">
                    {isEs ? '1. Cargar desde tu dispositivo' : '1. Upload from device'}
                  </label>
                  <button
                    id="btn-upload-avatar-file"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 px-3 bg-white border border-[#D1C9BD] hover:border-[#1C1B20] hover:bg-[#FAF8F5] text-[#1C1B20] text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs rounded-xs"
                  >
                    <Upload className="w-4 h-4 text-[#B88A58]" />
                    <span className="font-semibold">{isEs ? 'Seleccionar archivo de imagen' : 'Choose image file'}</span>
                  </button>
                  <p className="text-[10px] text-[#8C9083]">
                    {isEs ? 'Soporta PNG, JPG, WEBP o GIF (hasta 5MB)' : 'Supports PNG, JPG, WEBP or GIF (up to 5MB)'}
                  </p>
                </div>

                {/* Option 2: Image URL */}
                <div className="space-y-1.5">
                  <label htmlFor="input-avatar-url" className="text-[10px] font-bold uppercase tracking-wider text-[#4A4947] block">
                    {isEs ? '2. O pega una URL de imagen' : '2. Or paste image URL'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="input-avatar-url"
                      type="url"
                      value={avatarInputUrl}
                      onChange={(e) => setAvatarInputUrl(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 px-3 py-2 bg-white border border-[#D1C9BD] text-xs text-[#1C1B20] focus:outline-none focus:border-[#B88A58] rounded-xs"
                    />
                    <button
                      id="btn-save-avatar-url"
                      type="button"
                      onClick={() => {
                        if (avatarInputUrl.trim()) {
                          updateAvatar(avatarInputUrl.trim());
                          setAvatarInputUrl('');
                        }
                      }}
                      className="px-4 py-2 bg-[#1C1B20] text-white hover:bg-[#B88A58] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-xs"
                    >
                      {isEs ? 'Guardar' : 'Save'}
                    </button>
                  </div>
                </div>

                {/* Option 3: Presets */}
                <div className="space-y-2 pt-1 border-t border-[#D8D1C5]">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#4A4947] block">
                    {isEs ? '3. O elige un retrato de colección' : '3. Or choose a portrait preset'}
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_AVATARS.map((url, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => updateAvatar(url)}
                        className={`relative rounded-full overflow-hidden aspect-square border-2 transition-all cursor-pointer hover:scale-105 ${
                          currentUser.avatar === url 
                            ? 'border-[#B88A58] ring-2 ring-[#B88A58]/50 shadow-sm' 
                            : 'border-[#D1C9BD] opacity-80 hover:opacity-100'
                        }`}
                        title={isEs ? `Retrato #${index + 1}` : `Portrait #${index + 1}`}
                      >
                        <img src={url} alt={`Preset ${index + 1}`} className="w-full h-full object-cover" />
                        {currentUser.avatar === url && (
                          <div className="absolute inset-0 bg-[#B88A58]/40 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        ) : (
          /* LOG IN / REGISTER / QUICK ACCESS FORM - WIDE 2-COLUMN VIEW */
          <div className="p-5 sm:p-7 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
              
              {/* LEFT COLUMN: Quick Mode Selection (Admin vs Guest) */}
              <div className="md:col-span-5 space-y-4 bg-[#F4F0EA] border border-[#D8D1C5] p-5 rounded-xs">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#1C1B20] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#B88A58]" />
                    {isEs ? 'ACCESO DIRECTO RÁPIDO' : 'QUICK INSTANT ACCESS'}
                  </span>
                  <p className="text-[11px] text-[#66635B] mt-1">
                    {isEs
                      ? 'Seleccione uno de los modos preconfigurados para ingresar al Atelier en un solo clic:'
                      : 'Select one of the preconfigured modes to enter the Atelier with one click:'}
                  </p>
                </div>

                {/* Quick Admin Button */}
                <button
                  id="btn-quick-admin-login"
                  type="button"
                  onClick={handleSelectAdmin}
                  className="w-full p-3.5 border border-[#B88A58] bg-[#1C1B20] hover:bg-[#323038] text-white transition-all text-left rounded-xs cursor-pointer shadow-sm group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-[#B88A58] text-[#1C1B20] rounded-2xs">
                      {isEs ? 'ADMINISTRADOR AUTORIZADO' : 'AUTHORIZED ADMIN'}
                    </span>
                    <Lock className="w-4 h-4 text-[#B88A58] group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-sm font-serif font-bold text-white">
                    {isEs ? 'Cuenta de Administrador' : 'Administrator Account'}
                  </p>
                  <p className="text-[10px] font-mono text-[#D5CEBF] mt-0.5">
                    {isEs ? 'Acceso Privado' : 'Private Access'}
                  </p>
                  <div className="mt-2 pt-2 border-t border-white/15 text-[10px] text-[#E8D0B5] flex items-center justify-between">
                    <span>{isEs ? '🔒 Requiere correo y contraseña' : '🔒 Requires email & password'}</span>
                    <span className="text-[9px] underline uppercase tracking-wider text-[#B88A58]">{isEs ? 'Iniciar sesión' : 'Sign in'} &rarr;</span>
                  </div>
                </button>

                {/* Quick Guest Button */}
                <button
                  id="btn-quick-guest-login"
                  type="button"
                  onClick={handleSelectGuest}
                  className="w-full p-3.5 border border-[#D1C9BD] bg-white hover:border-[#B88A58] hover:bg-[#FAF8F5] text-[#1C1B20] transition-all text-left rounded-xs cursor-pointer shadow-2xs group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-[#EFEAE1] text-[#66635B] rounded-2xs">
                      {isEs ? 'MODO INVITADO' : 'GUEST MODE'}
                    </span>
                    <UserIcon className="w-4 h-4 text-[#B88A58] group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-sm font-serif font-bold text-[#1C1B20]">
                    {isEs ? 'Invitado de la Tienda' : 'Atelier Store Guest'}
                  </p>
                  <p className="text-[10px] font-mono text-[#88847C] mt-0.5">
                    guest@marisatelier.com
                  </p>
                  <div className="mt-2 pt-2 border-t border-[#E8E2D9] text-[10px] text-[#66635B]">
                    {isEs ? '✓ Experiencia de compra, carrito y catálogo' : '✓ Shopping experience, bag & catalog'}
                  </div>
                </button>
              </div>

              {/* RIGHT COLUMN: Custom Email & Password Sign In / Register Form */}
              <div className="md:col-span-7 space-y-5 bg-white border border-[#E8E2D9] p-5 sm:p-6 rounded-xs">
                {/* Mode Switcher Tabs */}
                <div className="flex border-b border-[#E8E2D9]">
                  <button
                    id="tab-mode-login"
                    onClick={() => { setMode('login'); setError(''); }}
                    className={`flex-1 pb-3 text-xs uppercase tracking-[0.18em] font-bold transition-all text-center cursor-pointer ${
                      mode === 'login'
                        ? 'border-b-2 border-[#1C1B20] text-[#1C1B20]'
                        : 'text-[#8C9083] hover:text-[#1C1B20]'
                    }`}
                  >
                    {isEs ? 'Iniciar Sesión' : 'Sign In'}
                  </button>
                  <button
                    id="tab-mode-register"
                    onClick={() => { setMode('register'); setError(''); }}
                    className={`flex-1 pb-3 text-xs uppercase tracking-[0.18em] font-bold transition-all text-center cursor-pointer ${
                      mode === 'register'
                        ? 'border-b-2 border-[#1C1B20] text-[#1C1B20]'
                        : 'text-[#8C9083] hover:text-[#1C1B20]'
                    }`}
                  >
                    {isEs ? 'Crear Cuenta' : 'Register'}
                  </button>
                </div>

                {adminNotice && !error && (
                  <div className="p-3 bg-[#FAF6F0] border border-[#B88A58]/60 text-[#8C6D3B] text-xs flex items-center gap-2 rounded-xs animate-fadeIn">
                    <Lock className="w-4 h-4 text-[#B88A58] shrink-0" />
                    <span className="leading-relaxed">{adminNotice}</span>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center font-medium">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {mode === 'register' && (
                    <>
                      <div className="space-y-1">
                        <label htmlFor="input-login-name" className="text-[11px] uppercase tracking-wider text-[#4A4947] font-semibold block">
                          {isEs ? 'Nombre Completo' : 'Full Name'}
                        </label>
                        <div className="relative">
                          <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C9083]" />
                          <input
                            id="input-login-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={isEs ? 'Ej. Mateo Silva' : 'e.g. Alexander Vance'}
                            className="w-full pl-9 pr-3 py-2 bg-white border border-[#E8E2D9] text-xs text-[#1C1B20] focus:outline-none focus:border-[#1C1B20] transition-colors rounded-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="input-login-cellphone" className="text-[11px] uppercase tracking-wider text-[#4A4947] font-semibold block">
                          {isEs ? 'Teléfono Celular' : 'Cellphone Number'}
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C9083]" />
                          <input
                            id="input-login-cellphone"
                            type="tel"
                            value={cellphone}
                            onChange={(e) => setCellphone(e.target.value)}
                            placeholder={isEs ? 'Ej. +52 55 1234 5678' : 'e.g. +1 (555) 019-2831'}
                            className="w-full pl-9 pr-3 py-2 bg-white border border-[#E8E2D9] text-xs text-[#1C1B20] focus:outline-none focus:border-[#1C1B20] transition-colors rounded-xs"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-1">
                    <label htmlFor="input-login-email" className="text-[11px] uppercase tracking-wider text-[#4A4947] font-semibold block">
                      {isEs ? 'Correo Electrónico' : 'Email Address'}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C9083]" />
                      <input
                        id="input-login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="client@alesbrand.com"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-[#E8E2D9] text-xs text-[#1C1B20] focus:outline-none focus:border-[#1C1B20] transition-colors rounded-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="input-login-password" className="text-[11px] uppercase tracking-wider text-[#4A4947] font-semibold block">
                      {isEs ? 'Contraseña' : 'Password'}
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C9083]" />
                      <input
                        id="input-login-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-10 py-2 bg-white border border-[#E8E2D9] text-xs text-[#1C1B20] focus:outline-none focus:border-[#1C1B20] transition-colors rounded-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C9083] hover:text-[#1C1B20] cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {mode === 'login' && (
                    <div className="flex items-center justify-between text-xs text-[#4A4947] pt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="accent-[#1C1B20] w-3.5 h-3.5 cursor-pointer"
                        />
                        <span>{isEs ? 'Recordarme' : 'Remember me'}</span>
                      </label>
                      <a
                        href="#forgot"
                        onClick={(e) => {
                          e.preventDefault();
                          setSuccessMessage(isEs ? 'Enlace de restablecimiento enviado.' : 'Password reset link sent.');
                          setTimeout(() => setSuccessMessage(''), 2000);
                        }}
                        className="text-[#B88A58] hover:underline font-medium text-[11px]"
                      >
                        {isEs ? '¿Olvidaste tu contraseña?' : 'Forgot password?'}
                      </a>
                    </div>
                  )}

                  <button
                    id="btn-submit-auth"
                    type="submit"
                    className="w-full py-2.5 bg-[#1C1B20] text-white hover:bg-[#B88A58] transition-all text-xs uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md mt-3 rounded-xs"
                  >
                    <span>{mode === 'login' ? (isEs ? 'Ingresar a mi cuenta' : 'Sign In') : (isEs ? 'Crear mi cuenta' : 'Create Account')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

