const Helper = require('../helpers/helpers');
const async = require('async');
// const { USB, Printer } = require('escpos');
// const device = await USB.getDevice();
// const printer = await Printer.create(device);

const escpos = require('escpos');
const device = new escpos.USB(1046, 20497);
// const device = new escpos.Console();
const printer = new escpos.Printer(device);
device.open(err => {
  if (err) {
    console.log('device error');
  } else {
    console.log('device opened');
  }
});

let ordernum = 0;
let printerStack = [];

// check printerstack if it has unprintable orders forever
async.forever(
  function(next) {
    setTimeout(function() {
      if (printerStack.length > 0) {
        const orderObj = printerStack.shift();
        if (orderObj.type === 'order') {
          printOrder(
            orderObj.order,
            orderObj.table,
            orderObj.username,
            orderObj.time
          );
        } else if (orderObj.type === 'comment') {
          printComment(orderObj.comment, orderObj.username, orderObj.time);
        }
      }
      next();
    }, 5000);
  },
  function(err) {
    console.error(err);
  }
);

//
async function printOrder(order, table, username, time) {
  await printer
    .font('b')
    .align('lt')
    .style('normal')
    .size(1, 1)
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
  await printer
    .control('lf')
    .control('lf')
    .control('lf')
    .flush();
}

async function printComment(comment, username, time) {
  await printer
    .font('b')
    .align('lt')
    .style('normal')
    .size(1, 1)
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
    .flush();
}
//

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
    const device = await USB.getDevice();
    const printer = await Printer.create(device);
    await printer
      .font('b')
      .align('ct')
      .style('normal')
      .size(1, 1)
      .text('PRINTER READY')
      .align('lt')
      .control('lf') //line feed
      .control('lf')
      .control('lf')
      .control('lf')
      // .close();
      .flush();
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
      .size(1, 1)
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

  async printOrder(order, table, username, time) {
    // setTimeout(async function() {
    await printer
      .font('b')
      .align('lt')
      .style('normal')
      .size(1, 1)
      .style('b')
      .text('ΠΑΡΑΓΓΕΛΙΑ')
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
    await printer
      .control('lf')
      .control('lf')
      .control('lf')
      .flush();
    //.close();
    // }, 000);
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
            multiple: true
          },
          { type: 'Γάλα', selected: 'φρέσκο', multiple: false }
        ],
        comment: '',
        username: 'admin',
        userId: '5cd0230f463f261344080ccb',
        tableId: '5d240babcfb6971c4c9966e3'
      },
      {
        name: 'Πίτσα Σπέσιαλ',
        price: 12,
        quantity: 1,
        choices: [
          { type: 'Χωρίς', selected: ['πιπεριές', 'κρεμμύδι'], multiple: true }
        ],
        comment: 'oute saltsa ntomatas',
        username: 'admin',
        userId: '5cd0230f463f261344080ccb',
        tableId: '5d240babcfb6971c4c9966e3'
      },
      {
        name: 'Σοκολάτα',
        price: 3.5,
        quantity: 1,
        choices: [
          {
            type: 'Σιρόπι',
            selected: ['φράουλα', 'φουντούκι', 'καραμέλα'],
            multiple: true
          },
          { type: 'Τύπος', selected: 'κρύα', multiple: false },
          { type: 'Επιπλέον', selected: ['πρωτεΐνη'], multiple: true }
        ],
        comment: 'πάρα πολύ πρωτείνη μπρο',
        username: 'admin',
        userId: '5cd0230f463f261344080ccb',
        tableId: '5d240babcfb6971c4c9966e3'
      }
    ];
  }
};
