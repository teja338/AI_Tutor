import  AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY="SMARTV1_TOKEN";

export const saveToken=async (token) => {
    try {
       await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
    console.error("Error saving token", e);
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (e) {
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (e) {}
};