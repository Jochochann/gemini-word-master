import { useCallback } from 'react';

export const useSpeech = () => {
    const speak = useCallback((text: string, lang: string = 'en-US', rate: number = 0.85, onEnd?: () => void) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = rate;
        if (onEnd) {
            utterance.onend = onEnd;
        }
        window.speechSynthesis.speak(utterance);
    }, []);

    const cancel = useCallback(() => {
        window.speechSynthesis.cancel();
    }, []);

    return { speak, cancel };
};
