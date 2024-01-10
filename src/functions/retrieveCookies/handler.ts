import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import schema from './schema';
import puppeteerInstance from '@libs/puppeteer';
import dynamoDb from '@libs/dynamoDb';


const saveCookiesToDynamoDB = (cookies: any, username: string) => {

  // Find the earliest expiration time from the cookies
  let earliestExpiry = Infinity;
  cookies.forEach(cookie => {
    const expiry = parseFloat(cookie.expires);
    if (earliestExpiry === null || expiry < earliestExpiry) {
      earliestExpiry = expiry;
    }
  });
  earliestExpiry = Math.floor(earliestExpiry);

  // Save the cookies to DynamoDB
  const params = {
    TableName: process.env.COOKIES_TABLE as string,
    Item: {
      username,
      cookies,
      expiry: earliestExpiry,
    },
  };
  return dynamoDb.put(params);
};

const retrieveCookies: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  let browser;
  try {
    console.log('Starting puppeteer instance');
    browser = await puppeteerInstance();
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Linux; Android 9; Pixel 3 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Mobile Safari/537.36');

    console.log('Navigating to Google accounts page');
    await page.goto('https://accounts.google.com/');
    await page.waitForSelector('#identifierNext');

    console.log('Typing in credentials');
    await page.type('#identifierId', event.body.email);
    await page.keyboard.press('Enter');
    await page.waitForSelector('[type="password"]', { visible: true });
    await page.type('[type="password"]', event.body.password);
    await page.keyboard.press('Enter');
    await page.waitForNavigation();

    console.log('Retrieving cookies');
    const cookies = await page.cookies();
    
    console.log('Closing browser');
    await browser.close();

    console.log('Saving cookies to DynamoDB');
    await saveCookiesToDynamoDB(cookies, event.body.email);

    return formatJSONResponse({
      message: 'Successfully retrieved cookies',
      cookies,
      event,
    });

  } catch (error) {
    console.error('Error occurred:', error);
    if (browser) {
      console.log('Closing browser due to error');
      await browser.close();
    }
    return formatJSONResponse({ message: 'An error occurred during processing', error }, 500);
  }
};

export const main = middyfy(retrieveCookies);
