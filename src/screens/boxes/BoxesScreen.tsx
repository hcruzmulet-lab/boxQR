import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl, 
  Text, 
  Alert, 
  Modal,
  Pressable,
  ScrollView
} from 'react-native';
import { useIsFocused, useNavigation, CommonActions } from '@react-navigation/native';
// Reemplazamos la importación de react-use por nuestra implementación personalizada
import { useUpdateEffect } from '../../hooks/useUpdateEffect';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import { Box } from '../../components/boxes/BoxCard';
import BoxCard from '../../components/boxes/BoxCard';
import { BoxesStackParamList } from '../../types/navigation';
import { BoxesService } from '../../services/database/boxesService';
// Importamos el componente QRCodeModal
import QRCodeModal from '../../components/qr/QRCodeModal';

// Componente personalizado para Chip
interface ChipProps {
  children: React.ReactNode;
  style?: any;
  onClose?: () => void;
  selected?: boolean;
  onPress?: () => void;
  mode?: string;
}

const CustomChip: React.FC<ChipProps> = ({ 
  children, 
  style, 
  onClose, 
  selected, 
  onPress,
  mode = "flat"
}) => {
  const isOutlined = mode === "outlined";
  return (
    <TouchableOpacity
      style={[
        chipStyles.container,
        isOutlined ? chipStyles.outlined : chipStyles.flat,
        selected && chipStyles.selected,
        style
      ]}
      onPress={onPress}
    >
      <Text style={[chipStyles.text, selected && chipStyles.selectedText]}>{children}</Text>
      {onClose && (
        <TouchableOpacity onPress={onClose} style={chipStyles.closeButton}>
          <Ionicons name="close-circle" size={16} color="#666" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const chipStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  flat: {
    backgroundColor: '#e0e0e0',
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  selected: {
    backgroundColor: '#007AFF',
  },
  text: {
    fontSize: 14,
  },
  selectedText: {
    color: 'white',
  },
  closeButton: {
    marginLeft: 6,
  },
});

// Componente personalizado para Botón
interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  mode?: 'text' | 'contained';
  style?: any;
}

const CustomButton: React.FC<ButtonProps> = ({ children, onPress, mode = 'text', style }) => {
  const isContained = mode === 'contained';
  return (
    <TouchableOpacity
      style={[
        buttonStyles.button,
        isContained ? buttonStyles.contained : buttonStyles.text,
        style
      ]}
      onPress={onPress}
    >
      <Text 
        style={[
          buttonStyles.label, 
          isContained ? buttonStyles.containedLabel : buttonStyles.textLabel
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const buttonStyles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contained: {
    backgroundColor: '#007AFF',
  },
  text: {
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  containedLabel: {
    color: 'white',
  },
  textLabel: {
    color: '#007AFF',
  },
});

// Componente personalizado para FAB
interface FABProps {
  onPress: () => void;
  icon: keyof typeof Ionicons.glyphMap;
  style?: any;
}

const FAB: React.FC<FABProps> = ({ onPress, icon, style }) => {
  return (
    <TouchableOpacity 
      style={[fabStyles.fab, style]} 
      onPress={onPress}
    >
      <Ionicons name={icon} size={24} color="white" />
    </TouchableOpacity>
  );
};

const fabStyles = StyleSheet.create({
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    right: 16,
    bottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  }
});

export function BoxesScreen() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedBox, setSelectedBox] = useState<Box | null>(null);

  const navigation = useNavigation<StackNavigationProp<BoxesStackParamList>>();
  const isFocused = useIsFocused();

  const boxesService = BoxesService.getInstance();

  useEffect(() => {
    loadBoxes();
    loadFilterOptions();
  }, []);

  useUpdateEffect(() => {
    if (isFocused) {
      loadBoxes();
    }
  }, [isFocused]);

  const loadBoxes = async () => {
    try {
      let loadedBoxes: Box[];
      
      if (selectedCategory || selectedLocation) {
        loadedBoxes = await boxesService.filterBoxes({
          category: selectedCategory || undefined,
          location: selectedLocation || undefined,
        });
        setIsFiltered(true);
      } else {
        loadedBoxes = await boxesService.getAllBoxes();
        setIsFiltered(false);
      }
      
      setBoxes(loadedBoxes);
    } catch (error) {
      console.error('Error loading boxes', error);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const allCategories = await boxesService.getAllCategories();
      const allLocations = await boxesService.getAllLocations();
      setCategories(allCategories);
      setLocations(allLocations);
    } catch (error) {
      console.error('Error loading filter options', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBoxes();
    setRefreshing(false);
  };

  useUpdateEffect(() => {
    loadBoxes();
  }, [selectedCategory, selectedLocation]);

  const navigateToBoxDetail = (boxId: string) => {
    navigation.navigate('BoxDetail', { boxId });
  };

  const navigateToAddBox = () => {
    navigation.navigate('AddBox');
  };

  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedLocation(null);
    setFilterModalVisible(false);
  };

  const applyFilters = () => {
    setFilterModalVisible(false);
    loadBoxes();
  };

  const handleEdit = (box: Box) => {
    navigation.navigate('EditBox', { box });
  };

  const handleGenerateQR = (box: Box) => {
    // Guardamos la caja seleccionada y mostramos el modal QR
    setSelectedBox(box);
    setQrModalVisible(true);
  };

  const handleDelete = async (boxId: string) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar este contenedor?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await boxesService.deleteBox(boxId);
              setBoxes(boxes.filter(box => box.id !== boxId));
            } catch (error) {
              console.error('Error deleting box:', error);
              Alert.alert('Error', 'No se pudo eliminar el contenedor');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Contenedores</Text>
        {isFiltered && (
          <TouchableOpacity 
            style={styles.filterButton} 
            onPress={() => setFilterModalVisible(true)}
          >
            <Text style={styles.activeFilter}>Filtros activos</Text>
          </TouchableOpacity>
        )}
        {!isFiltered && (
          <TouchableOpacity 
            style={styles.filterButton} 
            onPress={() => setFilterModalVisible(true)}
          >
            <Text style={styles.filterButtonText}>Filtrar</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {isFiltered && (
        <View style={styles.activeFiltersContainer}>
          {selectedCategory && (
            <CustomChip 
              style={styles.filterChip} 
              onClose={() => setSelectedCategory(null)}
            >
              Categoría: {selectedCategory}
            </CustomChip>
          )}
          {selectedLocation && (
            <CustomChip 
              style={styles.filterChip} 
              onClose={() => setSelectedLocation(null)}
            >
              Ubicación: {selectedLocation}
            </CustomChip>
          )}
        </View>
      )}

      <FlatList
        data={boxes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <BoxCard 
            box={item} 
            onPress={() => navigateToBoxDetail(item.id)} 
            onDelete={() => handleDelete(item.id)}
            onEdit={() => handleEdit(item)}
            onGenerateQR={() => handleGenerateQR(item)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />

      <Modal
        animationType="fade"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setFilterModalVisible(false)}
        >
          <View 
            style={styles.modalContainer}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filtrar contenedores</Text>
              </View>
              
              <ScrollView style={styles.modalContent}>
                <Text style={styles.filterTitle}>Categoría</Text>
                <View style={styles.filterOptions}>
                  {categories.map(category => (
                    <CustomChip
                      key={category}
                      selected={selectedCategory === category}
                      onPress={() => setSelectedCategory(selectedCategory === category ? null : category)}
                      style={styles.filterChip}
                      mode={selectedCategory === category ? "flat" : "outlined"}
                    >
                      {category}
                    </CustomChip>
                  ))}
                </View>
                
                <Text style={styles.filterTitle}>Ubicación</Text>
                <View style={styles.filterOptions}>
                  {locations.map(location => (
                    <CustomChip
                      key={location}
                      selected={selectedLocation === location}
                      onPress={() => setSelectedLocation(selectedLocation === location ? null : location)}
                      style={styles.filterChip}
                      mode={selectedLocation === location ? "flat" : "outlined"}
                    >
                      {location}
                    </CustomChip>
                  ))}
                </View>
              </ScrollView>
              
              <View style={styles.modalActions}>
                <CustomButton onPress={resetFilters}>
                  Restablecer
                </CustomButton>
                <CustomButton onPress={applyFilters} mode="contained">
                  Aplicar
                </CustomButton>
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Modal de QR para generar y compartir códigos QR */}
      {selectedBox && (
        <QRCodeModal
          visible={qrModalVisible}
          onClose={() => setQrModalVisible(false)}
          boxId={selectedBox.id}
          boxName={selectedBox.name}
        />
      )}

      <FAB
        icon="add"
        onPress={navigateToAddBox}
        style={styles.fab}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterButton: {
    padding: 10,
  },
  filterButtonText: {
    color: '#007AFF',
  },
  activeFilter: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f9f9f9',
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 8,
  },
  fab: {
    backgroundColor: '#007AFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'transparent',
  },
  modalCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 16,
    maxHeight: 400,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});