
/**
 * Triggers a light haptic feedback vibration if supported by the device.
 * Useful for mobile interactions like button clicks or swipe actions.
 */
export const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
    }
};
