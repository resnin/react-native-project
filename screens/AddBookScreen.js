import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text, StyleSheet, Modal, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import debounce from 'lodash/debounce';
import * as SQLite from 'expo-sqlite';
import { Picker } from '@react-native-picker/picker';

const db = SQLite.openDatabase('books.db');

const AddBookScreen = () => {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [rating, setRating] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    const debouncedSearch = debounce(handleSearch, 300);
    debouncedSearch(query);
    return () => {
      debouncedSearch.cancel();
    };
  }, [query]);

  const handleSearch = async (searchQuery) => {
    if (searchQuery.length > 2) {
      try {
        const response = await axios.get(
          `https://www.googleapis.com/books/v1/volumes?q=${searchQuery}&langRestrict=ru`
        );
        setBooks(response.data.items || []);
      } catch (error) {
        console.log('Error fetching books:', error);
      }
    } else {
      setBooks([]);
    }
  };

  const openModal = (book) => {
    setSelectedBook(book);
    setModalVisible(true);
  };

  const addBookToDatabase = () => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO books (title, rating) VALUES (?, ?)',
        [selectedBook.volumeInfo.title, rating],
        (_, { insertId }) => {
          console.log(`Book added with ID: ${insertId}`);
          setModalVisible(false);
          navigation.navigate('BookList');
        },
        (_, error) => {
          console.log('Error adding book:', error);
        }
      );
    });
  };

  const renderItem = ({ item }) => {
    const title = item.volumeInfo.title || 'No Title';
    return (
      <TouchableOpacity
        style={styles.bookItem}
        onPress={() => openModal(item)}
      >
        <Text style={styles.bookTitle}>{title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Поиск книги..."
        value={query}
        onChangeText={setQuery}
      />
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />

      {selectedBook && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Оцените книгу</Text>
              <Text style={styles.modalBookTitle}>{selectedBook.volumeInfo.title}</Text>
              <Picker
                selectedValue={rating}
                style={styles.picker}
                onValueChange={(itemValue) => setRating(itemValue)}
              >
                {[...Array(11).keys()].map((value) => (
                  <Picker.Item key={value} label={`${value}`} value={value} />
                ))}
              </Picker>
              <View style={styles.buttonContainer}>
                <Button title="Сохранить" onPress={addBookToDatabase} />
                <Button title="Отмена" color="red" onPress={() => setModalVisible(false)} />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  bookItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  bookTitle: {
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalBookTitle: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  picker: {
    width: '100%',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default AddBookScreen;