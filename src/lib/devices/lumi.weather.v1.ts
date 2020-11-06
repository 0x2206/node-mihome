import Device from "../device-aqara";
import utils from "../utils";

export default class extends Device {
  static model = "lumi.weather.v1";
  static name = "Aqara Temperature and Humidity Sensor";
  static image = "http://static.home.mi.com/app/image/get/file/developer_1551946494759k1632.png";

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
    if (humidity > 0) return humidity / 100;
    return undefined;
  }

  getPressure() {
    const pressure = parseInt(this.properties.pressure, 10);
    if (pressure > 0) return pressure;
    return undefined;
  }
}