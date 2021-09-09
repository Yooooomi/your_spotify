import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import s from './index.module.css';

function ShowIfInScreen({ children }) {
  const ref = useRef(null);
  const [show, setShow] = useState(false);

  const checkVisibility = useCallback(() => {
    const { offsetTop } = ref.current;

    const triggerPoint = window.outerHeight * (2 / 3);

    if (window.scrollY + triggerPoint > offsetTop) {
      window.removeEventListener('scroll', checkVisibility);

      setShow(true);
    }
  }, []);

  useEffect(() => {
    checkVisibility();
    if (show) return null;
    window.addEventListener('scroll', checkVisibility);
    return () => window.removeEventListener('scroll', checkVisibility);
  }, [checkVisibility, show]);

  return (
    <div ref={ref} className={show ? s.root : s.hidden}>
      {children}
    </div>
  );
}

export default ShowIfInScreen;
