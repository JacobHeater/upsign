const chroma = require('chroma-js');

const baseColor = '#006744';

const shades = {};

const baseHsl = chroma(baseColor).hsl();

const baseL = baseHsl[2];

const baseS = baseHsl[1];

const baseH = baseHsl[0];

const lightness = {
  50: 0.97,
  100: 0.94,
  200: 0.86,
  300: 0.76,
  400: 0.64,
  500: baseL,
  600: 0.4,
  700: 0.3,
  800: 0.2,
  900: 0.12,
};

for (const shade in lightness) {
  const targetL = lightness[shade];
  let s = baseS;
  if (targetL > baseL) {
    s = baseS + ((1 - baseS) * (targetL - baseL)) / (1 - baseL);
  } else if (targetL < baseL) {
    s = baseS + ((1 - baseS) * (baseL - targetL)) / baseL;
  }
  s = Math.min(1, s);
  const color = chroma.hsl(baseH, s, targetL);
  shades[shade] = color.hex();
}

console.log(JSON.stringify(shades, null, 2));
