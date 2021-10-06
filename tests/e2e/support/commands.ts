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

Cypress.Commands.add('openApp', openApp);
Cypress.Commands.add('checkAttr', { prevSubject: true }, checkAttr);
