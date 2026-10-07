import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Headphones,
  Mail,
  Phone,
  HelpCircle,
  MessageSquare,
  Send,
  User,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const SupportModule = () => {
  const { supportFaqs, currentUser, addToast, hod } = useApp();
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Academic Clarification');
  const [ticketMessage, setTicketMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hodInfo = hod || {
    name: "DR. R. H. JAISWAL",
    designation: "Associate Professor & HOD",
    department: "Computer Engineering",
    email: "hod.ce@gecp.ac.in",
    phone: "+91 94280 12345",
    office: "Admin Block C, Room 201"
  };

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!ticketSubject.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setTicketSubject('');
      setTicketMessage('');
      addToast('Support ticket #SUP-2026 created! HOD office notified.', 'success');
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-800">Student Academic Helpdesk</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                GEC Palanpur
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Direct communication for academic grievances, lab schedules, and department requests</p>
          </div>
        </div>

        <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Helpdesk Online</span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: HOD Card & Query Form (Col 7) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* HOD Card */}
          <div className="rounded-3xl bg-white border border-slate-200/90 p-6 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Head of Department (HOD)
            </h3>
            
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 ring-2 ring-blue-50 shrink-0">
                <User className="w-7 h-7 text-slate-400" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800">{hodInfo.name}</h4>
                <p className="text-xs text-slate-500">{hodInfo.designation || 'HOD'} &bull; {hodInfo.department || 'Computer Engineering'}</p>
                <p className="text-[11px] text-blue-600 font-medium mt-0.5">{hodInfo.office || 'Office: Admin Block C, Room 201'}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center space-x-2 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{hodInfo.email || 'hod.ce@gecp.ac.in'}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{hodInfo.phone || '+91 94280 12345'}</span>
              </div>
            </div>
          </div>

          {/* Ticket Form */}
          <div className="rounded-3xl bg-white border border-slate-200/90 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>Submit an Academic Request</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">Official response processed via Department Academic Cell</p>

            <form onSubmit={handleSubmitTicket} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Category</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="Academic Clarification">Academic Clarification / Attendance Query</option>
                  <option value="Timetable Clash">Timetable Clash or Lab Batch Swap</option>
                  <option value="Bonafide Certificate">Bonafide / Recommendation Letter Request</option>
                  <option value="Examination Grievance">Examination / Re-checking Grievance</option>
                  <option value="Library Resource Request">Library Resource / Book Request</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject / Summary</label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. Discrepancy in Mathematics - III Attendance Record"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Explain your issue clearly with lecture date or reference numbers..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <span>Dispatching Ticket...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Support Ticket</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

        {/* Right: FAQs (Col 5) */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>Frequently Asked Questions</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">Quick answers to common institutional queries</p>

            <div className="space-y-4">
              {(supportFaqs || []).map((faq, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 text-xs">
                  <h4 className="font-bold text-slate-800 mb-1 leading-snug">
                    {faq.q}
                  </h4>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-6 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Dean of Student Affairs Office</span>
            <span>Helpline: ext. 402</span>
          </div>
        </div>

      </div>

    </div>
  );
};
