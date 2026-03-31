import { StyleSheet, View ,Text} from 'react-native'; 
import { StatusBar } from 'expo-status-bar';
import { ZipGame } from './ZipGameLibrary'; 

export default function App() {
  return (
    <View style={styles.container}>
     
      <ZipGame />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});