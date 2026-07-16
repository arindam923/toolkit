/**
 * Tests for useTheme hook
 */
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '@/hooks/useTheme';

describe('useTheme', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('should initialize with system preference (dark)', () => {
    const { result } = renderHook(() => useTheme());
    
    // System preference is mocked to return false (light mode)
    expect(result.current.theme).toBe('light');
  });

  it('should initialize with localStorage value if present', () => {
    localStorage.setItem('theme', 'dark');
    
    const { result } = renderHook(() => useTheme());
    
    expect(result.current.theme).toBe('dark');
  });

  it('should toggle theme from light to dark', () => {
    const { result } = renderHook(() => useTheme());
    
    expect(result.current.theme).toBe('light');
    
    act(() => {
      result.current.toggleTheme();
    });
    
    expect(result.current.theme).toBe('dark');
  });

  it('should toggle theme from dark to light', () => {
    localStorage.setItem('theme', 'dark');
    const { result } = renderHook(() => useTheme());
    
    expect(result.current.theme).toBe('dark');
    
    act(() => {
      result.current.toggleTheme();
    });
    
    expect(result.current.theme).toBe('light');
  });

  it('should save theme to localStorage', () => {
    const { result } = renderHook(() => useTheme());
    
    act(() => {
      result.current.setTheme('dark');
    });
    
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('should add dark class to html element', () => {
    const { result } = renderHook(() => useTheme());
    
    act(() => {
      result.current.setTheme('dark');
    });
    
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should remove dark class from html element', () => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.add('dark');
    
    const { result } = renderHook(() => useTheme());
    
    act(() => {
      result.current.setTheme('light');
    });
    
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should return mounted state', () => {
    const { result } = renderHook(() => useTheme());
    
    expect(typeof result.current.mounted).toBe('boolean');
  });
});
