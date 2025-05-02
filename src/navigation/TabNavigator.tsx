import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importación de pantallas
import { BoxesScreen } from '../screens/boxes/BoxesScreen';
import AddBoxScreen from '../screens/boxes/AddBoxScreen';
import BoxDetailScreen from '../screens/boxes/BoxDetailScreen';
import EditBoxScreen from '../screens/boxes/EditBoxScreen';
import BoxProductsScreen from '../screens/boxes/BoxProductsScreen';
import AddProductScreen from '../screens/boxes/AddProductScreen';
import QRScreen from '../screens/qr/QRScreen';
import FAQScreen from '../screens/FAQ/FAQScreen';

// Importación de tipos
import { RootTabParamList, BoxesStackParamList, QRStackParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<RootTabParamList>();
const BoxesStack = createNativeStackNavigator<BoxesStackParamList>();
const QRStack = createNativeStackNavigator<QRStackParamList>();

// Stack Navigator para la sección de contenedores
const BoxesStackNavigator = () => {
  return (
    <BoxesStack.Navigator>
      <BoxesStack.Screen 
        name="Contenedores" 
        component={BoxesScreen}
        options={{ 
          title: "Contenedores",
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#FFFFFF',
        }}
      />
      <BoxesStack.Screen 
        name="AddBox" 
        component={AddBoxScreen}
        options={{ 
          title: "Nuevo Contenedor",
          headerBackTitle: "",
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#FFFFFF',
        }}
      />
      <BoxesStack.Screen 
        name="BoxDetail" 
        component={BoxDetailScreen}
        options={{ 
          title: "Detalle del Contenedor",
          headerBackTitle: "",
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#FFFFFF',
        }}
      />
      <BoxesStack.Screen 
        name="EditBox" 
        component={EditBoxScreen}
        options={{ 
          title: "Editar Contenedor",
          headerBackTitle: "",
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#FFFFFF',
        }}
      />
      <BoxesStack.Screen 
        name="BoxProducts" 
        component={BoxProductsScreen}
        options={{ 
          title: "Productos del Contenedor",
          headerBackTitle: "",
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#FFFFFF',
        }}
      />
      <BoxesStack.Screen 
        name="AddProduct" 
        component={AddProductScreen}
        options={{ 
          title: "Añadir Producto",
          headerBackTitle: "",
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#FFFFFF',
        }}
      />
    </BoxesStack.Navigator>
  );
};

// Stack Navigator para la sección de QR
const QRStackNavigator = () => {
  return (
    <QRStack.Navigator>
      <QRStack.Screen 
        name="QRScan" 
        component={QRScreen}
        options={{ 
          headerTitle: "Escaneo QR",
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#FFFFFF',
        }}
      />
      <QRStack.Screen 
        name="BoxDetail" 
        component={BoxDetailScreen}
        options={{ 
          title: "Detalle del Contenedor",
          headerBackTitle: "",
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#FFFFFF',
        }}
      />
    </QRStack.Navigator>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e0e0e0',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="ContenedoresStack" 
        component={BoxesStackNavigator} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube-outline" size={size} color={color} />
          ),
          tabBarLabel: "Contenedores"
        }}
      />
      <Tab.Screen 
        name="QRStack" 
        component={QRStackNavigator} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="qr-code-outline" size={size} color={color} />
          ),
          tabBarLabel: "Escanear QR",
        }}
      />
      <Tab.Screen 
        name="FAQ" 
        component={FAQScreen} 
        options={{
          headerTitle: "Preguntas Frecuentes",
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#FFFFFF',
          headerShown: true,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="help-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;