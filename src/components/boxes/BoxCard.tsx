import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Definimos la interfaz para las propiedades del contenedor
export interface Box {
  id: string;
  name: string;
  itemCount: number;
  description?: string;
  location?: string;
  category?: string;
}

interface BoxCardProps {
  box: Box;
  onPress?: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (box: Box) => void;
  onGenerateQR?: (id: string) => void;
}

const BoxCard: React.FC<BoxCardProps> = ({ box, onDelete, onEdit, onGenerateQR, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.cardContent}>
        <Text style={styles.name}>{box.name}</Text>
        <Text style={styles.id}>ID: {box.id}</Text>
        <Text style={styles.itemCount}>Contiene {box.itemCount} {box.itemCount === 1 ? 'item' : 'items'}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onEdit && onEdit(box)}
        >
          <Ionicons name="pencil" size={20} color="#007AFF" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onGenerateQR && onGenerateQR(box.id)}
        >
          <Ionicons name="qr-code" size={20} color="#28CD41" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onDelete && onDelete(box.id)}
        >
          <Ionicons name="trash" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  cardContent: {
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  id: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  actionButton: {
    marginLeft: 16,
    padding: 4,
  },
});

export default BoxCard;