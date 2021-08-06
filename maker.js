#!/usr/bin/env node

const { copySync, existsSync, readFileSync, writeFileSync } = require('fs-extra');
const { join, extname, basename, resolve } = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv;

const { Element, Marpit } = require('@marp-team/marpit');
const { marpCli } = require('@marp-team/marp-cli');
const { parse } = require('node-html-parser');
const cheerio = require('cheerio');

const slidesPath = 'slides';
const assetsSrcPath = `${slidesPath}/assets/`;

const srcPath = 'src';
const assetsDestPath = join(__dirname, `${srcPath}`, 'assets/');

const templateName = 'index.html.tmpl';

// const marpit = new Marpit({
//   inlineSVG: false,
//   markdown: {
//     html: true,
//     breaks: true,
//   },
//   container: [new Element('article', { id: 'p' }), new Element('div', { class: 'slides deck-container' })],
//   slideContainer: new Element('section', { class: 'slide' }),
// });

// const theme = `
// /* @theme example */

// section {
//   background-color: #369;
//   color: #fff;
//   font-size: 30px;
//   padding: 40px;
// }

// h1,
// h2 {
//   text-align: center;
//   margin: 0;
// }

// h1 {
//   color: #8cf;
// }
// `;
// marpit.themeSet.default = marpit.themeSet.add(theme);

const markdownSrc = argv.slide || join(slidesPath, 'Teleprompter.md');

// const { html, css } = marpit.render(markdownSrc);

// 4. Use output in your HTML
// const htmlFile = `
// <!DOCTYPE html>
// <html><body>
//   <style>${css}</style>
//   ${html}
// </body></html>
// `;

// writeFileSync('example.html', htmlFile.trim());

const fileName = basename(markdownSrc, '.md');
const outputHTML = `${slidesPath}/${fileName}.html`;
const templateHTMLPath = `${srcPath}/${templateName}`;
const outputFile = join(__dirname, srcPath, `index.html`);

marpCli([markdownSrc])
  .then((exitStatus) => {
    if (exitStatus > 0) {
      throw new Error(`Failure (Exit status: ${exitStatus})`);
    } else {
      const generatedHTML = readFileSync(join(__dirname, outputHTML), { encoding: 'utf-8' }).toString();
      const templateHTML = readFileSync(join(__dirname, templateHTMLPath), { encoding: 'utf-8' }).toString();
      const parsedSlidesHTML = parse(generatedHTML);

      const $ = cheerio.load(templateHTML);
      const styles = parsedSlidesHTML.querySelectorAll('style');
      const content = parsedSlidesHTML.querySelector('body').innerHTML;

      styles.forEach((style) => {
        if (style.rawTagName === 'style') {
          let styleNode = '<style>' + style.text + '</style>';
          $('head').prepend(styleNode);
        }
      });
      $('#root-main').append(content);

      writeFileSync(outputFile, $.html({ decodeEntities: false, xmlMode: false }), { encoding: 'utf-8' });
      if (existsSync(assetsSrcPath)) {
        copySync(assetsSrcPath, assetsDestPath);
      }
    }
  })
  .catch(console.error);
