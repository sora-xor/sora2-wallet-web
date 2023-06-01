// https://docs.cypress.io/api/introduction/api.html

import DesignSystem from '@soramitsu/soramitsu-js-ui/lib/types/DesignSystem';
import Theme from '@soramitsu/soramitsu-js-ui/lib/types/Theme';

describe('App.vue test', () => {
  it('Check theme switch', () => {
    cy.openApp();
    // Each cy.get('html') takes time so it's better to call it every time
    // because of async theme settings
    cy.get('html').checkAttr('design-system', DesignSystem.NEUMORPHIC);
    cy.get('html').checkAttr('design-system-theme', Theme.LIGHT);
    const switchThemeButton = cy.get('.theme-switch');
    switchThemeButton.contains(`${Theme.LIGHT} theme`);
    switchThemeButton.click();
    switchThemeButton.contains(`${Theme.DARK} theme`);
    cy.get('html').checkAttr('design-system-theme', Theme.DARK);
  });
});
