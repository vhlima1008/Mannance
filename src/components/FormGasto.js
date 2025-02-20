import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FormGasto = () => {
  const [month, setMonth] = useState('Janeiro');
  const [rent, setRent] = useState('');
  const [food, setFood] = useState('');
  const [transport, setTransport] = useState('');
  const [health, setHealth] = useState('');
  const [education, setEducation] = useState('');
  const [leisure, setLeisure] = useState('');
  const [others, setOthers] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => {
    // Carrega os dados salvos ao iniciar o componente
    loadExpenses();
  }, []);

  useEffect(() => {
    // Salva os dados sempre que 'expenses' mudar
    saveExpenses();
  }, [expenses]);

  const loadExpenses = async () => {
    try {
      const storedExpenses = await AsyncStorage.getItem('@expenses');
      if (storedExpenses) {
        setExpenses(JSON.parse(storedExpenses));
      }
    } catch (error) {
      console.log('Erro ao carregar os dados:', error);
    }
  };

  const saveExpenses = async () => {
    try {
      await AsyncStorage.setItem('@expenses', JSON.stringify(expenses));
    } catch (error) {
      console.log('Erro ao salvar os dados:', error);
    }
  };

  const handleSubmit = () => {
    if (!rent || !food || !transport || !health || !education || !leisure || !others) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    const newExpense = {
      month,
      rent: parseFloat(rent),
      food: parseFloat(food),
      transport: parseFloat(transport),
      health: parseFloat(health),
      education: parseFloat(education),
      leisure: parseFloat(leisure),
      others: parseFloat(others),
    };

    if (editingExpense) {
      // Atualiza o registro que está sendo editado
      setExpenses(prevExpenses =>
        prevExpenses.map(exp =>
          exp.month === editingExpense.month ? newExpense : exp
        )
      );
    } else {
      // Adiciona novo registro ou atualiza se já existir
      setExpenses(prevExpenses => {
        const existingIndex = prevExpenses.findIndex(expense => expense.month === month);
        if (existingIndex >= 0) {
          const updatedExpenses = [...prevExpenses];
          updatedExpenses[existingIndex] = newExpense;
          return updatedExpenses;
        }
        return [...prevExpenses, newExpense];
      });
    }

    // Reset dos campos e encerra o modo de edição
    setRent('');
    setFood('');
    setTransport('');
    setHealth('');
    setEducation('');
    setLeisure('');
    setOthers('');
    setIsFormVisible(false);
    setEditingExpense(null);
  };

  const handleDelete = (monthToDelete) => {
    setExpenses(prevExpenses => prevExpenses.filter(expense => expense.month !== monthToDelete));
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setMonth(expense.month);
    setRent(expense.rent.toString());
    setFood(expense.food.toString());
    setTransport(expense.transport.toString());
    setHealth(expense.health.toString());
    setEducation(expense.education.toString());
    setLeisure(expense.leisure.toString());
    setOthers(expense.others.toString());
    setIsFormVisible(true);
  };

  const calculateTotalExpense = (expense) => {
    return expense.rent + expense.food + expense.transport + expense.health + expense.education + expense.leisure + expense.others;
  };

  // 'acc' => acumulador que soma o total de cada despesa
  const totalExpenses = expenses.reduce((acc, expense) => acc + calculateTotalExpense(expense), 0);

  const renderExpenseItem = ({ item }) => (
    <View style={styles.expenseItem}>
      <Text>Mês: {item.month}</Text>
      <Text>Aluguéis: R${item.rent.toFixed(2)}</Text>
      <Text>Alimentação: R${item.food.toFixed(2)}</Text>
      <Text>Transporte: R${item.transport.toFixed(2)}</Text>
      <Text>Saúde: R${item.health.toFixed(2)}</Text>
      <Text>Educação: R${item.education.toFixed(2)}</Text>
      <Text>Lazer: R${item.leisure.toFixed(2)}</Text>
      <Text>Outros: R${item.others.toFixed(2)}</Text>
      <Text>Total: R${calculateTotalExpense(item).toFixed(2)}</Text>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.month)}>
          <Text style={styles.deleteButtonText}>Excluir</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
          <Text style={styles.editButtonText}>Editar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.totalExpensesText}>Despesas: R${totalExpenses.toFixed(2)}</Text>
      <FlatList
        data={expenses}
        renderItem={renderExpenseItem}
        keyExtractor={(item, index) => index.toString()}
        style={styles.list}
      />

      {isFormVisible && (
        <View style={styles.formContainer}>
          <Text style={styles.title}>Registrar Gastos Mensais</Text>
          <Picker
            selectedValue={month}
            style={styles.picker}
            onValueChange={(itemValue) => setMonth(itemValue)}
          >
            {[
              'Janeiro', 'Fevereiro', 'Março', 'Abril',
              'Maio', 'Junho', 'Julho', 'Agosto',
              'Setembro', 'Outubro', 'Novembro', 'Dezembro'
            ].map((monthName) => (
              <Picker.Item key={monthName} label={monthName} value={monthName} />
            ))}
          </Picker>
          <TextInput
            style={styles.input}
            placeholder="Aluguéis"
            keyboardType="numeric"
            value={rent}
            onChangeText={setRent}
          />
          <TextInput
            style={styles.input}
            placeholder="Alimentação"
            keyboardType="numeric"
            value={food}
            onChangeText={setFood}
          />
          <TextInput
            style={styles.input}
            placeholder="Transporte"
            keyboardType="numeric"
            value={transport}
            onChangeText={setTransport}
          />
          <TextInput
            style={styles.input}
            placeholder="Saúde"
            keyboardType="numeric"
            value={health}
            onChangeText={setHealth}
          />
          <TextInput
            style={styles.input}
            placeholder="Educação"
            keyboardType="numeric"
            value={education}
            onChangeText={setEducation}
          />
          <TextInput
            style={styles.input}
            placeholder="Lazer"
            keyboardType="numeric"
            value={leisure}
            onChangeText={setLeisure}
          />
          <TextInput
            style={styles.input}
            placeholder="Outros"
            keyboardType="numeric"
            value={others}
            onChangeText={setOthers}
          />
          <Button title="Salvar" onPress={handleSubmit} />
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setIsFormVisible(prev => !prev);
          setEditingExpense(null); // Limpa o modo de edição se estiver cancelando o formulário
        }}
      >
        <Text style={styles.buttonText}>{isFormVisible ? "Cancelar" : "Cadastrar Gastos"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  totalExpensesText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 15,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
  },
  expenseItem: {
    padding: 10,
    borderBottomColor: 'lightgray',
    borderBottomWidth: 1,
  },
  list: {
    marginTop: 20,
  },
  formContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 3,
    marginTop: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  editButton: {
    backgroundColor: 'orange',
    padding: 5,
    borderRadius: 3,
    marginTop: 10,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});

export default FormGasto;
