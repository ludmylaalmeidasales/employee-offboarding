import { LightningElement } from 'lwc';

export default class HelloWorldApp extends LightningElement {
  // Flag to prevent duplicate event listeners
  closeButtonListenerAdded = false;

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
          } else {
            // If no item is selected, search with current input value
            this.performSearch(searchInput.value);
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
      
      // Get the sparkle icon and close button
      const sparkleIcon = this.template.querySelector('#sparkleIcon');
      const closeButton = this.template.querySelector('#closeButton');
      
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
        
        // Show close button when there's text
        if (closeButton) {
          closeButton.style.display = 'inline-block';
          console.log('Close button shown');
        } else {
          console.log('Close button not found');
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
        
        // Hide close button when input is empty
        if (closeButton) {
          closeButton.style.display = 'none';
        }
      }
    };
    searchInput.addEventListener('input', this.handleInput);
    
    // Add click event listener for close button
    const closeButton = this.template.querySelector('#closeButton');
    if (closeButton) {
      console.log('Close button found, adding click listener');
      closeButton.addEventListener('click', () => {
        console.log('Close button clicked');
        
        // Visual test - change button background temporarily
        closeButton.style.backgroundColor = '#FF0000';
        setTimeout(() => {
          closeButton.style.backgroundColor = '';
        }, 200);
        
        // Use the same input selector as the rest of the code
        const inputElement = this.template.querySelector('input[type="text"]');
        console.log('Input element found:', !!inputElement);
        
        if (inputElement) {
          // Clear the input
          inputElement.value = '';
          console.log('Input cleared, new value:', inputElement.value);
          
          // Focus the input
          inputElement.focus();
          
          // Trigger input event to update UI
          this.handleInput();
        } else {
          console.log('Input element not found');
        }
        
        console.log('Close button action completed');
      });
    } else {
      console.log('Close button not found for click listener');
    }
    
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
    
    // Trigger search when item is selected
    this.performSearch(value);
    
    // Trigger search or form submission here
    console.log('Selected provider type:', value);
  }

  // Function to perform search
  performSearch(searchQuery) {
    console.log('Performing search for:', searchQuery);
    
    // Show loading state
    this.showLoadingState();
    
    // Simulate API call with setTimeout
    setTimeout(() => {
      // Hide loading state
      this.hideLoadingState();
      
      // Generate and display provider cards
      this.displayProviderCards(searchQuery);
    }, 2000); // 2 second delay to simulate API call
  }

  // Function to show loading state
  showLoadingState() {
    const emptyState = this.template.querySelector('.empty-state');
    if (emptyState) {
      emptyState.innerHTML = `
        <div class="loading-state">
          <div class="loading-spinner">
            <lightning-icon icon-name="utility:spinner" size="large" class="spinning-icon"></lightning-icon>
          </div>
          <h2 class="slds-text-heading_medium">Searching for providers...</h2>
          <p>Finding the best healthcare providers for your needs</p>
        </div>
      `;
    }
  }

  // Function to hide loading state
  hideLoadingState() {
    console.log('Loading complete, displaying results');
  }

  // Function to display provider cards
  displayProviderCards(searchQuery) {
    const emptyState = this.template.querySelector('.empty-state');
    if (emptyState) {
      // Generate mock provider data based on search query
      const providers = this.generateMockProviders(searchQuery);
      const filters = this.generateFilterPills(searchQuery);
      
      emptyState.innerHTML = `
        <div class="search-results" style="width: 100%;">
          <div class="search-results-toolbar" style="display: flex; align-items: start; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
            <div class="provider-matches-count" style="font-weight: 400; color: #2E2E2E; font-size: 1.2rem; letter-spacing: 0.19px; text-align: left;">Provider Matches (${providers.length})</div>
            <div class="search-toolbar-actions" style="display: flex; align-items: center; gap: 1rem; flex-shrink: 0;">
               <button class="slds-button slds-button_neutral">Show Map</button>
              <div class="sort-dropdown">
                <label for="sortBy" class="slds-assistive-text">Sort by</label>
                <select id="sortBy" class="slds-select">
                  <option>Sort by</option>
                  <option>Top Rated</option>
                  <option>Nearest</option>
                  <option>Availability</option>
                </select>
              </div>
            </div>
          </div>
          <div class="providers-grid">
            ${providers.map(provider => this.createProviderCardStyled(provider)).join('')}
          </div>
        </div>
      `;
    }
  }

  // Generate pills for filters based on search query
  generateFilterPills(searchQuery) {
    // Simple logic: split by keywords and return as pills
    const pills = [];
    if (/accept/i.test(searchQuery)) pills.push('Accepts New Patients');
    if (/top/i.test(searchQuery)) pills.push('Top-Rated');
    if (/cardio/i.test(searchQuery)) pills.push('Cardiologist');
    if (/hyperten/i.test(searchQuery)) pills.push('Hypertension');
    if (/94109|09424/.test(searchQuery)) pills.push('Near 94109');
    // Add more as needed
    return pills;
  }

  // Function to create styled provider card HTML
  createProviderCardStyled(provider) {
    // Star rating logic
    const fullStars = Math.floor(provider.rating);
    const halfStar = provider.rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    const starsHtml =
      '<span class="stars">' +
      '★'.repeat(fullStars) +
      (halfStar ? '☆' : '') +
      '☆'.repeat(emptyStars) +
      '</span>';
    const reviewHtml = provider.reviewCount > 0 ?
      `<span class="review-count">(${provider.reviewCount} reviews)</span>` :
      `<span class="review-count no-reviews">No Reviews</span>`;
    return `
      <div class="provider-card styled-provider-card" style="background: #ffffff; border: 1px solid #C9C9C9; border-radius: 20px; padding: 2rem; margin: 0 0 1.5rem 0; display: flex; flex-direction: column; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden; width: 100%; max-width: 100%;">
        <div class="provider-card-main" style="display: flex; align-items: flex-start; gap: 2rem; margin-bottom: 1.5rem; width: 100%;">
          <div class="provider-avatar" style="flex-shrink: 0;">
            <img src="${provider.image}" alt="${provider.name}" width="64" height="64" style="border-radius: 50%; width: 64px; height: 64px; object-fit: cover;">
          </div>
          <div class="provider-main-info" style="flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: space-between;">
            <div class="provider-name-row" style="display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.5rem; align-items: flex-start;">
              <span class="provider-name" style="font-size: 1.25rem; font-weight: 700; color: #1f2937; line-height: 1.3; text-align: left;">${provider.name}</span>
              <span class="provider-specialty" style="font-size: 1.05rem; color: #6b7280; font-weight: 500; line-height: 1.4; text-align: left;">${provider.specialty}</span>
            </div>
            <div class="provider-rating-row" style="margin: 0.5rem 0 0.75rem 0; display: flex; align-items: center; gap: 0.75rem;">
              <span class="stars" style="color: #f59e0b; font-size: 1.2rem; letter-spacing: 0.05em;">${starsHtml}</span>
              <span class="review-count" style="color: #6b7280; font-size: 1rem; font-weight: 500;">${reviewHtml}</span>
            </div>
            <div class="provider-badges" style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.5rem;">
              ${provider.acceptsNewPatients ? 
                `<span class="provider-badge accepting" style="display: inline-flex; align-items: center; font-size: 0.9rem; font-weight: 600;">✓ Accepting New Patients</span>` : ''
              }
              <span class="provider-badge in-network" style="display: inline-flex; align-items: center; font-size: 0.9rem; font-weight: 600;">In-Network</span>
            </div>
          </div>
          <div class="provider-contact" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 200px; gap: 0.75rem; flex-shrink: 0;">
            <div class="provider-location" style="display: flex; align-items: center; gap: 0.75rem; color: #4b5563; font-size: 1rem; font-weight: 500; padding: 0.5rem 0.75rem; border-radius: 12px; transition: background-color 0.2s ease;">
    
              <span>${provider.address.replace('\n', '<br>')}</span>
            </div>
            <div class="provider-phone" style="display: flex; align-items: center; gap: 0.75rem; color: #4b5563; font-size: 1rem; font-weight: 500; padding: 0.5rem 0.75rem; border-radius: 12px; transition: background-color 0.2s ease;">
              
              <span>${provider.phone}</span>
            </div>
          </div>
          <div class="provider-actions" style="display: flex; flex-direction: column; gap: 1rem; min-width: 150px; align-items: flex-end; justify-content: center; flex-shrink: 0;">
            <button class="slds-button slds-button_brand">Book Appointment</button>
            <button class="slds-button slds-button_neutral">View Profile</button>
          </div>
        </div>
      </div>
    `;
  }

  // Update generateMockProviders to include address and phone
  generateMockProviders(searchQuery) {
    let specialty = "Cardiologist";
    if (/dermatologist/i.test(searchQuery)) specialty = "Dermatologist";
    else if (/endocrinologist/i.test(searchQuery)) specialty = "Endocrinologist";
    else if (/orthopedic|orthopaedic|surgeon/i.test(searchQuery)) specialty = "Orthopedic Surgeon";
    else if (/psychiatrist/i.test(searchQuery)) specialty = "Psychiatrist";
    else if (/pediatric/i.test(searchQuery)) specialty = "Pediatrician";
    else if (/gastroenterologist/i.test(searchQuery)) specialty = "Gastroenterologist";
    else if (/neurologist/i.test(searchQuery)) specialty = "Neurologist";
    else if (/family medicine/i.test(searchQuery)) specialty = "Family Medicine Doctor";
    // Add more specialties as needed

    const baseProviders = [
      {
        name: "David Ho, MD",
        specialty,
        rating: 5,
        reviewCount: 20,
        acceptsNewPatients: true,
        address: "1290 Sanchez St\nSan Francisco, CA 94114",
        phone: "(773) 456-7890",
        image: "https://i.imgur.com/yDLi9lY.png"
      },
      {
        name: "Tyra Dhillon, MD",
        specialty,
        rating: 0,
        reviewCount: 0,
        acceptsNewPatients: true,
        address: "1290 Sanchez St\nSan Francisco, CA 94114",
        phone: "(773) 456-7890",
        image: "https://i.imgur.com/hKDCXJQ.png"
      },
      {
        name: "Michael Rodriguez, MD",
        specialty,
        rating: 0,
        reviewCount: 0,
        acceptsNewPatients: false,
        address: "555 Clayton Ave\nSan Francisco, CA 05555",
        phone: "(661) 345-9087",
        image: "https://i.imgur.com/QVeOtMG.png"
      },
      {
        name: "Sarah Chen, MD",
        specialty,
        rating: 4.5,
        reviewCount: 15,
        acceptsNewPatients: true,
        address: "1234 Market St\nSan Francisco, CA 94102",
        phone: "(415) 555-0123",
        image: "https://i.imgur.com/qjcPfIK.png"
      },
      {
        name: "Raj Patel, MD",
        specialty,
        rating: 4.8,
        reviewCount: 32,
        acceptsNewPatients: false,
        address: "789 Castro St\nSan Francisco, CA 94114",
        phone: "(415) 555-0456",
        image: "https://i.imgur.com/MduIjHq.png"
      }
    ];
    return baseProviders;
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
