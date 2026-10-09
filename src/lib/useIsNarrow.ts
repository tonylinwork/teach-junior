import { useEffect, useState } from 'react';

// True below Tailwind's `sm` breakpoint (phones). Used where layout needs JS, not just CSS.
const QUERY = '(max-width: 639px)';

export function useIsNarrow() {
    const [isNarrow, setIsNarrow] = useState(() => typeof window !== 'undefined' && window.matchMedia(QUERY).matches);
    useEffect(() => {
        const mq = window.matchMedia(QUERY);
        const onChange = () => setIsNarrow(mq.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);
    return isNarrow;
}
