/**
 * Main JavaScript file for shared functionality
 */

// API base URL
const API_BASE_URL = '/api';

// Formats a date in YYYY-MM-DD format to a more readable format
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

// Formats a number as currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

// Helper function to make API calls
const fetchAPI = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    // Check if the response is successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Something went wrong');
    }
    
    // If the response is 204 No Content, return null
    if (response.status === 204) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Displays an error message
const showError = (message) => {
  // Create error element
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  
  // Append to body
  document.body.appendChild(errorElement);
  
  // Remove after 5 seconds
  setTimeout(() => {
    errorElement.remove();
  }, 5000);
};

// Create a transaction item element
const createTransactionElement = (transaction) => {
  // Create the elements
  const item = document.createElement('div');
  item.className = 'transaction-item';
  item.dataset.id = transaction.id;
  
  // Transaction details
  const details = document.createElement('div');
  details.className = 'transaction-details';
  
  // Icon
  const iconDiv = document.createElement('div');
  iconDiv.className = `transaction-icon ${transaction.type}`;
  const icon = document.createElement('i');
  
  if (transaction.type === 'income') {
    icon.className = 'fas fa-arrow-down';
  } else {
    icon.className = 'fas fa-arrow-up';
  }
  
  iconDiv.appendChild(icon);
  
  // Transaction info
  const info = document.createElement('div');
  info.className = 'transaction-info';
  
  const title = document.createElement('h4');
  title.textContent = transaction.description;
  
  const details2 = document.createElement('p');
  details2.textContent = `${transaction.category} • ${formatDate(transaction.date)}`;
  
  info.appendChild(title);
  info.appendChild(details2);
  
  // Add icon and info to details
  details.appendChild(iconDiv);
  details.appendChild(info);
  
  // Transaction amount
  const amountDiv = document.createElement('div');
  const amount = document.createElement('span');
  amount.className = `transaction-amount ${transaction.type === 'income' ? 'income-amount' : 'expense-amount'}`;
  amount.textContent = formatCurrency(transaction.amount);
  
  amountDiv.appendChild(amount);
  
  // Transaction actions
  const actions = document.createElement('div');
  actions.className = 'transaction-actions';
  
  const editBtn = document.createElement('button');
  editBtn.className = 'action-btn edit-btn';
  editBtn.innerHTML = '<i class="fas fa-edit"></i>';
  editBtn.addEventListener('click', () => openEditModal(transaction));
  
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'action-btn delete-btn';
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
  deleteBtn.addEventListener('click', () => openDeleteModal(transaction));
  
  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);
  
  // Put everything together
  item.appendChild(details);
  item.appendChild(amountDiv);
  item.appendChild(actions);
  
  return item;
};

// Attach modal event listeners
const setupModal = (modalId, closeClass, cancelId) => {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  // Get the close button
  const closeButtons = modal.querySelectorAll(`.${closeClass}`);
  
  // Get the cancel button
  const cancelButton = document.getElementById(cancelId);
  
  // Function to close the modal
  const closeModal = () => {
    modal.style.display = 'none';
  };
  
  // Add click event to close buttons
  closeButtons.forEach(button => {
    button.addEventListener('click', closeModal);
  });
  
  // Add click event to cancel button
  if (cancelButton) {
    cancelButton.addEventListener('click', closeModal);
  }
  
  // Close modal when clicking outside
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
  
  return {
    open: () => { modal.style.display = 'block'; },
    close: closeModal
  };
}; 