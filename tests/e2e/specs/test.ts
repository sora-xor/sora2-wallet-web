// https://docs.cypress.io/api/introduction/api.html

import Theme from '@soramitsu/soramitsu-js-ui/lib/types/Theme';
import DesignSystem from '@soramitsu/soramitsu-js-ui/lib/types/DesignSystem';

describe('App.vue test', () => {
  it('Check theme switch', () => {
    cy.visit('/');
    // Each cy.get('html') takes time so it's better to call it every time
    cy.get('html').invoke('attr', 'design-system').should('eq', DesignSystem.NEUMORPHIC);
    cy.get('html').invoke('attr', 'design-system-theme').should('eq', Theme.LIGHT);
    const switchThemeButton = cy.get('.theme-switch');
    switchThemeButton.contains('light theme');
    switchThemeButton.click();
    switchThemeButton.contains('dark theme');
    cy.get('html').invoke('attr', 'design-system-theme').should('eq', Theme.DARK);
  });
});
