import Device from "../device-aqara";
import utils from "../utils";

export default class extends Device {
  static model = "lumi.sensor_magnet.aq2";
  static name = "Aqara Door & window sensor";
  static image = "http://static.home.mi.com/app/image/get/file/developer_15519469912gr3ftq9.png";

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
}
