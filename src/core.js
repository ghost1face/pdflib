var pdfjsLib = require('pdfjs-dist');

function Core() {}
Core.prototype = {
  /**
   *  @param {string|TypedArray|Object} Url, Uint8Array or object with init options (must provide a data or url parameter)
   */
  open: function(file) {
    var parameters = {};
    if (typeof file === 'string') {
      parameters.url = file;
    } else if (file && 'bytelength' in file) {
      parameters.data = file;
    } else {
      if (typeof file !== 'object')
        throw new Error('Invalid parameter: file');

      parameters = file;
    }

    // use native decoder support
    parameters.nativeImageDecoderSupport = pdfjsLib.NativeImageDecoding.DISPLAY;

    return pdfjsLib.getDocument(parameters);
  }
}

module.exports = new Core();
