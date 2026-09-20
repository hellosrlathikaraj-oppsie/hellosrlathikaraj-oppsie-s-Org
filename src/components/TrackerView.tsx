import React, { useState } from 'react';
import { 
  Send, 
  Download, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  Trash2, 
  Edit2, 
  AlertCircle, 
  ArrowUpRight,
  ChevronDown,
  Calendar,
  ExternalLink,
  Users
} from 'lucide-react';
import { TrackerEntry, OutreachStatus, NavigationTab } from '../types';
import { storage } from '../services/storage';
import { ManualOutreachModal } from './ManualOutreachModal';

interface TrackerViewProps {
  entries: TrackerEntry[];
  onUpdateEntries: (updated: TrackerEntry[]) => void;
  onNavigateToProfessor?: (professorId: string) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export function TrackerView({
  entries,
  onUpdateEntries,
  onNavigateToProfessor,
  onShowToast,
}: TrackerViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [editingNotesText, setEditingNotesText] = useState('');

  // 1. Dynamic Calculations from actual entries
  const totalCount = entries.length;
  const pendingCount = entries.filter(e => e.status === 'Sent' || e.status === 'Followed Up').length;
  const repliedCount = entries.filter(e => e.status === 'Replied' || e.status === 'Meeting Booked').length;
  const meetingCount = entries.filter(e => e.status === 'Meeting Booked').length;
  const replyRatePercent = totalCount > 0 ? Math.round((repliedCount / totalCount) * 100) : 0;

  // Status breakdown for follow-up chart
  const statusCounts: Record<OutreachStatus, number> = {
    'Sent': entries.filter(e => e.status === 'Sent').length,
    'Followed Up': entries.filter(e => e.status === 'Followed Up').length,
    'Replied': entries.filter(e => e.status === 'Replied').length,
    'Meeting Booked': entries.filter(e => e.status === 'Meeting Booked').length,
    'Not Interested': entries.filter(e => e.status === 'Not Interested').length,
  };

  // Status colors & styles
  const statusConfig: Record<OutreachStatus, { bg: string; text: string; border: string }> = {
    'Sent': { bg: 'bg-blue-950/60', text: 'text-blue-300', border: 'border-blue-700/50' },
    'Followed Up': { bg: 'bg-amber-950/60', text: 'text-amber-300', border: 'border-amber-700/50' },
    'Replied': { bg: 'bg-emerald-950/60', text: 'text-emerald-300', border: 'border-emerald-700/50' },
    'Meeting Booked': { bg: 'bg-purple-950/60', text: 'text-purple-300', border: 'border-purple-700/50' },
    'Not Interested': { bg: 'bg-slate-900', text: 'text-slate-400', border: 'border-slate-800' },
  };

  // Filtered entries
  const filteredEntries = entries.filter(item => {
    const matchesSearch = 
      item.professorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.subject && item.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle status update
  const handleStatusChange = (id: string, newStatus: OutreachStatus) => {
    const updated = storage.updateTrackerEntry(id, { 
      status: newStatus,
      lastContactDate: new Date().toISOString().slice(0, 10),
    });
    onUpdateEntries(updated);
    onShowToast(`Updated status to "${newStatus}"`, undefined, 'success');
  };

  // Handle delete
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Remove outreach record for ${name}?`)) {
      const updated = storage.deleteTrackerEntry(id);
      onUpdateEntries(updated);
      onShowToast(`Removed ${name} from tracker`, undefined, 'info');
    }
  };

  // Handle note save
  const handleSaveNote = (id: string) => {
    const updated = storage.updateTrackerEntry(id, { notes: editingNotesText });
    onUpdateEntries(updated);
    setEditingNotesId(null);
    onShowToast('Notes updated', undefined, 'success');
  };

  // Handle CSV Export
  const handleExportCSV = () => {
    if (entries.length === 0) {
      onShowToast('No outreach entries to export', undefined, 'info');
      return;
    }
    storage.exportTrackerToCSV(entries);
    onShowToast('Exported tracker entries to CSV', undefined, 'success');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight font-sans">
            Outreach Pipeline
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time outreach tracking, response metrics, and follow-up reminders
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Export CSV button (as mandated) */}
          <button
            id="export-csv-button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#131b2e] hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export CSV</span>
          </button>

          {/* Log Manual Outreach button (as mandated) */}
          <button
            id="log-manual-outreach-btn"
            onClick={() => setIsManualModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer font-sans"
          >
            <Plus className="w-4 h-4" />
            <span>Log Manual Outreach</span>
          </button>
        </div>
      </div>

      {/* Dynamic Metrics Cards (computed directly from actual tracker entries) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Contacted */}
        <div className="bg-[#0e1422] rounded-2xl border border-slate-800/90 p-4 sm:p-5 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Contacted</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Send className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
              {totalCount}
            </span>
            <span className="text-[11px] text-slate-400">faculty contacted</span>
          </div>
        </div>

        {/* Pending Replies */}
        <div className="bg-[#0e1422] rounded-2xl border border-slate-800/90 p-4 sm:p-5 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Awaiting Reply</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-300">
              {pendingCount}
            </span>
            <span className="text-[11px] text-slate-400">pending response</span>
          </div>
        </div>

        {/* Replied / Meetings */}
        <div className="bg-[#0e1422] rounded-2xl border border-slate-800/90 p-4 sm:p-5 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Responses & Calls</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-300">
              {repliedCount}
            </span>
            <span className="text-[11px] text-slate-400">
              ({meetingCount} booked calls)
            </span>
          </div>
        </div>

        {/* Reply Rate % (computed dynamically) */}
        <div className="bg-[#0e1422] rounded-2xl border border-slate-800/90 p-4 sm:p-5 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Reply Rate</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-indigo-300">
              {replyRatePercent}%
            </span>
            <span className="text-[11px] text-slate-400">computed from logs</span>
          </div>
        </div>
      </div>

      {/* Follow-up Pipeline Visual Chart (computed dynamically) */}
      <div className="bg-[#0e1422] rounded-2xl border border-slate-800/90 p-5 shadow-lg shadow-black/20 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
            Pipeline Distribution
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {totalCount} total logged outreach events
          </span>
        </div>

        {/* Distribution Progress Bar */}
        {totalCount > 0 ? (
          <div className="space-y-3">
            <div className="h-3 w-full bg-slate-900 rounded-full flex overflow-hidden p-0.5 border border-slate-800">
              {statusCounts['Meeting Booked'] > 0 && (
                <div
                  title={`Meeting Booked: ${statusCounts['Meeting Booked']}`}
                  style={{ width: `${(statusCounts['Meeting Booked'] / totalCount) * 100}%` }}
                  className="bg-purple-500 h-full first:rounded-l-full last:rounded-r-full transition-all duration-500"
                />
              )}
              {statusCounts['Replied'] > 0 && (
                <div
                  title={`Replied: ${statusCounts['Replied']}`}
                  style={{ width: `${(statusCounts['Replied'] / totalCount) * 100}%` }}
                  className="bg-emerald-500 h-full first:rounded-l-full last:rounded-r-full transition-all duration-500"
                />
              )}
              {statusCounts['Followed Up'] > 0 && (
                <div
                  title={`Followed Up: ${statusCounts['Followed Up']}`}
                  style={{ width: `${(statusCounts['Followed Up'] / totalCount) * 100}%` }}
                  className="bg-amber-500 h-full first:rounded-l-full last:rounded-r-full transition-all duration-500"
                />
              )}
              {statusCounts['Sent'] > 0 && (
                <div
                  title={`Sent: ${statusCounts['Sent']}`}
                  style={{ width: `${(statusCounts['Sent'] / totalCount) * 100}%` }}
                  className="bg-blue-500 h-full first:rounded-l-full last:rounded-r-full transition-all duration-500"
                />
              )}
              {statusCounts['Not Interested'] > 0 && (
                <div
                  title={`Not Interested: ${statusCounts['Not Interested']}`}
                  style={{ width: `${(statusCounts['Not Interested'] / totalCount) * 100}%` }}
                  className="bg-slate-700 h-full first:rounded-l-full last:rounded-r-full transition-all duration-500"
                />
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>Meeting Booked ({statusCounts['Meeting Booked']})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Replied ({statusCounts['Replied']})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Followed Up ({statusCounts['Followed Up']})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Sent ({statusCounts['Sent']})</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <span>Not Interested ({statusCounts['Not Interested']})</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="py-2 text-xs text-slate-500">
            No outreach recorded yet. Use "Mark as Sent" in Professor Detail or "Log Manual Outreach" above.
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter tracker by name, university, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0e1422] text-xs text-slate-200 placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:border-indigo-500 outline-none"
          />
        </div>

        {/* Status Tab Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 bg-[#0e1422] p-1 rounded-xl border border-slate-800 text-xs">
          {['All', 'Sent', 'Followed Up', 'Replied', 'Meeting Booked', 'Not Interested'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Tracker Table Container (with horizontal scroll on small screens as strictly mandated!) */}
      <div className="bg-[#0e1422] rounded-2xl border border-slate-800/90 shadow-xl shadow-black/20 overflow-hidden">
        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center max-w-md mx-auto">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-white mb-1">No outreach records found</h4>
            <p className="text-xs text-slate-400 mb-5">
              {searchQuery || statusFilter !== 'All'
                ? 'No entries match your current search or status filter.'
                : 'Your outreach pipeline is currently empty. Start by browsing faculty in Discover or logging a manual entry.'}
            </p>
            {searchQuery || statusFilter !== 'All' ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('All');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => setIsManualModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow cursor-pointer"
              >
                Log First Outreach
              </button>
            )}
          </div>
        ) : (
          /* Strictly horizontal scrollable container to prevent Notes from cutting off */
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[840px]">
              <thead>
                <tr className="border-b border-slate-800/80 bg-[#121929] text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4 font-semibold">Professor & Affiliation</th>
                  <th className="py-3 px-4 font-semibold">Subject / Hook</th>
                  <th className="py-3 px-4 font-semibold">Date Sent</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold min-w-[200px]">Notes</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredEntries.map((entry) => {
                  const cfg = statusConfig[entry.status] || statusConfig['Sent'];
                  const isEditingNotes = editingNotesId === entry.id;

                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* Professor info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-700/60 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                            {entry.professorName
                              .split(' ')
                              .map(p => p[0])
                              .filter(Boolean)
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-100 truncate">
                              {entry.professorName}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {entry.institution}
                            </p>
                            <span className="text-[10px] font-mono text-indigo-300/80 truncate block">
                              {entry.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Subject / Hook */}
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <p className="font-medium text-slate-200 truncate" title={entry.subject}>
                          {entry.subject}
                        </p>
                        {entry.hookSnippet && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5" title={entry.hookSnippet}>
                            {entry.hookSnippet}
                          </p>
                        )}
                      </td>

                      {/* Date Sent */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-slate-300">
                          {entry.dateSent}
                        </span>
                        {entry.followUpDue && (
                          <span className="block text-[10px] font-mono text-amber-400 font-bold mt-0.5">
                            Follow-up Due!
                          </span>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="relative inline-block">
                          <select
                            value={entry.status}
                            onChange={(e) => handleStatusChange(entry.id, e.target.value as OutreachStatus)}
                            className={`appearance-none text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${cfg.bg} ${cfg.text} ${cfg.border} pr-6 outline-none cursor-pointer`}
                          >
                            <option value="Sent" className="bg-[#111827] text-blue-300">Sent</option>
                            <option value="Followed Up" className="bg-[#111827] text-amber-300">Followed Up</option>
                            <option value="Replied" className="bg-[#111827] text-emerald-300">Replied</option>
                            <option value="Meeting Booked" className="bg-[#111827] text-purple-300">Meeting Booked</option>
                            <option value="Not Interested" className="bg-[#111827] text-slate-400">Not Interested</option>
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-70" />
                        </div>
                      </td>

                      {/* Notes Column (with inline edit) */}
                      <td className="py-3.5 px-4 min-w-[220px]">
                        {isEditingNotes ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={editingNotesText}
                              onChange={(e) => setEditingNotesText(e.target.value)}
                              className="bg-[#131b2c] text-xs text-slate-100 px-2.5 py-1 rounded border border-indigo-500 outline-none w-full"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveNote(entry.id);
                                if (e.key === 'Escape') setEditingNotesId(null);
                              }}
                            />
                            <button
                              onClick={() => handleSaveNote(entry.id)}
                              className="px-2 py-1 bg-indigo-600 text-white rounded text-[11px] font-bold cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              setEditingNotesId(entry.id);
                              setEditingNotesText(entry.notes || '');
                            }}
                            className="text-xs text-slate-300 leading-relaxed cursor-pointer hover:text-white p-1 rounded hover:bg-slate-800/60 transition-colors flex items-start justify-between gap-1 group/note"
                            title="Click to edit notes"
                          >
                            <span className="line-clamp-2">
                              {entry.notes || <span className="text-slate-500 italic">Add notes...</span>}
                            </span>
                            <Edit2 className="w-3 h-3 text-slate-500 opacity-0 group-hover/note:opacity-100 transition-opacity shrink-0 mt-0.5" />
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {entry.professorId && onNavigateToProfessor && (
                            <button
                              onClick={() => onNavigateToProfessor(entry.professorId!)}
                              className="p-1.5 text-slate-400 hover:text-indigo-300 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                              title="View Professor Details & Hooks"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(entry.id, entry.professorName)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Outreach Modal */}
      <ManualOutreachModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onAdded={(newEntry) => {
          onUpdateEntries([newEntry, ...entries]);
        }}
        onShowToast={onShowToast}
      />
    </div>
  );
}
