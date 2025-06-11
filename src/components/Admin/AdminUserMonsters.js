import { StyleSheet } from 'react-native';

const AdminUserMonstersStyles = StyleSheet.create({
  monstersContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  tableWrapper: {
    width: '100%',
    maxWidth: 800,
  },
  table: {
    width: '100%',
    borderRadius: 8,
    marginTop: 20,
  },
  heading: {
    marginTop: 100,
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'aliceblue',
  },
  tableRow: {
    marginBottom: 20,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#1e1e2f',
  },
  cell: {
    color: 'aliceblue',
    marginBottom: 4,
  },
  buttonWrapper: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
});

export default AdminUserMonstersStyles;
