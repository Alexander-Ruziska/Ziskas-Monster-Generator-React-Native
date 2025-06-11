import { StyleSheet } from 'react-native';

const AdminUsersStyles = StyleSheet.create({
  table: {
    width: '100%',
    borderRadius: 8,
    marginTop: 20,
    maxWidth: 800,
    position: 'relative',
  },
  tableRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
    borderStyle: 'solid',
  },
  button: {
    marginBottom: 10,
  },
  heading2: {
    color: 'aliceblue',
    fontSize: 24,
    fontWeight: 'bold',
  },
  adminUsers: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});

export default AdminUsersStyles;
