export const calculateSimilarity = (str1: string, str2: string): number => {
    if (!str1 || !str2) return 0;

    const clean1 = str1.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
    const clean2 = str2.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();

    if (clean1 === clean2) return 100;
    if (!clean1 || !clean2) return 0;

    const pairs1 = [];
    for (let i = 0; i < clean1.length - 1; i++) {
        pairs1.push(clean1.substring(i, i + 2));
    }

    const pairs2 = [];
    for (let i = 0; i < clean2.length - 1; i++) {
        pairs2.push(clean2.substring(i, i + 2));
    }

    const union = pairs1.length + pairs2.length;
    let intersection = 0;

    for (let i = 0; i < pairs1.length; i++) {
        for (let j = 0; j < pairs2.length; j++) {
            if (pairs1[i] === pairs2[j]) {
                intersection++;
                pairs2.splice(j, 1);
                break;
            }
        }
    }

    return Math.floor((2.0 * intersection) / union * 100);
};
