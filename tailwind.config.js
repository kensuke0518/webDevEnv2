module.exports = {
  mode:'jit',
  content: ["./src/**/*.{ejs,js}"],
  theme: {
    extend: {},
  },
  purge: [
    './htdocs/**/*.html',
    './src/**/*.{js,ejs}',
  ],
  plugins: [],
}
