/**
 * Custom debounce function that limits how often a function can be called
 * 
 * @param func The function to debounce
 * @param wait The time to wait in milliseconds
 * @param options Additional options for the debounce function
 * @param options.leading Whether to invoke the function on the leading edge of the timeout
 * @param options.trailing Whether to invoke the function on the trailing edge of the timeout
 * @returns A debounced version of the provided function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  const { leading = false, trailing = true } = options;
  
  return function(...args: Parameters<T>): void {
    lastArgs = args;
    
    // If leading=true and we don't have an active timeout, invoke immediately
    const callNow = leading && timeout === null;
    
    const later = () => {
      timeout = null;
      // If trailing=true or leading=false, invoke with latest args
      if (trailing && lastArgs) {
        func(...lastArgs);
        lastArgs = null;
      }
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
    
    if (callNow) {
      func(...args);
      lastArgs = null;
    }
  };
}

export default debounce;