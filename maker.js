const fs = require('fs');
const { join, extname, basename, resolve } = require('path');
const { Element, Marpit } = require('@marp-team/marpit');
const { marpCli } = require('@marp-team/marp-cli');
const { parse, Node } = require('node-html-parser');
const cheerio = require('cheerio');

// const MarkdownIt = require('markdown-it');
// const bespoke = require('bespoke');
// const bespokeMdIt = require('bespoke-markdownit');

const slidesPath = 'slides';
const srcPath = 'src';

const templateName = 'index.html.tmpl';

const marpit = new Marpit({
  inlineSVG: false,
  markdown: {
    html: true,
    breaks: true,
  },
  container: [new Element('article', { id: 'p' }), new Element('div', { class: 'slides deck-container' })],
  slideContainer: new Element('section', { class: 'slide' }),
});

const theme = `
/* @theme example */

section {
  background-color: #369;
  color: #fff;
  font-size: 30px;
  padding: 40px;
}

h1,
h2 {
  text-align: center;
  margin: 0;
}

h1 {
  color: #8cf;
}
`;
marpit.themeSet.default = marpit.themeSet.add(theme);

// 3. Render markdown
const markdownSrc = join(slidesPath, 'slide1.md');

// const { html, css } = marpit.render(markdownSrc);

// 4. Use output in your HTML
// const htmlFile = `
// <!DOCTYPE html>
// <html><body>
//   <style>${css}</style>
//   ${html}
// </body></html>
// `;

// fs.writeFileSync('example.html', htmlFile.trim());

const fileName = basename(markdownSrc, '.md');

const outputHTML = `${slidesPath}/${fileName}.html`;
const templateHTML = `${srcPath}/${templateName}`;

const outputFile = join(__dirname, srcPath, `index.html`);

marpCli([markdownSrc])
  .then((exitStatus) => {
    if (exitStatus > 0) {
      throw new Error(`Failure (Exit status: ${exitStatus})`);
    } else {
      const generatedHTML = fs.readFileSync(join(__dirname, outputHTML), { encoding: 'utf-8' }).toString();
      const tempalateHTML = fs.readFileSync(join(__dirname, templateHTML), { encoding: 'utf-8' }).toString();

      const parsedSlidesHTML = parse(generatedHTML);

      const $ = cheerio.load(tempalateHTML);

      const styles = parsedSlidesHTML.querySelectorAll('style');
      const content = parsedSlidesHTML.querySelector('body').innerHTML;

      styles.forEach((style) => {
        if (style.rawTagName === 'style') {
          let styleNode = '<style>' + style.text + '</style>';
          $('head').append(styleNode);
        }
      });

      $('#root-main').append(content);

      fs.writeFileSync(outputFile, $.html({ decodeEntities: false, xmlMode: false }), { encoding: 'utf-8' });
    }
  })
  .catch(console.error);
