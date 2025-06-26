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
      if (searchInput.value.length > 0) {
        console.log('Showing dropdown');
        searchDropdown.classList.add('show');
        this.highlightMatchingText(searchInput.value);
        console.log('Dropdown classes:', searchDropdown.className);
      } else {
        console.log('Hiding dropdown');
        searchDropdown.classList.remove('show');
        this.clearHighlights();
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

  // Function to highlight matching text in dropdown items
  highlightMatchingText(searchValue) {
    const dropdownItems = this.template.querySelectorAll('.dropdown-item');
    const searchLower = searchValue.toLowerCase();
    
    dropdownItems.forEach(item => {
      const textElement = item.querySelector('span') || item;
      const originalText = textElement.getAttribute('data-original-text') || textElement.textContent;
      
      // Store original text if not already stored
      if (!textElement.getAttribute('data-original-text')) {
        textElement.setAttribute('data-original-text', originalText);
      }
      
      if (searchLower.length > 0) {
        // Create highlighted version
        const highlightedText = this.highlightText(originalText, searchValue);
        textElement.innerHTML = highlightedText;
      } else {
        // Restore original text
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

  // Function to clear highlights
  clearHighlights() {
    const dropdownItems = this.template.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
      const textElement = item.querySelector('span') || item;
      const originalText = textElement.getAttribute('data-original-text');
      if (originalText) {
        textElement.innerHTML = originalText;
      }
    });
  }
}
