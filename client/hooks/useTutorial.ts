"use client";

import { usePathname } from 'next/navigation';
import { driver, Config, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { tutorialSteps } from '@/lib/tutorials';

let isTutorialPlaying = false;
let currentDriver: any = null;

export function useTutorial() {
    const pathname = usePathname();

    const startTutorial = (forcePlay: boolean = false) => {
        if (!pathname || !tutorialSteps[pathname]) return;

        const hasSeen = localStorage.getItem(`tutorial_seen_${pathname}`);

        if ((!hasSeen || forcePlay) && !isTutorialPlaying) {
            isTutorialPlaying = true;

            // If there's an existing driver, destroy it cleanly first
            if (currentDriver) {
                try {
                    currentDriver.destroy();
                } catch (e) { }
                currentDriver = null;
            }

            // Slight delay to ensure DOM is fully rendered
            setTimeout(() => {
                // Double check if it got cancelled during timeout
                if (!isTutorialPlaying && !forcePlay && hasSeen) return;

                const d = driver({
                    showProgress: true,
                    animate: true,
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
                        currentDriver = null;
                    },
                    onPopoverRender: (popover, { state }) => {
                        // Workaround for driver.js duplication bug on some framework lifecycle events
                        const existingPopovers = document.querySelectorAll('.driver-popover');
                        if (existingPopovers.length > 1) {
                            // Keep the last one, remove others
                            for (let i = 0; i < existingPopovers.length - 1; i++) {
                                existingPopovers[i].remove();
                            }
                        }
                    }
                } as Config);

                currentDriver = d;
                d.setSteps(tutorialSteps[pathname]);
                d.drive();
                localStorage.setItem(`tutorial_seen_${pathname}`, 'true');
            }, 500);
        }
    };

    return { startTutorial };
}
