import Device from "../device-aqara";
import utils from "../utils";

export default class extends Device {
  static model = "lumi.sensor_switch.v2";
  static name = "Mi Wireless Switch";
  static image = "http://static.home.mi.com/app/image/get/file/developer_1551946118lv9kacyq.png";

  getBattery() {
    return utils.getBatteryFromVoltage(this.properties.voltage);
  }
}
