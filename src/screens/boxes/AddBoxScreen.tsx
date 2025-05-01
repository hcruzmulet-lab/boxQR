import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Box } from '../../components/boxes/BoxCard';
import { BoxesStackParamList } from '../../types/navigation';

// Definiendo el tipo de navegación para esta pantalla
type AddBoxScreenNavigationProp = NativeStackNavigationProp<BoxesStackParamList, 'AddBox'>;

// Función para generar un ID aleatorio con formato BOX + 3 dígitos
const generateBoxId = () => {
  const randomNum = Math.floor(Math.random() * 900) + 100; // Genera un número entre 100 y 999
  return `BOX${randomNum}`;
};

const AddBoxScreen = () => {
  const navigation = useNavigation<AddBoxScreenNavigationProp>();
  const [boxName, setBoxName] = useState('');
  const [boxId, setBoxId] = useState('');

  // Generar un ID aleatorio al cargar la pantalla
  useEffect(() => {
    setBoxId(generateBoxId());
  }, []);

  const handleSave = () => {
    if (!boxName.trim()) {
      Alert.alert(
        "Campo requerido", 
        "Por favor ingresa un nombre para el contenedor"
      );
      return;
    }

    // Crear el nuevo objeto de contenedor
    const newBox: Box = {
      id: boxId,
      name: boxName,
      itemCount: 0 // Inicialmente el contenedor está vacío
    };

    // Volver a la pantalla anterior y pasar el nuevo contenedor
    navigation.navigate('Contenedores', { newBox });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Nuevo Contenedor</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>ID del Contenedor</Text>
          <View style={styles.idContainer}>
            <Text style={styles.idText}>{boxId}</Text>
            <Text style={styles.idHelp}>Generado automáticamente</Text>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nombre del Contenedor</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa el nombre del contenedor"
            value={boxName}
            onChangeText={setBoxName}
            autoCapitalize="words"
            maxLength={30}
          />
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.saveButton]} 
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Guardar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  idContainer: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  idText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  idHelp: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    marginLeft: 10,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default AddBoxScreen;