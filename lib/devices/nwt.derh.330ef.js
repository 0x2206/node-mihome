const Device = require('../device-miio');

module.exports = class extends Device {

  static model = 'nwt.derh.330ef';
  static name = 'NWT Internet Dehumidifier 30L';
  static image = 'http://static.home.mi.com/app/image/get/file/developer_1566907639xeqcwivl.png';

  constructor(opts) {
    super(opts);

    this._miotSpecType = 'urn:miot-spec-v2:device:dehumidifier:0000A02D:nwt-330ef:1';
    this._propertiesToMonitor = [
      'dehumidifier:on',
      'dehumidifier:mode',
      'dehumidifier:target-humidity',
      'dehumidifier:fan-level',
      'environment:humidity',
      'environment:temperature',
      'alarm:alarm',
      'indicator-light:on',
      'physical-controls-locked:physical-controls-locked',
      'event-service:water-tank-status'];
  }

  setPower(v) {
    return this.miotSetProperty('dehumidifier:on', v);
  }

  setMode(v) {
    return this.miotSetProperty('dehumidifier:mode', v);
  }

  setTargetHumidity(v) {
    return this.miotSetProperty('dehumidifier:target-humidity', v);
  }

  setFanLevel(v) {
    return this.miotSetProperty('dehumidifier:fan-level', v);
  }

};