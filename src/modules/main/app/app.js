import { LightningElement } from 'lwc';

export default class HelloWorldApp extends LightningElement {
  // Search dropdown functionality
  connectedCallback() {
    console.log('Component connected');
  }

  renderedCallback() {
    console.log('Component rendered');
    // Wait for DOM to be ready
    setTimeout(() => {
      this.setupDropdown();
    }, 100);
  }

  setupDropdown() {
    console.log('Setting up dropdown...');
    
    // Try different selectors
    const searchInput = this.template.querySelector('input[type="text"]');
    const searchDropdown = this.template.querySelector('.search-dropdown');
    
    console.log('Found elements:', { 
      searchInput: !!searchInput, 
      searchDropdown: !!searchDropdown,
      searchInputId: searchInput?.id,
      searchDropdownId: searchDropdown?.id
    });
    
    // Check if elements exist before proceeding
    if (!searchInput || !searchDropdown) {
      console.log('Elements not found, retrying...');
      // Retry after a short delay
      setTimeout(() => {
        this.setupDropdown();
      }, 200);
      return;
    }

    console.log('Elements found, setting up dropdown');

    const dropdownItems = this.template.querySelectorAll('.dropdown-item');
    console.log('Dropdown items found:', dropdownItems.length);
    
    let selectedIndex = -1;

    // Remove existing event listeners to prevent duplicates
    if (this.handleInput) {
      searchInput.removeEventListener('input', this.handleInput);
    }
    if (this.handleKeydown) {
      searchInput.removeEventListener('keydown', this.handleKeydown);
    }
    if (this.handleClickOutside) {
      document.removeEventListener('click', this.handleClickOutside);
    }

    // Hide dropdown when clicking outside
    this.handleClickOutside = (event) => {
      if (!searchInput.contains(event.target) && !searchDropdown.contains(event.target)) {
        searchDropdown.classList.remove('show');
        selectedIndex = -1;
        this.clearSelection();
      }
    };
    document.addEventListener('click', this.handleClickOutside);

    // Handle keyboard navigation
    this.handleKeydown = (event) => {
      if (!searchDropdown.classList.contains('show')) {
        return;
      }

      switch(event.key) {
        case 'ArrowDown':
          event.preventDefault();
          selectedIndex = Math.min(selectedIndex + 1, dropdownItems.length - 1);
          this.updateSelection();
          break;
        case 'ArrowUp':
          event.preventDefault();
          selectedIndex = Math.max(selectedIndex - 1, -1);
          this.updateSelection();
          break;
        case 'Enter':
          event.preventDefault();
          if (selectedIndex >= 0) {
            this.selectItem(dropdownItems[selectedIndex]);
          }
          break;
        case 'Escape':
          searchDropdown.classList.remove('show');
          selectedIndex = -1;
          this.clearSelection();
          break;
      }
    };
    searchInput.addEventListener('keydown', this.handleKeydown);

    // Handle item clicks
    dropdownItems.forEach((item, index) => {
      // Remove existing listeners
      if (this.handleItemClick) {
        item.removeEventListener('click', this.handleItemClick);
      }
      if (this.handleItemMouseEnter) {
        item.removeEventListener('mouseenter', this.handleItemMouseEnter);
      }

      // Add new listeners
      this.handleItemClick = () => {
        this.selectItem(item);
      };
      item.addEventListener('click', this.handleItemClick);

      this.handleItemMouseEnter = () => {
        selectedIndex = index;
        this.updateSelection();
      };
      item.addEventListener('mouseenter', this.handleItemMouseEnter);
    });

    // Show dropdown when user starts typing
    this.handleInput = () => {
      console.log('Input event triggered, value:', searchInput.value);
      
      // Get the sparkle icon
      const sparkleIcon = this.template.querySelector('#sparkleIcon');
      
      if (searchInput.value.length > 0) {
        console.log('Showing dropdown');
        searchDropdown.classList.add('show');
        this.filterAndHighlightSuggestions(searchInput.value, searchDropdown);
        
        // Make sparkle icon blue when typing
        if (sparkleIcon) {
          sparkleIcon.style.color = '#1976D2';
          console.log('Sparkle icon found and colored blue');
        } else {
          console.log('Sparkle icon not found');
        }
        
        console.log('Dropdown classes:', searchDropdown.className);
      } else {
        console.log('Hiding dropdown');
        searchDropdown.classList.remove('show');
        this.showAllSuggestions();
        
        // Reset sparkle icon color when input is empty
        if (sparkleIcon) {
          sparkleIcon.style.color = '';
          console.log('Sparkle icon color reset');
        }
      }
    };
    searchInput.addEventListener('input', this.handleInput);
    
    console.log('Event listeners attached');
  }

