const path = require('path'); 
const nodeExternals = require('webpack-node-externals'); 
module.exports = { 
entry: './src/index.js', 
target: 'node', // Indica que corre en el entorno de Node.js 
output: { 
filename: 'bundle.test.js', 
path: path.resolve(__dirname, 'dist'), 
}, 
mode: 'development', 
// ESTA ES LA CLAVE: Evita que Webpack rompa los binarios de Selenium 
externalsPresets: { node: true }, 
externals: [nodeExternals()], 
module: { 
rules: [ 
{ 
test: /\.js$/, 
exclude: /node_modules/, 
use: { 
loader: 'babel-loader', 
options: { 
presets: ['@babel/preset-env'], 
}, 
}, 
}, 
], 
},
};