// https://docs.cypress.io/api/introduction/api.html

import Theme from '@soramitsu/soramitsu-js-ui/lib/types/Theme';
import DesignSystem from '@soramitsu/soramitsu-js-ui/lib/types/DesignSystem';

describe('App.vue test', () => {
  it('Check theme switch', () => {
    cy.openApp();
    cy.window().should('have.a.property', 'injectedWeb3');
    // cy.reload();
    // Each cy.get('html') takes time so it's better to call it every time
    // because of async theme settings
    // cy.get('html').checkAttr('design-system', DesignSystem.NEUMORPHIC);
    // cy.get('html').checkAttr('design-system-theme', Theme.LIGHT);
    // const switchThemeButton = cy.get('.theme-switch');
    // switchThemeButton.contains(`${Theme.LIGHT} theme`);
    // switchThemeButton.click();
    // switchThemeButton.contains(`${Theme.DARK} theme`);
    // cy.get('html').checkAttr('design-system-theme', Theme.DARK);
  });
});
