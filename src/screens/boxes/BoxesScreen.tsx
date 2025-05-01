import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Alert,
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  useNavigation, 
  useRoute, 
  useIsFocused, 
  RouteProp 
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BoxCard, { Box } from '../../components/boxes/BoxCard';
import QRCodeModal from '../../components/qr/QRCodeModal';
import { MOCK_BOXES } from '../../constants/mockData';
import { BoxesStackParamList } from '../../types/navigation';

// Definiendo los tipos específicos para esta pantalla
type BoxesScreenNavigationProp = NativeStackNavigationProp<BoxesStackParamList, 'Contenedores'>;
type BoxesScreenRouteProp = RouteProp<BoxesStackParamList, 'Contenedores'>;

const BoxesScreen = () => {
  const [boxes, setBoxes] = useState<Box[]>(MOCK_BOXES);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedBox, setSelectedBox] = useState<Box | null>(null);
  const navigation = useNavigation<BoxesScreenNavigationProp>();
  const route = useRoute<BoxesScreenRouteProp>();
  const isFocused = useIsFocused();

  // Efecto para capturar el nuevo contenedor desde la pantalla de añadir
  useEffect(() => {
    if (isFocused && route.params?.newBox) {
      const newBox = route.params.newBox as Box;
      // Añadimos el nuevo contenedor al principio de la lista
      setBoxes(prevBoxes => [newBox, ...prevBoxes]);
      // Limpiamos los parámetros para evitar duplicados si volvemos a enfocar la pantalla
      navigation.setParams({ newBox: undefined });
    }
  }, [isFocused, route.params?.newBox]);

  const handleDelete = (id: string) => {
    Alert.alert(
      "Eliminar Contenedor",
      "¿Estás seguro que deseas eliminar este contenedor?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: () => {
            // Filtramos el contenedor a eliminar
            setBoxes(boxes.filter(box => box.id !== id));
          } 
        }
      ]
    );
  };

  const handleEdit = (box: Box) => {
    // Por ahora solo mostraremos un mensaje
    Alert.alert(
      "Editar Contenedor",
      `Editando contenedor: ${box.name}`,
      [{ text: "OK" }]
    );
  };

  const handleGenerateQR = (id: string) => {
    // Buscamos el contenedor con el ID proporcionado
    const box = boxes.find(box => box.id === id);
    if (box) {
      // Guardamos el contenedor seleccionado y mostramos el modal
      setSelectedBox(box);
      setQrModalVisible(true);
    }
  };

  const closeQRModal = () => {
    setQrModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={boxes}
        renderItem={({ item }) => (
          <BoxCard
            box={item}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onGenerateQR={handleGenerateQR}
          />
        )}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay contenedores disponibles</Text>
          </View>
        }
        contentContainerStyle={boxes.length === 0 ? styles.listEmpty : styles.list}
      />

      {/* Modal para mostrar el código QR */}
      {selectedBox && (
        <QRCodeModal
          visible={qrModalVisible}
          onClose={closeQRModal}
          boxId={selectedBox.id}
          boxName={selectedBox.name}
        />
      )}

      {/* Botón flotante para añadir nuevo contenedor */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddBox' as never)}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    paddingVertical: 12,
  },
  listEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#007AFF',
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default BoxesScreen;