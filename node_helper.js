/* Magic Mirror
 * Node Helper: MMM-Specials
 *
 * By Brian Dorton
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var request = require("request");
var moment = require("moment");
var _ = require("lodash");

module.exports = NodeHelper.create({
  socketNotificationReceived: function(notification, payload) {
    switch (notification) {
      case "SET_CONFIG":
        this.config = payload;
        this.sendSocketNotification("CONFIG_SET");
        break;

      case "FETCH_DATA":
          this.fetchData();
        break;
    }
  },

  fetchData: function() {
    url = `http://localhost:4567/`;

    request(
      {
        url: url,
        method: "GET"
      },
      (error, response, body) => {
        if (error) {
          this.sendSocketNotification("NETWORK_ERROR", error);
        } else {
          this.sendSocketNotification("DATA_AVAILABLE", response);
        }
      }
    );
  }
});
