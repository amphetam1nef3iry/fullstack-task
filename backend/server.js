const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Константы
const PORT = 5000;
const ITEMS_COUNT = 1000000;
const PAGE_SIZE = 20;

// Оптимизированное хранилище
const initialItems = Array.from({ length: ITEMS_COUNT }, (_, i) => i + 1);
let state = {
  items: initialItems,  // Исходные данные (не изменяются)
  selected: new Set(),  // Используем Set для быстрого поиска
  lastSorted: []        // Отсортированный/измененный порядок
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

// Сохранение состояния
app.post('/api/save-state', (req, res) => {
  try {
    const { selectedItems = [], sortedItems = [] } = req.body;
    
    state.selected = new Set(selectedItems);
    state.lastSorted = sortedItems;
    
    res.json({ 
      success: true,
      message: 'State saved successfully',
      savedItems: sortedItems.length
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
      : state.items.slice(0, PAGE_SIZE)
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