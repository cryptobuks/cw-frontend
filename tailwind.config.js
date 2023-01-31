/*
 ** TailwindCSS Configuration File
 **
 ** Docs: https://tailwindcss.com/docs/configuration
 ** Default: https://github.com/tailwindcss/tailwindcss/blob/master/stubs/defaultConfig.stub.js
 */
module.exports = {
  theme: {
    colors: {
      'beige-light': '#D0D1CD',
      'beige-lighter': '#EFF0EB',
      black: '#262626',
      blue: '#2c57f4',
      brown: '#757763',
      current: 'currentColor',
      'cw-red': '#be0000',
      darkred: 'darkred',
      gray: {
        100: '#f7f7f7',
        150: '#ececec',
        200: '#ededed',
        300: '#e2e2e2',
        400: '#cbcbcb',
        500: '#a0a0a0',
        600: '#717171',
        700: '#4a4a4a',
        750: '#404040',
        800: '#2d2d2d',
        900: '#1a1a1a'
      },
      green: '#77c264',
      orange: 'orange',
      pink: '#FA7C91',
      purple: '#8A4D76',
      red: 'red',

      transparent: 'transparent',

      white: '#fff',

      yellow: {
        100: '#fffff0',
        200: '#fefcbf',
        300: '#faf089',
        400: '#f6e05e',
        500: '#ecc94b',
        600: '#d69e2e',
        700: '#b7791f',
        800: '#975a16',
        900: '#744210'
      }
    },

    fontFamily: {
      sans: ['Poppins', 'sans-serif'],
      'poppins-bold': ['Poppins-Bold', 'sans-serif'],
      'poppins-medium': ['Poppins-Medium', 'sans-serif'],
      'poppins-light': ['Poppins-Light', 'sans-serif']
    },

    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '4rem'
    },

    // Extends
    extend: {
      borderRadius: {
        '3px': '3px',
        '5px': '5px',
        '6px': '6px',
        '10px': '10px',
        '1/2': '50%'
      },

      boxShadow: {
        'cw-card': '0 2px 3px 2px rgba(38, 38, 38, 0.15)'
      },

      cursor: {
        inherit: 'inherit'
      },

      fontSize: {
        '2xs': '0.625rem',
        '3xs': '0.5rem'
      },

      maxWidth: {
        0: '0',
        24: '6rem',
        32: '8rem',
        36: '9rem'
      },

      maxHeight: {
        0: '0', // TODO: Redundant in tailwind v2. Remove after upgrading.
        53: '13.25rem'
      },

      minHeight: {
        10: '2.5rem',
        12: '3rem',
        14: '3.5rem',
        16: '4rem',
        20: '5rem',
        48: '12rem',
        64: '16rem',
        auto: 'auto',
        'profile-body': 'calc(100vh - 10.3rem) !important'
      },

      minWidth: {
        15: '3.75rem',
        64: '16rem'
      },

      opacity: {
        5: '0.05',
        10: '0.10',
        15: '0.15',
        20: '0.20',
        25: '0.25',
        30: '0.30',
        35: '0.35',
        40: '0.40',
        45: '0.45',
        50: '0.50',
        55: '0.55',
        60: '0.60',
        65: '0.65',
        70: '0.70',
        75: '0.75',
        80: '0.80',
        85: '0.85',
        90: '0.90',
        95: '0.95'
      },

      spacing: {
        9: '2.25rem',
        11: '2.75rem',
        13: '3.25rem',
        14: '3.5rem',
        15: '3.75rem',
        18: '4.5rem',
        30: '7.5rem',
        72: '18rem',
        84: '21rem',
        96: '24rem',
        108: '27rem',
        120: '30rem',
        full: '100%'
      },

      height: {
        'profile-body': 'calc(100vh - 10.3rem) !important'
      },

      inset: {
        '1/2': '50%',
        unset: 'unset',
        full: '100%'
      },

      screens: {
        xs: '320px'
      },

      transitionProperty: {
        'max-height': 'max-height'
      },

      width: {
        28: '7rem',
        '7/25': '28%'
      },

      zIndex: {
        1: '1',
        '-1': '-1',
        100: '100'
      }
    }
  },
  variants: {
    backgroundColor: [
      'responsive',
      'hover',
      'focus',
      'active',
      'group-hover',
      'disabled'
    ],
    borderWidth: ['responsive', 'hover', 'focus', 'disabled'],
    cursor: ['responsive', 'hover', 'focus', 'disabled'],
    display: ['responsive', 'hover', 'focus', 'group-hover'],
    opacity: [
      'responsive',
      'hover',
      'focus',
      'active',
      'group-hover',
      'disabled'
    ],
    textColor: [
      'responsive',
      'hover',
      'focus',
      'active',
      'group-hover',
      'disabled'
    ],
    textDecoration: [
      'responsive',
      'hover',
      'focus',
      'active',
      'group-hover',
      'disabled'
    ]
  },
  plugins: [],
  purge: {
    enabled: process.env.NODE_ENV !== 'local',
    content: [
      'components/**/*.vue',
      'layouts/**/*.vue',
      'pages/**/*.vue'
    ],
    options: {
      safelist: []
    }
  }
}
