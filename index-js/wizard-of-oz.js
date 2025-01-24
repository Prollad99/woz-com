const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Function to get the current date in MM-DD-YYYY format
function formatDateCustom(dateString) {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
}

// URL to scrape
const url = 'https://mosttechs.com/wizard-of-oz-slots-free-coins/';

axios.get(url)
  .then(({ data }) => {
    const $ = cheerio.load(data);
    const links = [];

    // Scrape all relevant links
    $('a[href*="zdnwoz0-a.akamaihd.net"], a[href*="zynga.social"]').each((index, element) => {
      const link = $(element).attr('href');
      const text = $(element).text().trim();
      links.push({ href: link, text: text });
    });

    console.log('Fetched links:', links);

    // Create the directory for the JSON file if it doesn't exist
    const dir = 'links-json';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    // File path to save the links
    const filePath = path.join(dir, 'wizard-of-oz.json');
    fs.writeFileSync(filePath, JSON.stringify(links, null, 2), 'utf8');
    console.log(`Links saved to ${filePath}`);

    // Generate HTML for the reward page with the "Collect" button
    let htmlContent = '<ul class="list-group mt-3 mb-4">\n';
    links.forEach(link => {
      const currentDate = formatDateCustom(new Date()); // Get today's date in MM-DD-YYYY format
      htmlContent += `  <li class="list-group-item d-flex justify-content-between align-items-center">\n`;
      htmlContent += `    <span>Wizard of Oz Coins ${currentDate}</span>\n`; // Custom text with formatted date
      htmlContent += `    <a href="${link.href}" class="btn btn-primary btn-sm">Collect</a>\n`;
      htmlContent += `  </li>\n`;
    });
    htmlContent += '</ul>';

    // Write HTML to a file
    const htmlFilePath = path.join('static', 'rewards', 'wizard-of-oz.md');
    if (!fs.existsSync(path.dirname(htmlFilePath))) {
      fs.mkdirSync(path.dirname(htmlFilePath), { recursive: true });
    }

    fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
    console.log(`HTML file saved to ${htmlFilePath}`);
  })
  .catch(err => {
    console.error('Error fetching links:', err);
    process.exit(1);
  });