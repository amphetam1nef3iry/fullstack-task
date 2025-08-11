const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Константы
const PORT = process.env.PORT || 5000;
const ITEMS_COUNT = 1000000;
const PAGE_SIZE = 20;

// Оптимизированное хранилище
const initialItems = Array.from({ length: ITEMS_COUNT }, (_, i) => i + 1);
let state = {
  items: initialItems,  // Исходные данные (не изменяются)
  selected: new Set(),  // Используем Set для быстрого поиска
  lastSorted: [],       // Отсортированный/измененный порядок
  lastSearch: ''        // Последний поисковый запрос
};

// Мидлвара для логирования
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Получение данных с пагинацией
app.get('/api/items', (req, res) => {
  try {
    const { page = 1, search = '' } = req.query;
    
    // Используем кешированный или исходный порядок
    const itemsSource = state.lastSorted.length > 0 
      ? state.lastSorted 
      : state.items;

    // Фильтрация
    const filteredItems = search
      ? itemsSource.filter(item => item.toString().includes(search))
      : itemsSource;

    // Пагинация
    const startIdx = (page - 1) * PAGE_SIZE;
    const paginatedItems = filteredItems.slice(startIdx, startIdx + PAGE_SIZE);

    res.json({
      success: true,
      items: paginatedItems,
      total: filteredItems.length,
      page: parseInt(page),
      pageSize: PAGE_SIZE
    });
  } catch (error) {
    console.error('Error in /api/items:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Обновление порядка элементов
app.post('/api/update-order', (req, res) => {
  try {
    const { movedItemId, targetItemId } = req.body;
    
    // Если есть измененный порядок - работаем с ним, иначе с исходным
    const currentItems = state.lastSorted.length > 0 
      ? [...state.lastSorted] 
      : [...state.items];
    
    const fromIndex = currentItems.indexOf(movedItemId);
    const toIndex = currentItems.indexOf(targetItemId);
    
    if (fromIndex === -1 || toIndex === -1) {
      return res.status(400).json({ success: false, error: 'Invalid item IDs' });
    }
    
    // Меняем элементы местами
    [currentItems[fromIndex], currentItems[toIndex]] = 
      [currentItems[toIndex], currentItems[fromIndex]];
    
    state.lastSorted = currentItems;
    
    res.json({ 
      success: true,
      message: 'Order updated successfully'
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ success: false, error: 'Failed to update order' });
  }
});

// Сохранение состояния
app.post('/api/save-state', (req, res) => {
  try {
    const { selectedItems = [], sortedItems = [], searchTerm = '' } = req.body;
    
    state.selected = new Set(selectedItems);
    state.lastSearch = searchTerm;
    
    // Сохраняем изменения порядка только если переданы sortedItems
    if (sortedItems && sortedItems.length > 0) {
      // Проверяем, что все элементы существуют в исходных данных
      const isValid = sortedItems.every(item => state.items.includes(item));
      if (isValid) {
        state.lastSorted = sortedItems;
      } else {
        return res.status(400).json({ success: false, error: 'Invalid items in sorted array' });
      }
    }
    
    res.json({ 
      success: true,
      message: 'State saved successfully',
      selectedCount: state.selected.size,
      sortedCount: state.lastSorted.length
    });
  } catch (error) {
    console.error('Error saving state:', error);
    res.status(500).json({ success: false, error: 'Failed to save state' });
  }
});

// Сброс состояния
app.post('/api/reset-state', (req, res) => {
  try {
    state.selected = new Set();
    state.lastSorted = [];
    state.lastSearch = '';
    
    res.json({ 
      success: true,
      message: 'State reset to initial',
      initialItemsCount: initialItems.length
    });
  } catch (error) {
    console.error('Error resetting state:', error);
    res.status(500).json({ success: false, error: 'Failed to reset state' });
  }
});

// Загрузка начального состояния
app.get('/api/initial-state', (req, res) => {
  res.json({
    success: true,
    selected: Array.from(state.selected),
    lastSorted: state.lastSorted.length > 0 
      ? state.lastSorted.slice(0, PAGE_SIZE) 
      : state.items.slice(0, PAGE_SIZE),
    lastSearch: state.lastSearch
  });
});

app.get('/api/all-items-ids', (req, res) => {
  try {
    const ids = state.lastSorted.length > 0 ? state.lastSorted : state.items;
    res.json({
      success: true,
      ids: ids
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// endpoint для загрузки выбранных элементов
app.get('/api/selected-items', (req, res) => {
  res.json({
    success: true,
    selectedItems: Array.from(state.selected)
  });
});

// Обработка 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Initial items count: ${initialItems.length}`);
});
