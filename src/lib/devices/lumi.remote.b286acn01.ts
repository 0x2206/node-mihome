import Device from "../device-aqara";
import utils from "../utils";

export default class extends Device {
  static model = "lumi.remote.b286acn01";
  static name = "Aqara Wireless Remote Switch (Double Rocker)";
  static image = "http://static.home.mi.com/app/image/get/file/developer_15393507473oz26oec.png";

  getBattery() {
    return utils.getBatteryFromVoltage(this.properties.voltage);
  }
}