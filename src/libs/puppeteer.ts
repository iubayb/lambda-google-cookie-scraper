import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import chromium from '@sparticuz/chromium-min';

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
    return await puppeteer.launch(options);
  } catch (error) {
    console.error('Error launching Instance', error);
    throw error;
  }
};
