import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { RouteProp, useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { BoxesStackParamList, QRStackParamList } from '../../types/navigation';
import { Box } from '../../components/boxes/BoxCard';
import { BoxesService } from '../../services/database/boxesService';

// Tipo para las rutas que pueden acceder a esta pantalla
type BoxDetailScreenRouteProp = 
  | RouteProp<BoxesStackParamList, 'BoxDetail'>
  | RouteProp<QRStackParamList, 'BoxDetail'>;

// Ampliamos el tipo para incluir el parámetro opcional updatedBox
type BoxDetailParams = {
  boxId: string;
  updatedBox?: Box;
};

// Tipo para la navegación, que ahora puede provenir de cualquiera de los dos stacks
type BoxDetailScreenNavigationProp = 
  | NativeStackNavigationProp<BoxesStackParamList, 'BoxDetail'>
  | NativeStackNavigationProp<QRStackParamList, 'BoxDetail'>;

const BoxDetailScreen = () => {
  const route = useRoute<BoxDetailScreenRouteProp>();
  const navigation = useNavigation<BoxDetailScreenNavigationProp>();
  const [box, setBox] = useState<Box | null>(null);
  const [loading, setLoading] = useState(true);

  // Obtener el ID y el objeto actualizado (si existe) de los parámetros de ruta
  const { boxId, updatedBox } = route.params as BoxDetailParams;
  const boxesService = BoxesService.getInstance();

  // Función auxiliar para determinar en qué stack nos encontramos
  const isInBoxesStack = () => {
    return 'EditBox' in (navigation.getParent()?.getState()?.routeNames ?? []);
  };

  // Función segura para navegar hacia atrás
  const safeGoBack = () => {
    navigation.dispatch(CommonActions.goBack());
  };

  useEffect(() => {
    // Si tenemos un objeto actualizado, lo usamos directamente
    if (updatedBox) {
      setBox(updatedBox);
      setLoading(false);
      return;
    }

    // Carga el contenedor desde la base de datos
    const loadBoxDetails = async () => {
      try {
        setLoading(true);
        const foundBox = await boxesService.getBoxById(boxId);
        
        if (foundBox) {
          setBox(foundBox);
        }
      } catch (error) {
        console.error('Error al cargar el detalle del contenedor:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBoxDetails();
  }, [boxId, updatedBox]);

  // Manejar la navegación a la pantalla de edición
  const handleEdit = () => {
    if (box) {
      // Determinar el stack de navegación por las rutas disponibles
      if (isInBoxesStack()) {
        // Estamos en BoxesStack
        const boxesNavigation = navigation as NativeStackNavigationProp<BoxesStackParamList>;
        boxesNavigation.navigate('EditBox', { box });
      } else {
        // Si estamos en QRStack, necesitamos navegar diferente o mostrar un mensaje
        console.log('La edición no está disponible desde el escáner QR');
        alert('Para editar este contenedor, accede desde la sección de Contenedores');
      }
    }
  };

  // Manejar la navegación a la pantalla de productos
  const handleViewProducts = () => {
    if (box) {
      // La pantalla BoxProducts existe en ambos stacks, así que podemos
      // navegar usando CommonActions que funciona en ambos casos
      navigation.dispatch(
        CommonActions.navigate({
          name: 'BoxProducts',
          params: { boxId: box.id }
        })
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando información del contenedor...</Text>
      </View>
    );
  }

  if (!box) {
    return (
      <View style={styles.notFoundContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
        <Text style={styles.notFoundTitle}>Contenedor no encontrado</Text>
        <Text style={styles.notFoundText}>
          No se encontró ningún contenedor con el ID: {boxId}
        </Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={safeGoBack}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="cube" size={72} color="#007AFF" />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{box.name}</Text>
          <Text style={styles.id}>ID: {box.id}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Detalles del Contenedor</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cantidad de items:</Text>
          <Text style={styles.infoValue}>{box.itemCount}</Text>
        </View>
        {box.category && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Categoría:</Text>
            <Text style={styles.infoValue}>{box.category}</Text>
          </View>
        )}
        {box.location && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ubicación:</Text>
            <Text style={styles.infoValue}>{box.location}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Estado:</Text>
          <Text style={[styles.infoValue, styles.statusActive]}>Activo</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Última actualización:</Text>
          <Text style={styles.infoValue}>
            {new Date().toLocaleDateString('es-ES')}
          </Text>
        </View>
      </View>

      {box.description && (
        <View style={styles.descriptionCard}>
          <Text style={styles.infoTitle}>Descripción</Text>
          <Text style={styles.descriptionText}>{box.description}</Text>
        </View>
      )}

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleViewProducts}>
          <Ionicons name="list" size={28} color="#007AFF" />
          <Text style={styles.actionText}>Ver Items</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
          <Ionicons name="pencil" size={28} color="#007AFF" />
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="qr-code" size={28} color="#007AFF" />
          <Text style={styles.actionText}>Ver QR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  notFoundText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerInfo: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  id: {
    fontSize: 16,
    color: '#666',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusActive: {
    color: '#28CD41',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    marginTop: 8,
    color: '#007AFF',
    fontSize: 14,
  },
  descriptionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
  },
});

export default BoxDetailScreen;