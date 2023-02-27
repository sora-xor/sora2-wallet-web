// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
const openApp = () => cy.visit('/');

const checkAttr = (subject, name: string, value: string) => {
  return cy.get(subject).invoke('attr', name).should('eq', value);
};

let popupcounter = 0;
let active_tab_index = 0;
const myTabs = [];
// @ts-ignore
if (window.top.myTabs) {
  // @ts-ignore
  window.top.myTabs.forEach((tab, i) => {
    if (i === 0 || !tab) {
      return;
    }
    try {
      tab.close();
      // @ts-ignore
      window.top.myTabs[i] = null;
    } catch (e) {
      console.log(e);
    }
  });
}
// @ts-ignore
window.top.myTabs = myTabs;
const myTabNames = [];
// @ts-ignore
window.top.myTabNames = myTabNames;

const debugTabState = () => {
  // comment this out to silence it
  console.warn('-----debugTabState: active_tab:', active_tab_index + ' ' + myTabNames[active_tab_index]);
  myTabs.forEach((_win, k) => {
    // @ts-ignore
    // @ts-ignore
    console.warn(k, {
      active_tab_index,
      name: myTabNames[k],
      win: _win,
      // @ts-ignore
      winATABNAME: _win ? _win.ATABNAME : null,
      // @ts-ignore
      app_name: _win ? _win.APP_NAME : null, // something i use for debugging
    });
  });
};

const debugTabHelper = () => {
  debugTabState();
  return {
    active_tab_index,
    myTabNames,
    myTabs,
  };
};

const visit = (originalFn, url, options) => {
  // support for keying the first window with a tab_name like our child windows to simplify switching windows and making it readable
  // instead of keeping track of array indexes
  // can pass options as first param too
  let tab_name = null;
  if (url && url.tab_name) {
    tab_name = url.tab_name;
  }
  if (options && options.tab_name) {
    tab_name = options.tab_name;
  }
  if (tab_name) {
    myTabNames[0] = tab_name;
  } else {
    // @ts-ignore
    myTabNames[0] = 'root';
  }
  // @ts-ignore
  myTabs[0] = cy.state('window');
  // originalFn is the existing `visit` command that you need to call
  // and it will receive whatever you pass in here.
  //
  // make sure to add a return here!
  return originalFn(url, options);
};

const tabVisit = (url, tab_name) => {
  if (typeof tab_name === 'undefined') {
    // @ts-ignore
    tab_name = myTabNames[myTabNames.indexOf(active_tab_index)];
  }
  // @ts-ignore
  const window_index = myTabNames.indexOf(tab_name);

  console.warn('tabVisit', {
    tab_name,
    window_index,
  });

  if (window_index === 0) {
    // for root window, reattach after iframe onload
    return new Cypress.Promise((resolve) => {
      active_tab_index = 0;
      // @ts-ignore
      const base_window = myTabs[0] || cy.state('window');
      // @ts-ignore
      const aut = base_window.top.document.getElementsByClassName('aut-iframe')[0];
      // console.warn('aut?', aut, originalWindow.document.getElementsByClassName('aut-iframe')[0])
      aut.onload = function () {
        aut.onload = null;
        active_tab_index = 0;
        setTimeout(() => {
          active_tab_index = 0;
          // @ts-ignore
          myTabs[0] = aut.contentWindow;
          // @ts-ignore
          cy.state('document', aut.contentWindow.document);
          // @ts-ignore
          cy.state('window', aut.contentWindow);
          console.log('>>> after iframe loaded');
          debugTabState();
          resolve();
        }, 500);
      };
      aut.contentWindow.location.href = url;
      active_tab_index = 0;
    });
  } else {
    // for popupwindows, just call openTab
    active_tab_index = window_index;
    // @ts-ignore
    return cy.openTab(url, { window_index, tab_name }).then(() => {
      console.log('AFTER OPENTAB');
      active_tab_index = window_index;
    });
  }
};

