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

declare namespace Cypress {
  interface Chainable<Subject> {
    /**
     * Open app
     */
    openApp: typeof openApp;
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
    enable: async (origin) => ({
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
