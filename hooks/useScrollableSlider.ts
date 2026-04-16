import { useEffect, useRef } from 'react';

export function useScrollableSlider() {
    const sliderEl = useRef<HTMLDivElement>(null);
    const sliderPrevBtn = useRef<HTMLButtonElement>(null);
    const sliderNextBtn = useRef<HTMLButtonElement>(null);

    function scrollToTheRight() {
        if (sliderEl.current) {
            const offsetWidth = sliderEl.current.offsetWidth;
            sliderEl.current.scrollLeft += offsetWidth / 2;
            if (sliderPrevBtn.current) {
                sliderPrevBtn.current.classList.remove('opacity-0', 'invisible');
            }
        }
    }

    function scrollToTheLeft() {
        if (sliderEl.current) {
            const offsetWidth = sliderEl.current.offsetWidth;
            sliderEl.current.scrollLeft -= offsetWidth / 2;
            if (sliderNextBtn.current) {
                sliderNextBtn.current.classList.remove('opacity-0', 'invisible');
            }
        }
    }

    useEffect(() => {
        const filterBarEl = sliderEl.current;
        const prevBtn = sliderPrevBtn.current;
        const nextBtn = sliderNextBtn.current;
        const formPageHeaderEl = filterBarEl?.classList.contains('formPageHeaderSliderElJS');

        function initNextPrevBtnVisibility() {
            if (filterBarEl && nextBtn) {
                const offsetWidth = filterBarEl.offsetWidth;
                const scrollWidth = filterBarEl.scrollWidth;

                // show next btn when scrollWidth is greater than offsetWidth
                if (scrollWidth > offsetWidth) {
                    nextBtn.classList.remove('opacity-0', 'invisible');
                    if (formPageHeaderEl) {
                        filterBarEl.classList.add('!-mb-[43px]');
                    }
                } else {
                    nextBtn.classList.add('opacity-0', 'invisible');
                    if (formPageHeaderEl) {
                        filterBarEl.classList.remove('!-mb-[43px]');
                    }
                }

                // hide prev btn initially
                prevBtn?.classList.add('opacity-0', 'invisible');
            }
        }

        function visibleNextAndPrevBtnOnScroll() {
            if (filterBarEl && prevBtn && nextBtn) {
                const newScrollLeft = filterBarEl.scrollLeft;
                const offsetWidth = filterBarEl.offsetWidth;
                const scrollWidth = filterBarEl.scrollWidth;

                // reach to the right end
                if (scrollWidth - newScrollLeft === offsetWidth) {
                    nextBtn.classList.add('opacity-0', 'invisible');
                    prevBtn.classList.remove('opacity-0', 'invisible');
                } else {
                    nextBtn.classList.remove('opacity-0', 'invisible');
                }

                // reach to the left end
                if (newScrollLeft === 0) {
                    prevBtn.classList.add('opacity-0', 'invisible');
                    nextBtn.classList.remove('opacity-0', 'invisible');
                } else {
                    prevBtn.classList.remove('opacity-0', 'invisible');
                }
            }
        }

        window.addEventListener('resize', initNextPrevBtnVisibility);
        filterBarEl?.addEventListener('scroll', visibleNextAndPrevBtnOnScroll);

        // Initial visibility setup
        initNextPrevBtnVisibility();

        // Cleanup event listeners
        return () => {
            window.removeEventListener('resize', initNextPrevBtnVisibility);
            filterBarEl?.removeEventListener('scroll', visibleNextAndPrevBtnOnScroll);
        };
    }, []);

    return {
        sliderEl,
        sliderPrevBtn,
        sliderNextBtn,
        scrollToTheRight,
        scrollToTheLeft,
    };
}