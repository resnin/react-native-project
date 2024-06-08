import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BookListScreen from './screens/BookListScreen';
import BookDetailScreen from './screens/BookDetailScreen';
import AddBookScreen from './screens/AddBookScreen';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const BookListStack = () => (
  <Stack.Navigator  screenOptions={{ headerShown: false }}>
    <Stack.Screen name="BookList" component={BookListScreen} options={{ title: 'Прочитанные книги' }} />
    <Stack.Screen name="BookDetail" component={BookDetailScreen} options={{ title: 'Детали книги' }} />
  </Stack.Navigator>
);

const AddBookStack = () => (
  <Stack.Navigator  screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AddBook" component={AddBookScreen} options={{ title: 'Добавить книгу' }} />
  </Stack.Navigator>
);

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'BookListTab') {
              iconName = 'book';
            } else if (route.name === 'AddBookTab') {
              iconName = 'search';
            }

            return <FontAwesome name={iconName} size={size} color={color} />;
          },
        })}
        tabBarOptions={{
          activeTintColor: 'tomato',
          inactiveTintColor: 'gray',
        }}
      >
        <Tab.Screen name="BookListTab" component={BookListStack} options={{ title: 'Список книг' }} />
        <Tab.Screen name="AddBookTab" component={AddBookStack} options={{ title: 'Добавить книгу' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
