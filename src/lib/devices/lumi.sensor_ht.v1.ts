import Device from "../device-aqara";
import utils from "../utils";

export default class extends Device {
  static model = "lumi.sensor_ht.v1";
  static name = "Mi Temperature and Humidity Sensor";
  static image = "http://static.home.mi.com/app/image/get/file/developer_1551946270wfcy8jua.png";

  getBattery() {
    return utils.getBatteryFromVoltage(this.properties.voltage);
  }

  getTemperature() {
    const temperature = parseInt(this.properties.temperature, 10);
    if (Number.isInteger(temperature)) return temperature / 100;
    return undefined;
  }

  getHumidity() {
    const humidity = parseInt(this.properties.humidity, 10);
    if (Number.isInteger(humidity)) return humidity / 100;
    return undefined;
  }
}
