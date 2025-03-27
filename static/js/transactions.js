/**
 * JavaScript for the transactions page
 */

// DOM Elements
const transactionsContainer = document.getElementById('transactions-container');
const addTransactionBtn = document.getElementById('add-transaction-btn');
const emptyAddBtn = document.getElementById('empty-add-btn');
const transactionForm = document.getElementById('transaction-form');
const modalTitle = document.getElementById('modal-title');
const transactionIdInput = document.getElementById('transaction-id');
const typeFilter = document.getElementById('type-filter');
const categoryFilter = document.getElementById('category-filter');
const roommateFilter = document.getElementById('roommate-filter');
const dateFilter = document.getElementById('date-filter');
const searchInput = document.getElementById('search');
const deleteConfirmBtn = document.getElementById('delete-confirm-btn');

// Global state
let transactions = [];
let currentTransaction = null;
let filters = {
  type: 'all',
  category: 'all',
  roommate: 'all',
  date: 'all',
  search: ''
};

// Initialize modals
const transactionModal = window.utils.setupModal('transaction-modal', 'close', 'cancel-btn');
const deleteModal = window.utils.setupModal('delete-modal', 'close', 'delete-cancel-btn');

// Fetch transactions and update the UI
const fetchTransactions = async () => {
  try {
    transactions = await window.utils.fetchAPI('/transactions');
    renderTransactions();
    updateCategoryFilter();
    updateRoommateFilter();
  } catch (error) {
    window.utils.showError(error.message || 'Failed to load transactions. Please try again.');
    transactions = [];
    renderTransactions();
  }
};

