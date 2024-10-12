import React from 'react';
import { View, Text, Button, StyleSheet, Pressable } from 'react-native';

const HomeScreen = ({ navigation }) => {
   return (
      <View style={styles.container}>
         <Text style={styles.title}>Choose an action</Text>
         <View style={styles.buttonsContainer}>
            {/* <Pressable style={styles.button} onPress={() => navigation.navigate('Get')}>
               <Text style={styles.text}>Add a product</Text>
            </Pressable> */}
            {/* <Pressable style={styles.button} onPress={() => navigation.navigate('Give')}>
               <Text style={styles.text}>give the product</Text>
            </Pressable> */}
            {/* Додано нову кнопку для переходу на сторінку AddProductScreen */}
            <Pressable style={styles.button} onPress={() => navigation.navigate('AddProduct')}>
               <Text style={styles.text}>Add a product (Manual)</Text>
            </Pressable>
         </View>
      </View>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
   },
   title: {
      fontSize: 24,
      marginBottom: 20,
   },
   buttonsContainer: {
      flexDirection: 'column',
   },
   button: {
      width: 300, // Set button width to match input
      height: 40, // Adjust height if needed
      backgroundColor: '#2196f3', // Classic blue background (replace with desired color)
      padding: 10,
      marginBottom: 20,
      borderRadius: 5,
      justifyContent: 'center',
      alignItems: 'center',
   },
   text: {
      fontSize: 14, // Adjust font size as needed
      color: '#ffffff',
   }

});

export default HomeScreen;
