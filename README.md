# Cookie Management and Google Search Scraper

This README provides an overview and setup instructions for two AWS Lambda functions: `retrieveCookies` and `scrapeGoogleSearch`. These functions are part of a serverless application designed for managing cookies and scraping Google search results, respectively.

## Overview

- **retrieveCookies**: Handles the process of logging into a Google account using Puppeteer, retrieving cookies, and storing them in DynamoDB for later use.
- **scrapeGoogleSearch**: Uses stored cookies to perform a Google search with Puppeteer and stores the search results in DynamoDB.

### Libs

- `api-gateway`: Custom library for API Gateway event handling.
- `checkAndSolveRecaptcha`: Utility for handling reCAPTCHA during web scraping, requires `API_KEY_2CAPTCHA`. Obtain the API key from [2Captcha](https://2captcha.com/), and store it securely in AWS Secrets Manager.
- `dynamoDb`: DynamoDB integration utilities.
- `getSecret` : Function that gets the secret value from AWS Secrets Manager given the key.
- `lambda`: Middleware for AWS Lambda functions.
- `puppeteer`: Custom Puppeteer instance setup for headless browser operations.

## Setting Up

1. **Install Node.js**: Ensure you have Node.js installed.
2. **Clone the Repository**: Clone this repository to your local environment.
3. **Install Dependencies**: Run `npm install` to install required dependencies.

## Usage

### retrieveCookies

- **Purpose**: Logs into a Google account and retrieves cookies.
- **Input**: Requires `email` and `password` for the Google account in the event body.
- **Output**: Returns the retrieved cookies and stores them in DynamoDB.

### scrapeGoogleSearch

- **Purpose**: Performs a Google search using previously stored cookies.
- **Input**: Requires `username` (used to retrieve cookies) and `query` (search query) in the event body.
- **Output**: Returns search results and stores them in DynamoDB.

## Deployment

Deploy these functions to AWS Lambda and expose them via API Gateway. Ensure that the user has the necessary permissions to access DynamoDB, AmazonAPIGateway, AWSCloudFormation, AWSLambda, CloudWatchLogs, IAM, and SecretsManager.
