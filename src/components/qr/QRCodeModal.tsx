import React, { useRef } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { QrCodeSvg } from 'react-native-qr-svg';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

interface QRCodeModalProps {
  visible: boolean;
  onClose: () => void;
  boxId: string;
  boxName: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ visible, onClose, boxId, boxName }) => {
  // Tamaño del código QR
  const QR_SIZE = 250;
  // Referencia a la vista que vamos a capturar
  const viewShotRef = useRef<any>(null);
  // Estado para controlar la carga durante el proceso de compartir
  const [isSharing, setIsSharing] = React.useState(false);

  // Función para capturar y compartir el QR como imagen
  const handleShare = async () => {
    if (!viewShotRef.current) {
      Alert.alert('Error', 'No se pudo capturar el código QR');
      return;
    }

    try {
      setIsSharing(true);

      // Capturamos la vista como imagen
      const uri = await viewShotRef.current.capture();
      
      // Verificamos si el dispositivo puede compartir
      const canShare = await Sharing.isAvailableAsync();
      
      if (canShare) {
        // Compartimos la imagen
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: `Código QR de ${boxName}`,
          UTI: 'public.png' // Para iOS
        });
      } else {
        Alert.alert('Error', 'La funcionalidad de compartir no está disponible en este dispositivo');
      }
    } catch (error) {
      console.error('Error al compartir:', error);
      Alert.alert('Error', 'No se pudo compartir el código QR');
    } finally {
      setIsSharing(false);
    }
  };

  // Función para imprimir (por ahora solo muestra un mensaje)
  const handlePrint = () => {
    Alert.alert(
      'Imprimir QR',
      'La funcionalidad de impresión será implementada próximamente.',
      [{ text: 'OK' }]
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Código QR del Contenedor</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ViewShot
            ref={viewShotRef}
            options={{
              fileName: `qrcode-${boxId}`,
              format: 'png',
              quality: 0.9
            }}
            style={styles.qrContainer}
          >
            <View style={styles.qrContent}>
              <QrCodeSvg
                value={boxId}
                frameSize={QR_SIZE}
                contentCells={5}
                content={
                  <Text style={styles.qrCenterIcon}>📦</Text>
                }
                gradientColors={['#007AFF', '#00C7FF']}
                dotColor="#000000"
                backgroundColor="#FFFFFF"
              />
              
              <Text style={styles.boxInfo}>
                <Text style={styles.boxLabel}>Box: </Text>
                <Text style={styles.boxValue}>{boxName}</Text>
              </Text>
              
              <Text style={styles.boxInfo}>
                <Text style={styles.boxLabel}>ID: </Text>
                <Text style={styles.boxValue}>{boxId}</Text>
              </Text>
            </View>
          </ViewShot>

          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleShare}
              disabled={isSharing}
            >
              {isSharing ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <>
                  <Ionicons name="share-outline" size={24} color="#007AFF" />
                  <Text style={styles.actionText}>Compartir</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handlePrint}>
              <Ionicons name="print-outline" size={24} color="#007AFF" />
              <Text style={styles.actionText}>Imprimir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  qrContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  qrContent: {
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCenterIcon: {
    fontSize: 24,
  },
  boxInfo: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  boxLabel: {
    fontWeight: 'bold',
  },
  boxValue: {
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  actionButton: {
    alignItems: 'center',
    padding: 10,
    minWidth: 80,
  },
  actionText: {
    color: '#007AFF',
    marginTop: 5,
  }
});

export default QRCodeModal;