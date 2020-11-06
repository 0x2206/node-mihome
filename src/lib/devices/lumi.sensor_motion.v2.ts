import Device from "../device-aqara";
import utils from "../utils";

export default class extends Device {
  static model = "lumi.sensor_motion.v1";
  static name = "Mi Motion Sensor";
  static image = "https://static.home.mi.com/app/image/get/file/developer_1568790614naen5iow.png";

  _onData(data) {
    if (data.no_motion) {
      data.status = "immobility";
    }
    super._onData(data);
  }

  getBattery() {
    return utils.getBatteryFromVoltage(this.properties.voltage);
  }

  getStatus() {
    return this.properties.status;
  }

  getLuminance() {
    const luminance = parseInt(this.properties.lux, 10);
    if (luminance > 0) return luminance;
    return undefined;
  }
}
