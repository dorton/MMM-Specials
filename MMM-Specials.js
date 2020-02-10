/* global Module */

/* Magic Mirror
 * Module: MMM-Specials
 *
 * By Brian Dorton
 * MIT Licensed.
 */

Module.register("MMM-Specials", {
  defaults: {
    updateInterval: 1800 * 1000,
    retryDelay: 5000,
    date: null,
    hide_at_hour: 12
  },

  start() {
    Log.log("Starting module: " + this.name);
    this.loaded = false;

    this.setHelperConfig();
    setInterval(() => {
      this.updateDom();
    }, this.config.updateInterval);
  },

  async setHelperConfig() {
    await this.handleDate();
    this.sendSocketNotification("SET_CONFIG", this.config);
  },

  handleDate() {
    return new Promise(resolve => {
      if (
        moment()
          .hour(this.config.hide_at_hour)
          .isBefore(moment(), "hour")
      ) {
        this.config.date = moment().add(1, "day");
      } else {
        this.config.date = moment();
      }
      resolve();
    });
  },

  getData() {
    this.sendSocketNotification("FETCH_DATA");
  },

  scheduleUpdate(delay) {
    let nextLoad = this.data.config.updateInterval;
    if (typeof delay !== "undefined" && delay >= 0) {
      nextLoad = delay;
	}
	// this.hide();
    nextLoad = nextLoad;
    setTimeout(() => {
		this.show()
      this.getData();
    }, nextLoad);
  },

  getHeader() {
    let show_for = moment(this.config.date).format("dddd");

    return `${this.data.header} for ${show_for}`;
  },

  getDom() {
    let wrapper = document.createElement("div");
    let table = document.createElement("table");
    if (this.dataRequest) {
      let showableData = Object.values(this.dataRequest).filter(ent =>
        moment(ent.date)
          .hour(this.config.hide_at_hour)
          .isAfter(moment(), "hour")
      );
      if (!showableData.length || moment().format("dddd") === "Saturday") {
        this.hide();
      }
      if (showableData.length) {
        let date = Object.entries(showableData[0])[0][1];
        let kids = Object.entries(showableData[0]).filter(d => d[0] !== "date");
        kids.forEach(kid => {
          let row = document.createElement("tr");
          let kidCell = document.createElement("td");
          kidCell.className = "kid-cell";
          let specialCell = document.createElement("td");
          let special = "PE";
          let kidSpanWrap = document.createElement("div");
          let specialSpanWrap = document.createElement("div");

          kidSpanWrap.className = "date-wrap";
          specialSpanWrap.className = "meal-wrap";

          let kidWrapper = document.createElement("span");
          kidWrapper.className = "date light";
          let specialWrapper = document.createElement("span");
          specialWrapper.className = "meal light";
          kidWrapper.innerHTML = kid[0];
          specialWrapper.innerHTML = kid[1];

          kidSpanWrap.appendChild(kidWrapper);
          specialSpanWrap.appendChild(specialWrapper);

          kidCell.appendChild(kidSpanWrap);
          specialCell.appendChild(specialSpanWrap);

          row.appendChild(kidCell);
          row.appendChild(specialCell);
          table.appendChild(row);
        });
      }

      wrapper.appendChild(table);
    }

    return wrapper;
  },

  getScripts() {
    return ["moment.js"];
  },

  getStyles() {
    return ["MMM-Specials.css"];
  },

  processData(data) {
    this.dataRequest = data;
    if (this.loaded === false) {
      this.updateDom();
    }
    this.loaded = true;
  },

  socketNotificationReceived(notification, payload) {
    switch (notification) {
      case "CONFIG_SET":
        this.getData();
        break;
      case "NETWORK_ERROR":
		// this.scheduleUpdate(20000);
		this.hide()
        break;

      case "DATA_AVAILABLE":
        if (payload.statusCode == 200) {
          this.processData(JSON.parse(payload.body));
        } else {
          Log.error("Error: ", payload);
        }
        break;
    }
  }
});
