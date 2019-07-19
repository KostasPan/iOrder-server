'use strict';
const escpos = require('escpos');
const device = new escpos.USB(1046, 20497);
const printer = new escpos.Printer(device);
device.open(err => {
  if (err) {
    console.log('device error');
  } else {
    console.log('device opened');
  }
});

module.exports = {
  test(products) {
    // await device.open(async err => {
    //   if (err) {
    //     console.log('err= ', err);
    //   } else {
    printer
      .font('a')
      .align('ct')
      .style('bu')
      .size(1, 1)
      .text(JSON.stringify(products))
      .text('papapapapapa')
      .control('lf')
      .control('lf')
      .flush();
    // }, 3000);
    //   }
  }
};

// const device  = new escpos.Network('localhost');
// const device  = new escpos.Serial('/dev/usb/lp0');
