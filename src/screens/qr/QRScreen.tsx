import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
  Dimensions
} from 'react-native';
import { Camera, CameraView, BarcodeScanningResult } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { QRStackParamList } from '../../types/navigation';
import { Ionicons } from '@expo/vector-icons';

type QRScreenNavigationProp = NativeStackNavigationProp<QRStackParamList, 'QRScan'>;

const QRScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(true);
  const cameraRef = useRef(null);
  const navigation = useNavigation<QRScreenNavigationProp>();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }: BarcodeScanningResult) => {
    if (scanned) return;
    
    setScanned(true);
    setScanning(false);

    // Procesamos solo códigos QR que parezcan IDs de cajas
    if (data.startsWith('BOX')) {
      // Navegar a la pantalla de detalles con el ID escaneado
      navigation.navigate('BoxDetail', { boxId: data });
    } else {
      Alert.alert(
        "Código inválido",
        "El código QR escaneado no corresponde a un contenedor válido.",
        [
          {
            text: "Escanear otro",
            onPress: () => {
              setScanned(false);
              setScanning(true);
            }
          }
        ]
      );
    }
  };

  // Cuando el usuario desea reanudar el escaneo
  const handleResumeScan = () => {
    setScanned(false);
    setScanning(true);
  };

  // Mostramos diferentes estados según los permisos
  if (hasPermission === null) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.permissionText}>Solicitando permisos de cámara...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centeredContainer}>
        <Ionicons name="camera-outline" size={64} color="#FF3B30" />
        <Text style={styles.permissionText}>No hay acceso a la cámara</Text>
        <Text style={styles.permissionSubtext}>
          Para escanear códigos QR, es necesario otorgar permisos de cámara.
        </Text>
        <TouchableOpacity 
          style={styles.permissionButton}
          onPress={() => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          }}
        >
          <Text style={styles.permissionButtonText}>Ir a configuración</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {scanning && (
        <View style={styles.scannerContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.scanner}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          >
            <View style={styles.overlay}>
              <View style={styles.scanFrame} />
              <Text style={styles.scanText}>Coloca el código QR dentro del cuadro</Text>
            </View>
          </CameraView>
        </View>
      )}

      {!scanning && (
        <View style={styles.resultContainer}>
          <Ionicons name="checkmark-circle" size={64} color="#28CD41" />
          <Text style={styles.resultText}>Código QR escaneado correctamente</Text>
          <TouchableOpacity 
            style={styles.resumeButton}
            onPress={handleResumeScan}
          >
            <Text style={styles.resumeButtonText}>Escanear otro código</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  scanner: {
    flex: 1,
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
    borderRadius: 12,
    marginBottom: 20,
  },
  scanText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 20,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  permissionText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
  permissionSubtext: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  resultText: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  resumeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  resumeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default QRScreen;