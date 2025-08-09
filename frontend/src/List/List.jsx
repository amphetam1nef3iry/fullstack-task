import React, { useState, useEffect, useCallback } from 'react';
import { FixedSizeList } from 'react-window';
import { 
  TextField, 
  Checkbox, 
  IconButton, 
  Paper, 
  Button, 
  Snackbar, 
  Alert 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import ListService from './ListService';
import './List.css';
import { useTranslation } from 'react-i18next';

const PAGE_SIZE = 20;
const ITEM_HEIGHT = 50;
const LIST_HEIGHT = ITEM_HEIGHT * 20;

const List = ({ apiUrl }) => {
  const [items, setItems] = useState([]);
  const [allItemsIds, setAllItemsIds] = useState([]);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const { t } = useTranslation();

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [selectedItemsData, allItemsIdsData, itemsData] = await Promise.all([
          ListService.getSelectedItems(apiUrl),
          ListService.getAllItemsIds(apiUrl),
          ListService.getItems(apiUrl, 1)
        ]);

        setSelectedItems(new Set(selectedItemsData));
        setAllItemsIds(allItemsIdsData);
        setItems(itemsData);
      } catch (error) {
        showNotification('Ошибка загрузки начального состояния', 'error');
        console.error('Initial load error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [apiUrl]);

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const fetchItems = useCallback(async (page, search = '', reset = false) => {
    setLoading(true);
    try {
      const itemsData = await ListService.getItems(apiUrl, page, search);
      
      setItems(prev => reset 
        ? itemsData 
        : [...prev, ...itemsData]);
      setPage(page);
    } catch (error) {
      showNotification('Ошибка загрузки данных', 'error');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  const saveState = async () => {
    try {
      await ListService.saveState(apiUrl, selectedItems, items);
      showNotification('Состояние успешно сохранено');
    } catch (error) {
      showNotification('Ошибка сохранения состояния', 'error');
      console.error('Save error:', error);
    }
  };

  const resetState = async () => {
    try {
      await ListService.resetState(apiUrl);
      setSelectedItems(new Set());
      await fetchItems(1, searchTerm, true);
      showNotification('Состояние сброшено');
    } catch (error) {
      showNotification('Ошибка сброса состояния', 'error');
      console.error('Reset error:', error);
    }
  };

  const handleSearch = () => {
    fetchItems(1, searchTerm, true);
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const loadMoreItems = () => {
    if (!loading && items.length < allItemsIds.length) {
      fetchItems(page + 1, searchTerm);
    }
  };

  const Row = ({ index, style }) => {
    const item = items[index];
    const isSelected = selectedItems.has(item);
    
    return (
      <div style={style}>
        <div className={`list-item-container ${isSelected ? 'selected' : ''}`}>
          <Checkbox
            checked={isSelected}
            onChange={() => handleSelectItem(item)}
          />
          <span>{item}</span>
        </div>
      </div>
    );
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const newItems = [...items];
    const [removed] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, removed);
    
    setItems(newItems);
  };

  return (
    <Paper className="list-container">
      <div className="list-search-container">
        <TextField
          label={t('search')}
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <IconButton onClick={handleSearch} color="primary">
          <SearchIcon />
        </IconButton>
      </div>

      <div className="list-content-container">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable
            droppableId="droppable"
            mode="virtual"
            renderClone={(provided, snapshot, rubric) => (
              <div
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                ref={provided.innerRef}
                className={`list-item-container ${snapshot.isDragging ? 'dragging' : ''}`}
              >
                <Checkbox
                  checked={selectedItems.has(items[rubric.source.index])}
                  onChange={() => handleSelectItem(items[rubric.source.index])}
                />
                <span>{items[rubric.source.index]}</span>
              </div>
            )}
          >
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="list-droppable-container"
              >
                <FixedSizeList
                  height={LIST_HEIGHT}
                  itemCount={items.length}
                  itemSize={ITEM_HEIGHT}
                  width="100%"
                  onItemsRendered={({ visibleStopIndex }) => {
                    if (visibleStopIndex === items.length - 1) {
                      loadMoreItems();
                    }
                  }}
                >
                  {Row}
                </FixedSizeList>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <div className="list-buttons-container">
        <Button
          variant="contained"
          color="primary"
          onClick={saveState}
          disabled={loading}
        >
          {t('saveState')}
        </Button>
        
        <Button
          variant="contained"
          color="secondary"
          onClick={resetState}
          disabled={loading}
          className="list-reset-button"
        >
          {t('revState')}
        </Button>
      </div>

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default List;