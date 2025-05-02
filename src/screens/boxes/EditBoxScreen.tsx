import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { BoxesStackParamList } from '../../types/navigation';
import { Box } from '../../components/boxes/BoxCard';
import { BoxesService } from '../../services/database/boxesService';

type EditBoxRouteProp = RouteProp<BoxesStackParamList, 'EditBox'>;
type EditBoxNavigationProp = NativeStackNavigationProp<BoxesStackParamList, 'EditBox'>;

const EditBoxScreen = () => {
  const route = useRoute<EditBoxRouteProp>();
  const navigation = useNavigation<EditBoxNavigationProp>();
  const { box } = route.params;
  const boxesService = BoxesService.getInstance();
  const [isSaving, setIsSaving] = useState(false);
  
  // Estado para los campos editables
  const [name, setName] = useState<string>(box.name);
  const [description, setDescription] = useState<string>(box.description || '');
  const [location, setLocation] = useState<string>(box.location || '');
  const [category, setCategory] = useState<string>(box.category || '');

  // Validar los datos antes de guardar
  const validateData = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre del contenedor no puede estar vacío');
      return false;
    }
    return true;
  };

  // Manejar la acción de guardar cambios
  const handleSave = async () => {
    if (!validateData()) return;
    
    try {
      setIsSaving(true);
      
      // Crear el objeto actualizado con los nuevos valores
      const updatedBox: Box = {
        ...box,
        name: name.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        category: category.trim() || undefined
      };
      
      // Guardar en la base de datos
      await boxesService.updateBox(updatedBox);
      
      // Navegar de vuelta a la pantalla de detalles con el objeto actualizado
      navigation.navigate('BoxDetail', { 
        boxId: box.id,
        updatedBox // Pasar el objeto actualizado para evitar otra consulta a la BD
      });
    } catch (error) {
      console.error('Error al actualizar el contenedor:', error);
      Alert.alert('Error', 'No se pudo actualizar el contenedor');
    } finally {
      setIsSaving(false);
    }
  };

  // Cancelar la edición
  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="pencil" size={32} color="#007AFF" />
        <Text style={styles.headerTitle}>Editar Contenedor</Text>
      </View>
      
      {/* ID (no editable) */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>ID</Text>
        <View style={[styles.input, styles.disabledInput]}>
          <Text style={styles.disabledText}>{box.id}</Text>
        </View>
        <Text style={styles.helperText}>El ID del contenedor no puede ser modificado</Text>
      </View>

      {/* Nombre */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nombre *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Nombre del contenedor"
        />
      </View>

      {/* Descripción */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Descripción del contenedor"
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Cantidad de items (no editable) */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Cantidad de items</Text>
        <View style={[styles.input, styles.disabledInput]}>
          <Text style={styles.disabledText}>{box.itemCount}</Text>
        </View>
        <Text style={styles.helperText}>
          La cantidad de items se actualiza automáticamente al añadir o quitar items del contenedor
        </Text>
      </View>

      {/* Ubicación */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Ubicación</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Ubicación del contenedor"
        />
      </View>

      {/* Categoría */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Categoría</Text>
        <TextInput
          style={styles.input}
          value={category}
          onChangeText={setCategory}
          placeholder="Categoría del contenedor"
        />
      </View>

      {/* Botones de Acción */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]} 
          onPress={handleCancel}
          disabled={isSaving}
        >
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.saveButton, isSaving && styles.disabledButton]} 
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Guardar</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  disabledInput: {
    backgroundColor: '#F0F0F0',
  },
  disabledText: {
    color: '#777',
  },
  helperText: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    marginBottom: 40,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: '45%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#D1D1D6',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
});

export default EditBoxScreen;