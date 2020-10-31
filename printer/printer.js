const Helper = require('../helpers/helpers');
const async = require('async');
const escpos = require('escpos');
escpos.USB = require('escpos-usb');
// const device = new escpos.Console();

let lastPrintClosed = true;
let ordernum = 0;
let printerStack = [];

// check printerstack if it has unprintable orders forever
async.forever(
  function (next) {
    setTimeout(function () {
      if (printerStack.length > 0 && lastPrintClosed) {
        const orderObj = printerStack.shift();
        if (orderObj.type === 'order') {
          printing(
            '0', // printer ip h' printer object {name: 'kouzina', ip: '192.168.14.1'}
            orderObj.order,
            orderObj.table,
            orderObj.username,
            orderObj.time
          )
            // .then(
            //   (res) => console.log('printing: ', res),
            //   (err) => {
            //     printerStack.unshift(orderObj);
            //     console.log('printing error: ', err);
            //   }
            // )
            .catch((err) => {
              printerStack.unshift(orderObj);
              // console.log('Printing Order error: ', err.message);
            });
        } else if (orderObj.type === 'comment') {
          printComment(
            '0',
            orderObj.comment,
            orderObj.username,
            orderObj.time
          ).catch((err) => {
            printerStack.unshift(orderObj);
            // console.log('Printing Comment error: ', err.message);
          });
        }
      }
      next();
    }, 1500);
  },
  function (err) {
    console.error(err);
  }
);

function printing(printer, order, table, username, time) {
  console.log('printing - escpos.USB:', printer);

  return new Promise((resolve, reject) => {
    // estw oti exw pollous network printers tote:
    // const debugDevice = new escpos.network(printer.ip);
    // opou printer.ip ~= '192.168.1.45'
    const debugDevice = new escpos.USB();
    debugDevice.open((err) => {
      if (err) return reject(err);
      return resolve(debugDevice);
    });
  }).then((device) => {
    lastPrintClosed = false; // printer.lastPrintClosed = false
    const debugPrinter = new escpos.Printer(device);
    debugPrinter
      .font('b')
      .align('lt')
      .style('normal')
      .size(0, 0)
      .style('b')
      .text(`Printer: ${printer}`)
      .text('ΠΑΡΑΓΓΕΛΙΑ #' + ++ordernum)
      .style('normal')
      .text(time)
      .text(Helper.normalizeGreek(username).toUpperCase())
      .style('b')
      .text(Helper.normalizeGreek(table).toUpperCase())
      .style('normal')
      .control('lf');
    for (const o of order) {
      debugPrinter
        .style('b')
        .text(
          o.quantity +
            ' ' +
            Helper.normalizeGreek(
              o.name.toUpperCase()
              // + ' €' + o.price
            )
        )
        .style('normal');
      for (const c of o.choices) {
        debugPrinter.text(
          Helper.normalizeGreek(c.type + ': ' + c.selected).toUpperCase()
        );
      }
      o.comment
        ? debugPrinter
            .text('ΣΧΟΛΙΟ: ' + Helper.normalizeGreek(o.comment).toUpperCase())
            .control('lf')
        : debugPrinter.control('lf');
    }
    debugPrinter
      .control('lf')
      .control('lf')
      .control('lf')
      //.cut() //.flush()
      .close((error) => {
        lastPrintClosed = true; // printer.lastPrintClosed = true
        console.log(`lastprintclosed = ${lastPrintClosed}`);
      });
  });
}

//old function, before printing function (printing func has open-close)
async function printOrder(order, table, username, time) {
  await printer
    .font('b')
    .align('lt')
    .style('normal')
    .size(0, 0)
    .style('b')
    .text('ΠΑΡΑΓΓΕΛΙΑ #' + ++ordernum)
    .style('normal')
    .text(time)
    .text(Helper.normalizeGreek(username).toUpperCase())
    .style('b')
    .text(Helper.normalizeGreek(table).toUpperCase())
    .style('normal')
    .control('lf');
  for (const o of order) {
    await printer
      .style('b')
      .text(
        o.quantity +
          ' ' +
          Helper.normalizeGreek(
            o.name.toUpperCase()
            // + ' €' + o.price
          )
      )
      .style('normal');
    for (const c of o.choices) {
      await printer.text(
        Helper.normalizeGreek(c.type + ': ' + c.selected).toUpperCase()
      );
    }
    o.comment
      ? await printer
          .text('ΣΧΟΛΙΟ: ' + Helper.normalizeGreek(o.comment).toUpperCase())
          .control('lf')
      : await printer.control('lf');
  }
  await printer.control('lf').control('lf').control('lf').flush();
}

