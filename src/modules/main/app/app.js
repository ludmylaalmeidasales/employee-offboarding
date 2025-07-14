import { LightningElement } from 'lwc';

export default class HelloWorldApp extends LightningElement {
  // Flag to prevent duplicate event listeners
  closeButtonListenerAdded = false;
  isTyping = false; // Add reactive property to track typing state
  resultsLoaded = false; // Add reactive property to track when results are loaded

  // Search dropdown functionality
  connectedCallback() {
    console.log('Component connected');
    // Make the gender filter removal method available globally
    window.handleGenderFilterRemoval = (pillType) => this.handleGenderFilterRemoval(pillType);
  }

  renderedCallback() {
    console.log('Component rendered');
    // Wait for DOM to be ready
    setTimeout(() => {
      this.setupDropdown();
    }, 100);
  }

  // Getter for sparkle icon source
  get sparkleIconSrc() {
    if (this.resultsLoaded) {
      return 'https://i.imgur.com/jtks6DY.png';
    }
    return this.isTyping ? 'https://i.imgur.com/i7mWNdj.png' : 'https://i.imgur.com/Vo3O5Wb.png';
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
      switch(event.key) {
        case 'ArrowDown':
          if (!searchDropdown.classList.contains('show')) {
            return;
          }
          event.preventDefault();
          selectedIndex = Math.min(selectedIndex + 1, dropdownItems.length - 1);
          this.updateSelection();
          break;
        case 'ArrowUp':
          if (!searchDropdown.classList.contains('show')) {
            return;
          }
          event.preventDefault();
          selectedIndex = Math.max(selectedIndex - 1, -1);
          this.updateSelection();
          break;
        case 'Enter':
          event.preventDefault();
          if (searchDropdown.classList.contains('show') && selectedIndex >= 0) {
            this.selectItem(dropdownItems[selectedIndex]);
          } else {
            // If no item is selected or dropdown is not visible, search with current input value
            this.performSearch(searchInput.value);
            // Hide dropdown after performing search
            searchDropdown.classList.remove('show');
            selectedIndex = -1;
            this.clearSelection();
          }
          break;
        case 'Escape':
          if (!searchDropdown.classList.contains('show')) {
            return;
          }
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

    // Add input event listener using the class-level handleInput method
    searchInput.addEventListener('input', () => this.handleInput());
    
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
    
    // Reset results loaded state
    this.resultsLoaded = false;
    
    // Hide the filters-container when search starts
    const filtersContainer = this.template.querySelector('.filters-container');
    if (filtersContainer) {
      filtersContainer.style.display = 'none';
    }
    
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
        <div class="loading-container" style="width: 100%;">
          <div class="search-results-toolbar" style="display: flex; align-items: start; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
            <div class="provider-matches-count" style="font-weight: 400; color: #2E2E2E; font-size: 1.2rem; letter-spacing: 0.19px; text-align: left;">Provider Matches (5)</div>
            <div class="search-toolbar-actions" style="display: flex; align-items: center; gap: 1rem; flex-shrink: 0;">
              <button class="slds-button slds-button_neutral">
                <img src="https://i.imgur.com/069Jif6.png" alt="Map" style="width: 20px; height: 20px; margin-right: 8px; vertical-align: middle;">
                Show Map
              </button>
              <div class="sort-dropdown">
                <label for="sortBy" class="slds-assistive-text">Sort by Recommended</label>
                <select id="sortBy" class="slds-select">
                  <option>Sort by Recommended</option>
                  <option>Top Rated</option>
                  <option>Nearest</option>
                  <option>Availability</option>
                </select>
              </div>
            </div>
          </div>

          <div class="loading-stencils">
            ${Array(3).fill().map(() => `
              <div class="provider-card-stencil" style="background: #ffffff; border: 1px solid #C9C9C9; border-radius: 12px; padding: 2rem; margin: 0 0 1.5rem 0; display: flex; flex-direction: column; width: 100%; max-width: 100%;">
                <div class="provider-card-main" style="display: flex; align-items: flex-start; gap: 2rem; margin-bottom: 1.5rem; width: 100%;">
                  <div class="provider-avatar-stencil" style="flex-shrink: 0; width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite;"></div>
                  <div class="provider-main-info" style="flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: space-between;">
                    <div class="provider-name-stencil" style="width: 200px; height: 24px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px; margin-bottom: 8px;"></div>
                    <div class="provider-specialty-stencil" style="width: 150px; height: 18px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px; margin-bottom: 12px;"></div>
                    <div class="provider-rating-stencil" style="width: 120px; height: 20px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px; margin-bottom: 12px;"></div>
                    <div class="provider-badges-stencil" style="display: flex; flex-direction: column; gap: 8px;">
                      <div style="width: 140px; height: 20px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px;"></div>
                      <div style="width: 100px; height: 20px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px;"></div>
                    </div>
                  </div>
                  <div class="provider-contact" style="display: flex; flex-direction: column; align-items: flex-start; justify-content: center; min-width: 200px; gap: 0.5rem; flex-shrink: 0;">
                    <div class="contact-stencil" style="width: 180px; height: 40px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 12px;"></div>
                    <div class="contact-stencil" style="width: 140px; height: 40px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 12px;"></div>
                  </div>
                  <div class="provider-actions" style="display: flex; flex-direction: column; gap: 1rem; min-width: 150px; align-items: flex-end; justify-content: center; flex-shrink: 0;">
                    <div class="button-stencil" style="width: 140px; height: 36px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px;"></div>
                    <div class="button-stencil" style="width: 120px; height: 36px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px;"></div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <style>
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        </style>
      `;
      emptyState.style.display = 'block';
      
      // Set results loaded to true to change the icon
      this.resultsLoaded = true;
      
      // Make component instance available for inline handlers
      emptyState.__componentInstance = this;
      
      // Add event listener for gender filter removal
      const filterPillsContainer = emptyState.querySelector('.filter-pills');
      if (filterPillsContainer) {
        filterPillsContainer.addEventListener('genderFilterRemoved', (event) => {
          console.log('Gender filter removed:', event.detail.pill);
          // Get the current search input value
          const searchInput = this.template.querySelector('input[type="text"]');
          if (searchInput && searchInput.value.trim()) {
            // Remove gender keywords from the search query
            let searchQuery = searchInput.value.trim();
            searchQuery = searchQuery.replace(/\b(female|woman|women|male|man|men)\b/gi, '').trim();
            
            // Update the search input with the cleaned query
            searchInput.value = searchQuery;
            
            // Trigger a new search without the gender filter
            this.performSearch(searchQuery);
          }
        });
      }
    }
  }

  // Function to hide loading state
  hideLoadingState() {
    console.log('Loading complete, displaying results');
  }

  // Function to display provider cards
  displayProviderCards(searchQuery) {
    const emptyState = this.template.querySelector('.empty-state');
    const filtersContainer = this.template.querySelector('.filters-container').parentElement;
    if (emptyState) {
      const providers = this.generateMockProviders(searchQuery);
      const filterPills = this.generateFilterPills(searchQuery);
      
      // Hide the filters container to remove the space it takes up
      if (filtersContainer) {
        filtersContainer.style.display = 'none';
      }
      
              emptyState.innerHTML = `
          <div class="search-results" style="width: 100%;">
           <div class="filter-pills" style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 2rem;">
              ${filterPills}
            </div>
          <div class="search-results-toolbar" style="display: flex; align-items: start; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
            <div class="provider-matches-count" style="font-weight: 400; color: #2E2E2E; font-size: 1.2rem; letter-spacing: 0.19px; text-align: left;">Search Results (${providers.length})</div>
            <div class="search-toolbar-actions" style="display: flex; align-items: center; gap: 1rem; flex-shrink: 0;">
              <button class="slds-button slds-button_neutral">
                <img src="https://i.imgur.com/069Jif6.png" alt="Map" style="width: 20px; height: 20px; margin-right: 8px; vertical-align: middle;">
                Show Map
              </button>
              <div class="sort-dropdown">
                <label for="sortBy" class="slds-assistive-text">Sort by Recommended</label>
                <select id="sortBy" class="slds-select">
                  <option>Sort by Recommended</option>
                  <option>Top Rated</option>
                  <option>Nearest</option>
                  <option>Availability</option>
                </select>
              </div>
            </div>
          </div>

          <div class="provider-cards-container">
            ${providers.map(provider => this.createProviderCardStyled(provider)).join('')}
          </div>
          
          <div class="load-more-container" style="display: flex; justify-content: center; margin-top: 2rem; padding: 1rem;">
            <button class="slds-button slds-button_neutral slds-button_large" style="min-width: 200px;">
              Load More Providers
            </button>
          </div>
        </div>
      `;
      emptyState.style.display = 'block';
      
      // Set results loaded to true to change the icon
      this.resultsLoaded = true;
    }
  }

  // Function to reset the view to initial state
  resetView() {
    const emptyState = this.template.querySelector('.empty-state');
    const filtersContainer = this.template.querySelector('.filters-container').parentElement;
    
    if (emptyState) {
      emptyState.innerHTML = `
        <!-- Custom illustration for Ask a Question -->
        <img class="main-illustration" src="https://i.imgur.com/TbPoQBf.png" alt="Ask a Question" width="300px">
        <h2 class="slds-text-heading_medium">Ask a Question</h2>
        <p>Describe the patient's needs and we'll match them with the right provider</p>
      `;
      emptyState.style.display = 'block';
    }
    
    if (filtersContainer) {
      filtersContainer.style.display = 'block';
    }
    
    this.resultsLoaded = false;
  }

  // Generate pills for filters based on search query
  generateFilterPills(searchQuery) {
    const pills = [];
    const searchLower = searchQuery.toLowerCase();
    
    // Always include these default pills
    pills.push('Accepting New Patients');
    pills.push('Blue Cross Blue Shield');
    
    // Gender-based pills
    if (/\b(female|woman|women)\b/i.test(searchLower)) pills.push('Female Provider');
    if (/\b(male|man|men)\b/i.test(searchLower)) pills.push('Male Provider');
    
    // Specialty-based pills
    if (/cardio/i.test(searchLower)) pills.push('Cardiologist');
    if (/dermatologist/i.test(searchLower)) pills.push('Dermatologist');
    if (/endocrinologist/i.test(searchLower)) pills.push('Endocrinologist');
    if (/orthopedic|orthopaedic|surgeon/i.test(searchLower)) pills.push('Orthopedic Surgeon');
    if (/psychiatrist/i.test(searchLower)) pills.push('Psychiatrist');
    if (/pediatric/i.test(searchLower)) pills.push('Pediatrician');
    if (/gastroenterologist/i.test(searchLower)) pills.push('Gastroenterologist');
    if (/neurologist/i.test(searchLower)) pills.push('Neurologist');
    if (/family medicine|family doctor/i.test(searchLower)) pills.push('Family Medicine');
    
    // Location-based pills
    if (/san francisco|sf/i.test(searchLower)) pills.push('San Francisco, CA');
    if (/94114|94102|94109/i.test(searchLower)) pills.push('San Francisco, CA');
    if (/castro/i.test(searchLower)) pills.push('Castro District');
    if (/market st/i.test(searchLower)) pills.push('Market Street Area');
    
    // Insurance and acceptance pills
    if (/accept|accepting/i.test(searchLower)) pills.push('Accepts New Patients');
    if (/blue cross|bcbs/i.test(searchLower)) pills.push('Blue Cross Blue Shield');
    if (/insurance/i.test(searchLower)) pills.push('In-Network');
    
    // Rating and quality pills
    if (/top|best|rated/i.test(searchLower)) pills.push('Top-Rated');
    if (/5 star|five star/i.test(searchLower)) pills.push('5-Star Rated');
    if (/reviews/i.test(searchLower)) pills.push('Highly Reviewed');
    
    // Medical condition pills
    if (/heart|cardiac/i.test(searchLower)) pills.push('Cardiac Care');
    if (/skin|dermatology/i.test(searchLower)) pills.push('Dermatology');
    if (/diabetes|endocrine/i.test(searchLower)) pills.push('Diabetes Care');
    if (/bone|joint|orthopedic/i.test(searchLower)) pills.push('Orthopedic Care');
    if (/mental|psychiatry/i.test(searchLower)) pills.push('Mental Health');
    if (/child|pediatric/i.test(searchLower)) pills.push('Pediatric Care');
    if (/digestive|gastro/i.test(searchLower)) pills.push('Gastroenterology');
    if (/brain|neurology/i.test(searchLower)) pills.push('Neurology');
    
    // If no specific pills were generated, add a general one based on the search
    if (pills.length === 2 && searchQuery.trim()) { // Only the 2 default pills
      pills.push(`"${searchQuery}"`);
    }
    
    // Always add Filters pill at the end
    pills.push('Filters');
    
    return pills.map((pill, index) => {
      const isGenderPill = pill === 'Female Provider' || pill === 'Male Provider';
      const isFiltersPill = pill === 'Filters';
      const dataAttribute = isGenderPill ? `data-gender-pill="${pill}"` : '';
      const clickHandler = isGenderPill ? 
        `onclick="this.parentElement.remove(); window.handleGenderFilterRemoval('${pill}')"` : 
        `onclick="this.parentElement.remove()"`;
      
      // For the Filters pill (last pill), put X icon before text
      if (isFiltersPill) {
        return `<span class="slds-pill slds-pill_bare" style="background: #fff; color: #374151; padding: 0.5rem 0.75rem; border-radius: 12px; font-size: 0.875rem; font-weight: 400; border: 1px solid #5C5C5C; margin-bottom: 0.5rem; display: inline-flex; align-items: center; gap: 0.5rem; height: 26px;" ${dataAttribute}>
          <img src="https://i.imgur.com/OBjJuWs.png" alt="filter icon" style="width: 20px; height: 20px; object-fit: contain;">
          <span class="slds-pill__label">${pill}</span>
        </span>`;
      }
      
      // For all other pills, keep original structure (text first, then X icon)
      return `<span class="slds-pill slds-pill_bare" style="background: #fff; color: #374151; padding: 0.5rem 0.75rem; border-radius: 12px; font-size: 0.875rem; font-weight: 400; border: 1px solid #5C5C5C; margin-bottom: 0.5rem; display: inline-flex; align-items: center; gap: 0.5rem; height: 26px;" ${dataAttribute}>
        <span class="slds-pill__label">${pill}</span>
        <img src="https://i.imgur.com/OF4DQQ9.png" alt="filter icon" style="width: 20px; height: 20px; object-fit: contain; cursor: pointer;" ${clickHandler}>
      </span>`;
    }).join('');
  }

  // Function to create styled provider card HTML
  createProviderCardStyled(provider) {
    console.log('Creating provider card with checkbox for:', provider.name);
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
      <div class="provider-card styled-provider-card" style="background: #ffffff; border: 1px solid #C9C9C9; border-radius: 12px; padding: 2rem; margin: 0 0 1.5rem 0; display: flex; flex-direction: column; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden; width: 100%; max-width: 100%;">
        <div class="provider-card-main" style="display: flex; align-items: flex-start; gap: 2rem; margin-bottom: 1rem; width: 100%;">
          <div class="provider-info-section" style="flex: 1; display: flex; align-items: flex-start; gap: 1.5rem; min-width: 0;">
            <div class="provider-avatar" style="flex-shrink: 0; position: relative;">
              <div class="provider-checkbox" style="position: absolute; top: -8px; left: -16px; z-index: 10; background: white; border-radius: 50%; padding: 2px;">
                <div class="slds-checkbox">
                  <input type="checkbox" name="provider-select" id="provider-${provider.name.replace(/\s+/g, '-').toLowerCase()}" style="transform: scale(1.2);">
                  <label class="slds-checkbox__label" for="provider-${provider.name.replace(/\s+/g, '-').toLowerCase()}">
                    <span class="slds-checkbox_faux"></span>
                  </label>
                </div>
              </div>
              <img src="${provider.image}" alt="${provider.name}" width="64" height="64" style="border-radius: 50%; width: 64px; height: 64px; object-fit: cover;">
            </div>
            <div class="provider-main-info" style="flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: space-between;">
              <div class="provider-name-row" style="display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.5rem; align-items: flex-start;">
                <span class="provider-name" style="font-size: 1.25rem; font-weight: 700; color: #1f2937; line-height: 1.3; text-align: left;">${provider.name}</span>
                <span class="provider-specialty" style="font-size: 1.05rem; color: #6b7280; font-weight: 500; line-height: 1.4; text-align: left;">${provider.specialty}</span>
              </div>
              <div class="provider-rating-row" style="margin: 0.5rem 0 0.5rem 0; display: flex; align-items: center; gap: 0.5rem;">
                <span class="stars" style="color: #f59e0b; font-size: 1.2rem; letter-spacing: 0.05em;">${starsHtml}</span>
                <span class="review-count" style="color: #6b7280; font-size: 1rem; font-weight: 500;">${reviewHtml}</span>
              </div>
              <div class="provider-badges" style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.5rem;">
                ${provider.acceptsNewPatients ? 
                  `<span class="provider-badge accepting" style="display: inline-flex; align-items: center; font-size: 0.9rem; font-weight: 600;">
                    <img src="https://i.imgur.com/jO0KyPm.png" alt="Accepting New Patients" style="width: 20px; height: 20px; margin-right: 6px; flex-shrink: 0;">
                    Accepting New Patients
                  </span>` : ''
                }
                <span class="provider-badge in-network" style="display: inline-flex; align-items: center; font-size: 0.9rem; font-weight: 600;">
                  <img src="https://i.imgur.com/kVJY5hL.png" alt="In-Network" style="width: 20px; height: 20px; margin-right: 6px; flex-shrink: 0;">
                  In-Network
                </span>
              </div>
            </div>
          </div>
          <div class="provider-contact" style="flex: 1; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 0.5rem; min-width: 0;">
            <div class="provider-location" style="display: flex; align-items: center; gap: 0.5rem; color: #4b5563; font-size: 1rem; font-weight: 500; padding: 0.5rem 0.5rem; border-radius: 12px; transition: background-color 0.2s ease;">
              <img src="https://i.imgur.com/0Z3n526.png" alt="Location" style="width: 20px; height: 20px; flex-shrink: 0;">
              <span>${provider.address.replace('\n', '<br>')}</span>
            </div>
            <div class="provider-phone" style="display: flex; align-items: center; gap: 0.5rem; color: #4b5563; font-size: 1rem; font-weight: 500; padding: 0.5rem 0.5rem; border-radius: 12px; transition: background-color 0.2s ease;">
              <img src="https://i.imgur.com/K82hdBE.png" alt="Phone" style="width: 20px; height: 20px; flex-shrink: 0;">
              <span>${provider.phone}</span>
            </div>
          </div>
          <div class="provider-actions" style="flex: 1; display: flex; flex-direction: column; gap: 1rem; align-items: flex-end; justify-content: center; min-width: 0;">
            <button class="slds-button slds-button_brand">Book Appointment</button>
            <button class="slds-button slds-button_neutral">View Profile</button>
          </div>
        </div>
      </div>
    `;
  }

  // Update generateMockProviders to include address and phone
  generateMockProviders(searchQuery) {
    console.log('generateMockProviders called with searchQuery:', searchQuery);
    
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

    console.log('Specialty determined:', specialty);

    const baseProviders = [
      {
        name: "David Ho, MD",
        specialty,
        rating: 5,
        reviewCount: 20,
        acceptsNewPatients: true,
        address: "1290 Sanchez St San Francisco, CA 94114",
        phone: "(773) 456-7890",
        image: "https://i.imgur.com/yDLi9lY.png",
        gender: "Male"
      },
      {
        name: "Tyra Dhillon, MD",
        specialty,
        rating: 4.2,
        reviewCount: 8,
        acceptsNewPatients: true,
        address: "1290 Sanchez St San Francisco, CA 94114",
        phone: "(773) 456-7890",
        image: "https://i.imgur.com/hKDCXJQ.png",
        gender: "Female"
      },
      {
        name: "Michael Rodriguez, MD",
        specialty,
        rating: 4.7,
        reviewCount: 12,
        acceptsNewPatients: true,
        address: "555 Clayton Ave San Francisco, CA 05555",
        phone: "(661) 345-9087",
        image: "https://i.imgur.com/QVeOtMG.png",
        gender: "Male"
      },
      {
        name: "Sarah Chen, MD",
        specialty,
        rating: 4.5,
        reviewCount: 15,
        acceptsNewPatients: true,
        address: "1234 Market St San Francisco, CA 94102",
        phone: "(415) 555-0123",
        image: "https://i.imgur.com/qjcPfIK.png",
        gender: "Female"
      },
      {
        name: "Raj Patel, MD",
        specialty,
        rating: 4.8,
        reviewCount: 32,
        acceptsNewPatients: true,
        address: "789 Castro St San Francisco, CA 94114",
        phone: "(415) 555-0456",
        image: "https://i.imgur.com/MduIjHq.png",
        gender: "Male"
      }
    ];

    // Filter by gender if specified in search query
    const searchLower = searchQuery.toLowerCase();
    let filteredProviders = baseProviders;
    
    console.log('Checking for gender keywords in:', searchLower);
    console.log('Female keywords found:', /\b(female|woman|women)\b/i.test(searchLower));
    console.log('Male keywords found:', /\b(male|man|men)\b/i.test(searchLower));
    
    if (/\b(female|woman|women)\b/i.test(searchLower)) {
      filteredProviders = baseProviders.filter(provider => provider.gender === "Female");
      console.log('Filtering for female providers, found:', filteredProviders.length);
    } else if (/\b(male|man|men)\b/i.test(searchLower)) {
      filteredProviders = baseProviders.filter(provider => provider.gender === "Male");
      console.log('Filtering for male providers, found:', filteredProviders.length);
    }

    console.log('Final providers returned:', filteredProviders.length);
    return filteredProviders;
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

  // Simple method to handle sparkle icon change
  handleInputChange(event) {
    this.isTyping = event.target.value.length > 0;
    console.log('Input changed, isTyping:', this.isTyping);
  }

  // Handle input changes - moved to class level
  handleInput() {
    const searchInput = this.template.querySelector('input[type="text"]');
    const searchDropdown = this.template.querySelector('.search-dropdown');
    
    if (!searchInput || !searchDropdown) {
      console.log('Elements not found in handleInput');
      return;
    }
    
    console.log('Input event triggered, value:', searchInput.value);
    
    // Get the sparkle icon and close button
    const sparkleIcon = this.template.querySelector('#sparkleIcon');
    const closeButton = this.template.querySelector('#closeButton');
    
    if (searchInput.value.length > 0) {
      console.log('Showing dropdown');
      searchDropdown.classList.add('show');
      this.filterAndHighlightSuggestions(searchInput.value, searchDropdown);
      
      // Change sparkle icon to custom image when typing
      if (sparkleIcon) {
        sparkleIcon.src = 'https://i.imgur.com/i7mWNdj.png';
        console.log('Sparkle icon changed to custom image');
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
      
      // Restore sparkle icon when input is empty
      if (sparkleIcon) {
        sparkleIcon.src = 'https://i.imgur.com/Vo3O5Wb.png';
        console.log('Sparkle icon restored');
      }
      
      // Hide close button when input is empty
      if (closeButton) {
        closeButton.style.display = 'none';
      }
    }
  }

  // Handle sparkle icon click to reset page or trigger search
  handleSparkleIconClick() {
    // If results are loaded, reset the page
    if (this.resultsLoaded) {
      // Reset all state
      this.resultsLoaded = false;
      this.isTyping = false;
      
      // Clear the search input
      const searchInput = this.template.querySelector('input[type="text"]');
      if (searchInput) {
        searchInput.value = '';
      }
      
      // Hide the search dropdown
      const searchDropdown = this.template.querySelector('.search-dropdown');
      if (searchDropdown) {
        searchDropdown.classList.remove('show');
      }
      
      // Use the resetView function to restore the original state
      this.resetView();
      
      // Clear any selection
      this.clearSelection();
      
      console.log('Page reset to original state');
    } else {
      // If no results are loaded, trigger search with current input value
      const searchInput = this.template.querySelector('input[type="text"]');
      if (searchInput && searchInput.value.trim()) {
        console.log('Triggering search from sparkle icon click');
        this.performSearch(searchInput.value.trim());
      } else {
        console.log('No search query to perform');
      }
    }
  }

  // Handle gender filter removal
  handleGenderFilterRemoval(pillType) {
    console.log('Gender filter removed:', pillType);
    // Get the current search input value
    const searchInput = this.template.querySelector('input[type="text"]');
    if (searchInput && searchInput.value.trim()) {
      // Remove gender keywords from the search query
      let searchQuery = searchInput.value.trim();
      searchQuery = searchQuery.replace(/\b(female|woman|women|male|man|men)\b/gi, '').trim();
      
      // Update the search input with the cleaned query
      searchInput.value = searchQuery;
      
      // Trigger a new search without the gender filter
      this.performSearch(searchQuery);
    }
  }
}

