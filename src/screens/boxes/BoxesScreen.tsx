import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Text, Alert } from 'react-native';
import { useIsFocused, useNavigation, CommonActions } from '@react-navigation/native';
// Reemplazamos la importación de react-use por nuestra implementación personalizada
import { useUpdateEffect } from '../../hooks/useUpdateEffect';
import { StackNavigationProp } from '@react-navigation/stack';
import { Searchbar, FAB, Menu, Button, Chip, Modal, Portal, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { Box } from '../../components/boxes/BoxCard';
import BoxCard from '../../components/boxes/BoxCard';
import { BoxesStackParamList } from '../../types/navigation';
import { BoxesService } from '../../services/database/boxesService';

export function BoxesScreen() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [isFiltered, setIsFiltered] = useState(false);

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
      
      if (searchQuery) {
        loadedBoxes = await boxesService.searchBoxes(searchQuery);
      } else if (selectedCategory || selectedLocation) {
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

  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
  };

  useUpdateEffect(() => {
    loadBoxes();
  }, [searchQuery, selectedCategory, selectedLocation]);

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
    // Usamos CommonActions para navegar entre diferentes stacks
    navigation.dispatch(
      CommonActions.navigate({
        name: 'QRStack',
        params: {
          screen: 'QRScan',
          params: { boxId: box.id }
        }
      })
    );
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
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar contenedor..."
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
        <TouchableOpacity 
          style={styles.filterButton} 
          onPress={() => setFilterModalVisible(true)}
        >
          <Text style={[styles.filterButtonText, isFiltered && styles.activeFilter]}>
            {isFiltered ? "Filtros activos" : "Filtrar"}
          </Text>
        </TouchableOpacity>
      </View>
      
      {isFiltered && (
        <View style={styles.activeFiltersContainer}>
          {selectedCategory && (
            <Chip 
              style={styles.filterChip} 
              onClose={() => setSelectedCategory(null)}
            >
              Categoría: {selectedCategory}
            </Chip>
          )}
          {selectedLocation && (
            <Chip 
              style={styles.filterChip} 
              onClose={() => setSelectedLocation(null)}
            >
              Ubicación: {selectedLocation}
            </Chip>
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

      <Portal>
        <Modal
          visible={filterModalVisible}
          onDismiss={() => setFilterModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Card style={styles.filterCard}>
            <Card.Title title="Filtrar contenedores" />
            <Card.Content>
              <Text style={styles.filterTitle}>Categoría</Text>
              <View style={styles.filterOptions}>
                {categories.map(category => (
                  <Chip
                    key={category}
                    selected={selectedCategory === category}
                    onPress={() => setSelectedCategory(selectedCategory === category ? null : category)}
                    style={styles.filterChip}
                    mode={selectedCategory === category ? "flat" : "outlined"}
                  >
                    {category}
                  </Chip>
                ))}
              </View>
              
              <Text style={styles.filterTitle}>Ubicación</Text>
              <View style={styles.filterOptions}>
                {locations.map(location => (
                  <Chip
                    key={location}
                    selected={selectedLocation === location}
                    onPress={() => setSelectedLocation(selectedLocation === location ? null : location)}
                    style={styles.filterChip}
                    mode={selectedLocation === location ? "flat" : "outlined"}
                  >
                    {location}
                  </Chip>
                ))}
              </View>
            </Card.Content>
            <Card.Actions>
              <Button onPress={resetFilters}>Restablecer</Button>
              <Button onPress={applyFilters} mode="contained">Aplicar</Button>
            </Card.Actions>
          </Card>
        </Modal>
      </Portal>

      <FAB.Group
        open={fabOpen}
        visible={true}
        icon={fabOpen ? 'close' : 'plus'}
        actions={[
          {
            icon: 'plus',
            label: 'Agregar contenedor',
            onPress: navigateToAddBox,
          },
        ]}
        onStateChange={({ open }: { open: boolean }) => setFabOpen(open)}
        fabStyle={styles.fab}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    marginRight: 8,
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
    paddingHorizontal: 8,
    paddingBottom: 8,
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
  modalContainer: {
    padding: 20,
  },
  filterCard: {
    padding: 10,
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