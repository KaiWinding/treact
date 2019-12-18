const presets = [
  [
    "@babel/preset-env",
    {
      modules: false
    },
  ],
  [
    "@babel/preset-typescript",
    {
      isTSX: true,
      allExtensions: true
    }
  ]
];

const plugins = [
  [
    "@babel/plugin-transform-react-jsx"
  ]
]

module.exports = { presets, plugins };
