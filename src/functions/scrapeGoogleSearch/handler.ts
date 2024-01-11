import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import schema from './schema';
import puppeteerInstance from '@libs/puppeteer';
import dynamoDb from '@libs/dynamoDb';
import recaptcha from '@libs/checkAndSolveRecaptcha';

const getCookiesFromDynamoDB = async (username: string) => {
  const params = {
    TableName: process.env.COOKIES_TABLE as string,
    Key: { username },
  };
  const result = await dynamoDb.get(params);
  return result.Item ? result.Item.cookies : null;
};

const saveSearchResultsToDynamoDB = (searchResults: any, id: string) => {
  const params = {
    TableName: process.env.SEARCH_RESULTS_TABLE as string,
    Item: {
      id,
      searchResults,
    },
  };
  return dynamoDb.put(params);
};

const scrapeGoogleSearch: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  let browser;
  try {
    console.log('Starting puppeteer instance');
    browser = await puppeteerInstance();
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Linux; Android 9; Pixel 3 XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Mobile Safari/537.36');

    console.log('Retrieving cookies');
    const cookies = await getCookiesFromDynamoDB(event.body.username);
    if (!cookies) {
      console.warn('No cookies found or cookies expired. Falling back to anonymous search');
    }
    else {
      await page.setCookie(...cookies);
      console.log('Cookies set');
    }

    console.log(`Performing Google search for query: ${event.body.query}`);

    await recaptcha(page).goto(`https://www.google.com/search?q=${encodeURIComponent(event.body.query)}`, { waitUntil: "domcontentloaded" });

    const searchResults = await page.evaluate(() =>
      Array.from(document.querySelectorAll('#main > div > div > div > div.egMi0 > a')).map(e => ({
        title: (e as HTMLElement).innerText,
        link: new URLSearchParams(new URL((e as HTMLAnchorElement).href).search).get('q')
      }))
    );


    console.log('Closing browser');
    await browser.close();

    console.log('Saving search results to DynamoDB');
    const id = `${event.body.username}-${event.body.query}-${Date.now()}`;
    await saveSearchResultsToDynamoDB(searchResults, id);

    return formatJSONResponse({
      message: `Successfully retrieved search results for query: ${event.body.query}`,
      searchResults,
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

export const main = middyfy(scrapeGoogleSearch);
