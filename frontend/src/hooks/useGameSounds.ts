import { useCallback } from 'react';

// Si no tens els fitxers encara, no petarà, simplement no sonarà.
// Crea la carpeta /public/sounds/ i afegeix fitxers amb aquests noms:
const SOUNDS = {
    pop: '/sounds/pop.mp3',       // Al passar per sobre una carta
    click: '/sounds/click.mp3',   // Al seleccionar
    win: '/sounds/win.mp3',       // Victòria
    lose: '/sounds/lose.mp3',     // Derrota
    alert: '/sounds/alert.mp3',   // El teu torn
    success: '/sounds/success.mp3', // Resposta SÍ
    error: '/sounds/error.mp3'    // Resposta NO / Error
};

export const useGameSounds = () => {
    const playSound = useCallback((soundName: keyof typeof SOUNDS) => {
        try {
            const audio = new Audio(SOUNDS[soundName]);
            audio.volume = 0.4; // Volum al 40% perquè no molesti
            audio.play().catch(e => {
                // Ignorem errors d'autoplay (comú en navegadors si no hi ha interacció prèvia)
                // console.warn("Sound blocked:", e);
            });
        } catch (error) {
            console.error("Error playing sound", error);
        }
    }, []);

    return {
        playPop: () => playSound('pop'),
        playClick: () => playSound('click'),
        playWin: () => playSound('win'),
        playLose: () => playSound('lose'),
        playAlert: () => playSound('alert'),
        playSuccess: () => playSound('success'),
        playError: () => playSound('error'),
    };
};