const openTab = (url, opts) => {
  opts = Object.assign(
    {
      timeout: null,
      // window_index: null,
      tab_name: null,
      // https://developer.mozilla.org/en-US/docs/Web/API/Window/open
      windowFeatures: null,
    },
    opts
  );
  if (!opts.tab_name) {
    throw new Error('please give your tab a name');
  }
  if (!myTabs[0]) {
    // @ts-ignore
    myTabs[0] = cy.state('window'); // capture the root window if we haven't already
    // @ts-ignore
    myTabs[0].ATABNAME = myTabNames[0];
  }
  const w = Cypress.config('viewportWidth');
  const h = Cypress.config('viewportHeight');
  if (!opts.windowFeatures) {
    opts.windowFeatures = `width=${w}, height=${h}`;
  }
  let indexNext = myTabs.length;
  // @ts-ignore
  const name_index = myTabNames.indexOf(opts.tab_name);
  console.warn('openTab', { name_index, indexNext, active_tab_index });
  if (name_index > -1) {
    indexNext = name_index;
  }
  // @ts-ignore
  myTabNames[indexNext] = opts.tab_name;
  function finalize() {
    // let windowName = 'popup' + performance.now();
    // let windowName = 'popup' + popupcounter;
    const windowName = 'popup' + opts.tab_name;

    console.warn('>>>> openTab %s "%s %s"', url, opts.windowFeatures, indexNext, opts.tab_name);
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/open
    popupcounter++;
    const popup = myTabs[indexNext] ? myTabs[indexNext] : window.top.open(url, windowName, opts.windowFeatures);
    // @ts-ignore
    cy.get('body').type('keydown', { keyCode: 116, which: 116 });

    // @ts-ignore
    myTabs[indexNext] = popup;
    // @ts-ignore
    myTabs[indexNext].ATABNAME = myTabNames[indexNext];
    function checkReady() {
      // @ts-ignore
      if (!popup) {
        setTimeout(() => {
          checkReady();
        }, 32); // arbitrary delay
      } else {
        // @ts-ignore
        // cy.state('document', popup.document)
        // // @ts-ignore
        // cy.state('window', popup)

        console.warn('>>>> after openTab');
        // debugTabState()
      }
    }
    checkReady();
  }
  active_tab_index = indexNext;
  if (myTabs[indexNext]) {
    // @ts-ignore
    cy.closeTab(indexNext).then(finalize);
    // return finalize()
  } else {
    return finalize();
  }
};

const switchToTab = (index_or_name) => {
  const index = resolve_index_or_name_to_index(index_or_name);
  console.warn('switchToTab', { index, index_or_name });
  active_tab_index = index;
  const winNext = myTabs[active_tab_index];
  if (!winNext) {
    throw new Error('tab missing');
  }
  // @ts-ignore
  // cy.state('document', winNext.document)
  // @ts-ignore
  // cy.state('window', winNext)
  // debugTabState()
};

const closeAllTabs = () => {
  if (!myTabs.length) {
    return;
  }
  myTabs.forEach((v, k) => {
    if (k > 0) {
      try {
        // @ts-ignore
        myTabs[k].close();
      } catch (e) {
        console.error(e);
      }
      // @ts-ignore
      myTabs[k] = null;
    }
  });
  myTabNames.splice(1);
  myTabs.splice(1); // keep first one only
  // return to state 0 (main / root / original window)
  active_tab_index = 0;
  // @ts-ignore
  cy.state('document', myTabs[0].document);
  // @ts-ignore
  cy.state('window', myTabs[0]);
};

const resolve_index_or_name_to_index = (index_or_name) => {
  let index = parseInt(index_or_name) >= 0 ? index_or_name : active_tab_index || 0;
  // @ts-ignore
  const name_index = myTabNames.indexOf(index_or_name);
  if (name_index > -1) {
    index = name_index;
  }
  return index;
};

