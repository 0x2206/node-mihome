import Device from "../device-aqara";
import utils from "../utils";

export default class extends Device {
  static model = "lumi.sensor_magnet.v2";
  static name = "Mi Door & window sensor";
  static image = "http://static.home.mi.com/app/image/get/file/developer_1551946067z8jchf67.png";

  _onData(data) {
    if (data.no_close) {
      data.status = "open";
    }
    super._onData(data);
  }

  getBattery() {
    return utils.getBatteryFromVoltage(this.properties.voltage);
  }

  getStatus() {
    return this.properties.status;
  }
};
