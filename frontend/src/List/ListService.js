import axios from 'axios';

const ListService = {
  getSelectedItems: async (apiUrl) => {
    try {
      const response = await axios.get(`${apiUrl}/selected-items`);
      return response.data.selectedItems;
    } catch (error) {
      console.error('Error fetching selected items:', error);
      throw error;
    }
  },

  getAllItemsIds: async (apiUrl) => {
    try {
      const response = await axios.get(`${apiUrl}/all-items-ids`);
      return response.data.ids;
    } catch (error) {
      console.error('Error fetching all items IDs:', error);
      throw error;
    }
  },

  getItems: async (apiUrl, page, search = '') => {
    try {
      const response = await axios.get(`${apiUrl}/items`, {
        params: { page, search }
      });
      return response.data.items;
    } catch (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
  },

  saveState: async (apiUrl, selectedItems, sortedItems) => {
    try {
      await axios.post(`${apiUrl}/save-state`, {
        selectedItems: Array.from(selectedItems),
        sortedItems
      });
    } catch (error) {
      console.error('Error saving state:', error);
      throw error;
    }
  },

  resetState: async (apiUrl) => {
    try {
      await axios.post(`${apiUrl}/reset-state`);
    } catch (error) {
      console.error('Error resetting state:', error);
      throw error;
    }
  }
};

export default ListService;