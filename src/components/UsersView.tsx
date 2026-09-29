import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  ShieldCheck,
  Code,
  User as UserIcon,
  Mail,
  Phone,
  Trash2,
  Edit2,
  Lock,
  Download,
  CheckCircle2,
  X,
  Filter,
  Sparkles,
  ChevronRight,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { User } from '../types';
import { Language } from '../data/translations';

interface UsersViewProps {
  currentUser: User | null;
  registeredUsers: User[];
  onUpdateRegisteredUsers: (users: User[]) => void;
  onOpenLogin: () => void;
  language?: Language;
}

export const UsersView: React.FC<UsersViewProps> = ({
  currentUser,
  registeredUsers,
  onUpdateRegisteredUsers,
  onOpenLogin,
  language = 'en'
}) => {
  const isEs = language === 'es';

  const t = {
    // Restricted access
    restrictedBadge: isEs ? 'Vista Restringida para Desarrollador' : 'Developer Restricted View',
    restrictedTitle: isEs ? 'Acceso Restringido al Directorio de Usuarios' : 'Registered Users Directory Access Restricted',
    restrictedDesc: isEs
      ? 'La tabla de registro de usuarios está estrictamente reservada para el acceso de la cuenta de desarrollador (luis.delarosacosio@gmail.com).'
      : 'The user storage registry table is strictly reserved for developer account access (luis.delarosacosio@gmail.com).',
    loggedInAs: isEs ? 'Sesión iniciada actualmente como:' : 'Currently logged in as:',
    notLoggedInDev: isEs ? 'Actualmente no has iniciado sesión como desarrollador.' : 'You are currently not logged in as developer.',
    signInDev: isEs ? 'Iniciar Sesión como Luis de la Rosa (Desarrollador)' : 'Sign In as Luis de la Rosa (Developer)',

    // Header
    adminControl: isEs ? 'Control Administrativo del Desarrollador' : 'Developer Administrative Control',
    devMode: isEs ? 'MODO DESARROLLADOR' : 'DEVELOPER MODE',
    title: isEs ? 'Registro de Usuarios Registrados' : 'Registered Users Storage Registry',
    subtitle: isEs
      ? 'Base de datos en vivo de todas las cuentas registradas en Mari\'s Atelier. Filtra por perfiles de desarrollador y estándar, actualiza datos de contacto y exporta registros.'
      : 'Live database of all accounts registered in Mari\'s Atelier. Filter by developer and standard profiles, update contact details, and export records.',
    exportCsv: isEs ? 'Exportar CSV' : 'Export CSV',
    addUser: isEs ? 'Agregar Usuario' : 'Add Registered User',

    // Stats
    totalUsers: isEs ? 'Usuarios Registrados Totales' : 'Total Registered Users',
    totalUsersDesc: isEs ? 'Cuentas activas en la base de datos' : 'Active accounts in store database',
    devAccounts: isEs ? 'Cuentas de Desarrollador' : 'Developer Accounts',
    devAccountsDesc: isEs ? 'Perfil con privilegios completos de sistema' : 'Full system privilege developer profile',
    standardUsers: isEs ? 'Usuarios Estándar' : 'Standard Users',
    standardUsersDesc: isEs ? 'Perfiles de clientes y miembros de Atelier' : 'Atelier clients & member profiles',

    // Search and Filters
    searchPlaceholder: isEs ? 'Buscar por nombre, correo, teléfono...' : 'Search by name, email, phone...',
    filterAll: isEs ? 'Todos' : 'All',
    filterDeveloper: isEs ? 'Desarrolladores' : 'Developer',
    filterUsers: isEs ? 'Usuarios' : 'Users',

    // Table
    colName: isEs ? 'Usuario / Nombre' : 'User / Name',
    colEmail: isEs ? 'Correo Electrónico' : 'Email Address',
    colPhone: isEs ? 'Teléfono Móvil' : 'Cellphone',
    colRole: isEs ? 'Rol / Perfil' : 'Profile Role',
    colTier: isEs ? 'Nivel de Membresía' : 'Member Tier',
    colActions: isEs ? 'Acciones' : 'Actions',
    leadDeveloper: isEs ? 'Desarrollador Principal' : 'Lead Developer',
    roleDeveloper: isEs ? 'Desarrollador' : 'Developer',
    roleUser: isEs ? 'Usuario' : 'User',
    defaultTier: isEs ? 'Miembro de Atelier' : 'Atelier Member',
    editUser: isEs ? 'Editar Usuario' : 'Edit User',
    deleteUser: isEs ? 'Eliminar Usuario' : 'Delete User',
    noUsersFound: isEs ? 'No se encontraron usuarios registrados' : 'No registered users found',
    noUsersFoundSub: isEs ? 'Intenta limpiar la búsqueda o cambiar los criterios de filtro.' : 'Try clearing your search query or filter criteria.',

    // Modal
    editTitle: isEs ? 'Editar Usuario Registrado' : 'Edit Registered User',
    addTitle: isEs ? 'Registrar Nuevo Usuario' : 'Register New User',
    fullName: isEs ? 'Nombre Completo *' : 'Full Name *',
    fullNamePlaceholder: isEs ? 'ej. Luis de la Rosa' : 'e.g. Luis de la Rosa',
    email: isEs ? 'Correo Electrónico *' : 'Email Address *',
    cellphone: isEs ? 'Teléfono Móvil *' : 'Cellphone Number *',
    profileRole: isEs ? 'Rol de Perfil *' : 'Profile Role *',
    optUser: isEs ? 'Usuario' : 'User',
    optDeveloper: isEs ? 'Desarrollador' : 'Developer',
    devLockNote: isEs ? 'Nota: luis.delarosacosio@gmail.com está bloqueado como perfil de Desarrollador.' : 'Note: luis.delarosacosio@gmail.com is locked as Developer profile.',
    memberTier: isEs ? 'Nivel de Membresía' : 'Member Tier',
    memberTierPlaceholder: isEs ? 'ej. Miembro VIP Atelier' : 'e.g. Atelier VIP Member',
    btnCancel: isEs ? 'Cancelar' : 'Cancel',
    btnUpdate: isEs ? 'Actualizar Usuario' : 'Update User',
    btnRegister: isEs ? 'Registrar Usuario' : 'Register User',

    // Messages & Toast
    errName: isEs ? 'El nombre es obligatorio.' : 'Name is required.',
    errEmail: isEs ? 'Por favor ingresa un correo electrónico válido.' : 'Please enter a valid email address.',
    errPhone: isEs ? 'El número de teléfono móvil es obligatorio.' : 'Cellphone number is required.',
    errDuplicate: isEs ? 'Ya existe un usuario registrado con este correo electrónico.' : 'A user with this email address is already registered.',
    toastUpdated: isEs ? 'Detalles de usuario actualizados para' : 'Updated user details for',
    toastRegistered: isEs ? 'Se registró con éxito a' : 'Successfully registered',
    devNoDelete: isEs ? 'La cuenta de desarrollador (luis.delarosacosio@gmail.com) no se puede eliminar.' : 'Developer account (luis.delarosacosio@gmail.com) cannot be deleted.',
    confirmDelete: isEs ? '¿Estás seguro de que deseas eliminar a' : 'Are you sure you want to remove',
    confirmDeleteSub: isEs ? 'de los usuarios registrados?' : 'from registered users?',
    toastDeleted: isEs ? 'Usuario eliminado:' : 'User deleted.',
    toastExported: isEs ? 'Tabla de usuarios exportada a CSV' : 'Exported registered users table to CSV'
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'developer' | 'user'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State for Adding / Editing
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    cellphone: string;
    profile: string;
    avatar: string;
    memberTier: string;
  }>({
    name: '',
    email: '',
    cellphone: '',
    profile: 'User',
    avatar: '',
    memberTier: 'Atelier Member'
  });

  const [formError, setFormError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const isDeveloper = currentUser?.email?.toLowerCase().trim() === 'luis.delarosacosio@gmail.com';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Helper to determine exact profile for a user
  const getUserProfile = (u: User): 'Developer' | 'User' => {
    if (u.email?.toLowerCase().trim() === 'luis.delarosacosio@gmail.com') {
      return 'Developer';
    }
    return (u.profile as 'Developer' | 'User') || 'User';
  };

  // Filtered Users List
  const filteredUsers = registeredUsers.filter(u => {
    const profile = getUserProfile(u);
    const matchesRole =
      roleFilter === 'all'
        ? true
        : roleFilter === 'developer'
        ? profile === 'Developer'
        : profile === 'User';

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.cellphone && u.cellphone.toLowerCase().includes(q)) ||
      profile.toLowerCase().includes(q);

    return matchesRole && matchesSearch;
  });

  // Modal handlers
  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      email: '',
      cellphone: '',
      profile: 'User',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      memberTier: isEs ? 'Miembro de Atelier' : 'Atelier Member'
    });
    setFormError('');
    setEditingUser(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      cellphone: user.cellphone || '',
      profile: getUserProfile(user),
      avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      memberTier: user.memberTier || (isEs ? 'Miembro de Atelier' : 'Atelier Member')
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError(t.errName);
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setFormError(t.errEmail);
      return;
    }
    if (!formData.cellphone.trim()) {
      setFormError(t.errPhone);
      return;
    }

    const cleanEmail = formData.email.trim();
    const cleanProfile = cleanEmail.toLowerCase() === 'luis.delarosacosio@gmail.com' ? 'Developer' : formData.profile;

    if (formData.avatar) {
      try {
        localStorage.setItem(`maris_avatar_${cleanEmail.toLowerCase()}`, formData.avatar);
        localStorage.setItem(`ales_avatar_${cleanEmail.toLowerCase()}`, formData.avatar);
      } catch (e) {}
    }

    if (editingUser) {
      // Editing existing user
      const updatedList = registeredUsers.map(u => {
        if (u.id === editingUser.id) {
          return {
            ...u,
            name: formData.name.trim(),
            email: cleanEmail,
            cellphone: formData.cellphone.trim(),
            profile: cleanProfile,
            avatar: formData.avatar || u.avatar,
            memberTier: formData.memberTier
          };
        }
        return u;
      });
      onUpdateRegisteredUsers(updatedList);
      showToast(`${t.toastUpdated} ${formData.name.trim()}`);
    } else {
      // Check duplicate email
      if (registeredUsers.some(u => u.email.toLowerCase().trim() === cleanEmail.toLowerCase())) {
        setFormError(t.errDuplicate);
        return;
      }

      const newUser: User = {
        id: 'usr-' + Date.now(),
        name: formData.name.trim(),
        email: cleanEmail,
        cellphone: formData.cellphone.trim(),
        profile: cleanProfile,
        avatar: formData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        memberTier: formData.memberTier,
        createdAt: new Date().toISOString().split('T')[0]
      };

      onUpdateRegisteredUsers([newUser, ...registeredUsers]);
      showToast(`${t.toastRegistered} ${newUser.name}`);
    }

    setIsAddModalOpen(false);
  };

  const handleDeleteUser = (user: User) => {
    if (user.email.toLowerCase().trim() === 'luis.delarosacosio@gmail.com') {
      alert(t.devNoDelete);
      return;
    }

    if (window.confirm(`${t.confirmDelete} ${user.name} (${user.email}) ${t.confirmDeleteSub}`)) {
      const updated = registeredUsers.filter(u => u.id !== user.id);
      onUpdateRegisteredUsers(updated);
      showToast(`${t.toastDeleted} ${user.name}`);
    }
  };

  const handleExportCSV = () => {
    const headers = isEs
      ? ['ID', 'Nombre', 'Correo Electrónico', 'Teléfono', 'Perfil / Rol', 'Membresía', 'Fecha de Creación']
      : ['ID', 'Name', 'Email', 'Cellphone', 'Profile / Role', 'Member Tier', 'Created Date'];
    const rows = registeredUsers.map(u => [
      u.id,
      `"${u.name}"`,
      `"${u.email}"`,
      `"${u.cellphone || ''}"`,
      `"${getUserProfile(u)}"`,
      `"${u.memberTier || ''}"`,
      `"${u.createdAt || 'N/A'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `registered_users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(t.toastExported);
  };

  // RESTRICTED VIEW FOR NON-DEVELOPER
  if (!isDeveloper) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 animate-fadeIn">
        <div className="bg-white border-2 border-[#1C1B20] p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="w-16 h-16 bg-[#1C1B20] text-[#B88A58] rounded-full flex items-center justify-center mx-auto border border-[#B88A58] shadow-md">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F4F0EA] border border-[#E8E2D9] text-[#1C1B20] text-xs font-bold uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-[#B88A58]" />
              <span>{t.restrictedBadge}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1B20] font-light">
              {t.restrictedTitle}
            </h1>
            <p className="text-sm text-[#4A4947] max-w-lg mx-auto font-sans leading-relaxed pt-2">
              {t.restrictedDesc}
            </p>
          </div>

          <div className="pt-4 border-t border-[#E8E2D9] max-w-md mx-auto space-y-3">
            <p className="text-xs text-[#8C9083] uppercase tracking-wider">
              {currentUser ? `${t.loggedInAs} ${currentUser.email}` : t.notLoggedInDev}
            </p>

            <button
              id="btn-[#btn-login-as-developer]"
              onClick={onOpenLogin}
              className="w-full py-3.5 bg-[#1C1B20] text-white hover:bg-[#B88A58] transition-all text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <UserIcon className="w-4 h-4 text-[#B88A58]" />
              <span>{t.signInDev}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN DEVELOPER REGISTERED USERS PAGE VIEW
  const totalCount = registeredUsers.length;
  const developerCount = registeredUsers.filter(u => getUserProfile(u) === 'Developer').length;
  const userCount = totalCount - developerCount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1C1B20] text-white px-5 py-3 border border-[#B88A58] shadow-2xl flex items-center gap-3 text-xs font-semibold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-[#B88A58]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#1C1B20] text-[#F4F0EA] p-6 sm:p-8 border border-[#323038] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#B88A58] font-bold">
            <Code className="w-4 h-4" />
            <span>{t.adminControl}</span>
            <span className="bg-[#B88A58] text-white text-[9px] px-2 py-0.5 font-mono rounded-none">{t.devMode}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#F4F0EA]">
            {t.title}
          </h1>
          <p className="text-xs text-[#A8A09B] font-sans max-w-xl">
            {t.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="btn-export-users-csv"
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs uppercase tracking-wider font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#B88A58]" />
            <span>{t.exportCsv}</span>
          </button>
          <button
            id="btn-add-registered-user"
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-[#B88A58] hover:bg-[#a3794b] text-white text-xs uppercase tracking-widest font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addUser}</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#1C1B20] p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#8C9083]">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#4A4947]">{t.totalUsers}</span>
            <Users className="w-4 h-4 text-[#1C1B20]" />
          </div>
          <div className="text-3xl sm:text-4xl font-sans font-bold text-[#1C1B20] tracking-tight tabular-nums mt-2">{totalCount}</div>
          <p className="text-[11px] text-[#8C9083] mt-1">{t.totalUsersDesc}</p>
        </div>

        <div className="bg-white border border-[#1C1B20] p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#8C9083]">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#4A4947]">{t.devAccounts}</span>
            <Code className="w-4 h-4 text-[#B88A58]" />
          </div>
          <div className="text-3xl sm:text-4xl font-sans font-bold text-[#1C1B20] tracking-tight tabular-nums mt-2 flex items-baseline gap-2">
            <span>{developerCount}</span>
            <span className="text-xs text-[#B88A58] font-sans font-semibold tracking-normal">(luis.delarosacosio@gmail.com)</span>
          </div>
          <p className="text-[11px] text-[#8C9083] mt-1">{t.devAccountsDesc}</p>
        </div>

        <div className="bg-white border border-[#1C1B20] p-5 shadow-xs">
          <div className="flex items-center justify-between text-[#8C9083]">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#4A4947]">{t.standardUsers}</span>
            <UserIcon className="w-4 h-4 text-[#1C1B20]" />
          </div>
          <div className="text-3xl sm:text-4xl font-sans font-bold text-[#1C1B20] tracking-tight tabular-nums mt-2">{userCount}</div>
          <p className="text-[11px] text-[#8C9083] mt-1">{t.standardUsersDesc}</p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white border border-[#1C1B20] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C9083]" />
          <input
            id="input-search-users"
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#FBF9F5] border border-[#1C1B20] text-xs text-[#1C1B20] focus:outline-none focus:ring-1 focus:ring-[#1C1B20]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C9083] hover:text-[#1C1B20] text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Profile Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#F4F0EA] p-1 border border-[#1C1B20] w-full sm:w-auto">
          <button
            id="tab-filter-all"
            onClick={() => setRoleFilter('all')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              roleFilter === 'all' ? 'bg-[#1C1B20] text-white shadow-xs' : 'text-[#4A4947] hover:text-[#1C1B20]'
            }`}
          >
            {t.filterAll} ({totalCount})
          </button>
          <button
            id="tab-filter-developer"
            onClick={() => setRoleFilter('developer')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              roleFilter === 'developer' ? 'bg-[#1C1B20] text-white shadow-xs' : 'text-[#4A4947] hover:text-[#1C1B20]'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-[#B88A58]" />
            <span>{t.filterDeveloper} ({developerCount})</span>
          </button>
          <button
            id="tab-filter-user"
            onClick={() => setRoleFilter('user')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              roleFilter === 'user' ? 'bg-[#1C1B20] text-white shadow-xs' : 'text-[#4A4947] hover:text-[#1C1B20]'
            }`}
          >
            {t.filterUsers} ({userCount})
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border-2 border-[#1C1B20] shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1C1B20] text-[#F4F0EA] text-[11px] font-bold uppercase tracking-[0.15em]">
                <th className="py-3.5 px-4 sm:px-6">{t.colName}</th>
                <th className="py-3.5 px-4 sm:px-6">{t.colEmail}</th>
                <th className="py-3.5 px-4 sm:px-6">{t.colPhone}</th>
                <th className="py-3.5 px-4 sm:px-6">{t.colRole}</th>
                <th className="py-3.5 px-4 sm:px-6">{t.colTier}</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">{t.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D9] text-xs font-sans">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8C9083]">
                    <Users className="w-8 h-8 mx-auto mb-2 text-[#8C9083]/60" />
                    <p className="font-semibold text-sm text-[#1C1B20]">{t.noUsersFound}</p>
                    <p className="text-xs mt-0.5">{t.noUsersFoundSub}</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const profile = getUserProfile(user);
                  const isDev = profile === 'Developer';

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-[#FDFBF7] transition-colors ${
                        isDev ? 'bg-[#FBF9F5]/80' : ''
                      }`}
                    >
                      {/* Name & Avatar */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                            alt={user.name}
                            className={`w-9 h-9 rounded-full object-cover border ${
                              isDev ? 'border-2 border-[#B88A58]' : 'border-[#1C1B20]'
                            }`}
                          />
                          <div>
                            <span className="font-bold text-[#1C1B20] text-sm block">
                              {user.name}
                            </span>
                            {isDev && (
                              <span className="text-[10px] font-mono text-[#B88A58] uppercase font-bold tracking-wider">
                                {t.leadDeveloper}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-4 sm:px-6 font-mono text-[#1C1B20]">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#8C9083]" />
                          <span>{user.email}</span>
                        </div>
                      </td>

                      {/* Cellphone */}
                      <td className="py-4 px-4 sm:px-6 font-mono text-[#1C1B20]">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#8C9083]" />
                          <span>{user.cellphone || 'N/A'}</span>
                        </div>
                      </td>

                      {/* Profile (Developer / User) */}
                      <td className="py-4 px-4 sm:px-6">
                        {isDev ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1C1B20] text-[#E8D0B5] text-[10px] font-bold uppercase tracking-widest border border-[#B88A58] shadow-xs">
                            <Code className="w-3 h-3 text-[#B88A58]" />
                            <span>{t.roleDeveloper}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F4F0EA] text-[#1C1B20] text-[10px] font-bold uppercase tracking-wider border border-[#1C1B20]">
                            <UserIcon className="w-3 h-3 text-[#4A4947]" />
                            <span>{t.roleUser}</span>
                          </span>
                        )}
                      </td>

                      {/* Member Tier */}
                      <td className="py-4 px-4 sm:px-6 font-medium text-[#4A4947]">
                        {user.memberTier || t.defaultTier}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(user)}
                            className="p-1.5 bg-[#F4F0EA] hover:bg-[#1C1B20] text-[#1C1B20] hover:text-white border border-[#1C1B20] transition-colors cursor-pointer"
                            title={t.editUser}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {!isDev && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 transition-colors cursor-pointer"
                              title={t.deleteUser}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-[#FBF9F5] border-2 border-[#1C1B20] w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-[#1C1B20] text-white px-6 py-4 flex items-center justify-between border-b border-[#323038]">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#B88A58]" />
                <h3 className="font-serif text-lg tracking-wider">
                  {editingUser ? t.editTitle : t.addTitle}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#A8A09B] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {formError}
                </div>
              )}

              {/* Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#1C1B20] block">
                  {t.fullName}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t.fullNamePlaceholder}
                  className="w-full px-3 py-2 bg-white border border-[#1C1B20] text-xs text-[#1C1B20] focus:outline-none"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#1C1B20] block">
                  {t.email}
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="luis.delarosacosio@gmail.com"
                  className="w-full px-3 py-2 bg-white border border-[#1C1B20] text-xs text-[#1C1B20] focus:outline-none"
                />
              </div>

              {/* Cellphone */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#1C1B20] block">
                  {t.cellphone}
                </label>
                <input
                  type="tel"
                  required
                  value={formData.cellphone}
                  onChange={(e) => setFormData({ ...formData, cellphone: e.target.value })}
                  placeholder="+52 55 1234 5678 or +1 (555) 019-2831"
                  className="w-full px-3 py-2 bg-white border border-[#1C1B20] text-xs text-[#1C1B20] focus:outline-none"
                />
              </div>

              {/* Profile Role Select */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#1C1B20] block">
                  {t.profileRole}
                </label>
                <select
                  value={formData.email.toLowerCase().trim() === 'luis.delarosacosio@gmail.com' ? 'Developer' : formData.profile}
                  disabled={formData.email.toLowerCase().trim() === 'luis.delarosacosio@gmail.com'}
                  onChange={(e) => setFormData({ ...formData, profile: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#1C1B20] text-xs text-[#1C1B20] focus:outline-none"
                >
                  <option value="User">{t.optUser}</option>
                  <option value="Developer">{t.optDeveloper}</option>
                </select>
                {formData.email.toLowerCase().trim() === 'luis.delarosacosio@gmail.com' && (
                  <p className="text-[10px] text-[#B88A58] font-mono font-bold">
                    {t.devLockNote}
                  </p>
                )}
              </div>

              {/* Member Tier */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#1C1B20] block">
                  {t.memberTier}
                </label>
                <input
                  type="text"
                  value={formData.memberTier}
                  onChange={(e) => setFormData({ ...formData, memberTier: e.target.value })}
                  placeholder={t.memberTierPlaceholder}
                  className="w-full px-3 py-2 bg-white border border-[#1C1B20] text-xs text-[#1C1B20] focus:outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E2D9]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-[#1C1B20] text-xs font-bold uppercase tracking-wider text-[#1C1B20] hover:bg-gray-100 cursor-pointer"
                >
                  {t.btnCancel}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#1C1B20] hover:bg-[#B88A58] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md"
                >
                  {editingUser ? t.btnUpdate : t.btnRegister}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
