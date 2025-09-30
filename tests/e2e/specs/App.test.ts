// https://docs.cypress.io/api/introduction/api.html

import { Theme } from '@/consts';

describe('App.vue test', () => {
  it('Check theme switch', () => {
    cy.openApp();
    // Each cy.get('html') takes time so it's better to call it every time
    // because of async theme settings
    const themeScope = cy.get('.sora-theme-provider').first();
    themeScope.should('have.attr', 'data-theme', Theme.Light);

    const switchThemeButton = cy.get('.theme-switch');
    switchThemeButton.contains(`${Theme.Light} theme`);
    switchThemeButton.click();
    switchThemeButton.contains(`${Theme.Dark} theme`);

    themeScope.should('have.attr', 'data-theme', Theme.Dark);
  });
});
