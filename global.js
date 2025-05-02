/**
 * Mocks completos para APIs del navegador que algunas dependencias requieren en React Native
 * Esto evita errores con bibliotecas como nano-css (usada por react-use)
 */

// Utilidad para manejar undefined en acceso a propiedades
const safeProp = (obj, path) => {
  if (!obj) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current[part] === undefined) return undefined;
    current = current[part];
  }
  return current;
};

// Mock para document
if (typeof document === 'undefined') {
  const mockDocument = {
    createElement: () => {
      const element = {
        style: {},
        setAttribute: () => {},
        appendChild: () => {},
        getElementsByTagName: () => [],
        children: [],
        childNodes: [],
        className: '',
        tagName: '',
        nodeName: '',
      };
      return element;
    },
    createElementNS: (ns, tagName) => {
      const element = {
        style: {},
        setAttribute: () => {},
        appendChild: () => {},
        getElementsByTagName: () => [],
        children: [],
        childNodes: [],
        className: '',
        tagName,
        nodeName: tagName,
        namespaceURI: ns,
      };
      return element;
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    getElementsByTagName: () => [],
    getElementsByClassName: () => [],
    getElementsByName: () => [],
    documentElement: {
      style: {},
      appendChild: () => {},
      removeChild: () => {},
      scrollLeft: 0,
      scrollTop: 0,
      clientWidth: 0,
      clientHeight: 0,
    },
    createTextNode: () => ({}),
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    head: {
      appendChild: () => {},
      removeChild: () => {},
      children: [],
      childNodes: [],
    },
    body: {
      appendChild: () => {},
      removeChild: () => {},
      children: [],
      childNodes: [],
    },
    implementation: {
      createHTMLDocument: (title) => ({ ...mockDocument, title }),
    },
    createRange: () => ({
      setStart: () => {},
      setEnd: () => {},
      selectNode: () => {},
      selectNodeContents: () => {},
      getBoundingClientRect: () => ({ top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 }),
      getClientRects: () => [],
    }),
    location: {
      href: '',
      pathname: '',
      search: '',
      hash: '',
    },
  };
  
  global.document = mockDocument;
} else {
  // Si document existe pero falta alguna función importante, la agregamos
  const methodsToCheck = [
    'getElementsByTagName', 'getElementsByClassName', 'createElement', 
    'querySelector', 'querySelectorAll', 'getElementById'
  ];
  
  methodsToCheck.forEach(method => {
    if (typeof document[method] !== 'function') {
      document[method] = method === 'getElementById' ? () => null : () => [];
    }
  });
  
  if (!document.documentElement) document.documentElement = { style: {} };
  if (!document.head) document.head = { appendChild: () => {}, removeChild: () => {} };
  if (!document.body) document.body = { appendChild: () => {}, removeChild: () => {} };
}

// Mock para window
if (typeof window === 'undefined') {
  global.window = {
    document: global.document,
    location: {
      href: '',
      pathname: '',
      search: '',
      hash: '',
    },
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
    },
    sessionStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    getComputedStyle: () => ({
      getPropertyValue: () => '',
    }),
    matchMedia: () => ({
      matches: false,
      addListener: () => {},
      removeListener: () => {},
    }),
    scrollTo: () => {},
    scrollBy: () => {},
    requestAnimationFrame: callback => setTimeout(callback, 0),
    cancelAnimationFrame: id => clearTimeout(id),
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    innerWidth: 0,
    innerHeight: 0,
    performance: {
      now: () => Date.now(),
      mark: () => {},
      measure: () => {},
    },
    devicePixelRatio: 1,
    screen: {
      width: 0,
      height: 0,
    },
    navigator: {
      userAgent: 'react-native',
      languages: ['en'],
      platform: 'react-native',
    },
    JSON: global.JSON,
    console: global.console,
    history: {
      pushState: () => {},
      replaceState: () => {},
      back: () => {},
      forward: () => {},
      go: () => {},
    },
    btoa: input => input,
    atob: input => input,
  };
} else {
  // Asegurémonos de que window tiene todas las propiedades necesarias
  if (!window.localStorage) {
    window.localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
    };
  }
  
  if (!window.sessionStorage) {
    window.sessionStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
    };
  }
  
  if (!window.matchMedia) {
    window.matchMedia = () => ({
      matches: false,
      addListener: () => {},
      removeListener: () => {},
    });
  }
}

// Mock para navigator
if (typeof navigator === 'undefined') {
  global.navigator = {
    userAgent: 'react-native',
    languages: ['en'],
    platform: 'react-native',
    clipboard: {
      writeText: () => Promise.resolve(),
      readText: () => Promise.resolve(''),
    },
  };
}

// Prevenir errores de React Hook Form
if (typeof MutationObserver === 'undefined') {
  global.MutationObserver = class {
    constructor(callback) {}
    disconnect() {}
    observe(element, initObject) {}
  };
}

if (typeof ResizeObserver === 'undefined') {
  global.ResizeObserver = class {
    constructor(callback) {}
    disconnect() {}
    observe(element, initObject) {}
    unobserve(element) {}
  };
}

// Para evitar errores con Object.entries() y similares
// El error "Cannot convert undefined value to object" a menudo ocurre aquí
const originalObjectEntries = Object.entries;
Object.entries = function(obj) {
  if (obj === undefined || obj === null) {
    return [];
  }
  return originalObjectEntries(obj);
};

const originalObjectKeys = Object.keys;
Object.keys = function(obj) {
  if (obj === undefined || obj === null) {
    return [];
  }
  return originalObjectKeys(obj);
};

const originalObjectValues = Object.values;
Object.values = function(obj) {
  if (obj === undefined || obj === null) {
    return [];
  }
  return originalObjectValues(obj);
};

// Adicionamos algunas propiedades para React hooks
global.__REACT_DEVTOOLS_APPEND_COMPONENT_STACK__ = true;
global.__REACT_DEVTOOLS_GLOBAL_HOOK__ = { isDisabled: true };