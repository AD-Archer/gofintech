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
const dateFilter = document.getElementById('date-filter');
const searchInput = document.getElementById('search');
const deleteConfirmBtn = document.getElementById('delete-confirm-btn');

// Global state
let transactions = [];
let currentTransaction = null;
let filters = {
  type: 'all',
  category: 'all',
  date: 'all',
  search: ''
};

// Initialize modals
const transactionModal = setupModal('transaction-modal', 'close', 'cancel-btn');
const deleteModal = setupModal('delete-modal', 'close', 'delete-cancel-btn');

// Fetch transactions and update the UI
const fetchTransactions = async () => {
  try {
    transactions = await fetchAPI('/transactions');
    renderTransactions();
    updateCategoryFilter();
  } catch (error) {
    showError(error.message);
  }
};

// Apply filters to transactions
const applyFilters = () => {
  return transactions.filter(transaction => {
    // Filter by type
    if (filters.type !== 'all' && transaction.type !== filters.type) {
      return false;
    }
    
    // Filter by category
    if (filters.category !== 'all' && transaction.category !== filters.category) {
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
        transaction.category.toLowerCase().includes(searchLower)
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
    const transactionElement = createTransactionElement(transaction);
    transactionsContainer.appendChild(transactionElement);
  });
};

// Clear all filters
const clearFilters = () => {
  typeFilter.value = 'all';
  categoryFilter.value = 'all';
  dateFilter.value = 'all';
  searchInput.value = '';
  
  filters = {
    type: 'all',
    category: 'all',
    date: 'all',
    search: ''
  };
  
  renderTransactions();
};

// Open the add transaction modal
const openAddModal = () => {
  // Reset form
  transactionForm.reset();
  transactionIdInput.value = '';
  modalTitle.textContent = 'Add Transaction';
  
  // Set default date to today
  document.getElementById('date').valueAsDate = new Date();
  
  // Open modal
  transactionModal.open();
};

// Open the edit transaction modal
const openEditModal = (transaction) => {
  // Set form values
  transactionIdInput.value = transaction.id;
  document.getElementById('type').value = transaction.type;
  document.getElementById('amount').value = transaction.amount;
  document.getElementById('description').value = transaction.description;
  document.getElementById('category').value = transaction.category;
  
  // Format date as YYYY-MM-DD
  const date = new Date(transaction.date);
  const formattedDate = date.toISOString().split('T')[0];
  document.getElementById('date').value = formattedDate;
  
  // Set modal title
  modalTitle.textContent = 'Edit Transaction';
  
  // Store current transaction
  currentTransaction = transaction;
  
  // Open modal
  transactionModal.open();
};

// Open the delete confirmation modal
const openDeleteModal = (transaction) => {
  // Store current transaction
  currentTransaction = transaction;
  
  // Open modal
  deleteModal.open();
};

// Save transaction (create or update)
const saveTransaction = async (event) => {
  event.preventDefault();
  
  try {
    // Get form data
    const formData = new FormData(transactionForm);
    const transactionData = {
      type: formData.get('type'),
      amount: parseFloat(formData.get('amount')),
      description: formData.get('description'),
      category: formData.get('category'),
      date: formData.get('date')
    };
    
    // Check if we're editing or creating
    const isEditing = transactionIdInput.value !== '';
    
    // API endpoint and method
    const endpoint = isEditing 
      ? `/transactions/${transactionIdInput.value}` 
      : '/transactions';
    const method = isEditing ? 'PUT' : 'POST';
    
    // Make API call
    const savedTransaction = await fetchAPI(endpoint, {
      method,
      body: JSON.stringify(transactionData)
    });
    
    // Update transactions list
    if (isEditing) {
      const index = transactions.findIndex(t => t.id === savedTransaction.id);
      if (index !== -1) {
        transactions[index] = savedTransaction;
      }
    } else {
      transactions.push(savedTransaction);
    }
    
    // Close modal
    transactionModal.close();
    
    // Update UI
    renderTransactions();
    updateCategoryFilter();
  } catch (error) {
    showError(error.message);
  }
};

// Delete transaction
const deleteTransaction = async () => {
  if (!currentTransaction) return;
  
  try {
    // Make API call
    await fetchAPI(`/transactions/${currentTransaction.id}`, {
      method: 'DELETE'
    });
    
    // Remove from transactions array
    transactions = transactions.filter(t => t.id !== currentTransaction.id);
    
    // Close modal
    deleteModal.close();
    
    // Update UI
    renderTransactions();
    updateCategoryFilter();
  } catch (error) {
    showError(error.message);
  }
};

// Check for URL params for edit/delete actions
const checkUrlParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('edit');
  const deleteId = urlParams.get('delete');
  
  if (editId) {
    const transaction = transactions.find(t => t.id === editId);
    if (transaction) {
      openEditModal(transaction);
    }
  } else if (deleteId) {
    const transaction = transactions.find(t => t.id === deleteId);
    if (transaction) {
      openDeleteModal(transaction);
    }
  }
};

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Fetch transactions
  fetchTransactions().then(() => {
    // Check URL params after transactions are loaded
    checkUrlParams();
  });
  
  // Add transaction buttons
  addTransactionBtn.addEventListener('click', openAddModal);
  if (emptyAddBtn) {
    emptyAddBtn.addEventListener('click', openAddModal);
  }
  
  // Transaction form
  transactionForm.addEventListener('submit', saveTransaction);
  
  // Delete confirmation
  deleteConfirmBtn.addEventListener('click', deleteTransaction);
  
  // Filter changes
  typeFilter.addEventListener('change', () => {
    filters.type = typeFilter.value;
    renderTransactions();
  });
  
  categoryFilter.addEventListener('change', () => {
    filters.category = categoryFilter.value;
    renderTransactions();
  });
  
  dateFilter.addEventListener('change', () => {
    filters.date = dateFilter.value;
    renderTransactions();
  });
  
  // Search input
  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      filters.search = searchInput.value;
      renderTransactions();
    }, 300);
  });
}); 