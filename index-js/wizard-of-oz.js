const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Define the URL to scrape
const url = 'https://mosttechs.com/wizard-of-oz-slots-free-coins/';

// Function to format the date in "MM-DD-YYYY" format
function getCurrentDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}-${year}`;
}

axios.get(url)
  .then(({ data }) => {
    const $ = cheerio.load(data);
    const links = [];
    const currentDate = getCurrentDate();

    // Extract links
    $('a[href*="zdnwoz0-a.akamaihd.net"], a[href*="zynga.social"]').each((index, element) => {
      const link = $(element).attr('href');
      const text = $(element).text().trim();
      links.push({ href: link, text: `Wizard of Oz Coins ${currentDate}` });
    });

    console.log('Fetched links:', links);

    // Save links as JSON
    const dir = 'links-json';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    const jsonFilePath = path.join(dir, 'wizard-of-oz.json');
    fs.writeFileSync(jsonFilePath, JSON.stringify(links, null, 2), 'utf8');
    console.log(`Links saved to ${jsonFilePath}`);

    // Generate HTML content with the Collect button
    const rewardsDir = 'assets/rewards';
    if (!fs.existsSync(rewardsDir)) {
      fs.mkdirSync(rewardsDir, { recursive: true });
    }

    const htmlFilePath = path.join(rewardsDir, 'wizard-of-oz.md');
    let htmlContent = '<div class="rewards">\n';
    links.forEach(link => {
      htmlContent += `  <p>${link.text}</p>\n`;
      htmlContent += `  <a href="${link.href}" class="btn btn-primary btn-sm">Collect</a>\n`;
    });
    htmlContent += '</div>';

    fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
    console.log(`HTML file with Collect button saved to ${htmlFilePath}`);
  })
  .catch(err => {
    console.error('Error fetching links:', err);
    process.exit(1);
  });