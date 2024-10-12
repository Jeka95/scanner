import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Platform, Pressable } from 'react-native';

const AuthScreen = ({ navigation }) => {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');

   const handleLogin = () => {
      // Authentication logic (API, Firebase, etc.)
      // Replace this with your actual authentication logic
      if (email === 'admin' && password === 'admin') {
         navigation.navigate('Home');
      } else {
         alert('Incorrect login or password');
      }
   };

   return (
      <View style={styles.container}>
         <Text style={styles.title}>Authorization</Text>
         <TextInput
            style={styles.input}
            placeholder="Login"
            value={email}
            onChangeText={(text) => setEmail(text)}
         />
         <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry={true}
            value={password}
            onChangeText={(text) => setPassword(text)}
         />
         <Pressable style={styles.button} onPress={handleLogin}>
            <Text style={styles.text}>Sign in</Text>
         </Pressable>
      </View>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f0f0f0', // Light background
      padding: 20,
   },
   title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: '#333', // Darker text
   },
   input: {
      width: 300, // Adjust width as needed
      height: 40,
      borderColor: '#ccc', // Light border color
      borderWidth: 1,
      borderRadius: 5, // Rounded corners
      padding: 10,
      marginBottom: 10,
   },
   button: {
      width: 300, // Set button width to match input
      height: 40, // Adjust height if needed
      backgroundColor: '#2196f3', // Classic blue background (replace with desired color)
      padding: 10,
      borderRadius: 5,
      justifyContent: 'center',
      alignItems: 'center',
   },
   text: {
      fontSize: 14, // Adjust font size as needed
      color: '#ffffff',
   },
});

export default AuthScreen;
