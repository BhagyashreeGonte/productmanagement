console.log(1);
const Test = require('./api/test');
exports.plugin = {
  name: 'api',
  register: (server) => {
    server.route(Array.prototype.concat(
      Test.routes
    ));
  }
};
// console.log(3);
// console.log(1);
//  const Test = require('./api/test');
//
// exports.register = (plugin, options, next) => {
//   plugin.route(Array.prototype.concat(
//     Test.routes
//   ));
//   next();
// };
// console.log(3);
// exports.register.attributes={
//   name:'controller'
// };
// console.log(4);
