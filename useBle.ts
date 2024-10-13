import { useState, useEffect } from "react";
import { PermissionsAndroid, Platform, Alert } from "react-native";
import { BleManager, Device, State } from "react-native-ble-plx";
import * as ExpoDevice from "expo-device";
import base64 from "react-native-base64";

const HEART_RATE_UUID = "0000180d-0000-1000-8000-00805f9b34fb";
const HEART_RATE_CHARACTERISTIC = "00002a37-0000-1000-8000-00805f9b34fb";

function useBLE() {
   const [bleManager, setBleManager] = useState<BleManager | null>(null);
   const [allDevices, setAllDevices] = useState<Device[]>([]);
   const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
   const [heartRate, setHeartRate] = useState<number>(0);

   // Ініціалізуємо BleManager під час завантаження компонента
   useEffect(() => {
      const manager = new BleManager();
      setBleManager(manager);

      return () => {
         if (manager) {
            console.log("Destroying BleManager");
            manager.destroy(); // Очищення при виході
         }
      };
   }, []);

   const requestPermissions = async () => {
      try {
         if (Platform.OS === "android") {
            if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
               const granted = await PermissionsAndroid.request(
                  PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                  {
                     title: "Location Permission",
                     message: "Bluetooth Low Energy requires Location",
                     buttonPositive: "OK",
                  }
               );
               return granted === PermissionsAndroid.RESULTS.GRANTED;
            } else {
               const isAndroid31PermissionsGranted = await PermissionsAndroid.requestMultiple([
                  PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                  PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                  PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
               ]);

               return (
                  isAndroid31PermissionsGranted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
                  isAndroid31PermissionsGranted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
                  isAndroid31PermissionsGranted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
               );
            }
         } else {
            return true;
         }
      } catch (error) {
         console.log("Error requesting permissions:", error);
         return false;
      }
   };

   const checkBluetoothState = async () => {
      try {
         const state = await bleManager?.state();
         console.log("Bluetooth state:", state);
         if (state !== State.PoweredOn) {
            return new Promise((resolve) => {
               Alert.alert(
                  "Bluetooth вимкнено",
                  "Будь ласка, увімкніть Bluetooth",
                  [
                     {
                        text: "Увімкнути", onPress: async () => {
                           await bleManager?.enable();
                           // Додаємо затримку після увімкнення Bluetooth
                           setTimeout(async () => {
                              const newState = await bleManager?.state(); // Перевіряємо новий стан
                              if (newState === State.PoweredOn) {
                                 resolve(true);
                              } else {
                                 resolve(false);
                              }
                           }, 5000); // Затримка 5 секунд
                        }
                     },
                     { text: "Відміна", onPress: () => resolve(false), style: "cancel" }
                  ]
               );
            });
         }
         return true;
      } catch (error) {
         console.log("Error checking Bluetooth state:", error);
         return false;
      }
   };

   const scanForPeripherals = async () => {
      if (!bleManager) {
         console.error("BLE Manager is not initialized.");
         return;
      }

      try {
         bleManager.stopDeviceScan(); // Зупиняємо попереднє сканування
         bleManager.startDeviceScan(null, null, (error, device) => {
            if (error) {
               if (error.message.includes("Operation was cancelled")) {
                  console.log("Сканування було скасовано, повторюємо через 5 секунд.");
                  setTimeout(() => {
                     scanForPeripherals(); // Повторюємо сканування після затримки
                  }, 5000);
               } else {
                  console.log("Інша помилка:", error);
               }
               bleManager.stopDeviceScan();  // Зупиняємо сканування в разі помилки
               return;
            }
            if (device && device.localName) {
               console.log(device, "devicedevicedevicereal")
               setAllDevices((prevState) => {
                  if (!prevState.some(d => d.rawScanRecord === device.rawScanRecord)) {
                     return [...prevState, device];
                  }
                  return prevState;
               });
            }
         });
      } catch (error) {
         console.log("Error starting device scan:", error);
      }
   };

   const connectToDevice = async (device: Device) => {
      if (!bleManager) {
         console.error("BLE Manager is not initialized.");
         return;
      }

      try {
         bleManager.stopDeviceScan(); // Зупиняємо сканування перед підключенням
         const deviceConnection = await bleManager.connectToDevice(device.id);
         setConnectedDevice(deviceConnection);
         await deviceConnection.discoverAllServicesAndCharacteristics();
         startStreamingData(deviceConnection);
      } catch (e) {
         console.log("FAILED TO CONNECT", e);
      }
   };

   const disconnectFromDevice = async () => {
      if (connectedDevice && bleManager) {
         try {
            await bleManager.cancelDeviceConnection(connectedDevice.id);
            setConnectedDevice(null);
            setHeartRate(0);
         } catch (error) {
            console.log("Error disconnecting device:", error);
         }
      } else {
         console.error("No connected device or BLE Manager.");
      }
   };

   const startStreamingData = async (device: Device) => {
      if (!device) {
         console.error("No device connected for streaming.");
         return;
      }

      try {
         device.monitorCharacteristicForService(
            HEART_RATE_UUID,
            HEART_RATE_CHARACTERISTIC,
            (error, characteristic) => {
               if (error) {
                  console.log("Error receiving characteristic update:", error);
                  return;
               }
               if (characteristic?.value) {
                  const rawData = base64.decode(characteristic.value);
                  let innerHeartRate = -1;
                  const firstBitValue = rawData.charCodeAt(0) & 0x01;

                  if (firstBitValue === 0) {
                     innerHeartRate = rawData.charCodeAt(1);
                  } else {
                     innerHeartRate = (rawData.charCodeAt(1) << 8) + rawData.charCodeAt(2);
                  }

                  setHeartRate(innerHeartRate);
               }
            }
         );
      } catch (error) {
         console.log("Error starting data streaming:", error);
      }
   };

   return {
      requestPermissions,
      scanForPeripherals,
      connectToDevice,
      disconnectFromDevice,
      checkBluetoothState, // Переконаємося, що функція повертається
      allDevices,
      connectedDevice,
      heartRate,
   };
}

export default useBLE;
