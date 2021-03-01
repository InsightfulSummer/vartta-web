import { embedRasterImages, save } from 'd3-save-svg'

export default (context, inject) => {
  inject('d3SaveSVG', { embedRasterImages, save })
}
