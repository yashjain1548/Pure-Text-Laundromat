import React from 'react';

interface TerminalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'accent';
  isLoading?: boolean;
}

const TerminalButton: React.FC<TerminalButtonProps> = ({ 
  children, 
  variant = 'secondary', 
  isLoading,
  className = '',
  ...props 
}) => {
  
  const baseStyles = "relative font-mono text-xs uppercase tracking-wider px-4 py-3 border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-terminal-bg disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden";
  
  const variants = {
    primary: "border-terminal-accent text-terminal-accent hover:bg-terminal-accent/10 focus:ring-terminal-accent",
    secondary: "border-terminal-border text-terminal-text hover:border-terminal-text hover:text-white focus:ring-terminal-text",
    danger: "border-red-500 text-red-500 hover:bg-red-500/10 focus:ring-red-500",
    accent: "border-terminal-success text-terminal-success hover:bg-terminal-success/10 focus:ring-terminal-success bg-terminal-surface"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      <span className={`flex items-center justify-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </span>
      
      {/* Loading Spinner Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}

      {/* Hover effect: Scan line */}
      <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 group-hover:animate-shine pointer-events-none" />
    </button>
  );
};

export default TerminalButton;