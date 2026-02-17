import React, { useState } from 'react';
import { SheetConfig } from '../types';
import { ChevronDown } from 'lucide-react';

interface LanguageSelectorProps {
    label: string;
    sheets: SheetConfig[];
    type: 'en' | 'tw';
    active: boolean;
    currentSheetName?: string;
    onSelectSheet: (gid: string) => void;
    openDropdown: 'en' | 'tw' | null;
    setOpenDropdown: (type: 'en' | 'tw' | null) => void;
    currentSheetGid: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
    label,
    sheets,
    type,
    active,
    currentSheetName,
    onSelectSheet,
    openDropdown,
    setOpenDropdown,
    currentSheetGid
}) => {
    return (
        <div className="relative flex-shrink-0">
            <button
                onClick={() => setOpenDropdown(openDropdown === type ? null : type)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl border transition-all text-xs font-bold whitespace-nowrap ${active
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                    }`}
            >
                <span className="tracking-widest uppercase">{label}</span>
                {active && <span className="opacity-80 font-medium truncate max-w-[60px] sm:max-w-[100px]">| {currentSheetName}</span>}
                <ChevronDown size={14} className={`transition-transform flex-shrink-0 ${openDropdown === type ? 'rotate-180' : ''}`} />
            </button>

            {openDropdown === type && (
                <>
                    <div className="fixed inset-0 z-20" onClick={() => setOpenDropdown(null)} />
                    <div className="absolute top-full left-0 mt-2 w-48 sm:w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-30 py-1.5 overflow-hidden animate-in fade-in zoom-in duration-150">
                        {sheets.length > 0 ? sheets.map((sheet) => (
                            <button
                                key={sheet.gid}
                                onClick={() => { setOpenDropdown(null); onSelectSheet(sheet.gid); }}
                                className={`w-full text-left px-4 py-3 text-xs font-bold transition-all ${currentSheetGid === sheet.gid ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                            >
                                {sheet.name}
                            </button>
                        )) : (
                            <div className="px-4 py-3 text-[10px] text-slate-600 italic">No sheets configured</div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default LanguageSelector;
