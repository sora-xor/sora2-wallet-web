// https://docs.cypress.io/api/introduction/api.html
//
// import Theme from '@soramitsu/soramitsu-js-ui/lib/types/Theme';
// import DesignSystem from '@soramitsu/soramitsu-js-ui/lib/types/DesignSystem';
// import cypress from 'cypress';

describe('App.vue test', () => {
  it('Check theme switch', () => {
    Cypress.config().baseUrl = '';
    cy.visit('https://exchange.dev.sora2.tachi.soramitsu.co.jp/');
    // cy.window().should('have.a.property', 'injectedWeb3');
    const connectAccount = cy.get(':nth-child(4) > .s-tertiary');
    connectAccount.click();
    cy.openTab('chrome-extension://nehkdgnjfikoojkpgeheohjnbadbcgfb/index.html#/', { tab_name: 'tab_name' });
    cy.wait(3000);
    cy.log('Уже открылся попап');
    // cy.reload()
    cy.switchToTab('tab_name');
    cy.wait(10000);
    cy.reload();
    cy.log('произошел релоад');
    // @ts-ignore
    // const a = cy.get('[class="el-button el-tooltip s-typography-button--large el-button--primary el-button--medium neumorphic s-medium s-border-radius-small s-primary"]')
    // a.type('keydown', {keyCode: 116, which: 116})
    // cy.switchToTab('tab_name')
    // @ts-ignore
    // cy.closeTab('tab_name')
    // const account = cy.get('.wallet-connection-account > .el-card')
    // account.click()
    // cy.visit('https://exchange.dev.sora2.tachi.soramitsu.co.jp/#/swap')
    // cy.wait(1000)
    // let selectToken = cy.get(':nth-child(4) > .s-input__content > .s-flex > .el-button')
    // selectToken.click()
    // cy.wait(1000)
    // let token = cy.get('.token-list > :nth-child(1)')
    // token.click()
    //
    // const inputToken = cy.get(':nth-child(2) > .s-input__content > .s-input__input > .el-input > .el-input__inner')
    // inputToken.type('1')
    //
    // const switchButton = cy.get('.action-button')
    // switchButton.click()
    //
    // const successButton = cy.get('.dialog--confirm-swap > .el-dialog > .el-dialog__footer > .el-button')
    // successButton.click()
    // cy.visit('')

    // cy.window()
    // cy.visit('chrome-extension://nehkdgnjfikoojkpgeheohjnbadbcgfb/index.html#')
    // cy.window().then(window => window.open('https://github.com/'))
    //
    // cy.window().then(window => cy.log(window.location.href))

    // cy.visit('chrome-extension://nehkdgnjfikoojkpgeheohjnbadbcgfb/index.html#')
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
