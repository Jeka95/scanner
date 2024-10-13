import React, { useState } from 'react';
import {
   StyleSheet,
   Text,
   View,
   SafeAreaView,
   TouchableOpacity,
   Image,
   Modal,
   ScrollView,
   Alert
} from 'react-native';
import useBLE from "../useBle";
import DeviceModal from "../DeviceConnectionModal";

const AddProductScreen = () => {
   const SERVICE_UUID = "e7810a71-73ae-499d-8c15-faa9aef0c3f2";
   const CHARACTERISTIC_UUID = "bef8d6c9-9c21-4c9e-b632-bd58c1009f9f";

   const {
      requestPermissions,
      scanForPeripherals,
      allDevices,
      connectToDevice,
      connectedDevice,
      disconnectFromDevice,
      checkBluetoothState,
   } = useBLE();

   const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
   const [isUUIDModalVisible, setIsUUIDModalVisible] = useState<boolean>(false);
   const [uuids, setUUIDs] = useState<any[]>([]);

   // Вставляємо Base64 зображення напряму у код
   // const base64Image = "data:image/png;base64,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";
   const base64Image = "TEST"
   const scanForDevices = async () => {
      const isPermissionsEnabled = await requestPermissions();
      if (isPermissionsEnabled) {
         const isBluetoothOn = await checkBluetoothState();
         if (isBluetoothOn) {
            scanForPeripherals();
         } else {
            console.log("Bluetooth не увімкнено.");
         }
      } else {
         console.log("Не надано дозволів.");
      }
   };

   const hideModal = () => {
      setIsModalVisible(false);
   };

   const openModal = async () => {
      await scanForDevices();
      setIsModalVisible(true);
   };

   const discoverServicesAndCharacteristics = async () => {
      if (connectedDevice) {
         try {
            const services = await connectedDevice.characteristicsForService;
            // const discoveredUUIDs = services.characteristics.map(char => char.uuid);
            setUUIDs(services);
            setIsUUIDModalVisible(true); // Відкриваємо модалку для відображення UUID
         } catch (error) {
            console.error("Помилка під час отримання UUID сервісів та характеристик:", error);
            // Відображаємо помилку в алерті на телефоні
            Alert.alert(
               "Помилка",
               "Помилка під час отримання UUID сервісів та характеристик: " + error.message,
               [{ text: "OK" }] // Кнопка для закриття алерта
            );
         }
      }
   };

   const printImage = async (base64Image: string) => {
      if (!connectedDevice) {
         console.error("No connected device.");
         return;
      }

      try {
         const chunkSize = 512;
         for (let i = 0; i < base64Image.length; i += chunkSize) {
            const chunk = base64Image.slice(i, i + chunkSize);
            await connectedDevice.writeCharacteristicWithoutResponseForService(
               SERVICE_UUID,
               CHARACTERISTIC_UUID,
               chunk
            );
         }
         connectedDevice.
            Alert.alert(
               "Добре",
               "Зображення успішно відправлено на друк.",
               [{ text: "OK" }] // Кнопка для закриття алерта
            );
         console.log("Зображення успішно відправлено на друк.");
      } catch (error) {
         Alert.alert(
            "Помилка",
            error,
            [{ text: "OK" }] // Кнопка для закриття алерта
         );
      }
   };

   return (
      <SafeAreaView style={styles.container}>
         {connectedDevice && (
            <>
               <Image
                  source={{ uri: base64Image }}
                  style={styles.image}
               />
               <TouchableOpacity
                  onPress={() => printImage(base64Image)}
                  style={styles.printButton}
               >
                  <Text style={styles.ctaButtonText}>Print</Text>
               </TouchableOpacity>

               <TouchableOpacity
                  onPress={discoverServicesAndCharacteristics} // Викликаємо функцію для показу UUID
                  style={styles.showButton}
               >
                  <Text style={styles.ctaButtonText}>Show UUIDs</Text>
               </TouchableOpacity>
            </>
         )}
         <TouchableOpacity
            onPress={connectedDevice ? disconnectFromDevice : openModal}
            style={styles.ctaButton}
         >
            <Text style={styles.ctaButtonText}>
               {connectedDevice ? "Disconnect" : "Connect"}
            </Text>
         </TouchableOpacity>
         <DeviceModal
            closeModal={hideModal}
            visible={isModalVisible}
            connectToPeripheral={connectToDevice}
            devices={allDevices}
         />

         {/* Модальне вікно для відображення UUID */}
         <Modal visible={isUUIDModalVisible} transparent={true}>
            <View style={styles.modalContainer}>
               <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Found UUIDs</Text>
                  <ScrollView>
                     {uuids.map((uuid, index) => (
                        <Text key={index} style={styles.uuidText}>{uuid}</Text>
                     ))}
                  </ScrollView>
                  <TouchableOpacity
                     onPress={() => setIsUUIDModalVisible(false)}
                     style={styles.ctaButton}
                  >
                     <Text style={styles.ctaButtonText}>Close</Text>
                  </TouchableOpacity>
               </View>
            </View>
         </Modal>
      </SafeAreaView>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: "#f2f2f2",
   },
   ctaButton: {
      backgroundColor: "#FF6060",
      justifyContent: "center",
      alignItems: "center",
      height: 50,
      width: 200,
      marginBottom: 5,
      borderRadius: 8,
   },
   ctaButtonText: {
      fontSize: 18,
      fontWeight: "bold",
      color: "white",
   },
   printButton: {
      backgroundColor: "#4CAF50",
      justifyContent: "center",
      alignItems: "center",
      height: 50,
      width: 200,
      marginBottom: 10,
      borderRadius: 8,
   },
   showButton: {
      backgroundColor: "#2196F3",
      justifyContent: "center",
      alignItems: "center",
      height: 50,
      width: 200,
      marginBottom: 10,
      borderRadius: 8,
   },
   image: {
      width: 300,
      height: 100,
      resizeMode: 'contain',
      marginBottom: 10,
   },
   modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
   },
   modalContent: {
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 10,
      width: '80%',
      alignItems: 'center',
   },
   modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 15,
   },
   uuidText: {
      fontSize: 16,
      marginBottom: 10,
   },
});

export default AddProductScreen;
