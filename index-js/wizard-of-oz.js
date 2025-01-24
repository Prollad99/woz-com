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

// Define the target URL and paths
const url = 'https://mosttechs.com/wizard-of-oz-slots-free-coins/'; // Replace with the actual URL
const currentDate = getCurrentDate();
const filePath = path.join('links-json', 'wizard-of-oz.json');

// Main function to scrape links and update JSON
async function main() {
  try {
    let existingLinks = [];
    
    // Read existing links if the file exists
    if (await fs.access(filePath).then(() => true).catch(() => false)) {
      const fileData = await fs.readFile(filePath, 'utf8');
      existingLinks = fileData ? JSON.parse(fileData) : [];
    }

    // Fetch the HTML content from the URL
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Extract links and add/update their dates
    const newLinks = [];
    $('a[href*="zynga.social"]').each((index, element) => {
      const link = $(element).attr('href');
      const existingLink = existingLinks.find((l) => l.href === link);
      const date = existingLink ? existingLink.date : currentDate; // Use existing date or current date
      newLinks.push({ href: link, date: date });
    });

    // Combine new and existing links, keeping unique entries
    const combinedLinks = [...newLinks, ...existingLinks].reduce((acc, link) => {
      if (!acc.find(({ href }) => href === link.href)) {
        acc.push(link);
      }
      return acc;
    }, []);

    // Write the updated links to the JSON file
    await fs.writeFile(filePath, JSON.stringify(combinedLinks, null, 2), 'utf8');
    console.log(`Links updated and saved to: ${filePath}`);
  } catch (err) {
    console.error('Error:', err);
  }
}

main();