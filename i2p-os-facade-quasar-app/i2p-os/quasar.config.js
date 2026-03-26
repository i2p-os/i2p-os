import { configure } from 'quasar/wrappers'

export default configure(() => {
  return {
    supportTS: false,
    boot: [],
    css: ['app.css'],
    extras: [],
    build: {
      target: {
        browser: ['es2019'],
        node: 'node24'
      },
      vueRouterMode: 'hash'
    },
    devServer: {
      open: true
    },
    framework: {
      plugins: []
    }
  }
})