function printComment(printer, comment, username, time) {
  return new Promise((resolve, reject) => {
    // estw oti exw pollous network printers tote:
    // const debugDevice = new escpos.network(printer.ip);
    // opou printer.ip ~= '192.168.1.45'
    const debugDevice = new escpos.USB();
    debugDevice.open((err) => {
      if (err) return reject(err);
      return resolve(debugDevice);
    });
  }).then((device) => {
    lastPrintClosed = false; // printer.lastPrintClosed = false
    const debugPrinter = new escpos.Printer(device);
    debugPrinter
      .font('b')
      .align('lt')
      .style('normal')
      .size(0, 0)
      .style('b')
      .text('ΣΧΟΛΙΟ')
      .style('normal')
      .text(time)
      .text(Helper.normalizeGreek(username).toUpperCase())
      .style('normal')
      .control('lf')
      .text(Helper.normalizeGreek('#' + comment).toUpperCase())
      .control('lf')
      .control('lf')
      .control('lf')
      // .cut(); // .flush
      .close((error) => {
        lastPrintClosed = true;
        // console.log(`lastprintclosed = ${lastPrintClosed}`);
      });
  });
}

module.exports = {
  getPrinterStack() {
    return printerStack;
  },

  pushElementPrinterStack(element) {
    printerStack.push(element);
  },

  hasElementsPrinterStack() {
    return printerStack.length > 0;
  },

  async initPrinter() {
    const device = new escpos.USB();
    const printer = new escpos.Printer(device);
    await device.open(async function (error) {
      await printer
        //.font('b')
        //.align('ct')
        .style('normal')
        .size(0, 0)
        .text('PRINTER READY')
        .text('QR code example')
        .align('lt')
        .control('lf') //line feed
        .control('lf')
        .control('lf')
        // .flush()
        // .cut()
        .close();
    });
  },

  async printTest() {
    const device = await USB.getDevice();
    const printer = await Printer.create(device);
    await printer
      .font('b')
      .align('lt')
      .style('normal')
      .size(1, 1)
      .text('ΠΑΡΑΓΓΕΛΙΑ #156')
      .size(2, 1)
      .style('b')
      .text('ΠΛΑΤ3')
      .style('normal')
      .size(0, 0)
      .text('---------------')
      .control('lf') //line feed
      .text('2 ΠΑΓΩΤΟ ΦΡ')
      .align('rt')
      .text('4.5')
      .align('lt')
      .control('lf') //line feed
      .text('1 ΦΕΜ')
      .align('rt')
      .text('3')
      .align('lt')
      .control('lf') //line feed
      .text('2 ΦΡΑΠΠΕ ΓΛ ΓΑΛΑ')
      .align('rt')
      .text('6')
      .align('lt')
      .control('lf') //line feed
      .text('---------------')
      .align('rt')
      .style('b')
      .text('13.5')
      .text('asdsadasddsaasd')
      .text('asdsadasd')
      .text('asdsadsa')
      .text('sadssdadsa')
      .text('13.5')
      .control('lf') //line feed
      .control('lf')
      .control('lf')
      .control('lf')
      // .close();
      .flush();
  },

  returnTestOrder() {
    return [
      {
        name: 'Φραπέ',
        price: 3.5,
        quantity: 1,
        choices: [
          { type: 'Ζάχαρη', selected: 'προς μέτριο', multiple: false },
          {
            type: 'Τύπος ζάχαρης',
            selected: ['μαύρη', 'ζαχαρίνη'],
            multiple: true,
          },
          { type: 'Γάλα', selected: 'φρέσκο', multiple: false },
        ],
        comment: '',
        username: 'admin',
        userId: '5cd0230f463f261344080ccb',
        tableId: '5d240babcfb6971c4c9966e3',
      },
      {
        name: 'Πίτσα Σπέσιαλ',
        price: 12,
        quantity: 1,
        choices: [
          { type: 'Χωρίς', selected: ['πιπεριές', 'κρεμμύδι'], multiple: true },
        ],
        comment: 'oute saltsa ntomatas',
        username: 'admin',
        userId: '5cd0230f463f261344080ccb',
        tableId: '5d240babcfb6971c4c9966e3',
      },
      {
        name: 'Σοκολάτα',
        price: 3.5,
        quantity: 1,
        choices: [
          {
            type: 'Σιρόπι',
            selected: ['φράουλα', 'φουντούκι', 'καραμέλα'],
            multiple: true,
          },
          { type: 'Τύπος', selected: 'κρύα', multiple: false },
          { type: 'Επιπλέον', selected: ['πρωτεΐνη'], multiple: true },
        ],
        comment: 'πάρα πολύ πρωτείνη μπρο',
        username: 'admin',
        userId: '5cd0230f463f261344080ccb',
        tableId: '5d240babcfb6971c4c9966e3',
      },
    ];
  },
};
