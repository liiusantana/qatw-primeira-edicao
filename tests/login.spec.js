import { test, expect } from '@playwright/test';

import { obterCodigo2FA } from '../support/db';

import { LoginPage } from '../pages/LoginPage';

import { DashPage } from '../pages/DashPage';

import { LoginActions } from '../actions/LoginActions';

import { cleanJobs, getJob } from '../support/redis';

test('Não deve logar quando o código de autenticacão é inválido', async ({ page }) => {

    const loginPage = new LoginPage(page)

    const usuario = {
        cpf: '00000014141',
        senha: '147258'
    }
    await loginPage.acessaPagina()
    await loginPage.informaCpf(usuario.cpf)
    await loginPage.informaSenha(usuario.senha)
    await loginPage.informe2FA('123456')

    await expect(page.locator('span')).toContainText('Código inválido. Por favor, tente novamente.');
});

test('Deve acessar a conta do usuário', async ({ page }) => {

    const loginPage = new LoginPage(page)
    const dashPage = new DashPage(page)

    const usuario = {
        cpf: '00000014141',
        senha: '147258'
    }

    await cleanJobs()

    await loginPage.acessaPagina()
    await loginPage.informaCpf(usuario.cpf)
    await loginPage.informaSenha(usuario.senha)

    //Checkpoint
    await page.getByRole('heading', { name: 'Verificação em duas etapas' })
        .waitFor({ timeout: 3000 })

    const codigo = await getJob ()

    //const codigo = await obterCodigo2FA(usuario.cpf)
    await loginPage.informe2FA(codigo)

    await expect(await dashPage.obterSaldo()).toHaveText('R$ 5.000,00')
});

/*test('Deve acessar a conta do usuário #ExemploPageAction', async ({ page }) => {

    const loginActions = new LoginActions(page)

    const usuario = {
        cpf: '00000014141',
        senha: '147258'
    }
    await loginActions.acessaPagina()
    await loginActions.informaCpf(usuario.cpf)
    await loginActions.informaSenha(usuario.senha)

    await page.waitForTimeout(3000)
    const codigo = await obterCodigo2FA()

    await loginActions.informe2FA(codigo)


    await page.waitForTimeout(200)

    expect(await loginActions.obterSaldo()).toHaveText('R$ 5.000,00')

});
*/