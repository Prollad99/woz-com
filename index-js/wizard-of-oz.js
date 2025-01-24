const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

// Function to get the current date in YYYY-MM-DD format
function getCurrentDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Function to format the date in "MM-DD-YYYY" format
function formatDateCustom(dateString) {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
}

const url = 'https://mosttechs.com/wizard-of-oz-slots-free-coins/';
const currentDate = getCurrentDate();
const dir = 'links-json';
const filePath = path.join(dir, 'wizard-of-oz.json');
const htmlFilePath = path.join('assets/rewards', 'wizard-of-oz.md');

async function main() {
  try {
    let existingLinks = [];
    // Check if the existing links file exists and read it
    if (await fs.access(filePath).then(() => true).catch(() => false)) {
      try {
        const fileData = await fs.readFile(filePath, 'utf8');
        if (fileData) {
          existingLinks = JSON.parse(fileData);
        }
      } catch (error) {
        console.error('Error reading existing links:', error);
      }
    }

    // Fetch new links from the webpage
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const newLinks = [];

    // Scrape specific links based on the URL patterns
    $('a[href*="zdnwoz0-a.akamaihd.net"], a[href*="zynga.social"]').each((index, element) => {
      const link = $(element).attr('href');
      const existingLink = existingLinks.find(l => l.href === link);
      const date = existingLink ? existingLink.date : currentDate;
      newLinks.push({ href: link, date: date });
    });

    // Combine new and existing links while removing duplicates
    const combinedLinks = [...newLinks, ...existingLinks]
      .reduce((acc, link) => {
        if (!acc.find(({ href }) => href === link.href)) {
          acc.push(link);
        }
        return acc;
      }, [])
      .slice(0, 100); // Limit the links to 100

    console.log('Final links:', combinedLinks);

    // Ensure the directory exists
    if (!await fs.access(dir).then(() => true).catch(() => false)) {
      await fs.mkdir(dir);
    }

    // Write the updated JSON file with the new links
    await fs.writeFile(filePath, JSON.stringify(combinedLinks, null, 2), 'utf8');

    // Generate the HTML content with the Collect button
    let htmlContent = '<ul class="list-group mt-3 mb-4">\n';
    combinedLinks.forEach(link => {
      const formattedDate = formatDateCustom(link.date);
      htmlContent += `  <li class="list-group-item d-flex justify-content-between align-items-center">\n`;
      htmlContent += `    <span>Wizard of Oz Coins ${formattedDate}</span>\n`;
      htmlContent += `    <a href="${link.href}" class="btn btn-primary btn-sm" target="_blank">Collect</a>\n`;
      htmlContent += `  </li>\n`;
    });
    htmlContent += '</ul>';

    // Write the HTML content to the markdown file
    await fs.writeFile(htmlFilePath, htmlContent, 'utf8');
    console.log(`HTML file saved to ${htmlFilePath}`);
  } catch (err) {
    console.error('Error fetching links:', err);
    process.exit(1);
  }
}

main();