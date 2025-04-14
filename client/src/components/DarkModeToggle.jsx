import { useTheme } from '../contexts/ThemeContext';
import { FaMoon, FaSun } from 'react-icons/fa';

const DarkModeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <FaSun className="w-5 h-5 text-yellow-400" />
      ) : (
        <FaMoon className="w-5 h-5" />
      )}
    </button>
  );
};

export default DarkModeToggle; 