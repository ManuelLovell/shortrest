import path from 'path'

export default {
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        pausescreen: path.resolve(__dirname, 'pausescreen.html'),
        whatsnew: path.resolve(__dirname, 'bswhatsnew.html')
      }
    }
  }
}