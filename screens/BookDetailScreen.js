import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, Button, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import * as SQLite from 'expo-sqlite';
import { Picker } from '@react-native-picker/picker';

const db = SQLite.openDatabase('books.db');

const BookDetailScreen = ({ route }) => {
  const { bookId } = route.params;
  const [bookDetails, setBookDetails] = useState(null);
  const [rating, setRating] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const [bookRating, setBookRating] = useState(null)

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM books WHERE id = ?',
        [bookId],
        (_, { rows: { _array } }) => {
          const book = _array[0];
          fetchBookDetails(book.title);
          setBookRating(book.rating)
        },
        (_, error) => {
          console.log('Error fetching book:', error);
        }
      );
    });
  }, [bookId]);

  const fetchBookDetails = async (title) => {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=intitle:${title}&langRestrict=ru`
      );
      if (response.data.items.length > 0) {
        setBookDetails(response.data.items[0].volumeInfo);
      }
    } catch (error) {
      console.log('Error fetching book details:', error);
    }
  };

  const updateRating = () => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE books SET rating = ? WHERE id = ?',
        [rating, bookId],
        () => {
          setModalVisible(false);
          Alert.alert('Оценка обновлена');
        },
        (_, error) => {
          console.log('Error updating rating:', error);
        }
      );
    });
  };

  const deleteBook = () => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM books WHERE id = ?',
        [bookId],
        () => {
          navigation.navigate('BookList');
        },
        (_, error) => {
          console.log('Error deleting book:', error);
        }
      );
    });
  };

  return (
    <View style={styles.container}>
      {bookDetails ? (
        <>
          <Text style={styles.title}>{bookDetails.title}</Text>
          <Text style={styles.author}>by {bookDetails?.authors?.join(', ')}</Text>
          <Text style={styles.description}>{bookDetails.description}</Text>
          <Text style={styles.rating}>Оценка: {bookRating}/10</Text>
          <Button title="Изменить оценку" onPress={() => setModalVisible(true)} />
          <Button title="Удалить книгу" color="red" onPress={deleteBook} />

          <Modal
            transparent={true}
            animationType="slide"
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalView}>
                <Text style={styles.modalTitle}>Изменить оценку</Text>
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
                  <Button title="Сохранить" onPress={updateRating} />
                  <Button title="Отмена" color="red" onPress={() => setModalVisible(false)} />
                </View>
              </View>
            </View>
          </Modal>
        </>
      ) : (
        <Text>Loading...</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  rating: {
    fontSize: 18,
    marginBottom: 20,
    marginTop: 20
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

export default BookDetailScreen;