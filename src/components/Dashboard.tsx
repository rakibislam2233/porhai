"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  FileText, Calendar, Layers, Search,
  Trash2, BookOpen, ChevronRight, User,
  Home, FolderOpen, Settings, LogOut, Menu, X,
  Mail, Camera, Shield, AlertTriangle,
  BarChart3, Clock, MessageSquare, HardDrive
} from 'lucide-react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import { PDFDocument } from '@/types/chat';

type ActiveView = 'documents' | 'profile' | 'settings';

interface DashboardProps {
  documents: PDFDocument[];
  onSelectDoc: (doc: PDFDocument) => void;
  onDeleteDoc: (id: string) => void;
}

export default function Dashboard({ documents, onSelectDoc, onDeleteDoc }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: session } = authClient.useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>('documents');

  // Profile form state
  const [profileName, setProfileName] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Settings state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const filteredDocs = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = '/';
  };

  const handleProfileSave = () => {
    setProfileSaving(true);
    setTimeout(() => {
      setProfileSaving(false);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    }, 800);
  };

  const handleDeleteAccount = () => {
    // Placeholder for real delete logic
    alert('Account deletion requested. This would be handled by the backend.');
    setDeleteConfirmOpen(false);
  };

  const userName = session?.user?.name || 'User';
  const userEmail = session?.user?.email || '';
  const userInitial = userName.charAt(0).toUpperCase();

  // Calculate stats
  const totalPages = documents.reduce((sum, doc) => sum + doc.pageCount, 0);

  const navItems: { id: ActiveView; label: string; icon: React.ReactNode }[] = [
    { id: 'documents', label: 'My Documents', icon: <FolderOpen size={18} /> },
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  const handleNavClick = (view: ActiveView) => {
    setActiveView(view);
    setIsSidebarOpen(false);
    if (view === 'profile') {
      setProfileName(userName);
    }
  };

  // Page title based on active view
  const pageTitle = activeView === 'documents' ? 'My Documents' : activeView === 'profile' ? 'Profile' : 'Settings';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-cyan-100 flex">

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col z-50 transform transition-transform duration-200 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-200 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">Porhai</span>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-slate-400">
            <X size={18} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link href="/" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 transition-colors">
            <Home size={18} className="text-slate-400" />
            <span>Home</span>
          </Link>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeView === item.id
                  ? 'bg-cyan-50 text-cyan-700 border border-cyan-100'
                  : 'text-slate-600 border border-transparent'
              }`}
            >
              <span className={activeView === item.id ? 'text-cyan-600' : 'text-slate-400'}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Profile Card */}
        <div className="px-3 py-4 border-t border-slate-200">
          <div className="flex items-center space-x-3 px-3 py-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="w-9 h-9 rounded-full bg-cyan-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {session?.user?.image ? (
                <img src={session.user.image} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                userInitial
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 truncate">{userName}</p>
              <p className="text-xs text-slate-500 truncate">{userEmail}</p>
            </div>
            <button onClick={handleSignOut} className="text-slate-400 p-1 flex-shrink-0" title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-600">
                <Menu size={20} />
              </button>
              <div>
                <h1 className="text-lg font-bold text-slate-900">{pageTitle}</h1>
                {activeView === 'documents' && (
                  <p className="text-xs text-slate-500">{documents.length} document{documents.length !== 1 ? 's' : ''} uploaded</p>
                )}
                {activeView === 'profile' && (
                  <p className="text-xs text-slate-500">Manage your account information</p>
                )}
                {activeView === 'settings' && (
                  <p className="text-xs text-slate-500">Account preferences and security</p>
                )}
              </div>
            </div>
            {activeView === 'documents' && (
              <div className="relative w-48 sm:w-72">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none"><Search size={16} /></span>
                <input
                  type="text" placeholder="Search your PDFs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-600 focus:border-cyan-600 transition-colors"
                />
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 px-4 sm:px-8 py-8">

          {/* ========== DOCUMENTS VIEW ========== */}
          {activeView === 'documents' && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Documents', value: documents.length, icon: <FileText size={18} className="text-cyan-600" /> },
                  { label: 'Total Pages', value: totalPages, icon: <Layers size={18} className="text-cyan-600" /> },
                  { label: 'Chat Sessions', value: documents.length, icon: <MessageSquare size={18} className="text-cyan-600" /> },
                  { label: 'Storage Used', value: `${(documents.length * 1.8).toFixed(1)} MB`, icon: <HardDrive size={18} className="text-cyan-600" /> },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                      {stat.icon}
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Recent Activity */}
              {documents.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 mb-8">
                  <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
                    <Clock size={16} className="text-slate-400" />
                    <span>Recent Activity</span>
                  </h3>
                  <div className="space-y-3">
                    {documents.slice(0, 3).map((doc) => (
                      <div key={doc.id} className="flex items-center space-x-3 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 flex-shrink-0" />
                        <span className="text-slate-700 flex-1 truncate">
                          Uploaded <span className="font-semibold text-slate-900">{doc.name}</span>
                        </span>
                        <span className="text-xs text-slate-400 flex-shrink-0">{doc.uploadedAt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Document Grid */}
              <div className="mb-4">
                <h2 className="text-base font-bold text-slate-900">All Documents</h2>
              </div>
              {filteredDocs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center mb-4 border border-slate-200">
                    <FileText size={24} className="text-slate-400" />
                  </div>
                  <p className="text-slate-900 font-bold mb-1">No documents found</p>
                  <p className="text-slate-500 text-sm">Upload your first PDF from the <Link href="/" className="text-cyan-600 font-semibold">home page</Link> to start chatting.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredDocs.map((doc, idx) => (
                    <motion.div
                      key={doc.id} layoutId={`doc-card-${doc.id}`} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05, duration: 0.2 }}
                      className="group flex flex-col bg-white rounded-xl border border-slate-200 transition-colors duration-200 overflow-hidden"
                    >
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-2.5 bg-cyan-50 border border-cyan-100 text-cyan-600 rounded-lg">
                            <FileText size={20} />
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); onDeleteDoc(doc.id); }} className="text-slate-400 p-1.5 rounded-md focus:outline-none">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <h3 className="font-bold text-slate-900 text-base line-clamp-2 leading-snug mb-4 flex-1">{doc.name}</h3>
                        <div className="grid grid-cols-2 gap-y-2 gap-x-2 text-xs font-medium text-slate-600 bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                          <div className="flex items-center space-x-1.5"><Layers size={14} className="text-slate-400" /><span>{doc.pageCount} Pages</span></div>
                          <div className="flex items-center space-x-1.5"><BookOpen size={14} className="text-slate-400" /><span>{doc.size}</span></div>
                          <div className="col-span-2 flex items-center space-x-1.5 pt-1.5 mt-0.5 border-t border-slate-200 text-slate-500"><Calendar size={12} className="text-slate-400" /><span>{doc.uploadedAt}</span></div>
                        </div>
                      </div>
                      <button onClick={() => onSelectDoc(doc)} className="w-full bg-slate-50 border-t border-slate-200 text-cyan-700 font-bold text-sm py-3 flex items-center justify-center space-x-1.5">
                        <span>Open Chat</span><ChevronRight size={16} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ========== PROFILE VIEW ========== */}
          {activeView === 'profile' && (
            <div className="max-w-2xl">
              {/* Avatar Section */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Profile Picture</h3>
                <div className="flex items-center space-x-5">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-cyan-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                      {session?.user?.image ? (
                        <img src={session.user.image} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        userInitial
                      )}
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500">
                      <Camera size={14} />
                    </button>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{userName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Click the camera icon to change your avatar</p>
                  </div>
                </div>
              </div>

              {/* Profile Info Form */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><User size={16} /></span>
                      <input
                        type="text"
                        value={profileName || userName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full text-sm pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-600 focus:border-cyan-600 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400"><Mail size={16} /></span>
                      <input
                        type="email"
                        value={userEmail}
                        disabled
                        className="w-full text-sm pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Email is managed by your social login provider and cannot be changed here.</p>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center space-x-3">
                  <button
                    onClick={handleProfileSave}
                    disabled={profileSaving}
                    className="px-5 py-2 bg-cyan-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
                  >
                    {profileSaving ? 'Saving...' : profileSaved ? 'Saved ✓' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setProfileName(userName)}
                    className="px-5 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Account Stats */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Account Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <p className="text-xs text-slate-500 font-semibold mb-1">Documents</p>
                    <p className="text-xl font-bold text-slate-900">{documents.length}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <p className="text-xs text-slate-500 font-semibold mb-1">Total Pages</p>
                    <p className="text-xl font-bold text-slate-900">{totalPages}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <p className="text-xs text-slate-500 font-semibold mb-1">Auth Provider</p>
                    <p className="text-sm font-bold text-slate-900">Social Login</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <p className="text-xs text-slate-500 font-semibold mb-1">Account Status</p>
                    <p className="text-sm font-bold text-emerald-600">Active</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========== SETTINGS VIEW ========== */}
          {activeView === 'settings' && (
            <div className="max-w-2xl">
              {/* Security */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                <h3 className="text-sm font-bold text-slate-900 mb-1">Security</h3>
                <p className="text-xs text-slate-500 mb-5">Manage your account security settings.</p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <Shield size={16} className="text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Change Password</p>
                        <p className="text-xs text-slate-500">Update your account password</p>
                      </div>
                    </div>
                    <button className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors">
                      Update
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <Mail size={16} className="text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Connected Accounts</p>
                        <p className="text-xs text-slate-500">Google, GitHub linked to your profile</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">Connected</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <LogOut size={16} className="text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Sign Out</p>
                        <p className="text-xs text-slate-500">Log out of your account on this device</p>
                      </div>
                    </div>
                    <button onClick={handleSignOut} className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors">
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>

              {/* Data & Storage */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                <h3 className="text-sm font-bold text-slate-900 mb-1">Data & Storage</h3>
                <p className="text-xs text-slate-500 mb-5">Manage your documents and storage.</p>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-600">Storage Used</span>
                      <span className="text-xs font-bold text-slate-900">{(documents.length * 1.8).toFixed(1)} MB / 500 MB</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-600 rounded-full transition-all" style={{ width: `${Math.min((documents.length * 1.8 / 500) * 100, 100)}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3 border-t border-slate-100">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Clear All Documents</p>
                      <p className="text-xs text-slate-500">Remove all uploaded PDFs and chat history</p>
                    </div>
                    <button className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors">
                      Clear All
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white rounded-xl border border-red-200 p-6">
                <h3 className="text-sm font-bold text-red-600 mb-1 flex items-center space-x-2">
                  <AlertTriangle size={16} />
                  <span>Danger Zone</span>
                </h3>
                <p className="text-xs text-slate-500 mb-5">Irreversible actions. Please be careful.</p>

                {!deleteConfirmOpen ? (
                  <button
                    onClick={() => setDeleteConfirmOpen(true)}
                    className="px-5 py-2 bg-white border border-red-300 text-red-600 text-sm font-semibold rounded-lg transition-colors"
                  >
                    Delete My Account
                  </button>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800 font-semibold mb-1">Are you sure?</p>
                    <p className="text-xs text-red-600 mb-4">
                      This will permanently delete your account, all uploaded documents, and chat history. This action cannot be undone.
                    </p>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleDeleteAccount}
                        className="px-4 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        Yes, Delete Everything
                      </button>
                      <button
                        onClick={() => setDeleteConfirmOpen(false)}
                        className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
