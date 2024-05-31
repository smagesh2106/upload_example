const NodeCache = require("node-cache");
const blacklist = new NodeCache({ stdTTL: 7200, checkperiod: 120 });

module.exports = {
  blacklist,
};
