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

const url = 'https://mosttechs.com/wizard-of-oz-slots-free-coins/'; // Replace with the actual URL
const currentDate = getCurrentDate();
const filePath = path.join('links-json', 'wizard-of-oz.json');

async function main() {
  try {
    let existingLinks = [];
    if (await fs.access(filePath).then(() => true).catch(() => false)) {
      const fileData = await fs.readFile(filePath, 'utf8');
      existingLinks = fileData ? JSON.parse(fileData) : [];
    }

    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const newLinks = [];
    $('a[href*="zynga.social"]').each((index, element) => {
      const link = $(element).attr('href');
      const existingLink = existingLinks.find((l) => l.href === link);
      const date = existingLink ? existingLink.date : currentDate;
      newLinks.push({ href: link, date: date });
    });

    const combinedLinks = [...newLinks, ...existingLinks].reduce((acc, link) => {
      if (!acc.find(({ href }) => href === link.href)) {
        acc.push(link);
      }
      return acc;
    }, []);

    await fs.writeFile(filePath, JSON.stringify(combinedLinks, null, 2), 'utf8');
    console.log(`Links updated: ${filePath}`);
  } catch (err) {
    console.error('Error:', err);
  }
}

main();