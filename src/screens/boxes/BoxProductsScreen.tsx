// filepath: /Users/henrycruzmulet/work/personal/boxQR/src/screens/boxes/BoxProductsScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { BoxesStackParamList } from '../../types/navigation';
import { Product } from '../../types/product';
import { ProductsService } from '../../services/database/productsService';
import { BoxesService } from '../../services/database/boxesService';
import { Box } from '../../components/boxes/BoxCard';

type BoxProductsRouteProp = RouteProp<BoxesStackParamList, 'BoxProducts'>;
type BoxProductsNavigationProp = NativeStackNavigationProp<BoxesStackParamList, 'BoxProducts'>;

// Componente para mostrar un producto individual
const ProductItem = ({ product, onPress, onDelete }: { 
  product: Product; 
  onPress: () => void;
  onDelete: () => void;
}) => {
  // Obtener la foto principal o usar un placeholder
  const mainPhoto = product.photos?.find(photo => photo.isPrimary) || product.photos?.[0];
  
  return (
    <TouchableOpacity style={styles.productCard} onPress={onPress}>
      <View style={styles.productImageContainer}>
        {mainPhoto ? (
          <Image 
            source={{ uri: mainPhoto.photoUri }} 
            style={styles.productImage} 
            resizeMode="cover" 
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={40} color="#cccccc" />
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
        {product.description && (
          <Text style={styles.productDescription} numberOfLines={2}>
            {product.description}
          </Text>
        )}
        <View style={styles.productQuantity}>
          <Text>Cantidad: </Text>
          <Text style={styles.quantityText}>{product.quantity}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Ionicons name="trash-outline" size={22} color="#FF3B30" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const BoxProductsScreen = () => {
  const route = useRoute<BoxProductsRouteProp>();
  const navigation = useNavigation<BoxProductsNavigationProp>();
  const { boxId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [box, setBox] = useState<Box | null>(null);
  
  const productsService = ProductsService.getInstance();
  const boxesService = BoxesService.getInstance();

  // Cargar productos al iniciar y cuando cambie el boxId
  useEffect(() => {
    const initializeServicesAndLoadData = async () => {
      try {
        setLoading(true);
        // Primero inicializamos los servicios para asegurar que las tablas existan
        await boxesService.initialize();
        await productsService.initialize();
        
        // Luego cargamos los datos
        await loadBoxDetails();
        await loadProducts();
      } catch (error) {
        console.error('Error al inicializar servicios:', error);
        Alert.alert('Error', 'No se pudieron inicializar los servicios de la aplicación');
      } finally {
        setLoading(false);
      }
    };
    
    initializeServicesAndLoadData();
  }, [boxId]);

  // Cargar detalles del contenedor
  const loadBoxDetails = async () => {
    try {
      const boxDetails = await boxesService.getBoxById(boxId);
      setBox(boxDetails);
    } catch (error) {
      console.error('Error al cargar detalles del contenedor:', error);
    }
  };

  // Cargar productos del contenedor
  const loadProducts = async () => {
    try {
      const productsList = await productsService.getProductsByBoxId(boxId);
      setProducts(productsList);
    } catch (error) {
      console.error('Error al cargar los productos:', error);
      Alert.alert('Error', 'No se pudieron cargar los productos');
    }
  };

  // Refrescar la lista
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  // Navegar a la pantalla de detalle de producto
  const navigateToProductDetail = (productId: string) => {
    // Esta función se implementará cuando creemos la pantalla de detalle
    Alert.alert('Info', 'La pantalla de detalle de producto se implementará próximamente');
  };

  // Navegar a la pantalla para agregar un nuevo producto
  const navigateToAddProduct = () => {
    // Esta función se implementará cuando creemos la pantalla de agregar producto
    Alert.alert('Info', 'La pantalla para agregar productos se implementará próximamente');
  };

  // Eliminar un producto
  const handleDeleteProduct = (productId: string, productName: string) => {
    Alert.alert(
      'Eliminar Producto',
      `¿Estás seguro de que quieres eliminar "${productName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              await productsService.deleteProduct(productId);
              setProducts(products.filter(p => p.id !== productId));
              // Refrescar los detalles del contenedor para actualizar el contador
              loadBoxDetails();
            } catch (error) {
              console.error('Error al eliminar el producto:', error);
              Alert.alert('Error', 'No se pudo eliminar el producto');
            }
          }
        }
      ]
    );
  };

  // Renderizar mensaje cuando no hay productos
  const EmptyProductsList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cube-outline" size={64} color="#cccccc" />
      <Text style={styles.emptyText}>No hay productos en este contenedor</Text>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={navigateToAddProduct}
      >
        <Text style={styles.addButtonText}>Agregar Producto</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Encabezado con información del contenedor */}
      {box && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Productos de {box.name}</Text>
          <View style={styles.headerStats}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Total:</Text>
              <Text style={styles.statValue}>{products.length}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Ubicación:</Text>
              <Text style={styles.statValue}>{box.location || 'No especificada'}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Lista de productos */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Cargando productos...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductItem 
              product={item} 
              onPress={() => navigateToProductDetail(item.id)}
              onDelete={() => handleDeleteProduct(item.id, item.name)}
            />
          )}
          ListEmptyComponent={EmptyProductsList}
          contentContainerStyle={styles.productsList}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh} 
            />
          }
        />
      )}

      {/* Botón flotante para agregar productos */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={navigateToAddProduct}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  productsList: {
    padding: 10,
    paddingBottom: 80, // Espacio para el FAB
    flexGrow: 1,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  productQuantity: {
    flexDirection: 'row',
    marginTop: 4,
  },
  quantityText: {
    fontWeight: '600',
  },
  deleteButton: {
    justifyContent: 'center',
    paddingLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 24,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default BoxProductsScreen;