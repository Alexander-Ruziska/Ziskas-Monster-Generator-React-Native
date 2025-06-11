import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import AdminUserMonstersStyles from './AdminUserMonstersStyles';

const AdminUserMonsters = () => {
  const route = useRoute();
  const { userId } = route.params;

  const [monsters, setMonsters] = useState([]);
  const [username, setUsername] = useState('');

  useEffect(() => {
    async function fetchUserMonsters() {
      try {
        const response = await axios.get('/api/monster/admin');
        const userMonsters = response.data.filter(
          (monster) => Number(monster.user_id) === Number(userId)
        );
        setMonsters(userMonsters);
      } catch (error) {
        console.error('Error fetching user monsters:', error);
      }
    }

    async function fetchUsername() {
      try {
        const response = await axios.get(`/api/user/${userId}`);
        setUsername(response.data.username);
      } catch (error) {
        console.error('Error fetching username:', error);
      }
    }

    fetchUserMonsters();
    fetchUsername();
  }, [userId]);

  const handleDelete = async (monsterId) => {
    try {
      await axios.delete(`/api/monster/delete/${monsterId}`);
      setMonsters((prev) => prev.filter((monster) => monster.id !== monsterId));
    } catch (error) {
      console.error('Error deleting monster:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={AdminUserMonstersStyles.monstersContainer}>
      <Text style={AdminUserMonstersStyles.heading}>Monster List</Text>
      {monsters.length === 0 ? (
        <Text>No monsters found for this user.</Text>
      ) : (
        <View style={AdminUserMonstersStyles.tableWrapper}>
          {monsters.map((monster) => (
            <View key={monster.id} style={AdminUserMonstersStyles.tableRow}>
              <Text style={AdminUserMonstersStyles.cell}>ID: {monster.id}</Text>
              <Text style={AdminUserMonstersStyles.cell}>Name: {monster.name}</Text>
              <Text style={AdminUserMonstersStyles.cell}>Type: {monster.type}</Text>
              <Text style={AdminUserMonstersStyles.cell}>
                Created: {new Date(monster.created).toLocaleDateString()}
              </Text>
              <View style={AdminUserMonstersStyles.buttonWrapper}>
                <Button
                  title="Delete"
                  color="red"
                  onPress={() => handleDelete(monster.id)}
                />
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default AdminUserMonsters;
