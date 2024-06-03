const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// Function to fetch HTML, parse it, and write the result to a file
async function fetchParseAndWriteHTML(url, outputPath) {
  try {
    // Fetch the HTML from the URL
    const { data } = await axios.get(url);

    // Load the HTML into Cheerio
    const $ = cheerio.load(data);
    const modifiedHTML = $.html().split("https://akuma-player.xyz/play/")[1].split(`\\"`)[0];
    console.log(modifiedHTML)
    // Write the modified HTML to a file
    // fs.writeFileSync(outputPath, modifiedHTML, 'utf-8');
    // console.log(`Modified HTML has been written to ${outputPath}`);

  } catch (error) {
    console.error('Error fetching or processing HTML:', error);
  }
}

// Example URL to fetch and parse
const url = `https://www.shibaanime.com/player/embed.php?link='aHR0cHM6Ly9ha3VtYS1wbGF5ZXIueHl6L3BsYXkvZWU4N2VhN2YtZGI1OC01OTZmLWFhMTctYjVjY2RlNDEwNzQ5'`

// Output path for the modified HTML
const outputPath = 'output.html';

// Execute the function
fetchParseAndWriteHTML(url, outputPath);