  selectItem(item) {
    const value = item.getAttribute('data-value');
    const searchInput = this.template.querySelector('input[type="text"]');
    if (searchInput) {
      searchInput.value = value;
    }
    const searchDropdown = this.template.querySelector('.search-dropdown');
    if (searchDropdown) {
      searchDropdown.classList.remove('show');
    }
    this.clearSelection();
    
    // Trigger search or form submission here
    console.log('Selected provider type:', value);
  }

  updateSelection() {
    this.clearSelection();
    const dropdownItems = this.template.querySelectorAll('.dropdown-item');
    const selectedIndex = Array.from(dropdownItems).findIndex(item => item.classList.contains('selected'));
    if (selectedIndex >= 0) {
      dropdownItems[selectedIndex].classList.add('selected');
    }
  }

  clearSelection() {
    const dropdownItems = this.template.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(function(item) {
      item.classList.remove('selected');
    });
  }

  // Function to filter and highlight suggestions based on search input
  filterAndHighlightSuggestions(searchValue, searchDropdown) {
    const dropdownItems = this.template.querySelectorAll('.dropdown-item');
    const searchLower = searchValue.toLowerCase();
    let hasVisibleItems = false;
    
    dropdownItems.forEach(item => {
      const textElement = item.querySelector('span');
      const originalText = textElement.getAttribute('data-original-text') || textElement.textContent;
      
      // Store original text if not already stored
      if (!textElement.getAttribute('data-original-text')) {
        textElement.setAttribute('data-original-text', originalText);
      }
      
      // Check if this item matches the search
      const matches = this.itemMatchesSearch(originalText, searchValue);
      
      if (matches) {
        // Show the item and highlight matching text
        item.style.display = 'flex';
        const highlightedText = this.highlightText(originalText, searchValue);
        textElement.innerHTML = highlightedText;
        hasVisibleItems = true;
      } else {
        // Hide the item
        item.style.display = 'none';
      }
    });
    
    // Hide dropdown if no items match
    if (!hasVisibleItems) {
      searchDropdown.classList.remove('show');
    } else {
      searchDropdown.classList.add('show');
    }
  }

  // Function to check if an item matches the search
  itemMatchesSearch(text, searchValue) {
    if (!searchValue) return true;
    
    const textLower = text.toLowerCase();
    const searchLower = searchValue.toLowerCase();
    
    // Split search into words for more flexible matching
    const searchWords = searchLower.split(/\s+/).filter(word => word.length > 0);
    
    // Check if all search words are found in the text
    return searchWords.every(word => textLower.includes(word));
  }

  // Function to show all suggestions (when search is cleared)
  showAllSuggestions() {
    const dropdownItems = this.template.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
      item.style.display = 'flex';
      const textElement = item.querySelector('span');
      const originalText = textElement.getAttribute('data-original-text');
      if (originalText) {
        textElement.innerHTML = originalText;
      }
    });
  }

  // Function to highlight matching text
  highlightText(text, searchValue) {
    if (!searchValue) return text;
    
    const regex = new RegExp(`(${this.escapeRegExp(searchValue)})`, 'gi');
    return text.replace(regex, '<strong style="color: #1976D2; background-color: #EBF5FF; padding: 1px 2px; border-radius: 2px;">$1</strong>');
  }

  // Function to escape special regex characters
  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
