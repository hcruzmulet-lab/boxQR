import { Box } from "../components/boxes/BoxCard";
import { NavigatorScreenParams } from "@react-navigation/native";

export type RootTabParamList = {
  ContenedoresStack: NavigatorScreenParams<BoxesStackParamList>;
  QRStack: NavigatorScreenParams<QRStackParamList>;
  FAQ: undefined;
};

export type BoxesStackParamList = {
  Contenedores: { newBox?: Box };
  AddBox: undefined;
  BoxDetail: { boxId: string; updatedBox?: Box };
  EditBox: { box: Box };
  BoxProducts: { boxId: string }; // Pantalla de productos
  AddProduct: { boxId: string }; // Nueva ruta para añadir productos
};

export type QRStackParamList = {
  QRScan: undefined;
  BoxDetail: { boxId: string; updatedBox?: Box };
  BoxProducts: { boxId: string }; // Añadido para permitir navegación desde QR a productos
};