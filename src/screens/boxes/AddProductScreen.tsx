import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { BoxesStackParamList } from '../../types/navigation';
import { Product, ProductPhoto } from '../../types/product';
import { ProductsService } from '../../services/database/productsService';
import { BoxesService } from '../../services/database/boxesService';
import { v4 as uuidv4 } from 'uuid';

type AddProductRouteProp = RouteProp<BoxesStackParamList, 'AddProduct'>;
type AddProductNavigationProp = NativeStackNavigationProp<BoxesStackParamList, 'BoxProducts'>;

const AddProductScreen = () => {
  const route = useRoute<AddProductRouteProp>();
  const navigation = useNavigation<AddProductNavigationProp>();
  const { boxId } = route.params;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('1'); // Mantenemos como string para el TextInput
  const [photos, setPhotos] = useState<ProductPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [boxName, setBoxName] = useState<string>('');
  
  const productsService = ProductsService.getInstance();
  const boxesService = BoxesService.getInstance();
  
  // Cargar el nombre del contenedor al iniciar
  useEffect(() => {
    const loadBoxDetails = async () => {
      try {
        const box = await boxesService.getBoxById(boxId);
        if (box) {
          setBoxName(box.name);
        }
      } catch (error) {
        console.error('Error al cargar detalles del contenedor:', error);
      }
    };
    
    loadBoxDetails();
  }, [boxId]);
  
  // Función para solicitar permisos de cámara
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permiso denegado',
        'Necesitamos permisos para acceder a tu cámara.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };
  
  // Función para solicitar permisos de galería
  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permiso denegado',
        'Necesitamos permisos para acceder a tu galería de fotos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };
  
  // Función para tomar una foto con la cámara
  const takePhoto = async () => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) return;
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        const uri = selectedAsset.uri;
        
        // Crear un nuevo objeto PhotoProduct con la ruta de la imagen
        const newPhoto: ProductPhoto = {
          id: uuidv4(),
          productId: '', // Se asignará cuando se guarde el producto
          photoUri: uri,
          isPrimary: photos.length === 0, // La primera foto es la principal
        };
        
        setPhotos([...photos, newPhoto]);
      }
    } catch (error) {
      console.error('Error al tomar la foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };
  
  // Función para seleccionar una imagen de la galería
  const pickImage = async () => {
    try {
      const hasPermission = await requestGalleryPermission();
      if (!hasPermission) return;
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedAsset = result.assets[0];
        const uri = selectedAsset.uri;
        
        // Crear un nuevo objeto PhotoProduct con la ruta de la imagen
        const newPhoto: ProductPhoto = {
          id: uuidv4(),
          productId: '', // Se asignará cuando se guarde el producto
          photoUri: uri,
          isPrimary: photos.length === 0, // La primera foto es la principal
        };
        
        setPhotos([...photos, newPhoto]);
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };
  
  // Mostrar opciones para seleccionar imagen
  const showImageOptions = () => {
    Alert.alert(
      'Añadir imagen',
      'Selecciona una opción',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Tomar foto', onPress: takePhoto },
        { text: 'Seleccionar de la galería', onPress: pickImage },
      ]
    );
  };
  
  // Función para eliminar una foto
  const removePhoto = (photoId: string) => {
    const updatedPhotos = photos.filter(photo => photo.id !== photoId);
    
    // Si eliminamos la foto principal y quedan fotos, hacer la primera como principal
    if (photos.find(photo => photo.id === photoId)?.isPrimary && updatedPhotos.length > 0) {
      updatedPhotos[0].isPrimary = true;
    }
    
    setPhotos(updatedPhotos);
  };
  
  // Función para marcar una foto como principal
  const setAsPrimary = (photoId: string) => {
    const updatedPhotos = photos.map(photo => ({
      ...photo,
      isPrimary: photo.id === photoId
    }));
    
    setPhotos(updatedPhotos);
  };
  
  // Función para guardar el producto
  const saveProduct = async () => {
    // Validaciones
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre del producto es obligatorio');
      return;
    }
    
    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      Alert.alert('Error', 'La cantidad debe ser un número mayor que cero');
      return;
    }
    
    setLoading(true);
    
    try {
      // Crear el objeto producto
      const newProduct: Product = {
        id: uuidv4(),
        boxId,
        name: name.trim(),
        description: description.trim() || undefined,
        quantity: quantityNum,
        photos: photos.map(photo => ({
          ...photo,
          productId: '' // Dejamos vacío para que el servicio lo asigne correctamente
        }))
      };
      
      // Guardar el producto
      await productsService.addProduct(newProduct);
      
      // Navegar de regreso a la pantalla de productos
      Alert.alert(
        'Éxito',
        'Producto añadido correctamente',
        [{ 
          text: 'OK', 
          onPress: () => navigation.navigate('BoxProducts', { boxId }) 
        }]
      );
    } catch (error) {
      console.error('Error al guardar el producto:', error);
      Alert.alert('Error', 'No se pudo guardar el producto');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView style={styles.container}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Añadir producto a {boxName || 'contenedor'}
          </Text>
        </View>
        
        {/* Formulario */}
        <View style={styles.formContainer}>
          {/* Nombre */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nombre del producto *</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Ingrese el nombre del producto"
              maxLength={100}
            />
          </View>
          
          {/* Descripción */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Descripción (opcional)</Text>
            <TextInput
              style={[styles.textInput, styles.textAreaInput]}
              value={description}
              onChangeText={setDescription}
              placeholder="Ingrese una descripción del producto"
              multiline={true}
              numberOfLines={4}
              maxLength={500}
            />
          </View>
          
          {/* Cantidad */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Cantidad *</Text>
            <TextInput
              style={[styles.textInput, styles.quantityInput]}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="1"
              keyboardType="number-pad"
              maxLength={5}
            />
          </View>
          
          {/* Fotos */}
          <View style={styles.photosContainer}>
            <Text style={styles.inputLabel}>Fotos (opcional)</Text>
            <TouchableOpacity style={styles.addPhotoButton} onPress={showImageOptions}>
              <Ionicons name="camera" size={24} color="white" />
              <Text style={styles.addPhotoText}>Añadir foto</Text>
            </TouchableOpacity>
            
            {/* Vista previa de las fotos */}
            {photos.length > 0 && (
              <View style={styles.photoPreviewList}>
                {photos.map((photo) => (
                  <View key={photo.id} style={styles.photoPreviewContainer}>
                    <Image 
                      source={{ uri: photo.photoUri }} 
                      style={styles.photoPreview}
                    />
                    <View style={styles.photoActionsContainer}>
                      <TouchableOpacity 
                        style={[
                          styles.photoActionButton, 
                          photo.isPrimary && styles.primaryPhotoButton
                        ]}
                        onPress={() => setAsPrimary(photo.id)}
                        disabled={photo.isPrimary}
                      >
                        <Ionicons 
                          name={photo.isPrimary ? "star" : "star-outline"} 
                          size={18} 
                          color={photo.isPrimary ? "#FFD700" : "#007AFF"} 
                        />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.photoActionButton}
                        onPress={() => removePhoto(photo.id)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
        
        {/* Botones de acción */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={saveProduct}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Guardar</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  },
  formContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  textInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textAreaInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  quantityInput: {
    width: '30%',
  },
  photosContainer: {
    marginTop: 8,
  },
  addPhotoButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  addPhotoText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
    marginLeft: 8,
  },
  photoPreviewList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  photoPreviewContainer: {
    width: '48%',
    marginBottom: 16,
    marginRight: '4%',
  },
  photoPreview: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  photoActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  photoActionButton: {
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  primaryPhotoButton: {
    backgroundColor: '#FFF8E0',
    borderColor: '#FFD700',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    padding: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
});

export default AddProductScreen;