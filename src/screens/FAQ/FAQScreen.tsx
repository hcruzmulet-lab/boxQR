import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const FAQScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Preguntas Frecuentes</Text>
        
        <View style={styles.faqItem}>
          <Text style={styles.question}>¿Cómo escaneo un código QR?</Text>
          <Text style={styles.answer}>
            Para escanear un código QR, ve a la pestaña de QR y enfoca el código con la cámara.
          </Text>
        </View>
        
        <View style={styles.faqItem}>
          <Text style={styles.question}>¿Cómo agrego un nuevo contenedor?</Text>
          <Text style={styles.answer}>
            Ve a la sección de Contenedores y presiona el botón "+" para agregar un nuevo contenedor.
          </Text>
        </View>
        
        <View style={styles.faqItem}>
          <Text style={styles.question}>¿Puedo exportar mi inventario?</Text>
          <Text style={styles.answer}>
            Esta funcionalidad estará disponible próximamente.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
  faqItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  answer: {
    fontSize: 16,
    color: '#444',
  },
});

export default FAQScreen;