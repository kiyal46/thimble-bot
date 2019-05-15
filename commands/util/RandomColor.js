// WIP

const { Command } = require('discord.js-commando');
const color = require('../../lib/Color');

class RandomColorCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'randomcolor',
      group: 'util',
      memberName: 'randomcolor',
      description: 'Generate a random color.',
      aliases: [ 'color', 'colour', 'colors', 'colours', 'randomcolour' ],
      args: [
        {
          key: 'query',
          type: 'string',
          default: '',
          prompt: 'What color'
        }
      ],
      examples: [
        '`color` - generates a random color and displays its RGB, hex, HSL, and CMYK values',
        '`color #3e3e3e` or `color #2e2` - generates color data based on hex string',
        '`color rgb(201, 29, 11)` or `color 201, 29, 11` - generates color data based on RGB values',
        '`color hsl(5.68°, 89.62%, 41.57%)` or `color 5.68°, 89.62%, 41.57%` - generates color data based on HSL',
        '`color cmyk(0.00%, 85.57%, 94.53%, 21.18%)` or `color 0.00%, 85.57%, 94.53%, 21.18%` - generates color data based on CMYK'
      ]
    });
  }

  generateEmbed(hex, cmyk, hsl, rgb) {
    return {
      embed: {
        title: 'Random Color',
        author: {
          name: this.client.user.tag,
          icon_url: this.client.user.avatarURL
        },
        thumbnail: {
          url: `https://sallai.me/api/color/${hex.slice(1)}.png`
        },
        fields: [
          {
            name: 'HEX (hexadecimal):',
            value: hex
          },
          {
            name: 'RGB (red, green, blue):',
            value: rgb
          },
          {
            name: 'HSL (hue, saturation, lightness):',
            value: hsl
          },
          {
            name: 'CMYK (cyan, magenta, yellow, key):',
            value: cmyk
          }
        ],
        color: parseInt(hex.slice(1), 16).toString(10),
        timestamp: new Date(),
        footer: {
          text: '<3'
        }
      }
    };
  }

  isRGB(query) {
    if (query.startsWith('rgb')) {
      return true;
    }

    if (query.split(',').length !== 3) {
      return false;
    }

    if (query.includes('%') || query.includes('°')) {
      return false;
    }

    return true;
  }

  isHex(query) {
    return query.startsWith('#');
  }

  isHSL(query) {
    if (query.startsWith('hsl')) {
      return true;
    }

    if (query.split(',').length !== 3) {
      return false;
    }

    if (!query.includes('%') || !query.includes('°')) {
      return false;
    }

    return true;
  }

  isCMYK(query) {
    if (query.startsWith('cmyk')) {
      return true;
    }

    if (query.split(',').length !== 4) {
      return false;
    }

    if (!query.includes('%')) {
      return false;
    }

    if (query.includes('°')) {
      return false;
    }

    return true;
  }

  run(message, { query }) {
    let result;

    if (query) {
      if (this.isRGB(query)) {
        result = color().fromRGB(query);
      }

      if (this.isHex(query)) {
        result = color().fromHex(query);
      }

      if (this.isHSL(query)) {
        const splitQuery = query.split(',').map((c, idx) => {
          const divider = idx === 0 ? 360.0 : 100.0;
          return parseFloat(c.match(/\d+/)[0]) / divider;
        });

        result = color().fromHSL(splitQuery);
      }

      if (this.isCMYK(query)) {
        const splitQuery = query.split(',').map(c => {
          return parseFloat(c.match(/\d+/)[0]) / 100.0;
        });

        result = color().fromCMYK(splitQuery);
      }
    } else {
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);

      result = color().fromRGB({ r, g, b });
    }

    const hex = result.hex(true);
    const hsl = result.hsl(true);
    const cmyk = result.cmyk(true);
    const rgb = result.rgb(true);

    return message.say(this.generateEmbed(hex, cmyk, hsl, rgb));
  }
};

module.exports = RandomColorCommand;