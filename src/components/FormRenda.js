import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IncomeForm = () => {
  const [month, setMonth] = useState('Janeiro');
  const [salary, setSalary] = useState('');
  const [dividends, setDividends] = useState('');
  const [investments, setInvestments] = useState('');
  const [extraIncome, setExtraIncome] = useState('');
  const [incomes, setIncomes] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);

  useEffect(() => {
    // Carrega os dados salvos ao iniciar o componente
    loadIncomes();
  }, []);

  useEffect(() => {
    // Salva os dados sempre que 'incomes' mudar
    saveIncomes();
  }, [incomes]);

  const loadIncomes = async () => {
    try {
      const storedIncomes = await AsyncStorage.getItem('@incomes');
      if (storedIncomes) {
        setIncomes(JSON.parse(storedIncomes));
      }
    } catch (error) {
      console.log('Erro ao carregar os dados:', error);
    }
  };

  const saveIncomes = async () => {
    try {
      await AsyncStorage.setItem('@incomes', JSON.stringify(incomes));
    } catch (error) {
      console.log('Erro ao salvar os dados:', error);
    }
  };

  const handleSubmit = () => {
    if (!salary || !dividends || !investments || !extraIncome) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    const newIncome = {
      month,
      salary: parseFloat(salary),
      dividends: parseFloat(dividends),
      investments: parseFloat(investments),
      extraIncome: parseFloat(extraIncome),
    };

    if (editingIncome) {
      // Atualiza o registro que está sendo editado (usando o mês antigo como referência)
      setIncomes(prevIncomes => prevIncomes.map(inc => 
        inc.month === editingIncome.month ? newIncome : inc
      ));
    } else {
      // Adiciona novo registro ou atualiza se já existir
      setIncomes(prevIncomes => {
        const existingIndex = prevIncomes.findIndex(inc => inc.month === month);
        if (existingIndex >= 0) {
          const updatedIncomes = [...prevIncomes];
          updatedIncomes[existingIndex] = newIncome;
          return updatedIncomes;
        }
        return [...prevIncomes, newIncome];
      });
    }

    // Reset dos campos e encerra o modo de edição
    setSalary('');
    setDividends('');
    setInvestments('');
    setExtraIncome('');
    setIsFormVisible(false);
    setEditingIncome(null);
  };

  const handleDelete = (monthToDelete) => {
    setIncomes(prevIncomes => prevIncomes.filter(income => income.month !== monthToDelete));
  };

  const handleEdit = (income) => {
    setEditingIncome(income);
    setMonth(income.month);
    setSalary(income.salary.toString());
    setDividends(income.dividends.toString());
    setInvestments(income.investments.toString());
    setExtraIncome(income.extraIncome.toString());
    setIsFormVisible(true);
  };

  const calculateTotalIncome = (income) => {
    return income.salary + income.dividends + income.investments + income.extraIncome;
  };

  const totalIncomes = incomes.reduce((acc, income) => acc + calculateTotalIncome(income), 0);

  const renderIncomeItem = ({ item }) => (
    <View style={styles.incomeItem}>
      <Text style={styles.incomeText}>Mês: {item.month}</Text>
      <Text style={styles.incomeText}>Salário: R${item.salary.toFixed(2)}</Text>
      <Text style={styles.incomeText}>Dividendos: R${item.dividends.toFixed(2)}</Text>
      <Text style={styles.incomeText}>Investimentos: R${item.investments.toFixed(2)}</Text>
      <Text style={styles.incomeText}>Renda Extra: R${item.extraIncome.toFixed(2)}</Text>
      <Text style={styles.incomeText}> Total: R${calculateTotalIncome(item).toFixed(2)}</Text>
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
      <Text style={styles.totalIncomesText}>Renda: R${totalIncomes.toFixed(2)}</Text>
      <FlatList
        data={incomes.sort((a, b) => {
          const monthsOrder = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril',
            'Maio', 'Junho', 'Julho', 'Agosto',
            'Setembro', 'Outubro', 'Novembro', 'Dezembro'
          ];
          return monthsOrder.indexOf(b.month) - monthsOrder.indexOf(a.month);
        })}
        renderItem={renderIncomeItem}
        keyExtractor={(item, index) => index.toString()}
        style={styles.list}
      />
      
      {isFormVisible && (
        <View style={styles.formContainer}>
          <Text style={styles.title}>Registrar Renda Mensal</Text>
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
            placeholder="Salário"
            keyboardType="numeric"
            value={salary}
            onChangeText={setSalary}
          />
          <TextInput
            style={styles.input}
            placeholder="Dividendos"
            keyboardType="numeric"
            value={dividends}
            onChangeText={setDividends}
          />
          <TextInput
            style={styles.input}
            placeholder="Investimentos"
            keyboardType="numeric"
            value={investments}
            onChangeText={setInvestments}
          />
          <TextInput
            style={styles.input}
            placeholder="Renda Extra"
            keyboardType="numeric"
            value={extraIncome}
            onChangeText={setExtraIncome}
          />
          <Button title="Salvar" onPress={handleSubmit} />
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={() => {
        setIsFormVisible(prev => !prev);
        setEditingIncome(null); // Caso o formulário seja para cadastro, limpa o modo de edição
      }}>
        <Text style={styles.buttonText}>{isFormVisible ? "Cancelar" : "Cadastrar Renda"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex:1,
    marginHorizontal:10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  totalIncomesText: {
    borderRadius: "30px",
    background: "#e0e0e0",
    boxShadow: "inset 5px 5px 10px #bebebe, inset -5px -5px 10px #ffffff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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
  incomeItem: {
    borderRadius: "30px",
    background: "#e0e0e0",
    boxShadow: "inset 5px 5px 10px #bebebe, inset -5px -5px 10px #ffffff",
    padding: 40,
    marginBottom: 10,
  },
  incomeText: {
    fontSize: 20,
    marginVertical: 2.5,
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
    borderRadius: "5px",
    backgroundColor: "#ffb3b3",
    boxShadow: "5px 5px 10px #b1b1b1, -5px -5px 10px #ffffff",
    padding: 5,
    alignItems: "center",
    marginRight: 10,
  },
  deleteButtonText: {
    color: "black",
    fontSize: 14,
  },
  editButton: {
    borderRadius: "5px",
    backgroundColor: "#b3c9ff",
    boxShadow: "5px 5px 10px #b1b1b1, -5px -5px 10px #ffffff",
    padding: 5,
    alignItems: "center",
    marginRight: 10,
  },
  editButtonText: {
    color: "black",
    fontSize: 14,
  },
});

export default IncomeForm;
