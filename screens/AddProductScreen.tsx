import React, { useState } from 'react';
import {
   StyleSheet,
   Text,
   View,
   TextInput,
   Pressable,
   Modal,
   FlatList,
   KeyboardAvoidingView,
   TouchableOpacity,
   Image,
   Alert,
} from 'react-native';
import { RadioButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import { API_BASE_URL } from '../config/apiConfig';

const AddProductScreen = () => {
   const navigation = useNavigation();
   const [carCode, setCarCode] = useState('');
   const [carCodeRecommendations] = useState(['JF0001', 'JF0002', 'FE', 'TT']);
   const [partCode, setPartCode] = useState('');
   const [partCodeRecommendations] = useState(['I', 'B']);
   const [locationCode, setLocationCode] = useState('A');
   const [boxNumber, setBoxNumber] = useState('');
   const [isForSale, setIsForSale] = useState(false);
   const [image, setImage] = useState(null);
   const [isAddProductModalVisible, setIsAddProductModalVisible] = useState(false);
   const [barcode, setBarcode] = useState(null);
   const [showCarCodeSuggestions, setShowCarCodeSuggestions] = useState(false);
   const [showPartCodeSuggestions, setShowPartCodeSuggestions] = useState(false);

   // Відкриття вибору зображення
   const pickImage = () => {
      launchImageLibrary({ mediaType: 'photo', includeBase64: false }, (response) => {
         if (response.didCancel) {
            console.log('User cancelled image picker');
         } else if (response.error) {
            console.log('ImagePicker Error: ', response.error);
         } else {
            const selectedImage = response.assets[0].uri;
            setImage(selectedImage);
         }
      });
   };


   // Обробка відправки нового продукту
   const handleSubmitNewProduct = async () => {
      if (!carCode || !partCode || !boxNumber) {
         console.error('Invalid product data');
         return;
      }

      try {
         const createUrl = `${API_BASE_URL}/createProduct`;

         const formData = new FormData();
         formData.append('carCode', carCode);
         formData.append('partCode', partCode);
         formData.append('locationCode', locationCode);
         formData.append('boxNumber', boxNumber);
         formData.append('isForSale', isForSale.toString());

         if (image) {
            const imageName = image.split('/').pop();
            formData.append('image', {
               uri: image,
               name: imageName,
               type: 'image/jpeg',
            });
         }

         const createResponse = await fetch(createUrl, {
            method: 'POST',
            headers: {
               'Content-Type': 'multipart/form-data',
            },
            body: formData,
         });

         if (!createResponse.ok) {
            throw new Error('Create API request failed');
         }

         const contentType = createResponse.headers.get('content-type');
         // console.log('Response Headers:', createResponse.headers);
         // console.log('Content-Type:', contentType);

         if (contentType === 'image/png') {
            // Обробляємо потік байтів
            const blob = await createResponse.blob();
            const reader = new FileReader();

            // Використовуємо FileReader для конвертації зображення в Base64
            reader.onloadend = () => {
               const base64String = reader.result;
               // console.log('Base64 image URI:', base64String); // Дебаг: показуємо URI зображення
               setBarcode(base64String); // Зберігаємо зображення в base64
            };
            reader.readAsDataURL(blob); // Конвертуємо Blob в Base64
         } else {
            console.warn('Unknown content type:', contentType);
         }

         setIsAddProductModalVisible(true);
      } catch (error) {
         console.error('Error during product creation:', error);
      }
   };

   return (
      <KeyboardAvoidingView style={styles.container}>
         <FlatList
            data={[]}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
               <View>
                  <Text style={styles.title}>Add New Product</Text>

                  {/* Введення Car Code */}
                  <Text>Car Code:</Text>
                  <TextInput
                     style={styles.input}
                     placeholder="Enter Car Code"
                     value={carCode}
                     onFocus={() => setShowCarCodeSuggestions(true)}
                     onChangeText={(text) => {
                        setCarCode(text);
                        setShowCarCodeSuggestions(true);
                     }}
                  />
                  {showCarCodeSuggestions && (
                     <FlatList
                        data={carCodeRecommendations.filter((code) =>
                           code.toLowerCase().includes(carCode.toLowerCase())
                        )}
                        keyExtractor={(item) => item}
                        keyboardShouldPersistTaps="handled"
                        renderItem={({ item }) => (
                           <TouchableOpacity
                              onPress={() => {
                                 setCarCode(item);
                                 setShowCarCodeSuggestions(false);
                              }}>
                              <Text style={styles.suggestionItem}>{item}</Text>
                           </TouchableOpacity>
                        )}
                        style={styles.suggestionsContainer}
                     />
                  )}

                  {/* Введення Part Code */}
                  <Text>Part Code:</Text>
                  <TextInput
                     style={styles.input}
                     placeholder="Enter Part Code"
                     value={partCode}
                     onFocus={() => setShowPartCodeSuggestions(true)}
                     onChangeText={(text) => {
                        setPartCode(text);
                        setShowPartCodeSuggestions(true);
                     }}
                  />
                  {showPartCodeSuggestions && (
                     <FlatList
                        data={partCodeRecommendations.filter((code) =>
                           code.toLowerCase().includes(partCode.toLowerCase())
                        )}
                        keyExtractor={(item) => item}
                        keyboardShouldPersistTaps="handled"
                        renderItem={({ item }) => (
                           <TouchableOpacity
                              onPress={() => {
                                 setPartCode(item);
                                 setShowPartCodeSuggestions(false);
                              }}>
                              <Text style={styles.suggestionItem}>{item}</Text>
                           </TouchableOpacity>
                        )}
                        style={styles.suggestionsContainer}
                     />
                  )}

                  {/* Вибір Location Code */}
                  <Text>Location Code:</Text>
                  <View style={styles.radioButtonContainer}>
                     <RadioButton
                        value="A"
                        status={locationCode === 'A' ? 'checked' : 'unchecked'}
                        onPress={() => setLocationCode('A')}
                     />
                     <Text>A</Text>
                     <RadioButton
                        value="B"
                        status={locationCode === 'B' ? 'checked' : 'unchecked'}
                        onPress={() => setLocationCode('B')}
                     />
                     <Text>B</Text>
                  </View>

                  {/* Введення Box Number */}
                  <Text>Box Number:</Text>
                  <TextInput
                     style={styles.input}
                     placeholder="Enter Box Number"
                     value={boxNumber}
                     onChangeText={setBoxNumber}
                  />

                  {/* Статус продукту */}
                  <Text>Is For Sale:</Text>
                  <View style={styles.radioButtonContainer}>
                     <RadioButton
                        value="yes"
                        status={isForSale ? 'checked' : 'unchecked'}
                        onPress={() => setIsForSale(true)}
                     />
                     <Text>Yes</Text>
                     <RadioButton
                        value="no"
                        status={!isForSale ? 'checked' : 'unchecked'}
                        onPress={() => setIsForSale(false)}
                     />
                     <Text>No</Text>
                  </View>

                  {/* Кнопка для завантаження зображення */}
                  <Pressable style={styles.uploadButton} onPress={pickImage}>
                     <Text style={styles.uploadButtonText}>Upload Part Image</Text>
                  </Pressable>

                  {/* Відображення вибраного зображення */}
                  {image && (
                     <Image
                        source={{ uri: image }}
                        style={styles.image}
                     />
                  )}

                  {/* Кнопка для збереження */}
                  <Pressable style={styles.submitButton} onPress={handleSubmitNewProduct}>
                     <Text style={styles.submitButtonText}>Save</Text>
                  </Pressable>

                  {/* Кнопка для закриття */}
                  <Pressable style={styles.cancelButton} onPress={() => navigation.goBack()}>
                     <Text style={styles.cancelButtonText}>Close</Text>
                  </Pressable>

                  {/* Модальне вікно підтвердження */}
                  <Modal visible={isAddProductModalVisible} onRequestClose={() => setIsAddProductModalVisible(false)}>
                     <View style={styles.modalContent}>
                        <Text>Product added successfully!</Text>

                        {/* Відображення зображення штрих-коду */}
                        {barcode && (
                           <Image
                              source={{ uri: barcode }}
                              style={{ width: 200, height: 100 }}
                           />
                        )}

                        <Pressable style={styles.closeButton} onPress={() => setIsAddProductModalVisible(false)}>
                           <Text style={styles.closeButtonText}>Close</Text>
                        </Pressable>
                     </View>
                  </Modal>
               </View>
            }
            keyExtractor={() => 'dummy'}
         />
      </KeyboardAvoidingView>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#f0f0f0',
   },
   title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
   },
   input: {
      backgroundColor: '#fff',
      borderColor: '#ccc',
      borderWidth: 1,
      padding: 10,
      marginBottom: 10,
      borderRadius: 5,
   },
   suggestionsContainer: {
      maxHeight: 150,
      backgroundColor: '#fff',
      borderColor: '#ccc',
      borderWidth: 1,
      marginBottom: 10,
   },
   suggestionItem: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
   },
   radioButtonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
   },
   uploadButton: {
      backgroundColor: '#007bff',
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
      marginBottom: 10,
   },
   uploadButtonText: {
      color: '#fff',
      fontSize: 16,
   },
   image: {
      width: 200,
      height: 200,
      marginBottom: 20,
      alignSelf: 'center',
   },
   submitButton: {
      backgroundColor: '#007bff',
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
      marginBottom: 10,
   },
   submitButtonText: {
      color: '#fff',
      fontSize: 16,
   },
   cancelButton: {
      backgroundColor: '#ccc',
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 20,
   },
   cancelButtonText: {
      color: '#000',
      fontSize: 16,
   },
   modalContent: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
   },
   closeButton: {
      backgroundColor: '#007bff',
      padding: 10,
      borderRadius: 5,
      marginTop: 10,
   },
   closeButtonText: {
      color: '#fff',
   },
});

export default AddProductScreen;
