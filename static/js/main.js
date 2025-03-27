/**
 * Main JavaScript file for shared functionality
 */

// API base URL
const API_BASE_URL = '';

// Formats a date in YYYY-MM-DD format to a more readable format
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

// Displays a success message
const showSuccess = (message) => {
  // Create success element
  const successElement = document.createElement('div');
  successElement.className = 'success-message';
  successElement.textContent = message;
  
  // Append to body
  document.body.appendChild(successElement);
  
  // Remove after 5 seconds
  setTimeout(() => {
    successElement.remove();
  }, 5000);
};

// Export functions
window.main = {
  formatDate,
  showSuccess
}; 