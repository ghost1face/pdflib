var fs = require('fs');
var core = require('./core');
var svg2img = require('svg2img');
var ImageFormats = require('./image-formats');
var mkdirp = require('mkdirp');
var getDirName = require('path').dirname;
var pdfjsLib = require('pdfjs-dist');

var DEBUG = process.env.NODE_ENV !== 'production';

require('./domstubs.js').setStubs(global);

function PDFReader(file) {
  this._file = file;
}

PDFReader.prototype = {
  open: function() {
    var self = this;

    if (!this._document)
      return core.open(this._file).then(function(doc) {
        self._document = doc;

        return self;
      });

    return Promise.resolve(this);
  },

  getPageCount: function() {
    return this.open().then(function(doc) {
      return doc.numPages;
    }.bind(this, this._document));
  },

  getPageImage: function(pageNumber, options) {
    options = options || {
      scale: 1.0,
      format: ImageFormats.JPEG,
      quality: 75
    };

    var imageFormat = options.format;

    if (imageFormat !== ImageFormats.JPEG &&
      imageFormat !== ImageFormats.PNG &&
      imageFormat !== ImageFormats.SVG) {
      throw new Error('Invalid image format');
    }

    return this.open().then(function(doc) {
      return doc.getPage(pageNumber).then(function(page) {
        DEBUG && console.log('Processing page number: ' + pageNumber);
        var viewport = page.getViewport(options.scale || 1.0);
        DEBUG && console.log('Size: ' + viewport.width + 'x' + viewport.height) && console.log();

        return page.getOperatorList().then(function(opList) {
          var svgGfx = new pdfjsLib.SVGGraphics(page.commonObjs, page.objs);
          svgGfx.embedFonts = true;
          return svgGfx.getSVG(opList, viewport).then(function(svg) {
            var svgDump = svg.toString();
            if (imageFormat === ImageFormats.SVG) return Promise.resolve(svgDump);

            return new Promise(function(resolve, reject) {
              svg2img(svgDump, options, function(error, content) {
                DEBUG && console.error(error);
                if (error) throw new Error(error);
                return resolve(content);
              });
            });

          });
        });
      });
    }.bind(this, this._document));
  },

  savePageImage: function(pageNumber, options, fileName) {
    options = options || {
      fileName: fileName
    };

    if (!options.fileName) options.fileName;

    if (!options.fileName)
      throw new Error('Invalid fileName supplied');

    return this.getPageImage(pageNumber, options).then(function(imageData) {
      return new Promise(function(resolve, reject) {
        mkdirp(getDirName(options.fileName), function(err) {
          if (err)
            reject(err);

          fs.writeFile(options.fileName, imageData, function(err) {
            if (err) reject(err);
            resolve();
          });
        });
      });
    });
  },
}

module.exports = PDFReader;
