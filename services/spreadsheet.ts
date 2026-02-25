import { WordItem, SheetConfig, EssayItem } from '../types';
import {
    DEFAULT_SHEET_ID,
    DEFAULT_SHEETS,
    DEFAULT_ESSAY_SHEETS,
} from '../config/sheets';

// 他モジュールが今まで通りこのファイルからインポートできるよう再エクスポート
export { DEFAULT_SHEET_ID, DEFAULT_SHEETS, DEFAULT_ESSAY_SHEETS };
export type { SheetConfig };

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



/**
 * gviz JSON レスポンスの型定義
 */
interface GvizResponse {
    table?: {
        rows?: Array<{
            c: Array<{ v: string | number | null } | null>;
        }>;
    };
}

/**
 * エッセイシートを取得する（gviz JSON形式）
 * 列構成: A=タイトル, B=エッセイ本文, C=ピンイン, D=日本語訳, E=言語
 * gviz JSON は改行・引用符を安全に処理するため CSV より確実
 */
export const fetchEssays = async (id: string, gid: string): Promise<EssayItem[]> => {
    if (!id) return [];
    // tqx=out:json で JSON 形式を要求（CSV より多行セルに強い）
    const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json&gid=${gid || '0'}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('FETCH_FAILED');
    const text = await response.text();

    // gviz は純粋な JSON でなく JS コールバック形式で返ってくるので、
    // 最初の { から最後の } まで切り出して JSON.parse する
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) return [];

    let data: GvizResponse;
    try {
        data = JSON.parse(text.slice(start, end + 1));
    } catch (e) {
        throw new Error('PARSE_FAILED');
    }

    const rows = data?.table?.rows || [];

    // gviz が parsedNumHeaders:0 を返す場合、rows[0] がヘッダー行になるためスキップ
    return rows.slice(1)
        .map((row, idx) => {
            const cells = row?.c || [];
            const getVal = (i: number): string => {
                const cell = cells[i];
                if (!cell || cell.v === null || cell.v === undefined) return '';
                return String(cell.v).trim();
            };

            const title = getVal(0);
            if (!title) return null;

            return {
                id: (idx + 1).toString(),
                title,
                essay: getVal(1),
                pinyin: getVal(2) || undefined,
                translation: getVal(3),
                lang: getVal(4) || 'zh-TW',
            } as EssayItem;
        })
        .filter(Boolean) as EssayItem[];
};

