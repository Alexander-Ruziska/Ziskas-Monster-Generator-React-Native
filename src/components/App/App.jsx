import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import useStore from './zustand/store';

import HomePage from './screens/HomePage';
import LoginPage from './screens/LoginPage';
import RegisterPage from './screens/RegisterPage';
import Library from './screens/Library';
import GenerateMonster from './screens/GenerateMonster';
import MonsterView from './screens/MonsterView';
import Landing from './screens/Landing';
import AdminUsers from './screens/Admin/AdminUsers';
import AdminUserMonsters from './screens/Admin/AdminUserMonsters';
import AboutPage from './screens/AboutPage'; // Optional — create if needed

const Stack = createNativeStackNavigator();

export default function App() {
  const user = useStore((state) => state.user);
  const fetchUser = useStore((state) => state.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user?.id ? 'Landing' : 'Login'}>
        {!user?.id ? (
          <>
            <Stack.Screen name="Login" component={LoginPage} />
            <Stack.Screen name="Register" component={RegisterPage} />
          </>
        ) : (
          <>
            <Stack.Screen name="Landing" component={Landing} />
            <Stack.Screen name="Library" component={Library} />
            <Stack.Screen name="GenerateMonster" component={GenerateMonster} />
            <Stack.Screen name="MonsterView" component={MonsterView} />
            {user.admin && (
              <>
                <Stack.Screen name="AdminUsers" component={AdminUsers} />
                <Stack.Screen name="AdminUserMonsters" component={AdminUserMonsters} />
              </>
            )}
            <Stack.Screen name="About" component={AboutPage} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