// Apply filters to transactions
const applyFilters = () => {
  if (!Array.isArray(transactions)) {
    return [];
  }
  
  return transactions.filter(transaction => {
    // Filter by type
    if (filters.type !== 'all' && transaction.type !== filters.type) {
      return false;
    }
    
    // Filter by category
    if (filters.category !== 'all' && transaction.category !== filters.category) {
      return false;
    }

    // Filter by roommate
    if (filters.roommate !== 'all' && transaction.createdBy !== filters.roommate) {
      return false;
    }
    
    // Filter by date
    if (filters.date !== 'all') {
      const today = new Date();
      const transactionDate = new Date(transaction.date);
      
      if (filters.date === 'this-month') {
        if (
          transactionDate.getMonth() !== today.getMonth() ||
          transactionDate.getFullYear() !== today.getFullYear()
        ) {
          return false;
        }
      } else if (filters.date === 'last-month') {
        const lastMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
        const lastMonthYear = today.getMonth() === 0 
          ? today.getFullYear() - 1 
          : today.getFullYear();
        
        if (
          transactionDate.getMonth() !== lastMonth ||
          transactionDate.getFullYear() !== lastMonthYear
        ) {
          return false;
        }
      } else if (filters.date === 'this-year') {
        if (transactionDate.getFullYear() !== today.getFullYear()) {
          return false;
        }
      }
    }
    
    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        transaction.description.toLowerCase().includes(searchLower) ||
        transaction.category.toLowerCase().includes(searchLower) ||
        transaction.createdBy.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
};

// Update the category filter select with unique categories
const updateCategoryFilter = () => {
  // Get all unique categories
  const categories = [...new Set(transactions.map(t => t.category))].sort();
  
  // Clear existing options except the first one
  while (categoryFilter.options.length > 1) {
    categoryFilter.remove(1);
  }
  
  // Add categories
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
};

// Update the roommate filter select with unique roommates
const updateRoommateFilter = () => {
  // Get all unique roommates
  const roommates = [...new Set(transactions.map(t => t.createdBy))].sort();
  
  // Clear existing options except the first one
  while (roommateFilter.options.length > 1) {
    roommateFilter.remove(1);
  }
  
  // Add roommates
  roommates.forEach(roommate => {
    const option = document.createElement('option');
    option.value = roommate;
    option.textContent = roommate;
    roommateFilter.appendChild(option);
  });
};

// Render transactions based on current filters
const renderTransactions = () => {
  // Clear container
  transactionsContainer.innerHTML = '';
  
  // Apply filters
  const filteredTransactions = applyFilters();
  
  // If no transactions, show empty state
  if (filteredTransactions.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    
    if (transactions.length === 0) {
      // No transactions at all
      emptyState.innerHTML = `
        <i class="fas fa-receipt"></i>
        <p>No transactions yet</p>
        <button id="empty-add-btn-new" class="btn btn-primary">Add Transaction</button>
      `;
      transactionsContainer.appendChild(emptyState);
      
      // Add event listener
      document.getElementById('empty-add-btn-new').addEventListener('click', openAddModal);
    } else {
      // No transactions after filtering
      emptyState.innerHTML = `
        <i class="fas fa-filter"></i>
        <p>No transactions match your filters</p>
        <button id="clear-filters-btn" class="btn btn-primary">Clear Filters</button>
      `;
      transactionsContainer.appendChild(emptyState);
      
      // Add event listener
      document.getElementById('clear-filters-btn').addEventListener('click', clearFilters);
    }
    
    return;
  }
  
  // Sort transactions by date (newest first)
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  
  // Create elements for each transaction
  sortedTransactions.forEach(transaction => {
    const transactionElement = window.utils.createTransactionElement(transaction);
    
    // Add event listeners
    const editBtn = transactionElement.querySelector('.edit-btn');
    const deleteBtn = transactionElement.querySelector('.delete-btn');
    
    editBtn.addEventListener('click', () => openEditModal(transaction));
    deleteBtn.addEventListener('click', () => openDeleteModal(transaction));
    
    transactionsContainer.appendChild(transactionElement);
  });
};

// Open modal for adding a new transaction
const openAddModal = () => {
  currentTransaction = null;
  transactionIdInput.value = '';
  transactionForm.reset();
  modalTitle.textContent = 'Add Transaction';
  transactionModal.style.display = 'block';
};

// Open modal for editing a transaction
const openEditModal = (transaction) => {
  currentTransaction = transaction;
  transactionIdInput.value = transaction._id;
  
  // Fill form with transaction data
  document.getElementById('type').value = transaction.type;
  document.getElementById('amount').value = transaction.amount;
  document.getElementById('description').value = transaction.description;
  document.getElementById('category').value = transaction.category;
  document.getElementById('createdBy').value = transaction.createdBy;
  document.getElementById('date').value = transaction.date.split('T')[0];
  
  modalTitle.textContent = 'Edit Transaction';
  transactionModal.style.display = 'block';
};

// Open modal for deleting a transaction
const openDeleteModal = (transaction) => {
  currentTransaction = transaction;
  deleteModal.style.display = 'block';
};

// Clear all filters
const clearFilters = () => {
  typeFilter.value = 'all';
  categoryFilter.value = 'all';
  roommateFilter.value = 'all';
  dateFilter.value = 'all';
  searchInput.value = '';
  
  filters = {
    type: 'all',
    category: 'all',
    roommate: 'all',
    date: 'all',
    search: ''
  };
  
  renderTransactions();
};

// Handle form submission
transactionForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = {
    type: document.getElementById('type').value,
    amount: parseFloat(document.getElementById('amount').value),
    description: document.getElementById('description').value,
    category: document.getElementById('category').value,
    createdBy: document.getElementById('createdBy').value,
    date: document.getElementById('date').value
  };
  
  try {
    if (currentTransaction) {
      // Update existing transaction
      await window.utils.fetchAPI(`/transactions/${currentTransaction._id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
    } else {
      // Create new transaction
      await window.utils.fetchAPI('/transactions', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
    }
    
    // Close modal and refresh transactions
    transactionModal.style.display = 'none';
    await fetchTransactions();
  } catch (error) {
    window.utils.showError(error.message || 'Failed to save transaction. Please try again.');
  }
});

// Handle delete confirmation
deleteConfirmBtn.addEventListener('click', async () => {
  if (!currentTransaction) return;
  
  try {
    await window.utils.fetchAPI(`/transactions/${currentTransaction._id}`, {
      method: 'DELETE'
    });
    
    // Close modal and refresh transactions
    deleteModal.style.display = 'none';
    await fetchTransactions();
  } catch (error) {
    window.utils.showError(error.message || 'Failed to delete transaction. Please try again.');
  }
});

// Add event listeners for filters
typeFilter.addEventListener('change', (e) => {
  filters.type = e.target.value;
  renderTransactions();
});

categoryFilter.addEventListener('change', (e) => {
  filters.category = e.target.value;
  renderTransactions();
});

roommateFilter.addEventListener('change', (e) => {
  filters.roommate = e.target.value;
  renderTransactions();
});

dateFilter.addEventListener('change', (e) => {
  filters.date = e.target.value;
  renderTransactions();
});

searchInput.addEventListener('input', (e) => {
  filters.search = e.target.value;
  renderTransactions();
});

// Add event listeners for buttons
addTransactionBtn?.addEventListener('click', openAddModal);
emptyAddBtn?.addEventListener('click', openAddModal);

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  fetchTransactions();
}); 