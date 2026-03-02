"use client";

import { usePathname } from 'next/navigation';
import { driver, Config, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { tutorialSteps } from '@/lib/tutorials';

let isTutorialPlaying = false;

export function useTutorial() {
    const pathname = usePathname();

    const startTutorial = (forcePlay: boolean = false) => {
        if (!pathname || !tutorialSteps[pathname]) return;

        const hasSeen = localStorage.getItem(`tutorial_seen_${pathname}`);

        if ((!hasSeen || forcePlay) && !isTutorialPlaying) {
            isTutorialPlaying = true;
            // Slight delay to ensure DOM is fully rendered
            setTimeout(() => {
                const d = driver({
                    showProgress: true,
                    theme: {
                        colors: {
                            primary: 'var(--color-primary, #14b8a6)',
                            background: '#ffffff',
                            border: 'var(--color-secondary-dark, #4f46e5)',
                            text: '#334155'
                        },
                    },
                    nextBtnText: 'Next',
                    prevBtnText: 'Back',
                    doneBtnText: 'Get Started',
                    popoverClass: 'driverjs-theme', // Custom class for rounding
                    onDestroyed: () => {
                        isTutorialPlaying = false;
                    }
                } as Config);

                d.setSteps(tutorialSteps[pathname]);
                d.drive();
                localStorage.setItem(`tutorial_seen_${pathname}`, 'true');
            }, 500);
        }
    };

    return { startTutorial };
}
