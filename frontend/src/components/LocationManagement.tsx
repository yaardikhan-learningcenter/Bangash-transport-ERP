/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MapPin, Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import { Location, LocationType, Trip } from '../types';
import { dbService } from '../services/db';

interface LocationManagementProps {
  locations: Location[];
  trips: Trip[];
}

const LOCATION_TYPES: LocationType[] = [
  'City',
  'Warehouse',
  'Port / Terminal',
  'Factory / Plant',
  'Depot / Yard',
  'Other',
];

export const LocationManagement: React.FC<LocationManagementProps> = ({ locations, trips }) => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState<LocationType>('City');
  const [notes, setNotes] = useState('');
  const [active, setActive] = useState(true);

  const usageCount = (locName: string) =>
    trips.filter((t) => t.startingLocation === locName || t.destinationLocation === locName).length;

  const filtered = locations.filter((l) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return l.name.toLowerCase().includes(q) || (l.city || '').toLowerCase().includes(q) || l.type.toLowerCase().includes(q);
  });

  const openAdd = () => {
    setEditingId(null);
    setName('');
    setCity('');
    setType('City');
    setNotes('');
    setActive(true);
    setIsOpen(true);
  };

  const openEdit = (l: Location) => {
    setEditingId(l.id);
    setName(l.name);
    setCity(l.city || '');
    setType(l.type);
    setNotes(l.notes || '');
    setActive(l.active);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        dbService.updateLocation(editingId, { name, city, type, notes, active });
      } else {
        dbService.addLocation({ name, city, type, notes, active });
      }
      setIsOpen(false);
    } catch (err: any) {
      alert(err.message || 'Could not save location');
    }
  };

  const handleDelete = (l: Location) => {
    const used = usageCount(l.name);
    const msg = used
      ? `"${l.name}" is used on ${used} trip(s). Old trips keep their text, but it will no longer appear in the dropdown. Delete anyway?`
      : `Delete location "${l.name}"?`;
    if (confirm(msg)) dbService.deleteLocation(l.id);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" /> Locations Master
          </h2>
          <p className="text-xs text-slate-500">
            Create places here once. They appear as dropdown choices for Starting Location &amp; Destination in New Trip.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Location
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        <input
          type="text"
          placeholder="Search name, city, type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-4">Location Name</th>
              <th className="py-2.5 px-4">City</th>
              <th className="py-2.5 px-4">Type</th>
              <th className="py-2.5 px-4 text-center">Trips</th>
              <th className="py-2.5 px-4">Status</th>
              <th className="py-2.5 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50">
                <td className="py-2.5 px-4 font-bold text-slate-900">{l.name}</td>
                <td className="py-2.5 px-4 text-slate-600">{l.city || '—'}</td>
                <td className="py-2.5 px-4 text-slate-600">{l.type}</td>
                <td className="py-2.5 px-4 text-center font-mono">{usageCount(l.name)}</td>
                <td className="py-2.5 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${l.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                    {l.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-center">
                  <div className="inline-flex gap-2">
                    <button onClick={() => openEdit(l)} className="text-slate-500 hover:text-blue-600 cursor-pointer" title="Edit">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(l)} className="text-slate-400 hover:text-rose-600 cursor-pointer" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No locations yet. Click &quot;Add Location&quot; to create your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl w-full max-w-md text-xs">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-sm font-black text-slate-900">{editingId ? 'Edit Location' : 'Add Location'}</h3>
              <button type="button" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location Name *</label>
                <input
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Port Qasim Terminal Gate 2, Karachi"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value as LocationType)} className="w-full p-2 border border-slate-300 rounded-lg">
                    {LOCATION_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes</label>
                <input value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" />
              </div>
              <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Active (shown in trip dropdowns)
              </label>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer">
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
