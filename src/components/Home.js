// BoasVindas.js
import React, {useState, useCallback} from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Graphics from './Graphics';
import FormGasto from './FormGasto';
import FormRenda from './FormRenda';

export default function Home() {
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [totalIncomes, setTotalIncomes] = useState(0);
  
    // Função para calcular o total de uma despesa
    const calculateTotalExpense = (expense) => {
      return expense.rent + expense.food + expense.transport + expense.health +
             expense.education + expense.leisure + expense.others;
    };
  
    // Função para calcular o total de uma renda
    const calculateTotalIncome = (income) => {
      return income.salary + income.dividends + income.investments + income.extraIncome;
    };
  
    // Carrega as despesas salvas e calcula o total
    const loadExpenses = async () => {
      try {
        const storedExpenses = await AsyncStorage.getItem('@expenses');
        if (storedExpenses) {
          const expenses = JSON.parse(storedExpenses);
          const total = expenses.reduce((acc, expense) => acc + calculateTotalExpense(expense), 0);
          setTotalExpenses(total);
        } else {
          setTotalExpenses(0);
        }
      } catch (error) {
        console.log('Erro ao carregar despesas:', error);
      }
    };
  
    // Carrega as rendas salvas e calcula o total
    const loadIncomes = async () => {
      try {
        const storedIncomes = await AsyncStorage.getItem('@incomes');
        if (storedIncomes) {
          const incomes = JSON.parse(storedIncomes);
          const total = incomes.reduce((acc, income) => acc + calculateTotalIncome(income), 0);
          setTotalIncomes(total);
        } else {
          setTotalIncomes(0);
        }
      } catch (error) {
        console.log('Erro ao carregar rendas:', error);
      }
    };
  
    useFocusEffect(
        useCallback(() => {
          loadExpenses();
          loadIncomes();
        }, [])
      );
  
    const balance = totalIncomes - totalExpenses;
  
    return (
      <View style={styles.container}>
        <Text style={styles.balanceText}>Saldo: R${balance.toFixed(2)}</Text>
        <Graphics/>
      </View>
    );
  }


const styles = StyleSheet.create({
    container: {
        flex:1,
        marginHorizontal:10,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    balanceText: {
        borderRadius: "30px",
        background: "#e0e0e0",
        boxShadow: "inset 5px 5px 10px #bebebe, inset -5px -5px 10px #ffffff",
        paddingHorizontal: 20,
        paddingVertical: 10,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    text: {
        fontSize: 24,
        marginBottom: 4,
    },
    text2:{
        fontSize: 16,
        marginBottom: 4,
    },
});