const closeTab = (index_or_name) => {
  const index = resolve_index_or_name_to_index(index_or_name);
  console.warn('closeTab', { index_or_name, index });
  if (index === 0) {
    console.error('cant close root window');
    return; // new Cypress.Promise.resolve(true);
  }
  // @ts-ignore
  myTabs[index].close();
  // @ts-ignore
  myTabs[index] = null;
  const filteredList = myTabs.filter((tab) => tab);
  if (filteredList.length === 1) {
    cy.switchToTab(0);
  }
};

Cypress.on('window:before:load', (window) => {
  // const accounts = [];
  // @ts-expect-error
  window.injectedWeb3 = {};

  // function transformAccounts(accounts) {
  //   return accounts.map(({ address, name }) => ({
  //     address,
  //     name,
  //   }));
  // }

  // window.injectedWeb3.SingleSource = {
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/require-await
  //   enable: async (origin) => ({
  //     accounts: {
  //       // eslint-disable-next-line @typescript-eslint/require-await
  //       get: async () => accounts,
  //       subscribe: (cb) => {
  //         // @ts-expect-error
  //         const sub = window.SingleSource.accounts.subscribe((accounts) => {
  //           cb(transformAccounts(accounts));
  //         });
  //         return () => {
  //           sub.unsubscribe();
  //         };
  //       },
  //     },
  //     // @ts-expect-error
  //     signer: window.SingleSource.signer,
  //   }),
  //   version: '0.0.0',
  // };

  // // @ts-expect-error
  // window.injectedWeb3.SingleSource.accounts.subscribe((_accounts) => {
  //   accounts = transformAccounts(_accounts);
  // }); // decorate the compat interface
});

declare namespace Cypress {
  interface Chainable<Subject> {
    /**
     * Open app
     */
    openApp: typeof openApp;
    debugTabHelper: typeof debugTabHelper;
    visit(originalFn, url, options): typeof visit;
    tabVisit(url, tab_name): typeof tabVisit;
    openTab(url, opts): typeof openTab;
    switchToTab(index_or_name): typeof switchToTab;
    closeAllTabs: typeof closeAllTabs;
    closeTab(index_or_name): typeof closeTab;
    /**
     * Check HTML attribute value
     */
    checkAttr(name: string, value: string): Chainable<Subject>;
  }
}

Cypress.on('window:before:load', (window) => {
  const accounts = [];
  // @ts-expect-error
  window.injectedWeb3 = {};

  function transformAccounts(accounts) {
    return accounts.map(({ address, name }) => ({
      address,
      name,
    }));
  }

  // @ts-expect-error
  window.injectedWeb3.SingleSource = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/require-await
    enable: async () => ({
      accounts: {
        // eslint-disable-next-line @typescript-eslint/require-await
        get: async () => accounts,
        subscribe: (cb) => {
          // @ts-expect-error
          const sub = window.SingleSource.accounts.subscribe((accounts) => {
            cb(transformAccounts(accounts));
          });
          return () => {
            sub.unsubscribe();
          };
        },
      },
      // @ts-expect-error
      signer: window.SingleSource.signer,
    }),
    version: '0.0.0',
  };

  // // @ts-expect-error
  // window.injectedWeb3.SingleSource.accounts.subscribe((_accounts) => {
  //   accounts = transformAccounts(_accounts);
  // }); // decorate the compat interface
});

Cypress.Commands.add('openApp', openApp);
Cypress.Commands.add('checkAttr', { prevSubject: true }, checkAttr);
// @ts-ignore
Cypress.Commands.add('debugTabHelper', debugTabHelper);
Cypress.Commands.overwrite('visit', visit);
Cypress.Commands.add('tabVisit', tabVisit);
Cypress.Commands.add('openTab', openTab);
Cypress.Commands.add('switchToTab', switchToTab);
Cypress.Commands.add('closeAllTabs', closeAllTabs);
Cypress.Commands.add('closeTab', closeTab);
