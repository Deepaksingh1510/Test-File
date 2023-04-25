import { View, KeyboardAvoidingView } from "react-native";
import React, { useState } from "react";
import { Text, Button, Input, Image } from "react-native-elements";
import { TextInput } from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, storage } from "../firebase";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignUpEnabled, setIsSignUpEnabled] = useState(false);
  const [image, setImage] = useState(null);

  const register = async () => {
    if (password === confirmPassword) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        const profileImageUrl = await uploadImage(image, user.email);
        await updateProfile(user, {
          displayName: name,
          photoURL: profileImageUrl,
        });
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    setIsSignUpEnabled(text === password);
  };
  const uploadImage = async (uri, email) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const storageRef = ref(storage, `users/${email}/profileImage`);

      await uploadBytes(storageRef, blob);

      const url = await getDownloadURL(
        ref(storage, `users/${email}/profileImage`)
      );

      return url;
    } catch (error) {
      return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      className="flex-1 items-center justify-center p-10 bg-white"
    >
      <Text className="font-bold mb-10 text-2xl text-red-500">
        Create an Account
      </Text>
      <TextInput
        className="bg-gray-100 border rounded-xl h-9 w-64 p-2 mt-5 mb-2"
        placeholder="Full name"
        autoFocus
        type="name"
        value={name}
        onChangeText={(text) => setName(text)}
        testID="fullNameField"
      />
      <TextInput
        className="bg-gray-100 border rounded-xl h-9 w-64 p-2 mb-2"
        placeholder="Email"
        type="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        testID="emailField"
      />
      <TextInput
        className="bg-gray-100 border rounded-xl h-9 w-64 p-2 mb-2"
        placeholder="Password"
        secureTextEntry
        type="Password"
        value={password}
        onChangeText={(text) => setPassword(text)}
        testID="passwordField"
      />

      <TextInput
        className="bg-gray-100 border rounded-xl h-9 w-64 p-2 mb-2"
        placeholder="Confirm Password"
        secureTextEntry
        type="Password"
        value={confirmPassword}
        onChangeText={handleConfirmPasswordChange}
        testID="confirmPasswordField"
      />
      {image && (
        <Image
          source={{ uri: image }}
          className="w-20 h-20 rounded-full mb-2 "
          testID="photo"
        ></Image>
      )}
      <Button
        testID="select_pht_btn"
        title="Select Image"
        onPress={pickImage}
      />

      <Button
        className="mt-5 h-14 w-28"
        title="Sign up"
        buttonStyle={{
          backgroundColor: "rgba(214, 61, 57, 1)",
          borderRadius: 5,
        }}
        titleStyle={{ fontWeight: "bold", fontSize: 20 }}
        onPress={register}
        disabled={!isSignUpEnabled}
        testID="signUp"
      />
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
