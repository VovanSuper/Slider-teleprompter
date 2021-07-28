const { Marp } = require('@marp-team/marp-core');
const { Element } = require('@marp-team/marpit');

const opts = {};

module.exports = {
  engine: (baseOpts) =>
    new Marp({
      ...baseOpts,
      script: { source: 'inline' },
      inlineSVG: true,
      markdown: {
        html: true,
        breaks: true,
      },
      container: [new Element('article', { id: 'p', class: 'slides deck-container' })],
      // slideContainer: new Element('section', { class: 'slide' }),
    }).use(require('markdown-it-imsize')),
};
