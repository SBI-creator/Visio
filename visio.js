const nullpyv = "Visio App Connected to Server Successfully";

class SwipeManager {
    constructor(targetElement) {
        this.targetElement = targetElement;
        this.startX = 0;
        this.startY = 0;
        this.endX = 0;
        this.endY = 0;
        this.swipeConfig = null;

        this.init();
    }

    init() {
        this.targetElement.addEventListener('touchstart', this.touchStartHandler.bind(this));
        this.targetElement.addEventListener('touchend', this.touchEndHandler.bind(this));
    }

    setSwipeConfig(config) {
        this.swipeConfig = config; // Set swipe configuration for the component
    }

    touchStartHandler(event) {
        const touch = event.touches[0];
        this.startX = touch.clientX;
        this.startY = touch.clientY;
    }

    touchEndHandler(event) {
        const touch = event.changedTouches[0];
        this.endX = touch.clientX;
        this.endY = touch.clientY;
        this.handleSwipe();
    }

    handleSwipe() {
        const diffX = this.endX - this.startX;
        const diffY = this.endY - this.startY;

        if (Math.abs(diffX) > Math.abs(diffY)) { // Horizontal swipe
            if (diffX > 0) {
                console.log('Swipe Right');
                if (this.swipeConfig && this.swipeConfig.right) {
                    this.applySlideAnimation('right'); // Trigger slide right animation
                    navigate(this.swipeConfig.right); // Navigate to the target page
                }
            } else {
                console.log('Swipe Left');
                if (this.swipeConfig && this.swipeConfig.left) {
                    this.applySlideAnimation('left'); // Trigger slide left animation
                    navigate(this.swipeConfig.left); // Navigate to the target page
                }
            }
        } else { // Vertical swipe
            if (diffY > 0) {
                console.log('Swipe Down');
                if (this.swipeConfig && this.swipeConfig.down) {
                    navigate(this.swipeConfig.down); // Navigate to the target page
                }
            } else {
                console.log('Swipe Up');
                if (this.swipeConfig && this.swipeConfig.up) {
                    navigate(this.swipeConfig.up); // Navigate to the target page
                }
            }
        }
    }

    applySlideAnimation(direction) {
        // Add the appropriate class for the slide animation
        if (direction === 'right') {
            this.targetElement.classList.add('slide-right');
        } else if (direction === 'left') {
            this.targetElement.classList.add('slide-left');
        }

        // Remove the animation class after the animation ends to reset for the next swipe
        setTimeout(() => {
            this.targetElement.classList.remove('slide-right', 'slide-left');
        }, 500); // Duration should match the animation duration
    }
}

class LocalStorageManager {
    static setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error setting item in LocalStorage:', error);
        }
    }

    static getItem(key) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Error getting item from LocalStorage:', error);
            return null;
        }
    }

    static removeItem(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing item from LocalStorage:', error);
        }
    }

    static clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing LocalStorage:', error);
        }
    }
}

class Request {
  constructor() {
    this.url = window.location.href; // Get the current page URL
    this.params = {}; // To store dynamic params (e.g., /home/:ismail)
    this.query = {}; // To store query parameters (e.g., ?ismail=value)
    this.session = this.getSessionData(); // Automatically get session data
    this.parseUrl();
  }

  // Parse the URL to extract params and query
  parseUrl() {
    // Extract the path and query string from the URL
    const [path, queryString] = this.url.split('?');
    
    // Parse query string if present
    if (queryString) {
      this.query = this.parseQuery(queryString);
    }

    // Parse the path to get dynamic route parameters
    this.params = this.parseParams(path);
  }

  // Parse query string into an object (e.g., ?ismail=value)
  parseQuery(queryString) {
    const queryParams = {};
    const params = queryString.split('&');
    params.forEach(param => {
      const [key, value] = param.split('=');
      queryParams[key] = this.decodeQueryValue(value); // Decode the value here
    });
    return queryParams;
  }

  // Decode query values, replacing '+' with space and then decoding percent-encoded characters
  decodeQueryValue(value) {
    // Replace '+' with space before decoding the entire string
    const decodedValue = value.replace(/\+/g, ' '); // Replace '+' with space
    return decodeURIComponent(decodedValue); // Decode any other encoded characters (like '%20', '%3D', etc.)
  }

  // Parse dynamic parameters from the URL (e.g., /home/:ismail)
  parseParams(path) {
    const routeParams = {};
    // Split the path by '/' and check for dynamic segments
    const segments = path.split('/');
    
    // Define your route structure (e.g., /home/:ismail)
    const routeStructure = ['/home', ':ismail'];

    // Match dynamic parameters based on the route structure
    routeStructure.forEach((segment, index) => {
      if (segment.startsWith(':')) {
        // If it's a dynamic parameter, assign it from the path
        routeParams[segment.slice(1)] = segments[index + 1];
      }
    });

    return routeParams;
  }

  // Get session data (for example, from localStorage or a session store)
  getSessionData() {
    const session = localStorage.getItem('session');
    return session ? JSON.parse(session) : {};
  }

  // Set session data
  setSessionData(sessionData) {
    localStorage.setItem('session', JSON.stringify(sessionData));
    this.session = sessionData;
  }
}


