import { TakeoverScreen } from '@shared/schema';

export const useTakeoverScreen = async () => {
    try {
        const response = await fetch('/api/takeover-screens/active');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data: TakeoverScreen | null = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch takeover screen:', error);
        return null;
    }
};