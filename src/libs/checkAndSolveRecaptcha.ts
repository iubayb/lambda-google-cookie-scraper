import { Page } from 'puppeteer';

async function checkAndSolveRecaptcha(page: Page) {
    const isRecaptchaPresent = await page.evaluate(() => {
        return document.querySelector('iframe[src*="google.com/recaptcha/api2/anchor"]') !== null;
    });

    if (isRecaptchaPresent) {
        await page.solveRecaptchas();
    }
}

export default (page: Page) => {
    return new Proxy(page, {
        get(target, prop, receiver) {
            const origMethod = (target as any)[prop];
            if (typeof origMethod === 'function') {
                return async (...args: any[]) => {
                    await checkAndSolveRecaptcha(target); // Check before the action
                    const result = await origMethod.apply(target, args);
                    await checkAndSolveRecaptcha(target); // Check after the action
                    return result;
                };
            }
            return Reflect.get(target, prop, receiver);
        },
    });
}
