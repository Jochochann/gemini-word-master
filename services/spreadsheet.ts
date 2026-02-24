import { WordItem, SheetConfig } from '../types';

export const DEFAULT_SHEET_ID = '1Ul94nfm4HbnoIeUyElhBXC6gPOsbbU-nsDjkzoY_gPU';

export const DEFAULT_SHEETS: SheetConfig[] = [
    { name: 'GoFluent', gid: '0', lang: 'en-US' },
    { name: 'Atsueigo', gid: '420352437', lang: 'en-US' },
    { name: 'Atsu構文', gid: '1185143192', lang: 'en-US' },
    { name: '台湾旅行', gid: '1574869365', lang: 'zh-TW' },
    { name: '準備級一級', gid: '1241092806', lang: 'zh-TW' },
    { name: '準備級二級', gid: '2028056660', lang: 'zh-TW' },
    { name: '入門級', gid: '893410915', lang: 'zh-TW' },
    { name: '基礎級', gid: '41161972', lang: 'zh-TW' },
    { name: '進階級', gid: '375418572', lang: 'zh-TW' },
    { name: '高階級', gid: '1954949646', lang: 'zh-TW' },
    { name: '流利級', gid: '1273380145', lang: 'zh-TW' },
    { name: '語法點表', gid: '1856746060', lang: 'zh-TW' }
];

export const extractId = (url: string) => {
    if (url.includes('docs.google.com/spreadsheets')) {
        const idMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
        return idMatch ? idMatch[1] : url.trim();
    }
    return url.trim();
};

export const fetchSpreadsheetWords = async (id: string, gid: string): Promise<WordItem[]> => {
    if (!id) return [];
    const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&gid=${gid || '0'}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('FETCH_FAILED');
    const csvText = await response.text();

    const lines = csvText.split('\n');
    return lines.slice(1).map((line, idx) => {
        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(p => p.replace(/^"|"$/g, '').trim());
        return {
            id: (idx + 1).toString(),
            word: parts[1] || '',
            translation: parts[2] || '',
            definition: parts[2] || '', // Fallback for UI
            example: parts[3] || '',
            exampleTranslation: parts[5] || '', // Column F is index 5
            notes: parts[4] || '',
            _hidden: parts[6]?.toUpperCase() === 'TRUE' // Column G is index 6
        };
    }).filter(w => w.word !== '' && !w._hidden)
        .map(({ _hidden, ...rest }) => rest) as WordItem[];
};