class Visio {
    static components = {};
    static mode = 'desktop'; // Default mode
    static homePage = 'Home'; // Default homepage
    static where = '#app';

    // Method to define a component
    static defineComponent(name, options) {
        this.components[name] = options;
    }

    static renderComponent(name, qwerty) {
        const component = this.components[name];
        const appElement = document.querySelector(qwerty);
        console.log("Selector:", qwerty);
        if (component && component.render) {
            try {
                appElement.innerHTML = ''; // Clear previous content
                const renderedElement = component.render();
                appElement.appendChild(renderedElement); // Append the rendered element

                // Initialize SwipeManager for the component if swipeConfig exists
                if (component.swipeConfig) {
                    const swipeManager = new SwipeManager(appElement);
                    swipeManager.setSwipeConfig(component.swipeConfig);
                }
            } catch (error) {
                this.renderError(appElement, `Error rendering component "${name}": ${error.message}`);
                console.error(`Error rendering component "${name}":`, error); // Log error to console
            }
        } else {
            this.renderError(appElement, `Component "${name}" not found.`);
            console.warn(`Component "${name}" not found.`); // Warn if component is not defined
        }
    }

static merge(componentName, targetElement) {
        const component = this.components[componentName];

        if (component && component.render) {
            try {
                targetElement.innerHTML = ''; // Clear previous content
                const renderedElement = component.render();
                targetElement.appendChild(renderedElement); // Render component in the target element

                // Initialize SwipeManager if swipeConfig exists
                if (component.swipeConfig) {
                    const swipeManager = new SwipeManager(targetElement);
                    swipeManager.setSwipeConfig(component.swipeConfig);
                }

                console.log(`Component "${componentName}" merged into the target element successfully.`);
            } catch (error) {
                this.renderError(targetElement, `Error merging component "${componentName}": ${error.message}`);
                console.error(`Error merging component "${componentName}":`, error); // Log error
            }
        } else {
            this.renderError(targetElement, `Component "${componentName}" not found.`);
            console.warn(`Component "${componentName}" not found.`); // Warn if component is undefined
        }
    }

    // Method to render error messages
    static renderError(appElement, message) {
        appElement.innerHTML = ''; // Clear previous content
        const errorElement = document.createElement('div');
        errorElement.textContent = message;
        errorElement.style.color = 'red';
        errorElement.style.fontWeight = 'bold';
        appElement.appendChild(errorElement); // Display error message in the UI
    }

    // Method to initialize the framework
    static init(view) {
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1) || this.homePage;
            this.renderComponent(hash, view);
        });

        // Load homepage or default component
        this.renderComponent(window.location.hash.slice(1) || this.homePage, view);
    }

    static setStyles(styles) {
        const styleElement = document.createElement('style');
        const cssRules = Object.entries(styles).map(([selector, properties]) => {
            const props = Object.entries(properties)
                .map(([key, value]) => `${this.toKebabCase(key)}: ${value};`)
                .join(' ');
            return `${selector} { ${props} }`;
        }).join('\n');

        // Add fade-out and fade-in effect styles
        const fadeAnimations = `
          /* Sliding animation for right swipe */
.slide-right {
    animation: slideRight 0.5s ease-out forwards;
}

/* Sliding animation for left swipe */
.slide-left {
    animation: slideLeft 0.5s ease-out forwards;
}

/* Keyframes for sliding right */
@keyframes slideRight {
    0% {
        transform: translateX(-100%);
    }
    100% {
        transform: translateX(0);
    }
}

/* Keyframes for sliding left */
@keyframes slideLeft {
    0% {
        transform: translateX(100%);
    }
    100% {
        transform: translateX(0);
    }
}

        `;

        styleElement.textContent = cssRules + fadeAnimations;
        document.head.appendChild(styleElement);
    }

    static setTitle(name) {
        document.querySelector("title").textContent = name;
    }

    // Method to set the homepage
    static setHomePage(componentName) {
        if (this.components[componentName]) {
            this.homePage = componentName;
            console.log(`Homepage set to "${componentName}"`);
        } else {
            console.error(`Component "${componentName}" not found. Cannot set as homepage.`);
        }
    }

    static toKebabCase(str) {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }

    // Method to set the development mode
    static setMode(newMode) {
        this.mode = newMode;
        this.applyModeStyles(newMode);
    } 

    // Apply styles based on the selected mode
    static applyModeStyles(mode) {
        if (mode === 'mobile') {
            this.setStyles({
                'body': {
                    fontSize: '20px',
                    padding: '0px',
                },
                'header': {
                    padding: '10px',
                },
                'footer': {
                    padding: '10px',
                },
            });
        } else {
            this.setStyles({
                'body': {
                    fontSize: '15px',
                    padding: '0px',
                },
                'header': {
                    padding: '20px',
                },
                'footer': {
                    padding: '20px',
                },
            });
        }
    }
}

console.log(nullpyv);

function getSocketId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Updated navigate function
function navigate(url) {
    const appElement = document.querySelector(Visio.where);
    location.hash = url;
}

console.log("Your Visio Socket Id is:", getSocketId());