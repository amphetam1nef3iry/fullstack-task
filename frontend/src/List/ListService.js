import axios from 'axios';

const ListService = {
  // Получение выбранных элементов
  getSelectedItems: async (apiUrl) => {
    try {
      const { data } = await axios.get(`${apiUrl}/selected-items`);
      return data.selectedItems;
    } catch (error) {
      console.error('Error fetching selected items:', error);
      throw error;
    }
  },

  // Получение всех ID элементов
  getAllItemsIds: async (apiUrl) => {
    try {
      const { data } = await axios.get(`${apiUrl}/all-items-ids`);
      return data.ids;
    } catch (error) {
      console.error('Error fetching all items IDs:', error);
      throw error;
    }
  },

  // Получение элементов с пагинацией и поиском
  getItems: async (apiUrl, page, search = '') => {
    try {
      const { data } = await axios.get(`${apiUrl}/items`, {
        params: { 
          page, 
          search,
          _: Date.now() // Добавляем timestamp для избежания кеширования
        }
      });
      return data.items;
    } catch (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
  },

  // Обновление порядка элементов
  updateOrder: async (apiUrl, movedItemId, targetItemId) => {
    try {
      await axios.post(`${apiUrl}/update-order`, {
        movedItemId,
        targetItemId
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  },

  // Сохранение состояния
  saveState: async (apiUrl, selectedItems) => {
    try {
      await axios.post(`${apiUrl}/save-state`, {
        selectedItems: Array.from(selectedItems)
      }, {
        timeout: 10000 // 10 секунд таймаут
      });
    } catch (error) {
      console.error('Error saving state:', error);
      throw error;
    }
  },

  // Сброс состояния
  resetState: async (apiUrl) => {
    try {
      await axios.post(`${apiUrl}/reset-state`, {}, {
        timeout: 5000
      });
    } catch (error) {
      console.error('Error resetting state:', error);
      throw error;
    }
  },

  // Получение начального состояния
  getInitialState: async (apiUrl) => {
    try {
      const { data } = await axios.get(`${apiUrl}/initial-state`);
      return data;
    } catch (error) {
      console.error('Error getting initial state:', error);
      throw error;
    }
  }
};

export default ListService;
