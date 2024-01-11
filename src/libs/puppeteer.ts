import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';
import chromium from '@sparticuz/chromium-min';
import getSecret from './getSecret';

const launchOptions = async () => {
  return {
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(
      'https://github.com/Sparticuz/chromium/releases/download/v119.0.2/chromium-v119.0.2-pack.tar'
    ),
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
    args: chromium.args.concat([
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--single-process',
      '--disable-dev-shm-usage',
      '--no-zygote',
      '--disable-gpu',
      '--disable-features=NetworkService',
    ])
  };
};

export default async () => {
  try {
    const options = await launchOptions();
    puppeteer.use(StealthPlugin());
    puppeteer.use(
      RecaptchaPlugin({
        provider: {
          id: '2captcha',
          token: process.env.API_KEY_2CAPTCHA || await getSecret('API_KEY_2CAPTCHA'),
        },
        visualFeedback: true
      })
    )
    return await puppeteer.launch(options);
  } catch (error) {
    console.error('Error launching Instance', error);
    throw error;
  }
};
