import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('books.db');

const BookListScreen = () => {
  const [books, setBooks] = useState([]);
  const navigation = useNavigation();
  const isFocused = useIsFocused(); // Hook that returns true if the screen is focused, false otherwise

  useEffect(() => {
    if (isFocused) {
      fetchBooks();
    }
  }, [isFocused]);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS books (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, rating INTEGER);'
      );
    });
    fetchBooks();
  }, []);

  const fetchBooks = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM books',
        [],
        (_, { rows: { _array } }) => {
          setBooks(_array);
        },
        (_, error) => {
          console.log('Error fetching books:', error);
        }
      );
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.bookItem}
      onPress={() => navigation.navigate('BookDetail', { bookId: item.id })}
    >
      <Text style={styles.bookTitle}>{item.title}</Text>
      <Text style={styles.bookRating}>{item.rating}/10</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  bookItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  bookTitle: {
    fontSize: 18,
  },
  bookRating: {
    fontSize: 18,
    color: '#888',
  },
});

export default BookListScreen;