var assert = require('assert');
var fs = require('fs');
var PDFReader = require('../index');

function getTestFileBytes() {
  return new Uint8Array(fs.readFileSync('./pdfs/50PAGE.pdf'));
}

describe('PDFReader', function() {
  var pdfReader = new PDFReader(getTestFileBytes());

  describe('#open()', function() {
    it('should open without error', function(done) {
      pdfReader.open().then(function(doc) {
        done();
      }).catch(function(err) {
        done(err);
      });
    });
  });

  describe('#getPageCount', function() {
    it('test file should have 51 pages', function(done) {
      pdfReader.getPageCount().then(function(pageCount) {
        if (pageCount !== 51) {
          done(new Error('Page count is not 51'));
        } else {
          done();
        }
      }).catch(function(err) {
        done(err);
      });
    });
  });

  describe('#getPageImage PNG', function() {
    it('test file should export page 1 as PNG', function(done) {
      pdfReader.getPageImage(1, {
        format: 'png'
      }).then(function(result) {
        if ((result.constructor === Buffer || result.constructor === Uint8Array) && result.length) {
          done();
        } else {
          done(new Error('Expected Uint8Array'));
        }
      }).catch(function(err) {
        done(err);
      });
    });
  });

  describe('#getPageImage JPG', function() {
    it('test file should export page 1 as JPG', function(done) {
      pdfReader.getPageImage(1, {
        format: 'jpg'
      }).then(function(result) {
        if ((result.constructor === Buffer || result.constructor === Uint8Array) && result.length) {
          done();
        } else {
          done(new Error('Expected Uint8Array'));
        }
      }).catch(function(err) {
        done(err);
      });
    });
  });
});
