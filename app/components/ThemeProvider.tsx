'use client';

import { useEffect, createContext, useContext, useState } from 'react';

const ThemeContext = createContext<{
  theme: string;
  toggleTheme: () => void;
}>({
  theme: 'light',
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.body.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    // Update theme whenever it changes
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
        // Set up smooth scrolling for navigation links with navbar offset
        const handleAnchorClick = (e: Event) => {
          const anchor = e.target as HTMLAnchorElement;
          if (anchor.href && anchor.href.includes('#')) {
            e.preventDefault();
            const href = anchor.getAttribute('href');
            if (href) {
              // Fix selector for fragment identifiers
              const targetId = href.startsWith('#') ? href.substring(1) : href.split('#')[1];
              if (targetId) {
                const target = document.getElementById(targetId);
                if (target) {
                  const navbarHeight = 120; // Fixed navbar height + top position + padding
                  const targetPosition = target.offsetTop - navbarHeight;
                  
                  window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                  });
                }
              }
            }
          }
        };

    document.addEventListener('click', handleAnchorClick);

        // Optimized navbar scroll effect with theme awareness
        let scrollTimeout: NodeJS.Timeout;
        const handleScroll = () => {
          if (scrollTimeout) return;
          
          scrollTimeout = setTimeout(() => {
            const navbar = document.querySelector('.navbar') as HTMLElement;
            if (!navbar) {
              scrollTimeout = null as any;
              return;
            }
            
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Apply theme-aware scroll effects
            if (scrollTop > 50) {
              navbar.classList.add('scrolled');
              // Enhanced glass effect based on scroll position and theme
              navbar.style.background = theme === 'dark' 
                ? 'rgba(15, 23, 42, 0.15)' 
                : 'rgba(255, 255, 255, 0.15)';
              navbar.style.backdropFilter = 'blur(25px) saturate(200%)';
            } else {
              navbar.classList.remove('scrolled');
              // Default glass effect
              navbar.style.background = theme === 'dark' 
                ? 'rgba(15, 23, 42, 0.08)' 
                : 'rgba(255, 255, 255, 0.08)';
              navbar.style.backdropFilter = 'blur(20px) saturate(180%)';
            }
            
            scrollTimeout = null as any;
          }, 16); // ~60fps throttling
        };

        window.addEventListener('scroll', handleScroll);
        
        // Update navbar on theme change
        handleScroll(); // Apply current theme to navbar

        // Optimized loading animation with requestAnimationFrame
        const handleLoad = () => {
          document.body.classList.add('loaded');
          
          // Use CSS animations instead of JavaScript for better performance
          requestAnimationFrame(() => {
            document.querySelectorAll('.loading').forEach((el) => {
              el.classList.add('animate-in');
            });
          });
        };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    // Cleanup
    return () => {
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('load', handleLoad);
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
