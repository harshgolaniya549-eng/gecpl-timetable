import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  Search,
  Clock,
  Check,
  Eye,
  X,
  FileText,
  Download,
  Building,
  GraduationCap
} from 'lucide-react';

export const LibraryModule = () => {
  const { libraryBooks, borrowBook, addToast } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [activeReadingBook, setActiveReadingBook] = useState(null);

  const categories = [
    'All',
    'Engineering Mathematics',
    'Engineering Physics',
    'Engineering Chemistry',
    'Data Structures',
    'Database Management Systems',
    'Computer Networks',
    'Operating Systems',
    'Digital Electronics',
    'Engineering Mechanics',
    'Electrical Engineering'
  ];

  const filtered = (libraryBooks || []).filter((b) => {
    const matchCat =
      selectedCat === 'All' ||
      b.category === selectedCat ||
      b.subject === selectedCat;
    const matchSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      (b.subject && b.subject.toLowerCase().includes(search.toLowerCase())) ||
      (b.category && b.category.toLowerCase().includes(search.toLowerCase())) ||
      (b.isbn && b.isbn.includes(search));
    return matchCat && matchSearch;
  });

  const handleOpenReader = (book) => {
    setActiveReadingBook(book);
  };

  const handleDigitalRead = (book) => {
    addToast(`Opening digital campus e-reader for "${book.title}"...`, 'info');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-800">Campus Engineering Library</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                GEC Palanpur
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Prescribed GTU engineering textbooks, digital e-copies, and physical rack references
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>Library Hours: <strong>08:30 AM - 06:00 PM</strong></span>
        </div>
      </div>

      {/* Search & Engineering Subject Filters Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by engineering subject, title, author..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium px-1 flex items-center justify-between sm:justify-end gap-2">
            <span>Showing <strong className="text-slate-800">{filtered.length}</strong> engineering textbooks</span>
          </div>
        </div>

        {/* Scrollable Subject Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCat === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/90'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Engineering Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((book) => (
          <div
            key={book.id}
            className="rounded-3xl bg-white border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Book Cover Image */}
              <div className="h-44 bg-slate-100 overflow-hidden relative">
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80" />
                
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white/95 backdrop-blur-xs text-blue-700 shadow-xs border border-white/50">
                  {book.subject || book.category}
                </span>

                <span className="absolute bottom-2.5 left-3 text-[11px] font-mono text-white/90">
                  {book.shelf}
                </span>
              </div>

              {/* Book Info */}
              <div className="p-4 sm:p-5">
                <h4 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                  {book.title}
                </h4>
                
                <p className="text-xs text-slate-500 mt-1 line-clamp-1 font-medium">
                  By {book.author}
                </p>

                <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {book.description}
                </p>
                
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">{book.edition || 'Engineering Ref'}</span>
                  {book.available ? (
                    <span className="text-emerald-600 font-bold flex items-center space-x-1 text-[11px]">
                      <Check className="w-3.5 h-3.5" />
                      <span>Available</span>
                    </span>
                  ) : (
                    <span className="text-amber-600 font-bold flex items-center space-x-1 text-[11px]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Reserved</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Area: View / Read */}
            <div className="p-4 sm:p-5 pt-0">
              <button
                onClick={() => handleOpenReader(book)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-2 active:scale-98"
              >
                <Eye className="w-4 h-4" />
                <span>View / Read</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
          <h4 className="text-sm font-bold text-slate-600">No engineering textbooks found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or selecting "All" categories to view all prescribed textbooks.
          </p>
          <button
            onClick={() => { setSearch(''); setSelectedCat('All'); }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Interactive View / Read Modal */}
      {activeReadingBook && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4">
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase">
                    {activeReadingBook.subject || activeReadingBook.category}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 mt-1">
                    {activeReadingBook.title}
                  </h3>
                  <p className="text-xs text-slate-500">Author: {activeReadingBook.author}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveReadingBook(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-600 flex-1">
              
              {/* Book Details Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-400 block">Shelf Location</span>
                  <strong className="text-slate-800 text-xs font-mono">{activeReadingBook.shelf}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-400 block">Edition</span>
                  <strong className="text-slate-800 text-xs">{activeReadingBook.edition || 'Current Edition'}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-400 block">Publisher</span>
                  <strong className="text-slate-800 text-xs">{activeReadingBook.publisher || 'Academic Press'}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-400 block">Total Pages</span>
                  <strong className="text-slate-800 text-xs">{activeReadingBook.pages || 'N/A'}</strong>
                </div>
              </div>

              {/* Syllabus / Description */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Course & Syllabus Coverage
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {activeReadingBook.description}
                </p>
              </div>

              {/* Table of Contents Preview */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Key Chapter Modules (GTU Curriculum)
                </h4>
                <div className="space-y-1.5">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                    <span className="font-medium text-slate-700">Module 1: Fundamental Concepts & Theoretical Foundations</span>
                    <span className="text-[11px] text-slate-400 font-mono">pp. 1 - 94</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                    <span className="font-medium text-slate-700">Module 2: Analytical Methods, Algorithms & System Analysis</span>
                    <span className="text-[11px] text-slate-400 font-mono">pp. 95 - 230</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                    <span className="font-medium text-slate-700">Module 3: Practical Laboratory Applications & Case Studies</span>
                    <span className="text-[11px] text-slate-400 font-mono">pp. 231 - 380</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 font-mono">
                ISBN: {activeReadingBook.isbn}
              </span>

              <div className="flex items-center space-x-2.5 w-full sm:w-auto">
                <button
                  onClick={() => setActiveReadingBook(null)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDigitalRead(activeReadingBook)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Read Digital Copy</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
